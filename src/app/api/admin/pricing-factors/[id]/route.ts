// src/app/api/admin/pricing-factors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { PricingFactorModel } from '@/lib/pricing-models';

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const factor = await PricingFactorModel.getById(parseInt(params.id));
    if (!factor) {
      return NextResponse.json({ message: 'Factor not found' }, { status: 404 });
    }

    return NextResponse.json(factor);
  } catch (error) {
    console.error('Error fetching pricing factor:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, rules } = await request.json();
    const factorId = parseInt(params.id);

    if (!name || !rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { message: 'Invalid data: name and rules are required' },
        { status: 400 }
      );
    }

    await PricingFactorModel.update(factorId, { name, description, rules });

    return NextResponse.json({ message: 'Factor updated successfully' });
  } catch (error) {
    console.error('Error updating pricing factor:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const sessionData = await verifySession(request);
    if (!sessionData || sessionData.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const factorId = parseInt(params.id);
    
    if (factorId === 1) {
      return NextResponse.json(
        { message: 'Cannot delete default pricing factor' },
        { status: 400 }
      );
    }

    await PricingFactorModel.delete(factorId);

    return NextResponse.json({ message: 'Factor deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing factor:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}