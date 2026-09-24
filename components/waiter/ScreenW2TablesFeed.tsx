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
  } = useSharedBridge();

  const kitchenReadyItems = kdsTickets.filter((tk) => tk.status === 'READY');

  const { isFetching: isFloorSyncing } = useWaiterQuery();
  const [activeTab, setActiveTab] = useState<'PINGS' | 'KITCHEN_READY'>('PINGS');

  const handleTableClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
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

  return (
    <WaiterTabletHousing screenNumber={2} screenTitle="ALL TABLES & LIVE FEEDS (60/40)">
      <div className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
        {/* Top 60%: Floor Tables Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              [TABLES MATRIX — TAP TO OPEN DETAIL]
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Sync
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tables.map((t) => (
              <motion.div
                key={t.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleTableClick(t.number)}
                className="rounded-xl border border-slate-200 bg-stone-50/70 p-2 text-center cursor-pointer hover:bg-white hover:border-orange-400 transition shadow-2xs"
              >
                <div className="font-mono text-sm font-black text-slate-900">
                  {t.mergedWith ? `${t.number}+${t.mergedWith}` : t.number}
                </div>
                {t.mergedWith ? (
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black border bg-purple-100 text-purple-900 border-purple-300">
                    🔗 MERGED
                  </span>
                ) : (
                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold border ${getStatusBadge(t.status)}`}>
                    {t.status}
                  </span>
                )}
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  {t.status === 'OCCUPIED' || t.status === 'BILLING'
                    ? `₹${t.currentBill} • ${t.seatedTime}`
                    : `Cap: ${t.capacity}`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom 40%: Live Dual Feed */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('PINGS')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-black transition ${
                  activeTab === 'PINGS' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                CUSTOMER PINGS ({pings.length})
              </button>
              <button
                onClick={() => setActiveTab('KITCHEN_READY')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-black transition ${
                  activeTab === 'KITCHEN_READY' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                READY PICKUP ({kitchenReadyItems.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-2">
            {activeTab === 'PINGS' ? (
              pings.length > 0 ? (
                pings.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-orange-50/70 border border-orange-200 text-xs"
                  >
                    <div>
                      <div className="font-mono font-black text-slate-900">
                        TABLE [{p.tableNumber}] • {p.type}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.guestName} • {p.timestamp}
                      </div>
                    </div>
                    <button
                      onClick={() => waiterResolvePing(p.id)}
                      className="rounded-lg bg-orange-600 text-white px-2 py-1 text-[10px] font-mono font-bold hover:bg-orange-700"
                    >
                      [RESOLVE]
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
                  [NO PENDING CUSTOMER PINGS]
                </div>
              )
            ) : kitchenReadyItems.length > 0 ? (
              kitchenReadyItems.map((kr) => (
                <div
                  key={kr.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs"
                >
                  <div>
                    <div className="font-mono font-black text-slate-900">
                      [{kr.tableNumber}] {kr.items[0]?.name ?? 'Dishes'} × {kr.items.reduce((s, i) => s + i.quantity, 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ready at {kr.timestamp} • {kr.items.length} item(s)
                    </div>
                  </div>
                  <button
                    onClick={() => waiterMarkKitchenItemServed(kr.id, kr.items[0]?.id ?? '')}
                    className="rounded-lg bg-emerald-600 text-white px-2 py-1 text-[10px] font-mono font-bold hover:bg-emerald-700"
                  >
                    [SERVED]
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
                [NO DISHES WAITING AT PASS]
              </div>
            )}
          </div>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
