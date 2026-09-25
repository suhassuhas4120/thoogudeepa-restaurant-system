'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import { KITCHEN_MASTER_PIN, KitchenStation, STATION_LABELS } from '../../types/kitchen';
import { ChefHat, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenK1Login: React.FC = () => {
  const {
    setCurrentScreen,
    chefName,
    setChefName,
    activeStation,
    setActiveStation,
    setShiftStartTime,
  } = useKitchenStore();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const chefProfiles = [
    { name: 'Chef Manjunath', station: 'MASTER_DISPATCH' as KitchenStation },
    { name: 'Chef Raghavendra', station: 'DUM_BIRYANI' as KitchenStation },
    { name: 'Chef Anand', station: 'KEBAB_TANDOOR' as KitchenStation },
    { name: 'Chef Santosh', station: 'DESSERTS' as KitchenStation },
  ];

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin((prev) => prev + num);
      setError('');
    }
  };

  const handleClear = () => {
    setEnteredPin('');
    setError('');
  };

  const handleBackspace = () => setEnteredPin((prev) => prev.slice(0, -1));

  const handleLogin = () => {
    if (enteredPin === KITCHEN_MASTER_PIN) {
      setShiftStartTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setError('');
      setCurrentScreen(2);
    } else {
      setError('WRONG PIN — Please enter universal kitchen PIN (1234)');
      setEnteredPin('');
    }
  };

  // Auto-submit when 4 digits are entered
  React.useEffect(() => {
    if (enteredPin.length === 4) {
      const timer = setTimeout(() => handleLogin(), 150);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredPin]);

  return (
    <KitchenTabletHousing screenNumber={1} screenTitle="KDS KITCHEN LOGIN">
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-8 overflow-y-auto bg-stone-100/50">
        {/* Left Card: Establishment Signboard Logo & Station Details */}
        <div className="w-full md:w-[460px] bg-white rounded-3xl border-2 border-slate-900 p-7 shadow-[4px_4px_0px_#0f172a] flex flex-col items-center justify-between text-center min-h-[460px]">
          <div className="flex flex-col items-center my-auto w-full">
            {/* Authentic Establishment Signboard Banner */}
            <div className="relative w-full max-w-[340px] h-28 rounded-2xl overflow-hidden border-2 border-slate-900 shadow-md mb-4 bg-slate-950 flex items-center justify-center">
              <img
                src="/images/thoogudeepa-banner.jpg"
                alt="Thoogudeepa Donne Biryani Mane"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-left">
                <span className="font-mono text-[9px] font-black text-amber-300 uppercase tracking-widest">
                  ESTD. BANGALORE
                </span>
                <span className="font-black text-white text-sm uppercase tracking-tight">
                  Thoogudeepa Donne Biryani Mane
                </span>
              </div>
            </div>

            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-orange-600">
              [AUTHENTIC KARNATAKA CUISINE]
            </span>
            <p className="mt-1 text-xs font-mono font-bold text-slate-600">
              [KITCHEN DISPLAY SYSTEM • PASS TERMINAL]
            </p>

            {/* Quick Chef & Station Selectors */}
            <div className="mt-4 w-full">
              <span className="font-mono text-[9.5px] font-bold text-slate-400 block mb-1.5 uppercase">
                [SELECT ACTIVE STATION / CHEF PROFILE]:
              </span>
              <div className="grid grid-cols-2 gap-1.5 w-full">
                {chefProfiles.map((cp) => (
                  <button
                    key={cp.name}
                    type="button"
                    onClick={() => {
                      setChefName(cp.name);
                      setActiveStation(cp.station);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-black transition cursor-pointer text-left ${
                      chefName === cp.name
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-stone-50 text-slate-700 border-slate-300 hover:bg-stone-100'
                    }`}
                  >
                    <div className="truncate">{cp.name}</div>
                    <div className="text-[8.5px] opacity-75 font-normal truncate">
                      {STATION_LABELS[cp.station]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-mono font-bold text-orange-800">
              🔑 UNIVERSAL PIN: <strong>1234</strong>
            </div>
          </div>

          <div className="w-full mt-4 pt-3 border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>[VENUE: THOOGUDEEPA MANE]</span>
            <span className="text-emerald-600 font-bold">KDS v2.7 ONLINE</span>
          </div>
        </div>

        {/* Right Card: PIN Pad & Quick Authentication */}
        <div className="w-full md:w-80 bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
              [STAFF AUTHENTICATION PIN]
            </div>
            <div className="flex items-center gap-1.5 mb-3 bg-stone-50 border border-slate-200 rounded-xl p-2">
              <ChefHat className="h-4 w-4 text-orange-600 shrink-0" />
              <input
                type="text"
                value={chefName}
                onChange={(e) => setChefName(e.target.value)}
                placeholder="Enter Chef Name..."
                className="w-full bg-transparent font-mono text-xs font-black text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* PIN Dots Display with reactive feedback */}
            <div className={`h-11 rounded-xl border flex items-center justify-center gap-3 mb-2 transition ${
              error
                ? 'bg-rose-50 border-rose-300'
                : enteredPin.length === 4
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-stone-100 border-slate-200'
            }`}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-3.5 w-3.5 rounded-full transition-all duration-150 ${
                    idx < enteredPin.length
                      ? error
                        ? 'bg-rose-500 scale-110'
                        : 'bg-emerald-500 scale-110 shadow-xs'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-2 flex items-start gap-1.5 rounded-lg bg-rose-50 border border-rose-300 p-2 text-[10px] font-bold text-rose-700">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeyPress(num)}
                  className="h-11 rounded-xl border border-slate-200 bg-stone-50 font-mono text-base font-black text-slate-800 shadow-2xs hover:bg-stone-200 hover:border-slate-300 transition cursor-pointer"
                >
                  {num}
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="h-11 rounded-xl border border-slate-200 bg-stone-100 font-mono text-[11px] font-black text-slate-600 shadow-2xs hover:bg-stone-200 transition cursor-pointer"
              >
                C
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyPress('0')}
                className="h-11 rounded-xl border border-slate-200 bg-stone-50 font-mono text-base font-black text-slate-800 shadow-2xs hover:bg-stone-200 hover:border-slate-300 transition cursor-pointer"
              >
                0
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                className="h-11 rounded-xl border border-slate-200 bg-stone-100 font-mono text-[11px] font-black text-slate-600 shadow-2xs hover:bg-stone-200 transition cursor-pointer"
              >
                ⌫
              </motion.button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={enteredPin.length < 4}
            className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              enteredPin.length === 4
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 hover:bg-orange-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
            <span>[LOGIN TO KDS]</span>
          </motion.button>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};
