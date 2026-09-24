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
  const [errorMsg, setErrorMsg] = useState('');

  const sections = ['ALL', 'SECTION A', 'SECTION B', 'TERRACE', 'FAMILY DINING'];

  const presetWaiters = [
    { name: 'Captain Ramesh', section: 'SECTION A' },
    { name: 'Captain Suresh', section: 'SECTION B' },
    { name: 'Captain Vijay', section: 'TERRACE' },
    { name: 'Captain Kiran', section: 'FAMILY DINING' },
  ];

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4 && nextPin !== '1234') {
        setErrorMsg('INVALID PIN: ENTER 1234');
      }
    }
  };

  const handleLogin = () => {
    if (pin === '1234') {
      setErrorMsg('');
      setCurrentScreen(2);
    } else {
      setErrorMsg('ACCESS DENIED: PIN 1234 REQUIRED');
    }
  };

  return (
    <WaiterTabletHousing screenNumber={1} screenTitle="CAPTAIN AUTH &amp; SECTION LOGIN">
      <div className="flex-1 flex flex-col justify-between p-5">
        <div>
          {/* Establishment Logo Banner */}
          <div className="w-full h-16 border-2 border-slate-800 bg-[#3a0d0d] rounded-xl overflow-hidden mb-3 shadow-xs flex items-center justify-center p-1">
            <img
              src="/images/thoogudeepa-banner.jpg"
              alt="Thoogudeepa Donne Biriyani Mane"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
            [FLOOR CAPTAIN LOGIN]
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 font-mono">
                [CAPTAIN NAME]
              </label>
              <span className="text-[9px] font-mono text-slate-400">QUICK TAP</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {presetWaiters.map((w) => {
                const isSelected = activeCaptain === w.name;
                return (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => {
                      setActiveCaptain(w.name);
                      setActiveSection(w.section);
                    }}
                    className={`py-1 px-0.5 rounded-lg border text-[9.5px] font-mono font-bold transition text-center ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    {w.name.replace('Captain ', '')}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={activeCaptain}
              onChange={(e) => setActiveCaptain(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-stone-50 text-xs font-black text-slate-900 focus:outline-none focus:border-orange-500"
              placeholder="Or type custom name"
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

          <div className="flex justify-between items-center text-[10px] font-bold font-mono mb-1">
            <span className="uppercase tracking-wider text-slate-400">[PASSCODE PIN]:</span>
            {errorMsg ? (
              <span className="text-rose-600 animate-pulse">[{errorMsg}]</span>
            ) : pin === '1234' ? (
              <span className="text-emerald-600">[PIN VERIFIED]</span>
            ) : pin.length === 4 ? (
              <span className="text-rose-600">[INVALID PIN]</span>
            ) : (
              <span className="text-orange-500">[{4 - pin.length} DIGITS • PIN: 1234]</span>
            )}
          </div>
          <div
            className={`h-10 rounded-xl border flex items-center justify-center gap-3 mb-2 shadow-2xs transition-colors ${
              errorMsg || (pin.length === 4 && pin !== '1234')
                ? 'border-rose-300 bg-rose-50'
                : pin === '1234'
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-3 w-3 rounded-full border-2 transition ${
                  pin.length > idx
                    ? pin === '1234'
                      ? 'border-emerald-600 bg-emerald-600'
                      : pin.length === 4
                      ? 'border-rose-600 bg-rose-600'
                      : 'border-slate-900 bg-slate-900'
                    : 'border-slate-300 bg-transparent'
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
