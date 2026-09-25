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
 *  Waiter fires KOT    → creates a KDS ticket in kitchen
 *  Kitchen bumps stage → waiter kitchenReadyItems updates
 *  Kitchen marks 86    → customer menu item grays out (is86 flag)
 *  Waiter vacates table → clears table in shared tables
 */

import { create } from 'zustand';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { MenuItem, OrderStage } from '../types/customer';

/* ── Shared Types ──────────────────────────────────────────────── */

export interface SharedKDSItem {
  id: string;
  name: string;
  quantity: number;
  stage: OrderStage;
  prepMode: string;
  options?: string;
  addOns?: string[];
  notes?: string; // ✅ Vennela's fix — kitchen notes field
}

export interface SharedKDSTicket {
  id: string;
  tableNumber: string;
  serverName: string;
  timestamp: string;
  elapsedMinutes: number;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  items: SharedKDSItem[];
  source?: 'CUSTOMER' | 'WAITER'; // ✅ Vennela's fix — optional for local demo tickets
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
  mergedWith?: string;
  activeItems?: { name: string; quantity: number; status: string }[];
}

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
  tipsEarned: number;
  avgTurnaroundMinutes: number;
}

// ✅ Vennela's fix — waiter alert queue type
export interface WaiterAlert {
  id: string;
  tableNumber: string;
  reason: string;
  timestamp: number;
}

/* ── Initial Data ───────────────────────────────────────────────── */

const freshTables: SharedTable[] = [
  { id: 't-1', number: 'A-01', section: 'SECTION A', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0 },
  { id: 't-2', number: 'A-02', section: 'SECTION A', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0 },
  { id: 't-3', number: 'A-03', section: 'SECTION A', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0 },
  { id: 't-4', number: 'A-04', section: 'SECTION A', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Ramesh', kotCount: 0 },
  { id: 't-5', number: 'B-01', section: 'SECTION B', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0 },
  { id: 't-6', number: 'B-02', section: 'SECTION B', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0 },
  { id: 't-7', number: 'B-03', section: 'SECTION B', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Suresh', kotCount: 0 },
  { id: 't-8', number: 'C-01', section: 'SECTION C', capacity: 8, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Captain Vijay', kotCount: 0 },
];

const freshInventory86: SharedMenuItem86[] = INITIAL_MENU_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  is86: false,
  prepDelayMinutes: 0,
}));

let ticketCounter = 1;
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
  waiterAlerts: WaiterAlert[]; // ✅ Vennela's fix — kitchen → waiter alerts

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

  // ✅ Vennela's fix — kitchen can call waiter to pass
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

  waiterMergeTables: (targetTable: string, sourceTable: string) => void;
  waiterResolvePing: (pingId: string) => void;
  waiterRecordsPayment: (
    tableNumber: string,
    method: string,
    amount: number
  ) => void;
  waiterVacatesTable: (tableNumber: string) => void;
  waiterMarkKitchenItemServed: (ticketId: string, itemId: string) => void;

  // ✅ Vennela's fix — acknowledge / clear waiter alerts
  acknowledgeWaiterAlert: (alertId: string) => void;
  clearWaiterAlerts: () => void;

  // ── Reset ───────────────────────────────────────────────────────
  resetToFreshDemoState: () => void;
}

/* ── Store Implementation ───────────────────────────────────────── */

