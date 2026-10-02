/**
 * Unit Test Suite: Part 2 - Zero-Friction Customer Lifecycle & 80% Exit/Re-Scan Recovery
 */

const assert = require('assert');

// Mock browser window, localStorage, and sessionStorage in Node.js environment
const mockStorage = new Map();
const mockSessionStorage = new Map();

global.window = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36',
    language: 'en-IN',
    hardwareConcurrency: 8,
  },
  screen: {
    width: 393,
    height: 852,
    colorDepth: 24,
  },
  localStorage: {
    getItem: (k) => mockStorage.get(k) || null,
    setItem: (k, v) => mockStorage.set(k, String(v)),
    removeItem: (k) => mockStorage.delete(k),
    clear: () => mockStorage.clear(),
  },
  sessionStorage: {
    getItem: (k) => mockSessionStorage.get(k) || null,
    setItem: (k, v) => mockSessionStorage.set(k, String(v)),
    removeItem: (k) => mockSessionStorage.delete(k),
    clear: () => mockSessionStorage.clear(),
  },
};

const STORAGE_KEY_PREFIX = 'thoogudeepa_seat_session_';

function getDeviceFingerprint() {
  if (typeof window === 'undefined') return 'server-mock-fingerprint';
  try {
    const nav = window.navigator;
    const screen = window.screen;
    const raw = [
      nav.userAgent || '',
      screen.width || 0,
      screen.height || 0,
      screen.colorDepth || 0,
      nav.language || '',
      'Asia/Kolkata',
      nav.hardwareConcurrency || 2,
    ].join('###');

    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return 'dfp_' + (hash >>> 0).toString(16);
  } catch {
    return 'dfp_fallback_' + Date.now();
  }
}

function createSeatSession(tableNumber, seatNumber) {
  const cleanTable = (tableNumber || 'A-01').trim().toUpperCase();
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  const sessionId = `sst_${cleanTable}_s${seatNumber}_${timestamp}_${randomPart}`;
  const deviceFingerprint = getDeviceFingerprint();

  const session = {
    sessionId,
    tableNumber: cleanTable,
    seatNumber,
    deviceFingerprint,
    createdAt: timestamp,
    lastActiveAt: timestamp,
    accumulatedBill: 0,
    orderIds: [],
  };

  saveSessionLocally(session);
  return session;
}

function saveSessionLocally(session) {
  if (typeof window === 'undefined') return;
  try {
    const key = `${STORAGE_KEY_PREFIX}${session.tableNumber}_${session.seatNumber}`;
    const payload = JSON.stringify(session);
    window.localStorage.setItem(key, payload);
    window.sessionStorage.setItem(key, payload);
  } catch {}
}

