import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // API rate limiting headers
  if (request.nextUrl.pathname.startsWith('/api/grok')) {
    response.headers.set('X-RateLimit-Limit', '20');
    response.headers.set('X-RateLimit-Window', '60');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/grok/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};