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
  const { setCurrentScreen, selectTable, activeCaptain, activeSection } = useWaiterStore();

  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterVacatesTable,
    waiterSeatsTable,
  } = useSharedBridge();

  const [selectedSection, setSelectedSection] = useState<string>(activeSection || 'ALL');
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

  const filterSections = ['ALL', 'SECTION A', 'SECTION B', 'TERRACE', 'FAMILY DINING'];

  const getSectionDisplayName = (sec: string) => {
    switch (sec) {
      case 'ALL':
        return 'All Tables';
      case 'SECTION A':
        return 'Section A';
      case 'SECTION B':
        return 'Section B';
      case 'TERRACE':
        return 'Terrace';
      case 'FAMILY DINING':
        return 'Family Dining';
      default:
        return sec;
    }
  };

  const filteredTables = tables.filter((table: SharedTable) => {
    if (selectedSection === 'ALL') return true;
    const tableSec = (table.section || '').trim().toUpperCase();
    const filterSec = selectedSection.trim().toUpperCase();
    if (filterSec === 'TERRACE') {
      return tableSec === 'TERRACE' || tableSec.includes('TERRACE') || tableSec === 'SECTION C';
    }
    if (filterSec === 'FAMILY DINING') {
      return tableSec === 'FAMILY DINING' || tableSec.includes('DINING');
    }
    return tableSec === filterSec;
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

  const handleSeatTable = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    waiterSeatsTable(tableNumber);
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
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs shrink-0 select-none">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 mb-1.5 pb-1 border-b border-slate-100">
            <span className="uppercase text-slate-900 font-extrabold">Floor Overview</span>
            <span className="text-slate-600 font-medium">👤 {activeCaptain || 'Captain'}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[9px]">
            <div className="bg-slate-900 text-white rounded-lg p-1.5">
              <div className="text-[8px] opacity-80 uppercase">Occupied</div>
              <div className="text-sm font-black">{occupiedCount}</div>
            </div>
            <div className="bg-slate-100 text-slate-800 rounded-lg p-1.5 border border-slate-200">
              <div className="text-[8px] text-slate-500 uppercase">Vacant</div>
              <div className="text-sm font-black">{vacantCount}</div>
            </div>
            <div className="bg-amber-50 text-amber-900 rounded-lg p-1.5 border border-amber-200">
              <div className="text-[8px] text-amber-700 uppercase">Orders</div>
              <div className="text-sm font-black">{activeOrdersCount}</div>
            </div>
            <div className="bg-emerald-50 text-emerald-900 rounded-lg p-1.5 border border-emerald-200">
              <div className="text-[8px] text-emerald-700 uppercase">Seated</div>
              <div className="text-sm font-black">{totalGuests}</div>
            </div>
          </div>
        </div>

        {/* Top Section: Tables Matrix (1 Row = 2 Tables Only) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs flex flex-col max-h-[320px]">
          {/* Section Filter Tabs */}
          <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {filterSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 transition duration-150 cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
                      : 'bg-stone-50 border border-slate-300 text-slate-700 hover:bg-stone-200 hover:text-slate-950'
                  }`}
                >
                  {getSectionDisplayName(sec)}
                </button>
              ))}
            </div>
            <span className="font-mono text-[9.5px] text-slate-400 font-bold shrink-0">
              {filteredTables.length} Tables
            </span>
          </div>

          {/* Tables Grid: 2 Tables per Row with Proper Height */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-0.5">
            {filteredTables.map((t: SharedTable) => {
              const isOccupied = t.status === 'OCCUPIED';
              const isBilling = t.status === 'BILLING';
              const isVacant = t.status === 'VACANT';
              const isCleaning = t.status === 'CLEANING';
              const hasReadyItem = t.activeItems?.some(
                (it: { status?: string }) => it.status === 'Ready' || it.status === 'READY'
              );

              return (
                <motion.div
                  key={t.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTableClick(t.number)}
                  className={`rounded-xl border p-2.5 text-center cursor-pointer transition shadow-2xs flex flex-col justify-between min-h-[114px] ${
                    hasReadyItem
                      ? 'border-emerald-500 bg-emerald-50/60 hover:bg-emerald-50 ring-1 ring-emerald-500/30'
                      : isBilling
                      ? 'border-purple-300 bg-purple-50/50 hover:bg-purple-50/80 ring-1 ring-purple-400/20'
                      : isOccupied
                      ? 'border-slate-300 bg-white hover:border-slate-400'
                      : 'border-slate-200 bg-stone-50/70 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-black text-slate-900">
                        {t.mergedWith ? `${t.number} + ${t.mergedWith}` : t.number}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {t.section}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-1">
                      {t.mergedWith ? (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black border bg-purple-100 text-purple-900 border-purple-300">
                          Merged
                        </span>
                      ) : (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold border uppercase ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      )}
                    </div>

                    <div className="text-[9.5px] font-mono text-slate-600 mt-1 leading-tight">
                      {isOccupied || isBilling ? (
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-slate-900">₹{t.currentBill}</span>
                          <span className="text-slate-500">⏱ {t.seatedTime}</span>
                        </div>
                      ) : (
                        <div className="text-slate-400">Capacity: {t.capacity} guests</div>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action Button with light colors & high-contrast hover */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                    {isBilling ? (
                      <button
                        type="button"
                        onClick={(e) => handleVacateTable(e, t.number)}
                        className="w-full py-1.5 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-900 hover:text-white border border-purple-300 hover:border-purple-600 font-mono text-[9.5px] font-black tracking-wider transition duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                      >
                        Vacate Table
                      </button>
                    ) : hasReadyItem ? (
                      <button
                        type="button"
                        onClick={(e) => handleServeReadyTable(e, t.number)}
                        className="w-full py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-900 hover:text-white border border-emerald-400 hover:border-emerald-600 font-mono text-[9.5px] font-black tracking-wider transition duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-1 animate-pulse"
                      >
                        Serve Food 🍽️
                      </button>
                    ) : isOccupied ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableClick(t.number);
                        }}
                        className="w-full py-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-300 hover:border-amber-600 font-mono text-[9.5px] font-black tracking-wider transition duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                      >
                        Manage Table
                      </button>
                    ) : isVacant ? (
                      <button
                        type="button"
                        onClick={(e) => handleSeatTable(e, t.number)}
                        className="w-full py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 font-mono text-[9.5px] font-black tracking-wider transition duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                      >
                        + Seat
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          waiterVacatesTable(t.number);
                        }}
                        className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-900 hover:text-white border border-blue-300 hover:border-blue-600 font-mono text-[9.5px] font-black tracking-wider transition duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                      >
                        Ready Table
                      </button>
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
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFeedTab('KITCHEN')}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeFeedTab === 'KITCHEN'
                    ? 'bg-slate-900 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                <span>🍳 Kitchen Orders ({activeKdsTickets.length})</span>
                {readyPickupCount > 0 && (
                  <span className="ml-1 bg-emerald-500 text-white px-1.5 py-0.2 rounded-full text-[8.5px] font-black animate-pulse">
                    {readyPickupCount} Ready
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab('CUSTOMER')}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeFeedTab === 'CUSTOMER'
                    ? 'bg-orange-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:bg-stone-100'
                }`}
              >
                <span>🔔 Guest Calls ({pings.length})</span>
              </button>
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold">
              {activeFeedTab === 'KITCHEN' ? 'Kitchen Pass Live' : 'Table Calls'}
            </span>
          </div>

          {/* Feed Content */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-2">
            {activeFeedTab === 'CUSTOMER' ? (
              pings.length > 0 ? (
                pings.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-mono font-black text-slate-900 flex items-center gap-1 text-[11px]">
                        <span>Table {p.tableNumber}</span>
                        <span className="text-orange-700 font-bold">• {p.type}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {p.guestName} • {p.timestamp}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => waiterResolvePing(p.id)}
                      className="rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-900 hover:text-white border border-orange-300 hover:border-orange-600 px-3 py-1.5 text-[10px] font-mono font-bold transition duration-150 cursor-pointer shadow-2xs"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 font-mono text-[11px] flex flex-col items-center justify-center gap-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>No pending customer assistance calls</span>
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
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs shadow-2xs transition ${
                      isReady
                        ? 'bg-emerald-50/90 border-emerald-300'
                        : isCooking
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex-1 mr-2">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-black text-slate-900 text-xs">
                          Table {kr.tableNumber}
                        </span>
                        {isReady ? (
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black bg-emerald-600 text-white">
                            Ready for Pickup
                          </span>
                        ) : isCooking ? (
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-200 text-amber-900">
                            Cooking
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-slate-200 text-slate-700">
                            Queued
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-[10.5px] text-slate-800 font-medium mt-1">
                        {kr.items.map((it) => `${it.name} × ${it.quantity}`).join(', ')}
                      </div>

                      <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                        {isReady
                          ? `Ready at ${kr.timestamp} • Hot on pass window`
                          : isCooking
                          ? `In preparation • Cook time: ${kr.elapsedMinutes || 8}m`
                          : `Order ticket received at ${kr.timestamp}`}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isReady ? (
                        <button
                          type="button"
                          onClick={() => waiterMarkKitchenItemServed(kr.id)}
                          className="rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-900 hover:text-white border border-emerald-400 hover:border-emerald-600 px-3 py-1.5 text-[10px] font-mono font-black transition duration-150 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          Serve Food
                        </button>
                      ) : isCooking ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[9.5px] font-mono font-bold border border-amber-200 whitespace-nowrap">
                          Cooking...
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[9.5px] font-mono font-bold border border-slate-200 whitespace-nowrap">
                          Queued
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 font-mono text-[11px] flex flex-col items-center justify-center gap-1">
                <Utensils className="h-5 w-5 text-slate-300" />
                <span>No active kitchen orders</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
