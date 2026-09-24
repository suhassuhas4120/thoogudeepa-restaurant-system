import { OrderStage } from './customer';

export type KitchenScreenId = 1 | 2 | 3;

export type KitchenStation = 'MAIN' | 'DUM_BIRYANI' | 'TANDOOR_BHATTI' | 'DESSERT_PANTRY';

export interface KDSItem {
  id: string;
  name: string;
  quantity: number;
  prepMode: string;
  stage: OrderStage;
  options?: string;
  addOns?: string[];
  notes?: string;
}

export interface KDSTicket {
  id: string;
  tableNumber: string;
  serverName: string;
  timestamp: string;
  elapsedMinutes: number;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  items: KDSItem[];
}

export interface MenuItem86 {
  id: string;
  name: string;
  category: string;
  is86: boolean;
  prepDelayMinutes: number;
}
