import { beforeEach, describe, expect, it } from 'vitest';
import { useSharedBridge } from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

const get = () => useSharedBridge.getState();
const table = (n: string) => get().tables.find((t) => t.number === n)!;

beforeEach(() => {
  get().resetToFreshDemoState();
});

describe('customerPlacesOrder', () => {
  it('creates a NEW customer ticket and bills the table', () => {
    const menu = INITIAL_MENU_ITEMS[0];
    const ticketsBefore = get().kdsTickets.length;

    get().customerPlacesOrder('A-02', 'Asha', 3, [
      { item: menu, quantity: 2, selectedOption: 'Regular', addOns: [] },
    ] as never);

    expect(get().kdsTickets).toHaveLength(ticketsBefore + 1);
    const ticket = get().kdsTickets.at(-1)!;
    expect(ticket.status).toBe('NEW');
    expect(ticket.source).toBe('CUSTOMER');
    expect(ticket.items[0].stage).toBe('PLACED');

    const t = table('A-02');
    expect(t.status).toBe('OCCUPIED');
    expect(t.guestCount).toBe(3);
    expect(t.currentBill).toBe(menu.price * 2);
  });

  it('matches tables by digits when the number is formatted differently', () => {
    const menu = INITIAL_MENU_ITEMS[0];
    get().customerPlacesOrder('A02', 'Asha', 1, [
      { item: menu, quantity: 1, selectedOption: 'Regular', addOns: [] },
    ] as never);
    expect(table('A-02').status).toBe('OCCUPIED');
  });
});

describe('kitchenBumpItemStage', () => {
  it('advances an item PLACED -> PREP and marks the ticket PREP', () => {
    get().kitchenBumpItemStage('KDS-103', 'ki-5');
    const tk = get().kdsTickets.find((t) => t.id === 'KDS-103')!;
    expect(tk.items.find((i) => i.id === 'ki-5')!.stage).toBe('PREP');
    expect(tk.status).toBe('PREP');
  });

  it('marks the ticket READY once every item is plated', () => {
    // KDS-102 items start in PREP; bump both to PLATED
    get().kitchenBumpItemStage('KDS-102', 'ki-3');
    get().kitchenBumpItemStage('KDS-102', 'ki-4');
    expect(get().kdsTickets.find((t) => t.id === 'KDS-102')!.status).toBe('READY');
  });

  it('marks the ticket COMPLETED once every item is served, and never overshoots', () => {
    for (let i = 0; i < 6; i++) {
      get().kitchenBumpItemStage('KDS-101', 'ki-1');
      get().kitchenBumpItemStage('KDS-101', 'ki-2');
    }
    const tk = get().kdsTickets.find((t) => t.id === 'KDS-101')!;
    expect(tk.items.every((i) => i.stage === 'SERVED')).toBe(true);
    expect(tk.status).toBe('COMPLETED');
  });

  it('is a no-op for unknown tickets', () => {
    const before = get().kdsTickets;
    get().kitchenBumpItemStage('KDS-999', 'nope');
    expect(get().kdsTickets).toEqual(before);
  });
});

describe('86 inventory', () => {
  it('toggles is86 on and off', () => {
    const id = INITIAL_MENU_ITEMS[0].id;
    get().kitchenToggle86(id);
    expect(get().inventory86.find((i) => i.id === id)!.is86).toBe(true);
    get().kitchenToggle86(id);
    expect(get().inventory86.find((i) => i.id === id)!.is86).toBe(false);
  });

  it('never lets prep delay go below zero', () => {
    const id = INITIAL_MENU_ITEMS[0].id;
    get().kitchenUpdatePrepDelay(id, 10);
    get().kitchenUpdatePrepDelay(id, -25);
    expect(get().inventory86.find((i) => i.id === id)!.prepDelayMinutes).toBe(0);
  });
});

describe('table merge / unmerge', () => {
  it('merges the source into the target and combines bills', () => {
    const menu = INITIAL_MENU_ITEMS[0];
    get().customerPlacesOrder('A-02', 'Asha', 2, [
      { item: menu, quantity: 1, selectedOption: 'Regular', addOns: [] },
    ] as never);
    const a01Bill = table('A-01').currentBill;

    get().waiterMergeTables('A-01', 'A-02');

    expect(table('A-01').mergedWith).toBe('A-02');
    expect(table('A-02').mergedWith).toBe('A-01');
    expect(table('A-01').currentBill).toBe(a01Bill + menu.price);
    expect(table('A-02').currentBill).toBe(0);
  });

  it('ignores merges involving unknown tables', () => {
    const before = get().tables;
    get().waiterMergeTables('A-01', 'Z-99');
    expect(get().tables).toEqual(before);
  });
});

describe('payment and vacate', () => {
  it('records a cash settlement and updates shift stats', () => {
    get().waiterRecordsPayment('A-01', 'CASH', 590, 40, 'Captain Ramesh');
    const s = get().shiftStats;
    expect(s.totalRevenue).toBe(590);
    expect(s.cashRevenue).toBe(590);
    expect(s.tipsEarned).toBe(40);
    expect(s.tablesServed).toBe(1);
    expect(get().settlementRecords[0]).toMatchObject({
      tableNumber: 'A-01',
      method: 'CASH',
      amount: 590,
    });
    expect(table('A-01').status).toBe('BILLING');
  });

  it('does not count UPI toward cash revenue', () => {
    get().waiterRecordsPayment('A-01', 'UPI', 500, 0, 'Captain Ramesh');
    expect(get().shiftStats.cashRevenue).toBe(0);
    expect(get().shiftStats.totalRevenue).toBe(500);
    expect(get().settlementRecords[0].method).toBe('UPI');
  });

  it('vacating clears the table and its completed tickets', () => {
    get().waiterVacatesTable('A-04');
    const t = table('A-04');
    expect(t).toMatchObject({ status: 'VACANT', currentBill: 0, guestCount: 0, kotCount: 0 });
    expect(t.activeItems).toEqual([]);
  });

  it('ignores invalid petty-cash expenses', () => {
    get().recordCashExpense(-5);
    get().recordCashExpense(NaN);
    get().recordCashExpense(0);
    expect(get().shiftStats.cashExpenses).toBe(0);
    get().recordCashExpense(120);
    expect(get().shiftStats.cashExpenses).toBe(120);
  });
});

describe('resetToFreshDemoState', () => {
  it('clears persisted state and restores seed data', () => {
    get().waiterRecordsPayment('A-01', 'CASH', 100, 0, 'Captain Ramesh');
    get().resetToFreshDemoState();
    expect(get().shiftStats.totalRevenue).toBe(0);
    expect(get().tables.length).toBeGreaterThanOrEqual(10);
    // the store re-persists on every change, so storage must now hold the fresh state
    const persisted = JSON.parse(localStorage.getItem('thoogudeepa_bridge_v2') ?? '{}');
    expect(persisted.shiftStats?.totalRevenue).toBe(0);
  });
});
