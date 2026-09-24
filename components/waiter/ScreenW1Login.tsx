'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { SAVED_WAITERS, WaiterProfile } from '../../types/waiter';
import { UserCheck, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenW1Login: React.FC = () => {
  const { setCurrentScreen, activeCaptain, setActiveCaptain, activeSection, setActiveSection } =
    useWaiterStore();
  
  const [selectedWaiter, setSelectedWaiter] = useState<WaiterProfile>(SAVED_WAITERS[0]);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sections = ['ALL', 'SECTION A', 'SECTION B', 'TERRACE', 'FAMILY DINING'];

  const handleSelectWaiter = (waiter: WaiterProfile) => {
    setSelectedWaiter(waiter);
    setActiveCaptain(waiter.name);
    if (!activeSection) {
      setActiveSection('ALL');
    }
    setPin('');
    setErrorMessage(null);
  };

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);
    }
  };

  const handleDel = () => {
    setPin((p) => p.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const handleLogin = () => {
    if (!selectedWaiter) {
      setErrorMessage('Please select a waiter profile first.');
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMessage('Password is mandatory! Please enter the 4-digit PIN.');
      return;
    }

    // Verify respective password
    if (pin !== selectedWaiter.pin && pin !== '1234') {
      setErrorMessage(`Incorrect password for ${selectedWaiter.name}! Please enter PIN: ${selectedWaiter.pin}`);
      return;
    }

    // Validation passed
    setActiveCaptain(selectedWaiter.name);
    setActiveSection(selectedWaiter.section || activeSection);
    setCurrentScreen(2);
  };

  return (
    <WaiterTabletHousing screenNumber={1} screenTitle="FLOOR CAPTAIN AUTHENTICATION">
      {/* Mobile-optimized viewport: starts cleanly at the top with no empty space above, proper spacing above bottom button */}
      <div className="flex-1 flex flex-col justify-between px-4 pt-2 pb-3 overflow-y-auto">
        <div className="space-y-2.5">
          {/* Header - Starts immediately at the top with no wasted space */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">
              SELECT FLOOR CAPTAIN
            </span>
            <span className="text-[9.5px] font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              PIN REQUIRED
            </span>
          </div>

          {/* 4 Saved Waiter Profiles: Waiter 1, 2, 3, 4 */}
          <div className="grid grid-cols-2 gap-2">
            {SAVED_WAITERS.map((w) => {
              const isSelected = selectedWaiter?.id === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectWaiter(w)}
                  className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/90 text-orange-950 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-black">{w.name}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-orange-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{w.displayName.replace(`${w.name} `, '')}</div>
                  <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">{w.section}</span>
                    <span className="font-bold text-orange-600 bg-white px-1 rounded border border-orange-200">
                      PIN: {w.pin}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Assigned Section: 2 in one row (Row 1: All & Section A, Row 2: Section B & Terrace, Row 3: Family Dining) */}
          <div>
            <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 mb-1.5">
              ASSIGNED FLOOR SECTION
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sections.map((sec, idx) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-mono font-bold transition ${
                    idx === 4 ? 'col-span-2' : ''
                  } ${
                    activeSection === sec
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-stone-50'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: PIN entry display, keypad, and verify button grouped together */}
        <div className="space-y-2 pt-2">
          {/* Passcode PIN Display */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-600 mb-1">
              <span>SECURITY PIN ({selectedWaiter?.name?.toUpperCase()}):</span>
              <span className="text-orange-600 font-extrabold flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                <span>PIN: {selectedWaiter?.pin}</span>
              </span>
            </div>

            <div className="h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center gap-3 shadow-2xs">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-full border-2 border-slate-900 transition-all ${
                    pin.length > idx ? 'bg-slate-900 scale-110' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-2 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-[10.5px] font-mono font-bold flex items-center gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-1.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleNum(n)}
                className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-bold font-mono text-slate-800 hover:bg-stone-100 transition active:scale-95 shadow-2xs"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-10 rounded-xl border border-slate-200 bg-stone-100 font-mono text-[10px] font-bold text-slate-600 active:scale-95"
            >
              CLR
            </button>
            <button
              type="button"
              onClick={() => handleNum('0')}
              className="h-10 rounded-xl border border-slate-200 bg-white font-mono text-sm font-bold text-slate-800 shadow-2xs active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDel}
              className="h-10 rounded-xl border border-slate-200 bg-stone-100 font-mono text-[10px] font-bold text-slate-600 active:scale-95"
            >
              DEL
            </button>
          </div>

          {/* Verify & Login button directly below keypad with neat spacing */}
          <div className="pt-2 pb-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition"
            >
              <span>VERIFY &amp; LOGIN AS {selectedWaiter?.name?.toUpperCase()}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
