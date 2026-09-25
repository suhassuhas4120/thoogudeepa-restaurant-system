'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useKitchenStore } from '../../store/useKitchenStore';
import { KitchenScreenId, STATION_LABELS } from '../../types/kitchen';
import { ScreenK1Login } from '../../components/kitchen/ScreenK1Login';
import { ScreenK2Overview } from '../../components/kitchen/ScreenK2Overview';
import { ScreenK3Detail } from '../../components/kitchen/ScreenK3Detail';
import {
  Flame,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Grid,
  ChefHat,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KitchenKDSPage() {
  const {
    currentScreen,
    setCurrentScreen,
    viewMode,
    setViewMode,
    activeStation,
  } = useKitchenStore();

  // Route guard — always start at login on hard refresh
  useEffect(() => {
    setCurrentScreen(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screens = [
    {
      id: 1 as KitchenScreenId,
      name: 'SCREEN 1: LOGIN',
      desc: 'Cook Authentication & Station Selection',
      comp: <ScreenK1Login />,
    },
    {
      id: 2 as KitchenScreenId,
      name: 'SCREEN 2: KDS OVERVIEW',
      desc: 'Bulk Orders Aggregator & Live KOT Grid',
      comp: <ScreenK2Overview />,
    },
    {
      id: 3 as KitchenScreenId,
      name: 'SCREEN 3: TICKET DETAIL & 86',
      desc: 'Custom Prep Instructions & 86 Inventory',
      comp: <ScreenK3Detail />,
    },
  ];

  const handleNext = () => {
    if (currentScreen < 3) {
      setCurrentScreen((currentScreen + 1) as KitchenScreenId);
    }
  };

  const handlePrev = () => {
    if (currentScreen > 1) {
      setCurrentScreen((currentScreen - 1) as KitchenScreenId);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur shadow-2xs select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-stone-50 text-slate-700 hover:bg-stone-100 transition shadow-2xs cursor-pointer"
            title="Return to Portal Switcher"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-black text-orange-600">
              <Flame className="h-3 w-3 fill-orange-600" />
              <span>THOOGUDEEPA DONNE BIRYANI MANE</span>
            </div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 mt-0.5">
              KITCHEN DISPLAY SYSTEM (3 TABLET SCREENS) •{' '}
              <span className="text-orange-600">
                {STATION_LABELS[activeStation] || 'Master Dispatch'}
              </span>
            </h1>
          </div>
        </div>

        {/* View Mode & Screen Stepper */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-stone-100 p-0.5 font-mono text-xs font-bold text-slate-700">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Single</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>All 3</span>
            </button>
          </div>

          {/* Stepper (Only active in Single mode) */}
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs font-mono text-xs font-bold">
              <button
                onClick={handlePrev}
                disabled={currentScreen === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-2 text-slate-800">
                <span>{currentScreen}</span>
                <span className="text-slate-300 mx-1">/</span>
                <span className="text-slate-400">3</span>
              </div>
              <button
                onClick={handleNext}
                disabled={currentScreen === 3}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Screen Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-x-hidden">
        {viewMode === 'single' ? (
          <div className="w-full max-w-[1080px] flex flex-col items-center">
            {/* Screen Selector Tabs */}
            <div className="mb-4 flex flex-wrap justify-center gap-2 font-mono text-xs font-extrabold">
              {screens.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentScreen(s.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition border cursor-pointer ${
                    currentScreen === s.id
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-stone-50'
                  }`}
                >
                  <span
                    className={`flex h-2 w-2 rounded-full ${
                      currentScreen === s.id ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>

            {/* Active Screen Render */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                {screens.find((s) => s.id === currentScreen)?.comp}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* All 3 Screens Grid Mode */
          <div className="w-full max-w-[1500px] flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
            {screens.map((screen) => (
              <div
                key={screen.id}
                className="flex flex-col items-center w-full max-w-[480px]"
              >
                <div className="mb-2 flex items-center gap-2 font-mono text-xs font-extrabold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>{screen.name}</span>
                </div>
                <div className="w-full scale-90 origin-top">{screen.comp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
