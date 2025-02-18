import { test, expect } from '@playwright/test';

test.describe('Home Page - User Story V1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test('loads quickly (within 3 seconds)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('.soft-ui-content');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('displays cat images with consistent resolution', async ({ page }) => {
    // Wait for cat cards to be loaded
    const catCards = await page.locator('.soft-ui-card').all();
    expect(catCards.length).toBeGreaterThan(0);

    // Check each cat image
    for (const card of catCards) {
      // Verify image exists and is visible
      const image = await card.locator('img').first();
      await expect(image).toBeVisible();

      // Verify image has proper attributes for consistent resolution
      const imgElement = await image.evaluate((el) => ({
        className: el.className,
        style: el.getAttribute('style'),
      }));
      
      expect(imgElement.className).toContain('object-cover');
    }
  });

  test('displays cat metadata correctly', async ({ page }) => {
    const catCards = await page.locator('.soft-ui-card').all();
    expect(catCards.length).toBeGreaterThan(0);

    for (const card of catCards) {
      // Check generation date
      const dateElement = await card.locator('[data-testid="generated-date"]');
      await expect(dateElement).toBeVisible();
      const dateText = await dateElement.textContent();
      expect(dateText).toBeTruthy();

      // Check ID display
      const idText = await card.locator('text=/ID: #.+/');
      await expect(idText).toBeVisible();
    }
  });

  test('has responsive layout across device sizes', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.soft-ui-grid')).toBeVisible();
    const mobileCards = await page.locator('.soft-ui-card').all();
    expect(mobileCards.length).toBeGreaterThan(0);

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.soft-ui-grid')).toBeVisible();
    const tabletCards = await page.locator('.soft-ui-card').all();
    expect(tabletCards.length).toBeGreaterThan(0);

    // Test desktop layout
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.soft-ui-grid')).toBeVisible();
    const desktopCards = await page.locator('.soft-ui-card').all();
    expect(desktopCards.length).toBeGreaterThan(0);

    // Verify layout adjusts properly
    const gridElement = page.locator('.soft-ui-grid');
    await expect(gridElement).toHaveClass(/grid/);
  });

  test('displays total votes counter', async ({ page }) => {
    // Check for stats overview section
    const statsSection = await page.locator('.soft-ui-stats').first();
    await expect(statsSection).toBeVisible();

    // Verify total votes counter exists and has a number
    const votesCounter = await statsSection.locator('text=/[0-9]+ votes/i');
    await expect(votesCounter).toBeVisible();
  });

  test('displays action buttons for each cat', async ({ page }) => {
    const catCards = await page.locator('.soft-ui-card').all();
    expect(catCards.length).toBeGreaterThan(0);

    for (const card of catCards) {
      // Check for save button
      const saveButton = await card.locator('button:has-text("Save")');
      await expect(saveButton).toBeVisible();

      // Check for share button
      const shareButton = await card.locator('button:has-text("Share")');
      await expect(shareButton).toBeVisible();
    }
  });
}); 