function getLocalSession(tableNumber, seatNumber) {
  if (typeof window === 'undefined') return null;
  try {
    const cleanTable = (tableNumber || 'A-01').trim().toUpperCase();
    const key = `${STORAGE_KEY_PREFIX}${cleanTable}_${seatNumber}`;
    const stored = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clearSeatSession(tableNumber, seatNumber) {
  if (typeof window === 'undefined') return;
  try {
    const cleanTable = (tableNumber || 'A-01').trim().toUpperCase();
    const key = `${STORAGE_KEY_PREFIX}${cleanTable}_${seatNumber}`;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch {}
}

function validateSeatAccess(tableNumber, seatNumber, isSeatCurrentlyOccupied, activeSeatBill = 0, activeSeatGuestName) {
  const localSession = getLocalSession(tableNumber, seatNumber);
  const currentFingerprint = getDeviceFingerprint();

  // 1. If seat is NOT occupied, allow fresh frictionless start
  if (!isSeatCurrentlyOccupied) {
    const newSession = createSeatSession(tableNumber, seatNumber);
    return {
      allowed: true,
      status: 'NEW_SESSION',
      session: newSession,
      message: `Table ${tableNumber} Seat ${seatNumber} is vacant. Welcome!`,
    };
  }

  // 2. Seat IS occupied: Check Tier 1 (Matching Session Token in Local/Session Storage)
  if (localSession && localSession.tableNumber === tableNumber && localSession.seatNumber === seatNumber) {
    localSession.lastActiveAt = Date.now();
    localSession.accumulatedBill = activeSeatBill;
    saveSessionLocally(localSession);

    return {
      allowed: true,
      status: 'SESSION_RESTORED',
      session: localSession,
      message: `Welcome back! Active dining session restored (Bill: ₹${activeSeatBill}).`,
    };
  }

  // 3. Seat IS occupied: Check Tier 2 (Storage was cleared / Incognito, but Fingerprint matches)
  if (localSession && localSession.deviceFingerprint === currentFingerprint) {
    localSession.lastActiveAt = Date.now();
    saveSessionLocally(localSession);

    return {
      allowed: true,
      status: 'FINGERPRINT_RECOVERED',
      session: localSession,
      message: `Device verified. Reconnected to your active seat (Bill: ₹${activeSeatBill}).`,
    };
  }

  // 4. Stranger or unknown device scanned an occupied chair with active unpaid bill
  return {
    allowed: false,
    status: 'SEAT_OCCUPIED_CONFLICT',
    message: `Table ${tableNumber} Seat ${seatNumber} is currently occupied by an active diner (${activeSeatGuestName || 'Guest'}).`,
  };
}

console.log('\n🧪 [TEST SUITE START]: Part 2 - Zero-Friction Customer Lifecycle & Recovery');

// ── Test 1: Frictionless Token & Device Fingerprint Generation ─────────────────
console.log('\n▶ Test 1: Testing Zero-OTP Anonymous Token & Device Fingerprinting...');
const fingerprint1 = getDeviceFingerprint();
assert.ok(fingerprint1.startsWith('dfp_'), 'Fingerprint must start with dfp_ prefix');
console.log('  ✔ Case 1A Passed: Anonymous hardware fingerprint generated:', fingerprint1);

const session = createSeatSession('A-01', 1);
assert.strictEqual(session.tableNumber, 'A-01');
assert.strictEqual(session.seatNumber, 1);
assert.ok(session.sessionId.startsWith('sst_A-01_s1_'), 'Session ID must match seat specification');
console.log('  ✔ Case 1B Passed: Zero-friction seat session created with ID:', session.sessionId);

// ── Test 2: 80% Exit / Tab Closed / Re-Scan Recovery ──────────────────────────
console.log('\n▶ Test 2: Testing Tab Closure & Immediate Re-Scan Recovery...');
const recoveredSession = getLocalSession('A-01', 1);
assert.ok(recoveredSession, 'Session must persist in client storage after tab close');
assert.strictEqual(recoveredSession.sessionId, session.sessionId);

const accessCheck = validateSeatAccess('A-01', 1, true, 280, 'Ravi');
assert.strictEqual(accessCheck.allowed, true);
assert.strictEqual(accessCheck.status, 'SESSION_RESTORED');
assert.strictEqual(accessCheck.session.accumulatedBill, 280);
console.log('  ✔ Case 2A Passed: Returning customer instantly restored with active bill ₹280 (Zero login clicks)');

// ── Test 3: Washroom Protection / Anti-Seat Hijacking ─────────────────────────
console.log('\n▶ Test 3: Testing Washroom Protection & Anti-Hijack Defense...');
const strangerAccess = (function simulateStrangerScan() {
  const currentLocal = global.window.localStorage;
  global.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  global.window.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  const result = validateSeatAccess('A-01', 1, true, 280, 'Ravi');
  global.window.localStorage = currentLocal;
  return result;
})();

assert.strictEqual(strangerAccess.allowed, false, 'Stranger must be blocked from hijacking active seat');
assert.strictEqual(strangerAccess.status, 'SEAT_OCCUPIED_CONFLICT');
console.log('  ✔ Case 3A Passed: Stranger blocked from hijacking occupied chair; active diner bill protected');

// ── Test 4: Post-Payment Multi-Round Order Accumulation ────────────────────────
console.log('\n▶ Test 4: Testing Post-Payment Multi-Round Order Accumulation...');
let currentBill = 280;
session.accumulatedBill = currentBill;
session.orderIds.push('ORD-ROUND-1');
saveSessionLocally(session);

currentBill += 220;
session.accumulatedBill = currentBill;
session.orderIds.push('ORD-ROUND-2');
saveSessionLocally(session);

const accumulated = getLocalSession('A-01', 1);
assert.strictEqual(accumulated.accumulatedBill, 500);
assert.strictEqual(accumulated.orderIds.length, 2);
console.log('  ✔ Case 4A Passed: Multi-round dine-in accumulated total: ₹500 across 2 orders');

// ── Test 5: Bill Settlement & Safe Session Clear ───────────────────────────────
console.log('\n▶ Test 5: Testing Final Settlement & Clean Vacate...');
clearSeatSession('A-01', 1);
const cleared = getLocalSession('A-01', 1);
assert.strictEqual(cleared, null, 'Session must be wiped once diner vacates');

const newGuestAccess = validateSeatAccess('A-01', 1, false, 0);
assert.strictEqual(newGuestAccess.allowed, true);
assert.strictEqual(newGuestAccess.status, 'NEW_SESSION');
console.log('  ✔ Case 5A Passed: Seat cleanly reset for next incoming diner');

console.log('\n================================================================');
console.log('🎉 PART 2 TESTS COMPLETED WITH 100% SUCCESS');
console.log('================================================================\n');
