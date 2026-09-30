import { beforeEach, describe, expect, it } from 'vitest';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useSharedBridge, getTableBillBreakdown } from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

/**
 * Integration test: one table's whole journey across the four portals, using the
 * real stores exactly as the screens do.
 *   customer orders -> kitchen cooks -> waiter serves -> customer pays -> waiter vacates
 */
const bridge = () => useSharedBridge.getState();
const cust = () => useCustomerStore.getState();
const table = (n: string) => bridge().tables.find((t) => t.number === n)!;
const [biryani, mutton] = INITIAL_MENU_ITEMS;

beforeEach(() => {
  bridge().resetToFreshDemoState();
  cust().resetSession();
  cust().setTableNumber('A-02'); // a vacant table in the seed data
  cust().setGuestName('Asha');
});

describe('full dine-in flow', () => {
  it('runs from order to vacated table with consistent state at every step', () => {
    // 1. Customer scans the QR, orders 2 biryanis + 1 mutton
    cust().addToCart(biryani, undefined, [], 2);
    cust().addToCart(mutton);
    cust().placeAllOrders();

    const expectedSubtotal = biryani.price * 2 + mutton.price; // 860
    expect(table('A-02').status).toBe('OCCUPIED');
    expect(table('A-02').currentBill).toBe(expectedSubtotal);

    // 2. Kitchen sees a NEW ticket for that table
    const ticket = bridge().kdsTickets.find(
      (t) => t.tableNumber === 'A-02' && t.source === 'CUSTOMER'
    )!;
    expect(ticket.status).toBe('NEW');
    expect(ticket.items).toHaveLength(2);

    // 3. Kitchen bumps every item PLACED -> PREP -> PLATED
    for (const item of ticket.items) {
      bridge().kitchenBumpItemStage(ticket.id, item.id);
      bridge().kitchenBumpItemStage(ticket.id, item.id);
    }
    const plated = bridge().kdsTickets.find((t) => t.id === ticket.id)!;
    expect(plated.status).toBe('READY');
    expect(table('A-02').activeItems?.every((i) => i.status === 'Ready')).toBe(true);

    // 4. Waiter serves the food
    bridge().waiterMarkKitchenItemServed(ticket.id);
    expect(bridge().kdsTickets.find((t) => t.id === ticket.id)!.status).toBe('COMPLETED');
    expect(table('A-02').activeItems?.every((i) => i.status === 'Served')).toBe(true);

    // 5. Customer pays by UPI from their phone
    const revenueBefore = bridge().shiftStats.totalRevenue;
    const amount = cust().payment.totalAmount;
    cust().confirmAndPay();

    expect(cust().currentScreen).toBe(8);
    expect(cust().payment.transactionId).toMatch(/^#TXN-\d{6}$/);
    expect(table('A-02').status).toBe('BILLING');
    expect(bridge().shiftStats.totalRevenue).toBe(revenueBefore + amount);
    expect(bridge().shiftStats.tablesServed).toBe(1);
    expect(bridge().settlementRecords[0]).toMatchObject({
      tableNumber: 'A-02',
      method: 'UPI',
      amount,
    });

    // 6. Waiter vacates the table; it is clean for the next guest
    bridge().waiterVacatesTable('A-02');
    expect(table('A-02')).toMatchObject({ status: 'VACANT', currentBill: 0, guestCount: 0 });
    expect(bridge().kdsTickets.some((t) => t.tableNumber === 'A-02')).toBe(false);
  });

  it('shows an 86d item as unavailable in the shared inventory the customer reads', () => {
    bridge().kitchenToggle86(biryani.id);
    expect(bridge().inventory86.find((i) => i.id === biryani.id)!.is86).toBe(true);
  });

  it('lets a second guest order after the table is vacated', () => {
    cust().addToCart(biryani);
    cust().placeAllOrders();
    bridge().waiterVacatesTable('A-02');

    cust().resetSession();
    cust().addToCart(mutton);
    cust().placeAllOrders();

    expect(table('A-02').currentBill).toBe(mutton.price);
    expect(table('A-02').activeItems).toHaveLength(1);
  });

  it('bills a merged table as one combined bill', () => {
    cust().addToCart(biryani);
    cust().placeAllOrders();
    bridge().waiterMergeTables('A-01', 'A-02');
    const a01 = table('A-01');
    expect(a01.mergedWith).toBe('A-02');
    expect(getTableBillBreakdown(a01).foodSubtotal).toBe(590 + biryani.price);
  });
});

describe('customer bill vs waiter bill', () => {
  // The customer app charges GST as one 5% figure; the waiter/manager side splits it
  // into CGST + SGST and rounds each half separately. On some subtotals the rounding
  // makes the two totals differ by Rs.1 for the same table.
  //
  // FINDING: this documents a real inconsistency. It is marked `it.fails` so the
  // suite stays green today and will turn red (prompting you to remove `.fails`)
  // once the two calculations are aligned.
  it.fails('charges the same GST on the customer screen and the waiter bill', () => {
    const item = { ...biryani, price: 130 }; // 5% of 130 = 6.5
    cust().addToCart(item);
    cust().placeAllOrders();

    const customerTax = cust().payment.tax;
    const waiterTax = getTableBillBreakdown(table('A-02')).totalTax;
    expect(customerTax).toBe(waiterTax);
  });
});
