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
import { dbService } from '../lib/db/databaseService';

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
}

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

export const freshSettlementRecords: SharedSettlementRecord[] = [
  // Waiter 1 (Ramesh) - SECTION A
  {
    id: 'set-w1-1',
    tableNumber: 'A-05',
    section: 'SECTION A',
    serverName: 'Waiter 1 (Ramesh)',
    amount: 1120,
    tip: 50,
    method: 'UPI',
    timestamp: '11:45 AM',
  },
  {
    id: 'set-w1-2',
    tableNumber: 'A-06',
    section: 'SECTION A',
    serverName: 'Waiter 1 (Ramesh)',
    amount: 780,
    tip: 30,
    method: 'CASH',
    timestamp: '12:15 PM',
  },
  // Waiter 2 (Suresh) - SECTION B
  {
    id: 'set-w2-1',
    tableNumber: 'B-04',
    section: 'SECTION B',
    serverName: 'Waiter 2 (Suresh)',
    amount: 1450,
    tip: 60,
    method: 'CARD',
    timestamp: '11:30 AM',
  },
  {
    id: 'set-w2-2',
    tableNumber: 'B-05',
    section: 'SECTION B',
    serverName: 'Waiter 2 (Suresh)',
    amount: 920,
    tip: 40,
    method: 'UPI',
    timestamp: '12:05 PM',
  },
  // Waiter 3 (Vijay) - TERRACE
  {
    id: 'set-w3-1',
    tableNumber: 'T-03',
    section: 'TERRACE',
    serverName: 'Waiter 3 (Vijay)',
    amount: 1680,
    tip: 80,
    method: 'CARD',
    timestamp: '11:50 AM',
  },
  {
    id: 'set-w3-2',
    tableNumber: 'T-04',
    section: 'TERRACE',
    serverName: 'Waiter 3 (Vijay)',
    amount: 850,
    tip: 40,
    method: 'CASH',
    timestamp: '12:25 PM',
  },
  // Waiter 4 (Kiran) - FAMILY DINING
  {
    id: 'set-w4-1',
    tableNumber: 'FD-03',
    section: 'FAMILY DINING',
    serverName: 'Waiter 4 (Kiran)',
    amount: 2150,
    tip: 100,
    method: 'UPI',
    timestamp: '11:20 AM',
  },
  {
    id: 'set-w4-2',
    tableNumber: 'FD-04',
    section: 'FAMILY DINING',
    serverName: 'Waiter 4 (Kiran)',
    amount: 1340,
    tip: 50,
    method: 'CASH',
    timestamp: '12:10 PM',
  },
];

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

