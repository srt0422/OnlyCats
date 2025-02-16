import { test, expect } from '@playwright/test'

test.describe('Page Navigation', () => {
  test('home page loads successfully', async ({ page }) => {
    console.log('Navigating to home page...')
    await page.goto('/')
    
    // Log the current URL
    console.log('Current URL:', page.url())
    
    // Log the page content
    const content = await page.content()
    console.log('Page content length:', content.length)
    
    // Check if we got a 404 page
    const is404 = await page.locator('h1:text-is("404")').count() > 0
    if (is404) {
      console.log('404 page detected!')
      throw new Error('Got 404 page instead of home page')
    }
    
    // Check page title
    const h1Text = await page.locator('h1').textContent()
    console.log('H1 text:', h1Text)
    await expect(page.locator('h1')).toContainText("Today's Cutest Cats")
    
    // Check for cat images
    const catImages = await page.locator('img[alt="Cat"]').all()
    console.log('Number of cat images found:', catImages.length)
    expect(catImages.length).toBeGreaterThan(0)
    
    // Check for voting buttons
    const voteButtons = await page.locator('button:has-text("votes")').all()
    console.log('Number of vote buttons found:', voteButtons.length)
    expect(voteButtons.length).toBeGreaterThan(0)
    
    // Verify the page structure
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('.grid')).toBeVisible()
    await expect(page.locator('p:text("Vote for your favorite cat of the day!")')).toBeVisible()
  })

  test('past contests page loads successfully', async ({ page }) => {
    await page.goto('/past-contests')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Past Contest Winners')
    
    // Check for winner images
    const winnerImages = await page.locator('img[alt*="Winner"]').all()
    expect(winnerImages.length).toBeGreaterThan(0)
  })

  test('login page loads successfully', async ({ page }) => {
    await page.goto('/login')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Login to OnlyCats')
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
  })

  test('signup page loads successfully', async ({ page }) => {
    await page.goto('/signup')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Create an Account')
    
    // Check for form elements
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Create Account')
  })

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation through links in the navbar
    await page.locator('nav div.flex.space-x-4').getByText('Past Contests').click()
    await page.waitForURL('/past-contests')
    
    await page.locator('nav div.flex.space-x-4').getByText('Login').click()
    await page.waitForURL('/login')
    
    await page.locator('nav div.flex.space-x-4').getByText('Sign Up').click()
    await page.waitForURL('/signup')
    
    await page.locator('nav div.flex.space-x-4').getByText("Today's Cats").click()
    await page.waitForURL('/')
  })

  test('navbar is present on all pages', async ({ page }) => {
    const pages = ['/', '/past-contests', '/login', '/signup']
    
    for (const path of pages) {
      await page.goto(path)
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('nav')).toContainText('OnlyCats')
    }
  })
}) 