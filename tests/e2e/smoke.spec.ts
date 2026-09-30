import { expect, test } from '@playwright/test';

const PORTALS = [
  { name: 'customer', path: '/' },
  { name: 'kitchen KDS', path: '/kitchen/' },
  { name: 'waiter console', path: '/waiter/' },
  { name: 'manager dashboard', path: '/manager/' },
];

for (const portal of PORTALS) {
  test(`${portal.name} loads without runtime errors`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto(portal.path);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForLoadState('networkidle');

    expect(pageErrors, `uncaught errors on ${portal.path}`).toEqual([]);
  });
}

test('unknown routes serve the 404 page', async ({ page }) => {
  const response = await page.goto('/does-not-exist/');
  expect(response?.status()).toBe(404);
});

test('kitchen requires a PIN before showing tickets', async ({ page }) => {
  await page.goto('/kitchen/');
  await expect(page.getByText(/pin/i).first()).toBeVisible();
});
