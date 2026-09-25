import { create } from 'zustand';
import { KitchenScreenId, KitchenStation, KDSTicket } from '../types/kitchen';
import { OrderStage } from '../types/customer';
import { useSharedBridge } from './useSharedBridge';

interface KitchenStoreState {
  currentScreen: KitchenScreenId;
  previousScreen: KitchenScreenId;
  viewMode: 'single' | 'all';
  activeStation: KitchenStation;
  chefName: string;
  selectedTableNumber: string;
  soundAlertsEnabled: boolean;
  tickets: KDSTicket[];
  waiterAlertNotice: string | null;

  // Shift & profile tracking
  shiftStartTime: string;

  setCurrentScreen: (screen: KitchenScreenId) => void;
  setViewMode: (mode: 'single' | 'all') => void;
  setActiveStation: (station: KitchenStation) => void;
  setChefName: (name: string) => void;
  setSelectedTableNumber: (table: string) => void;
  toggleSoundAlerts: () => void;
  bumpItemStage: (ticketId: string, itemId: string) => void;
  bumpTable: (ticketId: string) => void;
  callFloorWaiter: (tableNumber: string, reason?: string) => void;
  dismissWaiterAlert: () => void;
  resetKitchenDemo: () => void;

  setShiftStartTime: (time: string) => void;
  resetForSignOut: () => void;
}

const demoTickets: KDSTicket[] = [
  {
    id: 'KDS-101',
    tableNumber: 'A-04',
    serverName: 'Captain Ramesh',
    timestamp: '12:40 PM',
    elapsedMinutes: 14,
    status: 'PREP',
    source: 'WAITER',
    items: [
      {
        id: 'd-101-1',
        name: 'Special Chicken Donne Biryani',
        quantity: 2,
        prepMode: 'Direct Wok',
        stage: 'PREP',
        notes: 'Less spicy',
      },
      {
        id: 'd-101-2',
        name: 'Kshatriya Chicken Kebab (Crispy)',
        quantity: 1,
        prepMode: 'Deep Fry',
        stage: 'PLACED',
        notes: 'Extra crispy',
      },
    ],
  },
  {
    id: 'KDS-102',
    tableNumber: 'A-01',
    serverName: 'Captain Ramesh',
    timestamp: '12:44 PM',
    elapsedMinutes: 10,
    status: 'NEW',
    source: 'CUSTOMER',
    items: [
      {
        id: 'd-102-1',
        name: 'Thoogudeepa Mutton Donne Biryani',
        quantity: 1,
        prepMode: 'Clay Pot',
        stage: 'PLACED',
      },
      {
        id: 'd-102-2',
        name: 'Gunpowder Pepper Chicken Dry',
        quantity: 1,
        prepMode: 'Tawa Toss',
        stage: 'PLACED',
      },
    ],
  },
  {
    id: 'KDS-103',
    tableNumber: 'B-01',
    serverName: 'Captain Suresh',
    timestamp: '12:48 PM',
    elapsedMinutes: 6,
    status: 'PREP',
    source: 'WAITER',
    items: [
      {
        id: 'd-103-1',
        name: 'Ceylon Coin Parotta (2 Pcs)',
        quantity: 2,
        prepMode: 'Tawa Ghee Roast',
        stage: 'PLATED',
      },
      {
        id: 'd-103-2',
        name: 'Nati Koli Saaru (Country Chicken Curry)',
        quantity: 1,
        prepMode: 'Clay Pot Simmer',
        stage: 'PLATED',
      },
    ],
  },
];

export const useKitchenStore = create<KitchenStoreState>((set) => ({
  currentScreen: 1,
  previousScreen: 1,
  viewMode: 'single',
  activeStation: 'MASTER_DISPATCH',
  chefName: 'Master Chef Manjunath',
  selectedTableNumber: 'A-04',
  soundAlertsEnabled: true,
  tickets: demoTickets,
  waiterAlertNotice: null,
  shiftStartTime: '',

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
    useSharedBridge.getState().kitchenBumpItemStage(ticketId, itemId);
    set((state) => {
      const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED'];
      const newTickets = state.tickets.map((t) => {
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
            : 'PREP') as KDSTicket['status'],
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
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' as OrderStage })),
        };
      }),
    }));
  },

  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    useSharedBridge.getState().callFloorWaiter(tableNumber, reason);
    set({
      waiterAlertNotice: `[NOTIFICATION TRANSMITTED] Floor Captain alerted for Table ${tableNumber}: ${reason}`,
    });
    setTimeout(() => {
      set((state) =>
        state.waiterAlertNotice ? { waiterAlertNotice: null } : state
      );
    }, 4000);
  },

  dismissWaiterAlert: () => set({ waiterAlertNotice: null }),

  resetKitchenDemo: () => set({ tickets: demoTickets }),

  setShiftStartTime: (time) => set({ shiftStartTime: time }),

  resetForSignOut: () =>
    set({
      currentScreen: 1,
      previousScreen: 1,
      activeStation: 'MASTER_DISPATCH',
      chefName: '',
      shiftStartTime: '',
      waiterAlertNotice: null,
    }),
}));

export const useBridgeKDSTickets = () => useSharedBridge((s) => s.kdsTickets);
export const useBridgeInventory86 = () => useSharedBridge((s) => s.inventory86);
