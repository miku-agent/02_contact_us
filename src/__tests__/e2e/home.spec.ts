import { test, expect } from "@playwright/test";

test("contact form submits", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Contact/i);

  await page.getByLabel("이름").fill("Bini");
  await page.getByLabel("이메일").fill("bini59@example.com");
  await page.getByLabel("메시지").fill("hello from e2e");

  await page.getByRole("button", { name: "보내기" }).click();
  await expect(page.getByText("메시지가 전송되었어요")).toBeVisible();
});
