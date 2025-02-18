'use client';

import { Providers } from './providers';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import type { ReactNode } from 'react';

interface RootLayoutClientProps {
  children: ReactNode;
  inter: string;
}

export default function RootLayoutClient({ children, inter }: RootLayoutClientProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-gray-100">
            <Sidebar />
            <div className="lg:ml-64">
              <Navbar />
              <main className="soft-ui-content">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
} 