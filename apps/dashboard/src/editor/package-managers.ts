import { getProp, type JsxProp, type JsxPropValue } from "./nodes/props";

/** Nimbus's `getTabs` from `@cloudflare/nimbus-docs/lib/pkgm`: each manager's commands, in its order. */
const MANAGERS = {
  npm: {
    add: "npm i",
    create: "npm create",
    dlx: "npx",
    exec: "npx",
    install: "npm install",
    run: "npm run",
    remove: "npm uninstall",
    dev: "-D",
  },
  yarn: {
    add: "yarn add",
    create: "yarn create",
    dlx: "yarn dlx",
    exec: "yarn",
    install: "yarn install",
    run: "yarn run",
    remove: "yarn remove",
    dev: "-D",
  },
  pnpm: {
    add: "pnpm add",
    create: "pnpm create",
    dlx: "pnpm dlx",
    exec: "pnpm",
    install: "pnpm install",
    run: "pnpm run",
    remove: "pnpm remove",
    dev: "-D",
  },
  bun: {
    add: "bun add",
    create: "bun create",
    dlx: "bunx",
    exec: "bunx",
    install: "bun install",
    run: "bun run",
    remove: "bun remove",
    dev: "-d",
  },
} as const;

type Manager = keyof typeof MANAGERS;
export const COMMAND_TYPES = ["add", "create", "dlx", "exec", "install", "remove", "run"] as const;
type CommandType = (typeof COMMAND_TYPES)[number];

function shown(value: JsxPropValue | undefined): string {
  if (!value || value.kind === "flag") return "";
  return value.kind === "string" ? value.value : `{${value.source}}`;
}

/** The bin a scoped package installs by default, which `pnpm` and `yarn` run: `@a/b@1` is `b`. */
function binName(pkg: string): string {
  const name = pkg.startsWith("@") ? pkg.slice(pkg.indexOf("/") + 1) : pkg;
  const version = name.indexOf("@");
  return version > 0 ? name.slice(0, version) : name;
}

/** One tab per package manager, with the command the published component shows in it. */
export function packageManagerTabs(props: JsxProp[]): { manager: Manager; command: string }[] {
  const type = (shown(getProp(props, "type")) || "add") as CommandType;
  if (!COMMAND_TYPES.includes(type)) return [];
  const pkg = shown(getProp(props, "pkg"));
  const args = shown(getProp(props, "args"));
  const comment = shown(getProp(props, "comment"));
  const devProp = getProp(props, "dev");
  const dev =
    devProp?.kind === "flag" ||
    (devProp?.kind === "expression" && devProp.source.trim() === "true");
  return (Object.keys(MANAGERS) as Manager[]).map((manager) => {
    const commands = MANAGERS[manager];
    let command: string = commands[type];
    if (comment) command = `# ${comment}\n${command}`;
    if (dev && type === "add") command += ` ${commands.dev}`;
    if (pkg) {
      const name =
        type === "create" && manager === "yarn"
          ? pkg.replace(/@(?![^@]*\/)[^\s]*$/, "")
          : type === "exec" && (manager === "pnpm" || manager === "yarn")
            ? binName(pkg)
            : pkg;
      command += ` ${name}`;
    }
    if (args) {
      command += `${manager === "npm" && !["dlx", "exec", "run"].includes(type) ? " --" : ""} ${args}`;
    }
    return { manager, command };
  });
}
