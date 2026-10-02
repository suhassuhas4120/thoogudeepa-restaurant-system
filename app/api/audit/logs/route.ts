import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffToken } from '@/lib/auth/jwt';

// In-memory persistent audit journal (or Postgres if configured)
interface AuditLogEntry {
  id: string;
  timestamp: string;
  staffName: string;
  role: string;
  actionType: string;
  tableNumber?: string;
  details: string;
  ipAddress?: string;
}

const auditJournal: AuditLogEntry[] = [
  {
    id: 'audit-init',
    timestamp: new Date().toISOString(),
    staffName: 'System',
    role: 'SYSTEM',
    actionType: 'SYSTEM_BOOT',
    details: 'Audit journal initialized with anti-theft tracking.',
  },
];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const user = token ? await verifyStaffToken(token) : null;

    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Audit trail requires Manager privileges' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: auditJournal.slice(-100).reverse(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve audit logs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { staffName, role, actionType, tableNumber, details } = body;

    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      staffName: staffName || 'Staff Member',
      role: role || 'STAFF',
      actionType: actionType || 'GENERAL_ACTION',
      tableNumber: tableNumber || undefined,
      details: details || '',
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    };

    auditJournal.push(entry);

    return NextResponse.json({ success: true, log: entry }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record audit log';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
