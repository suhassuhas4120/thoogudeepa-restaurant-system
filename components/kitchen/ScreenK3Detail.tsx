'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import {
  ArrowLeft,
  Clock,
  Bell,
  Sliders,
  Lock,
  LockOpen,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenK3Detail: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    tickets: localTickets,
    bumpItemStage,
    bumpTable,
    callFloorWaiter,
  } = useKitchenStore();

  // Bridge store for cross-section sync
  const {
    kdsTickets: bridgeTickets,
    inventory86,
    kitchenToggle86,
    kitchenUpdatePrepDelay,
    kitchenBumpItemStage,
    kitchenBumpTable,
  } = useSharedBridge();

  // ── Lock state for inventory panel ──────────────────────────────
  const [inventoryLocked, setInventoryLocked] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({}); // itemId → desired is86
  const [pendingDelays, setPendingDelays] = useState<Record<string, number>>({}); // itemId → delay delta
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Use bridge tickets if available (customer/waiter placed orders), else local seed tickets
  const allTickets = bridgeTickets.length > 0 ? bridgeTickets : localTickets.map((t) => ({
    ...t,
    source: 'WAITER' as const,
  }));

  const currentTicket =
    allTickets.find((t) => t.tableNumber === selectedTableNumber) ||
    allTickets[0];

  // ── Pending toggle 86 (only allowed when unlocked) ──────────────
  const handlePendingToggle = (itemId: string, currentIs86: boolean) => {
    if (inventoryLocked) return;
    setPendingChanges((prev) => ({
      ...prev,
      [itemId]: itemId in prev ? !prev[itemId] : !currentIs86,
    }));
  };

  const handlePendingDelay = (itemId: string, delta: number) => {
    if (inventoryLocked) return;
    setPendingDelays((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + delta,
    }));
  };

  // ── Apply all pending changes on UPDATE ─────────────────────────
  const handleUpdate = () => {
    // Apply 86 toggles
    Object.entries(pendingChanges).forEach(([itemId, newIs86]) => {
      const currentItem = inventory86.find((i) => i.id === itemId);
      if (currentItem && currentItem.is86 !== newIs86) {
        kitchenToggle86(itemId);
      }
    });
    // Apply delay changes
    Object.entries(pendingDelays).forEach(([itemId, delta]) => {
      if (delta !== 0) {
        kitchenUpdatePrepDelay(itemId, delta);
      }
    });

    // Reset pending
    setPendingChanges({});
    setPendingDelays({});
    setInventoryLocked(true);
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  // ── Discard pending changes ──────────────────────────────────────
  const handleDiscard = () => {
    setPendingChanges({});
    setPendingDelays({});
    setInventoryLocked(true);
  };

  const hasPendingChanges =
    Object.keys(pendingChanges).length > 0 || Object.keys(pendingDelays).length > 0;

  return (
    <KitchenTabletHousing
      screenNumber={3}
      screenTitle="TABLE DETAIL (55%) + MENU 86 INVENTORY (45%)"
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-stone-100 transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to All Tables</span>
            </button>
            <span className="font-mono text-sm font-black text-slate-900">
              Active Table: {currentTicket?.tableNumber ?? 'None'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Server: {currentTicket?.serverName ?? '—'}
            </span>
            <button
              onClick={() =>
                callFloorWaiter(
                  currentTicket?.tableNumber || selectedTableNumber,
                  'Urgent Pickup Required for Table'
                )
              }
              className="flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-800 hover:bg-orange-100 transition shadow-2xs cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5 text-orange-600" />
              <span>Call Runner to Table {currentTicket?.tableNumber ?? selectedTableNumber}</span>
            </button>
          </div>
        </div>

        {/* Main 55/45 Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── Left 55%: Table Deep Dive ───────────────────────── */}
          <div className="w-[55%] border-r border-slate-200 p-5 overflow-y-auto bg-stone-50/50 flex flex-col justify-between">
            <div className="space-y-4">
              {/* No ticket state */}
              {!currentTicket && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                  <CheckCircle2 className="h-12 w-12 text-slate-300" />
                  <div className="font-mono text-xs font-bold text-center">
                    No Active KDS Tickets<br />
                    <span className="text-[10px] font-normal">Orders will appear here when customers or waiters place them</span>
                  </div>
                </div>
              )}

              {currentTicket && (
                <>
                  {/* Ticket Summary Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                        Ticket #{currentTicket?.id}
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        Table {currentTicket?.tableNumber} • {currentTicket?.items.length} Dishes
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Source: {currentTicket?.source === 'CUSTOMER' ? '📱 Customer App' : '📟 Waiter Tablet'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-mono text-xs font-black text-orange-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>ELAPSED: {currentTicket?.elapsedMinutes} MIN</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Order Fired at {currentTicket?.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ordered Items &amp; Preparation Stages
                    </div>

                    {currentTicket?.items.map((it) => (
                      <div
                        key={it.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-orange-600">
                              {it.quantity}×
                            </span>
                            <span className="text-xs font-black text-slate-900 truncate">
                              {it.name}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
                            Prep: {it.prepMode}
                            {it.options ? ` • Option: ${it.options}` : ''}
                            {it.addOns && it.addOns.length > 0
                              ? ` • Add-ons: ${it.addOns.join(', ')}`
                              : ''}
                          </div>
                        </div>

                        {/* Stage Advancer Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono text-[10.5px] font-bold px-2 py-1 rounded-lg border ${
                              it.stage === 'PLATED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : it.stage === 'PREP'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : it.stage === 'SERVED'
                                ? 'bg-slate-100 text-slate-500 border-slate-200'
                                : 'bg-stone-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {it.stage}
                          </span>
                          {it.stage !== 'SERVED' && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                kitchenBumpItemStage(currentTicket.id, it.id);
                                bumpItemStage(currentTicket.id, it.id);
                              }}
                              className="rounded-xl bg-slate-900 px-3 py-1.5 font-mono text-xs font-black text-white hover:bg-slate-800 transition shadow-2xs cursor-pointer"
                            >
                              BUMP STAGE ➔
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bottom Actions */}
            {currentTicket && (
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => {
                    kitchenBumpTable(currentTicket?.id || '');
                    bumpTable(currentTicket?.id || '');
                  }}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition cursor-pointer"
                >
                  Mark All Dishes Plated &amp; Ready ✓
                </button>
              </div>
            )}
          </div>

          {/* ── Right 45%: Menu 86 Inventory & Delay Controller ─── */}
          <div className="w-[45%] bg-white p-5 overflow-y-auto flex flex-col gap-4">
            {/* Header with lock toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-black uppercase text-slate-700">
                <Sliders className="h-4 w-4 text-orange-600" />
                <span>Menu 86 / Out-of-Stock &amp; Prep Delay Controller</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">REAL-TIME SYNC</span>
            </div>

            {/* Lock / Unlock control */}
            <div className={`flex items-center justify-between rounded-xl border p-3 transition ${
              inventoryLocked
                ? 'border-slate-200 bg-stone-50'
                : 'border-orange-300 bg-orange-50'
            }`}>
              <div className="flex items-center gap-2">
                {inventoryLocked ? (
                  <Lock className="h-4 w-4 text-slate-500" />
                ) : (
                  <LockOpen className="h-4 w-4 text-orange-600" />
                )}
                <div>
                  <div className="font-mono text-[10.5px] font-black text-slate-800">
                    {inventoryLocked ? 'Inventory Locked — Click to Edit' : 'Editing Unlocked — Make Changes Then Update'}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {inventoryLocked
                      ? 'Unlock to mark items Available or Out of Stock'
                      : 'Changes are staged until you click UPDATE below'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!inventoryLocked) {
                    handleDiscard();
                  } else {
                    setInventoryLocked(false);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-[10.5px] font-black transition cursor-pointer ${
                  inventoryLocked
                    ? 'bg-slate-900 text-white hover:bg-black'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {inventoryLocked ? (
                  <>
                    <LockOpen className="h-3.5 w-3.5" />
                    <span>UNLOCK</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>CANCEL</span>
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed -mt-2">
              Toggling a dish to <strong>86 SOLD OUT</strong> immediately grays it out on all
              Customer QR menus and Waiter tablets. Adding prep delays updates live customer ETA.
            </p>

            {/* Update success banner */}
            <AnimatePresence>
              {updateSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-emerald-800 text-xs font-black"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ✓ MENU INVENTORY UPDATED — CHANGES SYNCED TO ALL SECTIONS
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inventory Items */}
            <div className="space-y-2.5 flex-1">
              {inventory86.map((item) => {
                // Get effective values (pending overrides the saved state)
                const effectiveIs86 =
                  item.id in pendingChanges ? pendingChanges[item.id] : item.is86;
                const effectiveDelay =
                  item.prepDelayMinutes + (pendingDelays[item.id] ?? 0);
                const hasPending =
                  item.id in pendingChanges || item.id in pendingDelays;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3 transition shadow-2xs flex items-center justify-between gap-3 ${
                      effectiveIs86
                        ? 'border-rose-200 bg-rose-50/50'
                        : hasPending
                        ? 'border-orange-200 bg-orange-50/40'
                        : 'border-slate-200 bg-stone-50/70'
                    } ${inventoryLocked ? 'opacity-90' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {item.name}
                        {hasPending && !inventoryLocked && (
                          <span className="ml-1.5 text-orange-600 text-[10px] font-black">Pending</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Category: {item.category}
                        {effectiveDelay > 0 && (
                          <span className="text-orange-600 font-bold ml-1.5">
                            (+{effectiveDelay}m delay)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delay & 86 Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Prep Delay */}
                      <div
                        className={`flex items-center gap-1 bg-white p-0.5 rounded-lg border text-xs font-mono transition ${
                          inventoryLocked
                            ? 'border-slate-100 opacity-40 pointer-events-none'
                            : 'border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => handlePendingDelay(item.id, -5)}
                          disabled={inventoryLocked}
                          className="px-1.5 py-0.5 hover:bg-stone-100 rounded text-slate-600 font-bold disabled:cursor-not-allowed cursor-pointer"
                        >
                          -5m
                        </button>
                        <button
                          onClick={() => handlePendingDelay(item.id, 5)}
                          disabled={inventoryLocked}
                          className="px-1.5 py-0.5 hover:bg-stone-100 rounded text-slate-900 font-black disabled:cursor-not-allowed cursor-pointer"
                        >
                          +5m
                        </button>
                      </div>

                      {/* 86 Toggle Button */}
                      <button
                        onClick={() => handlePendingToggle(item.id, item.is86)}
                        disabled={inventoryLocked}
                        title={inventoryLocked ? 'Unlock inventory to make changes' : undefined}
                        className={`rounded-xl px-3 py-1.5 font-mono text-[10.5px] font-black uppercase transition cursor-pointer ${
                          inventoryLocked
                            ? 'opacity-40 cursor-not-allowed border border-slate-200 bg-stone-50 text-slate-500'
                            : effectiveIs86
                            ? 'bg-rose-600 text-white shadow-xs hover:bg-rose-700'
                            : 'border border-slate-300 bg-white text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {effectiveIs86 ? '86 Sold Out' : 'In Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* UPDATE Button — only visible when unlocked */}
            <AnimatePresence>
              {!inventoryLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="border-t border-slate-200 pt-3 flex gap-2 shrink-0"
                >
                  <button
                    onClick={handleDiscard}
                    className="flex-1 rounded-xl border border-slate-300 bg-stone-50 py-3 font-mono text-xs font-black text-slate-600 hover:bg-stone-100 transition"
                  >
                    DISCARD CHANGES
                  </button>
                  <button
                    onClick={handleUpdate}
                    className={`flex-[2] rounded-xl py-3 font-mono text-xs font-black uppercase transition flex items-center justify-center gap-2 shadow-sm ${
                      hasPendingChanges
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>
                      UPDATE &amp; SYNC MENU{hasPendingChanges ? ` (${
                        Object.keys(pendingChanges).length + Object.keys(pendingDelays).length
                      } change${
                        Object.keys(pendingChanges).length + Object.keys(pendingDelays).length > 1 ? 's' : ''
                      })` : ''}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inventory Notice */}
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 text-[11px] text-orange-950 font-medium shrink-0">
              ⚡ <strong>Thoogudeepa Donne Biryani Inventory Notice:</strong> Marking items 86
              reflects instantaneously across all floor POS and live customer ordering pages.
            </div>
          </div>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};
