import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cats = await prisma.catImage.findMany({
      orderBy: {
        generatedAt: 'desc'
      },
      take: 10, // Limit to 10 most recent cats
      include: {
        _count: {
          select: { votes: true }
        }
      }
    });

    // Transform the data to include vote count
    const transformedCats = cats.map(cat => ({
      id: cat.id,
      imageUrl: cat.imageUrl,
      generatedAt: cat.generatedAt,
      votes: cat._count.votes,
      isWinner: cat.isWinner
    }));

    return NextResponse.json(transformedCats);
  } catch (error) {
    console.error('Error fetching cats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cats' },
      { status: 500 }
    );
  }
} 