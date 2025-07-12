// src/app/api/admin/user-factors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { UserFactorModel, PricingFactorModel } from '@/lib/pricing-models';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const usersWithFactors = await UserFactorModel.getAllUsersWithFactors();
    return NextResponse.json(usersWithFactors);
  } catch (error) {
    console.error('Error fetching user factors:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, factorId } = await request.json();

    if (!userId || !factorId) {
      return NextResponse.json(
        { message: 'User ID and Factor ID are required' },
        { status: 400 }
      );
    }

    await PricingFactorModel.assignToUser(userId, factorId, sessionData.id);

    return NextResponse.json({ 
      message: 'Factor assigned successfully' 
    });
  } catch (error) {
    console.error('Error assigning factor to user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    await UserFactorModel.removeFromUser(userId);

    return NextResponse.json({ 
      message: 'Factor assignment removed successfully' 
    });
  } catch (error) {
    console.error('Error removing factor assignment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}