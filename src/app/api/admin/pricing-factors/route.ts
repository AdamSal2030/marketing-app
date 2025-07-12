// src/app/api/admin/pricing-factors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { PricingFactorModel } from '@/lib/pricing-models';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const factors = await PricingFactorModel.getAll();
    return NextResponse.json(factors);
  } catch (error) {
    console.error('Error fetching pricing factors:', error);
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

    const { name, description, rules } = await request.json();

    if (!name || !rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { message: 'Invalid data: name and rules are required' },
        { status: 400 }
      );
    }

    const factor = await PricingFactorModel.create({
      name,
      description,
      created_by: sessionData.id,
      rules
    });

    return NextResponse.json(factor, { status: 201 });
  } catch (error) {
    console.error('Error creating pricing factor:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}