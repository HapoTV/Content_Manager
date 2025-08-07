import { NextRequest, NextResponse } from 'next/server';
import { validateSuperadminAccess } from '@/app/actions/auth';
import { getAllProfiles } from '@/app/actions/profiles';

export async function GET(request: NextRequest) {
  try {
    const superadminKey = request.headers.get('x-superadmin-key') || 
                         request.nextUrl.searchParams.get('superadmin_key');
    
    if (!superadminKey || !await validateSuperadminAccess(superadminKey)) {
      return NextResponse.json(
        { error: 'Invalid or expired superadmin key' },
        { status: 401 }
      );
    }
    
    try {
      const profiles = await getAllProfiles();
    
    return NextResponse.json({
      message: 'Superadmin access granted',
      data: profiles,
      timestamp: new Date().toISOString()
    });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Superadmin access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const superadminKey = request.headers.get('x-superadmin-key') || 
                         request.nextUrl.searchParams.get('superadmin_key');
    
    if (!superadminKey || !(await validateSuperadminAccess(superadminKey))) {
      return NextResponse.json(
        { error: 'Invalid or expired superadmin key' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action, userId, newRole } = body;

    switch (action) {
      case 'updateRole':
        try {
          const { updateProfile } = await import('@/app/actions/profiles');
          await updateProfile(userId, { role: newRole });
        
        return NextResponse.json({
          message: 'Role updated successfully',
          userId,
          newRole
        });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to update role' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Superadmin action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}