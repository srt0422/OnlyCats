'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline'
import VoteButton from '@/components/VoteButton'

interface CatImage {
  id: string
  imageUrl: string
  votes: number
}

export default function Home() {
  const dummyCats: CatImage[] = [
    { id: "1", imageUrl: "/placeholder-cat-1.jpg", votes: 42 },
    { id: "2", imageUrl: "/placeholder-cat-2.jpg", votes: 38 },
    { id: "3", imageUrl: "/placeholder-cat-3.jpg", votes: 45 },
  ];

  const handleDownload = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleShare = (catId: string) => {
    const url = `${window.location.origin}/cats/${catId}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out this cute cat!`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-purple-600 text-white py-10">
        <h1 className="text-4xl font-bold text-center">Today's Cutest Cats</h1>
        <p className="mt-4 text-center text-lg">Vote for your favorite cat of the day!</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyCats.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={cat.imageUrl}
                  alt="Cat"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <VoteButton catImageId={cat.id} initialVotes={cat.votes} />
                </div>
                <div className="flex justify-around">
                  <button
                    className="flex items-center space-x-2 bg-gray-100 p-2 rounded hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-purple-600"
                    onClick={() => handleDownload(cat.imageUrl)}
                  >
                    <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                  <button
                    className="flex items-center space-x-2 bg-gray-100 p-2 rounded hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-purple-600"
                    onClick={() => handleShare(cat.id)}
                  >
                    <ShareIcon className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 