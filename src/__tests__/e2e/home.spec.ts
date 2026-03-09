import { test, expect } from "@playwright/test";

test("admin page renders", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveTitle(/Admin/i);
  await expect(page.getByText("Contact Inbox")).toBeVisible();
});
