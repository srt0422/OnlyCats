import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { catImageId } = await request.json()

    if (!catImageId) {
      return NextResponse.json(
        { error: 'Cat image ID is required' },
        { status: 400 }
      )
    }

    // Check if user has already voted for this image
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_catImageId: {
          userId: session.user.id,
          catImageId,
        },
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this image' },
        { status: 400 }
      )
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        userId: session.user.id,
        catImageId,
      },
    })

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error('Voting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 