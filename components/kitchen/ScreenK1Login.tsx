'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import { ChefHat, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenK1Login: React.FC = () => {
  const { setCurrentScreen, chefName, setChefName } = useKitchenStore();
  const [enteredPin, setEnteredPin] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin((prev) => prev + num);
    }
  };

  const handleClear = () => setEnteredPin('');
  const handleBackspace = () => setEnteredPin((prev) => prev.slice(0, -1));

  const handleLogin = () => {
    if (enteredPin.length >= 4 || enteredPin === '') {
      setCurrentScreen(2);
    }
  };

  return (
    <KitchenTabletHousing screenNumber={1} screenTitle="KDS KITCHEN LOGIN">
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-8 overflow-y-auto bg-stone-100/50">
        {/* Left Card: Hotel Logo & Hotel Name */}
        <div className="w-full md:w-[440px] bg-white rounded-3xl border-2 border-slate-900 p-8 shadow-[4px_4px_0px_#0f172a] flex flex-col items-center justify-between text-center min-h-[440px]">
          <div className="flex flex-col items-center my-auto">
            {/* Hotel Logo Badge */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[3px_3px_0px_#0f172a] mb-5">
              <span className="text-5xl">🥘</span>
              <div className="absolute -bottom-2 -right-2 rounded-full border border-slate-900 bg-orange-600 p-1.5 text-white shadow-xs">
                <ChefHat className="h-4 w-4" />
              </div>
            </div>

            {/* Hotel Name */}
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-orange-600">
              AUTHENTIC KARNATAKA CUISINE
            </span>
            <h1 className="mt-1.5 text-xl font-black text-slate-900 uppercase tracking-tight">
              Thoogudeepa Donne Biryani Mane
            </h1>
            <p className="mt-1 text-xs font-mono font-bold text-slate-600">
              KITCHEN DISPLAY SYSTEM • KDS PASS TERMINAL
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-lg border border-slate-300 bg-stone-50 px-3 py-1 font-mono text-[10.5px] font-bold text-slate-700">
                MAIN PASS DISPATCH
              </span>
              <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono text-[10.5px] font-bold text-emerald-800 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE TABLE SYNC ACTIVE</span>
              </span>
            </div>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>VENUE: THOOGUDEEPA DONNE BIRYANI MANE</span>
            <span className="text-emerald-600 font-bold">KDS v2.4 ONLINE</span>
          </div>
        </div>

        {/* Right Card: Staff Selection & PIN Pad */}
        <div className="w-full md:w-80 bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
              STAFF AUTHENTICATION PIN
            </div>

            <div className="mb-3">
              <label className="text-[10.5px] font-bold text-slate-600 font-mono">
                CHEF DE CUISINE
              </label>
              <input
                type="text"
                value={chefName}
                onChange={(e) => setChefName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-stone-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            {/* PIN Dots Display */}
            <div className="h-11 rounded-xl bg-stone-100 border border-slate-200 flex items-center justify-center gap-3 mb-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-full border-2 border-slate-800 transition ${
                    enteredPin.length > idx ? 'bg-slate-900' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-10 rounded-lg border border-slate-200 bg-stone-50 hover:bg-stone-100 font-mono text-sm font-bold text-slate-800 transition active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-10 rounded-lg border border-slate-200 bg-stone-100 hover:bg-stone-200 font-mono text-[10px] font-bold text-slate-600 transition"
              >
                CLR
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-10 rounded-lg border border-slate-200 bg-stone-50 hover:bg-stone-100 font-mono text-sm font-bold text-slate-800 transition active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-10 rounded-lg border border-slate-200 bg-stone-100 hover:bg-stone-200 font-mono text-[10px] font-bold text-slate-600 transition"
              >
                DEL
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
          >
            <span>START SHIFT &amp; ENTER KDS</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </motion.button>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};
