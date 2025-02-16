'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

const Navbar = () => {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-purple-600">
            OnlyCats
          </Link>
          
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-700 hover:text-purple-600">
              Today's Cats
            </Link>
            <Link href="/past-contests" className="text-gray-700 hover:text-purple-600">
              Past Contests
            </Link>
            
            {session ? (
              <>
                <span className="text-gray-700">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-purple-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-purple-600">
                  Login
                </Link>
                <Link href="/signup" className="text-gray-700 hover:text-purple-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 