import { describe, it, expect, beforeEach } from 'vitest';
import { useSharedBridge, mergeBridgeState, freshTables } from '@/store/useSharedBridge';

const reset = () => useSharedBridge.getState().resetToFreshDemoState();
const tbl = (n: string) => useSharedBridge.getState().tables.find((t) => t.number === n)!;

describe('Bridge store: money & lifecycle', () => {
  beforeEach(reset);

  it('D35: vacating a table with an unpaid bill must be refused', () => {
    const num = freshTables[0].number;
    useSharedBridge.setState((s) => ({
      tables: s.tables.map((t) => (t.number === num ? { ...t, status: 'OCCUPIED', currentBill: 900 } : t)),
    }));
    useSharedBridge.getState().waiterVacatesTable(num);
    expect(tbl(num).currentBill).toBe(900); // FAILS: validator only console.warn()s
  });

  it('D36: double-submitting payment must not double-count revenue', () => {
    const num = freshTables[0].number;
    const st = useSharedBridge.getState();
    st.waiterRecordsPayment(num, 'CASH', 500, 0, 'Ramesh');
    st.waiterRecordsPayment(num, 'CASH', 500, 0, 'Ramesh');
    expect(useSharedBridge.getState().shiftStats.totalRevenue).toBe(500); // FAILS: 1000
  });

  it('D37: payment amount is trusted from caller, not table bill', () => {
    const num = freshTables[0].number;
    useSharedBridge.getState().waiterRecordsPayment(num, 'CASH', -250, 0, 'Ramesh');
    expect(useSharedBridge.getState().shiftStats.totalRevenue).toBeGreaterThanOrEqual(0); // FAILS: negative revenue
  });

  it('D38: NaN amount must not poison shift totals', () => {
    const num = freshTables[0].number;
    useSharedBridge.getState().waiterRecordsPayment(num, 'CASH', NaN, 0, 'Ramesh');
    expect(Number.isFinite(useSharedBridge.getState().shiftStats.totalRevenue)).toBe(true); // FAILS
  });

  it('D39: paying a table must not mark it VACANT/BILLING-stuck: status after payment', () => {
    const num = freshTables[0].number;
    useSharedBridge.getState().waiterRecordsPayment(num, 'CASH', 500, 0, 'Ramesh');
    expect(tbl(num).status).not.toBe('BILLING'); // FAILS: stays BILLING after being paid
  });

  it('D40: settling a vacant seat must not create a ₹0 settlement record', () => {
    const t = freshTables.find((x) => x.seats && x.seats.length)!;
    const before = useSharedBridge.getState().settlementRecords.length;
    useSharedBridge.getState().seatSettlesBill(t.number, 1, 'CASH');
    expect(useSharedBridge.getState().settlementRecords.length).toBe(before); // FAILS
  });

  it('D41: two seat settlements in the same millisecond get distinct record ids', () => {
    const t = freshTables.find((x) => x.seats && x.seats.length > 1)!;
    const real = Date.now;
    Date.now = () => 1700000000000;
    try {
      useSharedBridge.getState().seatSettlesBill(t.number, 1, 'CASH');
      useSharedBridge.getState().seatSettlesBill(t.number, 2, 'CASH');
    } finally { Date.now = real; }
    const ids = useSharedBridge.getState().settlementRecords.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length); // FAILS: id = set-seat-${Date.now()}
  });

  it('D42: unknown paymentMode on seat settle is rejected', () => {
    const t = freshTables.find((x) => x.seats && x.seats.length)!;
    useSharedBridge.getState().seatSettlesBill(t.number, 1, 'BITCOIN' as any);
    const last = useSharedBridge.getState().settlementRecords[0];
    expect(last?.method).not.toBe('BITCOIN'); // FAILS (or no record)
  });
});

