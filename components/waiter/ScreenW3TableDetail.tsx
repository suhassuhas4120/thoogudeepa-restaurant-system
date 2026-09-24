'use client';

import React from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  ArrowLeft,
  Plus,
  Receipt,
  Users,
  CreditCard,
  Trash2,
  Flame,
  CheckCircle2,
  Clock,
  Utensils,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW3TableDetail: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    callKitchenStation,
  } = useWaiterStore();

  const { tables, waiterVacatesTable } = useSharedBridge();

  const table =
    tables.find((t) => t.number === selectedTableNumber) || tables[3]; // Table A-04 default

  return (
    <WaiterTabletHousing screenNumber={3} screenTitle="TABLE DETAIL &amp; ACTION HUB">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-3">
        <div className="space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>[BACK TO TABLES]</span>
            </button>
            <span className="font-mono text-xs font-black text-orange-600">
              STATUS: {table.status}
            </span>
          </div>

          {/* Table Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <div className="font-mono text-base font-black text-slate-900">
                TABLE [{table.number}]
              </div>
              <div className="text-[10.5px] font-mono text-slate-500 mt-0.5">
                Guests: {table.guestCount || 3} • Captain: {table.serverName}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-black text-orange-600">
                BILL: ₹ {table.currentBill}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Seated: {table.seatedTime}
              </div>
            </div>
          </div>

          {/* Running KOTs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                [RUNNING KOT ITEMS - TABLE {table.number}]
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-500">
                KOT #{table.kotCount || 1}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-800">
                <span>Special Chicken Donne Biryani × 2</span>
                <span className="font-mono font-bold text-orange-600">[PREPARING]</span>
              </div>
              <div className="flex justify-between items-center text-slate-800">
                <span>Kshatriya Chicken Kebab × 1</span>
                <span className="font-mono font-bold text-emerald-600">[PLATED]</span>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(4)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-orange-600 text-white font-mono text-xs font-black shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>[TAKE NEW ORDER]</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(6)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs font-black shadow-2xs hover:bg-stone-50 transition"
            >
              <Users className="h-4 w-4 text-purple-600" />
              <span>[MERGE / SPLIT]</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(7)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs font-black shadow-2xs hover:bg-stone-50 transition"
            >
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>[COLLECT PAYMENT]</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(8)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs font-black shadow-2xs hover:bg-stone-50 transition"
            >
              <Receipt className="h-4 w-4 text-blue-600" />
              <span>[PRINT / WHATSAPP]</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {(() => {
            const isPaymentDone = table.status === 'BILLING';
            return (
              <motion.button
                whileTap={{ scale: isPaymentDone ? 0.98 : 1 }}
                disabled={!isPaymentDone}
                onClick={() => isPaymentDone && waiterVacatesTable(table.number)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-black transition shadow-xs ${
                  isPaymentDone
                    ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isPaymentDone ? '[CHECKOUT & VACATE TABLE]' : '[VACATE DISABLED: PAYMENT PENDING]'}</span>
              </motion.button>
            );
          })()}
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
