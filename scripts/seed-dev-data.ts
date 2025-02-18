import { PrismaClient, User, CatImage } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables from the web directory
dotenv.config({ path: path.join(__dirname, '../web/.env') });

const prisma = new PrismaClient();

async function createPlaceholderImage(imagePath: string, color: string = '#FF69B4') {
  try {
    // Create a 400x400 colored square with some visual elements
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}"/>
        <circle cx="200" cy="150" r="50" fill="white"/>
        <circle cx="180" cy="140" r="10" fill="black"/>
        <circle cx="220" cy="140" r="10" fill="black"/>
        <path d="M 160 200 Q 200 240 240 200" stroke="black" stroke-width="5" fill="none"/>
        <text x="200" y="300" font-family="Arial" font-size="24" text-anchor="middle" fill="white">Test Cat</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg()
      .toFile(imagePath);

    console.log(`Created test image: ${imagePath}`);
  } catch (error) {
    console.error('Error creating placeholder image:', error);
    throw error;
  }
}

async function seedDevData() {
  try {
    console.log('Starting development data seeding...');

    // Create demo users
    const demoUsers: User[] = [];
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.upsert({
        where: { email: `demo${i}@example.com` },
        update: {},
        create: {
          email: `demo${i}@example.com`,
          password: await bcrypt.hash('demo123', 10),
          name: `Demo User ${i}`
        }
      });
      demoUsers.push(user);
      console.log('Created demo user:', user.email);
    }

    // Create sample cat images
    const publicDir = path.join(process.cwd(), 'public');
    console.log('Public directory path:', publicDir);
    if (!fs.existsSync(publicDir)) {
      console.log('Creating public directory...');
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Create or update sample cat images
    const catImages: CatImage[] = [];
    const colors = ['#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD']; // Pink, Sky Blue, Light Green, Plum

    for (let i = 1; i <= 4; i++) {
      const imageUrl = `/test_cat-${i}.jpg`;
      const imagePath = path.join(publicDir, `test_cat-${i}.jpg`);
      console.log('Creating image at path:', imagePath);

      try {
        // Create placeholder image if it doesn't exist
        if (!fs.existsSync(imagePath)) {
          console.log('Image does not exist, creating...');
          await createPlaceholderImage(imagePath, colors[i - 1]);
        } else {
          console.log('Image already exists');
        }

        // Find existing cat image or create new one
        let catImage = await prisma.catImage.findFirst({
          where: { imageUrl }
        });

        if (!catImage) {
          console.log('Creating database record for:', imageUrl);
          catImage = await prisma.catImage.create({
            data: {
              imageUrl,
              generatedAt: new Date(Date.now() - i * 3600000), // Stagger creation times
              isWinner: false
            }
          });
          console.log('Created test cat image:', imageUrl);
        } else {
          console.log('Database record already exists for:', imageUrl);
        }
        
        if (catImage) {
          catImages.push(catImage);
        }
      } catch (error) {
        console.error(`Error processing image ${i}:`, error);
        throw error;
      }
    }

    // Clear existing votes
    await prisma.vote.deleteMany({
      where: {
        user: {
          email: {
            in: demoUsers.map(u => u.email)
          }
        }
      }
    });

    // Add random votes from each demo user
    for (const user of demoUsers) {
      // Randomly select 1-3 cats to vote for
      const numVotes = Math.floor(Math.random() * 3) + 1;
      const shuffledCats = [...catImages].sort(() => Math.random() - 0.5);
      const selectedCats = shuffledCats.slice(0, numVotes);
      
      for (const cat of selectedCats) {
        await prisma.vote.create({
          data: {
            userId: user.id,
            catImageId: cat.id
          }
        });
        console.log(`Added vote from ${user.email} for cat: ${cat.imageUrl}`);
      }
    }

    console.log('Development data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding development data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDevData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 