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

  const handleVote = async () => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/login'
      return
    }

    if (hasVoted) {
      return
    }

    setIsLoading(true)

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
    } catch (error) {
      console.error('Vote error:', error)
      alert(error instanceof Error ? error.message : 'Failed to vote')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className={`flex items-center space-x-2 ${
        hasVoted ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleVote}
      disabled={isLoading || hasVoted}
    >
      {hasVoted ? (
        <HeartIconSolid className="h-6 w-6" />
      ) : (
        <HeartIcon className="h-6 w-6" />
      )}
      <span>{votes} votes</span>
    </button>
  )
}

export default VoteButton 