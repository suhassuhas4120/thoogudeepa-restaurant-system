'use client';

import React from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import {
  useSharedBridge,
  getWaiterShiftPerformance,
  resolveWaiterProfile,
} from '../../../store/useSharedBridge';
import { SAVED_WAITERS, WaiterProfile } from '../../../types/waiter';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { ArrowLeft, TrendingUp, CheckCircle2, ShieldCheck, Banknote, Smartphone, Utensils } from 'lucide-react';

export const TabletScreen10ShiftStats: React.FC = () => {
  const { setCurrentScreen, activeCaptain, setActiveCaptain, setActiveSection } = useWaiterStore();
  const { tables, settlementRecords } = useSharedBridge();

  const currentProfile = resolveWaiterProfile(activeCaptain);
  const perf = getWaiterShiftPerformance(currentProfile.name, { settlementRecords, tables });

  const activeDiningTables = perf.activeTables.filter(
    (t) => t.status === 'OCCUPIED' || t.status === 'BILLING'
  );
  const activeCount = activeDiningTables.length;

  const handleSelectWaiter = (waiter: WaiterProfile) => {
    setActiveCaptain(waiter.name);
    setActiveSection(waiter.section);
  };

  const kpiCards = [
    {
      label: 'Total Tables Served Today:',
      value: `${perf.tablesServed}`,
      sub: `${perf.completedSettlementsCount} settled • ${activeCount} active in ${perf.section}`,
    },
    {
      label: 'Total Payments Processed:',
      value: `₹ ${perf.totalRevenue.toLocaleString('en-IN')}`,
      sub: 'All payment modes combined',
    },
    {
      label: 'Total Cash Collected:',
      value: `₹ ${perf.cashCollected.toLocaleString('en-IN')}`,
      sub: 'Ready for manager cash handover (100% exact)',
    },
    {
      label: 'Digital / UPI Settlements:',
      value: `₹ ${perf.digitalCollected.toLocaleString('en-IN')}`,
      sub: 'Direct bank reconciliation (100% exact)',
    },
    {
      label: 'Total Tips Accrued:',
      value: `₹ ${perf.tipsEarned.toLocaleString('en-IN')}`,
      sub: 'Direct captain tip pool',
    },
    {
      label: 'Avg Turnaround Time:',
      value: `${perf.avgTurnaroundMinutes} mins`,
      sub: `Efficiency benchmark for ${perf.section}`,
    },
  ];

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
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tables</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Shift Performance &amp; Daily Summary KPIs
          </h3>
          <span className="border border-slate-400 bg-slate-100 px-3 py-1 rounded font-bold text-xs text-slate-700">
            {currentProfile.displayName} • Active Shift
          </span>
        </div>

        {/* WAITER PROFILE SWITCHER CHIPS */}
        <div className="mb-3.5 flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            Switch Waiter:
          </span>
          <div className="flex gap-2 flex-wrap">
            {SAVED_WAITERS.map((w) => {
              const isSelected = resolveWaiterProfile(w.name).id === currentProfile.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectWaiter(w)}
                  className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span>{w.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {w.section}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CAPTAIN INFO BANNER */}
        <div className="mb-4 flex items-center gap-4 border-2 border-slate-800 rounded-xl p-4 bg-white shadow-xs shrink-0">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-lg">
            {currentProfile.name.charAt(currentProfile.name.length - 1)}
          </div>
          <div>
            <div className="font-black text-sm text-slate-950 flex items-center gap-2">
              <span>{currentProfile.displayName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified On Duty
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              Assigned Floor: {currentProfile.section} • Shift: Afternoon Peak (11:00 AM – 04:00 PM)
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs font-bold text-emerald-700 border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2">
            <TrendingUp className="h-4 w-4" />
            <span>Shift Active — 4h 15m elapsed</span>
          </div>
        </div>

        {/* 6 KPI METRICS CARDS (3-COLUMN GRID) */}
        <div className="grid grid-cols-3 gap-3.5 mb-3.5 shrink-0">
          {kpiCards.map((card, idx) => (
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

        {/* MATHEMATICAL RECONCILIATION STRIP */}
        <div className="mb-4 border-2 border-slate-800 bg-stone-50 rounded-xl p-3 shadow-xs shrink-0 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-slate-950">Shift Audit Reconciliation:</span>
            <span>
              Total ₹{perf.totalRevenue.toLocaleString('en-IN')} = ₹{perf.cashCollected.toLocaleString('en-IN')} (Cash) + ₹{perf.digitalCollected.toLocaleString('en-IN')} (UPI/Digital)
            </span>
          </div>
          <span className="text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-black text-[11px]">
            Tips Accrued: ₹{perf.tipsEarned.toLocaleString('en-IN')}
          </span>
        </div>

        {/* SHIFT ACTIVITY TIMELINE (PER-WAITER TRANSACTIONS & ACTIVE DINING) */}
        <div className="border-2 border-slate-800 bg-white rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <strong className="text-xs font-black text-slate-950 block">
              {currentProfile.name}'s Shift Activity Timeline:
            </strong>
            <span className="text-[10.5px] font-bold text-slate-500">
              {perf.recentSettlements.length} Completed Settlements • {activeCount} Active in {perf.section}
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {/* Completed Settlements */}
            {perf.recentSettlements.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-950">
                    {s.timestamp} • Table {s.tableNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">({s.section})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    ₹ {s.amount.toLocaleString('en-IN')} • {s.method}
                  </span>
                  {s.tip > 0 && (
                    <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      +₹{s.tip} tip
                    </span>
                  )}
                  <span className="border border-emerald-300 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-black text-emerald-800">
                    Settled ✓
                  </span>
                </div>
              </div>
            ))}

            {/* Currently Active Dining Tables in Waiter's Section */}
            {activeDiningTables.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Utensils className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                  <span className="font-bold text-slate-950">
                    {t.seatedTime !== '--' ? t.seatedTime : 'Active'} • Table {t.number}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({t.guestCount} guests • {t.kotCount} KOT)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">
                    ₹ {t.currentBill.toFixed(2)} • In Service
                  </span>
                  <span className="border border-orange-300 bg-orange-50 px-2 py-0.5 rounded text-[10px] font-black text-orange-800">
                    {t.status === 'BILLING' ? 'Billing' : 'Dining'}
                  </span>
                </div>
              </div>
            ))}

            {perf.recentSettlements.length === 0 && activeCount === 0 && (
              <div className="text-slate-400 text-xs italic py-2">
                No active billing history recorded yet for this shift.
              </div>
            )}
          </div>
        </div>

        {/* Shift Close Button */}
        <button
          onClick={() => setCurrentScreen(1)}
          className="mt-4 w-full py-4 border-2 border-slate-800 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          🔐 End Shift &amp; Clock Out
        </button>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
