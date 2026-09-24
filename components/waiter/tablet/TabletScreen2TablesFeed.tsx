'use client';

import React from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge, SharedTable, SharedPing, SharedKDSTicket } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { Bell, CheckCircle2, Clock, UtensilsCrossed, AlertTriangle } from 'lucide-react';

export const TabletScreen2TablesFeed: React.FC = () => {
  const { selectTable, setCurrentScreen, activeCaptain } = useWaiterStore();
  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const kitchenReadyItems = kdsTickets.filter((tk) => tk.status === 'READY');

  const occupiedCount = tables.filter((t: { status: string }) => t.status === 'OCCUPIED').length;
  const vacantCount = tables.filter((t: { status: string }) => t.status === 'VACANT').length;
  const totalGuests = tables.reduce((acc: number, t: { guestCount?: number }) => acc + (t.guestCount || 0), 0);

  const handleTableClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const handleVacateClick = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    selectTable(tableNumber);
    setCurrentScreen(9);
  };

  const handleServedClick = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    alert(`[ORDER MARKED SERVED FOR TABLE ${tableNumber}]`);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={2}
      screenTitle="ALL TABLES MATRIX &amp; DUAL LIVE NOTIFICATIONS"
    >
      <div className="flex flex-col flex-1 min-h-[700px]">
        {/* TOP FLOOR METRICS HEADER (10% OF TAB SECTION) */}
        <div className="border-b-2 border-slate-800 bg-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <span className="font-extrabold text-slate-950 uppercase tracking-wider">
              [FLOOR METRICS]:
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              [TOTAL TABLES: {tables.length}]
            </span>
            <span className="border border-slate-900 bg-slate-900 px-2.5 py-1 rounded font-bold text-white">
              [TABLES FILLED: {occupiedCount}]
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              [TABLES EMPTY: {vacantCount}]
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              [ACTIVE ORDERS: 8]
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              [GUESTS SEATED: {totalGuests}]
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="border-2 border-slate-900 bg-slate-100 px-3 py-1 rounded font-black text-slate-900">
              👤 [ACTIVE: {activeCaptain}]
            </span>
            <button
              onClick={() => setCurrentScreen(10)}
              className="border border-slate-800 bg-white hover:bg-slate-100 text-slate-900 px-3 py-1 rounded font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <span>📊 [VIEW SHIFT STATS]</span>
            </button>
          </div>
        </div>

        {/* MAIN SPLIT: LEFT 60% (3-COL TABLES MATRIX) / RIGHT 40% (DUAL NOTIFS) */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT 60%: ALL TABLES 3-COLUMN MATRIX */}
          <div className="w-[60%] border-r-2 border-slate-800 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
              <span className="font-black text-xs text-slate-950 uppercase">
                [ALL TABLES MATRIX (3-COLUMNS) — 60% SCREEN WIDTH]
              </span>
              <span className="text-[10.5px] font-bold text-slate-500">
                [CLICK ANY TABLE CARD TO OPEN SCREEN 3 DETAIL]
              </span>
            </div>

            {/* 3-Column Tables Grid */}
            <div className="grid grid-cols-3 gap-3">
              {tables.map((table: SharedTable) => {
                const isOccupied = table.status === 'OCCUPIED';
                const isBilling = table.status === 'BILLING';
                const isCleaning = table.status === 'CLEANING';

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table.number)}
                    className={`bg-white border-2 rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition shadow-xs hover:border-black hover:-translate-y-0.5 ${
                      table.number === 'A-04'
                        ? 'border-slate-950 ring-2 ring-slate-950/20'
                        : 'border-slate-400'
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-2 font-mono">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-black text-slate-950">
                          {table.mergedWith ? `[${table.number} + ${table.mergedWith}]` : `[${table.number}]`}
                        </strong>
                        {table.mergedWith && (
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                            🔗 MERGED
                          </span>
                        )}
                        {table.number === 'A-04' && !table.mergedWith && (
                          <span className="text-amber-500 text-xs font-black">★</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        table.mergedWith 
                          ? 'bg-purple-50 text-purple-950 border-purple-300'
                          : isOccupied 
                          ? 'bg-orange-50 text-orange-950 border-orange-300' 
                          : 'text-slate-600 bg-slate-100 border-slate-300'
                      }`}>
                        {isOccupied ? `⏱ ${table.seatedTime}` : `[${table.status}]`}
                      </span>
                    </div>

                    {/* Ordered Items Preview */}
                    <div className="text-[11px] font-mono flex flex-col gap-1 text-slate-700 min-h-[48px]">
                      {table.activeItems && table.activeItems.length > 0 ? (
                        table.activeItems.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className="truncate flex justify-between">
                            <span className="truncate">
                              • {item.quantity}x {item.name}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-500 ml-1 shrink-0">
                              [{item.status}]
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10.5px]">
                          {table.mergedWith ? `[Merged Table • Shared with ${table.mergedWith}]` : '[Table Ready • No active orders]'}
                        </span>
                      )}
                    </div>

                    {/* Bill & Status Tag */}
                    <div className="flex justify-between items-center font-mono text-[10.5px] pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-500">
                        {isOccupied ? `KOT #${table.kotCount}` : `Cap: ${table.capacity}`}
                      </span>
                      <span className="font-black text-slate-900">
                        {table.currentBill > 0 ? `₹ ${table.currentBill}` : '₹ 0'}
                      </span>
                    </div>

                    {/* Card Bottom Buttons */}
                    <div className="flex gap-2 mt-auto pt-1 font-mono">
                      <button
                        type="button"
                        onClick={(e) => handleServedClick(e, table.number)}
                        className="flex-1 py-1.5 px-1 bg-slate-900 hover:bg-black text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                      >
                        ✓ [SERVED]
                      </button>
                      {(() => {
                        const canVacate = table.status === 'BILLING';
                        return (
                          <button
                            type="button"
                            disabled={!canVacate}
                            onClick={(e) => handleVacateClick(e, table.number)}
                            title={canVacate ? 'Vacate table (Payment confirmed & bill generated)' : 'Disabled: Payment must be confirmed before vacate is enabled'}
                            className={`flex-1 py-1.5 px-1 rounded text-[10px] font-bold transition ${
                              canVacate
                                ? 'border border-rose-600 bg-rose-50 hover:bg-rose-100 text-rose-800 cursor-pointer shadow-2xs'
                                : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {canVacate ? '🧹 [VACATE]' : '🔒 [LOCKED]'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 40%: DUAL NOTIFICATION SECTION */}
          <div className="w-[40%] bg-white flex flex-col select-none">
            {/* TOP RIGHT: CUSTOMER NOTIFICATIONS (50%) */}
            <div className="flex-1 border-b-2 border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
                <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-orange-600" />
                  <span>[CUSTOMER NOTIFICATIONS &amp; ASSISTANCE CALLS]</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">[TOP RIGHT 20%]</span>
              </div>

              {pings.map((ping: SharedPing) => (
                <div
                  key={ping.id}
                  className="border-2 border-slate-300 bg-slate-50 rounded-lg p-3 flex justify-between items-center gap-3 font-mono shadow-2xs"
                >
                  <div>
                    <strong className="text-xs font-black text-slate-900 block">
                      [{ping.tableNumber}: REQUESTED {ping.type}]
                    </strong>
                    <span className="text-[10px] text-slate-500 font-bold">
                      ⏱ {ping.timestamp} • Section A
                    </span>
                  </div>
                  <button
                    onClick={() => waiterResolvePing(ping.id)}
                    className="bg-slate-900 hover:bg-black text-white text-[10.5px] font-bold px-3 py-1.5 rounded transition shadow-2xs shrink-0"
                  >
                    [RESOLVED]
                  </button>
                </div>
              ))}
            </div>

            {/* BOTTOM RIGHT: KITCHEN NOTIFICATIONS (50%) */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
                <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                  <span>👨‍🍳</span>
                  <span>[KITCHEN PASS DISPATCH NOTIFICATIONS]</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">[BOTTOM RIGHT 20%]</span>
              </div>

              {kitchenReadyItems.map((item: SharedKDSTicket) => {
                const totalQty = item.items.reduce((s: number, it: any) => s + it.quantity, 0);
                const dishTitle = item.items.map((it: any) => it.name).join(', ');
                return (
                  <div
                    key={item.id}
                    className="border-2 border-slate-300 bg-slate-50 rounded-lg p-3 flex justify-between items-center gap-3 font-mono shadow-2xs"
                  >
                    <div>
                      <strong className="text-xs font-black text-slate-900 block">
                        [{item.tableNumber}: {totalQty}x {dishTitle} READY]
                      </strong>
                      <span className="text-[10px] text-slate-500 font-bold">
                        ⏱ {item.timestamp} • Chef Pass Window
                      </span>
                    </div>
                    <button
                      onClick={() => waiterMarkKitchenItemServed(item.id, item.items[0]?.id ?? '')}
                      className="bg-slate-900 hover:bg-black text-white text-[10.5px] font-bold px-3 py-1.5 rounded transition shadow-2xs shrink-0"
                    >
                      [SERVED]
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
