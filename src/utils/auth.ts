// Authentication utilities

/**
 * Set the bearer token in cookies
 */
export function setBearerToken(token: string, expiryDays: number = 7): void {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  
  document.cookie = `bearer=${token}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
}

/**
 * Get the bearer token from cookies
 */
export function getBearerToken(): string | null {
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

/**
 * Remove the bearer token from cookies (logout)
 */
export function removeBearerToken(): void {
  document.cookie = 'bearer=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict';
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated(): boolean {
  const token = getBearerToken();
  return !!token && token.length > 0;
}

/**
 * Mock login function for demonstration
 * In a real app, this would make an API call to authenticate the user
 */
export async function mockLogin(email: string, password: string): Promise<{success: boolean, token?: string, error?: string, status?: number}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock authentication logic
  if (email === 'pedro@bernstein.sk' && password === 'bubba123') {
    const mockToken = 'mock-jwt-token-' + Date.now();
    setBearerToken(mockToken);
    
    // Trigger a custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: true } }));
    }
    
    return { success: true, token: mockToken };
  }
  
  // Return 403 Forbidden for wrong credentials
  return { 
    success: false, 
    error: 'Wrong credentials', 
    status: 403 
  };
}

/**
 * Logout function
 */
export function logout(): void {
  removeBearerToken();
  
  // Trigger a custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: false } }));
    window.location.href = '/';
  }
}
