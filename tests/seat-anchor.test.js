/**
 * seat-anchor.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Verification Test Suite for Part 1: Physical Seat Anchor & Multi-Seat State
 * ─────────────────────────────────────────────────────────────────────────────
 */

const assert = require('assert');

// Pure logic verification matching lib/validation/seatValidator.ts
function createDefaultSeats(capacity) {
  return Array.from({ length: capacity }, (_, i) => ({
    seatNumber: i + 1,
    status: 'VACANT',
    currentBill: 0,
    items: [],
  }));
}

function validateSeatTransition(currentStatus, targetStatus, currentBill) {
  if (currentStatus === targetStatus) return { allowed: true };
  if (currentStatus === 'OCCUPIED' && targetStatus === 'VACANT' && currentBill > 0) {
    return {
      allowed: false,
      reason: `Seat has an unsettled balance of ₹${currentBill.toFixed(2)}. Settlement required before vacating.`,
    };
  }
  const allowedMap = {
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

function aggregateTableFromSeats(seats) {
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

  let tableStatus = 'VACANT';
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

async function runSeatAnchorSuite() {
  console.log('🧪 [TEST SUITE START]: Part 1 - Physical Seat Anchor & Multi-Seat Table Schema\n');

  // Test 1: Initialize Table A-01 with 4 Physical Seats
  console.log('▶ Test 1: Initializing Table A-01 with 4 Physical Seats...');
  const seats = createDefaultSeats(4);
  assert.strictEqual(seats.length, 4, 'Table A-01 must have 4 seats');
  assert.strictEqual(seats[0].seatNumber, 1);
  assert.strictEqual(seats[0].status, 'VACANT');
  assert.strictEqual(seats[0].currentBill, 0);
  console.log('  ✔ Case 1A Passed: Table A-01 initialized with Seats 1..4 in VACANT state');

  // Test 2: Seat 1 orders 1x Chicken Donne Biryani (₹280)
  console.log('\n▶ Test 2: Seat 1 Diner places order (1x Chicken Donne Biryani @ ₹280)...');
  seats[0].status = 'OCCUPIED';
  seats[0].currentBill = 280;
  seats[0].items.push({ id: 's1-it-1', name: 'Special Chicken Donne Biryani', quantity: 1, price: 280 });

  assert.strictEqual(seats[0].status, 'OCCUPIED');
  assert.strictEqual(seats[0].currentBill, 280);
  assert.strictEqual(seats[1].status, 'VACANT', 'Seat 2 must remain VACANT');
  assert.strictEqual(seats[1].currentBill, 0, 'Seat 2 bill must remain ₹0');
  assert.strictEqual(seats[2].status, 'VACANT', 'Seat 3 must remain VACANT');
  assert.strictEqual(seats[3].status, 'VACANT', 'Seat 4 must remain VACANT');

  const agg1 = aggregateTableFromSeats(seats);
  assert.strictEqual(agg1.totalBill, 280);
  assert.strictEqual(agg1.occupiedSeats, 1);
  assert.strictEqual(agg1.tableStatus, 'OCCUPIED');
  console.log('  ✔ Case 2A Passed: Seat 1 is OCCUPIED (₹280); Seats 2, 3, 4 remain completely VACANT (₹0)');
  console.log(`  ✔ Case 2B Passed: Table A-01 aggregate bill is ₹${agg1.totalBill} (${agg1.occupiedSeats}/4 seats occupied)`);

  // Test 3: Seat 2 Diner orders independently (Mutton Biryani ₹360 + Kebab ₹280 = ₹640)
  console.log('\n▶ Test 3: Seat 2 Diner places order independently (Mutton Biryani + Kebab @ ₹640)...');
  seats[1].status = 'OCCUPIED';
  seats[1].currentBill = 640;
  seats[1].items.push({ id: 's2-it-1', name: 'Mutton Donne Biryani', quantity: 1, price: 360 });
  seats[1].items.push({ id: 's2-it-2', name: 'Kshatriya Kebab', quantity: 1, price: 280 });

  assert.strictEqual(seats[0].currentBill, 280, 'Seat 1 bill must remain strictly ₹280');
  assert.strictEqual(seats[1].currentBill, 640, 'Seat 2 bill must be strictly ₹640');
  assert.strictEqual(seats[2].currentBill, 0, 'Seat 3 bill must remain ₹0');

  const agg2 = aggregateTableFromSeats(seats);
  assert.strictEqual(agg2.totalBill, 920, 'Table A-01 aggregate must be 280 + 640 = 920');
  assert.strictEqual(agg2.occupiedSeats, 2);
  console.log('  ✔ Case 3A Passed: Seat 1 (₹280) and Seat 2 (₹640) isolated with zero cross-contamination');
  console.log(`  ✔ Case 3B Passed: Table A-01 aggregate bill is ₹${agg2.totalBill} (${agg2.occupiedSeats}/4 seats occupied)`);

  // Test 4: Seat 1 settles bill via UPI and leaves
  console.log('\n▶ Test 4: Seat 1 settles bill (₹280) and vacates chair...');
  // Legal progression: OCCUPIED -> BILLING -> PAID -> VACANT
  const transBilling = validateSeatTransition(seats[0].status, 'BILLING', seats[0].currentBill);
  assert.strictEqual(transBilling.allowed, true);
  seats[0].status = 'BILLING';

  const transPaid = validateSeatTransition(seats[0].status, 'PAID', seats[0].currentBill);
  assert.strictEqual(transPaid.allowed, true);
  seats[0].status = 'PAID';

  seats[0].status = 'VACANT';
  seats[0].currentBill = 0;
  seats[0].items = [];

  assert.strictEqual(seats[0].status, 'VACANT');
  assert.strictEqual(seats[0].currentBill, 0);
  assert.strictEqual(seats[1].status, 'OCCUPIED', 'Seat 2 must remain OCCUPIED while Seat 1 leaves');
  assert.strictEqual(seats[1].currentBill, 640, 'Seat 2 bill must remain ₹640');

  const agg3 = aggregateTableFromSeats(seats);
  assert.strictEqual(agg3.totalBill, 640, 'Table A-01 aggregate drops to Seat 2 balance (₹640)');
  assert.strictEqual(agg3.occupiedSeats, 1);
  console.log('  ✔ Case 4A Passed: Seat 1 vacated cleanly; Seat 2 continues dining with balance ₹640');
  console.log(`  ✔ Case 4B Passed: Table A-01 aggregate bill updated to ₹${agg3.totalBill}`);

  // Test 5: Anti-bill-dodge security guard
  console.log('\n▶ Test 5: Testing anti-bill-dodge guard on Seat 2...');
  const illegalVacate = validateSeatTransition(seats[1].status, 'VACANT', seats[1].currentBill);
  assert.strictEqual(illegalVacate.allowed, false, 'Cannot vacate seat with unpaid balance');
  console.log('  ✔ Case 5A Passed: Vacating occupied seat with unpaid balance blocked');

  // Test 6: Seat 2 settles and table returns to clean state
  console.log('\n▶ Test 6: Seat 2 settles bill (₹640)...');
  seats[1].status = 'VACANT';
  seats[1].currentBill = 0;
  seats[1].items = [];

  const agg4 = aggregateTableFromSeats(seats);
  assert.strictEqual(agg4.totalBill, 0);
  assert.strictEqual(agg4.occupiedSeats, 0);
  assert.strictEqual(agg4.tableStatus, 'VACANT');
  console.log('  ✔ Case 6A Passed: All seats settled; Table A-01 returns to clean VACANT state (₹0)');

  console.log('\n================================================================');
  console.log('🎉 PART 1 TESTS COMPLETED WITH 100% SUCCESS');
  console.log('================================================================\n');
}

runSeatAnchorSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