/* ── Initial Data ───────────────────────────────────────────────── */
const freshTables: SharedTable[] = [
  {
    id: 't-1',
    number: 'A-01',
    section: 'SECTION A',
    capacity: 4,
    status: 'OCCUPIED',
    guestCount: 2,
    seatedTime: '12:45 PM',
    currentBill: 590,
    serverName: 'Captain Ramesh',
    kotCount: 1,
    activeItems: [
      { name: 'Thoogudeepa Mutton Donne Biryani', quantity: 1, status: 'Preparing' },
      { name: 'Gunpowder Pepper Chicken Dry', quantity: 1, status: 'Preparing' },
    ],
  },
  { id: 't-2', number: 'A-02', section: 'SECTION A', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0 },
  { id: 't-3', number: 'A-03', section: 'SECTION A', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0 },
  {
    id: 't-4',
    number: 'A-04',
    section: 'SECTION A',
    capacity: 4,
    status: 'OCCUPIED',
    guestCount: 3,
    seatedTime: '12:35 PM',
    currentBill: 740,
    kotCount: 1,
    serverName: 'Captain Ramesh',
    activeItems: [
      { name: 'Special Chicken Donne Biryani', quantity: 2, status: 'Ready' },
      { name: 'Kshatriya Chicken Kebab (Crispy)', quantity: 1, status: 'Ready' },
    ],
  },
  {
    id: 't-5',
    number: 'B-01',
    section: 'SECTION B',
    capacity: 4,
    status: 'OCCUPIED',
    guestCount: 2,
    seatedTime: '12:50 PM',
    currentBill: 360,
    kotCount: 1,
    serverName: 'Captain Suresh',
    kotNotes: 'Less spice for children',
    activeItems: [
      { name: 'Ceylon Coin Parotta (2 Pcs)', quantity: 2, status: 'Queued' },
      { name: 'Nati Koli Saaru (Country Chicken Curry)', quantity: 1, status: 'Queued' },
    ],
  },
  {
    id: 't-6',
    number: 'B-02',
    section: 'SECTION B',
    capacity: 2,
    status: 'BILLING',
    guestCount: 2,
    seatedTime: '12:15 PM',
    currentBill: 480,
    kotCount: 1,
    serverName: 'Captain Suresh',
    activeItems: [
      { name: 'Paneer Donne Biryani', quantity: 2, status: 'Served' },
    ],
  },
  { id: 't-7', number: 'B-03', section: 'SECTION B', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0 },
  {
    id: 't-8',
    number: 'C-01',
    section: 'TERRACE',
    capacity: 8,
    status: 'OCCUPIED',
    guestCount: 6,
    seatedTime: '12:30 PM',
    currentBill: 1420,
    kotCount: 2,
    serverName: 'Captain Vijay',
    activeItems: [
      { name: 'Thoogudeepa Mutton Donne Biryani', quantity: 3, status: 'Served' },
      { name: 'Kshatriya Chicken Kebab (Crispy)', quantity: 2, status: 'Served' },
    ],
  },
  { id: 't-9', number: 'C-02', section: 'FAMILY DINING', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Kiran', kotCount: 0 },
  { id: 't-10', number: 'C-03', section: 'FAMILY DINING', capacity: 10, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Kiran', kotCount: 0 },
];

const freshKdsTickets: SharedKDSTicket[] = [
  {
    id: 'KDS-101',
    tableNumber: 'A-04',
    serverName: 'Captain Ramesh',
    timestamp: '12:45 PM',
    elapsedMinutes: 14,
    status: 'READY',
    source: 'WAITER',
    items: [
      { id: 'ki-1', name: 'Special Chicken Donne Biryani', quantity: 2, stage: 'PLATED', prepMode: 'Direct Wok' },
      { id: 'ki-2', name: 'Kshatriya Chicken Kebab (Crispy)', quantity: 1, stage: 'PLATED', prepMode: 'Deep Fry' },
    ],
  },
  {
    id: 'KDS-102',
    tableNumber: 'A-01',
    serverName: 'Captain Ramesh',
    timestamp: '12:50 PM',
    elapsedMinutes: 8,
    status: 'PREP',
    source: 'CUSTOMER',
    items: [
      { id: 'ki-3', name: 'Thoogudeepa Mutton Donne Biryani', quantity: 1, stage: 'PREP', prepMode: 'Clay Pot' },
      { id: 'ki-4', name: 'Gunpowder Pepper Chicken Dry', quantity: 1, stage: 'PREP', prepMode: 'Tawa Toss' },
    ],
  },
  {
    id: 'KDS-103',
    tableNumber: 'B-01',
    serverName: 'Captain Suresh',
    timestamp: '12:54 PM',
    elapsedMinutes: 3,
    status: 'NEW',
    source: 'CUSTOMER',
    items: [
      { id: 'ki-5', name: 'Ceylon Coin Parotta (2 Pcs)', quantity: 2, stage: 'PLACED', prepMode: 'Tawa Ghee Roast' },
      { id: 'ki-6', name: 'Nati Koli Saaru (Country Chicken Curry)', quantity: 1, stage: 'PLACED', prepMode: 'Clay Pot Simmer' },
    ],
  },
];

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
        const tblNum = (t.number || '').replace(/\D/g, '');
        const isMatch = t.number === tableNumber || (cleanNum && tblNum === cleanNum);
        if (!isMatch) return t;
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
        if (t.number !== tableNumber) return t;
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
        t.number === tableNumber
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
          t.number === tableNumber
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
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
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
          t.number === tableNumber || (partner && t.number === partner)
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
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
      if (targetTbl) {
        const transition = validateTableStateTransition(targetTbl.status, 'VACANT', targetTbl.currentBill);
        if (!transition.allowed) {
          console.warn(`[Table Vacate Notice]: ${transition.reason}`);
        }
      }
      const partner = targetTbl?.mergedWith;
      return {
        tables: state.tables.map((t) =>
          t.number === tableNumber || (partner && t.number === partner)
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
              (tk.tableNumber === tableNumber ||
                (partner && tk.tableNumber === partner)) &&
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
      const cleanNum = (tableNumber || '').replace(/\D/g, '');

      const updatedTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) =>
          !itemId || it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return { ...t, items: newItems, status: allServed ? ('COMPLETED' as const) : t.status };
      });

      const updatedTables = state.tables.map((tbl) => {
        const tblNum = (tbl.number || '').replace(/\D/g, '');
        const isMatch = tableNumber && (
          tbl.number === tableNumber ||
          (cleanNum && tblNum === cleanNum)
        );
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
      const cleanNum = (tableNumber || '').replace(/\D/g, '');
      const updatedTickets = state.kdsTickets.map((t) => {
        const tNum = (t.tableNumber || '').replace(/\D/g, '');
        const isMatch = t.tableNumber === tableNumber || (cleanNum && tNum === cleanNum);
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
        const tblNum = (tbl.number || '').replace(/\D/g, '');
        const isMatch = tbl.number === tableNumber || (cleanNum && tblNum === cleanNum);
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
        localStorage.removeItem('thoogudeepa_bridge_v2');
        localStorage.removeItem('thoogudeepa_bridge_v1');
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
        avgTurnaroundMinutes: 38,
      },
      waiterAlerts: [],
    });
  },
}));

