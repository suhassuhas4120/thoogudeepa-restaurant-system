import { create } from 'zustand';
import {
  KitchenScreenId,
  KitchenStation,
  KDSTicket,
} from '../types/kitchen';
import { OrderStage } from '../types/customer';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { useSharedBridge } from './useSharedBridge';

interface KitchenStoreState {
  currentScreen: KitchenScreenId;
  previousScreen: KitchenScreenId;
  viewMode: 'single' | 'all';
  activeStation: KitchenStation;
  chefName: string;
  selectedTableNumber: string;
  soundAlertsEnabled: boolean;

  // Local-only tickets (seed for screen until bridge has real orders)
  tickets: KDSTicket[];

  // Actions
  setCurrentScreen: (screen: KitchenScreenId) => void;
  setViewMode: (mode: 'single' | 'all') => void;
  setActiveStation: (station: KitchenStation) => void;
  setChefName: (name: string) => void;
  setSelectedTableNumber: (table: string) => void;
  toggleSoundAlerts: () => void;
  // These also write to shared bridge for cross-section sync:
  bumpItemStage: (ticketId: string, itemId: string) => void;
  bumpTable: (ticketId: string) => void;
  callFloorWaiter: (tableNumber: string, reason?: string) => void;
  waiterAlertNotice: string | null;
  dismissWaiterAlert: () => void;
}

// No pre-seeded tickets — they come from customer orders / waiter KOTs via bridge
// Keep a few demo tickets only for the standalone kitchen demo mode
const demoTickets: KDSTicket[] = [];

export const useKitchenStore = create<KitchenStoreState>((set) => ({
  currentScreen: 1,
  previousScreen: 1,
  viewMode: 'single',
  activeStation: 'MAIN',
  chefName: 'Master Chef Manjunath',
  selectedTableNumber: 'A-04',
  soundAlertsEnabled: true,
  tickets: demoTickets,
  waiterAlertNotice: null,

  setCurrentScreen: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveStation: (station) => set({ activeStation: station }),
  setChefName: (name) => set({ chefName: name }),
  setSelectedTableNumber: (table) => set({ selectedTableNumber: table }),
  toggleSoundAlerts: () =>
    set((state) => ({ soundAlertsEnabled: !state.soundAlertsEnabled })),

  bumpItemStage: (ticketId, itemId) => {
    // Also bump in shared bridge
    useSharedBridge.getState().kitchenBumpItemStage(ticketId, itemId);

    // Local tickets (demo mode)
    set((state) => {
      const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED'];
      const newTickets = state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) => {
          if (it.id !== itemId) return it;
          const curIdx = stageOrder.indexOf(it.stage);
          const nextStage =
            curIdx < stageOrder.length - 1 ? stageOrder[curIdx + 1] : stageOrder[curIdx];
          return { ...it, stage: nextStage };
        });
        const allPlated = newItems.every(
          (i) => i.stage === 'PLATED' || i.stage === 'SERVED'
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : 'PREP') as KDSTicket['status'],
        };
      });
      return { tickets: newTickets };
    });
  },

  bumpTable: (ticketId) => {
    useSharedBridge.getState().kitchenBumpTable(ticketId);
    set((state) => ({
      tickets: state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'READY',
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' })),
        };
      }),
    }));
  },

  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    set({
      waiterAlertNotice: `[NOTIFICATION TRANSMITTED] Floor Captain alerted for Table ${tableNumber}: ${reason}`,
    });
  },

  dismissWaiterAlert: () => set({ waiterAlertNotice: null }),
}));

/* ── Selectors that read from the shared bridge ──────────────────── */

/** All KDS tickets from bridge (real orders) */
export const useBridgeKDSTickets = () => useSharedBridge((s) => s.kdsTickets);

/** Menu 86 inventory from bridge */
export const useBridgeInventory86 = () => useSharedBridge((s) => s.inventory86);
