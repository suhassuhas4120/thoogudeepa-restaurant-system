import { NextRequest, NextResponse } from 'next/server';
import { eventHub } from '@/lib/realtime/eventHub';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Event type is required' },
        { status: 400 }
      );
    }

    eventHub.emitPortalEvent(type, payload);

    return NextResponse.json({
      success: true,
      broadcasted: true,
      type,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Broadcast failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
