'use client';

import React from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge, getTableBillBreakdown } from '../../store/useSharedBridge';
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
  const breakdown = getTableBillBreakdown(table);

  return (
    <WaiterTabletHousing screenNumber={3} screenTitle="TABLE OPERATIONS & ORDER SUMMARY">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-3 font-mono">
        <div className="space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-slate-900 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Floor</span>
            </button>
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
              table.status === 'OCCUPIED'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : table.status === 'BILLING'
                ? 'bg-purple-50 text-purple-900 border-purple-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}>
              ● STATUS: {table.status}
            </span>
          </div>

          {/* Table Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-950">
                  Table {table.number}
                </span>
                {table.mergedWith && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                    + {table.mergedWith} Merged
                  </span>
                )}
              </div>
              <span className="text-base font-black text-orange-600">
                ₹{breakdown.grandTotal > 0 ? breakdown.grandTotal.toFixed(2) : Number(table.currentBill || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 font-bold">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>{table.guestCount || 3} Guests</span>
                <span>•</span>
                <span>Captain: {table.serverName || 'Staff Captain'}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[10.5px]">
                <Clock className="h-3 w-3" />
                <span>{table.seatedTime || 'Active Shift'}</span>
              </div>
            </div>
          </div>

          {/* Running KOTs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-orange-600" />
                <span>Active KOT Items</span>
              </span>
              <span className="text-[10.5px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                KOT #{table.kotCount || 1}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold">
              {breakdown.items.length > 0 ? (
                breakdown.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-slate-800 py-1.5 border-b border-slate-100 last:border-b-0 gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10.5px] font-black text-orange-600 shrink-0">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                        ₹{item.lineTotal.toFixed(2)}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 border ${
                        item.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : item.status === 'Served'
                          ? 'bg-blue-50 text-blue-900 border-blue-300'
                          : item.status === 'Preparing'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-stone-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      {item.status === 'Ready'
                        ? 'Ready to Serve'
                        : item.status === 'Served'
                        ? 'Served'
                        : item.status === 'Preparing'
                        ? 'Preparing'
                        : 'Placed'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-[11px] italic">
                  No active orders placed yet. Tap Punch New Order below.
                </div>
              )}

              {breakdown.foodSubtotal > 0 && (
                <div className="pt-2.5 border-t border-dashed border-slate-200 flex justify-between items-center text-[11px] text-slate-600">
                  <div>
                    <span>Food: ₹{breakdown.foodSubtotal.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">(+5% GST: ₹{breakdown.totalTax.toFixed(2)})</span>
                  </div>
                  <span className="font-black text-slate-950 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Total: ₹{breakdown.grandTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(4)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-50 text-orange-950 border border-orange-300 text-xs font-black shadow-2xs hover:bg-orange-600 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Punch Order</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(6)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-950 border border-purple-300 text-xs font-black shadow-2xs hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Merge / Shift</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(7)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-black shadow-2xs hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>Collect Payment</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(8)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-950 border border-blue-300 text-xs font-black shadow-2xs hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
            >
              <Receipt className="h-4 w-4" />
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
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all shadow-2xs ${
                  isPaymentDone
                    ? 'bg-rose-50 text-rose-950 border border-rose-300 hover:bg-rose-700 hover:text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span>{isPaymentDone ? 'Vacate & Clear Table' : 'Table Occupied • Payment Pending'}</span>
              </motion.button>
            );
          })()}
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
