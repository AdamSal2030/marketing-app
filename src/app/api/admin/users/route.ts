// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify session and check if user is admin

    // Fetch all users (exclude password_hash)
    const result = await db.query(`
      SELECT 
        id, 
        email, 
        role, 
        first_name, 
        last_name, 
        is_active, 
        created_at, 
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}