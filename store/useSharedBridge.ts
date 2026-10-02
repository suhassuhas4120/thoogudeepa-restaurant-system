'use client';

/**
 * useSharedBridge.ts
 * ──────────────────────────────────────────────────────────────────────
 * The SINGLE source of truth for cross-section real-time state.
 * Customer → Kitchen → Waiter all read and write from here.
 *
 * Flow:
 *  Customer places order → creates a KDS ticket + waiter table bill entry
 *  Customer pings waiter → creates a ping in waiter pings list
 *  Waiter fires KOT      → creates a KDS ticket in kitchen
 *  Kitchen bumps stage   → waiter kitchenReadyItems updates
 *  Kitchen marks 86      → customer menu item grays out (is86 flag)
 *  Waiter vacates table  → clears table in shared tables
 *  Waiter settles bill   → records settlement & updates shift performance
 */

import { create } from 'zustand';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { MenuItem, OrderStage } from '../types/customer';
import { validateAndCreateKOTTicket } from '../lib/validation/kotValidator';
import { validateAndCalculateBill } from '../lib/validation/billingValidator';
import { validateTableStateTransition } from '../lib/validation/tableValidator';
import { TableSeat, SeatItem, createDefaultSeats, aggregateTableFromSeats } from '../lib/validation/seatValidator';
import { dbService } from '../lib/db/databaseService';
import { clearSeatSession } from '../lib/session/seatSessionManager';
import { supabase } from '../lib/db/supabaseClient';

export interface WaiterProfile {
  id: string;
  name: string;
  displayName: string;
  pin: string;
  section: string;
}

export const SAVED_WAITERS: WaiterProfile[] = [
  { id: 'w-1', name: 'Waiter 1', displayName: 'Waiter 1 (Ramesh)', pin: '1111', section: 'SECTION A' },
  { id: 'w-2', name: 'Waiter 2', displayName: 'Waiter 2 (Suresh)', pin: '2222', section: 'SECTION B' },
  { id: 'w-3', name: 'Waiter 3', displayName: 'Waiter 3 (Vijay)', pin: '3333', section: 'TERRACE' },
  { id: 'w-4', name: 'Waiter 4', displayName: 'Waiter 4 (Kiran)', pin: '4444', section: 'FAMILY DINING' },
];

/* ── Shared Types ──────────────────────────────────────────────── */

export interface SharedKDSItem {
  id: string;
  name: string;
  quantity: number;
  stage: OrderStage;
  prepMode: string;
  options?: string;
  addOns?: string[];
  notes?: string;
}

export interface SharedKDSTicket {
  id: string;
  tableNumber: string;
  serverName: string;
  timestamp: string;
  elapsedMinutes: number;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  items: SharedKDSItem[];
  source?: 'CUSTOMER' | 'WAITER';
}

export interface SharedActiveItem {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
  status: string;
  originalTable?: string;
}

export interface SharedTable {
  id: string;
  number: string;
  section: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  guestCount: number;
  seatedTime: string;
  currentBill: number;
  serverName: string;
  kotCount: number;
  kotNotes?: string;
  mergedWith?: string;
  activeItems?: SharedActiveItem[];
  seats?: TableSeat[];
}

export const normalizeTableNumber = (raw?: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim().toUpperCase();
  // Match section prefix (e.g., A, B, C, D) and table number (e.g. B3, B03, B-3, B-03 -> B-03)
  const match = trimmed.match(/^([A-Z]+)\s*[-_]?\s*(\d+)$/);
  if (match) {
    const section = match[1];
    const num = parseInt(match[2], 10);
    return `${section}-${String(num).padStart(2, '0')}`;
  }
  // Standalone digits e.g. "3" or "03" -> default to A-03
  const numOnly = trimmed.match(/^\d+$/);
  if (numOnly) {
    return `A-${trimmed.padStart(2, '0')}`;
  }
  return trimmed;
};

export const matchTable = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  return normalizeTableNumber(a) === normalizeTableNumber(b);
};

export const getItemPriceByName = (name: string): number => {
  const clean = name.toLowerCase().trim();
  const found = INITIAL_MENU_ITEMS.find((m) =>
    m.name.toLowerCase().trim() === clean ||
    clean.includes(m.name.toLowerCase().trim()) ||
    m.name.toLowerCase().trim().includes(clean)
  );
  return found ? found.price : 240;
};

export const calculateTableBill = (items?: SharedActiveItem[]): number => {
  if (!items || items.length === 0) return 0;
  return items.reduce(
    (sum, item) => sum + (item.price || getItemPriceByName(item.name)) * item.quantity,
    0
  );
};

export interface BillLineItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status?: string;
}

export interface TableBillBreakdown {
  items: BillLineItem[];
  itemCount: number;
  foodSubtotal: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  tip: number;
  grandTotal: number;
}

export const getTableBillBreakdown = (
  table?: SharedTable | null,
  tip: number = 0
): TableBillBreakdown => {
  if (!table) {
    return {
      items: [],
      itemCount: 0,
      foodSubtotal: 0,
      cgst: 0,
      sgst: 0,
      totalTax: 0,
      tip: 0,
      grandTotal: 0,
    };
  }

  const rawItems = table.activeItems && table.activeItems.length > 0 ? table.activeItems : [];
  const items: BillLineItem[] = rawItems.map((item) => {
    const unitPrice = item.price || getItemPriceByName(item.name);
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: item.quantity * unitPrice,
      status: item.status,
    };
  });

  const foodSubtotal =
    items.length > 0
      ? items.reduce((sum, it) => sum + it.lineTotal, 0)
      : (table.currentBill || 0);

  const cgst = Math.round(foodSubtotal * 0.025);
  const sgst = Math.round(foodSubtotal * 0.025);
  const totalTax = cgst + sgst;
  const appliedTip = foodSubtotal > 0 ? Math.max(0, tip) : 0;
  const grandTotal = foodSubtotal + totalTax + appliedTip;
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return {
    items,
    itemCount,
    foodSubtotal,
    cgst,
    sgst,
    totalTax,
    tip: appliedTip,
    grandTotal,
  };
};

export interface SharedPing {
  id: string;
  tableNumber: string;
  type: string;
  message?: string;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  guestName: string;
}

