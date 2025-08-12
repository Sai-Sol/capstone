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
  
  // RESTORED: MegaETH testnet API rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Window', '60');
    response.headers.set('X-MegaETH-Network', 'testnet');
  }
  
  return response;
}

export const config = {
  matcher: [
    // RESTORED: MegaETH testnet API routes
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};