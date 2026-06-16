"use client";

import { useEffect, useState } from 'react';

/**
 * useAuthGuard — call at the top of any protected page.
 * Returns { isReady: boolean } — render page content only when isReady is true.
 * If no token found, automatically redirects to "/" to show the login screen.
 */
export function useAuthGuard() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('devscope_token');
    if (!token) {
      window.location.replace('/');
    } else {
      setIsReady(true);
    }
  }, []);

  return { isReady };
}