export interface SharedMenuItem86 {
  id: string;
  name: string;
  category: string;
  is86: boolean;
  prepDelayMinutes: number;
}

export interface SharedShiftStats {
  tablesServed: number;
  totalRevenue: number;
  cashRevenue: number;
  discounts: number;
  taxCollected: number;
  cashExpenses: number;
  tipsEarned: number;
  avgTurnaroundMinutes: number;
}

export interface SharedSettlementRecord {
  id: string;
  tableNumber: string;
  section: string;
  serverName: string;
  amount: number;
  tip: number;
  method: 'CASH' | 'UPI' | 'CARD' | 'POS';
  timestamp: string;
}

export interface SharedWaiterAlert {
  id: string;
  tableNumber: string;
  reason: string;
  timestamp: number;
}
export type WaiterAlert = SharedWaiterAlert;

export interface WaiterShiftPerformance {
  waiterId: string;
  waiterName: string;
  displayName: string;
  section: string;
  tablesServed: number;
  completedSettlementsCount: number;
  totalRevenue: number;
  cashCollected: number;
  digitalCollected: number;
  tipsEarned: number;
  avgTurnaroundMinutes: number;
  recentSettlements: SharedSettlementRecord[];
  activeTables: SharedTable[];
}

export const resolveWaiterProfile = (nameOrId?: string): WaiterProfile => {
  if (!nameOrId) return SAVED_WAITERS[0];
  const clean = nameOrId.toLowerCase().trim();
  const found = SAVED_WAITERS.find(
    (w) =>
      w.name.toLowerCase() === clean ||
      w.displayName.toLowerCase() === clean ||
      w.id.toLowerCase() === clean ||
      clean.includes(w.name.toLowerCase()) ||
      w.name.toLowerCase().includes(clean) ||
      clean.includes(w.section.toLowerCase()) ||
      (clean.includes('ramesh') && w.id === 'w-1') ||
      (clean.includes('suresh') && w.id === 'w-2') ||
      (clean.includes('vijay') && w.id === 'w-3') ||
      (clean.includes('kiran') && w.id === 'w-4')
  );
  return found || SAVED_WAITERS[0];
};

export const freshSettlementRecords: SharedSettlementRecord[] = [];

export const getWaiterShiftPerformance = (
  waiterIdentifier: string,
  state: { settlementRecords?: SharedSettlementRecord[]; tables?: SharedTable[] }
): WaiterShiftPerformance => {
  const profile = resolveWaiterProfile(waiterIdentifier);
  const allRecords =
    state.settlementRecords && state.settlementRecords.length > 0
      ? state.settlementRecords
      : freshSettlementRecords;
  const allTables = state.tables && state.tables.length > 0 ? state.tables : freshTables;

  // Filter records matching this waiter
  const waiterRecords = allRecords.filter((rec) => {
    const recProfile = resolveWaiterProfile(rec.serverName);
    return recProfile.id === profile.id || rec.section.toUpperCase() === profile.section.toUpperCase();
  });

  // Filter tables in waiter's assigned section
  const waiterTables = allTables.filter((t) => {
    return t.section.toUpperCase() === profile.section.toUpperCase();
  });

  const totalRevenue = waiterRecords.reduce((sum, r) => sum + r.amount, 0);
  const cashCollected = waiterRecords
    .filter((r) => r.method === 'CASH')
    .reduce((sum, r) => sum + r.amount, 0);
  const digitalCollected = waiterRecords
    .filter((r) => r.method !== 'CASH')
    .reduce((sum, r) => sum + r.amount, 0);
  const tipsEarned = waiterRecords.reduce((sum, r) => sum + (r.tip || 0), 0);

  const activeDiningCount = waiterTables.filter(
    (t) => t.status === 'OCCUPIED' || t.status === 'BILLING'
  ).length;
  const tablesServed = waiterRecords.length + activeDiningCount;

  const benchmarkTurnaround: Record<string, number> = {
    'w-1': 34,
    'w-2': 38,
    'w-3': 32,
    'w-4': 42,
  };
  const avgTurnaroundMinutes = benchmarkTurnaround[profile.id] || 36;

  return {
    waiterId: profile.id,
    waiterName: profile.name,
    displayName: profile.displayName,
    section: profile.section,
    tablesServed,
    completedSettlementsCount: waiterRecords.length,
    totalRevenue,
    cashCollected,
    digitalCollected,
    tipsEarned,
    avgTurnaroundMinutes,
    recentSettlements: waiterRecords,
    activeTables: waiterTables,
  };
};

