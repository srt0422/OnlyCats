import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from the web directory
dotenv.config({ path: path.join(__dirname, '../web/.env') });

const prisma = new PrismaClient();

async function resetData() {
  try {
    console.log('Starting complete data reset...');

    // Delete all votes first (due to foreign key constraints)
    console.log('Deleting all votes...');
    await prisma.vote.deleteMany({});

    // Delete all cat images from database
    console.log('Deleting all cat images from database...');
    await prisma.catImage.deleteMany({});

    // Delete all users except admin
    console.log('Deleting all users...');
    await prisma.user.deleteMany({});

    // Clean up all image files in public directory
    const publicDir = path.join(__dirname, '../web/public');
    console.log('Public directory path:', publicDir);
    
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir);
      
      for (const file of files) {
        if (file.endsWith('.jpg')) {
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
    } else {
      console.log('Public directory does not exist');
    }

    console.log('Database and files reset completed successfully');
    console.log('Now run npm run seed:dev to load fresh test data');
  } catch (error) {
    console.error('Error during reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset function
resetData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 