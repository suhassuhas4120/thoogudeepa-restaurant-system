'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge, SharedTable, SharedKDSTicket } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { useWaiterQuery } from '../../hooks/useWaiterQuery';
import {
  Users,
  Bell,
  Clock,
  CheckCircle2,
  Utensils,
  Lock,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW2TablesFeed: React.FC = () => {
  const { setCurrentScreen, selectTable, activeCaptain } = useWaiterStore();

  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterVacatesTable,
  } = useSharedBridge();

  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [activeFeedTab, setActiveFeedTab] = useState<'KITCHEN' | 'CUSTOMER'>('KITCHEN');

  // Dynamic Floor Metrics
  const activeOrdersCount = kdsTickets.filter(
    (tk) => tk.status !== 'COMPLETED'
  ).length;

  const occupiedCount = tables.filter(
    (t: SharedTable) => t.status === 'OCCUPIED' || t.status === 'BILLING'
  ).length;

  const vacantCount = tables.filter((t: SharedTable) => t.status === 'VACANT').length;

  const totalGuests = tables.reduce(
    (acc: number, t: SharedTable) =>
      acc + (t.status === 'OCCUPIED' || t.status === 'BILLING' ? t.guestCount || 0 : 0),
    0
  );

  const filterSections = ['ALL', 'SECTION A', 'SECTION B', 'SECTION C'];

  const filteredTables = tables.filter((table: SharedTable) => {
    if (selectedSection === 'ALL') return true;
    return table.section.toUpperCase().includes(selectedSection.replace('SECTION ', ''));
  });

  // Prioritize active kitchen tickets: READY first, then PREP (Cooking), then NEW (Queued)
  const activeKdsTickets = kdsTickets
    .filter((tk) => tk.status !== 'COMPLETED')
    .sort((a, b) => {
      const order: Record<string, number> = { READY: 0, PREP: 1, NEW: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  const readyPickupCount = kdsTickets.filter((tk) => tk.status === 'READY').length;

  const handleTableClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const handleVacateTable = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    waiterVacatesTable(tableNumber);
  };

  const handleServeReadyTable = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    const readyTicket = kdsTickets.find(
      (tk) => tk.tableNumber === tableNumber && tk.status === 'READY'
    );
    if (readyTicket) {
      waiterMarkKitchenItemServed(readyTicket.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'BILLING':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'CLEANING':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'VACANT':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <WaiterTabletHousing screenNumber={2} screenTitle="TABLES MATRIX &amp; DUAL FEEDS">
      <div className="flex-1 flex flex-col p-2.5 space-y-2.5 overflow-hidden">
        {/* Dynamic Floor Metrics Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-2xs shrink-0 select-none">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 mb-1.5 pb-1 border-b border-slate-100">
            <span className="uppercase text-slate-900 font-extrabold">[FLOOR METRICS]</span>
            <span className="text-slate-600">👤 {activeCaptain || 'Captain'}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px]">
            <div className="bg-slate-900 text-white rounded p-1">
              <div className="text-[8px] opacity-80 uppercase">OCCUPIED</div>
              <div className="text-xs font-black">{occupiedCount}</div>
            </div>
            <div className="bg-slate-100 text-slate-800 rounded p-1 border border-slate-200">
              <div className="text-[8px] text-slate-500 uppercase">VACANT</div>
              <div className="text-xs font-black">{vacantCount}</div>
            </div>
            <div className="bg-amber-50 text-amber-900 rounded p-1 border border-amber-200">
              <div className="text-[8px] text-amber-700 uppercase">ACTIVE KDS</div>
              <div className="text-xs font-black">{activeOrdersCount}</div>
            </div>
            <div className="bg-emerald-50 text-emerald-900 rounded p-1 border border-emerald-200">
              <div className="text-[8px] text-emerald-700 uppercase">SEATED</div>
              <div className="text-xs font-black">{totalGuests}</div>
            </div>
          </div>
        </div>

        {/* Top Section: Tables Matrix with Section Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs flex flex-col max-h-[300px]">
          {/* Section Filter Tabs */}
          <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {filterSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 transition cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-100 border border-slate-200 text-slate-600 hover:bg-stone-200'
                  }`}
                >
                  {sec.replace('SECTION ', 'SEC-')}
                </button>
              ))}
            </div>
            <span className="font-mono text-[9px] text-slate-400 font-bold shrink-0">
              {filteredTables.length} TBLS
            </span>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-3 gap-1.5 overflow-y-auto pr-0.5">
            {filteredTables.map((t: SharedTable) => {
              const isOccupied = t.status === 'OCCUPIED';
              const isBilling = t.status === 'BILLING';
              const isVacant = t.status === 'VACANT';
              const hasReadyItem = t.activeItems?.some(
                (it: { status?: string }) => it.status === 'Ready' || it.status === 'READY'
              );

              return (
                <motion.div
                  key={t.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleTableClick(t.number)}
                  className={`rounded-xl border p-1.5 text-center cursor-pointer transition shadow-2xs flex flex-col justify-between min-h-[90px] ${
                    hasReadyItem
                      ? 'border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50'
                      : isBilling
                      ? 'border-purple-300 bg-purple-50/40 hover:bg-purple-50/70'
                      : isOccupied
                      ? 'border-slate-300 bg-white hover:border-slate-400'
                      : 'border-slate-200 bg-stone-50/60 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-black text-slate-900">
                        {t.mergedWith ? `${t.number}+${t.mergedWith}` : t.number}
                      </span>
                      <span className="text-[8.5px] font-bold text-slate-400">
                        {t.section.replace('Section ', 'S-')}
                      </span>
                    </div>

                    {t.mergedWith ? (
                      <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[8px] font-mono font-black border bg-purple-100 text-purple-900 border-purple-300">
                        🔗 MERGED
                      </span>
                    ) : (
                      <span
                        className={`inline-block mt-0.5 px-1 py-0.2 rounded text-[8px] font-mono font-bold border ${getStatusBadge(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    )}

                    <div className="text-[8.5px] font-mono text-slate-500 mt-1 leading-tight">
                      {isOccupied || isBilling ? (
                        <>
                          <div className="font-bold text-slate-800">₹{t.currentBill}</div>
                          <div>⏱️ {t.seatedTime}</div>
                        </>
                      ) : (
                        <div>Cap: {t.capacity}p</div>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action Button */}
                  <div className="mt-1 pt-1 border-t border-slate-100">
                    {isBilling ? (
                      <button
                        type="button"
                        onClick={(e) => handleVacateTable(e, t.number)}
                        className="w-full py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-mono text-[8px] font-black tracking-wider transition cursor-pointer"
                      >
                        🧹 VACATE
                      </button>
                    ) : hasReadyItem ? (
                      <button
                        type="button"
                        onClick={(e) => handleServeReadyTable(e, t.number)}
                        className="w-full py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[8px] font-black tracking-wider transition cursor-pointer animate-pulse"
                      >
                        🍽️ SERVE
                      </button>
                    ) : isOccupied ? (
                      <div className="text-[7.5px] font-mono text-slate-400 font-bold">
                        🔒 IN SERVICE
                      </div>
                    ) : isVacant ? (
                      <div className="text-[7.5px] font-mono text-emerald-600 font-bold">
                        + SEAT
                      </div>
                    ) : (
                      <div className="text-[7.5px] font-mono text-slate-400 font-bold">
                        CLEANING
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Dual Operations Feeds */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveFeedTab('KITCHEN')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[9.5px] font-black transition cursor-pointer ${
                  activeFeedTab === 'KITCHEN'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                🍳 KITCHEN PASS ({activeKdsTickets.length})
                {readyPickupCount > 0 && (
                  <span className="ml-1 bg-emerald-500 text-white px-1 rounded-full text-[8px]">
                    {readyPickupCount} READY
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab('CUSTOMER')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[9.5px] font-black transition cursor-pointer ${
                  activeFeedTab === 'CUSTOMER'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                🔔 CALLS ({pings.length})
              </button>
            </div>
            <span className="text-[8.5px] font-mono text-slate-400 font-bold">
              {activeFeedTab === 'KITCHEN' ? 'QUEUED ➔ COOKING ➔ READY' : 'TABLE CALLS'}
            </span>
          </div>

          {/* Feed Content */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-2">
            {activeFeedTab === 'CUSTOMER' ? (
              pings.length > 0 ? (
                pings.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-orange-50/70 border border-orange-200 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-mono font-black text-slate-900 flex items-center gap-1 text-[11px]">
                        <span>TABLE [{p.tableNumber}]</span>
                        <span className="text-orange-700 font-bold">• {p.type}</span>
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                        {p.guestName} • {p.timestamp}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => waiterResolvePing(p.id)}
                      className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 text-[9.5px] font-mono font-bold transition cursor-pointer"
                    >
                      [RESOLVE]
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 font-mono text-[10.5px]">
                  [NO PENDING CUSTOMER CALLS]
                </div>
              )
            ) : activeKdsTickets.length > 0 ? (
              activeKdsTickets.map((kr: SharedKDSTicket) => {
                const isReady = kr.status === 'READY';
                const isCooking = kr.status === 'PREP';
                const isQueued = kr.status === 'NEW';

                return (
                  <div
                    key={kr.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs shadow-2xs transition ${
                      isReady
                        ? 'bg-emerald-50/90 border-emerald-300'
                        : isCooking
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex-1 mr-2">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-black text-slate-900 text-[11px]">
                          [{kr.tableNumber}]
                        </span>
                        {isReady ? (
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-black bg-emerald-600 text-white">
                            READY FOR PICKUP
                          </span>
                        ) : isCooking ? (
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-amber-200 text-amber-900">
                            COOKING
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-slate-200 text-slate-700">
                            QUEUED
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-[10px] text-slate-800 font-medium mt-1">
                        {kr.items.map((it) => `${it.name} × ${it.quantity}`).join(', ')}
                      </div>

                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {isReady
                          ? `Ready at ${kr.timestamp} • Pass window hot`
                          : isCooking
                          ? `In preparation • Cook time: ${kr.elapsedMinutes || 8}m`
                          : `Order ticket received at ${kr.timestamp}`}
                      </div>
                    </div>

                    {/* Action Button: Strictly ONLY active and clickable when READY */}
                    <div>
                      {isReady ? (
                        <button
                          type="button"
                          onClick={() => waiterMarkKitchenItemServed(kr.id)}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-[9.5px] font-mono font-black transition cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          [SERVE FOOD]
                        </button>
                      ) : isCooking ? (
                        <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-800 text-[9px] font-mono font-bold border border-amber-200 whitespace-nowrap">
                          COOKING...
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-600 text-[9px] font-mono font-bold border border-slate-200 whitespace-nowrap">
                          QUEUED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 font-mono text-[10.5px]">
                [NO ACTIVE KITCHEN TICKETS]
              </div>
            )}
          </div>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