/* ── Initial Data (All 10 Real Tables from Floor QR Matrix) ───── */
export const freshTables: SharedTable[] = [
  // 2-Seat Tables (Section A)
  { id: 't-1', number: 'A-01', section: 'SECTION A', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0, activeItems: [] },
  { id: 't-2', number: 'A-02', section: 'SECTION A', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0, activeItems: [] },
  // 3-Seat Tables (Section B)
  { id: 't-3', number: 'B-01', section: 'SECTION B', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0, activeItems: [] },
  { id: 't-4', number: 'B-02', section: 'SECTION B', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0, activeItems: [] },
  { id: 't-5', number: 'B-03', section: 'SECTION B', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0, activeItems: [] },
  // 4-Seat Tables (Section C)
  { id: 't-6', number: 'C-01', section: 'SECTION C', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Vijay', kotCount: 0, activeItems: [] },
  { id: 't-7', number: 'C-02', section: 'SECTION C', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Vijay', kotCount: 0, activeItems: [] },
  { id: 't-8', number: 'C-03', section: 'SECTION C', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Vijay', kotCount: 0, activeItems: [] },
  // 6-Seat Tables (Section D)
  { id: 't-9', number: 'D-01', section: 'SECTION D', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Kiran', kotCount: 0, activeItems: [] },
  { id: 't-10', number: 'D-02', section: 'SECTION D', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Kiran', kotCount: 0, activeItems: [] },
];

// Initialize physical seats cleanly for all 10 tables
freshTables.forEach((t) => {
  if (!t.seats || t.seats.length === 0) {
    t.seats = createDefaultSeats(t.capacity);
  }
});

const freshKdsTickets: SharedKDSTicket[] = [];

const freshPings: SharedPing[] = [];

const freshInventory86: SharedMenuItem86[] = INITIAL_MENU_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  is86: false,
  prepDelayMinutes: 0,
}));

let ticketCounter = 10;
const makeTicketId = () =>
  `KDS-${String(100 + ticketCounter++).padStart(3, '0')}`;
const nowTime = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

/* ── Store Interface ────────────────────────────────────────────── */

interface SharedBridgeState {
  // Shared cross-section state
  tables: SharedTable[];
  kdsTickets: SharedKDSTicket[];
  pings: SharedPing[];
  inventory86: SharedMenuItem86[];
  shiftStats: SharedShiftStats;
  settlementRecords: SharedSettlementRecord[];
  waiterAlerts: WaiterAlert[];

  // ── Customer actions ────────────────────────────────────────────
  customerPlacesOrder: (
    tableNumber: string,
    guestName: string,
    guestCount: number,
    items: Array<{
      item: MenuItem;
      selectedOption: string;
      addOns: string[];
      quantity: number;
    }>
  ) => void;

  customerPlacesSeatOrder: (
    tableNumber: string,
    seatNumber: number,
    guestName: string,
    items: Array<{
      item: MenuItem;
      quantity: number;
      selectedOption?: string;
      notes?: string;
    }>
  ) => void;

  seatSettlesBill: (
    tableNumber: string,
    seatNumber: number,
    paymentMode?: 'UPI' | 'CASH' | 'POS' | 'SPLIT'
  ) => void;

  customerPingsWaiter: (
    tableNumber: string,
    type: string,
    guestName: string,
    msg?: string
  ) => void;

  // ── Kitchen actions ─────────────────────────────────────────────
  kitchenBumpItemStage: (ticketId: string, itemId: string) => void;
  kitchenSetItemStage: (
    ticketId: string,
    itemId: string,
    stage: OrderStage
  ) => void;
  kitchenSetBulkItemStage: (itemName: string, stage: OrderStage) => void;
  kitchenBumpTable: (ticketId: string) => void;
  kitchenToggle86: (itemId: string) => void;
  kitchenUpdatePrepDelay: (itemId: string, deltaMinutes: number) => void;
  kitchenAddTicket: (ticket: SharedKDSTicket) => void;
  kitchenClearCompleted: () => void;

  // Kitchen can call waiter to pass
  callFloorWaiter: (tableNumber: string, reason?: string) => void;

  // ── Waiter actions ──────────────────────────────────────────────
  waiterFiresKOT: (
    tableNumber: string,
    captainName: string,
    items: Array<{
      item: MenuItem;
      selectedOption: string;
      quantity: number;
    }>
  ) => void;

  waiterSeatsGuests: (
    tableNumber: string,
    guestCount: number,
    captainName: string
  ) => void;

  waiterSeatsTable: (tableNumber: string, guests?: number) => void;

  waiterMergeTables: (targetTable: string, sourceTable: string) => void;
  waiterUnmergeTable: (tableNumber: string) => void;
  waiterResolvePing: (pingId: string) => void;
  waiterRecordsPayment: (
    tableNumber: string,
    method: string,
    amount: number,
    tipOrTendered?: number,
    serverNameOrDiscount?: string | number,
    taxAmount?: number
  ) => boolean;
  recordCashExpense: (amount: number) => void;
  waiterVacatesTable: (tableNumber: string) => void;

  /** Waiter marks a kitchen-ready item as served → removes from waiter feed + updates table item status */
  waiterMarkKitchenItemServed: (ticketId: string, itemId?: string) => void;

  /** Waiter marks all ready food for a table as served */
  waiterMarkTableFoodServed: (tableNumber: string) => void;

  // Acknowledge / clear waiter alerts
  acknowledgeWaiterAlert: (alertId: string) => void;
  clearWaiterAlerts: () => void;

  // ── Reset ───────────────────────────────────────────────────────
  resetToFreshDemoState: () => void;
}

/* ── Store Implementation ───────────────────────────────────────── */

export const useSharedBridge = create<SharedBridgeState>((set, get) => ({
  tables: freshTables,
  kdsTickets: freshKdsTickets,
  pings: freshPings,
  inventory86: freshInventory86,
  settlementRecords: freshSettlementRecords,
  shiftStats: {
    tablesServed: 0,
    totalRevenue: 0,
    cashRevenue: 0,
    discounts: 0,
    taxCollected: 0,
    cashExpenses: 0,
    tipsEarned: 0,
    avgTurnaroundMinutes: 38,
  },
  waiterAlerts: [],

  /* ─── Customer Places Order ──────────────────────────────────── */
  customerPlacesOrder: (tableNumber, guestName, guestCount, items) => {
    const cleanNum = (tableNumber || '').replace(/\D/g, '');

    const validation = validateAndCreateKOTTicket({
      tableNumber,
      serverName: guestName || 'Dine-in Guest',
      items,
      inventory86: get().inventory86,
      source: 'CUSTOMER',
    });

    const ticket: SharedKDSTicket = validation.sanitizedTicket || {
      id: makeTicketId(),
      tableNumber,
      serverName: guestName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'CUSTOMER',
      items: items.map((i, idx) => ({
        id: `ki-c-${Date.now()}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
        addOns: i.addOns,
      })),
    };

    // Asynchronous background persistence to database
    dbService.persistKOTTicket(ticket).catch(() => {});

    const newItems: SharedActiveItem[] = items.map((i) => ({
      name: i.item.name,
      quantity: i.quantity,
      price: i.item.price,
      status: 'Received',
    }));
    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      tables: state.tables.map((t) => {
        if (!matchTable(t.number, tableNumber)) return t;
        const updatedItems: SharedActiveItem[] = [...(t.activeItems || []), ...newItems];
        return {
          ...t,
          status: 'OCCUPIED',
          guestCount: guestCount || t.guestCount || 1,
          seatedTime: t.seatedTime === '--' ? nowTime() : t.seatedTime,
          kotCount: t.kotCount + 1,
          activeItems: updatedItems,
          currentBill: calculateTableBill(updatedItems),
        };
      }),
    }));
  },

  /* ─── Customer Places Seat Order (Seat-Specific Pod) ─────────── */
  customerPlacesSeatOrder: (tableNumber, seatNumber, guestName, items) => {
    const normTarget = normalizeTableNumber(tableNumber);
    const state = get();
    const targetTable = state.tables.find(
      (t) => matchTable(t.number, normTarget)
    );
    if (!targetTable) {
      console.warn(`[customerPlacesSeatOrder] Target table ${tableNumber} (${normTarget}) not found!`);
      return;
    }

    const seats = targetTable.seats && targetTable.seats.length > 0
      ? [...targetTable.seats]
      : createDefaultSeats(targetTable.capacity);

    let seatIdx = seats.findIndex((s) => s.seatNumber === seatNumber);
    if (seatIdx === -1) {
      while (seats.length < seatNumber) {
        seats.push({
          seatNumber: seats.length + 1,
          status: 'VACANT',
          currentBill: 0,
          items: [],
        });
      }
      seatIdx = seatNumber - 1;
    }

    let addedBill = 0;
    const mappedItems: SeatItem[] = items.map((it, idx) => {
      const price = it.item.price || getItemPriceByName(it.item.name);
      const lineTotal = price * it.quantity;
      addedBill += lineTotal;
      return {
        id: `seat-${seatNumber}-it-${Date.now()}-${idx}`,
        name: it.item.name,
        quantity: it.quantity,
        price,
        notes: it.notes || it.selectedOption,
        stage: 'Pending',
      };
    });

    const targetSeat = { ...seats[seatIdx] };
    targetSeat.status = 'OCCUPIED';
    targetSeat.currentBill = Math.round((targetSeat.currentBill + addedBill) * 100) / 100;
    targetSeat.guestName = guestName || targetSeat.guestName || `Seat ${seatNumber}`;
    targetSeat.items = [...targetSeat.items, ...mappedItems];
    seats[seatIdx] = targetSeat;

    const agg = aggregateTableFromSeats(seats);
    const updatedTable: SharedTable = {
      ...targetTable,
      seats,
      currentBill: agg.totalBill,
      status: agg.tableStatus,
      guestCount: Math.max(targetTable.guestCount, agg.occupiedSeats),
      kotCount: targetTable.kotCount + 1,
      seatedTime: targetTable.seatedTime === '--' ? nowTime() : targetTable.seatedTime,
      activeItems: [
        ...(targetTable.activeItems || []),
        ...mappedItems.map((m) => ({
          id: m.id,
          name: `${m.name} [Seat ${seatNumber}]`,
          quantity: m.quantity,
          price: m.price,
          status: 'Received',
        })),
      ],
    };

    const newKdsTicket: SharedKDSTicket = {
      id: `KDS-${targetTable.number}-S${seatNumber}-${Date.now()}`,
      tableNumber: targetTable.number,
      serverName: guestName || `Seat ${seatNumber}`,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'CUSTOMER',
      items: mappedItems.map((m) => ({
        id: m.id,
        name: `${m.name} [Seat ${seatNumber}]`,
        quantity: m.quantity,
        stage: 'PLACED' as OrderStage,
        prepMode: 'Direct Wok',
        options: m.notes,
      })),
    };

    set({
      tables: state.tables.map((t) => (t.id === targetTable.id ? updatedTable : t)),
      kdsTickets: [newKdsTicket, ...state.kdsTickets],
    });

    dbService.updateTableState(targetTable.number, updatedTable.status, updatedTable.currentBill, updatedTable.guestCount);
    dbService.persistSeatOrder({
      tableNumber: targetTable.number,
      seatNumber,
      items: mappedItems,
      total: addedBill,
    });
  },

  /* ─── Seat Settles Bill (Individual Chair Settle) ────────────── */
  seatSettlesBill: (tableNumber, seatNumber, paymentMode = 'UPI') => {
    const normTarget = normalizeTableNumber(tableNumber);
    const state = get();
    const targetTable = state.tables.find(
      (t) => matchTable(t.number, normTarget)
    );
    if (!targetTable || !targetTable.seats) return;

    const seats = [...targetTable.seats];
    const seatIdx = seats.findIndex((s) => s.seatNumber === seatNumber);
    if (seatIdx === -1) return;

    const settledSeat = { ...seats[seatIdx] };
    const paidAmount = settledSeat.currentBill;

    settledSeat.status = 'VACANT';
    settledSeat.currentBill = 0;
    settledSeat.items = [];
    settledSeat.guestName = undefined;
    settledSeat.activeOrderId = undefined;
    seats[seatIdx] = settledSeat;

    const agg = aggregateTableFromSeats(seats);
    const updatedTable: SharedTable = {
      ...targetTable,
      seats,
      currentBill: agg.totalBill,
      status: agg.tableStatus,
      guestCount: agg.occupiedSeats,
    };

    const newRecord: SharedSettlementRecord = {
      id: `set-seat-${Date.now()}`,
      tableNumber: `${targetTable.number} [Seat ${seatNumber}]`,
      section: targetTable.section,
      serverName: targetTable.serverName,
      amount: paidAmount,
      tip: 0,
      method: (paymentMode === 'SPLIT' ? 'UPI' : paymentMode) as 'CASH' | 'UPI' | 'CARD' | 'POS',
      timestamp: nowTime(),
    };

    set({
      tables: state.tables.map((t) => (t.id === targetTable.id ? updatedTable : t)),
      settlementRecords: [newRecord, ...state.settlementRecords],
      shiftStats: {
        ...state.shiftStats,
        tablesServed: state.shiftStats.tablesServed + (agg.occupiedSeats === 0 ? 1 : 0),
        totalRevenue: Math.round((state.shiftStats.totalRevenue + paidAmount) * 100) / 100,
        cashRevenue: paymentMode === 'CASH'
          ? Math.round((state.shiftStats.cashRevenue + paidAmount) * 100) / 100
          : state.shiftStats.cashRevenue,
      },
    });

    dbService.updateTableState(targetTable.number, updatedTable.status, updatedTable.currentBill, updatedTable.guestCount);
    clearSeatSession(targetTable.number, seatNumber);
  },

  /* ─── Customer Pings Waiter ──────────────────────────────────── */
  customerPingsWaiter: (tableNumber, type, guestName, msg) => {
    const currentPings = get().pings;
    const hasDuplicate = currentPings.some(
      (p) =>
        p.tableNumber === tableNumber &&
        p.type === type &&
        p.status === 'PENDING'
    );
    if (hasDuplicate) return;

    const ping: SharedPing = {
      id: 'p-' + Date.now(),
      tableNumber,
      type,
      message: msg,
      timestamp: nowTime(),
      status: 'PENDING',
      guestName,
    };
    set((state) => ({ pings: [...state.pings, ping] }));
  },

  /* ─── Kitchen Bumps Item Stage ───────────────────────────────── */
  kitchenBumpItemStage: (ticketId, itemId) => {
    const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED'];
    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) => {
          if (it.id !== itemId) return it;
          const curIdx = stageOrder.indexOf(it.stage);
          const nextStage =
            curIdx < stageOrder.length - 1
              ? stageOrder[curIdx + 1]
              : stageOrder[curIdx];
          return { ...it, stage: nextStage };
        });
        const allPlated = newItems.every(
          (i) => i.stage === 'PLATED' || i.stage === 'SERVED'
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: (allServed
            ? 'COMPLETED'
            : allPlated
            ? 'READY'
            : 'PREP') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number && tk.id === ticketId);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => {
            const ticketItem = ticket.items.find((ti) => ti.name.toLowerCase() === ai.name.toLowerCase());
            return {
              ...ai,
              price: ai.price || getItemPriceByName(ai.name),
              status: ticketItem
                ? ticketItem.stage === 'PLATED'
                  ? 'Ready'
                  : ticketItem.stage === 'PREP'
                  ? 'Preparing'
                  : ticketItem.stage === 'SERVED'
                  ? 'Served'
                  : 'Received'
                : ai.status,
            };
          }),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Sets Specific Item Stage ───────────────────────── */
  kitchenSetItemStage: (ticketId, itemId, stage) => {
    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) =>
          it.id === itemId ? { ...it, stage } : it
        );
        const allPlated = newItems.every(
          (i) => i.stage === 'PLATED' || i.stage === 'SERVED'
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: (allServed
            ? 'COMPLETED'
            : allPlated
            ? 'READY'
            : stage === 'PREP'
            ? 'PREP'
            : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number && tk.id === ticketId);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => {
            const ticketItem = ticket.items.find(
              (ti) => ti.id === itemId || ti.name.toLowerCase() === ai.name.toLowerCase()
            );
            return {
              ...ai,
              price: ai.price || getItemPriceByName(ai.name),
              status: ticketItem
                ? stage === 'PLATED'
                  ? 'Ready'
                  : stage === 'PREP'
                  ? 'Preparing'
                  : stage === 'SERVED'
                  ? 'Served'
                  : 'Received'
                : ai.status,
            };
          }),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Sets Bulk Item Stage ───────────────────────────── */
  kitchenSetBulkItemStage: (itemName, stage) => {
    set((state) => {
      const targetNameLower = itemName.toLowerCase();
      const newTickets = state.kdsTickets.map((t) => {
        let ticketHasItem = false;
        const newItems = t.items.map((it) => {
          const itemLower = it.name.toLowerCase();
          if (
            itemLower.includes(targetNameLower) ||
            targetNameLower.includes(itemLower)
          ) {
            ticketHasItem = true;
            return { ...it, stage };
          }
          return it;
        });

        if (!ticketHasItem) return t;

        const allPlated = newItems.every(
          (i) => i.stage === 'PLATED' || i.stage === 'SERVED'
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: (allServed
            ? 'COMPLETED'
            : allPlated
            ? 'READY'
            : stage === 'PREP'
            ? 'PREP'
            : 'NEW') as SharedKDSTicket['status'],
        };
      });

      const updatedTables = state.tables.map((tbl) => {
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => {
            const itemLower = ai.name.toLowerCase();
            const matches = itemLower.includes(targetNameLower) || targetNameLower.includes(itemLower);
            return {
              ...ai,
              price: ai.price || getItemPriceByName(ai.name),
              status: matches
                ? stage === 'PLATED'
                  ? 'Ready'
                  : stage === 'PREP'
                  ? 'Preparing'
                  : stage === 'SERVED'
                  ? 'Served'
                  : 'Received'
                : ai.status,
            };
          }),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Bumps Entire Table ─────────────────────────────── */
  kitchenBumpTable: (ticketId) => {
    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'READY' as const,
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' as OrderStage })),
        };
      });

      const targetTicket = newTickets.find((t) => t.id === ticketId);
      const updatedTables = targetTicket
        ? state.tables.map((tbl) => {
            if (tbl.number !== targetTicket.tableNumber) return tbl;
            return {
              ...tbl,
              activeItems: targetTicket.items.map((it) => ({
                name: it.name,
                quantity: it.quantity,
                status: 'Ready',
              })),
            };
          })
        : state.tables;

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Toggle 86 ──────────────────────────────────────── */
  kitchenToggle86: (itemId) => {
    set((state) => ({
      inventory86: state.inventory86.map((item) =>
        item.id === itemId ? { ...item, is86: !item.is86 } : item
      ),
    }));
  },

  /* ─── Kitchen Update Prep Delay ──────────────────────────────── */
  kitchenUpdatePrepDelay: (itemId, deltaMinutes) => {
    set((state) => ({
      inventory86: state.inventory86.map((item) =>
        item.id === itemId
          ? {
              ...item,
              prepDelayMinutes: Math.max(
                0,
                item.prepDelayMinutes + deltaMinutes
              ),
            }
          : item
      ),
    }));
  },

  /* ─── Kitchen Add Ticket ─────────────────────────────────────── */
  kitchenAddTicket: (ticket) => {
    set((state) => ({ kdsTickets: [...state.kdsTickets, ticket] }));
  },

  /* ─── Kitchen Clear Completed ────────────────────────────────── */
  kitchenClearCompleted: () => {
    set((state) => ({
      kdsTickets: state.kdsTickets.filter(
        (tk) => tk.status !== 'COMPLETED'
      ),
    }));
  },

  /* ─── Kitchen Calls Floor Waiter ─────────────────────────────── */
  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    const alert: SharedWaiterAlert = {
      id: `ALERT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tableNumber,
      reason,
      timestamp: Date.now(),
    };
    set((state) => ({ waiterAlerts: [...state.waiterAlerts, alert] }));
  },

  /* ─── Waiter Fires KOT ───────────────────────────────────────── */
  waiterFiresKOT: (tableNumber, captainName, items) => {
    const validation = validateAndCreateKOTTicket({
      tableNumber,
      serverName: captainName,
      items,
      inventory86: get().inventory86,
      source: 'WAITER',
    });

    const ticket: SharedKDSTicket = validation.sanitizedTicket || {
      id: makeTicketId(),
      tableNumber,
      serverName: captainName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'WAITER',
      items: items.map((i, idx) => ({
        id: `ki-w-${Date.now()}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
      })),
    };

    // Asynchronous background persistence to database
    dbService.persistKOTTicket(ticket).catch(() => {});

    const kotItems: SharedActiveItem[] = items.map((i) => ({
      name: i.item.name,
      quantity: i.quantity,
      price: i.item.price,
      status: 'Received',
    }));
    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      tables: state.tables.map((t) => {
        if (!matchTable(t.number, tableNumber)) return t;
        const newActiveItems: SharedActiveItem[] = [...(t.activeItems || []), ...kotItems];
        return {
          ...t,
          status: 'OCCUPIED',
          kotCount: t.kotCount + 1,
          activeItems: newActiveItems,
          currentBill: calculateTableBill(newActiveItems),
        };
      }),
    }));
  },

  /* ─── Waiter Seats Guests ────────────────────────────────────── */
  waiterSeatsGuests: (tableNumber, guestCount, captainName) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        matchTable(t.number, tableNumber)
          ? {
              ...t,
              status: 'OCCUPIED',
              guestCount,
              seatedTime: nowTime(),
              serverName: captainName,
            }
          : t
      ),
    }));
  },

  /* ─── Waiter Seats Table ─────────────────────────────────────── */
  waiterSeatsTable: (tableNumber, guests) => {
    set((state) => {
      const timeStr = nowTime();
      return {
        tables: state.tables.map((t) =>
          matchTable(t.number, tableNumber)
            ? {
                ...t,
                status: 'OCCUPIED' as const,
                guestCount: guests || t.capacity || 2,
                seatedTime: timeStr,
              }
            : t
        ),
      };
    });
  },

  /* ─── Waiter Merges Two Tables ───────────────────────────────── */
  waiterMergeTables: (targetTable, sourceTable) => {
    set((state) => {
      const target = state.tables.find((t) => t.number === targetTable);
      const source = state.tables.find((t) => t.number === sourceTable);
      if (!target || !source) return state;

      const targetItems = (target.activeItems || []).map((i) => ({
        ...i,
        originalTable: i.originalTable || targetTable,
      }));
      const sourceItems = (source.activeItems || []).map((i) => ({
        ...i,
        originalTable: i.originalTable || sourceTable,
      }));

      const combinedActiveItems = [...targetItems, ...sourceItems];
      const mergedBill = calculateTableBill(combinedActiveItems);
      const mergedGuests = Math.max(2, (target.guestCount || 2) + (source.guestCount || 2));
      return {
        tables: state.tables.map((t) => {
          if (t.number === targetTable) {
            return {
              ...t,
              status: 'OCCUPIED',
              currentBill: mergedBill,
              guestCount: mergedGuests,
              mergedWith: sourceTable,
              activeItems: combinedActiveItems,
            };
          }
          if (t.number === sourceTable) {
            return {
              ...t,
              status: 'OCCUPIED',
              currentBill: 0,
              guestCount: 0,
              mergedWith: targetTable,
              activeItems: [],
            };
          }
          return t;
        }),
      };
    });
  },

  /* ─── Waiter Unmerges Tables ─────────────────────────────────── */
  waiterUnmergeTable: (tableNumber) => {
    set((state) => {
      const target = state.tables.find((t) => t.number === tableNumber);
      if (!target || !target.mergedWith) return state;
      const partner = target.mergedWith;
      const partnerTable = state.tables.find((t) => t.number === partner);

      const allItems = [
        ...(target.activeItems || []),
        ...(partnerTable?.activeItems || []),
      ];

      const targetItems = allItems.filter((i) => i.originalTable !== partner);
      const partnerItems = allItems.filter((i) => i.originalTable === partner);

      return {
        tables: state.tables.map((t) => {
          if (t.number === tableNumber) {
            const items = targetItems.length > 0 ? targetItems : (target.activeItems || []);
            return {
              ...t,
              mergedWith: undefined,
              activeItems: items,
              currentBill: calculateTableBill(items),
              guestCount: Math.max(1, Math.round((t.guestCount || 4) / 2)),
            };
          }
          if (t.number === partner) {
            return {
              ...t,
              mergedWith: undefined,
              activeItems: partnerItems,
              currentBill: calculateTableBill(partnerItems),
              guestCount: Math.max(1, Math.round((target.guestCount || 4) / 2)),
            };
          }
          return t;
        }),
      };
    });
  },

  /* ─── Waiter Resolves Ping ───────────────────────────────────── */
  waiterResolvePing: (pingId) => {
    set((state) => ({
      pings: state.pings.filter((p) => p.id !== pingId),
    }));
  },

  /* ─── Waiter Records Payment ─────────────────────────────────── */
  waiterRecordsPayment: (tableNumber, method, amount, tipOrTendered = 0, serverNameOrDiscount, taxAmount = 0) => {
    const isManagerCall = typeof serverNameOrDiscount === 'number';
    const effectiveTip = isManagerCall ? 0 : (tipOrTendered || 0);
    const effectiveServer = !isManagerCall && typeof serverNameOrDiscount === 'string'
      ? serverNameOrDiscount
      : 'Captain Ramesh';
    const discount = isManagerCall ? (serverNameOrDiscount as number) : 0;
    const tax = isManagerCall ? (taxAmount || 0) : 0;

    const upperMethod = (method || 'CASH').toUpperCase();
    const cleanMethod: 'CASH' | 'UPI' | 'CARD' | 'POS' =
      upperMethod === 'CASH'
        ? 'CASH'
        : upperMethod.includes('UPI')
        ? 'UPI'
        : upperMethod.includes('CARD')
        ? 'CARD'
        : 'POS';

    set((state) => {
      const targetTbl = state.tables.find((t) => matchTable(t.number, tableNumber));
      const partner = targetTbl?.mergedWith;
      const assignedServer = effectiveServer || targetTbl?.serverName || 'Waiter 1';

      const newRecord: SharedSettlementRecord = {
        id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tableNumber,
        section: targetTbl?.section || 'SECTION A',
        serverName: assignedServer,
        amount,
        tip: effectiveTip,
        method: cleanMethod,
        timestamp: nowTime(),
      };

      const currentRecords = state.settlementRecords || freshSettlementRecords;
      const updatedRecords = [newRecord, ...currentRecords];

      // Validate and asynchronously persist invoice to database
      const targetBreakdown = getTableBillBreakdown(targetTbl);
      const billValidation = validateAndCalculateBill({
        tableNumber,
        serverName: assignedServer,
        breakdown: targetBreakdown,
        paymentMode: cleanMethod,
        discountAmount: discount,
        tipAmount: effectiveTip,
      });

      if (billValidation.invoiceRecord) {
        dbService.persistInvoice(billValidation.invoiceRecord).catch(() => {});
      }

      return {
        tables: state.tables.map((t) =>
          matchTable(t.number, tableNumber) || (partner && matchTable(t.number, partner))
            ? { ...t, status: 'BILLING' }
            : t
        ),
        settlementRecords: updatedRecords,
        shiftStats: {
          ...state.shiftStats,
          totalRevenue: state.shiftStats.totalRevenue + amount,
          cashRevenue: (state.shiftStats.cashRevenue || 0) + (cleanMethod === 'CASH' ? amount : 0),
          discounts: (state.shiftStats.discounts || 0) + discount,
          taxCollected: (state.shiftStats.taxCollected || 0) + tax,
          tablesServed: state.shiftStats.tablesServed + 1,
          tipsEarned: (state.shiftStats.tipsEarned || 0) + effectiveTip,
        },
      };
    });
    return true;
  },

  /* ─── Record Cash Expense (Petty Cash) ────────────────────────── */
  recordCashExpense: (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    set((state) => ({
      shiftStats: {
        ...state.shiftStats,
        cashExpenses: (state.shiftStats.cashExpenses || 0) + amount,
      },
    }));
  },

  /* ─── Waiter Vacates Table ───────────────────────────────────── */
  waiterVacatesTable: (tableNumber) => {
    set((state) => {
      const targetTbl = state.tables.find((t) => matchTable(t.number, tableNumber));
      if (targetTbl) {
        const transition = validateTableStateTransition(targetTbl.status, 'VACANT', targetTbl.currentBill);
        if (!transition.allowed) {
          console.warn(`[Table Vacate Notice]: ${transition.reason}`);
        }
      }
      const partner = targetTbl?.mergedWith;
      return {
        tables: state.tables.map((t) =>
          matchTable(t.number, tableNumber) || (partner && matchTable(t.number, partner))
            ? {
                ...t,
                status: 'VACANT',
                currentBill: 0,
                guestCount: 0,
                kotCount: 0,
                seatedTime: '--',
                activeItems: [],
                mergedWith: undefined,
              }
            : t
        ),
        kdsTickets: state.kdsTickets.filter(
          (tk) =>
            !(
              (matchTable(tk.tableNumber, tableNumber) ||
                (partner && matchTable(tk.tableNumber, partner))) &&
              tk.status === 'COMPLETED'
            )
        ),
      };
    });
  },

  /* ─── Waiter Marks Kitchen Item Served ───────────────────────── */
  waiterMarkKitchenItemServed: (ticketId, itemId) => {
    set((state) => {
      const targetTicket = state.kdsTickets.find((t) => t.id === ticketId);
      const ticketDishNames = targetTicket?.items.map((i) => i.name) || [];
      const tableNumber = targetTicket?.tableNumber;

      const updatedTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) =>
          !itemId || it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return { ...t, items: newItems, status: allServed ? ('COMPLETED' as const) : t.status };
      });

      const updatedTables = state.tables.map((tbl) => {
        const isMatch = tableNumber && matchTable(tbl.number, tableNumber);
        if (!isMatch) return tbl;
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((it) => {
            const matchesDish = !ticketDishNames.length || ticketDishNames.some((dn) =>
              dn.toLowerCase().trim() === it.name.toLowerCase().trim()
            );
            return matchesDish || it.status === 'Ready' || it.status === 'READY'
              ? { ...it, status: 'Served' }
              : it;
          }),
        };
      });

      return {
        kdsTickets: updatedTickets,
        tables: updatedTables,
      };
    });
  },

  /* ─── Waiter Marks Table Food Served ─────────────────────────── */
  waiterMarkTableFoodServed: (tableNumber) => {
    set((state) => {
      const updatedTickets = state.kdsTickets.map((t) => {
        const isMatch = matchTable(t.tableNumber, tableNumber);
        if (!isMatch) return t;
        const newItems = t.items.map((it) => ({
          ...it,
          stage: 'SERVED' as OrderStage,
        }));
        return {
          ...t,
          items: newItems,
          status: 'COMPLETED' as const,
        };
      });

      const updatedTables = state.tables.map((tbl) => {
        const isMatch = matchTable(tbl.number, tableNumber);
        if (!isMatch) return tbl;
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => ({
            ...ai,
            status: 'Served',
          })),
        };
      });

      return { kdsTickets: updatedTickets, tables: updatedTables };
    });
  },

  /* ✅ Waiter Acknowledges Alert (Vennela's fix) ──────────────── */
  acknowledgeWaiterAlert: (alertId) => {
    set((state) => ({
      waiterAlerts: state.waiterAlerts.filter((a) => a.id !== alertId),
    }));
  },

  /* ✅ Waiter Clears All Alerts (Vennela's fix) ───────────────── */
  clearWaiterAlerts: () => set({ waiterAlerts: [] }),

  /* ─── Reset to Fresh Demo State ──────────────────────────────── */
  resetToFreshDemoState: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thoogudeepa_bridge_live');
        localStorage.removeItem('thoogudeepa_bridge_v1');
        localStorage.removeItem('thoogudeepa_bridge_v2');
        localStorage.removeItem('thoogudeepa_bridge_v3');
      } catch {}
    }
    set({
      tables: freshTables,
      kdsTickets: freshKdsTickets,
      pings: freshPings,
      inventory86: freshInventory86,
      settlementRecords: freshSettlementRecords,
      shiftStats: {
        tablesServed: 0,
        totalRevenue: 0,
        cashRevenue: 0,
        discounts: 0,
        taxCollected: 0,
        cashExpenses: 0,
        tipsEarned: 0,
        avgTurnaroundMinutes: 30,
      },
      waiterAlerts: [],
    });
  },
}));

/* ── Real-Time Cross-Tab & Multi-Device Synchronization ─────────── */

if (typeof window !== 'undefined') {
  // Purge legacy storage with old dummy/mock tickets
  try {
    localStorage.removeItem('thoogudeepa_bridge_live');
    localStorage.removeItem('thoogudeepa_bridge_v1');
    localStorage.removeItem('thoogudeepa_bridge_v2');
  } catch {}

  // 0. Rehydrate from localStorage if available (v3 clean storage)
  try {
    const saved = localStorage.getItem('thoogudeepa_bridge_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tables) && parsed.tables.length >= 10) {
        useSharedBridge.setState({
          ...parsed,
          shiftStats: {
            tablesServed: parsed.shiftStats?.tablesServed || 0,
            totalRevenue: parsed.shiftStats?.totalRevenue || 0,
            cashRevenue: parsed.shiftStats?.cashRevenue || 0,
            discounts: parsed.shiftStats?.discounts || 0,
            taxCollected: parsed.shiftStats?.taxCollected || 0,
            cashExpenses: parsed.shiftStats?.cashExpenses || 0,
            tipsEarned: parsed.shiftStats?.tipsEarned || 0,
            avgTurnaroundMinutes: parsed.shiftStats?.avgTurnaroundMinutes || 30,
          },
          kdsTickets: Array.isArray(parsed.kdsTickets) ? parsed.kdsTickets : [],
          settlementRecords: Array.isArray(parsed.settlementRecords) ? parsed.settlementRecords : [],
          waiterAlerts: Array.isArray(parsed.waiterAlerts) ? parsed.waiterAlerts : [],
        });
      }
    }
  } catch {}

  // 1. Native Cross-Tab Sync via BroadcastChannel (0ms latency, zero dependencies)
  if ('BroadcastChannel' in window) {
    const syncChannel = new BroadcastChannel('thoogudeepa_bridge_sync');
    let isBroadcasting = false;

    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_STATE' && event.data.payload) {
        isBroadcasting = true;
        useSharedBridge.setState(event.data.payload);
        isBroadcasting = false;
      }
    };

    useSharedBridge.subscribe((state) => {
      // Save state to localStorage for refresh persistence
      try {
        localStorage.setItem(
          'thoogudeepa_bridge_v3',
          JSON.stringify({
            tables: state.tables,
            kdsTickets: state.kdsTickets,
            pings: state.pings,
            inventory86: state.inventory86,
            shiftStats: state.shiftStats,
            settlementRecords: state.settlementRecords,
            waiterAlerts: state.waiterAlerts,
          })
        );
      } catch {}

      if (isBroadcasting) return;

      try {
        syncChannel.postMessage({
          type: 'SYNC_STATE',
          payload: {
            tables: state.tables,
            kdsTickets: state.kdsTickets,
            pings: state.pings,
            inventory86: state.inventory86,
            shiftStats: state.shiftStats,
            settlementRecords: state.settlementRecords,
            waiterAlerts: state.waiterAlerts,
          },
        });
      } catch {}
    });
  }

  // 2. Optional WebSocket client for multi-device sync (when server.js is running)
  try {
    const wsHost = window.location.hostname || 'localhost';
    const wsUrl = `ws://${wsHost}:3000`;
    let socket: WebSocket | null = null;
    let wsBroadcasting = false;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SYNC_STATE' && msg.payload) {
            wsBroadcasting = true;
            useSharedBridge.setState(msg.payload);
            wsBroadcasting = false;
          }
        } catch {}
      };
      socket.onclose = () => {
        setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    useSharedBridge.subscribe((state) => {
      if (wsBroadcasting || !socket || socket.readyState !== WebSocket.OPEN) return;
      try {
        socket.send(
          JSON.stringify({
            type: 'SYNC_STATE',
            payload: state,
          })
        );
      } catch {}
    });
  } catch {}

  // 3. Multi-Device Real-Time Cloud Sync via Supabase Realtime WebSockets
  if (typeof window !== 'undefined') {
    try {
      let isCloudBroadcasting = false;
      const cloudChannel = supabase.channel('thoogudeepa_cloud_sync', {
        config: { broadcast: { self: false } },
      });

      cloudChannel
        .on('broadcast', { event: 'SYNC_BRIDGE' }, ({ payload }) => {
          if (payload) {
            isCloudBroadcasting = true;
            useSharedBridge.setState(payload);
            isCloudBroadcasting = false;
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (change: any) => {
          if (change?.new && change.new.number) {
            const state = useSharedBridge.getState();
            const updated = state.tables.map((t) => {
              if (t.number === change.new.number) {
                return {
                  ...t,
                  status: change.new.status,
                  currentBill: Number(change.new.current_bill) || t.currentBill,
                  guestCount: Number(change.new.guest_count) || t.guestCount,
                };
              }
              return t;
            });
            useSharedBridge.setState({ tables: updated });
          }
        })
        .subscribe();

      useSharedBridge.subscribe((state) => {
        if (isCloudBroadcasting) return;
        try {
          cloudChannel.send({
            type: 'broadcast',
            event: 'SYNC_BRIDGE',
            payload: {
              tables: state.tables,
              kdsTickets: state.kdsTickets,
              pings: state.pings,
              inventory86: state.inventory86,
              shiftStats: state.shiftStats,
              settlementRecords: state.settlementRecords,
              waiterAlerts: state.waiterAlerts,
            },
          }).catch(() => {});
        } catch {}
      });
    } catch {}
  }
}