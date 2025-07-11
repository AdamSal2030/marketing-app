// src/app/api/admin/users/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession, logActivity } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify session and check if user is admin
    const sessionData = await verifySession(request);
    if (!sessionData) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (sessionData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, isActive } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Check if target user exists and is not an admin
    const userResult = await db.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const targetUser = userResult.rows[0];

    // Prevent admins from restricting other admins
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { message: 'Cannot modify admin accounts' },
        { status: 403 }
      );
    }

    // Prevent self-restriction
    if (targetUser.id === sessionData.id) {
      return NextResponse.json(
        { message: 'Cannot modify your own account' },
        { status: 403 }
      );
    }

    // Update user status
    await db.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, userId]
    );

    // Get client info for logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log the action - sessionData is guaranteed to exist here due to early return above
    try {
      await logActivity(
        sessionData.id,                                    // TypeScript now knows this is not null
        isActive ? 'USER_ACTIVATED' : 'USER_RESTRICTED',   
        `USER:${userId}`,                                   
        ipAddress,                                          
        userAgent                                           
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the whole request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'restricted'} successfully`
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}