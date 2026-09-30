import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db/databaseService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, requestType, customMessage, guestName } = body;

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, error: 'tableNumber is required' },
        { status: 400 }
      );
    }

    const ping = {
      id: `ping-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tableNumber: String(tableNumber),
      type: (requestType || 'CALL_WAITER') as 'CALL_WAITER' | 'REQUEST_BILL' | 'WATER' | 'CLEANING' | 'CUSTOM',
      message: customMessage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING' as const,
      guestName: guestName || 'Guest',
    };

    await dbService.recordServicePing(ping);

    return NextResponse.json(
      { success: true, ping },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create service ping';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { pingId, resolvedBy } = body;

    if (!pingId) {
      return NextResponse.json(
        { success: false, error: 'pingId is required' },
        { status: 400 }
      );
    }

    await dbService.resolveServicePing(pingId, resolvedBy || 'Staff Captain');

    return NextResponse.json({
      success: true,
      pingId,
      resolved: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resolve ping';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
