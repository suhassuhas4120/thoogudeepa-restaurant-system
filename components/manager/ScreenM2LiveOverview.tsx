'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import { IndianRupee, Utensils, AlertTriangle, TrendingUp, Clock, CheckCircle2, ArrowRight, Bell } from 'lucide-react';

export function ScreenM2LiveOverview() {
  const { tables, kdsTickets, pings, shiftStats, waiterResolvePing } = useSharedBridge();
  const { setCurrentScreen, setSelectedTableNumber } = useManagerStore();

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING');
  const activeKdsCount = kdsTickets.filter((tk) => tk.status !== 'COMPLETED').length;
  const currentLiveBillSum = tables.reduce((acc, t) => acc + t.currentBill, 0);

  const handleTableClick = (tableNum: string) => {
    setSelectedTableNumber(tableNum);
    setCurrentScreen(3); // Floor plan
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>TODAY SALES (LIVE)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            ₹ {(shiftStats.totalRevenue + currentLiveBillSum).toLocaleString('en-IN')}.00
          </div>
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>ACTIVE KITCHEN KOTS</span>
            <Utensils className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            {activeKdsCount} Orders
          </div>
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>TABLE OCCUPANCY</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            {occupiedTables.length} / {tables.length}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            {tables.length - occupiedTables.length} tables vacant
          </p>
        </div>
      </div>

      {/* Main Tables Status Matrix */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a]">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-black font-mono text-slate-900">
              RESTAURANT TABLES LIVE STATUS MATRIX
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Click any table card to inspect running orders, print KOT, or open billing POS
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 font-mono text-[11px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> OCCUPIED</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> BILLING</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-900"></span> VACANT</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mt-4">
          {tables.map((tbl) => {
            const isOcc = tbl.status === 'OCCUPIED';
            const isBill = tbl.status === 'BILLING';
            return (
              <button
                key={tbl.id}
                onClick={() => handleTableClick(tbl.number)}
                className={`flex flex-col p-3 rounded-lg border-2 text-left font-mono transition ${
                  isOcc
                    ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_#475569]'
                    : isBill
                    ? 'bg-amber-50 text-amber-950 border-amber-500 shadow-[2px_2px_0px_#d97706]'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{tbl.number}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                    isOcc ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tbl.capacity}P
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold">
                  {isOcc || isBill ? `₹ ${tbl.currentBill}` : 'VACANT'}
                </div>
                <div className={`text-[10px] mt-0.5 truncate ${isOcc ? 'text-slate-300' : 'text-slate-400'}`}>
                  {isOcc ? `${tbl.guestCount} Pax • ${tbl.kotCount} KOT` : tbl.section}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Kitchen Bottlenecks & Fast Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kitchen Alerts */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono font-black text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>LIVE KITCHEN SPEED & BOTTLENECKS</span>
            </h4>
          </div>
          {activeKdsCount > 0 ? (
            <div className="space-y-2 mt-2">
              {kdsTickets.slice(0, 3).map((tk) => (
                <div key={tk.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Table {tk.tableNumber}</span>
                    <span className="text-slate-500 ml-2">({tk.items.length} items)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tk.status === 'READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {tk.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-mono text-slate-500 bg-stone-50 rounded-lg">
              No pending kitchen orders • Dum Pot cooking smoothly
            </div>
          )}
        </div>

        {/* Customer Notifications */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono font-black text-slate-900 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-orange-600" />
              CUSTOMER NOTIFICATIONS
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              {pings.length} ACTIVE
            </span>
          </div>
          {pings.length > 0 ? (
            <div className="space-y-2">
              {pings.slice(0, 3).map((ping) => (
                <div key={ping.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-stone-50 border border-slate-200 text-xs font-mono">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      Table {ping.tableNumber}: {ping.type}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {ping.guestName} • {ping.timestamp}{ping.message ? ` • ${ping.message}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => waiterResolvePing(ping.id)}
                    className="shrink-0 bg-slate-900 text-white px-2.5 py-1.5 rounded text-[10px] font-bold hover:bg-orange-600 transition"
                  >
                    RESOLVE
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-center text-xs font-mono text-slate-500 bg-stone-50 rounded-lg">
              No customer notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
