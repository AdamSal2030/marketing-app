import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { UserModel, SessionModel, ActivityLogModel } from './models';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
  first_name?: string;
  last_name?: string;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      first_name: decoded.first_name,
      last_name: decoded.last_name
    };
  } catch (error) {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(
  user: AuthUser,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateToken(user);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await SessionModel.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent
  });

  return token;
}

export async function validateSession(token: string): Promise<AuthUser | null> {
  try {
    const user = verifyToken(token);
    if (!user) return null;

    const tokenHash = hashToken(token);
    const session = await SessionModel.findByTokenHash(tokenHash);
    
    if (!session) return null;

    // Update session last used
    await SessionModel.updateLastUsed(session.id);

    return user;
  } catch (error) {
    return null;
  }
}

export async function verifySession(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    // Validate the session
    return await validateSession(token);
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function destroySession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await SessionModel.deleteByTokenHash(tokenHash);
}

export async function logActivity(
  userId: number,
  action: string,
  resource: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await ActivityLogModel.log({
    user_id: userId,
    action,
    resource,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}