/* ── Real-Time Cross-Tab & Multi-Device Synchronization ─────────── */

if (typeof window !== 'undefined') {
  // 0. Rehydrate from localStorage if available
  try {
    const saved =
      localStorage.getItem('thoogudeepa_bridge_v2') ||
      localStorage.getItem('thoogudeepa_bridge_live');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tables) && parsed.tables.length >= 10) {
        const seenTicketIds = new Set<string>();
        const sanitizedKdsTickets = (parsed.kdsTickets || []).map(
          (tk: SharedKDSTicket, idx: number) => {
            if (!tk || !tk.id) return tk;
            if (!seenTicketIds.has(tk.id)) {
              seenTicketIds.add(tk.id);
              return tk;
            }
            const uniqueId = `KDS-${String(200 + idx).padStart(3, '0')}`;
            seenTicketIds.add(uniqueId);
            return { ...tk, id: uniqueId };
          }
        );

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
            avgTurnaroundMinutes: parsed.shiftStats?.avgTurnaroundMinutes || 38,
          },
          kdsTickets: sanitizedKdsTickets,
          settlementRecords:
            Array.isArray(parsed.settlementRecords) && parsed.settlementRecords.length > 0
              ? parsed.settlementRecords
              : freshSettlementRecords,
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
          'thoogudeepa_bridge_v2',
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

  // 3. Multi-Device Real-Time SSE Hub (auto-syncs with backend API on port 3001)
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      const sseHost = window.location.hostname || 'localhost';
      const sseUrl = `http://${sseHost}:3001/api/realtime/stream`;
      let eventSource: EventSource | null = null;
      let sseBroadcasting = false;

      const connectSSE = () => {
        try {
          eventSource = new EventSource(sseUrl);
          eventSource.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === 'SYNC_STATE' && msg.payload) {
                sseBroadcasting = true;
                useSharedBridge.setState(msg.payload);
                sseBroadcasting = false;
              }
            } catch {}
          };
          eventSource.onerror = () => {
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }
            setTimeout(connectSSE, 5000);
          };
        } catch {}
      };

      connectSSE();

      useSharedBridge.subscribe((state) => {
        if (sseBroadcasting) return;
        try {
          fetch(`http://${sseHost}:3001/api/realtime/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state }),
          }).catch(() => {});
        } catch {}
      });
    } catch {}
  }
}