describe('mergeBridgeState (CRDT-style sync)', () => {
  beforeEach(reset);

  it('D43: a settled (VACANT) seat must not be resurrected by a stale OCCUPIED broadcast', () => {
    const t = freshTables.find((x) => x.seats && x.seats.length)!;
    const cur = useSharedBridge.getState();
    const staleSeats = t.seats!.map((s, i) =>
      i === 0 ? { ...s, status: 'OCCUPIED' as const, currentBill: 400, items: [{ id: 'i1', name: 'Biryani', quantity: 1, price: 400 }] } : s);
    const out = mergeBridgeState(cur, { tables: [{ ...t, seats: staleSeats }] as any });
    const merged = out.tables!.find((x) => x.number === t.number)!;
    expect(merged.seats![0].status).toBe('VACANT'); // FAILS: occupied always wins -> ghost bill
  });

  it('D44: ticket timestamps sort chronologically across 12h boundary', () => {
    const base = useSharedBridge.getState();
    const mk = (id: string, ts: string) => ({ id, tableNumber: 'A-01', serverName: 's', timestamp: ts, elapsedMinutes: 0, status: 'NEW', items: [], source: 'WAITER' });
    const out = mergeBridgeState({ ...base, kdsTickets: [] } as any, {
      kdsTickets: [mk('a', '09:05 AM'), mk('b', '11:50 PM'), mk('c', '12:10 AM')] as any,
    });
    expect(out.kdsTickets!.map((t) => t.id)).toEqual(['b', 'a', 'c']); // FAILS: lexical string sort
  });

  it('D45: ticket status never regresses (COMPLETED not overwritten by stale NEW)', () => {
    const base = useSharedBridge.getState();
    const t = { id: 'k1', tableNumber: 'A-01', serverName: 's', timestamp: '10:00', elapsedMinutes: 0, items: [], source: 'WAITER' };
    const out = mergeBridgeState({ ...base, kdsTickets: [{ ...t, status: 'COMPLETED' }] } as any, { kdsTickets: [{ ...t, status: 'NEW' }] as any });
    expect(out.kdsTickets![0].status).toBe('COMPLETED');
  });

  it('D46: item-level stage regression: stale item PLACED overwrites SERVED when ticket rank equal', () => {
    const base = useSharedBridge.getState();
    const mk = (stage: string) => ({ id: 'k2', tableNumber: 'A-01', serverName: 's', timestamp: '10:00', elapsedMinutes: 0, status: 'PREP', source: 'WAITER', items: [{ id: 'x', name: 'n', quantity: 1, prepMode: 'S', stage }] });
    const out = mergeBridgeState({ ...base, kdsTickets: [mk('SERVED')] } as any, { kdsTickets: [mk('PLACED')] as any });
    expect(out.kdsTickets![0].items[0].stage).toBe('SERVED'); // FAILS: incoming wins on tie
  });

  it('D47: 86 flag cleared on one device is reverted by merge (can never un-86)', () => {
    const base = useSharedBridge.getState();
    const id = base.inventory86[0].id;
    const cur = { ...base, inventory86: base.inventory86.map((i) => (i.id === id ? { ...i, is86: true } : i)) };
    const out = mergeBridgeState(cur as any, { inventory86: [{ ...base.inventory86[0], is86: false }] as any });
    expect(out.inventory86!.find((i) => i.id === id)!.is86).toBe(false); // FAILS: sticky true
  });

  it('D48: settled ping can be re-opened by a late PENDING copy', () => {
    const base = useSharedBridge.getState();
    const p = { id: 'p1', tableNumber: 'A-01', type: 'CALL_WAITER', timestamp: '10:00', guestName: 'g' };
    const out = mergeBridgeState({ ...base, pings: [{ ...p, status: 'RESOLVED' }] } as any, { pings: [{ ...p, status: 'PENDING' }] as any });
    expect(out.pings!.find((x) => x.id === 'p1')!.status).toBe('RESOLVED');
  });

  it('D49: merge does not mutate current state', () => {
    const base = useSharedBridge.getState();
    const snap = JSON.stringify(base.tables);
    mergeBridgeState(base, { tables: base.tables });
    expect(JSON.stringify(useSharedBridge.getState().tables)).toBe(snap);
  });
});
