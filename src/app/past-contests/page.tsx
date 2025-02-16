'use client'

import React from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline'

interface PastWinner {
  id: string
  imageUrl: string
  date: Date
  votes: number
}

export default function PastContestsPage() {
  const dummyWinners: PastWinner[] = [
    {
      id: '1',
      imageUrl: '/placeholder-winner-1.jpg',
      date: new Date('2024-02-14'),
      votes: 156
    },
    {
      id: '2',
      imageUrl: '/placeholder-winner-2.jpg',
      date: new Date('2024-02-13'),
      votes: 142
    },
    {
      id: '3',
      imageUrl: '/placeholder-winner-3.jpg',
      date: new Date('2024-02-12'),
      votes: 168
    }
  ]

  const handleDownload = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  const handleShare = (catId: string) => {
    const url = `${window.location.origin}/cats/${catId}`
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out this winning cat!`, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-600">Past Contest Winners</h1>
        <p className="mt-2 text-gray-600">Browse through our previous winning cats!</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {dummyWinners.map((winner) => (
          <div key={winner.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0 relative h-64 md:h-auto md:w-96">
                <Image
                  src={winner.imageUrl}
                  alt={`Winner from ${format(winner.date, 'MMMM d, yyyy')}`}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-purple-600 font-semibold">
                  Winner
                </div>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {format(winner.date, 'MMMM d, yyyy')}
                </p>
                <p className="mt-2 text-gray-600">
                  This adorable cat won with {winner.votes} votes!
                </p>
                
                <div className="mt-4 flex space-x-4">
                  <button
                    className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
                    onClick={() => handleDownload(winner.imageUrl)}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Download</span>
                  </button>
                  
                  <button
                    className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
                    onClick={() => handleShare(winner.id)}
                  >
                    <ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 