export const useSharedBridge = create<SharedBridgeState>((set, get) => ({
  tables: freshTables,
  kdsTickets: [],
  pings: [],
  inventory86: freshInventory86,
  shiftStats: {
    tablesServed: 0,
    totalRevenue: 0,
    tipsEarned: 0,
    avgTurnaroundMinutes: 38,
  },
  waiterAlerts: [],

  /* ─── Customer Places Order ──────────────────────────────────── */
  customerPlacesOrder: (tableNumber, guestName, guestCount, items) => {
    const ticket: SharedKDSTicket = {
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
    const orderTotal = items.reduce(
      (s, i) => s + i.item.price * i.quantity,
      0
    );
    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? {
              ...t,
              status: 'OCCUPIED',
              guestCount: guestCount || t.guestCount || 1,
              seatedTime: nowTime(),
              currentBill: t.currentBill + orderTotal,
              kotCount: t.kotCount + 1,
              activeItems: items.map((i) => ({
                name: i.item.name,
                quantity: i.quantity,
                status: 'Cooking',
              })),
            }
          : t
      ),
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

      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find(
          (tk) => tk.tableNumber === tbl.number && tk.id === ticketId
        );
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            status:
              it.stage === 'PLATED'
                ? 'Ready'
                : it.stage === 'PREP'
                ? 'Cooking'
                : it.stage,
          })),
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

      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find(
          (tk) => tk.tableNumber === tbl.number && tk.id === ticketId
        );
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            status:
              it.stage === 'PLATED'
                ? 'Ready'
                : it.stage === 'PREP'
                ? 'Cooking'
                : it.stage === 'SERVED'
                ? 'Served'
                : 'Placed',
          })),
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
        const ticket = newTickets.find(
          (tk) => tk.tableNumber === tbl.number
        );
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            status:
              it.stage === 'PLATED'
                ? 'Ready'
                : it.stage === 'PREP'
                ? 'Cooking'
                : it.stage === 'SERVED'
                ? 'Served'
                : 'Placed',
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Bumps Entire Table ─────────────────────────────── */
  kitchenBumpTable: (ticketId) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'READY',
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' as OrderStage })),
        };
      }),
    }));
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

  /* ✅ Kitchen Calls Floor Waiter (Vennela's fix) ─────────────── */
  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    const alert: WaiterAlert = {
      id: `ALERT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tableNumber,
      reason,
      timestamp: Date.now(),
    };
    set((state) => ({ waiterAlerts: [...state.waiterAlerts, alert] }));
  },

  /* ─── Waiter Fires KOT ───────────────────────────────────────── */
  waiterFiresKOT: (tableNumber, captainName, items) => {
    const ticket: SharedKDSTicket = {
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
    const kotTotal = items.reduce(
      (s, i) => s + i.item.price * i.quantity,
      0
    );
    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? {
              ...t,
              status: 'OCCUPIED',
              currentBill: t.currentBill + kotTotal,
              kotCount: t.kotCount + 1,
              activeItems: [
                ...(t.activeItems || []),
                ...items.map((i) => ({
                  name: i.item.name,
                  quantity: i.quantity,
                  status: 'Cooking',
                })),
              ],
            }
          : t
      ),
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

  /* ─── Waiter Merges Two Tables ───────────────────────────────── */
  waiterMergeTables: (targetTable, sourceTable) => {
    set((state) => {
      const target = state.tables.find((t) => t.number === targetTable);
      const source = state.tables.find((t) => t.number === sourceTable);
      if (!target || !source) return state;
      const mergedBill = target.currentBill + source.currentBill;
      const mergedGuests = Math.max(
        2,
        (target.guestCount || 2) + (source.guestCount || 2)
      );
      return {
        tables: state.tables.map((t) => {
          if (t.number === targetTable) {
            return {
              ...t,
              status: 'OCCUPIED',
              currentBill: mergedBill,
              guestCount: mergedGuests,
              mergedWith: sourceTable,
              activeItems: [
                ...(t.activeItems || []),
                ...(source.activeItems || []),
              ],
            };
          }
          if (t.number === sourceTable) {
            return {
              ...t,
              status: 'OCCUPIED',
              currentBill: 0,
              guestCount: 0,
              mergedWith: targetTable,
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
  waiterRecordsPayment: (tableNumber, method, amount) => {
    set((state) => {
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
      const partner = targetTbl?.mergedWith;
      return {
        tables: state.tables.map((t) =>
          t.number === tableNumber || (partner && t.number === partner)
            ? { ...t, status: 'BILLING' }
            : t
        ),
        shiftStats: {
          ...state.shiftStats,
          totalRevenue: state.shiftStats.totalRevenue + amount,
          tablesServed: state.shiftStats.tablesServed + 1,
        },
      };
    });
  },

  /* ─── Waiter Vacates Table ───────────────────────────────────── */
  waiterVacatesTable: (tableNumber) => {
    set((state) => {
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
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
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) =>
          it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: allServed ? 'COMPLETED' : t.status,
        };
      }),
    }));
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
        localStorage.removeItem('thoogudeepa_bridge_v1');
      } catch {}
    }
    set({
      tables: freshTables,
      kdsTickets: [],
      pings: [],
      inventory86: freshInventory86,
      shiftStats: {
        tablesServed: 0,
        totalRevenue: 0,
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
    const saved = localStorage.getItem('thoogudeepa_bridge_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tables)) {
        useSharedBridge.setState(parsed);
      }
    }
  } catch {}

  // 1. Native Cross-Tab Sync via BroadcastChannel
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
      try {
        localStorage.setItem(
          'thoogudeepa_bridge_v1',
          JSON.stringify({
            tables: state.tables,
            kdsTickets: state.kdsTickets,
            pings: state.pings,
            inventory86: state.inventory86,
            shiftStats: state.shiftStats,
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
            waiterAlerts: state.waiterAlerts,
          },
        });
      } catch {
        // Gracefully ignore if channel closed
      }
    });
  }

  // 2. Optional WebSocket client for multi-device sync
  try {
    const wsHost = window.location.hostname || 'localhost';
    const wsUrl = `ws://${wsHost}:3000`;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onerror = () => {
          ws?.close();
        };
        ws.onclose = () => {
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              connectWs();
            }, 15000);
          }
        };
      } catch {
        // Fallback cleanly to BroadcastChannel
      }
    };

    connectWs();
  } catch {
    // Fallback cleanly to BroadcastChannel
  }
}