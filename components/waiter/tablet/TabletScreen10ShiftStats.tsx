'use client';

import React from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const KPI_CARDS = [
  { label: 'Total Orders Done Today:', value: '24', sub: 'Across 10 unique tables' },
  { label: 'Total Payments Processed:', value: '₹ 18,450', sub: 'All payment modes combined' },
  { label: 'Total Cash Collected:', value: '₹ 7,200', sub: 'Ready for handover' },
  { label: 'Digital / UPI Settlements:', value: '₹ 11,250', sub: 'Instant reconciliation' },
  { label: 'Total Tips Accrued:', value: '₹ 1,420', sub: 'Direct waiter tip accrual' },
  { label: 'Avg Turnaround Time:', value: '38 mins', sub: 'Efficiency benchmark' },
];

const TIMELINE = [
  { time: '12:52 PM', table: 'Table 04', amount: '₹ 1,450.00', mode: 'CASH' },
  { time: '12:20 PM', table: 'Table 02', amount: '₹ 2,100.00', mode: 'UPI QR' },
  { time: '11:45 AM', table: 'Table 07', amount: '₹ 980.00', mode: 'CARD POS' },
  { time: '11:20 AM', table: 'Table 09', amount: '₹ 1,875.00', mode: 'UPI QR' },
  { time: '10:55 AM', table: 'Table 01', amount: '₹ 560.00', mode: 'CASH' },
];

export const TabletScreen10ShiftStats: React.FC = () => {
  const { setCurrentScreen, activeCaptain, activeSection } = useWaiterStore();
  const shiftStats = useSharedBridge((s) => s.shiftStats);

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={10}
      screenTitle="SHIFT PERFORMANCE & SUMMARY KPIS"
    >
      <div className="flex flex-col flex-1 min-h-[700px] p-5 font-mono select-none overflow-y-auto">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setCurrentScreen(2)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tables</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Shift Performance & Daily Summary KPIs
          </h3>
          <span className="border border-slate-400 bg-slate-100 px-3 py-1 rounded font-bold text-xs text-slate-700">
            {activeCaptain} • Active Shift
          </span>
        </div>

        {/* CAPTAIN INFO BANNER */}
        <div className="mb-4 flex items-center gap-4 border-2 border-slate-800 rounded-xl p-4 bg-white shadow-xs shrink-0">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-lg">
            {activeCaptain.charAt(0)}
          </div>
          <div>
            <div className="font-black text-sm text-slate-950">{activeCaptain}</div>
            <div className="text-[11px] font-bold text-slate-500">{activeSection} • Morning Shift A (08:00 AM – 04:00 PM)</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs font-bold text-emerald-700 border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2">
            <TrendingUp className="h-4 w-4" />
            <span>Shift Active — 5h 32m elapsed</span>
          </div>
        </div>

        {/* 6 KPI METRICS CARDS (3-COLUMN GRID) */}
        <div className="grid grid-cols-3 gap-3.5 mb-4 shrink-0">
          {KPI_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-slate-800 rounded-xl p-4 flex flex-col gap-2 shadow-xs"
            >
              <span className="text-[10.5px] font-bold text-slate-500 uppercase leading-tight">
                {card.label}
              </span>
              <div className="text-2xl font-black text-slate-950 font-mono leading-none">
                {card.value}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* SHIFT ACTIVITY TIMELINE */}
        <div className="border-2 border-slate-800 bg-white rounded-xl p-4 shadow-xs">
          <strong className="text-xs font-black text-slate-950 block mb-3">
            Today's Shift Activity Timeline:
          </strong>
          <div className="flex flex-col gap-2 font-mono text-xs">
            {TIMELINE.map((row, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 text-slate-700"
              >
                <span className="font-bold text-slate-950">
                  {row.time} • {row.table}
                </span>
                <span className="font-bold">{row.amount} • {row.mode}</span>
                <span className="border border-slate-300 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-700">
                  Settled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Close Button */}
        <button
          onClick={() => setCurrentScreen(1)}
          className="mt-4 w-full py-4 border-2 border-slate-800 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shrink-0"
        >
          🔐 End Shift & Clock Out
        </button>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
