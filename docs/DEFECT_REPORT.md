# Defect report - thoogudeepa-restaurant-system (develop snapshot)

Method: read API routes, auth, validators, session manager, DB layer and the changed
stores (useSharedBridge, useCustomerStore, types/kitchen), then wrote Vitest tests that
assert the CORRECT behaviour. A failing test = a confirmed defect in the current code.

Result: 55 tests, 35 failing (34 confirmed defects + D39, which needs your confirmation), 20 passing (controls and behaviour that is correct).
Existing repo tests (test:core, 8 scripts) all pass and `tsc --noEmit` is clean,
but none of them catch the defects below.

## CRITICAL (security / money)
| ID | Defect | Where |
|----|--------|-------|
| D1 | Hardcoded manager PIN `9999` accepted from the request body -> anyone can apply any discount | app/api/billing/settle/route.ts:15 |
| D2 | Kitchen master PIN `1234` is also the Cashier (MANAGER) PIN -> kitchen login = manager access, incl. /api/audit | types/kitchen.ts:19, lib/auth/jwt.ts:29 |
| D3 | /api/realtime/publish has no auth -> anyone can broadcast fake events to every portal | realtime/publish/route.ts |
| D4 | POST /api/audit/logs has no auth (middleware only guards GET paths it matches, POST is open) -> forged audit entries | audit/logs/route.ts |
| D5 | /api/inventory/86 unauthenticated -> anyone can sell-out dishes | inventory/86/route.ts |
| D6 | /api/billing/settle unauthenticated -> anyone can create invoices | billing/settle/route.ts |
| D7 | /api/service/pings PATCH unauthenticated | service/pings/route.ts |
| D8 | JWT secret falls back to a hardcoded string; a forged ADMIN token verifies when JWT_SECRET is unset | lib/auth/jwt.ts:3 |
| D9 | Server trusts client `foodSubtotal`; line items are ignored -> invoice amount can be set freely | billingValidator.ts:55 |
| D35 | waiterVacatesTable only console.warn()s on an unpaid bill, then vacates anyway -> bill silently lost | useSharedBridge.ts ~1519 |
| D36 | Payment is not idempotent: double-tap records revenue and tablesServed twice | waiterRecordsPayment |
| D37/D38 | Negative or NaN payment amount accepted -> negative/NaN shift revenue | waiterRecordsPayment |
| D43 | mergeBridgeState: OCCUPIED always beats VACANT, so a stale broadcast resurrects a settled seat (ghost bill) | mergeBridgeState |

## HIGH
| ID | Defect |
|----|--------|
| D10-D12 | NaN discount/tip and Infinity subtotal pass validation (NaN comparisons are false) |
| D13/D14 | Negative tip silently clamped; zero-value invoice accepted |
| D18/D19 | Tax mismatch: customer store rounds 5% to whole rupees (130 -> 7), server computes 2.5%+2.5% to 2dp (6.5), bridge breakdown rounds each half to integer (3) - the guest sees one total, the invoice records another |
| D40 | seatSettlesBill on a vacant seat writes a Rs 0 settlement record |
| D41 | Settlement id `set-seat-${Date.now()}` collides within the same ms |
| D42 | seatSettlesBill accepts any paymentMode string (e.g. BITCOIN) |
| D44 | KDS ticket sort is a string compare on "hh:mm AM/PM" -> wrong order across noon/midnight |
| D46 | Item stage can regress (stale PLACED overwrites SERVED) when ticket rank ties |
| D47 | 86 flag is sticky in merge: un-86 on one device is reverted |
| D33/D34 | Unknown dish silently priced Rs 240; price 0 (complimentary) falls back to menu price |

## MEDIUM
| ID | Defect |
|----|--------|
| D22 | KOT quantity has no upper bound (1e9 accepted) |
| D26 | KOT notes have no length limit |
| D27 | Duplicate dishes in one KOT are not merged |
| D29 | Dish name comes from the client, unsanitised (price/name spoofing, markup injection) |
| D30 | Malformed JSON returns 500 instead of 400 on every route |
| D17 | (design risk, test only documents format and passes) Invoice and KOT counters live in memory: numbers restart at 1001/101 after a restart or redeploy, so duplicates are likely |

## Needs your confirmation (may be intended)
- D39: after waiterRecordsPayment the table stays BILLING, not paid/vacant.
- D20 (test passes, documents behaviour): a 100% discount still charges 5% GST on the full subtotal.
- Client-side only PIN gating for the kitchen portal (KITCHEN_MASTER_PIN is shipped in the browser bundle).

## Passed
Table-number normalisation, KOT NaN/0.5 quantity handling, ticket status never regresses (D45),
settled ping not re-opened (D48), merge does not mutate state (D49), signed JWT round-trip.

## Notes on running
- defects.api.test.ts must run in the node environment (file already has the docblock);
  `jose` breaks under jsdom.
- These tests are meant to fail until the bugs are fixed. Put them behind a separate script
  (`test:defects`) or a non-blocking CI step so the main CI stays green.
