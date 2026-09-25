'use client';

import React from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import {
  useSharedBridge,
  getWaiterShiftPerformance,
  resolveWaiterProfile,
} from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  Users,
  Award,
  Clock,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Banknote,
  Smartphone,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW10ShiftStats: React.FC = () => {
  const { setCurrentScreen, activeCaptain } = useWaiterStore();
  const { tables, settlementRecords } = useSharedBridge();

  // Strictly compute for the logged-in waiter
  const currentProfile = resolveWaiterProfile(activeCaptain);
  const perf = getWaiterShiftPerformance(currentProfile.name, { settlementRecords, tables });

  const activeDiningCount = perf.activeTables.filter(
    (t) => t.status === 'OCCUPIED' || t.status === 'BILLING'
  ).length;

  return (
    <WaiterTabletHousing screenNumber={10} screenTitle="SHIFT PERFORMANCE & SUMMARY KPIS">
      <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3 overflow-y-auto">
        <div className="space-y-3">
          {/* Top Back & Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Floor</span>
            </button>
            <span className="font-mono text-[11px] font-black text-slate-800 bg-stone-100 px-2.5 py-0.5 rounded border border-slate-200">
              {currentProfile.displayName}
            </span>
          </div>

          {/* Logged-In Captain Verified Shift Header */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                {currentProfile.name.charAt(currentProfile.name.length - 1)}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>{currentProfile.displayName}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Logged In
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Floor: {currentProfile.section} • Afternoon Peak
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                Active Shift
              </span>
            </div>
          </div>

          {/* Dynamic Scorecard Hero */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-3.5 shadow-xs text-center">
            <div className="font-mono text-[10px] font-bold text-orange-600 uppercase tracking-wide">
              {currentProfile.displayName} • Shift Scorecard
            </div>
            <div className="font-mono text-3xl font-black text-slate-900 mt-1">
              ₹ {perf.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 font-mono mt-1 flex items-center justify-center gap-2">
              <span className="text-emerald-700 font-bold">Cash: ₹{perf.cashCollected.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span className="text-blue-700 font-bold">Digital: ₹{perf.digitalCollected.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 4 Key Metric Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Tables Done</span>
              </div>
              <div className="font-mono text-lg font-black text-slate-900">
                {perf.tablesServed}
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                {perf.completedSettlementsCount} settled • {activeDiningCount} dining
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Tips Earned</span>
              </div>
              <div className="font-mono text-lg font-black text-amber-700">
                ₹ {perf.tipsEarned.toLocaleString('en-IN')}
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                Direct waiter tip pool
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Cash Handover</span>
              </div>
              <div className="font-mono text-lg font-black text-emerald-700">
                ₹ {perf.cashCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                Cash in drawer for manager
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">UPI &amp; Digital</span>
              </div>
              <div className="font-mono text-lg font-black text-blue-700">
                ₹ {perf.digitalCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                Direct bank settlements
              </div>
            </div>
          </div>

          {/* Efficiency Benchmark & Turnaround */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-slate-700">Average Turnaround Benchmark</div>
                <div className="text-[9px] text-slate-400">Target for {perf.section}: &lt; 40 mins</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-900">{perf.avgTurnaroundMinutes}m</div>
              <div className="text-[9px] font-bold text-emerald-600">On Track ✓</div>
            </div>
          </div>

          {/* Waiter's Recent Settlements & Active Tables */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-mono text-[10px] font-bold">
              <span className="text-slate-800 uppercase">
                {currentProfile.name}'s Shift History ({perf.recentSettlements.length + activeDiningCount})
              </span>
              <span className="text-slate-400">{perf.section}</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5 font-mono text-[10.5px]">
              {/* Settled records */}
              {perf.recentSettlements.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50 border border-slate-200/70"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="font-black text-slate-900">Table {s.tableNumber}</span>
                    <span className="text-[9.5px] text-slate-400">({s.timestamp})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900">₹{s.amount}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        s.method === 'CASH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.method === 'UPI'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {s.method}
                    </span>
                    {s.tip > 0 && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">
                        +₹{s.tip} tip
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Active dining tables in waiter's section */}
              {perf.activeTables
                .filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING')
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-orange-50/50 border border-orange-200/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                      <span className="font-black text-slate-900">Table {t.number}</span>
                      <span className="text-[9.5px] text-slate-500">({t.seatedTime})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900">₹{t.currentBill}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                        {t.status === 'BILLING' ? 'Billing' : 'Dining'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Restaurant Terminal Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs text-xs space-y-1">
            <div className="font-mono text-[9.5px] font-bold text-slate-400 uppercase">
              Floor Terminal Info
            </div>
            <div className="font-bold text-slate-800">Thoogudeepa donne biryani mane</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Terminal POS Floor #03 • Shift: Afternoon Peak (11:00 AM - 4:00 PM)
            </div>
          </div>
        </div>

        {/* Clock out button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(1)}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <LogOut className="h-4 w-4" />
          <span>End Shift &amp; Clock Out</span>
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
