'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LocaleDetector() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if we already have a cookie set
    const hasPreferredLocaleCookie = document.cookie.includes('preferredLocale=');
    
    if (!hasPreferredLocaleCookie) {
      // Check localStorage for saved preference
      const savedLocale = localStorage.getItem('preferredLocale');
      
      if (savedLocale && ['en', 'sk'].includes(savedLocale)) {
        // Set the cookie based on localStorage
        document.cookie = `preferredLocale=${savedLocale}; path=/; max-age=31536000; samesite=strict`;
      } else {
        // Set default locale cookie if nothing is saved
        document.cookie = `preferredLocale=en; path=/; max-age=31536000; samesite=strict`;
      }
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
