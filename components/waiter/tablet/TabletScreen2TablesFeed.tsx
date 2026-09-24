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
    waiterMarkTableFoodServed,
  } = useSharedBridge();

  const occupiedCount = tables.filter((t: { status: string }) => t.status === 'OCCUPIED').length;
  const vacantCount = tables.filter((t: { status: string }) => t.status === 'VACANT').length;
  const totalGuests = tables.reduce((acc: number, t: { guestCount?: number }) => acc + (t.guestCount || 0), 0);
  const activeKdsTickets = kdsTickets.filter((tk) => tk.status !== 'COMPLETED');

  const handleTableClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const handleVacateClick = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    selectTable(tableNumber);
    setCurrentScreen(9);
  };

  const getTableFoodStatus = (t: SharedTable) => {
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
    if (hasPreparing) return { label: 'In Preparation', state: 'PREPARING' };

    const hasPlaced = t.activeItems.some(
      (i) =>
        i.status.toLowerCase() === 'placed' ||
        i.status.toLowerCase() === 'received' ||
        i.status.toLowerCase() === 'new'
    );
    if (hasPlaced) return { label: 'Order Placed', state: 'PLACED' };

    const allServed = t.activeItems.every((i) => i.status.toLowerCase() === 'served');
    if (allServed) return { label: 'All Served', state: 'SERVED' };

    return null;
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={2}
      screenTitle="ALL TABLES MATRIX &amp; LIVE KITCHEN DISPATCH"
    >
      <div className="flex flex-col flex-1 min-h-[700px]">
        {/* TOP FLOOR METRICS HEADER */}
        <div className="border-b-2 border-slate-800 bg-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <span className="font-extrabold text-slate-950 uppercase tracking-wider">
              FLOOR METRICS:
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              Total Tables: {tables.length}
            </span>
            <span className="border border-slate-900 bg-slate-900 px-2.5 py-1 rounded font-bold text-white">
              Occupied: {occupiedCount}
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              Vacant: {vacantCount}
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              Active KOTs: {activeKdsTickets.length}
            </span>
            <span className="border border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-bold text-slate-700">
              Guests Seated: {totalGuests}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="border-2 border-slate-900 bg-slate-100 px-3 py-1 rounded font-black text-slate-900">
              👤 Active: {activeCaptain}
            </span>
            <button
              onClick={() => setCurrentScreen(10)}
              className="border border-slate-800 bg-white hover:bg-slate-100 text-slate-900 px-3 py-1 rounded font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <span>📊 View Shift Stats</span>
            </button>
          </div>
        </div>

        {/* MAIN SPLIT: LEFT 60% (TABLES MATRIX) / RIGHT 40% (DUAL LIVE NOTIFICATIONS) */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT 60%: ALL TABLES MATRIX */}
          <div className="w-[60%] border-r-2 border-slate-800 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
              <span className="font-black text-xs text-slate-950 uppercase">
                FLOOR TABLES MATRIX
              </span>
              <span className="text-[10.5px] font-bold text-slate-500">
                Tap table card to open detailed view
              </span>
            </div>

            {/* 3-Column Tables Grid */}
            <div className="grid grid-cols-3 gap-3">
              {tables.map((table: SharedTable) => {
                const isOccupied = table.status === 'OCCUPIED';
                const foodStatus = getTableFoodStatus(table);
                const isReady = foodStatus?.state === 'READY';
                const isPreparing = foodStatus?.state === 'PREPARING';
                const isPlaced = foodStatus?.state === 'PLACED';
                const isServed = foodStatus?.state === 'SERVED';

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table.number)}
                    className={`bg-white border-2 rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition shadow-xs hover:border-black hover:-translate-y-0.5 ${
                      isReady
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : table.number === 'A-04'
                        ? 'border-slate-950 ring-2 ring-slate-950/20'
                        : 'border-slate-400'
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-2 font-mono">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-black text-slate-950">
                          {table.mergedWith ? `${table.number} + ${table.mergedWith}` : table.number}
                        </strong>
                        {table.mergedWith && (
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                            🔗 Merged
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
                        {isOccupied ? `⏱ ${table.seatedTime}` : table.status}
                      </span>
                    </div>

                    {/* Ordered Items Preview with Real-Time Food Lifecycle Badges */}
                    <div className="text-[11px] font-mono flex flex-col gap-1 text-slate-700 min-h-[48px]">
                      {table.activeItems && table.activeItems.length > 0 ? (
                        table.activeItems.slice(0, 2).map((item: any, idx: number) => {
                          const itemStatusLower = item.status.toLowerCase();
                          const isItemReady = itemStatusLower === 'ready' || itemStatusLower === 'plated';
                          const isItemPrep = itemStatusLower === 'preparing' || itemStatusLower === 'cooking' || itemStatusLower === 'prep';
                          const isItemPlaced = itemStatusLower === 'placed' || itemStatusLower === 'new';

                          return (
                            <div key={idx} className="truncate flex justify-between items-center">
                              <span className="truncate">
                                • {item.quantity}x {item.name}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded border ml-1 shrink-0 font-bold ${
                                  isItemReady
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                                    : isItemPrep
                                    ? 'bg-orange-50 text-orange-800 border-orange-200'
                                    : isItemPlaced
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {isItemReady ? 'Ready' : isItemPrep ? 'Preparing' : isItemPlaced ? 'Placed' : 'Served'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 italic text-[10.5px]">
                          {table.mergedWith ? `Merged Table • Shared with ${table.mergedWith}` : 'Table Ready • No active orders'}
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

                    {/* Card Bottom Buttons: Serve Button Enabled ONLY When Food Is Ready! */}
                    <div className="flex gap-2 mt-auto pt-1 font-mono">
                      {isReady ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            waiterMarkTableFoodServed(table.number);
                          }}
                          title="Food is prepared and ready! Click to mark served."
                          className="flex-1 py-1.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-2xs animate-pulse cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Serve Food</span>
                        </button>
                      ) : isPreparing ? (
                        <button
                          type="button"
                          disabled
                          title="Food is currently being prepared in kitchen. Cannot mark served until ready."
                          className="flex-1 py-1.5 px-1 bg-orange-50 border border-orange-200 text-orange-700 rounded text-[10px] font-bold cursor-not-allowed opacity-80 flex items-center justify-center gap-1"
                        >
                          <span>⏳ Preparing</span>
                        </button>
                      ) : isPlaced ? (
                        <button
                          type="button"
                          disabled
                          title="Order placed in queue. Waiting for kitchen to start prep."
                          className="flex-1 py-1.5 px-1 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-bold cursor-not-allowed opacity-80 flex items-center justify-center gap-1"
                        >
                          <span>📝 Placed</span>
                        </button>
                      ) : isServed ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-1.5 px-1 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-default flex items-center justify-center gap-1"
                        >
                          <span>✓ Served</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-1.5 px-1 bg-slate-100 border border-slate-200 text-slate-400 rounded text-[10px] font-bold cursor-not-allowed opacity-60"
                        >
                          No Orders
                        </button>
                      )}

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
                            {canVacate ? '🧹 Vacate' : '🔒 Locked'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 40%: DUAL LIVE NOTIFICATION SECTION */}
          <div className="w-[40%] bg-white flex flex-col select-none">
            {/* TOP RIGHT: CUSTOMER NOTIFICATIONS (50%) */}
            <div className="flex-1 border-b-2 border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
                <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-orange-600" />
                  <span>CUSTOMER ASSISTANCE CALLS</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">Live ({pings.length})</span>
              </div>

              {pings.length > 0 ? (
                pings.map((ping: SharedPing) => (
                  <div
                    key={ping.id}
                    className="border-2 border-slate-300 bg-slate-50 rounded-lg p-3 flex justify-between items-center gap-3 font-mono shadow-2xs"
                  >
                    <div>
                      <strong className="text-xs font-black text-slate-900 block">
                        Table {ping.tableNumber}: Request: {ping.type}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-bold">
                        ⏱ {ping.timestamp} • Section A
                      </span>
                    </div>
                    <button
                      onClick={() => waiterResolvePing(ping.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-[10.5px] font-bold px-3 py-1.5 rounded transition shadow-2xs shrink-0 cursor-pointer"
                    >
                      Resolve Call
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
                  No pending customer assistance calls
                </div>
              )}
            </div>

            {/* BOTTOM RIGHT: KITCHEN PASS DISPATCH NOTIFICATIONS (50%) */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 shrink-0 font-mono">
                <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                  <span>👨‍🍳</span>
                  <span>KITCHEN DISPATCH &amp; FOOD STATUS FEED</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">Live Orders ({activeKdsTickets.length})</span>
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
                      className={`border-2 rounded-lg p-3 flex justify-between items-center gap-3 font-mono shadow-2xs transition ${
                        isReady
                          ? 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/20'
                          : isPrep
                          ? 'border-orange-300 bg-orange-50/60'
                          : 'border-amber-300 bg-amber-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-black text-slate-900 block">
                            Table {item.tableNumber}: {totalQty}x {dishTitle}
                          </strong>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              isReady
                                ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                                : isPrep
                                ? 'bg-orange-100 text-orange-800 border-orange-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {isReady ? 'Ready for Pickup' : isPrep ? 'In Preparation' : 'Order Placed'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                          ⏱ {item.timestamp} • {isReady ? 'Chef Pass Window' : 'Kitchen Station'}
                        </span>
                      </div>

                      {/* Serve action is enabled ONLY when the food is Ready! */}
                      {isReady ? (
                        <button
                          onClick={() => waiterMarkKitchenItemServed(item.id, item.items[0]?.id ?? '')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold px-3 py-1.5 rounded transition shadow-2xs shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Serve Food</span>
                        </button>
                      ) : isPrep ? (
                        <button
                          disabled
                          className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2.5 py-1.5 rounded shrink-0 cursor-not-allowed opacity-80"
                        >
                          Cooking
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1.5 rounded shrink-0 cursor-not-allowed opacity-80"
                        >
                          Queued
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
                  No active orders in kitchen
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
