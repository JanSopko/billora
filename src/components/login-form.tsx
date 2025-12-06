'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { mockLogin, isUserAuthenticated, logout } from '../utils/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [returnUrl, setReturnUrl] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoggedIn(isUserAuthenticated());
    
    // Check if user was redirected due to auth requirement
    const loginParam = searchParams.get('login');
    const returnUrlParam = searchParams.get('returnUrl');
    
    if (loginParam === 'required') {
      setLoginRequired(true);
      setReturnUrl(returnUrlParam || '');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await mockLogin(email, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
        
        // Redirect to return URL if available, otherwise stay on current page
        if (returnUrl) {
          window.location.href = returnUrl;
        }
      } else {
        // Handle 403 Forbidden specifically
        if (result.status === 403) {
          setError('Wrong credentials');
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  // Show logged in state
  if (isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <div className="bg-muted/30 p-8 rounded-xl border border-border shadow-lg">
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h2>
              <p className="text-muted-foreground">
                {returnUrl 
                  ? 'You can now access your requested page' 
                  : 'You are successfully signed in'
                }
              </p>
            </div>
            
            <div className="space-y-3">
              {returnUrl ? (
                <Link
                  href={returnUrl}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-lg font-medium transition-colors inline-block text-center"
                >
                  Continue to {returnUrl.includes('catalogue') ? 'Catalogue' : 'Your Page'}
                </Link>
              ) : (
                <Link
                  href="/catalogue"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-lg font-medium transition-colors inline-block text-center"
                >
                  Access Catalogue
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full border border-border text-foreground hover:bg-muted py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form
  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      <div className="bg-muted/30 p-8 rounded-xl border border-border shadow-lg">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {loginRequired ? 'Sign In Required' : 'Get Started'}
            </h2>
            <p className="text-muted-foreground">
              {loginRequired 
                ? 'You need to sign in to access this feature' 
                : 'Create your account or sign in'
              }
            </p>
          </div>

          {loginRequired && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-primary font-medium text-sm">Protected Content</p>
                  <p className="text-primary/80 text-xs">Sign in to access your {returnUrl.includes('catalogue') ? 'product catalogue' : 'account'} and unlock all features.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={`border rounded-lg p-3 ${
              error === 'Wrong credentials' 
                ? 'bg-transparent border-red-500' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <p className={`text-sm text-center ${
                error === 'Wrong credentials' 
                  ? 'text-red-500' 
                  : 'text-destructive font-medium'
              }`}>
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                required
                disabled={isLoading}
              />
            </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

            <button 
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>


          {loginRequired && (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border border-border">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">New to Billora?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Join thousands of businesses streamlining their workflow with AI-powered invoice and contract management.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Free trial
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    AI-powered
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Easy setup
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}
