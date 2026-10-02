import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffToken } from './lib/auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect sensitive manager-only API routes
  if (pathname.startsWith('/api/audit')) {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyStaffToken(token);
    if (!payload || (payload.role !== 'MANAGER' && payload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Manager privileges required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/audit/:path*'],
};
