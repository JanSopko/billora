'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

// Helper function to get bearer token from cookies
function getBearerToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const bearerCookie = cookies.find(cookie => 
    cookie.trim().startsWith('bearer=')
  );
  
  if (bearerCookie) {
    return bearerCookie.split('=')[1];
  }
  
  return null;
}

// Auth Guard HOC
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthGuardedComponent(props: T) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = getBearerToken();
      
      if (!token) {
        // Set 401 status and redirect to home
        setIsAuthenticated(false);
        setIsLoading(false);
        
        // In a real app, you'd make an API call to verify the token
        // For now, we'll just check if it exists
        return;
      }

      // Simulate token validation (replace with actual API call)
      const validateToken = async () => {
        try {
          // Here you would make an API call to validate the token
          // For demo purposes, we'll assume token is valid if it exists
          if (token.length > 0) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };

      validateToken();
    }, []);

    // Loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // Not authenticated - show friendly login prompt
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="bg-background border border-border rounded-xl p-8 shadow-lg">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-3">Access Restricted</h1>
              <h2 className="text-xl font-semibold text-primary mb-4">Sign In Required</h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                This page contains exclusive features for Billora users. Sign in to access your AI-powered business management tools, including invoices, contracts, and product catalog.
              </p>

              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">
                  ✨ <strong>What you'll get:</strong> Smart invoice management, AI contract creation, and seamless product cataloging
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/?login=required&returnUrl=' + encodeURIComponent(window.location.pathname)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Sign In to Continue
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Authenticated - render the protected component
    return <Component {...props} />;
  };
}

// Server-side auth check utility
export async function checkServerAuth(): Promise<boolean> {
  // This would be used in server components or API routes
  // to check authentication server-side
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const bearerToken = cookieStore.get('bearer');
  
  return !!bearerToken?.value;
}

// Middleware helper for route protection
export function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return false;
  
  const cookies = cookieHeader.split(';');
  const bearerCookie = cookies.find(cookie => 
    cookie.trim().startsWith('bearer=')
  );
  
  return !!bearerCookie;
}
