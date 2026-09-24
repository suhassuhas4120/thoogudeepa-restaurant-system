'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import {
  Clock,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  Layers,
  ChefHat,
  Bell,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Authentic default seeded tables matching Screenshot 2 wireframe
interface K2TableItem {
  id: string;
  name: string;
  quantity: number;
  stage: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
}

interface K2Table {
  id: string;
  tableNumber: string;
  isVip?: boolean;
  kotNumber: string;
  elapsedMinutes: number;
  serverName: string;
  items: K2TableItem[];
}

const INITIAL_K2_TABLES: K2Table[] = [
  {
    id: 'tbl-1',
    tableNumber: 'TABLE 01',
    kotNumber: '101',
    elapsedMinutes: 14,
    serverName: 'Captain Ramesh',
    items: [
      { id: 't1-i1', name: 'Special Chicken Donne Biryani', quantity: 2, stage: 'PREPARING' },
      { id: 't1-i2', name: 'Mutton Chops Fry (Dry)', quantity: 1, stage: 'RECEIVED' },
    ],
  },
  {
    id: 'tbl-2',
    tableNumber: 'TABLE 02',
    kotNumber: '102',
    elapsedMinutes: 8,
    serverName: 'Captain Suresh',
    items: [
      { id: 't2-i1', name: 'Donne Mutton Biryani (Regular)', quantity: 2, stage: 'RECEIVED' },
      { id: 't2-i2', name: 'Guntur Chicken Wings', quantity: 1, stage: 'RECEIVED' },
    ],
  },
  {
    id: 'tbl-3',
    tableNumber: 'TABLE 03',
    kotNumber: '103',
    elapsedMinutes: 22,
    serverName: 'Captain Naveen',
    items: [
      { id: 't3-i1', name: 'Special Chicken Donne Biryani', quantity: 1, stage: 'READY' },
      { id: 't3-i2', name: 'Chicken Kshatriya Kebab', quantity: 1, stage: 'READY' },
    ],
  },
  {
    id: 'tbl-4',
    tableNumber: 'TABLE 04',
    isVip: true,
    kotNumber: '104',
    elapsedMinutes: 12,
    serverName: 'Captain Ramesh',
    items: [
      { id: 't4-i1', name: 'Donne Mutton Biryani (Large)', quantity: 1, stage: 'PREPARING' },
      { id: 't4-i2', name: 'Nati Koli Donne Biryani', quantity: 2, stage: 'PREPARING' },
    ],
  },
  {
    id: 'tbl-5',
    tableNumber: 'TABLE 05',
    kotNumber: '105',
    elapsedMinutes: 5,
    serverName: 'Captain Suresh',
    items: [
      { id: 't5-i1', name: 'Donne Mutton Biryani (Regular)', quantity: 1, stage: 'RECEIVED' },
      { id: 't5-i2', name: 'Donne Egg Biryani', quantity: 3, stage: 'RECEIVED' },
    ],
  },
  {
    id: 'tbl-6',
    tableNumber: 'TABLE 06',
    kotNumber: '106',
    elapsedMinutes: 18,
    serverName: 'Captain Naveen',
    items: [
      { id: 't6-i1', name: 'Mutton Chops Fry (Dry)', quantity: 2, stage: 'READY' },
      { id: 't6-i2', name: 'Special Donne Biryani Rice Combo', quantity: 1, stage: 'PREPARING' },
    ],
  },
];

