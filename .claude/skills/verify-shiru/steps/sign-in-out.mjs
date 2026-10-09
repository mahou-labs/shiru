const email = process.env.VERIFY_EMAIL;
const password = process.env.VERIFY_PASSWORD;
if (!email || !password) throw new Error("set VERIFY_EMAIL and VERIFY_PASSWORD to a verified user");

const session = (page) =>
  page.evaluate(
    `fetch("http://localhost:3000/auth/get-session", { credentials: "include" }).then((r) => r.json())`,
  );

export default async (page) => {
  await page.goto("http://localhost:3001/settings/account");
  await page.waitForUrl("/auth/sign-in?redirect=");
  page.log("signed-out visit to /settings/account redirects to sign-in");
  await page.screenshot("sign-in-form.png");

  await page.fill("[name=email]", email);
  await page.fill("[name=password]", password);
  await page.click("form button[type=submit]");
  await page.waitForUrl("/settings/account");
  await page.waitForText("Change password");
  page.log("signing in returns to the requested page");
  await page.screenshot("signed-in.png");

  const signedIn = await session(page);
  if (signedIn?.user?.email !== email) throw new Error(`session is for ${signedIn?.user?.email}`);
  page.log("API session matches the signed-in user");

  await page.press("[data-sidebar=footer] button");
  await page.clickButton("Sign out");
  await page.waitForUrl("/auth/sign-in");
  if (await session(page)) throw new Error("session survived sign out");
  page.log("signed out from the sidebar user menu; API session is gone");
  await page.screenshot("signed-out.png");
};
