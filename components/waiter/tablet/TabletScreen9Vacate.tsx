'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const CHECKLIST = [
  { id: 1, emoji: '🧽', title: '1. Clean Table', desc: 'Clear dishes, wipe top & sanitize surface' },
  { id: 2, emoji: '💧', title: '2. Water Refill', desc: 'Replace fresh water bottle & clean glasses' },
  { id: 3, emoji: '🍴', title: '3. Cutlery Replacement', desc: 'Arrange fresh spoons, forks & knives' },
  { id: 4, emoji: '🧻', title: '4. Tissue Box Refill', desc: 'Check and refill table napkin dispenser' },
  { id: 5, emoji: '🪑', title: '5. Chairs Aligned', desc: 'Straighten chairs and clean seat cushions' },
  { id: 6, emoji: '🌿', title: '6. Condiment Refill', desc: 'Refill salt, pepper, lemon & chutney' },
];

export const TabletScreen9Vacate: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber } = useWaiterStore();
  const { waiterVacatesTable } = useSharedBridge();
  const [completed, setCompleted] = useState<number[]>([]);
  const [tableReleased, setTableReleased] = useState(false);

  const toggleTask = (id: number) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleMarkAvailable = () => {
    waiterVacatesTable(selectedTableNumber || 'A-04');
    setTableReleased(true);
    setTimeout(() => {
      setTableReleased(false);
      setCurrentScreen(2);
    }, 2000);
  };

  const allDone = completed.length === CHECKLIST.length;

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={9}
      screenTitle="TABLE VACATE & STATION RESET"
    >
      <div className="flex flex-col flex-1 min-h-[700px] p-5 font-mono select-none">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setCurrentScreen(2)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tables</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Table Vacate & Station Reset Checklist
          </h3>
          <span className="border border-slate-400 bg-slate-100 px-3 py-1 rounded font-bold text-xs text-slate-700">
            Table {selectedTableNumber || 'A-04'} Vacate
          </span>
        </div>

        {/* RELEASED BANNER */}
        {tableReleased && (
          <div className="mb-3 p-3 bg-emerald-700 text-white rounded-xl font-black text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 fill-white" />
            ✓ Table {selectedTableNumber || 'A-04'} is now vacant — redirecting to floor plan...
          </div>
        )}

        {/* PROTOCOL DESCRIPTION */}
        <div className="border-2 border-slate-800 rounded-xl p-4 mb-4 bg-white shadow-xs shrink-0">
          <strong className="text-xs font-black text-slate-950">
            Table Reset & Sanitization Protocol:
          </strong>
          <p className="text-[11px] font-bold text-slate-600 mt-1">
            Click each turnaround step below to mark complete before declaring table available
          </p>
          <div className="mt-2 text-xs font-bold text-slate-500">
            Progress: {completed.length} / {CHECKLIST.length} tasks completed
            {allDone && (
              <span className="ml-3 text-emerald-700 font-black">✓ All Done — Table Ready!</span>
            )}
          </div>
          {/* Progress Bar */}
          <div className="mt-2 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-slate-900 rounded-full transition-all duration-300"
              style={{ width: `${(completed.length / CHECKLIST.length) * 100}%` }}
            />
          </div>
        </div>

        {/* TURNAROUND CHECKLIST BUTTONS (2-COLUMN GRID) */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {CHECKLIST.map((task) => {
            const isDone = completed.includes(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 border-2 rounded-xl flex flex-col gap-2 text-left transition shadow-xs hover:-translate-y-0.5 ${
                  isDone
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-400 bg-white hover:border-slate-800 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{task.emoji}</span>
                  {isDone && <CheckCircle2 className="h-5 w-5 text-emerald-400 ml-auto" />}
                </div>
                <strong className={`text-sm font-black ${isDone ? 'text-white' : 'text-slate-950'}`}>
                  {task.title}
                </strong>
                <span className={`text-[10.5px] font-bold ${isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                  {task.desc}
                </span>
                <span
                  className={`text-[10px] font-black font-mono mt-auto pt-1 border-t ${
                    isDone ? 'border-slate-700 text-emerald-400' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓ Completed' : 'Click to Mark Done'}
                </span>
              </button>
            );
          })}
        </div>

        {/* TABLE AVAILABLE BUTTON (SYNCED WITH MANAGER) */}
        <div className="mt-4 pt-4 border-t-2 border-slate-800 shrink-0">
          <button
            onClick={handleMarkAvailable}
            disabled={!allDone}
            className={`w-full py-5 rounded-xl font-black text-sm transition flex items-center justify-center gap-3 ${
              allDone
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="text-xl">✨</span>
            <span>
              {allDone
                ? 'Dispatch Busboy & Mark Vacant (Syncs with Manager)'
                : `Complete all ${CHECKLIST.length - completed.length} remaining tasks to enable`}
            </span>
          </button>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