export const ScreenK2Overview: React.FC = () => {
  const {
    setCurrentScreen,
    setSelectedTableNumber,
    soundAlertsEnabled,
    toggleSoundAlerts,
    callFloorWaiter,
  } = useKitchenStore();

  const {
    kdsTickets: bridgeTickets,
    kitchenSetItemStage,
    kitchenSetBulkItemStage,
  } = useSharedBridge();

  // Local state for initial tables
  const [tablesState, setTablesState] = useState<K2Table[]>(INITIAL_K2_TABLES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL CATEGORIES');
  const [filterStation, setFilterStation] = useState<string>('ALL');

  // Track active stage for each bulk aggregated item
  const [bulkStages, setBulkStages] = useState<Record<string, 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED'>>({
    'Special Chicken Donne Biryani': 'PREPARING',
    'Donne Mutton Biryani': 'PREPARING',
    'Mutton Chops Fry (Dry)': 'READY',
    'Guntur Chicken Wings': 'RECEIVED',
  });

  // Convert bridge tickets into K2Table format
  const activeBridgeTables: K2Table[] = React.useMemo(() => {
    return bridgeTickets
      .filter((tk) => tk.status !== 'COMPLETED')
      .map((tk) => ({
        id: tk.id,
        tableNumber: `TABLE ${tk.tableNumber}`,
        kotNumber: tk.id.replace('KDS-', ''),
        elapsedMinutes: tk.elapsedMinutes || 1,
        serverName: tk.serverName || 'Captain',
        isVip: tk.source === 'CUSTOMER',
        items: tk.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          stage: (it.stage === 'PLACED'
            ? 'RECEIVED'
            : it.stage === 'PREP'
            ? 'PREPARING'
            : it.stage === 'PLATED'
            ? 'READY'
            : 'SERVED') as 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED',
        })),
      }));
  }, [bridgeTickets]);

  // Combined tables: active bridge tables take priority, supplemented by initial tables to fill the 6-table grid
  const allTablesToRender: K2Table[] = React.useMemo(() => {
    if (activeBridgeTables.length === 0) return tablesState;
    const tableNumsInBridge = new Set(activeBridgeTables.map((t) => t.tableNumber));
    const remainingSeedTables = tablesState.filter((t) => !tableNumsInBridge.has(t.tableNumber));
    return [...activeBridgeTables, ...remainingSeedTables];
  }, [activeBridgeTables, tablesState]);

  // Interactive Stage Stepper Handler
  const handleSetStage = (
    tableId: string,
    itemId: string,
    newStage: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED'
  ) => {
    // 1. Update local seed tables if present
    setTablesState((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        return {
          ...tbl,
          items: tbl.items.map((it) => (it.id === itemId ? { ...it, stage: newStage } : it)),
        };
      })
    );

    // 2. Synchronize to useSharedBridge if it's a bridge ticket or matches an item
    const bridgeStage =
      newStage === 'PREPARING'
        ? 'PREP'
        : newStage === 'READY'
        ? 'PLATED'
        : newStage === 'SERVED'
        ? 'SERVED'
        : 'PLACED';

    const bridgeTicket = bridgeTickets.find(
      (tk) => tk.id === tableId || tk.items.some((i) => i.id === itemId)
    );
    if (bridgeTicket) {
      kitchenSetItemStage(bridgeTicket.id, itemId, bridgeStage);
    }
  };

  // Interactive Bulk Prep Mode Handler (Cross-Table & Cross-Portal)
  const handleSetBulkStage = (
    bulkItemName: string,
    newStage: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED'
  ) => {
    // 1. Update bulk active stage tracker
    setBulkStages((prev) => ({ ...prev, [bulkItemName]: newStage }));

    // 2. Update all matching items across all tables in local table grid
    setTablesState((prev) =>
      prev.map((tbl) => ({
        ...tbl,
        items: tbl.items.map((it) => {
          const itLower = it.name.toLowerCase();
          const bulkLower = bulkItemName.toLowerCase();
          const isMatch = itLower.includes(bulkLower) || bulkLower.includes(itLower);
          return isMatch ? { ...it, stage: newStage } : it;
        }),
      }))
    );

    // 3. Map to bridge stage format
    const bridgeStage =
      newStage === 'PREPARING'
        ? 'PREP'
        : newStage === 'READY'
        ? 'PLATED'
        : newStage === 'SERVED'
        ? 'SERVED'
        : 'PLACED';

    // 4. Update useSharedBridge to sync with Customer and Waiter in real time
    if (kitchenSetBulkItemStage) {
      kitchenSetBulkItemStage(bulkItemName, bridgeStage);
    }
  };

  const handleOpenTable = (tableNumber: string) => {
    setSelectedTableNumber(tableNumber.replace('TABLE ', ''));
    setCurrentScreen(3);
  };

  // Bulk Aggregation Cards Calculation
  const bulkAggregation = [
    {
      name: 'Special Chicken Donne Biryani',
      total: 5,
      sources: 'TBL 01 (x2), TBL 03 (x1), TBL 06 (x2)',
      status: '3 COOKING, 2 PENDING',
    },
    {
      name: 'Donne Mutton Biryani',
      total: 4,
      sources: 'TBL 02 (x2), TBL 04 (x1), TBL 05 (x1)',
      status: '4 COOKING',
    },
    {
      name: 'Mutton Chops Fry (Dry)',
      total: 3,
      sources: 'TBL 01 (x1), TBL 06 (x2)',
      status: '1 READY, 2 COOKING',
    },
    {
      name: 'Guntur Chicken Wings',
      total: 2,
      sources: 'TBL 03 (x1), TBL 07 (x1)',
      status: '2 PENDING',
    },
  ];

  // Right Side Time Queue Data (Dynamic from bridgeTickets or default demo)
  const timeQueueTickets = React.useMemo(() => {
    if (bridgeTickets.length > 0) {
      return bridgeTickets.map((tk) => ({
        ticketNum: tk.id.replace('KDS-', ''),
        table: `TABLE ${tk.tableNumber}`,
        time: `${tk.timestamp} (${tk.elapsedMinutes || 1}m)`,
        items: tk.items.map((it) => `${it.quantity}x ${it.name}`),
      }));
    }
    return [
      {
        ticketNum: '101',
        table: 'TABLE 01',
        time: '12:40 PM (14m)',
        items: ['2x Special Chicken Donne Biryani [NOTE: LESS SPICY]', '1x Mutton Chops Fry [NOTE: EXTRA CRISPY]'],
      },
      {
        ticketNum: '102',
        table: 'TABLE 02',
        time: '12:44 PM (10m)',
        items: ['2x Donne Mutton Biryani [NOTE: EXTRA SALNA]', '1x Guntur Chicken Wings [NOTE: STANDARD]'],
      },
      {
        ticketNum: '103',
        table: 'TABLE 03',
        time: '12:48 PM (06m)',
        items: ['1x Special Chicken Donne Biryani', '1x Chicken Kshatriya Kebab'],
      },
      {
        ticketNum: '104',
        table: 'TABLE 04',
        time: '12:52 PM (02m)',
        items: ['1x Donne Mutton Biryani (Large)', '2x Nati Koli Donne Biryani'],
      },
      {
        ticketNum: '105',
        table: 'TABLE 05',
        time: '12:54 PM (Just Now)',
        items: ['1x Donne Mutton Biryani (Regular)', '3x Donne Egg Biryani'],
      },
    ];
  }, [bridgeTickets]);

  return (
    <KitchenTabletHousing screenNumber={2} screenTitle="ALL TABLES & FEEDS (70/30 SPLIT)">
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* TOP FILTER & CATEGORY BAR */}
        <div className="bg-white border-b-2 border-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="font-mono text-[10px] font-black uppercase text-slate-500 mr-1">
              Categories:
            </span>
            {['ALL CATEGORIES', 'DUM BIRYANI', 'STARTERS & KEBABS', 'CURRY & SIDES', 'BEVERAGES'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded border font-mono text-[10.5px] font-black transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-stone-50 text-slate-700 border-slate-300 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-stone-100 border border-slate-300 px-2 py-1 rounded">
              Filter: All Active Orders
            </span>
            <button
              onClick={() => callFloorWaiter('CALL_WAITER', 'Kitchen requests Captain at pass')}
              className="bg-stone-100 hover:bg-orange-100 border border-slate-300 px-2.5 py-1 rounded font-mono text-[10px] font-black text-slate-900 flex items-center gap-1 transition"
            >
              <Bell className="h-3 w-3 text-orange-600" />
              <span>Call Waiter</span>
            </button>
          </div>
        </div>

        {/* BULK AGGREGATION DISPLAY BAR (10-15% of screen height) */}
        <div className="bg-stone-50 border-b-2 border-slate-900 p-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10.5px] font-black text-slate-900 uppercase">
              📦 Bulk Aggregation Display • Similar Items Across Active Tables
            </span>
            <span className="font-mono text-[10px] text-slate-600 font-bold">
              Bulk Queue: Consolidated Items
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {bulkAggregation.map((b, idx) => {
              const currentBulkStage = bulkStages[b.name] || 'PREPARING';
              return (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-900 rounded-xl p-2.5 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-mono text-[11px] font-black text-slate-900 truncate" title={b.name}>
                      {b.name}
                    </span>
                    <span className="font-mono text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded ml-1 shrink-0">
                      TOTAL: {b.total}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-600 truncate">
                    {b.sources}
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9px] font-extrabold text-orange-700">
                    <span>Status:</span>
                    <span className="bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded text-[8.5px]">
                      {currentBulkStage === 'RECEIVED'
                        ? `All ${b.total} Pending`
                        : currentBulkStage === 'PREPARING'
                        ? `All ${b.total} Cooking`
                        : currentBulkStage === 'READY'
                        ? `All ${b.total} Ready`
                        : `All ${b.total} Served`}
                    </span>
                  </div>

                  {/* PREP MODE SELECTION BUTTONS FOR THIS BULK ORDER */}
                  <div className="pt-1.5 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 mb-1 uppercase">
                      <span>Bulk Stage:</span>
                      <span className="text-orange-600 font-black">
                        {currentBulkStage === 'RECEIVED'
                          ? '1.REC'
                          : currentBulkStage === 'PREPARING'
                          ? '2.PREP'
                          : currentBulkStage === 'READY'
                          ? '3.READY'
                          : '4.SERVED'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 font-mono text-[8px] font-black">
                      {(['RECEIVED', 'PREPARING', 'READY', 'SERVED'] as const).map((stg, sIdx) => {
                        const labels = ['1.REC', '2.PREP', '3.READY', '4.SERVED'];
                        const isActive = currentBulkStage === stg;
                        return (
                          <button
                            key={stg}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetBulkStage(b.name, stg);
                            }}
                            className={`py-1 rounded text-center transition border ${
                              isActive
                                ? 'bg-orange-600 text-white border-orange-700 shadow-xs ring-1 ring-orange-500'
                                : 'bg-stone-50 text-slate-700 border-slate-300 hover:bg-orange-100 hover:text-orange-900'
                            }`}
                            title={`Set all ${b.name} across tables to ${stg}`}
                          >
                            {labels[sIdx]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY: 70% LEFT (ALL TABLES 3-COL) / 30% RIGHT (TIME & TABLE QUEUE) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT 70%: 3-COLUMN TABLES MATRIX */}
          <div className="w-[70%] border-r-2 border-slate-900 p-3 overflow-y-auto bg-stone-100/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10.5px] font-black text-slate-900 uppercase">
                All Tables Display (3-Column Matrix)
              </span>
              <span className="font-mono text-[10px] text-slate-500 font-bold">
                Tap any table box to open detail view
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {allTablesToRender.map((tbl) => (
                <div
                  key={tbl.id}
                  onClick={() => handleOpenTable(tbl.tableNumber)}
                  className="bg-white border-2 border-slate-900 rounded-xl p-3 shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    {/* Table Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-900 mb-2">
                      <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-900">
                        <span>Table {tbl.tableNumber}</span>
                        {tbl.isVip && <span className="text-amber-500 font-bold">★</span>}
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-600" />
                        <span>{tbl.elapsedMinutes}m (KOT #{tbl.kotNumber})</span>
                      </span>
                    </div>

                    {/* Table Items with 4-Stage Steppers */}
                    <div className="space-y-2">
                      {tbl.items.map((it) => (
                        <div
                          key={it.id}
                          className="bg-stone-50 border border-slate-300 rounded-lg p-2 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-black">
                            <span className="text-slate-900 truncate pr-1">
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-mono text-[8.5px] font-bold bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-800 shrink-0">
                              Stage {it.stage === 'RECEIVED' ? '1: Received' : it.stage === 'PREPARING' ? '2: Preparing' : it.stage === 'READY' ? '3: Ready' : '4: Served'}
                            </span>
                          </div>

                          {/* 4-Stage Stepper Buttons (1.REC, 2.PREP, 3.READY, 4.SERVED) */}
                          <div className="grid grid-cols-4 gap-1 pt-0.5 font-mono text-[8px] font-black">
                            {(['RECEIVED', 'PREPARING', 'READY', 'SERVED'] as const).map((stg, sIdx) => {
                              const labels = ['1.REC', '2.PREP', '3.READY', '4.SERVED'];
                              const isActive = it.stage === stg;
                              return (
                                <button
                                  key={stg}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetStage(tbl.id, it.id, stg);
                                  }}
                                  className={`py-1 rounded text-center transition border ${
                                    isActive
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                      : 'bg-white text-slate-600 border-slate-300 hover:bg-stone-200'
                                  }`}
                                >
                                  {labels[sIdx]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manage Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTable(tbl.tableNumber);
                    }}
                    className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white font-mono text-[10px] font-black rounded uppercase tracking-wider transition text-center shadow-xs cursor-pointer"
                  >
                    Manage Table {tbl.tableNumber} ➔
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 30%: CHRONOLOGICAL TIME QUEUE */}
          <div className="w-[30%] bg-white p-3 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 mb-3">
                <span className="font-mono text-[10.5px] font-black text-slate-900 uppercase">
                  Time Queue
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold">
                  Timed Orders
                </span>
              </div>

              <div className="space-y-2.5">
                {timeQueueTickets.map((tq, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenTable(tq.table)}
                    className="p-2.5 rounded-lg border-2 border-slate-900 bg-stone-50 hover:bg-orange-50/50 cursor-pointer transition shadow-[2px_2px_0px_#0f172a]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-black text-slate-900">
                        Ticket #{tq.ticketNum} • Table {tq.table}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {tq.time}
                      </span>
                    </div>

                    <div className="space-y-0.5 font-mono text-[10px] text-slate-700">
                      {tq.items.map((itLine, i) => (
                        <div key={i} className="truncate">
                          • {itLine}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => callFloorWaiter('EXPEDITE', 'Calling floor runners to pass')}
              className="w-full mt-4 py-2.5 rounded-xl border-2 border-slate-900 bg-stone-100 hover:bg-orange-50 font-mono text-xs font-black uppercase text-slate-900 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#0f172a] transition cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5 text-orange-600" />
              <span>Call Floor Runner to Pass</span>
            </button>
          </div>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};
