import { NextRequest, NextResponse } from 'next/server';
import { validateTableStateTransition, TableStatus } from '@/lib/validation/tableValidator';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentStatus, targetStatus, currentBill } = body;

    const transition = validateTableStateTransition(
      currentStatus as TableStatus,
      targetStatus as TableStatus,
      Number(currentBill || 0)
    );

    if (!transition.allowed) {
      return NextResponse.json(
        { success: false, reason: transition.reason },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      allowed: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Table state transition failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
