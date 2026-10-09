#!/usr/bin/env node
// Drives headless Chromium over the DevTools Protocol. No dependencies (Node 22+).
// Usage: node browser.mjs <steps.mjs> <evidence-dir>
// <steps.mjs> default-exports `async (page) => { ... }`. See SKILL.md for the page API.
import { spawn } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [stepsPath, outDir] = process.argv.slice(2);
if (!stepsPath || !outDir) {
  console.error("usage: node browser.mjs <steps.mjs> <evidence-dir>");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const consoleLog = join(outDir, "browser-console.log");
writeFileSync(consoleLog, "");

const profile = mkdtempSync(join(tmpdir(), "verify-shiru-chrome-"));
const chrome = spawn(
  "chromium",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--window-size=1280,900",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

const wsUrl = await new Promise((resolveUrl, reject) => {
  let buffer = "";
  chrome.stderr.on("data", (chunk) => {
    buffer += chunk;
    const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
    if (match) resolveUrl(match[1]);
  });
  chrome.on("exit", () =>
    reject(new Error(`chromium exited before DevTools was ready:\n${buffer}`)),
  );
  setTimeout(() => reject(new Error("chromium did not start within 15s")), 15_000);
});

const socket = new WebSocket(wsUrl);
await new Promise((ok) => socket.addEventListener("open", ok, { once: true }));
let nextId = 0;
const pending = new Map();
const listeners = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { ok, fail } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) fail(new Error(message.error.message));
    else ok(message.result);
  } else if (message.method) {
    for (const listener of listeners) listener(message);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((ok, fail) => {
    const id = ++nextId;
    pending.set(id, { ok, fail });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const cmd = (method, params) => send(method, params, sessionId);
await Promise.all([
  cmd("Page.enable"),
  cmd("Runtime.enable"),
  cmd("Log.enable"),
  cmd("Network.enable"),
]);

listeners.push(({ method, params }) => {
  if (method === "Runtime.consoleAPICalled") {
    appendFileSync(
      consoleLog,
      `[console.${params.type}] ${params.args.map((a) => a.value ?? a.description ?? "").join(" ")}\n`,
    );
  } else if (method === "Runtime.exceptionThrown") {
    appendFileSync(
      consoleLog,
      `[exception] ${params.exceptionDetails.exception?.description ?? params.exceptionDetails.text}\n`,
    );
  } else if (method === "Log.entryAdded" && params.entry.level === "error") {
    appendFileSync(consoleLog, `[log.error] ${params.entry.text} ${params.entry.url ?? ""}\n`);
  } else if (method === "Network.loadingFailed") {
    appendFileSync(
      consoleLog,
      `[network.failed] ${params.errorText} ${params.blockedReason ?? ""} ${params.corsErrorStatus?.corsError ?? ""}\n`,
    );
  }
});

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await cmd("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails)
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
};
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const waitUntil = async (expression, description, timeout = 15_000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression).catch(() => false)) return;
    await sleep(200);
  }
  throw new Error(`timed out after ${timeout}ms waiting for ${description}`);
};

const page = {
  async goto(url) {
    const loaded = new Promise((ok) =>
      listeners.push(({ method }) => method === "Page.loadEventFired" && ok()),
    );
    await cmd("Page.navigate", { url });
    await loaded;
  },
  url: () => evaluate("location.href"),
  text: () => evaluate("document.body.innerText"),
  evaluate,
  waitForText: (text, timeout) =>
    waitUntil(
      `document.body.innerText.includes(${JSON.stringify(text)})`,
      `text "${text}"`,
      timeout,
    ),
  waitForUrl: (fragment, timeout) =>
    waitUntil(
      `location.href.includes(${JSON.stringify(fragment)})`,
      `url containing "${fragment}"`,
      timeout,
    ),
  async fill(selector, value) {
    await waitUntil(`!!document.querySelector(${JSON.stringify(selector)})`, `element ${selector}`);
    await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set;
      el.focus(); setter.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
  },
  async clickButton(label) {
    const finder = `[...document.querySelectorAll("button, a, [role=menuitem], [role=option]")].find((el) => el.innerText.trim() === ${JSON.stringify(label)})`;
    await waitUntil(`!!${finder}`, `button "${label}"`);
    await evaluate(`${finder}.click()`);
  },
  async click(selector) {
    await waitUntil(`!!document.querySelector(${JSON.stringify(selector)})`, `element ${selector}`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  },
  // Base UI menus and selects open on pointerdown, which element.click() never fires.
  async press(selector) {
    await waitUntil(`!!document.querySelector(${JSON.stringify(selector)})`, `element ${selector}`);
    const { x, y } = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await cmd("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    }
  },
  async screenshot(name) {
    const { data } = await cmd("Page.captureScreenshot", { format: "png" });
    const path = join(outDir, name);
    writeFileSync(path, Buffer.from(data, "base64"));
    return path;
  },
  log: (line) => appendFileSync(join(outDir, "steps.log"), `${line}\n`),
};

let exitCode = 0;
try {
  const { default: steps } = await import(pathToFileURL(resolve(stepsPath)).href);
  await steps(page);
  page.log("PASS");
} catch (error) {
  exitCode = 1;
  page.log(`FAIL ${error.message}`);
  await page.screenshot("failure.png").catch(() => {});
  console.error(error.message);
} finally {
  socket.close();
  const exited = new Promise((ok) => chrome.once("exit", ok));
  chrome.kill();
  await exited;
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
console.log(`${exitCode ? "FAIL" : "PASS"} evidence in ${outDir}`);
console.log(readFileSync(join(outDir, "steps.log"), "utf8").trim());
process.exit(exitCode);
