import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec next dev -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
