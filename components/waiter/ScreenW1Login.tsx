'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { UserCheck, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW1Login: React.FC = () => {
  const { setCurrentScreen, activeCaptain, setActiveCaptain, activeSection, setActiveSection } =
    useWaiterStore();
  const [pin, setPin] = useState('');

  const sections = ['ALL', 'SECTION A', 'SECTION B', 'TERRACE', 'FAMILY DINING'];

  const handleNum = (num: string) => {
    if (pin.length < 4) setPin((p) => p + num);
  };

  const handleLogin = () => {
    if (pin.length >= 4 || pin === '') {
      setCurrentScreen(2);
    }
  };

  return (
    <WaiterTabletHousing screenNumber={1} screenTitle="CAPTAIN AUTH &amp; SECTION LOGIN">
      <div className="flex-1 flex flex-col justify-between p-5">
        <div>
          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
            [FLOOR CAPTAIN LOGIN]
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs mb-3">
            <label className="text-[10px] font-bold text-slate-500 font-mono">
              [CAPTAIN NAME]
            </label>
            <input
              type="text"
              value={activeCaptain}
              onChange={(e) => setActiveCaptain(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-stone-50 text-xs font-black text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
            [ASSIGNED FLOOR SECTION]
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`py-2 px-2.5 rounded-xl border text-[10.5px] font-mono font-black transition ${
                  activeSection === sec
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
            [PASSCODE PIN]
          </div>
          <div className="h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-3 mb-2 shadow-2xs">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-3 w-3 rounded-full border-2 border-slate-900 transition ${
                  pin.length > idx ? 'bg-slate-900' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-bold font-mono text-slate-800 hover:bg-stone-100 transition active:scale-95 shadow-2xs"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPin('')}
              className="h-10 rounded-xl border border-slate-200 bg-stone-100 font-mono text-[10px] font-bold text-slate-600"
            >
              CLR
            </button>
            <button
              onClick={() => handleNum('0')}
              className="h-10 rounded-xl border border-slate-200 bg-white font-mono text-sm font-bold text-slate-800 shadow-2xs"
            >
              0
            </button>
            <button
              onClick={() => setPin((p) => p.slice(0, -1))}
              className="h-10 rounded-xl border border-slate-200 bg-stone-100 font-mono text-[10px] font-bold text-slate-600"
            >
              DEL
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition"
        >
          <span>[LOGIN TO FLOOR CONSOLE]</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
