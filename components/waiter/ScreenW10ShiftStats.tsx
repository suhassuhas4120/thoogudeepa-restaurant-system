'use client';

import React from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  Users,
  Award,
  Clock,
  TrendingUp,
  LogOut,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW10ShiftStats: React.FC = () => {
  const { setCurrentScreen, activeCaptain } = useWaiterStore();
  const shiftStats = useSharedBridge((s) => s.shiftStats);

  return (
    <WaiterTabletHousing screenNumber={10} screenTitle="SHIFT OVERVIEW &amp; PERFORMANCE">
      <div className="flex-1 flex flex-col justify-between p-4 space-y-3 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1 text-xs font-black text-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>[BACK TO FLOOR]</span>
            </button>
            <span className="font-mono text-xs font-black text-slate-900">
              {activeCaptain.toUpperCase()}
            </span>
          </div>

          {/* Scorecard Hero */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 shadow-xs text-center">
            <div className="font-mono text-[10px] font-bold text-orange-600 uppercase">
              [CAPTAIN SHIFT PERFORMANCE SCORECARD]
            </div>
            <div className="font-mono text-2xl font-black text-slate-900 mt-1">
              ₹ {shiftStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-slate-500 font-mono mt-0.5">
              Total F&amp;B Collection Settled Today
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs">
              <Users className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <div className="font-mono text-sm font-black text-slate-900">
                {shiftStats.tablesServed}
              </div>
              <div className="text-[9.5px] font-mono text-slate-400">Tables Done</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs">
              <Award className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <div className="font-mono text-sm font-black text-slate-900">
                ₹ {shiftStats.tipsEarned}
              </div>
              <div className="text-[9.5px] font-mono text-slate-400">Tips Earned</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs">
              <Clock className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <div className="font-mono text-sm font-black text-slate-900">
                {shiftStats.avgTurnaroundMinutes}m
              </div>
              <div className="text-[9.5px] font-mono text-slate-400">Avg Turnover</div>
            </div>
          </div>

          {/* Restaurant Metadata */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs text-xs space-y-1">
            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase">
              [ESTABLISHMENT LOG]
            </div>
            <div className="font-bold text-slate-800">Thoogudeepa donne biryani mane</div>
            <div className="text-[10.5px] text-slate-500 font-mono">
              Terminal POS Floor #03 • Shift: Afternoon Peak (11:00 AM - 4:00 PM)
            </div>
          </div>
        </div>

        {/* Clock out button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(1)}
          className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>[END SHIFT &amp; CLOCK OUT]</span>
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
