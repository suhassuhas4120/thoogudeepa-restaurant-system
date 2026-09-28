'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import {
  useSharedBridge,
  SharedTable,
  SharedKDSTicket,
} from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  CheckCircle2,
  Utensils,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW2TablesFeed: React.FC = () => {
  // =========================================================
  // WAITER STORE
  // =========================================================

  const {
    setCurrentScreen,
    selectTable,
    activeCaptain,
    activeSection,
  } = useWaiterStore();

  // =========================================================
  // SHARED BRIDGE
  // =========================================================

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

  // =========================================================
  // FLOOR OVERVIEW
  //
  // false = tables hidden
  // true  = tables visible
  // =========================================================

  const [showFloor, setShowFloor] =
    useState(false);

  // =========================================================
  // SECTION
  // =========================================================

  const [selectedSection, setSelectedSection] =
    useState<string>(
      activeSection || 'ALL'
    );

  // =========================================================
  // KITCHEN / CUSTOMER TAB
  // =========================================================

  const [activeFeedTab, setActiveFeedTab] =
    useState<'KITCHEN' | 'CUSTOMER'>(
      'KITCHEN'
    );

  // =========================================================
  // DYNAMIC FLOOR METRICS
  // =========================================================

  const activeOrdersCount =
    kdsTickets.filter(
      (tk) =>
        tk.status !== 'COMPLETED'
    ).length;

  const occupiedCount =
    tables.filter(
      (t: SharedTable) =>
        t.status === 'OCCUPIED' ||
        t.status === 'BILLING'
    ).length;

  const vacantCount =
    tables.filter(
      (t: SharedTable) =>
        t.status === 'VACANT'
    ).length;

  const totalGuests =
    tables.reduce(
      (
        acc: number,
        t: SharedTable
      ) =>
        acc +
        (
          t.status === 'OCCUPIED' ||
          t.status === 'BILLING'
            ? t.guestCount || 0
            : 0
        ),
      0
    );

  // =========================================================
  // SECTION FILTERS
  //
  // CAPTAIN-ALL IS NOT DISPLAYED
  // =========================================================

  const filterSections = [
    'ALL',
    'SECTION A',
    'SECTION B',
    'TERRACE',
    'FAMILY DINING',
  ];

  // =========================================================
  // SECTION DISPLAY NAME
  // =========================================================

  const getSectionDisplayName = (
    sec: string
  ) => {
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

  // =========================================================
  // FILTER TABLES
  // =========================================================

  const filteredTables =
    tables.filter(
      (table: SharedTable) => {
        if (
          selectedSection === 'ALL'
        ) {
          return true;
        }

        const tableSec =
          (table.section || '')
            .trim()
            .toUpperCase();

        const filterSec =
          selectedSection
            .trim()
            .toUpperCase();

        // TERRACE
        if (
          filterSec === 'TERRACE'
        ) {
          return (
            tableSec === 'TERRACE' ||
            tableSec.includes(
              'TERRACE'
            ) ||
            tableSec === 'SECTION C'
          );
        }

        // FAMILY DINING
        if (
          filterSec ===
          'FAMILY DINING'
        ) {
          return (
            tableSec ===
              'FAMILY DINING' ||
            tableSec.includes(
              'DINING'
            )
          );
        }

        return (
          tableSec === filterSec
        );
      }
    );

  // =========================================================
  // ACTIVE KITCHEN TICKETS
  //
  // READY -> PREP -> NEW
  // =========================================================

  const activeKdsTickets =
    kdsTickets
      .filter(
        (tk) =>
          tk.status !==
          'COMPLETED'
      )
      .sort((a, b) => {
        const order: Record<
          string,
          number
        > = {
          READY: 0,
          PREP: 1,
          NEW: 2,
        };

        return (
          (order[a.status] ?? 3) -
          (order[b.status] ?? 3)
        );
      });

  // =========================================================
  // READY PICKUP COUNT
  // =========================================================

  const readyPickupCount =
    kdsTickets.filter(
      (tk) =>
        tk.status === 'READY'
    ).length;

  // =========================================================
  // TABLE CLICK
  // =========================================================

  const handleTableClick = (
    tableNumber: string
  ) => {
    selectTable(tableNumber);
    setCurrentScreen(3);
  };

  // =========================================================
  // SEAT TABLE
  //
  // Logic kept from original code.
  // =========================================================

  const handleSeatTable = (
    e: React.MouseEvent,
    tableNumber: string
  ) => {
    e.stopPropagation();

    waiterSeatsTable(
      tableNumber
    );

    selectTable(
      tableNumber
    );

    setCurrentScreen(3);
  };

  // =========================================================
  // VACATE TABLE
  //
  // Logic kept from original code.
  // =========================================================

  const handleVacateTable = (
    e: React.MouseEvent,
    tableNumber: string
  ) => {
    e.stopPropagation();

    waiterVacatesTable(
      tableNumber
    );
  };

  // =========================================================
  // SERVE READY TABLE
  //
  // Logic kept from original code.
  // =========================================================

  const handleServeReadyTable = (
    e: React.MouseEvent,
    tableNumber: string
  ) => {
    e.stopPropagation();

    // 1. Mark table food as served
    waiterMarkTableFoodServed(
      tableNumber
    );

    // 2. Also mark matching KDS tickets
    const cleanNum =
      tableNumber.replace(
        /\D/g,
        ''
      );

    kdsTickets
      .filter((tk) => {
        const tkNum =
          (
            tk.tableNumber || ''
          ).replace(
            /\D/g,
            ''
          );

        return (
          tk.tableNumber ===
            tableNumber ||
          (
            cleanNum &&
            tkNum === cleanNum
          )
        );
      })
      .forEach((tk) => {
        waiterMarkKitchenItemServed(
          tk.id
        );
      });
  };

  // =========================================================
  // TABLE STATUS BADGE
  // =========================================================

  const getStatusBadge = (
    status: string
  ) => {
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

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <WaiterTabletHousing
      screenNumber={2}
      screenTitle="TABLES MATRIX & DUAL FEEDS"
    >

      <div className="flex-1 flex flex-col p-2 sm:p-2.5 gap-2 overflow-hidden">

        {/* =====================================================
            FLOOR OVERVIEW
        ====================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs shrink-0 overflow-hidden">

          {/* ===================================================
              FLOOR OVERVIEW HEADER
          ==================================================== */}

          <button
            type="button"
            onClick={() =>
              setShowFloor(
                (prev) => !prev
              )
            }
            className="w-full text-left p-2.5 cursor-pointer"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">

              <div className="flex items-center gap-1.5">

                <span className="text-[9px] text-slate-500">

                  {showFloor
                    ? '▲'
                    : '▼'}

                </span>

                <span className="uppercase text-[10px] font-mono text-slate-900 font-extrabold">

                  Floor Overview

                </span>

              </div>

              <span className="text-[9px] font-mono text-slate-400 font-bold">

                LIVE

              </span>

            </div>


            {/* =================================================
                FLOOR METRICS
            ================================================== */}

            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[9px]">

              {/* OCCUPIED */}

              <div className="bg-slate-900 text-white rounded-lg p-1.5">

                <div className="text-[8px] opacity-80 uppercase">

                  Occupied

                </div>

                <div className="text-sm font-black">

                  {occupiedCount}

                </div>

              </div>


              {/* VACANT */}

              <div className="bg-slate-100 text-slate-800 rounded-lg p-1.5 border border-slate-200">

                <div className="text-[8px] text-slate-500 uppercase">

                  Vacant

                </div>

                <div className="text-sm font-black">

                  {vacantCount}

                </div>

              </div>


              {/* ORDERS */}

              <div className="bg-amber-50 text-amber-900 rounded-lg p-1.5 border border-amber-200">

                <div className="text-[8px] text-amber-700 uppercase">

                  Orders

                </div>

                <div className="text-sm font-black">

                  {activeOrdersCount}

                </div>

              </div>


              {/* SEATED */}

              <div className="bg-emerald-50 text-emerald-900 rounded-lg p-1.5 border border-emerald-200">

                <div className="text-[8px] text-emerald-700 uppercase">

                  Seated

                </div>

                <div className="text-sm font-black">

                  {totalGuests}

                </div>

              </div>

            </div>

          </button>


          {/* ===================================================
              TABLES
              
              HIDDEN BY DEFAULT.
              CLICK FLOOR OVERVIEW TO SHOW.
          ==================================================== */}

          {showFloor && (

            <div className="border-t border-slate-200 p-2.5">

              {/* ===============================================
                  SECTION FILTER
              ================================================ */}

              <div className="flex items-center justify-between gap-1 mb-2">

                <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">

                  {filterSections.map(
                    (sec) => (

                      <button
                        key={sec}
                        type="button"
                        onClick={() =>
                          setSelectedSection(
                            sec
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold shrink-0 transition duration-150 cursor-pointer ${
                          selectedSection ===
                          sec
                            ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
                            : 'bg-stone-50 border border-slate-300 text-slate-700 hover:bg-stone-200 hover:text-slate-950'
                        }`}
                      >

                        {
                          getSectionDisplayName(
                            sec
                          )
                        }

                      </button>

                    )
                  )}

                </div>

                <span className="font-mono text-[9px] text-slate-400 font-bold shrink-0">

                  {
                    filteredTables.length
                  }{' '}
                  Tables

                </span>

              </div>


              {/* ===============================================
                  TABLE GRID
                  
                  2 TABLES PER ROW
              ================================================ */}

              <div className="grid grid-cols-2 gap-2 max-h-[42vh] overflow-y-auto pr-0.5">

                {filteredTables.length >
                0 ? (

                  filteredTables.map(
                    (
                      t: SharedTable
                    ) => {

                      const isOccupied =
                        t.status ===
                        'OCCUPIED';

                      const isBilling =
                        t.status ===
                        'BILLING';

                      const isVacant =
                        t.status ===
                        'VACANT';

                      const isCleaning =
                        t.status ===
                        'CLEANING';

                      const hasReadyItem =
                        t.activeItems?.some(
                          (
                            it: {
                              status?: string;
                            }
                          ) =>
                            it.status ===
                              'Ready' ||
                            it.status ===
                              'READY'
                        );

                      return (

                        <motion.div
                          key={t.id}
                          whileTap={{
                            scale: 0.97,
                          }}
                          onClick={() =>
                            handleTableClick(
                              t.number
                            )
                          }
                          className={`rounded-xl border p-2.5 text-center cursor-pointer transition shadow-2xs flex flex-col justify-between min-h-[114px] ${
                            hasReadyItem
                              ? 'border-emerald-500 bg-emerald-50/60 hover:bg-emerald-50 ring-1 ring-emerald-500/30'
                              : isBilling
                              ? 'border-purple-300 bg-purple-50/50 hover:bg-purple-50/80 ring-1 ring-purple-400/20'
                              : isOccupied
                              ? 'border-slate-300 bg-white hover:border-slate-400'
                              : isCleaning
                              ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'
                              : isVacant
                              ? 'border-slate-200 bg-stone-50/70 hover:bg-white'
                              : 'border-slate-200 bg-stone-50/70 hover:bg-white'
                          }`}
                        >

                          {/* TABLE NAME */}

                          <div className="flex items-center justify-between font-mono gap-1">

                            <span className="text-xs font-black text-slate-900 truncate">

                              {t.mergedWith
                                ? `${t.number} + ${t.mergedWith}`
                                : t.number}

                            </span>

                            <span className="text-[8px] font-bold text-slate-400 truncate">

                              {t.section}

                            </span>

                          </div>


                          {/* STATUS */}

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


                          {/* BILL / TIME */}

                          <div className="text-[9.5px] font-mono text-slate-600 mt-1 leading-tight">

                            {isOccupied ||
                            isBilling ? (

                              <div className="flex justify-between items-center px-1">

                                <span className="font-extrabold text-slate-900">

                                  ₹
                                  {
                                    t.currentBill
                                  }

                                </span>

                                <span className="text-slate-500">

                                  ⏱{' '}
                                  {
                                    t.seatedTime
                                  }

                                </span>

                              </div>

                            ) : (

                              <div className="text-slate-400">

                                Capacity:{' '}
                                {
                                  t.capacity
                                }{' '}
                                guests

                              </div>

                            )}

                          </div>


                          {/* FOOD READY */}

                          {hasReadyItem && (

                            <div className="mt-1">

                              <span className="inline-block px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-mono font-black">

                                FOOD READY

                              </span>

                            </div>

                          )}

                        </motion.div>

                      );
                    }
                  )

                ) : (

                  <div className="col-span-2 text-center py-8 text-slate-400 font-mono text-[10px]">

                    No tables found

                  </div>

                )}

              </div>

            </div>

          )}

        </div>


        {/* =====================================================
            KITCHEN ORDERS / GUEST CALLS
        ====================================================== */}

        <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs flex flex-col overflow-hidden">

          {/* ===================================================
              TOP BUTTONS
          ==================================================== */}

          <div className="grid grid-cols-2 gap-1.5 shrink-0">

            {/* =================================================
                KITCHEN ORDERS BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setActiveFeedTab(
                  'KITCHEN'
                )
              }
              className={`min-h-[44px] rounded-lg px-2 py-1.5 font-mono text-[9px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                activeFeedTab ===
                'KITCHEN'
                  ? 'bg-slate-900 text-white shadow-2xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-stone-100'
              }`}
            >

              <span className="text-[11px]">
                🍳
              </span>

              <div className="flex flex-col items-start leading-tight">

                <span>
                  Kitchen
                </span>

                <span>
                  Orders ({activeKdsTickets.length})
                </span>

              </div>

              {readyPickupCount >
                0 && (

                <span
                  className={`ml-1 px-1.5 py-1 rounded-full text-[7.5px] font-black leading-none ${
                    activeFeedTab ===
                    'KITCHEN'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >

                  {readyPickupCount}

                  <br />

                  Ready

                </span>

              )}

            </button>


            {/* =================================================
                GUEST CALLS BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setActiveFeedTab(
                  'CUSTOMER'
                )
              }
              className={`min-h-[44px] rounded-lg px-2 py-1.5 font-mono text-[9px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                activeFeedTab ===
                'CUSTOMER'
                  ? 'bg-orange-600 text-white shadow-2xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-stone-100'
              }`}
            >

              <span className="text-[11px]">
                🔔
              </span>

              <div className="flex flex-col items-start leading-tight">

                <span>
                  Guest
                </span>

                <span>
                  Calls ({pings.length})
                </span>

              </div>

            </button>

          </div>


          {/* ===================================================
              FEED CONTENT
          ==================================================== */}

          <div className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-2">

            {/* =================================================
                CUSTOMER / GUEST CALLS
            ================================================== */}

            {activeFeedTab ===
            'CUSTOMER' ? (

              pings.length > 0 ? (

                pings.map((p) => (

                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 shadow-2xs"
                  >

                    {/* CALL DETAILS */}

                    <div className="min-w-0 flex-1">

                      <div className="font-mono font-black text-slate-900 flex items-center gap-1 text-[11px]">

                        <span>

                          Table{' '}
                          {
                            p.tableNumber
                          }

                        </span>

                        <span className="text-orange-700 font-bold">

                          • {p.type}

                        </span>

                      </div>

                      <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">

                        {
                          p.guestName
                        }

                        {' • '}

                        {
                          p.timestamp
                        }

                      </div>

                    </div>


                    {/* RESOLVE */}

                    <button
                      type="button"
                      onClick={() =>
                        waiterResolvePing(
                          p.id
                        )
                      }
                      className="shrink-0 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-900 hover:text-white border border-orange-300 hover:border-orange-600 px-3 py-1.5 text-[9px] font-mono font-bold transition duration-150 cursor-pointer shadow-2xs"
                    >

                      Resolve

                    </button>

                  </div>

                ))

              ) : (

                <div className="text-center py-8 text-slate-400 font-mono text-[10px] flex flex-col items-center justify-center gap-1">

                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />

                  <span>

                    No pending customer assistance calls

                  </span>

                </div>

              )

            ) : (

              /* =================================================
                 KITCHEN ORDERS
              ================================================== */

              activeKdsTickets.length >
              0 ? (

                activeKdsTickets.map(
                  (
                    kr: SharedKDSTicket
                  ) => {

                    const isReady =
                      kr.status ===
                      'READY';

                    const isCooking =
                      kr.status ===
                      'PREP';

                    const isQueued =
                      kr.status ===
                      'NEW';

                    return (

                      <div
                        key={kr.id}
                        className={`rounded-xl border p-2.5 shadow-2xs transition ${
                          isReady
                            ? 'bg-emerald-50/90 border-emerald-300'
                            : isCooking
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >

                        {/* =====================================
                            ORDER CONTENT
                        ====================================== */}

                        <div className="flex items-start justify-between gap-2">

                          {/* LEFT SIDE */}

                          <div className="min-w-0 flex-1">

                            {/* TABLE + STATUS */}

                            <div className="flex items-center gap-1.5 flex-wrap font-mono">

                              <span className="font-black text-slate-900 text-[11px]">

                                Table{' '}
                                {
                                  kr.tableNumber
                                }

                              </span>


                              {isReady ? (

                                <span className="px-1.5 py-1 rounded-md text-[7.5px] font-mono font-black bg-emerald-500 text-white whitespace-nowrap">

                                  Ready for Pickup

                                </span>

                              ) : isCooking ? (

                                <span className="px-1.5 py-1 rounded-md text-[7.5px] font-mono font-bold bg-amber-200 text-amber-900 whitespace-nowrap">

                                  Cooking

                                </span>

                              ) : (

                                <span className="px-1.5 py-1 rounded-md text-[7.5px] font-mono font-bold bg-slate-200 text-slate-700 whitespace-nowrap">

                                  Queued

                                </span>

                              )}

                            </div>


                            {/* FOOD ITEMS */}

                            <div className="font-mono text-[9.5px] leading-tight text-slate-800 font-medium mt-1">

                              {kr.items
                                .map(
                                  (
                                    it
                                  ) =>
                                    `${it.name} × ${it.quantity}`
                                )
                                .join(
                                  ', '
                                )}

                            </div>


                            {/* TIME / STATUS */}

                            <div className="text-[8.5px] leading-tight text-slate-500 font-mono mt-1">

                              {isReady
                                ? `Ready at ${kr.timestamp} • Hot on pass window`
                                : isCooking
                                ? `In preparation • Cook time: ${
                                    kr.elapsedMinutes ||
                                    8
                                  }m`
                                : `Order ticket received at ${kr.timestamp}`}

                            </div>

                          </div>


                          {/* ===================================
                              SERVE FOOD
                          ==================================== */}

                          <div className="shrink-0 pt-1">

                            {isReady ? (

                              <button
                                type="button"
                                onClick={() => {

                                  // 1. Mark KDS item served
                                  waiterMarkKitchenItemServed(
                                    kr.id
                                  );

                                  // 2. Mark table food served
                                  if (
                                    kr.tableNumber
                                  ) {
                                    waiterMarkTableFoodServed(
                                      kr.tableNumber
                                    );
                                  }

                                }}
                                className="rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-900 hover:text-white border border-emerald-400 hover:border-emerald-600 px-3 py-2 text-[9px] font-mono font-black transition duration-150 cursor-pointer shadow-2xs whitespace-nowrap"
                              >

                                Serve Food

                              </button>

                            ) : isCooking ? (

                              <span className="inline-block px-2.5 py-2 rounded-md bg-amber-100 text-amber-800 text-[8px] font-mono font-bold border border-amber-200 whitespace-nowrap">

                                Cooking...

                              </span>

                            ) : (

                              <span className="inline-block px-2.5 py-2 rounded-md bg-slate-100 text-slate-600 text-[8px] font-mono font-bold border border-slate-200 whitespace-nowrap">

                                Queued

                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                    );
                  }
                )

              ) : (

                <div className="text-center py-8 text-slate-400 font-mono text-[10px] flex flex-col items-center justify-center gap-1">

                  <Utensils className="h-5 w-5 text-slate-300" />

                  <span>

                    No active kitchen orders

                  </span>

                </div>

              )

            )}

          </div>

        </div>

      </div>

    </WaiterTabletHousing>
  );
};