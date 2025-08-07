import { NextRequest, NextResponse } from 'next/server';
import { createSuperadminKey } from '@/app/actions/auth';

export async function POST(request: NextRequest) {
  try {
    // In production, add additional security checks here
    // For example, IP whitelist, additional authentication, etc.
    
    const body = await request.json();
    const { masterKey } = body;
    
    // Verify master key (you should set this in environment variables)
    const expectedMasterKey = process.env.SUPERADMIN_MASTER_KEY || 'master_key_change_in_production';
    
    if (masterKey !== expectedMasterKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const superadminKey = await createSuperadminKey();
    
    return NextResponse.json({
      key: superadminKey,
      expiresIn: '24 hours',
      usage: 'Add as x-superadmin-key header or superadmin_key query parameter'
    });
    
  } catch (error) {
    console.error('Error generating superadmin key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}