import { NextRequest, NextResponse } from 'next/server';
import { UserModel, InvitationModel } from '@/lib/models';
import { createSession, logActivity } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password, firstName, lastName } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify invitation token
    const invitation = await InvitationModel.findByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { message: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(invitation.email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user account
    const newUser = await UserModel.create({
      email: invitation.email,
      password: password,
      role: 'user',
      first_name: firstName,
      last_name: lastName
    });

    // Mark invitation as used
    await InvitationModel.markAsUsed(invitation.id);

    // Get client info
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create session
    const authToken = await createSession(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      },
      ipAddress,
      userAgent
    );

    // Log account creation
    await logActivity(
      newUser.id,
      'ACCOUNT_CREATED',
      'AUTH',
      ipAddress,
      userAgent
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });

    // Set auth cookie
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}