// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { destroySession, verifyToken, logActivity } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      // Get user info for logging
      const user = verifyToken(token);
      
      if (user) {
        // Get client info
        const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // If multiple IPs, use the first
        request.headers.get('x-real-ip') ||
        'unknown';

        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Log logout activity
        await logActivity(
          user.id,
          'LOGOUT',
          'AUTH',
          ipAddress,
          userAgent
        );
      }

      // Destroy session in database
      await destroySession(token);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}