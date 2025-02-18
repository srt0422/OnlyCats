import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from the web directory
dotenv.config({ path: path.join(__dirname, '../web/.env') });

const prisma = new PrismaClient();

async function cleanupOldData() {
  try {
    console.log('Starting cleanup of old sample-cat data...');

    // First, delete votes associated with sample-cat images
    console.log('Deleting votes for sample-cat images...');
    await prisma.vote.deleteMany({
      where: {
        catImage: {
          imageUrl: {
            startsWith: '/sample-cat'
          }
        }
      }
    });

    // Then delete the cat image records
    console.log('Deleting sample-cat image records from database...');
    await prisma.catImage.deleteMany({
      where: {
        imageUrl: {
          startsWith: '/sample-cat'
        }
      }
    });

    // Finally, delete the actual image files
    const publicDir = path.join(process.cwd(), 'web/public');
    const files = fs.readdirSync(publicDir);
    
    for (const file of files) {
      if (file.startsWith('sample-cat-')) {
        const filePath = path.join(publicDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err: any) {
          if (err.code !== 'ENOENT') {
            console.error(`Error deleting file ${filePath}:`, err);
          }
        }
      }
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup function
cleanupOldData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 