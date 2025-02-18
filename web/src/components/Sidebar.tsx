'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  TrophyIcon, 
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: "Today's Cats", href: '/', icon: HomeIcon },
  { name: 'Past Winners', href: '/past-contests', icon: TrophyIcon },
  { name: 'My Votes', href: '/my-votes', icon: HeartIcon },
  { name: 'Sign Up', href: '/signup', icon: UserPlusIcon },
  { name: 'Login', href: '/login', icon: ArrowRightOnRectangleIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="soft-ui-sidebar">
      {/* Logo */}
      <div className="px-6 py-8">
        <Link href="/" className="flex items-center space-x-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            OnlyCats
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-primary/10 to-pink-500/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="soft-ui-stats">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Votes Today</p>
            <p className="text-2xl font-semibold text-gray-900">2,405</p>
          </div>
          <div className="soft-ui-stats-icon">
            <HeartIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </aside>
  )
} 