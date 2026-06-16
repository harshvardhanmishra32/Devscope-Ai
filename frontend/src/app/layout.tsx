import React from 'react';
import { Inter, Outfit } from 'next/font/google';
import AppWrapper from '@/components/layout/AppWrapper';
import NavBar from '@/components/layout/NavBar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'DevScope AI — Developer Intelligence Platform',
  description: 'AI-powered portfolio analyzer, resume evaluator, mock interviewer, and career growth planner.',
  openGraph: {
    title: 'DevScope AI',
    description: 'AI-powered Developer Intelligence Platform by Harshvardhan Mishra',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col justify-between">
        <AppWrapper>
          {/* Navigation Bar */}
          <NavBar />

          {/* Page Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} DevScope AI · Built by Harshvardhan Mishra · Open Source under Apache 2.0
          </footer>
        </AppWrapper>
      </body>
    </html>
  );
}
