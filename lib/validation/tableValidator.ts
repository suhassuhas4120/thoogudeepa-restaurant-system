import { SharedTable } from '../../store/useSharedBridge';

export type TableStatus = 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';

export interface TableTransitionResult {
  allowed: boolean;
  reason?: string;
}

export function validateTableStateTransition(
  currentStatus: TableStatus,
  targetStatus: TableStatus,
  currentBill: number
): TableTransitionResult {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  // A table with an unpaid balance cannot be directly vacated
  if (targetStatus === 'VACANT' && currentStatus === 'OCCUPIED' && currentBill > 0) {
    return {
      allowed: false,
      reason: `Table has an outstanding unpaid balance of ₹${currentBill.toFixed(2)}. Bill settlement is required before vacating.`,
    };
  }

  // Normal valid state progressions:
  // VACANT -> OCCUPIED
  // OCCUPIED -> BILLING
  // BILLING -> VACANT / CLEANING
  // CLEANING -> VACANT
  const allowedMap: Record<TableStatus, TableStatus[]> = {
    VACANT: ['OCCUPIED', 'CLEANING'],
    OCCUPIED: ['BILLING', 'CLEANING', 'VACANT'],
    BILLING: ['VACANT', 'CLEANING', 'OCCUPIED'],
    CLEANING: ['VACANT', 'OCCUPIED'],
  };

  const isPermitted = allowedMap[currentStatus]?.includes(targetStatus);
  if (!isPermitted) {
    return {
      allowed: false,
      reason: `Direct transition from ${currentStatus} to ${targetStatus} is invalid.`,
    };
  }

  return { allowed: true };
}

export function validateTableMerge(
  primaryTable: SharedTable,
  secondaryTable: SharedTable
): { allowed: boolean; reason?: string } {
  if (primaryTable.number === secondaryTable.number) {
    return { allowed: false, reason: 'Cannot merge a table with itself.' };
  }

  if (primaryTable.mergedWith && primaryTable.mergedWith !== secondaryTable.number) {
    return {
      allowed: false,
      reason: `Table ${primaryTable.number} is already merged with ${primaryTable.mergedWith}.`,
    };
  }

  return { allowed: true };
}
