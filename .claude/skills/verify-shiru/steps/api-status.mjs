export default async (page) => {
  await page.goto("http://localhost:3001/");
  await page.waitForText("API Status");
  await page.screenshot("home-loading.png");
  await page.waitForText("Connected");
  const text = await page.text();
  if (text.includes("Disconnected")) throw new Error("home shows Disconnected");
  page.log("home page shows API Status: Connected");
  await page.screenshot("home-connected.png");
};
