"use client";

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the 3D scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('../3d/Scene'), { ssr: false });

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'mock-client-id'}>
      {/* 3D Background */}
      <div className="fixed inset-0 z-[-1] bg-black pointer-events-none">
        {mounted && <Scene route={pathname} />}
      </div>
      
      {/* Overlay Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between pointer-events-none">
        <div className="pointer-events-auto flex-1 flex flex-col w-full">
          {children}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
