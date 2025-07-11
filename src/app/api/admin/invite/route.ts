import { NextRequest, NextResponse } from 'next/server';
import { UserModel, InvitationModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { sendInvitationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await InvitationModel.findByEmail(email);
    if (existingInvitation) {
      return NextResponse.json({ message: 'Invitation already sent to this email' }, { status: 400 });
    }

    // Generate secure invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create invitation record
    await InvitationModel.create({
      email,
      token: invitationToken,
      expires_at: expiresAt,
      created_by: user.id
    });

    // Send invitation email
    await sendInvitationEmail(email, invitationToken, user.email);

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}