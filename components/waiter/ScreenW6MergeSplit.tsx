'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { ArrowLeft, Users, Scissors, Link2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW6MergeSplit: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber } = useWaiterStore();
  const { tables } = useSharedBridge();
  const [sourceTable, setSourceTable] = useState('A-05');
  const [splitCount, setSplitCount] = useState(2);
  const [mergedNotice, setMergedNotice] = useState(false);

  const handleMerge = () => {
    // mergeTables is not available on bridge yet — log intent locally
    console.log(`[MERGE] Requesting merge of table ${sourceTable} into ${selectedTableNumber}`);
    setMergedNotice(true);
    setTimeout(() => setMergedNotice(false), 2000);
  };

  return (
    <WaiterTabletHousing screenNumber={6} screenTitle="TABLE TRANSFER & MERGE MANAGEMENT">
      <div className="flex-1 flex flex-col justify-between p-4 space-y-3 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(3)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Table</span>
            </button>
            <span className="font-mono text-xs font-black text-slate-900">
              Target: Table {selectedTableNumber}
            </span>
          </div>

          {/* Merge Tables Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-mono text-[10.5px] font-black text-purple-700">
              <Link2 className="h-4 w-4" />
              <span>Merge Tables for Large Party</span>
            </div>
            <p className="text-xs text-slate-500">
              Combine running orders and bill of an adjacent table into Table {selectedTableNumber}.
            </p>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700">Merge with:</span>
              <select
                value={sourceTable}
                onChange={(e) => setSourceTable(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-stone-50 font-mono text-xs font-black focus:outline-none"
              >
                {tables
                  .filter((t) => t.number !== selectedTableNumber)
                  .map((t) => (
                    <option key={t.id} value={t.number}>
                      Table {t.number} ({t.status})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleMerge}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-black transition cursor-pointer"
            >
              {mergedNotice ? '✓ Tables Merged Successfully!' : `Merge Table ${sourceTable} into Table ${selectedTableNumber}`}
            </button>
          </div>

          {/* Split Bill Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-mono text-[10.5px] font-black text-indigo-700">
              <Scissors className="h-4 w-4" />
              <span>Split Bill by Guests / Seats</span>
            </div>
            <p className="text-xs text-slate-500">
              Evenly divide total table amount across multiple payment receipts.
            </p>

            <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-mono text-xs font-bold text-slate-700">Number of Ways:</span>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setSplitCount(cnt)}
                    className={`h-7 w-7 rounded-lg font-mono text-xs font-black transition cursor-pointer ${
                      splitCount === cnt
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center font-mono text-xs font-black text-slate-800 py-1">
              ₹ {Math.round(740 / splitCount)} per person (Total: ₹740)
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen(7)}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-mono text-xs font-black transition cursor-pointer"
        >
          Proceed to Payment ➔
        </button>
      </div>
    </WaiterTabletHousing>
  );
};
