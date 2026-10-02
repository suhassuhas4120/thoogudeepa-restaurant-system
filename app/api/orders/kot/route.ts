import { NextRequest, NextResponse } from 'next/server';
import { validateAndCreateKOTTicket } from '@/lib/validation/kotValidator';
import { dbService } from '@/lib/db/databaseService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, serverName, items, inventory86, source } = body;

    const validation = validateAndCreateKOTTicket({
      tableNumber,
      serverName,
      items: items || [],
      inventory86: inventory86 || [],
      source: source || 'WAITER',
    });

    if (!validation.isValid || !validation.sanitizedTicket) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Persist ticket
    await dbService.persistKOTTicket(validation.sanitizedTicket);

    return NextResponse.json(
      {
        success: true,
        ticket: validation.sanitizedTicket,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fire KOT ticket';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
