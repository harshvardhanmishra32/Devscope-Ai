import React from 'react';
import AppWrapper from '@/components/layout/AppWrapper';
import NavBar from '@/components/layout/NavBar';
import './globals.css';

export const metadata = {
  title: 'DevScope AI — Developer Intelligence Platform',
  description: 'AI-powered portfolio analyzer, resume evaluator, mock interviewer, and career growth planner.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col justify-between">
        <AppWrapper>
          {/* Navigation Bar (client component — shows logout when logged in) */}
          <NavBar />

          {/* Page Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} DevScope AI. Open Source under Apache 2.0.
          </footer>
        </AppWrapper>
      </body>
    </html>
  );
}
