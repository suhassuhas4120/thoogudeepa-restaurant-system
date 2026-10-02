import { NextRequest, NextResponse } from 'next/server';
import { validateAndCalculateBill } from '@/lib/validation/billingValidator';
import { dbService } from '@/lib/db/databaseService';
import { verifyStaffToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, serverName, breakdown, paymentMode, discountAmount, tipAmount, managerAuthPin } = body;

    // Optional check: if discount is higher than 100, require manager verification
    if (discountAmount && discountAmount > 100) {
      const token = req.cookies.get('auth-token')?.value;
      const user = token ? await verifyStaffToken(token) : null;
      const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN' || managerAuthPin === '9999';

      if (!isManager) {
        return NextResponse.json(
          { success: false, errors: ['High discounts (> ₹100) require Manager PIN authorization'] },
          { status: 403 }
        );
      }
    }

    const validation = validateAndCalculateBill({
      tableNumber,
      serverName,
      breakdown,
      paymentMode,
      discountAmount,
      tipAmount,
    });

    if (!validation.isValid || !validation.invoiceRecord) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Persist tax invoice
    await dbService.persistInvoice(validation.invoiceRecord);

    return NextResponse.json({
      success: true,
      invoice: validation.invoiceRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Billing settlement failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
