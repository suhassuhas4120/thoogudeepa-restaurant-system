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
    <WaiterTabletHousing screenNumber={3} screenTitle="TABLE OPERATIONS & ORDER SUMMARY">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-3">
        <div className="space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Floor</span>
            </button>
            <span className="font-mono text-xs font-black text-orange-600">
              STATUS: {table.status}
            </span>
          </div>

          {/* Table Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <div className="font-mono text-base font-black text-slate-900">
                Table {table.number}
              </div>
              <div className="text-[10.5px] font-mono text-slate-500 mt-0.5">
                Guests: {table.guestCount || 3} • Captain: {table.serverName}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-black text-orange-600">
                Bill: ₹ {table.currentBill}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Seated: {table.seatedTime}
              </div>
            </div>
          </div>

          {/* Running KOTs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                Active KOT Items (Table {table.number})
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-500">
                KOT #{table.kotCount || 1}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-800">
                <span>Special Chicken Donne Biryani × 2</span>
                <span className="font-mono font-bold text-orange-600">Preparing</span>
              </div>
              <div className="flex justify-between items-center text-slate-800">
                <span>Kshatriya Chicken Kebab × 1</span>
                <span className="font-mono font-bold text-emerald-600">Ready to Serve</span>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(4)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-orange-600 text-white font-mono text-xs font-black shadow-md shadow-orange-600/20 hover:bg-orange-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Punch New Order</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(6)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs font-black shadow-2xs hover:bg-stone-50 transition cursor-pointer"
            >
              <Users className="h-4 w-4 text-purple-600" />
              <span>Merge / Shift Table</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(7)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs font-black shadow-2xs hover:bg-stone-50 transition cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Collect Payment</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(8)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs font-black shadow-2xs hover:bg-stone-50 transition cursor-pointer"
            >
              <Receipt className="h-4 w-4 text-blue-600" />
              <span>Print / WhatsApp</span>
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
                onClick={() => {
                  if (isPaymentDone) {
                    waiterVacatesTable(table.number);
                    setCurrentScreen(2);
                  }
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-black transition shadow-xs ${
                  isPaymentDone
                    ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isPaymentDone ? 'Checkout & Vacate Table' : 'Vacate Disabled (Payment Pending)'}</span>
              </motion.button>
            );
          })()}
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
