'use client'

import React, { useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'

interface VoteButtonProps {
  catImageId: string
  initialVotes: number
  onVoteSuccess?: () => void
}

const VoteButton = ({ catImageId, initialVotes, onVoteSuccess }: VoteButtonProps) => {
  const { data: session } = useSession()
  const [votes, setVotes] = useState(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleVote = async () => {
    if (!session) {
      window.location.href = '/login'
      return
    }

    if (hasVoted || isLoading) {
      return
    }

    setIsLoading(true)
    setIsAnimating(true)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catImageId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to vote')
      }

      setVotes(prev => prev + 1)
      setHasVoted(true)
      onVoteSuccess?.()

      setTimeout(() => {
        setIsAnimating(false)
      }, 1000)
    } catch (error) {
      console.error('Vote error:', error)
      setIsAnimating(false)
      alert(error instanceof Error ? error.message : 'Failed to vote')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleVote}
        disabled={!session || hasVoted || isLoading}
        title={!session ? 'Please login to vote' : hasVoted ? 'You have already voted for this cat' : undefined}
        className={`
          soft-ui-button !p-2 !rounded-full
          ${isAnimating ? 'animate-bounce' : ''}
          ${hasVoted ? 'bg-pink-100 text-pink-500' : 'bg-white hover:bg-gray-50 text-gray-600'}
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        `}
        data-testid="vote-button"
      >
        {hasVoted ? (
          <HeartIconSolid className="w-5 h-5" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
      </button>
      <span className="text-sm font-medium text-gray-600" data-testid="vote-count">
        {votes} votes
      </span>
    </div>
  )
}

export default VoteButton 