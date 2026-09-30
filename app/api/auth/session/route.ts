import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const payload = await verifyStaffToken(token);
    if (!payload) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: payload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Session verification failed';
    return NextResponse.json(
      { authenticated: false, error: message },
      { status: 500 }
    );
  }
}
