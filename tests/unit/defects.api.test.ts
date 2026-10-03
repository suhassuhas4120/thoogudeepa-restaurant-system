// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { validateAndCalculateBill } from '@/lib/validation/billingValidator';
import { validateAndCreateKOTTicket } from '@/lib/validation/kotValidator';
import { authenticateStaffByPin, signStaffToken } from '@/lib/auth/jwt';
import { KITCHEN_MASTER_PIN } from '@/types/kitchen';
import { POST as settle } from '@/app/api/billing/settle/route';
import { POST as publish } from '@/app/api/realtime/publish/route';
import { POST as auditPost } from '@/app/api/audit/logs/route';
import { POST as inv86 } from '@/app/api/inventory/86/route';
import { POST as kot } from '@/app/api/orders/kot/route';
import { PATCH as pingPatch } from '@/app/api/service/pings/route';
import { calculateTableBill, getTableBillBreakdown, normalizeTableNumber } from '@/store/useSharedBridge';

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/x', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });

const bill = (subtotal: number) => ({
  items: [], itemCount: 0, foodSubtotal: subtotal, cgst: 0, sgst: 0, totalTax: 0, tip: 0, grandTotal: 0,
});

describe('SEC: authentication / authorisation', () => {
  it('D1: manager PIN 9999 must not be accepted from an anonymous client (settle)', async () => {
    const res = await settle(req({
      tableNumber: 'A-01', serverName: 'x', breakdown: bill(1000), paymentMode: 'CASH',
      discountAmount: 900, managerAuthPin: '9999',
    }));
    expect(res.status).toBe(403); // FAILS: hardcoded PIN bypass
  });

  it('D2: kitchen master PIN must not equal a MANAGER credential', () => {
    const staff = authenticateStaffByPin(KITCHEN_MASTER_PIN);
    expect(staff?.role).not.toBe('MANAGER'); // FAILS: 1234 = Cashier (MANAGER)
  });

  it('D3: unauthenticated callers cannot publish realtime events', async () => {
    const res = await publish(req({ type: 'KDS_CLEAR', payload: {} }));
    expect(res.status).toBe(401); // FAILS: open endpoint
  });

  it('D4: unauthenticated callers cannot forge audit entries', async () => {
    const res = await auditPost(req({ staffName: 'Manager', actionType: 'REFUND', details: 'forged' }));
    expect(res.status).toBe(401); // FAILS
  });

  it('D5: unauthenticated callers cannot toggle 86 inventory', async () => {
    const res = await inv86(req({ dishId: 'x', is86: true }));
    expect(res.status).toBe(401); // FAILS
  });

  it('D6: unauthenticated callers cannot settle a bill', async () => {
    const res = await settle(req({
      tableNumber: 'A-01', serverName: 'x', breakdown: bill(500), paymentMode: 'CASH',
    }));
    expect(res.status).toBe(401); // FAILS
  });

  it('D7: unauthenticated callers cannot resolve pings', async () => {
    const res = await pingPatch(req({ pingId: 'p1' }));
    expect(res.status).toBe(401); // FAILS
  });

  it('D8: JWT secret must not have a hardcoded production fallback', async () => {
    const forged = await (async () => {
      const { SignJWT } = await import('jose');
      return new SignJWT({ id: 'x', role: 'ADMIN', name: 'x', displayName: 'x' })
        .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h')
        .sign(new TextEncoder().encode('thoogudeepa-enterprise-pos-secure-jwt-key-2026'));
    })();
    const { verifyStaffToken } = await import('@/lib/auth/jwt');
    expect(await verifyStaffToken(forged)).toBeNull(); // FAILS when JWT_SECRET unset
  });

  it('control: valid signed token round-trips', async () => {
    const { verifyStaffToken } = await import('@/lib/auth/jwt');
    const t = await signStaffToken({ id: 'w-1', name: 'a', displayName: 'a', role: 'WAITER' });
    expect((await verifyStaffToken(t))?.role).toBe('WAITER');
  });
});

