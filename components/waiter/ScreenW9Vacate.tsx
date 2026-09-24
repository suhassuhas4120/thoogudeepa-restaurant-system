'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { ArrowLeft, Trash2, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW9Vacate: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber } = useWaiterStore();
  const { waiterVacatesTable } = useSharedBridge();
  const [cleared, setCleared] = useState(false);

  const handleVacate = () => {
    waiterVacatesTable(selectedTableNumber);
    setCleared(true);
    setTimeout(() => {
      setCurrentScreen(2);
    }, 1500);
  };

  return (
    <WaiterTabletHousing screenNumber={9} screenTitle="TABLE VACATE & STATION RESET">
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
              Table: {selectedTableNumber}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">
              Checkout Verification &amp; Station Reset
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify guests have departed Table {selectedTableNumber}. Clicking below alerts floor
              busboys for sanitization and resets table status to Vacant.
            </p>
          </div>

          {/* Turnaround Checklist */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2 text-xs">
            <div className="font-mono text-[10px] font-bold uppercase text-slate-400">
              Turnaround Checklist
            </div>
            {[
              'Bill paid and settlement verified',
              'Guest belongings checked on seats',
              'Used leaf donnes, glasses & cutlery cleared',
              'Table surface sanitized with food-grade spray',
            ].map((chk, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{chk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vacate Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleVacate}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg transition cursor-pointer"
        >
          {cleared ? '✓ Table Vacated & Reset!' : 'Dispatch Busboy & Mark Vacant'}
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
