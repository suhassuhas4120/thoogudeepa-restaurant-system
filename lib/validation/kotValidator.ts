import { MenuItem } from '../../types/customer';
import { SharedKDSItem, SharedKDSTicket } from '../../store/useSharedBridge';

export interface KOTItemDraft {
  item: MenuItem;
  selectedOption?: string;
  quantity: number;
  notes?: string;
}

export interface KOTValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedTicket?: SharedKDSTicket;
}

let kotSequenceCounter = 100;

export function getNextKOTNumber(): number {
  kotSequenceCounter += 1;
  return kotSequenceCounter;
}

export function validateAndCreateKOTTicket(params: {
  tableNumber: string;
  serverName: string;
  items: KOTItemDraft[];
  inventory86: Array<{ id: string; is86: boolean }>;
  source?: 'WAITER' | 'CUSTOMER';
}): KOTValidationResult {
  const errors: string[] = [];

  const tableNumber = (params.tableNumber || '').trim().toUpperCase();
  if (!tableNumber) {
    errors.push('Table number is required.');
  }

  const serverName = (params.serverName || '').trim();
  if (!serverName) {
    errors.push('Server / Captain name is required.');
  }

  if (!Array.isArray(params.items) || params.items.length === 0) {
    errors.push('Cannot fire an empty KOT. At least one dish must be selected.');
  }

  const soldOutSet = new Set(
    (params.inventory86 || []).filter((it) => it.is86).map((it) => it.id)
  );

  const sanitizedItems: SharedKDSItem[] = [];

  for (const draft of params.items || []) {
    if (!draft.item || !draft.item.id) {
      errors.push('Invalid menu item detected in KOT payload.');
      continue;
    }

    if (soldOutSet.has(draft.item.id)) {
      errors.push(`Dish "${draft.item.name}" is marked 86 (Sold Out) and cannot be ordered.`);
      continue;
    }

    const qty = Math.floor(draft.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.push(`Invalid quantity (${draft.quantity}) for "${draft.item.name}". Must be at least 1.`);
      continue;
    }

    sanitizedItems.push({
      id: `kitem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: draft.item.name,
      quantity: qty,
      stage: 'PLACED',
      prepMode: draft.selectedOption || 'Standard',
      options: draft.selectedOption || 'Standard',
      notes: draft.notes || '',
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const ticketId = `KOT-${getNextKOTNumber()}`;

  const sanitizedTicket: SharedKDSTicket = {
    id: ticketId,
    tableNumber,
    serverName,
    timestamp,
    elapsedMinutes: 0,
    status: 'NEW',
    items: sanitizedItems,
    source: params.source || 'WAITER',
  };

  return {
    isValid: true,
    errors: [],
    sanitizedTicket,
  };
}
