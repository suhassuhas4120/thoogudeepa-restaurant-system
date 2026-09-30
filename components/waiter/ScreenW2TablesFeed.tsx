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
  Clock,
  Bell,
  Trash2,
  Volume2,
  VolumeX,
  Link2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type TableView = SharedTable & {
  mergedWith?: string;
  guestCount?: number;
  activeItems?: { name: string; quantity: number; status?: string; price?: number }[];
};

type KdsView = SharedKDSTicket & {
  elapsedMinutes?: number;
};

export interface WaiterToastNotification {
  id: string;
  source: 'KITCHEN' | 'CUSTOMER' | 'MANAGER';
  title: string;
  detail: string;
  timestamp: string;
  tableNumber?: string;
  ticketId?: string;
  pingId?: string;
  noticeId?: string;
}

export const ScreenW2TablesFeed: React.FC = () => {
  const {
    setCurrentScreen,
    selectTable,
    selectedTableNumber,
    activeSection,
    setActiveSection,
    activeCaptain,
    activeAlertFilter,
    setActiveAlertFilter,
    soundAlertsEnabled,
    toggleSoundAlerts,
    showFloorTables,
    setShowFloorTables,
  } = useWaiterStore();

  const {
    tables: sharedTables,
    pings,
    kdsTickets: sharedKdsTickets,
    inventory86,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterMarkTableFoodServed,
    waiterVacatesTable,
  } = useSharedBridge();

  const tables = sharedTables as TableView[];
  const kdsTickets = sharedKdsTickets as KdsView[];

  // Floor Overview dropdown state: synced to useWaiterStore so navigating back preserves open state
  const showTables = showFloorTables;
  const setShowTables = setShowFloorTables;

  // Section filter for tables: synced to useWaiterStore
  const selectedSection = activeSection || 'ALL';
  const setSelectedSection = (sec: string) => setActiveSection(sec);

  // Dismissed Manager notices state
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([]);

  // Floor Metrics (Matched with Tablet View: Occupied, Vacant, Orders)
  const activeOrdersCount = kdsTickets.filter(
    (tk: KdsView) => tk.status !== 'COMPLETED'
  ).length;

  const occupiedCount = tables.filter(
    (t: TableView) => t.status === 'OCCUPIED' || t.status === 'BILLING'
  ).length;

  const vacantCount = tables.filter(
    (t: TableView) => t.status === 'VACANT'
  ).length;

  // Section filter options: Standard Section Names A, B, C, D
  const filterSections = [
    'ALL',
    'SECTION A',
    'SECTION B',
    'SECTION C',
    'SECTION D',
  ];

  // Helper to map tables to standard section names (Section A, B, C, D)
  const getTableSection = (table: TableView): string => {
    const num = (table.number || '').trim().toUpperCase();
    const sec = (table.section || '').trim().toUpperCase();

    if (num.startsWith('A') || sec.includes('SECTION A') || sec === 'A') {
      return 'SECTION A';
    }
    if (num.startsWith('B') || sec.includes('SECTION B') || sec === 'B') {
      return 'SECTION B';
    }
    if (num === 'C-01' || sec.includes('TERRACE') || sec.includes('SECTION C')) {
      return 'SECTION C';
    }
    if (
      num === 'C-02' ||
      num === 'C-03' ||
      sec.includes('FAMILY') ||
      sec.includes('SECTION D') ||
      num.startsWith('D')
    ) {
      return 'SECTION D';
    }
    return 'SECTION C';
  };

  // Filter tables by section
  const filteredTables = tables.filter((table: TableView) => {
    if (selectedSection === 'ALL') return true;
    return getTableSection(table) === selectedSection;
  });

  // Sort tables: A-01, A-02, B-01, C-01, etc.
  const sortedTables = [...filteredTables].sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' })
  );

  // 1. KITCHEN TICKETS (Priority 1: Most important, ready food at top)
  const activeKdsTickets = [...kdsTickets]
    .filter((tk: KdsView) => tk.status !== 'COMPLETED')
    .sort((a: KdsView, b: KdsView) => {
      const order: Record<string, number> = {
        READY: 0,
        PREP: 1,
        NEW: 2,
      };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  // 2. CUSTOMER CALLS (Priority 2)
  const pendingPings = pings.filter((p) => p.status === 'PENDING');

  // 3. MANAGER NOTICES (Priority 3)
  const soldOutItems = (inventory86 || []).filter((it) => it.is86);
  const managerNotices = soldOutItems
    .map((item) => ({
      id: `mgr-86-${item.id}`,
      badge: 'SOLD OUT',
      title: `${item.name} is Sold Out`,
      detail: `Kitchen stock finished. Do not take new orders for this dish.`,
    }))
    .filter((n) => !dismissedNoticeIds.includes(n.id));

  const totalAlertsCount = activeKdsTickets.length + pendingPings.length + managerNotices.length;



  /* ─────────────────────────────────────────────────────────────
     INTERACTIVE ACTIONS
  ────────────────────────────────────────────────────────────── */
  const handleTableClick = (tableNumber: string) => {
    selectTable(tableNumber);
    setShowFloorTables(true);
    setCurrentScreen(3);
  };

  const handleVacateTable = (e: React.MouseEvent, tableNumber: string) => {
    e.stopPropagation();
    waiterVacatesTable(tableNumber);
  };

  const handleServeReadyTable = (e: React.MouseEvent | null, tableNumber: string) => {
    if (e) e.stopPropagation();
    waiterMarkTableFoodServed(tableNumber);

    const cleanNum = tableNumber.replace(/\D/g, '');
    kdsTickets
      .filter((tk: KdsView) => {
        const tkNum = (tk.tableNumber || '').replace(/\D/g, '');
        return tk.tableNumber === tableNumber || (cleanNum && tkNum === cleanNum);
      })
      .forEach((tk: KdsView) => {
        waiterMarkKitchenItemServed(tk.id);
      });
  };

  const handleServeTicket = (ticketId: string, tableNumber?: string) => {
    waiterMarkKitchenItemServed(ticketId);
    if (tableNumber) {
      waiterMarkTableFoodServed(tableNumber);
    }
  };

  // Helper: Check if table has ready food from KDS or active items
  const checkTableHasReadyFood = (table: TableView) => {
    const cleanNum = table.number.replace(/\D/g, '');
    const hasReadyKds = kdsTickets.some((tk: KdsView) => {
      const tkNum = (tk.tableNumber || '').replace(/\D/g, '');
      return (
        (tk.tableNumber === table.number || (cleanNum && tkNum === cleanNum)) &&
        tk.status === 'READY'
      );
    });

    const hasReadyItem = table.activeItems?.some(
      (it) => String(it.status || '').toUpperCase() === 'READY'
    ) ?? false;

    return hasReadyKds || hasReadyItem;
  };

  return (
    <WaiterTabletHousing
      screenNumber={2}
      screenTitle="FLOOR TABLES & NOTIFICATIONS"
    >
      <div className="flex-1 flex flex-col min-h-0 bg-stone-50/70 overflow-hidden relative">

        {/* =====================================================
            TOP BAR: MINIMAL FLOOR SUMMARY & TABLES TOGGLE
            - Sound ON/OFF is ICON ONLY (no extra text)
        ====================================================== */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 shrink-0 shadow-2xs select-none">
          {/* Header Row: Captain Name + Controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-black text-slate-900 uppercase tracking-wide">
                {activeCaptain || 'Captain'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                • {selectedSection === 'ALL' ? 'All Sections' : selectedSection}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Notification Toggle: ICON ONLY */}
              <button
                type="button"
                onClick={toggleSoundAlerts}
                className={`h-8 w-8 rounded-xl transition cursor-pointer border shadow-2xs active:scale-95 flex items-center justify-center ${
                  soundAlertsEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
                }`}
                title={soundAlertsEnabled ? 'Sound alerts active (tap to mute)' : 'Sound alerts muted (tap to unmute)'}
              >
                {soundAlertsEnabled ? (
                  <Volume2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Simple, 1-Click Toggle for Tables */}
              <button
                type="button"
                onClick={() => setShowTables(!showTables)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-black transition cursor-pointer shadow-xs active:scale-95"
              >
                <span>{showTables ? 'Hide Tables ▲' : `Tables (${filteredTables.length}) ▼`}</span>
              </button>
            </div>
          </div>

          {/* 3 Clean Stat Cards (Matches Tablet: Occupied, Vacant, Orders) */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Occupied */}
            <div className="bg-slate-900 text-white rounded-xl py-1.5 px-1 shadow-2xs">
              <div className="text-[8.5px] text-slate-300 font-bold uppercase tracking-wider">Occupied</div>
              <div className="text-base font-black leading-tight mt-0.5">{occupiedCount}</div>
            </div>

            {/* Vacant */}
            <div className="bg-emerald-50 text-emerald-950 rounded-xl py-1.5 px-1 border border-emerald-300">
              <div className="text-[8.5px] text-emerald-700 font-bold uppercase tracking-wider">Vacant</div>
              <div className="text-base font-black leading-tight mt-0.5">{vacantCount}</div>
            </div>

            {/* Orders */}
            <div className="bg-amber-50 text-amber-950 rounded-xl py-1.5 px-1 border border-amber-300">
              <div className="text-[8.5px] text-amber-700 font-bold uppercase tracking-wider">Orders</div>
              <div className="text-base font-black leading-tight mt-0.5">{activeOrdersCount}</div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SECTION PILLS (SHOWN ONLY WHEN TABLES ARE VISIBLE)
        ====================================================== */}
        {showTables && (
          <div className="bg-white/95 border-b border-slate-200 px-3.5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 shadow-2xs">
            {filterSections.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-full text-[10.5px] font-mono font-bold shrink-0 transition duration-150 cursor-pointer ${
                  selectedSection === sec
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'bg-stone-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec === 'ALL' ? 'All Sections' : sec.replace('SECTION ', 'Sec ')}
              </button>
            ))}
            <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0 ml-auto pl-1">
              {filteredTables.length} Tables
            </span>
          </div>
        )}

        {/* =====================================================
            UNIFIED SCROLL CONTAINER
        ====================================================== */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin">

          {/* ===================================================
              FLOOR TABLES (SHOWN WHEN TOGGLED OPEN)
              - Vacant tables: "No active orders yet" (Zero seat numbers)
              - Occupied/Billing tables: Top row header/bill, Bottom row items + button
          ==================================================== */}
          <AnimatePresence>
            {showTables && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Table Cards List */}
                <div className="grid grid-cols-1 gap-3.5">
                  {sortedTables.map((t: TableView) => {
                    const isOccupied = t.status === 'OCCUPIED';
                    const isBilling = t.status === 'BILLING';
                    const isVacant = t.status === 'VACANT';
                    const hasReadyFood = checkTableHasReadyFood(t);
                    const tableSection = getTableSection(t);
                    const isSelected = selectedTableNumber === t.number;

                    // Formatted active items list
                    const itemsSummary = (t.activeItems || [])
                      .map((it) => `${it.name} (${it.quantity})`)
                      .join(', ');

                    /* ── VACANT TABLE CARD: STATUS BADGE AT TOP, "No items yet ordered" AT CENTER, BILL AT END ── */
                    if (isVacant) {
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleTableClick(t.number)}
                          className={`w-full rounded-2xl border-2 p-3.5 cursor-pointer transition duration-150 shadow-xs flex flex-col justify-between gap-2.5 bg-white ${
                            isSelected
                              ? 'border-orange-500 ring-2 ring-orange-500/40 bg-orange-50/20'
                              : 'border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          {/* Top Row: Table Name + Section Badge on Left, VACANT Badge on Right */}
                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base font-black font-mono text-slate-950 tracking-tight shrink-0">
                                TABLE {t.mergedWith ? `${t.number}+${t.mergedWith}` : t.number}
                              </span>
                              {t.mergedWith && (
                                <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[8px] font-mono font-black uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-2xs">
                                  <Link2 className="h-2 w-2 stroke-[3]" />
                                  <span>Merged</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-mono font-bold uppercase shrink-0">
                                {tableSection.replace('SECTION ', 'Sec ')}
                              </span>
                            </div>

                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border uppercase tracking-wider shrink-0 bg-emerald-100 text-emerald-900 border-emerald-300">
                              VACANT
                            </span>
                          </div>

                          {/* Center: "No items yet ordered" Text */}
                          <div className="py-2 flex items-center justify-center text-center border-t border-slate-100 min-w-0">
                            <span className="font-mono text-xs font-semibold text-slate-400 tracking-wide">
                              No items yet ordered
                            </span>
                          </div>

                          {/* End Row: Bill at the end */}
                          <div className="flex items-center justify-start pt-1 border-t border-slate-100 font-mono text-xs min-w-0">
                            <span className="text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                              Bill: ₹0
                            </span>
                          </div>
                        </div>
                      );
                    }

                    /* ── OCCUPIED OR BILLING TABLE CARD ── */
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleTableClick(t.number)}
                        className={`w-full rounded-2xl border-2 p-3.5 cursor-pointer transition duration-150 shadow-xs flex flex-col justify-between gap-2.5 overflow-hidden ${
                          isSelected ? 'ring-2 ring-orange-500/40 shadow-md ' : ''
                        }${
                          hasReadyFood
                            ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/30'
                            : isBilling
                            ? 'bg-purple-50/80 border-purple-400'
                            : isSelected
                            ? 'bg-orange-50/20 border-orange-500'
                            : 'bg-white border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {/* Top Row: Table Name + Section Badge on Left, DINING / BILLING Badge on Right */}
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base font-black font-mono text-slate-950 tracking-tight shrink-0">
                              TABLE {t.mergedWith ? `${t.number}+${t.mergedWith}` : t.number}
                            </span>
                            {t.mergedWith && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[8px] font-mono font-black uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-2xs">
                                <Link2 className="h-2 w-2 stroke-[3]" />
                                <span>Merged</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-mono font-bold uppercase shrink-0">
                              {tableSection.replace('SECTION ', 'Sec ')}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border uppercase tracking-wider shrink-0 ${
                              isBilling
                                ? 'bg-purple-100 text-purple-950 border-purple-300'
                                : 'bg-amber-100 text-amber-950 border-amber-300'
                            }`}
                          >
                            {isBilling ? 'BILLING' : 'DINING'}
                          </span>
                        </div>

                        {/* Center Row: Details of Ordered Items / Settlement Status */}
                        <div className="pt-1 border-t border-slate-100 font-mono text-xs min-w-0">
                          {isOccupied && (
                            <>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {hasReadyFood ? '🔥 Ready to Serve:' : '🍳 Preparing in Kitchen:'}
                              </div>
                              <div className="font-bold text-slate-900 truncate mt-0.5 min-w-0">
                                {itemsSummary || 'Order taking in progress...'}
                              </div>
                            </>
                          )}

                          {isBilling && (
                            <>
                              <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                                Settlement Status:
                              </div>
                              <div className="font-black text-purple-950 mt-0.5 truncate min-w-0">
                                Payment Completed • Table Ready to Clear
                              </div>
                            </>
                          )}
                        </div>

                        {/* End Row: Bill on Left, Action Button on Right (Clean & Uncrowded) */}
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 min-w-0">
                          {/* Bill at the End */}
                          <div className="font-mono text-xs font-black shrink-0">
                            {isBilling ? (
                              <span className="text-purple-950 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-300 shadow-2xs">
                                Bill: <span className="font-black">₹{t.currentBill}</span> <span className="text-[10px] text-purple-600 font-normal">• Paid</span>
                              </span>
                            ) : (
                              <span className="text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                                Bill: <span className="text-emerald-700 font-black">₹{t.currentBill}</span> <span className="text-[10px] text-slate-500 font-normal">• ⏱ {t.seatedTime}</span>
                              </span>
                            )}
                          </div>

                          {/* Action Button at the End */}
                          {isOccupied && (
                            hasReadyFood ? (
                              <button
                                type="button"
                                onClick={(e) => handleServeReadyTable(e, t.number)}
                                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 animate-pulse shrink-0 whitespace-nowrap"
                              >
                                <Utensils className="h-3.5 w-3.5" />
                                <span>Serve Food</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="h-9 px-3.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-300 font-mono font-bold text-[11px] flex items-center justify-center gap-1 cursor-not-allowed opacity-80 shrink-0 whitespace-nowrap"
                              >
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span>Preparing...</span>
                              </button>
                            )
                          )}

                          {isBilling && (
                            <button
                              type="button"
                              onClick={(e) => handleVacateTable(e, t.number)}
                              className="h-9 px-4 rounded-xl bg-purple-100 hover:bg-purple-600 text-purple-950 hover:text-white border-2 border-purple-400 font-mono font-black text-xs transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Vacate</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Subtle Divider to Alerts */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-stone-50 px-3 font-mono text-[9.5px] font-black text-slate-400">
                      Live Alerts Below ▼
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===================================================
              LIVE OPERATIONS ALERTS (DEFAULT PRIMARY VIEW)
              - Interactive Filter Pills: All, Kitchen, Guest Calls, Manager
              - Orders: Kitchen FIRST -> Customer SECOND -> Manager THIRD
              - Header: Clean 1-Badge + 1-Time Display (No Badge Crowding)
          ==================================================== */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
            {/* Header with Title & Active Count */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-600" />
                <span className="font-mono text-xs font-black text-slate-950 uppercase tracking-wide">
                  Live Floor Alerts
                </span>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 font-black">
                {totalAlertsCount} Active
              </span>
            </div>

            {/* Interactive Alert Filter Pills (Kitchen, Guest Calls, Manager) */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveAlertFilter('ALL')}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] font-black transition cursor-pointer shrink-0 shadow-2xs ${
                  activeAlertFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({totalAlertsCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveAlertFilter('KITCHEN')}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] font-black transition cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs ${
                  activeAlertFilter === 'KITCHEN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <span>🍳 Kitchen ({activeKdsTickets.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAlertFilter('CUSTOMER')}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] font-black transition cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs ${
                  activeAlertFilter === 'CUSTOMER'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-orange-50 text-orange-900 border border-orange-300 hover:bg-orange-100'
                }`}
              >
                <span>🙋 Guest Calls ({pendingPings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAlertFilter('MANAGER')}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] font-black transition cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs ${
                  activeAlertFilter === 'MANAGER'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-900 border border-purple-300 hover:bg-purple-100'
                }`}
              >
                <span>📢 Manager ({managerNotices.length})</span>
              </button>
            </div>

            {/* List of Alerts (Filtered by Active Pill) */}
            <div className="space-y-3 pt-1">

              {/* ──────────────────────────────────────────────
                  PRIORITY 1: KITCHEN ALERTS (FIRST & MOST IMPORTANT)
                  - Single Table Badge on Left, Clean Time Text on Right
              ─────────────────────────────────────────────── */}
              {(activeAlertFilter === 'ALL' || activeAlertFilter === 'KITCHEN') &&
                activeKdsTickets.map((kr: KdsView) => {
                  const isReady = kr.status === 'READY';
                  const isPreparing = kr.status === 'PREP';

                  return (
                    <div
                      key={kr.id}
                      className={`p-3.5 rounded-2xl border-2 text-xs shadow-xs space-y-2.5 overflow-hidden ${
                        isReady
                          ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400/30'
                          : 'border-amber-300 bg-amber-50/80'
                      }`}
                    >
                      {/* Header Row: 1 Badge on Left, Clean Time Text on Right (NO CROWDING) */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-black shrink-0 shadow-2xs">
                            TABLE {kr.tableNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase shrink-0 ${
                              isReady
                                ? 'bg-emerald-600 text-white animate-pulse'
                                : isPreparing
                                ? 'bg-amber-200 text-amber-950 border border-amber-400'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isReady ? 'Ready' : `Preparing (${kr.elapsedMinutes || 8}m)`}
                          </span>
                        </div>

                        {/* Clean Time Display (Simple Text, No Heavy Pill) */}
                        <span className="text-[11px] font-mono text-slate-500 font-bold shrink-0">
                          ⏱ {kr.timestamp}
                        </span>
                      </div>

                      {/* Detail Row: Food Items + Serve Button */}
                      <div className="flex items-center justify-between gap-3 pt-0.5 min-w-0">
                        <div className="font-mono text-xs text-slate-900 font-bold truncate flex-1 min-w-0">
                          {kr.items
                            .map((it: { name: string; quantity: number }) => `${it.name} (${it.quantity})`)
                            .join(', ')}
                        </div>

                        {isReady && (
                          <button
                            type="button"
                            onClick={() => handleServeTicket(kr.id, kr.tableNumber)}
                            className="h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-black transition cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                          >
                            <Utensils className="h-3.5 w-3.5" />
                            <span>SERVE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* ──────────────────────────────────────────────
                  PRIORITY 2: CUSTOMER CALLS (SECOND)
                  - Single Table Badge on Left, Clean Time Text on Right
              ─────────────────────────────────────────────── */}
              {(activeAlertFilter === 'ALL' || activeAlertFilter === 'CUSTOMER') &&
                pendingPings.map((p: (typeof pings)[number]) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-orange-50 border-2 border-orange-300 text-xs shadow-xs space-y-2.5 overflow-hidden"
                  >
                    {/* Header Row: 1 Badge on Left, Clean Time Text on Right */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-black shrink-0 shadow-2xs">
                          TABLE {p.tableNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-black uppercase shrink-0 bg-orange-600 text-white">
                          🔔 {p.type}
                        </span>
                      </div>

                      {/* Clean Time Display (Simple Text) */}
                      <span className="text-[11px] font-mono text-slate-500 font-bold shrink-0">
                        ⏱ {p.timestamp}
                      </span>
                    </div>

                    {/* Detail Row: Message + Attended Button */}
                    <div className="flex items-center justify-between gap-3 pt-0.5 min-w-0">
                      <div className="text-xs text-slate-900 font-mono font-bold truncate flex-1 min-w-0">
                        {p.guestName || 'Guest'}: {p.message ? `"${p.message}"` : 'Needs assistance at table'}
                      </div>

                      <button
                        type="button"
                        onClick={() => waiterResolvePing(p.id)}
                        className="h-9 px-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-mono font-black transition cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Attended</span>
                      </button>
                    </div>
                  </div>
                ))}

              {/* ──────────────────────────────────────────────
                  PRIORITY 3: MANAGER ALERTS (THIRD)
                  - Single Badge on Left, Clean Stock Tag on Right
              ─────────────────────────────────────────────── */}
              {(activeAlertFilter === 'ALL' || activeAlertFilter === 'MANAGER') &&
                managerNotices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl border-2 border-rose-300 bg-rose-50 text-xs shadow-xs space-y-2 overflow-hidden"
                  >
                    {/* Header Row: Badge on Left, Clean Tag on Right */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase shrink-0 bg-rose-600 text-white shadow-2xs">
                        ⚠️ {n.badge}
                      </span>
                      <span className="text-[11px] font-mono text-rose-800 font-bold shrink-0">
                        Stock Notice
                      </span>
                    </div>

                    {/* Title & Description: Clean text wrapping strictly within card boundaries */}
                    <div className="space-y-1 min-w-0">
                      <div className="font-black text-slate-950 text-xs font-mono break-words leading-snug">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-slate-700 font-mono font-medium break-words leading-relaxed">
                        {n.detail}
                      </div>
                    </div>

                    {/* Action Button on Right */}
                    <div className="flex justify-end pt-1.5 border-t border-rose-200/70">
                      <button
                        type="button"
                        onClick={() => setDismissedNoticeIds((prev) => [...prev, n.id])}
                        className="h-8 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-[10.5px] transition cursor-pointer shrink-0 active:scale-95 shadow-xs"
                      >
                        Understood
                      </button>
                    </div>
                  </div>
                ))}

              {/* Empty State when no pending alerts in selected filter */}
              {((activeAlertFilter === 'ALL' && totalAlertsCount === 0) ||
                (activeAlertFilter === 'KITCHEN' && activeKdsTickets.length === 0) ||
                (activeAlertFilter === 'CUSTOMER' && pendingPings.length === 0) ||
                (activeAlertFilter === 'MANAGER' && managerNotices.length === 0)) && (
                <div className="text-center py-8 text-slate-400 font-mono text-[11px] flex flex-col items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <span className="font-bold text-slate-700 text-xs">All Clear!</span>
                  <span className="text-[10px]">No pending alerts in this category.</span>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </WaiterTabletHousing>
  );
};