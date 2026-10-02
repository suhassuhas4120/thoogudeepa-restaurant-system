'use client';

import React, { useState } from 'react';
import { useWaiterStore, formatCaptainName } from '../../store/useWaiterStore';
import {
  useSharedBridge,
  getTableBillBreakdown,
  matchTable,
  normalizeTableNumber,
} from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  ArrowLeft,
  Plus,
  CreditCard,
  CheckCircle2,
  Clock,
  Utensils,
  Link2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenW3TableDetail: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    activeCaptain,
  } = useWaiterStore();

  const {
    tables,
    waiterMergeTables,
    waiterUnmergeTable,
    waiterMarkTableFoodServed,
    kdsTickets,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeNotice, setMergeNotice] = useState<string | null>(null);

  const normSelected = normalizeTableNumber(selectedTableNumber);
  const table =
    tables.find((t) => matchTable(t.number, normSelected)) ||
    tables[0];

  const breakdown = getTableBillBreakdown(table);
  const isMerged = Boolean(table.mergedWith);

  // Available candidate tables to merge with (excluding current table)
  const candidateTables = tables.filter((t) => t.number !== table.number);
  const [targetMergeTable, setTargetMergeTable] = useState(
    candidateTables[0]?.number || 'A-02'
  );

  // Check if any items are ready to serve
  const hasReadyFood =
    kdsTickets.some(
      (tk) =>
        (tk.tableNumber === table.number ||
          tk.tableNumber?.replace(/\D/g, '') === table.number?.replace(/\D/g, '')) &&
        tk.status === 'READY'
    ) ||
    table.activeItems?.some(
      (it) => String(it.status || '').toUpperCase() === 'READY'
    );

  const handleServeReadyFood = () => {
    waiterMarkTableFoodServed(table.number);
    const cleanNum = table.number.replace(/\D/g, '');
    kdsTickets
      .filter((tk) => {
        const tkNum = (tk.tableNumber || '').replace(/\D/g, '');
        return tk.tableNumber === table.number || (cleanNum && tkNum === cleanNum);
      })
      .forEach((tk) => {
        waiterMarkKitchenItemServed(tk.id);
      });
  };

  const handleConfirmMerge = () => {
    if (!targetMergeTable) return;
    waiterMergeTables(table.number, targetMergeTable);
    setShowMergeModal(false);
    setMergeNotice(`Table ${table.number} merged with Table ${targetMergeTable}`);
    setTimeout(() => setMergeNotice(null), 2500);
  };

  const handleConfirmUnmerge = () => {
    waiterUnmergeTable(table.number);
    setShowMergeModal(false);
    setMergeNotice(`Table ${table.number} unmerged`);
    setTimeout(() => setMergeNotice(null), 2500);
  };

  return (
    <WaiterTabletHousing
      screenNumber={3}
      screenTitle="TABLE DETAILS"
    >
      <div className="flex-1 flex flex-col justify-between p-3.5 overflow-y-auto space-y-3 font-mono relative bg-stone-50/70">
        <div className="space-y-3">

          {/* Top Header Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-slate-900 transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Tables</span>
            </button>

            <div className="flex items-center gap-1.5">
              {isMerged && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-purple-700" />
                  <span>Merged</span>
                </span>
              )}
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider shadow-2xs ${
                  table.status === 'OCCUPIED'
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : table.status === 'BILLING'
                    ? 'bg-purple-100 text-purple-950 border-purple-300'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}
              >
                {table.status}
              </span>
            </div>
          </div>

          {/* Merge Notice Banner */}
          {mergeNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{mergeNotice}</span>
            </div>
          )}

          {/* Table Summary Card */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg font-black text-slate-950 tracking-tight shrink-0">
                  TABLE {isMerged ? `${table.number}+${table.mergedWith}` : table.number}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase shrink-0">
                  {table.section || 'Sec A'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-[10.5px] font-bold">
                <Clock className="h-3 w-3" />
                <span>{table.seatedTime || 'Just Seated'}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-800 font-black">
              {formatCaptainName(activeCaptain || table.serverName)}
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-orange-600" />
                <span>Active Orders</span>
              </span>

              <span className="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                KOT #{table.kotCount || 1} • {breakdown.items.length} Items
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {breakdown.items.length > 0 ? (
                breakdown.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-slate-800 py-1.5 border-b border-slate-100 last:border-b-0 gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900 truncate text-xs">
                        {item.name}
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                        ₹{item.unitPrice.toFixed(2)} ea
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Highlighted Multiply on the right side */}
                      <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs">
                        <span className="text-orange-400 mr-0.5 font-bold">×</span>
                        <span>{item.quantity}</span>
                      </span>

                      <span className="font-mono font-black text-xs text-slate-950 min-w-[50px] text-right">
                        ₹{item.lineTotal.toFixed(2)}
                      </span>

                      <span
                        className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                          item.status === 'Ready'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse'
                            : item.status === 'Served'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : item.status === 'Preparing' || item.status === 'Cooking'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {item.status === 'Ready'
                          ? 'Ready'
                          : item.status === 'Served'
                          ? 'Served'
                          : item.status === 'Preparing' || item.status === 'Cooking'
                          ? 'Preparing'
                          : 'Received'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
                  <Utensils className="h-5 w-5 text-slate-300" />
                  <span className="font-semibold text-slate-500">No active orders</span>
                </div>
              )}

              {breakdown.foodSubtotal > 0 && (
                <div className="pt-2.5 border-t border-dashed border-slate-200 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Subtotal ({breakdown.itemCount} items):</span>
                    <span className="font-bold text-slate-800">₹{breakdown.foodSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST (2.5%):</span>
                    <span>₹{breakdown.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>SGST (2.5%):</span>
                    <span>₹{breakdown.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-950 font-black text-lg pt-1.5 border-t border-slate-900">
                    <span className="text-lg">Total:</span>
                    <span className="text-lg text-emerald-700 font-mono">
                      ₹{breakdown.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Merge / Unmerge Button: Clean single name, displays Unmerge when merged */}
          <div className="pt-0.5">
            {isMerged ? (
              <button
                type="button"
                onClick={handleConfirmUnmerge}
                className="w-full py-2 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-mono text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Link2 className="h-3.5 w-3.5 text-rose-700" />
                <span>Unmerge Table</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowMergeModal(true)}
                className="w-full py-2 px-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-mono text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Link2 className="h-3.5 w-3.5 text-purple-700" />
                <span>Merge Table</span>
              </button>
            )}
          </div>

        </div>

        {/* Primary Action Footer */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          {/* Serve Food Button if ready food exists */}
          {hasReadyFood && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleServeReadyFood}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 animate-pulse"
            >
              <Utensils className="h-4 w-4" />
              <span>Serve Food</span>
            </motion.button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {/* Take Order CTA -> Screen 4 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(4)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-600/30 hover:bg-orange-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Take Order</span>
            </motion.button>

            {/* Settle Bill CTA -> Screen 5 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(5)}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md transition cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>Settle Bill</span>
            </motion.button>
          </div>
        </div>

        {/* Merge Table Modal */}
        <AnimatePresence>
          {showMergeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end justify-center p-3"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="w-full bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xl space-y-3 font-mono"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                    <Link2 className="h-4 w-4" />
                    <span>Merge Table</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMergeModal(false)}
                    className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 py-1">
                  <div className="text-xs text-slate-600 font-semibold">
                    Merge Table {table.number} with:
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                    {candidateTables.map((ct) => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setTargetMergeTable(ct.number)}
                        className={`py-2 px-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                          targetMergeTable === ct.number
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Table {ct.number}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMergeModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMerge}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition cursor-pointer shadow-xs active:scale-95"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </WaiterTabletHousing>
  );
};