export type SeatStatus = 'VACANT' | 'OCCUPIED' | 'BILLING' | 'PAID';

export interface SeatItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  stage?: 'Pending' | 'Preparing' | 'Ready' | 'Served';
  notes?: string;
}

export interface TableSeat {
  seatNumber: number;
  status: SeatStatus;
  currentBill: number;
  guestName?: string;
  activeOrderId?: string;
  deviceHash?: string;
  items: SeatItem[];
  seatedAt?: string;
}

export interface SeatTransitionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates legal seat state transitions.
 * VACANT -> OCCUPIED
 * OCCUPIED -> BILLING
 * BILLING -> PAID
 * PAID -> VACANT
 */
export function validateSeatTransition(
  currentStatus: SeatStatus,
  targetStatus: SeatStatus,
  currentBill: number
): SeatTransitionResult {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  // A seat with an outstanding bill cannot transition directly to VACANT without payment
  if (currentStatus === 'OCCUPIED' && targetStatus === 'VACANT' && currentBill > 0) {
    return {
      allowed: false,
      reason: `Seat has an unsettled balance of ₹${currentBill.toFixed(2)}. Settlement required before vacating.`,
    };
  }

  const allowedMap: Record<SeatStatus, SeatStatus[]> = {
    VACANT: ['OCCUPIED'],
    OCCUPIED: ['BILLING', 'VACANT'],
    BILLING: ['PAID', 'OCCUPIED'],
    PAID: ['VACANT'],
  };

  const isPermitted = allowedMap[currentStatus]?.includes(targetStatus);
  if (!isPermitted) {
    return {
      allowed: false,
      reason: `Direct transition from ${currentStatus} to ${targetStatus} is invalid for a physical seat.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates whether a customer can place a new order on this physical seat.
 */
export function validateSeatCanOrder(seat: TableSeat): { canOrder: boolean; reason?: string } {
  if (seat.status === 'BILLING') {
    return {
      canOrder: false,
      reason: 'This seat is currently in the billing checkout process.',
    };
  }

  return { canOrder: true };
}

/**
 * Aggregates individual seat bills and occupancy into whole-table metrics.
 */
export function aggregateTableFromSeats(seats: TableSeat[]): {
  totalBill: number;
  occupiedSeats: number;
  totalSeats: number;
  tableStatus: 'VACANT' | 'OCCUPIED' | 'BILLING';
} {
  const totalSeats = seats.length;
  let totalBill = 0;
  let occupiedSeats = 0;
  let hasBilling = false;

  for (const seat of seats) {
    totalBill += seat.currentBill;
    if (seat.status === 'OCCUPIED' || seat.status === 'BILLING') {
      occupiedSeats += 1;
    }
    if (seat.status === 'BILLING') {
      hasBilling = true;
    }
  }

  let tableStatus: 'VACANT' | 'OCCUPIED' | 'BILLING' = 'VACANT';
  if (occupiedSeats > 0) {
    tableStatus = hasBilling && occupiedSeats === 1 ? 'BILLING' : 'OCCUPIED';
  }

  return {
    totalBill: Math.round(totalBill * 100) / 100,
    occupiedSeats,
    totalSeats,
    tableStatus,
  };
}

/**
 * Creates default vacant seats for a given table capacity.
 */
export function createDefaultSeats(capacity: number): TableSeat[] {
  return Array.from({ length: capacity }, (_, i) => ({
    seatNumber: i + 1,
    status: 'VACANT' as SeatStatus,
    currentBill: 0,
    items: [],
  }));
}
