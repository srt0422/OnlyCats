import { Inter } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import RootLayoutClient from './RootLayoutClient';
import { metadata } from './metadata';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootLayoutClient inter={inter.className}>
      {children}
    </RootLayoutClient>
  );
} 