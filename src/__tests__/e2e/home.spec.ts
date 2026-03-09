import { test, expect } from "@playwright/test";

test("inbox renders on /", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Inbox")).toBeVisible();
});

test("inbox renders on /inbox", async ({ page }) => {
  await page.goto("/inbox");
  await expect(page.getByText("Inbox")).toBeVisible();
});
