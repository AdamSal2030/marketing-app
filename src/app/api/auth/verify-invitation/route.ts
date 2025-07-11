import { NextRequest, NextResponse } from 'next/server';
import { InvitationModel } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    const invitation = await InvitationModel.findByToken(token);
    
    if (!invitation) {
      return NextResponse.json(
        { message: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: invitation.email
    });

  } catch (error) {
    console.error('Invitation verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}