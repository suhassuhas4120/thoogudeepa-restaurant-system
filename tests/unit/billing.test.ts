import { describe, expect, it } from 'vitest';
import {
  calculateTableBill,
  getItemPriceByName,
  getTableBillBreakdown,
  type SharedTable,
} from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

const baseTable: SharedTable = {
  id: 't-x',
  number: 'X-01',
  section: 'SECTION A',
  capacity: 4,
  status: 'OCCUPIED',
  guestCount: 2,
  seatedTime: '12:00 PM',
  currentBill: 0,
  serverName: 'Captain Ramesh',
  kotCount: 1,
};

describe('getItemPriceByName', () => {
  it('finds a menu item by exact name (case/space-insensitive)', () => {
    const item = INITIAL_MENU_ITEMS[0];
    expect(getItemPriceByName(`  ${item.name.toUpperCase()} `)).toBe(item.price);
  });

  it('falls back to the default price for unknown items', () => {
    expect(getItemPriceByName('Definitely Not On The Menu')).toBe(240);
  });
});

describe('calculateTableBill', () => {
  it('returns 0 for empty or missing items', () => {
    expect(calculateTableBill(undefined)).toBe(0);
    expect(calculateTableBill([])).toBe(0);
  });

  it('uses the explicit price when present', () => {
    expect(
      calculateTableBill([{ name: 'Anything', quantity: 3, price: 100, status: 'Placed' }])
    ).toBe(300);
  });

  it('looks up the menu price when price is missing', () => {
    const item = INITIAL_MENU_ITEMS[0];
    expect(calculateTableBill([{ name: item.name, quantity: 2, status: 'Placed' }])).toBe(
      item.price * 2
    );
  });
});

describe('getTableBillBreakdown', () => {
  it('returns an all-zero breakdown for a missing table', () => {
    const b = getTableBillBreakdown(null);
    expect(b.grandTotal).toBe(0);
    expect(b.items).toEqual([]);
  });

  it('applies 2.5% CGST + 2.5% SGST on the subtotal', () => {
    const table: SharedTable = {
      ...baseTable,
      activeItems: [{ name: 'Item', quantity: 2, price: 200, status: 'Placed' }],
    };
    const b = getTableBillBreakdown(table);
    expect(b.foodSubtotal).toBe(400);
    expect(b.cgst).toBe(10);
    expect(b.sgst).toBe(10);
    expect(b.totalTax).toBe(20);
    expect(b.grandTotal).toBe(420);
    expect(b.itemCount).toBe(2);
  });

  it('adds tip to the grand total, ignores negative tips', () => {
    const table: SharedTable = {
      ...baseTable,
      activeItems: [{ name: 'Item', quantity: 1, price: 200, status: 'Placed' }],
    };
    expect(getTableBillBreakdown(table, 50).grandTotal).toBe(200 + 10 + 50);
    expect(getTableBillBreakdown(table, -50).tip).toBe(0);
  });

  it('does not apply a tip when there is nothing to bill', () => {
    expect(getTableBillBreakdown({ ...baseTable, activeItems: [] }, 100).tip).toBe(0);
  });

  it('falls back to currentBill when there are no line items', () => {
    const b = getTableBillBreakdown({ ...baseTable, currentBill: 1000, activeItems: [] });
    expect(b.foodSubtotal).toBe(1000);
    expect(b.grandTotal).toBe(1050);
  });
});
