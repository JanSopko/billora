import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

// Protected routes that require authentication
const protectedRoutes = ['/catalogue', '/invoices'];

// Check if user has bearer token
function isAuthenticated(request: NextRequest): boolean {
  const bearerToken = request.cookies.get('bearer');
  return !!bearerToken?.value;
}

// Check if the route is protected
function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix to check the base path
  const pathWithoutLocale = pathname.replace(/^\/(sk|en)/, '');
  return protectedRoutes.some(route => pathWithoutLocale.startsWith(route));
}

// Function to get user's preferred locale from cookies/headers
function getPreferredLocale(request: NextRequest): string {
  // Check for saved locale preference in cookies (set by language selector)
  const preferredLocale = request.cookies.get('preferredLocale');
  if (preferredLocale && ['en', 'sk'].includes(preferredLocale.value)) {
    return preferredLocale.value;
  }
  
  // Check Next.js locale cookie as fallback
  const nextLocale = request.cookies.get('NEXT_LOCALE');
  if (nextLocale && ['en', 'sk'].includes(nextLocale.value)) {
    return nextLocale.value;
  }
  
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    if (acceptLanguage.includes('sk')) return 'sk';
    if (acceptLanguage.includes('en')) return 'en';
  }
  
  // Default to English
  return 'en';
}

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Check if pathname has locale prefix
  const hasLocale = /^\/(sk|en)/.test(pathname);
  
  // If no locale prefix, redirect to localized version
  if (!hasLocale && pathname !== '/') {
    const preferredLocale = getPreferredLocale(request);
    const localizedUrl = new URL(`/${preferredLocale}${pathname}${search}`, request.url);
    return NextResponse.redirect(localizedUrl);
  }
  
  // Check if this is a protected route
  if (isProtectedRoute(pathname)) {
    // Check authentication
    if (!isAuthenticated(request)) {
      // Extract locale from pathname
      const localeMatch = pathname.match(/^\/(sk|en)/);
      const locale = localeMatch ? localeMatch[1] : getPreferredLocale(request);
      
      // Redirect to home page with login prompt and return URL
      const homeUrl = new URL(`/${locale}`, request.url);
      homeUrl.searchParams.set('login', 'required');
      homeUrl.searchParams.set('returnUrl', pathname);
      
      return NextResponse.redirect(homeUrl);
    }
  }
  
  // Continue with internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match internationalized pathnames and non-localized paths that need redirection
  matcher: [
    '/',
    '/(sk|en)/:path*',
    // Match common paths without locale that should be redirected
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)' 
  ]
};
