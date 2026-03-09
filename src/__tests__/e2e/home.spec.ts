import { test, expect } from "@playwright/test";

test("inbox page renders on root", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Contact Inbox/i);
  await expect(page.getByText("Contact Inbox")).toBeVisible();
});
