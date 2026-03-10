import { test } from "@playwright/test";

test("take screenshots", async ({ page }) => {
  await page.goto("/contact-us");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "public/screenshot.png" });
});
