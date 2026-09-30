import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'thoogudeepa-enterprise-pos-secure-jwt-key-2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface StaffAuthPayload {
  id: string;
  name: string;
  displayName: string;
  role: 'WAITER' | 'KITCHEN' | 'MANAGER' | 'ADMIN';
  section?: string;
}

// In-memory predefined staff credentials with role authorization
export const STAFF_REGISTRY: Array<{
  id: string;
  name: string;
  displayName: string;
  pin: string;
  role: 'WAITER' | 'KITCHEN' | 'MANAGER' | 'ADMIN';
  section?: string;
}> = [
  { id: 'w-1', name: 'Waiter 1', displayName: 'Waiter 1 (Ramesh)', pin: '1111', role: 'WAITER', section: 'SECTION A' },
  { id: 'w-2', name: 'Waiter 2', displayName: 'Waiter 2 (Suresh)', pin: '2222', role: 'WAITER', section: 'SECTION B' },
  { id: 'w-3', name: 'Waiter 3', displayName: 'Waiter 3 (Vijay)', pin: '3333', role: 'WAITER', section: 'TERRACE' },
  { id: 'w-4', name: 'Waiter 4', displayName: 'Waiter 4 (Kiran)', pin: '4444', role: 'WAITER', section: 'FAMILY DINING' },
  { id: 'k-1', name: 'Kitchen Head', displayName: 'Chef Manjunath', pin: '5555', role: 'KITCHEN', section: 'MAIN KITCHEN' },
  { id: 'm-1', name: 'General Manager', displayName: 'Prajwal (Manager)', pin: '9999', role: 'MANAGER', section: 'ALL' },
  { id: 'm-2', name: 'Cashier Terminal', displayName: 'Billing Counter', pin: '1234', role: 'MANAGER', section: 'CASHIER' },
];

/**
 * Validates a submitted 4-digit PIN against staff profiles
 */
export function authenticateStaffByPin(pin: string, portalRole?: string): StaffAuthPayload | null {
  const staff = STAFF_REGISTRY.find((s) => s.pin === pin);
  if (!staff) {
    return null;
  }

  // If a specific portal role is requested, verify eligibility
  if (portalRole) {
    const requested = portalRole.toUpperCase();
    if (requested === 'WAITER' && staff.role !== 'WAITER' && staff.role !== 'MANAGER' && staff.role !== 'ADMIN') {
      return null;
    }
    if (requested === 'KITCHEN' && staff.role !== 'KITCHEN' && staff.role !== 'MANAGER' && staff.role !== 'ADMIN') {
      return null;
    }
    if (requested === 'MANAGER' && staff.role !== 'MANAGER' && staff.role !== 'ADMIN') {
      return null;
    }
  }

  return {
    id: staff.id,
    name: staff.name,
    displayName: staff.displayName,
    role: staff.role,
    section: staff.section,
  };
}

/**
 * Signs an encrypted JWT session cookie
 */
export async function signStaffToken(payload: StaffAuthPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token from cookie or Authorization header
 */
export async function verifyStaffToken(token: string): Promise<StaffAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as StaffAuthPayload;
  } catch {
    return null;
  }
}
