'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="soft-ui-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome {session?.user?.name || 'to OnlyCats'}
            </h2>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="soft-ui-button !p-2 !rounded-full bg-white hover:bg-gray-50">
              <BellIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Profile */}
            <button className="soft-ui-button !p-2 !rounded-full bg-white hover:bg-gray-50">
              <UserCircleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 