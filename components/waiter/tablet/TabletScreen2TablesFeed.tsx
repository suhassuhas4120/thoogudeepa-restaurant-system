'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge, SharedTable, SharedPing, SharedKDSTicket } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { Bell, CheckCircle2, Utensils, Users, Lock, Sparkles } from 'lucide-react';

export const TabletScreen2TablesFeed: React.FC = () => {
  const { selectTable, setCurrentScreen, activeCaptain, activeSection } = useWaiterStore();
  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterVacatesTable,
  } = useSharedBridge();

  const [selectedSection, setSelectedSection] = useState<string>('ALL');

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

  // Section Filter options
  const filterSections = ['ALL', 'SECTION A', 'SECTION B', 'SECTION C'];

  const filteredTables = tables.filter((table: SharedTable) => {
    if (selectedSection === 'ALL') return true;
    return table.section.toUpperCase().includes(selectedSection.replace('SECTION ', ''));
  });

  // Prioritize Kitchen Tickets: READY first, then PREP, then NEW
  const activeKdsTickets = kdsTickets
    .filter((tk) => tk.status !== 'COMPLETED')
    .sort((a, b) => {
      const order: Record<string, number> = { READY: 0, PREP: 1, NEW: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  const handleTableCardClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const handleVacateTable = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    waiterVacatesTable(tableNumber);
  };

  const handleServeReadyTable = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    // Find any ready ticket for this table and mark served
    const readyTicket = kdsTickets.find(
      (tk) => tk.tableNumber === tableNumber && tk.status === 'READY'
    );
    if (readyTicket) {
      waiterMarkKitchenItemServed(readyTicket.id);
    }
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={2}
      screenTitle="ALL TABLES MATRIX &amp; DUAL LIVE OPERATIONS FEED"
    >
      <div className="flex flex-col flex-1 min-h-[700px]">
        {/* TOP FLOOR METRICS HEADER (100% DYNAMIC DATA) */}
        <div className="border-b-2 border-slate-800 bg-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <span className="font-extrabold text-slate-950 uppercase tracking-wider">
              [FLOOR METRICS]:
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              TOTAL: {tables.length}
            </span>
            <span className="border border-slate-900 bg-slate-900 px-2.5 py-1 rounded font-bold text-white">
              OCCUPIED: {occupiedCount}
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              VACANT: {vacantCount}
            </span>
            <span className="border border-amber-300 bg-amber-50 px-2.5 py-1 rounded font-bold text-amber-900">
              ACTIVE ORDERS: {activeOrdersCount}
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              GUESTS SEATED: {totalGuests}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="border-2 border-slate-900 bg-slate-100 px-3 py-1 rounded font-black text-slate-900">
              👤 [ACTIVE: {activeCaptain || 'Captain Ramesh'}]
            </span>
            <button
              type="button"
              onClick={() => setCurrentScreen(10)}
              className="border border-slate-800 bg-white hover:bg-slate-100 text-slate-900 px-3 py-1 rounded font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>📊 [SHIFT STATS]</span>
            </button>
          </div>
        </div>

        {/* MAIN SPLIT: LEFT 60% (3-COL TABLES MATRIX) / RIGHT 40% (DUAL OPERATIONS FEED) */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT 60%: ALL TABLES 3-COLUMN MATRIX */}
          <div className="w-[60%] border-r-2 border-slate-800 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            {/* Floor Section Tabs & Subtitle */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2.5 shrink-0 font-mono">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
                  FLOOR SECTIONS:
                </span>
                {filterSections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer ${
                      selectedSection === sec
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                Showing {filteredTables.length} Tables
              </span>
            </div>

            {/* 3-Column Tables Grid */}
            <div className="grid grid-cols-3 gap-3">
              {filteredTables.map((table: SharedTable) => {
                const isOccupied = table.status === 'OCCUPIED';
                const isBilling = table.status === 'BILLING';
                const isCleaning = table.status === 'CLEANING';
                const isVacant = table.status === 'VACANT';

                const hasReadyItem = table.activeItems?.some(
                  (it: { status?: string }) => it.status === 'Ready' || it.status === 'READY'
                );

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableCardClick(table.number)}
                    className={`bg-white border-2 rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition shadow-xs hover:border-black hover:-translate-y-0.5 ${
                      hasReadyItem
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : table.mergedWith
                        ? 'border-purple-500 ring-2 ring-purple-500/20'
                        : isBilling
                        ? 'border-cyan-500'
                        : isOccupied
                        ? 'border-slate-800'
                        : 'border-slate-300'
                    }`}
                  >
                    {/* Card Top Row: Number, Merged Tag, Status */}
                    <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-1.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-black text-slate-950">
                          {table.mergedWith
                            ? `[${table.number} + ${table.mergedWith}]`
                            : `[${table.number}]`}
                        </strong>
                        {table.mergedWith && (
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                            MERGED
                          </span>
                        )}
                        {hasReadyItem && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          hasReadyItem
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : isBilling
                            ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                            : isOccupied
                            ? 'bg-orange-50 text-orange-950 border-orange-300'
                            : isCleaning
                            ? 'bg-rose-50 text-rose-900 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {isBilling
                          ? 'BILL PAID'
                          : isOccupied
                          ? `⏱ ${table.seatedTime}`
                          : table.status}
                      </span>
                    </div>

                    {/* Ordered Items Preview */}
                    <div className="text-[11px] font-mono flex flex-col gap-1 text-slate-700 min-h-[46px]">
                      {table.activeItems && table.activeItems.length > 0 ? (
                        table.activeItems.slice(0, 2).map((item: any, idx: number) => {
                          const isItemReady =
                            item.status === 'Ready' || item.status === 'READY';
                          return (
                            <div key={idx} className="truncate flex justify-between items-center">
                              <span className="truncate text-[10.5px]">
                                • {item.quantity}x {item.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold ml-1 px-1 py-0.2 rounded shrink-0 ${
                                  isItemReady
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'text-slate-500 bg-slate-100'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 italic text-[10.5px]">
                          {table.mergedWith
                            ? `[Shared with Table ${table.mergedWith}]`
                            : '[Table Ready • No active orders]'}
                        </span>
                      )}
                    </div>

                    {/* Bill & Guest Capacity Info */}
                    <div className="flex justify-between items-center font-mono text-[10.5px] pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-500">
                        {isOccupied || isBilling
                          ? `KOT #${table.kotCount} • ${table.guestCount}p`
                          : `Cap: ${table.capacity} guests`}
                      </span>
                      <span className="font-black text-slate-900">
                        {table.currentBill > 0 ? `₹ ${table.currentBill}` : '₹ 0'}
                      </span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex gap-1.5 mt-auto pt-1 font-mono">
                      {hasReadyItem ? (
                        <button
                          type="button"
                          onClick={(e) => handleServeReadyTable(e, table.number)}
                          className="flex-1 py-1.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>SERVE FOOD</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTableCardClick(table.number)}
                          className="flex-1 py-1.5 px-1 bg-slate-900 hover:bg-black text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Utensils className="h-3 w-3" />
                          <span>TABLE HUB</span>
                        </button>
                      )}

                      {/* Payment Gated Vacate Button */}
                      {(() => {
                        const canVacate = table.status === 'BILLING';
                        return (
                          <button
                            type="button"
                            disabled={!canVacate}
                            onClick={(e) => handleVacateTable(e, table.number)}
                            title={
                              canVacate
                                ? 'Vacate and reset table (Payment confirmed)'
                                : 'Disabled: Payment must be recorded before vacating table'
                            }
                            className={`py-1.5 px-2 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                              canVacate
                                ? 'border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 cursor-pointer shadow-2xs'
                                : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {canVacate ? (
                              <span>🧹 VACATE</span>
                            ) : (
                              <>
                                <Lock className="h-2.5 w-2.5" />
                                <span>LOCKED</span>
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 40%: DUAL OPERATIONS FEED */}
          <div className="w-[40%] bg-white flex flex-col select-none">
            {/* TOP RIGHT 50%: CUSTOMER ASSISTANCE CALLS */}
            <div className="flex-1 border-b-2 border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
                <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-orange-600" />
                  <span>CUSTOMER SERVICE &amp; ASSISTANCE CALLS</span>
                </span>
                <span className="text-[10.5px] font-bold bg-orange-100 text-orange-900 border border-orange-200 px-2 py-0.5 rounded">
                  Live ({pings.length})
                </span>
              </div>

              {pings.length > 0 ? (
                pings.map((ping: SharedPing) => (
                  <div
                    key={ping.id}
                    className="border-2 border-orange-200 bg-orange-50/60 rounded-lg p-3 flex items-center justify-between gap-3 font-mono shadow-2xs"
                  >
                    {/* Left: Table & Request Details */}
                    <div className="flex-1 min-w-0 pr-2">
                      <strong className="text-xs font-black text-slate-900 block truncate">
                        Table {ping.tableNumber}: {ping.type}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate">
                        ⏱ {ping.timestamp} • {ping.message || 'Service requested by customer'}
                      </span>
                    </div>

                    {/* Middle: Request Badge */}
                    <div className="w-28 shrink-0 flex items-center justify-center">
                      <span className="w-full text-center px-1.5 py-1 rounded border text-[9px] font-bold uppercase whitespace-nowrap bg-orange-100 text-orange-800 border-orange-300">
                        Assistance Call
                      </span>
                    </div>

                    {/* Right: Resolve Button */}
                    <div className="w-24 shrink-0 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => waiterResolvePing(ping.id)}
                        className="w-full h-8 bg-orange-600 hover:bg-orange-700 text-white text-[10.5px] font-bold rounded transition shadow-2xs flex items-center justify-center cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 font-mono text-[11px] flex flex-col items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <span className="font-bold text-slate-600">All customer requests attended</span>
                  <span className="text-[10px]">No pending assistance calls at this moment</span>
                </div>
              )}
            </div>

            {/* BOTTOM RIGHT 50%: KITCHEN DISPATCH & FOOD STATUS */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
                <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                  <span>👨‍🍳</span>
                  <span>KITCHEN DISPATCH &amp; FOOD STATUS FEED</span>
                </span>
                <span className="text-[10.5px] font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-700">
                  Active ({activeKdsTickets.length})
                </span>
              </div>

              {activeKdsTickets.length > 0 ? (
                activeKdsTickets.map((item: SharedKDSTicket) => {
                  const totalQty = item.items.reduce((s: number, it: any) => s + it.quantity, 0);
                  const dishTitle = item.items.map((it: any) => it.name).join(', ');
                  const isReady = item.status === 'READY';
                  const isPrep = item.status === 'PREP';
                  const isPlaced = item.status === 'NEW';

                  return (
                    <div
                      key={item.id}
                      className={`border-2 rounded-lg p-3 flex items-center justify-between gap-3 font-mono shadow-2xs transition ${
                        isReady
                          ? 'border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-500/20'
                          : isPrep
                          ? 'border-orange-300 bg-orange-50/60'
                          : 'border-amber-300 bg-amber-50/60'
                      }`}
                    >
                      {/* Left: Table & Dish Item Details */}
                      <div className="flex-1 min-w-0 pr-2">
                        <strong className="text-xs font-black text-slate-900 block truncate">
                          Table {item.tableNumber}: {totalQty}x {dishTitle}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate">
                          ⏱ {item.timestamp} • {isReady ? 'Chef Pass Window' : 'Kitchen Station'}
                        </span>
                      </div>

                      {/* Middle: 3-Stage Lifecycle Status Badge */}
                      <div className="w-32 shrink-0 flex items-center justify-center">
                        <span
                          className={`w-full text-center px-1.5 py-1 rounded border text-[9px] font-bold uppercase whitespace-nowrap ${
                            isReady
                              ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                              : isPrep
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isReady ? 'Ready for Pickup' : isPrep ? 'In Preparation' : 'Order Queued'}
                        </span>
                      </div>

                      {/* Right: Only Clickable When Food Is Ready */}
                      <div className="w-28 shrink-0 flex items-center justify-end">
                        {isReady ? (
                          <button
                            type="button"
                            onClick={() => waiterMarkKitchenItemServed(item.id)}
                            className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold rounded transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>SERVE FOOD</span>
                          </button>
                        ) : isPrep ? (
                          <button
                            type="button"
                            disabled
                            className="w-full h-8 bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold rounded flex items-center justify-center cursor-not-allowed opacity-80"
                          >
                            Cooking...
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full h-8 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold rounded flex items-center justify-center cursor-not-allowed opacity-80"
                          >
                            Queued
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 font-mono text-[11px] flex flex-col items-center justify-center gap-1.5">
                  <Utensils className="h-6 w-6 text-slate-300" />
                  <span className="font-bold text-slate-600">No active orders in kitchen</span>
                  <span className="text-[10px]">All food items have been served</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
