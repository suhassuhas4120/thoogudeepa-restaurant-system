import { WaiterPingType, MenuItem, CartItem } from './customer';

export type WaiterScreenId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TableStatus = 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING' | 'RESERVED';

export interface FloorTable {
  id: string;
  number: string;
  section: string;
  capacity: number;
  status: TableStatus;
  guestCount: number;
  seatedTime: string;
  currentBill: number;
  serverName: string;
  kotCount: number;
  mergedWith?: string;
  activeItems?: { name: string; quantity: number; status: string }[];
}

export interface WaiterCustomerPing {
  id: string;
  tableNumber: string;
  type: WaiterPingType;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  guestName?: string;
}

export interface KitchenReadyItem {
  id: string;
  tableNumber: string;
  dishName: string;
  quantity: number;
  prepTime: string;
  readyTimestamp: string;
  status: 'READY' | 'SERVED';
}

export interface ShiftStats {
  tablesServed: number;
  totalRevenue: number;
  tipsEarned: number;
  avgTurnaroundMinutes: number;
}

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

