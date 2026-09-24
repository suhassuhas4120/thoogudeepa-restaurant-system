'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { useWaiterQuery } from '../../hooks/useWaiterQuery';
import {
  Users,
  Bell,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
  Utensils,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW2TablesFeed: React.FC = () => {
  const { setCurrentScreen, selectTable } = useWaiterStore();

  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterMarkTableFoodServed,
  } = useSharedBridge();

  const [activeTab, setActiveTab] = useState<'KITCHEN_FEED' | 'PINGS'>('KITCHEN_FEED');
  const [kitchenFilter, setKitchenFilter] = useState<'ALL' | 'READY' | 'PREP' | 'PLACED'>('ALL');

  const handleTableClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const getTableFoodStatus = (t: typeof tables[0]) => {
    if (!t.activeItems || t.activeItems.length === 0) return null;

    const hasReady = t.activeItems.some(
      (i) => i.status.toLowerCase() === 'ready' || i.status.toLowerCase() === 'plated'
    );
    if (hasReady) return { label: 'Ready to Serve', state: 'READY' };

    const hasPreparing = t.activeItems.some(
      (i) =>
        i.status.toLowerCase() === 'preparing' ||
        i.status.toLowerCase() === 'cooking' ||
        i.status.toLowerCase() === 'prep'
    );
    if (hasPreparing) return { label: 'Preparing', state: 'PREPARING' };

    const hasPlaced = t.activeItems.some(
      (i) =>
        i.status.toLowerCase() === 'placed' ||
        i.status.toLowerCase() === 'received' ||
        i.status.toLowerCase() === 'new'
    );
    if (hasPlaced) return { label: 'Order Placed', state: 'PLACED' };

    const allServed = t.activeItems.every((i) => i.status.toLowerCase() === 'served');
    if (allServed) return { label: 'Served', state: 'SERVED' };

    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'BILLING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CLEANING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VACANT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-stone-100 text-slate-700 border-slate-200';
    }
  };

  // Filtered kitchen tickets
  const filteredTickets = kdsTickets.filter((tk) => {
    if (kitchenFilter === 'READY') return tk.status === 'READY';
    if (kitchenFilter === 'PREP') return tk.status === 'PREP';
    if (kitchenFilter === 'PLACED') return tk.status === 'NEW';
    return true;
  });

  const readyCount = kdsTickets.filter((tk) => tk.status === 'READY').length;
  const prepCount = kdsTickets.filter((tk) => tk.status === 'PREP').length;
  const placedCount = kdsTickets.filter((tk) => tk.status === 'NEW').length;

  return (
    <WaiterTabletHousing screenNumber={2} screenTitle="FLOOR TABLES &amp; LIVE KITCHEN FEED">
      <div className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
        {/* Top Section: Floor Tables Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
              FLOOR TABLES OVERVIEW
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Sync
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tables.map((t) => {
              const foodStatus = getTableFoodStatus(t);

              return (
                <motion.div
                  key={t.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleTableClick(t.number)}
                  className="rounded-xl border border-slate-200 bg-stone-50/70 p-2 text-center cursor-pointer hover:bg-white hover:border-orange-400 transition shadow-2xs"
                >
                  <div className="font-mono text-sm font-black text-slate-900">
                    {t.mergedWith ? `${t.number}+${t.mergedWith}` : t.number}
                  </div>

                  {/* Table Status Badge */}
                  <div className="flex flex-col items-center gap-1 mt-1">
                    {t.mergedWith ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black border bg-purple-100 text-purple-900 border-purple-300">
                        🔗 Merged
                      </span>
                    ) : (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    )}

                    {/* Real-Time Food Lifecycle Badge */}
                    {foodStatus && (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold border ${
                          foodStatus.state === 'READY'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                            : foodStatus.state === 'PREPARING'
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : foodStatus.state === 'PLACED'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {foodStatus.state === 'READY' && '● '}
                        {foodStatus.state === 'PREPARING' && '⏳ '}
                        {foodStatus.state === 'PLACED' && '📝 '}
                        {foodStatus.state === 'SERVED' && '✓ '}
                        {foodStatus.label}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {t.status === 'OCCUPIED' || t.status === 'BILLING'
                      ? `₹${t.currentBill} • ${t.seatedTime}`
                      : `Cap: ${t.capacity}`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Live Kitchen & Service Feed */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col overflow-hidden">
          {/* Main Feed Tabs */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveTab('KITCHEN_FEED')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'KITCHEN_FEED'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                <span>Kitchen Orders ({kdsTickets.length})</span>
                {readyCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {readyCount} Ready
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('PINGS')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition ${
                  activeTab === 'PINGS'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                Customer Calls ({pings.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-2">
            {activeTab === 'KITCHEN_FEED' ? (
              <div className="space-y-2">
                {/* Stage Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  <button
                    onClick={() => setKitchenFilter('ALL')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                      kitchenFilter === 'ALL'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-stone-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    All ({kdsTickets.length})
                  </button>
                  <button
                    onClick={() => setKitchenFilter('READY')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                      kitchenFilter === 'READY'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    Ready ({readyCount})
                  </button>
                  <button
                    onClick={() => setKitchenFilter('PREP')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                      kitchenFilter === 'PREP'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-orange-50 text-orange-800 border-orange-200'
                    }`}
                  >
                    Preparing ({prepCount})
                  </button>
                  <button
                    onClick={() => setKitchenFilter('PLACED')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                      kitchenFilter === 'PLACED'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    Placed ({placedCount})
                  </button>
                </div>

                {filteredTickets.length > 0 ? (
                  filteredTickets.map((tk) => {
                    const isReady = tk.status === 'READY';
                    const isPrep = tk.status === 'PREP';
                    const isPlaced = tk.status === 'NEW';
                    const isCompleted = tk.status === 'COMPLETED';

                    return (
                      <div
                        key={tk.id}
                        className={`p-2.5 rounded-xl border text-xs transition ${
                          isReady
                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-500/20'
                            : isPrep
                            ? 'bg-orange-50/60 border-orange-200'
                            : isPlaced
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-black text-slate-900">Table {tk.tableNumber}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-500">{tk.timestamp}</span>
                          </div>

                          {/* Food Status Badge */}
                          <span
                            className={`text-[9.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                              isReady
                                ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                                : isPrep
                                ? 'bg-orange-100 text-orange-800 border-orange-300'
                                : isPlaced
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {isReady && 'Ready for Pickup'}
                            {isPrep && 'In Preparation'}
                            {isPlaced && 'Order Placed'}
                            {isCompleted && 'Served to Table'}
                          </span>
                        </div>

                        {/* Dish Items */}
                        <div className="space-y-0.5 my-1.5">
                          {tk.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] font-mono text-slate-700">
                              <span className="font-semibold">
                                {it.quantity}x {it.name}
                              </span>
                              <span className="text-[10px] text-slate-500 capitalize">
                                {it.stage === 'PLATED' ? 'Plated at Pass' : it.stage === 'PREP' ? 'Cooking' : it.stage === 'PLACED' ? 'Placed' : 'Served'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Serve Button: ONLY ACTIVE WHEN FOOD IS PREPARED AND READY! */}
                        <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[9.5px] font-mono text-slate-400">
                            {isReady
                              ? 'Chef marked dish ready at pass window'
                              : isPrep
                              ? 'Chefs are currently preparing food'
                              : isPlaced
                              ? 'Order queued in kitchen'
                              : 'Delivered to guests'}
                          </span>

                          {isReady ? (
                            <button
                              onClick={() => waiterMarkKitchenItemServed(tk.id, tk.items[0]?.id || '')}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[10px] font-mono font-bold transition shadow-xs active:scale-95 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Serve to Table</span>
                            </button>
                          ) : isPrep ? (
                            <button
                              disabled
                              className="rounded-lg bg-orange-100 border border-orange-200 text-orange-800 px-2 py-1 text-[9.5px] font-mono font-bold cursor-not-allowed opacity-80"
                            >
                              Cooking in Kitchen
                            </button>
                          ) : isPlaced ? (
                            <button
                              disabled
                              className="rounded-lg bg-amber-100 border border-amber-200 text-amber-800 px-2 py-1 text-[9.5px] font-mono font-bold cursor-not-allowed opacity-80"
                            >
                              In Prep Queue
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Delivered
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
                    No kitchen orders matching filter
                  </div>
                )}
              </div>
            ) : pings.length > 0 ? (
              pings.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs font-mono"
                >
                  <div>
                    <div className="font-black text-slate-900">
                      Table {p.tableNumber} • Request: {p.type}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {p.guestName} • {p.timestamp}
                    </div>
                  </div>
                  <button
                    onClick={() => waiterResolvePing(p.id)}
                    className="rounded-lg bg-orange-600 text-white px-2.5 py-1 text-[10px] font-bold hover:bg-orange-700 transition"
                  >
                    Resolve Call
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
                No pending customer assistance requests
              </div>
            )}
          </div>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
