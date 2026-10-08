const email = process.env.VERIFY_EMAIL;
const password = process.env.VERIFY_PASSWORD;
if (!email || !password) throw new Error("set VERIFY_EMAIL and VERIFY_PASSWORD to a verified user");

export default async (page) => {
  await page.goto("http://localhost:3001/login");
  await page.clickButton("Already have an account? Sign In");
  await page.waitForText("Welcome Back");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.screenshot("sign-in-form.png");
  await page.click("form button[type=submit]");
  await page.waitForUrl("/dashboard");
  await page.waitForText("API: This is private");
  page.log(`signed in as ${email}; dashboard shows the private API message`);
  await page.screenshot("dashboard-signed-in.png");

  const session = await page.evaluate(
    `fetch("http://localhost:3000/auth/get-session", { credentials: "include" }).then((r) => r.json())`,
  );
  if (session?.user?.email !== email) throw new Error(`session is for ${session?.user?.email}`);
  page.log("API session matches the signed-in user");

  const name = session.user.name;
  await page.clickButton(name);
  await page.clickButton("Sign Out");
  await page.waitForText("Sign In");
  page.log("signed out from the header menu");

  await page.goto("http://localhost:3001/dashboard");
  await page.waitForUrl("/login");
  page.log("signed-out visit to /dashboard redirects to /login");
  await page.screenshot("redirected-to-login.png");
};
