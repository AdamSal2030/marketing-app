import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  
  console.log(`🔍 [MIDDLEWARE] ${pathname} - Token: ${token ? 'EXISTS' : 'NONE'}`);
  
  // Allow API routes
  if (pathname.startsWith('/api/')) {
    console.log(`✅ [MIDDLEWARE] Allowing API: ${pathname}`);
    return NextResponse.next();
  }
  
  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.png'
  ) {
    console.log(`✅ [MIDDLEWARE] Allowing static: ${pathname}`);
    return NextResponse.next();
  }
  
  // Handle login page
  if (pathname === '/login') {
    console.log(`📝 [MIDDLEWARE] Login page accessed`);
    return NextResponse.next();
  }
  
  // Protect dashboard (root and all other pages)
  console.log(`🔒 [MIDDLEWARE] Protecting: ${pathname}`);
  
  if (!token) {
    console.log(`🔄 [MIDDLEWARE] No token, redirecting to login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Simple token validation
  try {
    if (token.length < 10) {
      throw new Error('Invalid token format');
    }
    
    console.log(`✅ [MIDDLEWARE] Token valid, allowing access to: ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.log(`❌ [MIDDLEWARE] Token invalid, redirecting to login`);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API routes, static files, and images
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};