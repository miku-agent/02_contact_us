import { test } from "@playwright/test";

test("take screenshots", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: "screenshot-inbox.png" });
});
