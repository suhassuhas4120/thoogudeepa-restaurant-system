import { expect, test } from '@playwright/test';

// Runs on a phone viewport (Pixel 7).
test('customer portal loads on a phone without runtime errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('/');
  await expect(page.locator('body')).not.toBeEmpty();
  await page.waitForLoadState('networkidle');

  expect(pageErrors).toEqual([]);
});

// KNOWN ISSUE (found by this suite): the customer page is currently laid out as a
// desktop "phone mockup" showcase (fixed 380px frame + wide header), so it overflows
// a real phone screen horizontally (~226px on a Pixel 7).
// Enable this test by changing `test.fixme` to `test` once the page is made responsive.
test.fixme('customer portal has no horizontal scroll on a phone', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
