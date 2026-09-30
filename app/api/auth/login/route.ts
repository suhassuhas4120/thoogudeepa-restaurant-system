import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffByPin, signStaffToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, role, portal } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }

    const staff = authenticateStaffByPin(pin.trim(), portal || role);
    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN or unauthorized role for this terminal' },
        { status: 401 }
      );
    }

    const token = await signStaffToken(staff);

    const response = NextResponse.json({
      success: true,
      user: staff,
    });

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
