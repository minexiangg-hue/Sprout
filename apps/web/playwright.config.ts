import { defineConfig } from "@playwright/test";

const mountedWslTemp = process.platform === "linux" ? { TMPDIR: "/tmp", TEMP: "/tmp", TMP: "/tmp" } : {};

const testBaseURL = process.env.GRAPHCODE_TEST_BASE_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  outputDir: "../../.graphcode/playwright-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "../../.graphcode/playwright-report", open: "never" }]
  ],
  use: {
    baseURL: testBaseURL,
    colorScheme: "light",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "corepack pnpm --dir ../.. dev",
    url: `${testBaseURL}/api/health`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      ...process.env,
      ...mountedWslTemp,
      GRAPHCODE_DISABLE_NATIVE_FOLDER_PICKER: "1"
    }
  }
});
