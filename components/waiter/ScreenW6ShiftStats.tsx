'use client';

import React from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  Users,
  Utensils,
  Clock,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW6ShiftStats: React.FC = () => {
  const { setCurrentScreen, activeCaptain } = useWaiterStore();
  const { shiftStats, kdsTickets } = useSharedBridge();
  const totalOrders = kdsTickets.length;

  return (
    <WaiterTabletHousing screenNumber={6} screenTitle="SHIFT STATS">
      <div className="flex-1 flex flex-col justify-between p-4 space-y-3 overflow-y-auto font-mono bg-stone-50/70">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-slate-900 transition cursor-pointer py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Tables</span>
            </button>
            <span className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
              {activeCaptain ? activeCaptain.toUpperCase() : 'CAPTAIN'}
            </span>
          </div>

          {/* Scorecard Hero */}
          <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 shadow-xs text-center space-y-1">
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
              Today&apos;s Collection
            </div>
            <div className="font-mono text-3xl font-black text-slate-900">
              ₹ {shiftStats.totalRevenue.toLocaleString()}
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center shadow-2xs">
              <Users className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <div className="font-mono text-base font-black text-slate-900">
                {shiftStats.tablesServed}
              </div>
              <div className="text-[9px] font-mono text-slate-500 font-bold uppercase">Tables</div>
            </div>

            <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center shadow-2xs">
              <Utensils className="h-4 w-4 text-orange-600 mx-auto mb-1" />
              <div className="font-mono text-base font-black text-slate-900">
                {totalOrders}
              </div>
              <div className="text-[9px] font-mono text-slate-500 font-bold uppercase">Orders</div>
            </div>

            <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center shadow-2xs">
              <Clock className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <div className="font-mono text-base font-black text-slate-900">
                {shiftStats.avgTurnaroundMinutes}m
              </div>
              <div className="text-[9px] font-mono text-slate-500 font-bold uppercase">Turnaround</div>
            </div>
          </div>

          {/* Restaurant Banner */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-2xs text-xs">
            <div className="font-black text-slate-900">Thoogudeepa Donne Biryani Mane</div>
          </div>
        </div>

        {/* End Shift Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(1)}
          className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          <span>End Shift</span>
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
