import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5273",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @voice-simple/server dev",
      port: 6666,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "pnpm --filter @voice-simple/client dev",
      port: 5273,
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});
