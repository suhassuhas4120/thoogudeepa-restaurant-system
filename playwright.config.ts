import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

// Tests run against the static export (`npm run build` -> ./out), which is
// exactly what gets deployed to Surge.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'mobile-customer', testMatch: /customer\.spec\.ts/, use: { ...devices['Pixel 7'] } },
    {
      name: 'tablet',
      testMatch: /smoke\.spec\.ts/,
      // iPad presets default to WebKit; force Chromium so only one browser is needed.
      use: { ...devices['iPad (gen 7) landscape'], defaultBrowserType: 'chromium' },
    },
    { name: 'desktop', testMatch: /smoke\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npx serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
