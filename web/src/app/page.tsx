'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDownTrayIcon, ShareIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/solid'
import VoteButton from '@/components/VoteButton'
import { format } from 'date-fns'

interface CatImage {
  id: string
  imageUrl: string
  votes: number
  generatedAt: Date
  description: string
}

export default function Home() {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [cats, setCats] = useState<CatImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCats() {
      try {
        console.log('Fetching cats...');
        const response = await fetch('/api/cats');
        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('Received cat data:', JSON.stringify(data, null, 2));
        setCats(data.map((cat: any) => ({
          ...cat,
          generatedAt: new Date(cat.generatedAt)
        })));
      } catch (err) {
        console.error('Error fetching cats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load cats');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCats();
  }, []);

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cat-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showNotification('Image saved successfully!', 'success')
    } catch (error) {
      showNotification('Failed to save image. Please try again.', 'error')
    }
  }

  const handleShare = (catId: string) => {
    const url = `${window.location.origin}/cats/${catId}`
    const text = 'Check out this adorable cat! 🐱✨ Vote for your favorite at OnlyCats!'
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <button
            className="mt-4 soft-ui-button bg-primary text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="soft-ui-stats">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Votes</p>
            <p className="text-2xl font-semibold text-gray-900">
              {cats.reduce((sum, cat) => sum + cat.votes, 0)}
            </p>
          </div>
          <div className="soft-ui-stats-icon">
            <ChartBarIcon className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Cat Grid */}
      <div className="soft-ui-grid">
        {cats.map((cat) => (
          <article key={cat.id} className="soft-ui-card group" data-testid="cat-card">
            {/* Image Container */}
            <div className="relative h-48 md:h-64">
              <Image
                src={cat.imageUrl}
                alt={cat.description || 'A cute cat'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                data-testid="cat-image"
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="soft-ui-badge-primary" data-testid="generated-date">
                  <ClockIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  {format(cat.generatedAt, 'h:mm a')}
                </span>
                <span className="text-sm text-gray-500">
                  ID: #{cat.id}
                </span>
              </div>

              {cat.description && (
                <p className="text-gray-600">
                  {cat.description}
                </p>
              )}

              {/* Vote Section */}
              <div className="flex items-center justify-between">
                <VoteButton
                  catImageId={cat.id}
                  initialVotes={cat.votes}
                  onVoteSuccess={() => showNotification('Vote recorded! Thank you!', 'success')}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  className="soft-ui-button !px-4 !py-2 bg-white hover:bg-gray-50 text-gray-700"
                  onClick={() => handleDownload(cat.imageUrl)}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2 inline" aria-hidden="true" />
                  Save
                </button>

                <button
                  className="soft-ui-button !px-4 !py-2 bg-white hover:bg-gray-50 text-gray-700"
                  onClick={() => handleShare(cat.id)}
                >
                  <ShareIcon className="w-5 h-5 mr-2 inline" aria-hidden="true" />
                  Share
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className={`soft-ui-toast ${toastType === 'success' ? 'soft-ui-toast-success' : 'soft-ui-toast-error'}`}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
