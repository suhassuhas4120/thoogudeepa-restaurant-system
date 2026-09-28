'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import {
  useSharedBridge,
  SharedTable,
  SharedPing,
  SharedKDSTicket,
} from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import {
  Bell,
  CheckCircle2,
  Utensils,
  Lock,
} from 'lucide-react';

export const TabletScreen2TablesFeed: React.FC = () => {
  const {
    selectTable,
    setCurrentScreen,
    activeCaptain,
    activeSection,
  } = useWaiterStore();

  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterMarkTableFoodServed,
    waiterVacatesTable,
    waiterSeatsTable,
  } = useSharedBridge();

  const [selectedSection, setSelectedSection] = useState<string>(
    activeSection || 'ALL'
  );

  /* =========================================================
     FLOOR METRICS
  ========================================================= */

  const activeOrdersCount = kdsTickets.filter(
    (tk) => tk.status !== 'COMPLETED'
  ).length;

  const occupiedCount = tables.filter(
    (t: SharedTable) =>
      t.status === 'OCCUPIED' || t.status === 'BILLING'
  ).length;

  const vacantCount = tables.filter(
    (t: SharedTable) => t.status === 'VACANT'
  ).length;

  const totalGuests = tables.reduce(
    (acc: number, t: SharedTable) =>
      acc +
      (t.status === 'OCCUPIED' || t.status === 'BILLING'
        ? t.guestCount || 0
        : 0),
    0
  );

  /* =========================================================
     SECTION FILTER
  ========================================================= */

  const filterSections = [
    'ALL',
    'SECTION A',
    'SECTION B',
    'TERRACE',
    'FAMILY DINING',
  ];

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
    if (selectedSection === 'ALL') {
      return true;
    }

    const tableSec = (table.section || '').trim().toUpperCase();
    const filterSec = selectedSection.trim().toUpperCase();

    if (filterSec === 'TERRACE') {
      return (
        tableSec === 'TERRACE' ||
        tableSec.includes('TERRACE') ||
        tableSec === 'SECTION C'
      );
    }

    if (filterSec === 'FAMILY DINING') {
      return (
        tableSec === 'FAMILY DINING' ||
        tableSec.includes('DINING')
      );
    }

    return tableSec === filterSec;
  });

  /* =========================================================
     KITCHEN ORDERS
  ========================================================= */

  const activeKdsTickets = kdsTickets
    .filter((tk) => tk.status !== 'COMPLETED')
    .sort((a, b) => {
      const order: Record<string, number> = {
        READY: 0,
        PREP: 1,
        NEW: 2,
      };

      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  /* =========================================================
     TABLE HANDLERS
  ========================================================= */

  const handleTableCardClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const handleSeatTable = (
    e: React.MouseEvent,
    tableNumber: string
  ) => {
    e.stopPropagation();

    waiterSeatsTable(tableNumber);
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  const handleVacateTable = (
    e: React.MouseEvent,
    tableNumber: string
  ) => {
    e.stopPropagation();

    waiterVacatesTable(tableNumber);
  };

  const handleServeReadyTable = (
    e: React.MouseEvent,
    tableNumber: string
  ) => {
    e.stopPropagation();

    waiterMarkTableFoodServed(tableNumber);

    const cleanNum = tableNumber.replace(/\D/g, '');

    kdsTickets
      .filter((tk) => {
        const tkNum = (tk.tableNumber || '').replace(/\D/g, '');

        return (
          tk.tableNumber === tableNumber ||
          (cleanNum && tkNum === cleanNum)
        );
      })
      .forEach((tk) => {
        waiterMarkKitchenItemServed(tk.id);
      });
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={2}
      screenTitle="ALL TABLES MATRIX & DUAL LIVE OPERATIONS FEED"
    >
      <div className="flex flex-col flex-1 min-h-[700px] bg-slate-100">

        {/* =====================================================
            TOP HEADER
        ===================================================== */}

        <div className="bg-white px-5 py-3 border-b border-slate-300 shrink-0">

          <div className="flex items-center justify-between gap-5">

            {/* LEFT METRICS */}

            <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">

              <span className="font-black text-slate-900 uppercase tracking-wide mr-1">
                Floor
              </span>

              <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                Total {tables.length}
              </span>

              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold">
                Occupied {occupiedCount}
              </span>

              <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Vacant {vacantCount}
              </span>

              <span className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                Orders {activeOrdersCount}
              </span>

              <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                Guests {totalGuests}
              </span>

            </div>

            {/* RIGHT HEADER */}

            <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">

              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-black">
                Captain: {activeCaptain || 'Ramesh'}
              </span>

              <button
                type="button"
                onClick={() => setCurrentScreen(10)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold transition cursor-pointer"
              >
                Shift Stats →
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            MAIN CONTENT
            LEFT 50% / RIGHT 50%
        ===================================================== */}

        <div className="flex flex-1 min-h-0 gap-6 p-5">

          {/* ===================================================
              LEFT SIDE - TABLE GRID - 50%
          =================================================== */}

          <div className="w-1/2 min-w-0 bg-white rounded-2xl border border-slate-200 p-5 overflow-y-auto flex flex-col gap-5">

            {/* SECTION FILTER */}

            <div className="flex items-center justify-between gap-3 shrink-0">

              <div className="flex items-center gap-2 flex-wrap font-mono">

                <span className="text-[10px] font-black text-slate-500 uppercase mr-1">
                  Floor
                </span>

                {filterSections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      selectedSection === sec
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {getSectionDisplayName(sec)}
                  </button>
                ))}

              </div>

              <span className="font-mono text-[9px] font-bold text-slate-400 shrink-0">
                {filteredTables.length} TABLES
              </span>

            </div>

            {/* TABLE GRID */}

            <div className="grid grid-cols-3 gap-4">

              {filteredTables.map((table: SharedTable) => {

                const isOccupied =
                  table.status === 'OCCUPIED';

                const isBilling =
                  table.status === 'BILLING';

                const isCleaning =
                  table.status === 'CLEANING';

                const isVacant =
                  table.status === 'VACANT';

                const hasReadyItem =
                  table.activeItems?.some(
                    (it: { status?: string }) =>
                      it.status === 'Ready' ||
                      it.status === 'READY'
                  );

                return (
                  <div
                    key={table.id}
                    onClick={() =>
                      handleTableCardClick(table.number)
                    }
                    className={`min-h-[210px] bg-white rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      hasReadyItem
                        ? 'border-2 border-emerald-500'
                        : isBilling
                        ? 'border-2 border-cyan-500'
                        : isOccupied
                        ? 'border-2 border-slate-800'
                        : isCleaning
                        ? 'border-2 border-rose-300'
                        : 'border border-slate-200'
                    }`}
                  >

                    {/* TABLE HEADER */}

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-mono">

                      <div className="flex items-center gap-1.5 min-w-0">

                        <strong className="text-[14px] font-black text-slate-950 truncate">
                          {table.mergedWith
                            ? `${table.number} + ${table.mergedWith}`
                            : table.number}
                        </strong>

                        {table.mergedWith && (
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[8px] font-black px-1.5 py-0.5 rounded">
                            Merged
                          </span>
                        )}

                        {hasReadyItem && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        )}

                      </div>

                      {!isVacant && (
                        <span
                          className={`text-[8px] font-black px-1.5 py-1 rounded-md uppercase shrink-0 ${
                            hasReadyItem
                              ? 'bg-emerald-100 text-emerald-800'
                              : isBilling
                              ? 'bg-cyan-50 text-cyan-800'
                              : isOccupied
                              ? 'bg-orange-50 text-orange-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {isBilling
                            ? 'Bill Paid'
                            : isOccupied
                            ? `⏱ ${table.seatedTime}`
                            : table.status}
                        </span>
                      )}

                    </div>

                    {/* ACTIVE ITEMS */}

                    <div className="flex-1 text-[10px] font-mono text-slate-700">

                      {table.activeItems &&
                      table.activeItems.length > 0 ? (

                        <div className="flex flex-col gap-1">

                          {table.activeItems
                            .slice(0, 2)
                            .map((item: any, idx: number) => {

                              const isItemReady =
                                item.status === 'Ready' ||
                                item.status === 'READY';

                              return (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center gap-1"
                                >

                                  <span className="truncate">
                                    {item.quantity}x {item.name}
                                  </span>

                                  <span
                                    className={`text-[8px] font-bold px-1 py-0.5 rounded shrink-0 ${
                                      isItemReady
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {item.status}
                                  </span>

                                </div>
                              );
                            })}

                        </div>

                      ) : (

                        <div className="h-full flex items-center justify-center text-center text-slate-400 italic text-[9px] px-2">
                          {table.mergedWith
                            ? `Shared with Table ${table.mergedWith}`
                            : 'No active orders'}
                        </div>

                      )}

                    </div>

                    {/* TABLE INFORMATION */}
                    {/* Guest line removed as requested */}

                    <div className="flex justify-end items-center pt-2 border-t border-slate-100 font-mono text-[9px]">

                      <span className="font-black text-slate-900">
                        {table.currentBill > 0
                          ? `₹ ${table.currentBill}`
                          : '₹ 0'}
                      </span>

                    </div>

                    {/* BOTTOM ACTION */}

                    <div className="pt-1 font-mono">

                      {/* READY FOOD */}

                      {hasReadyItem ? (

                        <button
                          type="button"
                          onClick={(e) =>
                            handleServeReadyTable(
                              e,
                              table.number
                            )
                          }
                          className="w-full h-8 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-lg text-[9px] font-black transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Serve Food
                        </button>

                      ) : isBilling ? (

                        /* BILLING */

                        <button
                          type="button"
                          onClick={(e) =>
                            handleVacateTable(
                              e,
                              table.number
                            )
                          }
                          className="w-full h-8 bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white border border-purple-300 hover:border-purple-600 rounded-lg text-[9px] font-black transition flex items-center justify-center cursor-pointer"
                        >
                          Vacate
                        </button>

                      ) : isVacant ? (

                        /* VACANT */

                        <div className="w-full h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black flex items-center justify-center">
                          Available
                        </div>

                      ) : isCleaning ? (

                        /* CLEANING */

                        <div className="w-full h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black flex items-center justify-center gap-1">
                          <Lock className="h-3 w-3" />
                          Cleaning
                        </div>

                      ) : (

                        /* OCCUPIED */

                        <div className="w-full h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-bold flex items-center justify-center">
                          Table Active
                        </div>

                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* ===================================================
              RIGHT SIDE - LIVE OPERATIONS - 50%
          =================================================== */}

          <div className="w-1/2 min-w-0 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">

            {/* =================================================
                CUSTOMER CALLS
            ================================================= */}

            <div className="flex-1 min-h-0 p-5 overflow-y-auto flex flex-col gap-3 border-b border-slate-200">

              <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0 font-mono">

                <span className="font-black text-[11px] text-slate-950 flex items-center gap-1.5">

                  <Bell className="h-3.5 w-3.5 text-orange-600" />

                  Customer Calls

                </span>

                <span className="text-[9px] font-black bg-orange-50 text-orange-800 border border-orange-200 px-2 py-1 rounded-md">
                  Live {pings.length}
                </span>

              </div>

              {pings.length > 0 ? (

                pings.map((ping: SharedPing) => (

                  <div
                    key={ping.id}
                    className="border border-orange-200 bg-orange-50/60 rounded-xl p-3 flex items-center gap-3 font-mono"
                  >

                    <div className="flex-1 min-w-0">

                      <strong className="text-[10px] font-black text-slate-900 block truncate">
                        Table {ping.tableNumber}: {ping.type}
                      </strong>

                      <span className="text-[9px] text-slate-500 font-bold block mt-1 truncate">
                        ⏱ {ping.timestamp} •{' '}
                        {ping.message ||
                          'Service requested by customer'}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        waiterResolvePing(ping.id)
                      }
                      className="w-[75px] h-8 shrink-0 bg-white hover:bg-orange-600 text-orange-800 hover:text-white border border-orange-300 hover:border-orange-600 text-[9px] font-black rounded-lg transition cursor-pointer"
                    >
                      Resolve
                    </button>

                  </div>

                ))

              ) : (

                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 font-mono gap-2">

                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />

                  <span className="font-bold text-[10px] text-slate-600">
                    All customer requests attended
                  </span>

                  <span className="text-[9px]">
                    No pending calls
                  </span>

                </div>

              )}

            </div>

            {/* =================================================
                KITCHEN ORDERS
            ================================================= */}

            <div className="flex-1 min-h-0 p-5 overflow-y-auto flex flex-col gap-3">

              <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0 font-mono">

                <span className="font-black text-[11px] text-slate-950 flex items-center gap-1.5">

                  <Utensils className="h-3.5 w-3.5 text-slate-700" />

                  Kitchen Orders

                </span>

                <span className="text-[9px] font-black bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-700">
                  Active {activeKdsTickets.length}
                </span>

              </div>

              {activeKdsTickets.length > 0 ? (

                activeKdsTickets.map(
                  (item: SharedKDSTicket) => {

                    const totalQty = item.items.reduce(
                      (s: number, it: any) =>
                        s + it.quantity,
                      0
                    );

                    const dishTitle = item.items
                      .map((it: any) => it.name)
                      .join(', ');

                    const isReady =
                      item.status === 'READY';

                    const isPrep =
                      item.status === 'PREP';

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-xl p-3 flex items-center gap-3 font-mono ${
                          isReady
                            ? 'border-emerald-300 bg-emerald-50'
                            : isPrep
                            ? 'border-orange-200 bg-orange-50/60'
                            : 'border-amber-200 bg-amber-50/60'
                        }`}
                      >

                        {/* ORDER DETAILS */}

                        <div className="flex-1 min-w-0">

                          <strong className="text-[10px] font-black text-slate-900 block truncate">
                            Table {item.tableNumber}: {totalQty}x{' '}
                            {dishTitle}
                          </strong>

                          <span className="text-[9px] text-slate-500 font-bold block mt-1 truncate">
                            ⏱ {item.timestamp}
                          </span>

                        </div>

                        {/* STATUS */}

                        <div className="w-[90px] shrink-0">

                          <span
                            className={`block text-center px-1.5 py-1 rounded-md border text-[8px] font-black uppercase ${
                              isReady
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : isPrep
                                ? 'bg-orange-100 text-orange-800 border-orange-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {isReady
                              ? 'Ready'
                              : isPrep
                              ? 'Preparing'
                              : 'Queued'}
                          </span>

                        </div>

                        {/* ACTION */}

                        <div className="w-[80px] shrink-0">

                          {isReady ? (

                            <button
                              type="button"
                              onClick={() => {

                                waiterMarkKitchenItemServed(
                                  item.id
                                );

                                if (item.tableNumber) {
                                  waiterMarkTableFoodServed(
                                    item.tableNumber
                                  );
                                }

                              }}
                              className="w-full h-8 bg-emerald-100 hover:bg-emerald-600 text-emerald-900 hover:text-white border border-emerald-300 hover:border-emerald-600 text-[9px] font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Serve
                            </button>

                          ) : isPrep ? (

                            <button
                              type="button"
                              disabled
                              className="w-full h-8 bg-orange-100 text-orange-800 border border-orange-200 text-[9px] font-black rounded-lg flex items-center justify-center cursor-not-allowed opacity-80"
                            >
                              Cooking
                            </button>

                          ) : (

                            <button
                              type="button"
                              disabled
                              className="w-full h-8 bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black rounded-lg flex items-center justify-center cursor-not-allowed opacity-80"
                            >
                              Queued
                            </button>

                          )}

                        </div>

                      </div>
                    );
                  }
                )

              ) : (

                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 font-mono gap-2">

                  <Utensils className="h-7 w-7 text-slate-300" />

                  <span className="font-bold text-[10px] text-slate-600">
                    No active orders
                  </span>

                  <span className="text-[9px]">
                    All food items have been served
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    </WaiterTabletLandscapeHousing>
  );
};