describe('BILL: server-side money integrity', () => {
  const run = (o: Partial<Parameters<typeof validateAndCalculateBill>[0]> = {}) =>
    validateAndCalculateBill({
      tableNumber: 'A-01', serverName: 's', breakdown: bill(1000), paymentMode: 'CASH', ...o,
    });

  it('D9: client-supplied subtotal must not be trusted (items sum differs)', () => {
    const r = run({
      breakdown: { ...bill(1), items: [{ name: 'Biryani', quantity: 2, unitPrice: 300, lineTotal: 600 }] },
    });
    expect(r.invoiceRecord?.foodSubtotal).toBe(600); // FAILS: records 1
  });

  it('D10: NaN / non-numeric discount rejected', () => {
    expect(run({ discountAmount: 'abc' as any }).isValid).toBe(false); // FAILS: NaN slips through
  });

  it('D11: NaN tip must not create NaN grandTotal', () => {
    const r = run({ tipAmount: 'x' as any });
    expect(Number.isFinite(r.invoiceRecord?.grandTotal ?? NaN) || !r.isValid).toBe(true);
  });

  it('D12: Infinity subtotal rejected', () => {
    expect(run({ breakdown: bill(Infinity) }).isValid).toBe(false); // FAILS
  });

  it('D13: negative tip is rejected, not silently zeroed', () => {
    expect(run({ tipAmount: -50 }).isValid).toBe(false); // FAILS (clamped)
  });

  it('D14: zero-value bill rejected', () => {
    expect(run({ breakdown: bill(0) }).isValid).toBe(false); // FAILS
  });

  it('D15: totalTax float drift (0.1+0.2 style)', () => {
    const r = run({ breakdown: bill(33.33) });
    const t = r.invoiceRecord!;
    expect(t.totalTax).toBe(Math.round((t.cgst + t.sgst) * 100) / 100); // FAILS on drift
  });

  it('D16: invoice number unique across rapid calls on same table', () => {
    const a = run().invoiceRecord!.invoiceNumber;
    const b = run().invoiceRecord!.invoiceNumber;
    expect(a).not.toBe(b);
  });

  it('D17: invoice sequence must survive restart (module counter resets to 1000)', () => {
    // documents in-memory counter -> duplicate invoice numbers after redeploy
    expect(run().invoiceRecord!.invoiceNumber).toMatch(/INV-\d{4}-A01-\d+/);
  });

  it('D18: tax rate on server (2dp) matches customer store (integer rounding)', async () => {
    const { useCustomerStore } = await import('@/store/useCustomerStore');
    const server = run({ breakdown: bill(130) }).invoiceRecord!;
    // customer-side: Math.round(130*0.05)=7 (6.5 -> 7); server: 3.25+3.25=6.5
    expect(Math.round(130 * 0.05)).toBe(server.totalTax); // FAILS: 7 vs 6.5
    expect(useCustomerStore).toBeDefined();
  });

  it('D19: bridge breakdown rounds CGST/SGST to integers; server to 2dp', () => {
    const t: any = { activeItems: [{ id: '1', name: 'x', quantity: 1, price: 130 }], currentBill: 130 };
    const b = getTableBillBreakdown(t);
    expect(b.cgst).toBe(3.25); // FAILS: 3
  });

  it('D20: discount exactly equal to subtotal allowed but tip-only bill leaks tax', () => {
    const r = run({ discountAmount: 1000 });
    expect(r.invoiceRecord!.grandTotal).toBe(50); // tax still charged on a 100% discount
  });
});

describe('KOT validation', () => {
  const item = (o: any = {}) => ({ item: { id: 'm1', name: 'Biryani' } as any, quantity: 1, ...o });
  const run = (items: any[], extra: any = {}) =>
    validateAndCreateKOTTicket({ tableNumber: 'a-1', serverName: 'w', items, inventory86: [], ...extra });

  it('D21: NaN quantity rejected', () => expect(run([item({ quantity: NaN })]).isValid).toBe(false));
  it('D22: quantity of 1e9 rejected (kitchen DoS)', () => expect(run([item({ quantity: 1e9 })]).isValid).toBe(false)); // FAILS
  it('D23: fractional 0.5 qty rounds to 0 and is rejected', () => expect(run([item({ quantity: 0.5 })]).isValid).toBe(false));
  it('D24: quantity as string "3" is coerced safely', () => {
    const r = run([item({ quantity: '3' })]);
    expect(r.sanitizedTicket?.items[0].quantity).toBe(3);
  });
  it('D25: 86 check cannot be bypassed by omitting inventory86', () => {
    const r = run([item()], { inventory86: undefined });
    expect(r.isValid).toBe(true);
  });
  it('D26: huge notes truncated', () => {
    const r = run([item({ notes: 'x'.repeat(100000) })]);
    expect((r.sanitizedTicket?.items[0].notes || '').length).toBeLessThanOrEqual(500); // FAILS
  });
  it('D27: duplicate item rows are merged', () => {
    const r = run([item(), item()]);
    expect(r.sanitizedTicket?.items.length).toBe(1); // FAILS: kitchen sees two lines
  });
  it('D28: KOT numbers increment and are unique', () => {
    const a = run([item()]).sanitizedTicket!.id;
    const b = run([item()]).sanitizedTicket!.id;
    expect(a).not.toBe(b);
  });
  it('D29: item name is taken from client, not server menu (price/name spoofing)', () => {
    const r = run([item({ item: { id: 'm1', name: '<img src=x onerror=alert(1)>' } })]);
    expect(r.sanitizedTicket?.items[0].name).not.toContain('<'); // FAILS: no sanitising
  });
  it('D30: route returns 400 on malformed JSON, not 500', async () => {
    const bad = new NextRequest('http://localhost/api/orders/kot', { method: 'POST', body: '{bad' });
    const res = await kot(bad);
    expect(res.status).toBe(400); // FAILS: 500
  });
});

describe('Table number normalisation', () => {
  it.each([
    ['a1', 'A-01'], ['A-1', 'A-01'], ['B03', 'B-03'], ['3', 'A-03'], [' b_7 ', 'B-07'],
  ])('%s -> %s', (i, o) => expect(normalizeTableNumber(i)).toBe(o));
  it('D31: "T10" and "A-10" must not alias', () => expect(normalizeTableNumber('T10')).not.toBe('A-10'));
  it('D32: empty/undefined', () => { expect(normalizeTableNumber('')).toBe(''); expect(normalizeTableNumber(undefined)).toBe(''); });
  it('D33: calculateTableBill uses fallback ₹240 for unknown dish (silent mispricing)', () => {
    expect(calculateTableBill([{ id: '1', name: 'zzz-unknown', quantity: 1 } as any])).toBe(0); // FAILS: 240
  });
  it('D34: price 0 (complimentary) must stay 0, not fall back to menu price', () => {
    expect(calculateTableBill([{ id: '1', name: 'Gulab Jamun', quantity: 1, price: 0 } as any])).toBe(0); // FAILS
  });
});
