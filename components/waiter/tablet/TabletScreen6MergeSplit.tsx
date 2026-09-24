'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { ArrowLeft, Users, CheckCircle2, Utensils } from 'lucide-react';

export const TabletScreen6MergeSplit: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber } = useWaiterStore();
  const { tables, waiterMergeTables } = useSharedBridge();

  const [selectedMergeTables, setSelectedMergeTables] = useState<string[]>([
    selectedTableNumber || 'A-04',
    'A-02',
  ]);
  const [mergeConfirmed, setMergeConfirmed] = useState(false);

  const activeTable = tables.find((t) => t.number === (selectedTableNumber || 'A-04')) || tables[0];
  const runningBill = activeTable?.currentBill || 0;

  const availableTables = tables
    .filter((t) => t.number !== (selectedTableNumber || 'A-04'))
    .map((t) => t.number);

  const toggleMerge = (tableNum: string) => {
    const primary = selectedTableNumber || 'A-04';
    if (tableNum === primary) return;
    setSelectedMergeTables((prev) =>
      prev.includes(tableNum)
        ? prev.filter((t) => t !== tableNum && t !== primary)
        : [...prev, tableNum]
    );
  };

  const handleConfirmMerge = () => {
    if (selectedMergeTables.length >= 2) {
      waiterMergeTables(selectedMergeTables[0], selectedMergeTables[1]);
    }
    setMergeConfirmed(true);
    setTimeout(() => setMergeConfirmed(false), 3000);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={6}
      screenTitle="TABLE TRANSFER & MERGE MANAGEMENT"
    >
      <div className="flex flex-col flex-1 min-h-[700px] p-5 font-mono select-none">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setCurrentScreen(3)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Table</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Table Transfer & Merge Hub
          </h3>
          <span className="border border-slate-400 bg-slate-100 px-3 py-1 rounded font-bold text-xs text-slate-700">
            Merge Controller
          </span>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* LEFT: TABLE SELECTION GRID */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="border border-slate-300 bg-white rounded-xl p-5 flex flex-col gap-4 shadow-xs">
              <strong className="text-sm font-black text-slate-900">
                Merge Tables for Unified Billing:
              </strong>
              <span className="text-xs font-bold text-slate-600">
                Select active tables to merge with {selectedTableNumber || 'A-04'}:
              </span>

              <div className="grid grid-cols-4 gap-2.5">
                {[(selectedTableNumber || 'A-04'), ...availableTables].map((tbl) => {
                  const isPrimary = tbl === (selectedTableNumber || 'A-04');
                  const isSelected = selectedMergeTables.includes(tbl);
                  return (
                    <button
                      key={tbl}
                      onClick={() => toggleMerge(tbl)}
                      disabled={isPrimary}
                      className={`py-3 px-2 border rounded-xl text-xs font-black transition ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      } ${isPrimary ? 'cursor-default opacity-85 ring-2 ring-orange-500/30' : ''}`}
                    >
                      {tbl} {isPrimary ? '★' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-3 text-xs font-bold text-slate-700 space-y-1">
                <div>Primary Master Table: {selectedTableNumber || 'A-04'}</div>
                <div>Selected Tables to Merge: {selectedMergeTables.join(' + ')}</div>
                <div className="text-purple-700 font-black">
                  Combined Guests: {selectedMergeTables.length * 3} Guests • Consolidated Bill: ₹{(runningBill * selectedMergeTables.length).toLocaleString('en-IN')}.00
                </div>
              </div>

              {mergeConfirmed && (
                <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✓ Tables merged successfully — unified under Table {selectedTableNumber || 'A-04'}!</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentScreen(4)}
              className="border border-slate-400 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs px-4 py-3.5 transition flex items-center justify-center gap-2 shadow-2xs"
            >
              <Utensils className="h-4 w-4" />
              <span>Punch Order for Merged Table ➔</span>
            </button>
          </div>

          {/* RIGHT: CONFIRMATION & OVERVIEW */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="border border-slate-300 bg-slate-50 rounded-xl p-5 flex flex-col gap-3">
              <strong className="text-xs font-black text-slate-900 uppercase">
                Merged Table Protocol Overview:
              </strong>
              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  • When tables are merged, all future KOTs, dish preparation tracking, and payments will be routed as one single combined invoice.
                </p>
                <p>
                  • Floor matrix on Screen 2 will display the merged indicator ({selectedMergeTables.join(' + ')}).
                </p>
                <p>
                  • When vacating after payment, all merged tables are simultaneously released and returned to clean vacant status.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmMerge}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs transition shadow-sm mt-auto flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Confirm Table Merge ➔ Update Live State</span>
            </button>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
