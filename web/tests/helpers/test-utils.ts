import { PrismaClient } from '@prisma/client';
import { Page } from '@playwright/test';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Helper function to interpolate environment variables
function interpolateEnvVar(value: string): string {
  return value.replace(/\${([^}]+)}/g, (_, varName) => process.env[varName] || '');
}

const prisma = new PrismaClient();

// UI Selectors from environment
const selectors = {
  catCard: process.env.TEST_SELECTOR_CAT_CARD!,
  catImage: process.env.TEST_SELECTOR_CAT_IMAGE!,
  voteCount: process.env.TEST_SELECTOR_VOTE_COUNT!,
  voteButton: process.env.TEST_SELECTOR_VOTE_BUTTON!,
  generatedDate: process.env.TEST_SELECTOR_GENERATED_DATE!,
  emailInput: process.env.TEST_SELECTOR_EMAIL_INPUT!,
  passwordInput: process.env.TEST_SELECTOR_PASSWORD_INPUT!,
  submitButton: process.env.TEST_SELECTOR_SUBMIT_BUTTON!,
};

// Server configuration
const serverConfig = {
  port: process.env.TEST_SERVER_PORT!,
  host: process.env.TEST_SERVER_HOST!,
  baseUrl: interpolateEnvVar(process.env.TEST_SERVER_BASE_URL!),
};

export { selectors, serverConfig };

// Constants for test data
const TEST_IMAGE_PREFIX = 'test_';
const TEST_EMAIL_PREFIX = 'test_';

export async function cleanupDatabase() {
  try {
    console.log('Starting test database cleanup...');
    
    // Clean up in the correct order to avoid foreign key constraints
    console.log('Deleting test votes...');
    await prisma.vote.deleteMany({
      where: {
        OR: [
          {
            user: {
              email: {
                startsWith: TEST_EMAIL_PREFIX
              }
            }
          },
          {
            catImage: {
              imageUrl: {
                startsWith: TEST_IMAGE_PREFIX
              }
            }
          }
        ]
      }
    });
    
    console.log('Deleting test users...');
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX
        }
      }
    });
    
    console.log('Deleting test cat images...');
    await prisma.catImage.deleteMany({
      where: {
        imageUrl: {
          startsWith: TEST_IMAGE_PREFIX
        }
      }
    });
    
    // Delete any leftover test images from previous runs
    await cleanupTestFiles();
    
    console.log('Test database cleanup completed successfully');
  } catch (error) {
    console.error('Error during test database cleanup:', error);
    throw error;
  }
}

export async function createTestUser(testName: string) {
  try {
    const timestamp = Date.now();
    const uniqueEmail = `${TEST_EMAIL_PREFIX}${testName}-${timestamp}@example.com`;
    console.log(`Creating test user with email: ${uniqueEmail}`);
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: hashedPassword,
        name: `Test User ${testName}`
      }
    });
    console.log('Test user created successfully');
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

export async function createTestCatImages(count: number = 4) {
  try {
    console.log('Creating test cat images...');
    const cats = [];
    
    // First ensure the test images exist in the public directory
    await setupTestImages();
    
    // Delete any existing test cat images from the database
    await prisma.catImage.deleteMany({
      where: {
        imageUrl: {
          startsWith: TEST_IMAGE_PREFIX
        }
      }
    });
    
    // Then create the database records
    for (let i = 0; i < count; i++) {
      const imageUrl = `/${TEST_IMAGE_PREFIX}cat-${i + 1}.jpg`; // Add leading slash
      const cat = await prisma.catImage.create({
        data: {
          imageUrl,
          generatedAt: new Date(Date.now() - i * 3600000), // Stagger creation times
          isWinner: false
        }
      });
      cats.push(cat);
      console.log(`Created test cat image in database: ${imageUrl}`);
    }
    
    // Verify all images exist
    const publicDir = path.join(process.cwd(), 'public');
    for (const cat of cats) {
      const imagePath = path.join(publicDir, cat.imageUrl.replace(/^\//, ''));
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Test image not found: ${imagePath}`);
      }
    }
    
    console.log(`Created ${count} test cat images successfully`);
    return cats;
  } catch (error) {
    console.error('Error creating test cat images:', error);
    throw error;
  }
}

export async function setupTestImages() {
  try {
    console.log('Setting up test images...');
    const publicDir = path.join(process.cwd(), 'public');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Remove any existing test images first
    await cleanupTestFiles();

    // Create test placeholder images
    for (let i = 1; i <= 4; i++) {
      const imagePath = path.join(publicDir, `${TEST_IMAGE_PREFIX}cat-${i}.jpg`);
      if (!fs.existsSync(imagePath)) {
        // Create a simple 1x1 pixel JPEG
        const buffer = Buffer.from([
          0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
          0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
          0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01,
          0x01, 0x00, 0x00, 0x3f, 0x00, 0x7f, 0xff, 0xd9
        ]);
        fs.writeFileSync(imagePath, buffer);
        console.log(`Created test image: ${imagePath}`);
      }
    }
    console.log('Test images setup completed successfully');
  } catch (error) {
    console.error('Error setting up test images:', error);
    throw error;
  }
}

export async function loginTestUser(page: Page, email: string) {
  await page.goto('/login');
  await page.fill(selectors.emailInput, email);
  await page.fill(selectors.passwordInput, 'password123');
  
  // Start waiting for response before clicking
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/auth/callback/credentials')
  );
  
  await page.click(selectors.submitButton);
  
  // Wait for the response and check its status
  const response = await responsePromise;
  if (response.status() !== 200) {
    const responseData = await response.json();
    throw new Error(`Login failed: ${responseData.error || 'Unknown error'}`);
  }
  
  // Wait for navigation to complete
  await page.waitForURL('/', { waitUntil: 'networkidle' });
  
  // Verify that we're actually logged in
  const session = await page.evaluate(() => {
    return fetch('/api/auth/session').then(res => res.json());
  });
  
  if (!session?.user) {
    throw new Error(`Failed to log in as ${email}`);
  }
}

// Cleanup test files
export async function cleanupTestFiles() {
  try {
    console.log('Cleaning up test files...');
    const publicDir = path.join(process.cwd(), 'public');
    
    // Remove test images
    const testImagePattern = new RegExp(`^${TEST_IMAGE_PREFIX}cat-\\d+\\.jpg$`);
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        if (testImagePattern.test(file)) {
          const imagePath = path.join(publicDir, file);
          try {
            fs.unlinkSync(imagePath);
            console.log(`Removed test image: ${imagePath}`);
          } catch (err: any) {
            // Ignore errors for files that don't exist
            if (err.code !== 'ENOENT') {
              throw err;
            }
          }
        }
      }
    }
    console.log('Test files cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up test files:', error);
    throw error;
  }
} 