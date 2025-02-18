import { test, expect } from '@playwright/test';
import { 
  createTestUser, 
  cleanupDatabase,
  loginTestUser, 
  createTestCatImages,
  setupTestImages,
  cleanupTestFiles,
  selectors 
} from '../helpers/test-utils';

test.describe('Cat Voting Functionality', () => {
  const testUsers = new Map();

  test.beforeAll(async ({ browser }) => {
    // Clean up any leftover test data
    await cleanupDatabase();
    await cleanupTestFiles();
    
    // Create test cat images first
    await createTestCatImages(4);
    
    // Create test users
    const testCases = ['voter1', 'voter2', 'admin'];
    for (const testCase of testCases) {
      const uniqueTestCase = `${testCase}-${Date.now()}`;
      const user = await createTestUser(uniqueTestCase);
      testUsers.set(testCase, user);
    }

    // Verify server is ready
    const context = await browser.newContext();
    const page = await context.newPage();
    let retries = 5;
    while (retries > 0) {
      try {
        await page.goto('/', { timeout: 10000 });
        await page.waitForResponse(
          response => response.url().includes('/api/cats') && response.status() === 200,
          { timeout: 10000 }
        );
        break;
      } catch (error) {
        console.log(`Server not ready, retrying... (${retries} attempts left)`);
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    await page.close();
    await context.close();
  });

  test.afterAll(async () => {
    // Clean up all test data
    await cleanupDatabase();
    await cleanupTestFiles();
  });

  test.beforeEach(async ({ page }) => {
    // Wait for the page to be ready
    await page.goto('/', { timeout: 10000 });
    // Wait for the API request to complete and data to be loaded
    await page.waitForResponse(
      response => response.url().includes('/api/cats') && response.status() === 200,
      { timeout: 10000 }
    );
    // Wait for cat cards to be rendered
    await page.waitForSelector(selectors.catCard, { timeout: 10000, state: 'visible' });
  });

  test('displays cat cards', async ({ page }) => {
    await page.goto('/');
    
    // Wait for cat cards to be loaded
    await page.waitForSelector(selectors.catCard, { timeout: 10000, state: 'visible' });
    
    // Get all test cat cards (those with test_ prefix in the image URL)
    const testCatCards = await page.locator(`${selectors.catCard} img[src^="/test_"]`).all();
    expect(testCatCards.length).toBe(4); // We created 4 test cat images
    console.log(`Found ${testCatCards.length} test cat cards`);

    // Verify first test cat card structure
    const firstCard = await page.locator(`${selectors.catCard}:has(img[src^="/test_"])`).first();
    await expect(firstCard.locator(selectors.catImage)).toBeVisible();
    await expect(firstCard.locator(selectors.voteCount)).toBeVisible();
    await expect(firstCard.locator(selectors.voteButton)).toBeVisible();
    await expect(firstCard.locator(selectors.generatedDate)).toBeVisible();
  });

  test('cat cards are displayed correctly', async ({ page }) => {
    // Verify cat card structure
    const catCards = await page.locator(selectors.catCard).all();
    expect(catCards.length).toBeGreaterThan(0);

    // Check first cat card structure
    const firstCard = catCards[0];
    await expect(firstCard.locator(selectors.catImage)).toBeVisible();
    await expect(firstCard.locator(selectors.voteCount)).toBeVisible();
    await expect(firstCard.locator(selectors.voteButton)).toBeVisible();
    await expect(firstCard.locator(selectors.generatedDate)).toBeVisible();
  });

  test('vote button is disabled for non-logged in users', async ({ page }) => {
    await page.goto('/');
    
    // Wait for cat cards and vote buttons to be loaded
    await page.waitForSelector(selectors.voteButton, { timeout: 10000, state: 'visible' });
    
    // Get vote buttons only for test cat cards
    const testVoteButtons = await page.locator(`${selectors.catCard}:has(img[src^="/test_"]) ${selectors.voteButton}`).all();
    expect(testVoteButtons.length).toBe(4); // We should have 4 vote buttons for test cats
    
    for (const button of testVoteButtons) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveAttribute('title', 'Please login to vote');
    }
  });

  test('logged in user can vote once per cat', async ({ page }) => {
    const user = testUsers.get('voter1');
    await loginTestUser(page, user.email);

    // Wait for cat cards to be loaded
    await page.waitForSelector(selectors.catCard, { timeout: 10000, state: 'visible' });
    
    // Get first test cat card
    const firstTestCard = await page.locator(`${selectors.catCard}:has(img[src^="/test_"])`).first();
    await expect(firstTestCard).toBeVisible();
    
    const voteButton = firstTestCard.locator(selectors.voteButton);
    await expect(voteButton).toBeVisible();
    await expect(voteButton).toBeEnabled();
    
    const voteCount = firstTestCard.locator(selectors.voteCount);
    await expect(voteCount).toBeVisible();
    
    // Get initial vote count
    const initialCount = await voteCount.textContent();
    const initialNumericCount = parseInt(initialCount?.replace(/\D/g, '') || '0');

    // Click vote button
    await voteButton.click();

    // Wait for vote count to update
    await expect(async () => {
      const newCount = await voteCount.textContent();
      const newNumericCount = parseInt(newCount?.replace(/\D/g, '') || '0');
      expect(newNumericCount).toBe(initialNumericCount + 1);
    }).toPass({ timeout: 10000 });

    // Verify button is now disabled
    await expect(voteButton).toBeDisabled();
    await expect(voteButton).toHaveAttribute('title', 'You have already voted for this cat');
  });

  test('vote counts persist across page reloads', async ({ page }) => {
    const user = testUsers.get('voter2');
    await loginTestUser(page, user.email);

    // Wait for cat cards to be loaded
    await page.waitForSelector(selectors.catCard, { timeout: 10000, state: 'visible' });
    
    // Get first test cat card
    const firstTestCard = await page.locator(`${selectors.catCard}:has(img[src^="/test_"])`).first();
    await expect(firstTestCard).toBeVisible();
    
    const voteButton = firstTestCard.locator(selectors.voteButton);
    await expect(voteButton).toBeVisible();
    await expect(voteButton).toBeEnabled();
    
    const voteCount = firstTestCard.locator(selectors.voteCount);
    await expect(voteCount).toBeVisible();
    
    // Get initial vote count
    const initialCount = await voteCount.textContent();
    const initialNumericCount = parseInt(initialCount?.replace(/\D/g, '') || '0');

    // Click vote button
    await voteButton.click();

    // Wait for vote count to update
    await expect(async () => {
      const newCount = await voteCount.textContent();
      const newNumericCount = parseInt(newCount?.replace(/\D/g, '') || '0');
      expect(newNumericCount).toBe(initialNumericCount + 1);
    }).toPass({ timeout: 10000 });

    // Reload page and verify vote persists
    await page.reload();
    await page.waitForSelector(selectors.catCard, { timeout: 10000, state: 'visible' });
    
    const reloadedFirstTestCard = await page.locator(`${selectors.catCard}:has(img[src^="/test_"])`).first();
    const newVoteCount = reloadedFirstTestCard.locator(selectors.voteCount);
    await expect(newVoteCount).toBeVisible();
    
    await expect(async () => {
      const finalCount = await newVoteCount.textContent();
      const finalNumericCount = parseInt(finalCount?.replace(/\D/g, '') || '0');
      expect(finalNumericCount).toBe(initialNumericCount + 1);
    }).toPass({ timeout: 10000 });
    
    // Verify button remains disabled
    const newVoteButton = reloadedFirstTestCard.locator(selectors.voteButton);
    await expect(newVoteButton).toBeDisabled();
    await expect(newVoteButton).toHaveAttribute('title', 'You have already voted for this cat');
  });

  test('voting UI updates in real-time', async ({ page }) => {
    const user = testUsers.get('realtime-test');
    await loginTestUser(page, user.email);

    // Get all cat cards
    const catCards = await page.locator(selectors.catCard).all();
    
    for (const card of catCards) {
      const voteButton = card.locator(selectors.voteButton);
      const voteCount = card.locator(selectors.voteCount);

      // Skip if already voted
      if (await voteButton.isDisabled()) continue;

      const initialCount = await voteCount.textContent();
      await voteButton.click();

      // Verify immediate UI update
      await expect(async () => {
        const newCount = await voteCount.textContent();
        expect(newCount).not.toBe(initialCount);
      }).toPass();

      // Verify button state changed immediately
      await expect(voteButton).toBeDisabled();
    }
  });
}); 