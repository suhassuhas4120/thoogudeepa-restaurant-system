import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db/databaseService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishId, is86, prepDelayMinutes } = body;

    if (!dishId) {
      return NextResponse.json(
        { success: false, error: 'dishId is required' },
        { status: 400 }
      );
    }

    await dbService.setInventory86(dishId, Boolean(is86), Number(prepDelayMinutes || 0));

    return NextResponse.json({
      success: true,
      dishId,
      is86: Boolean(is86),
      prepDelayMinutes: Number(prepDelayMinutes || 0),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Inventory 86 update failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
