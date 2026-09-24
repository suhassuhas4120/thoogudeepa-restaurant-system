'use client';

import React from 'react';
import Link from 'next/link';
import { useWaiterStore } from '../../store/useWaiterStore';
import { WaiterScreenId } from '../../types/waiter';

// ── Mobile phone view screens (existing) ──────────────────────────
import { ScreenW1Login } from '../../components/waiter/ScreenW1Login';
import { ScreenW2TablesFeed } from '../../components/waiter/ScreenW2TablesFeed';
import { ScreenW3TableDetail } from '../../components/waiter/ScreenW3TableDetail';
import { ScreenW4TakeOrder } from '../../components/waiter/ScreenW4TakeOrder';
import { ScreenW5ItemCustom } from '../../components/waiter/ScreenW5ItemCustom';
import { ScreenW6MergeSplit } from '../../components/waiter/ScreenW6MergeSplit';
import { ScreenW7Payment } from '../../components/waiter/ScreenW7Payment';
import { ScreenW8PrintBill } from '../../components/waiter/ScreenW8PrintBill';
import { ScreenW9Vacate } from '../../components/waiter/ScreenW9Vacate';
import { ScreenW10ShiftStats } from '../../components/waiter/ScreenW10ShiftStats';

// ── 10" Landscape Tablet view screens (NEW matching wireframes) ────
import { TabletScreen1Login } from '../../components/waiter/tablet/TabletScreen1Login';
import { TabletScreen2TablesFeed } from '../../components/waiter/tablet/TabletScreen2TablesFeed';
import { TabletScreen3TableDetail } from '../../components/waiter/tablet/TabletScreen3TableDetail';
import { TabletScreen4TakeOrder } from '../../components/waiter/tablet/TabletScreen4TakeOrder';
import { TabletScreen5ItemCustom } from '../../components/waiter/tablet/TabletScreen5ItemCustom';
import { TabletScreen6MergeSplit } from '../../components/waiter/tablet/TabletScreen6MergeSplit';
import { TabletScreen7Payment } from '../../components/waiter/tablet/TabletScreen7Payment';
import { TabletScreen8PrintBill } from '../../components/waiter/tablet/TabletScreen8PrintBill';
import { TabletScreen9Vacate } from '../../components/waiter/tablet/TabletScreen9Vacate';
import { TabletScreen10ShiftStats } from '../../components/waiter/tablet/TabletScreen10ShiftStats';

import {
  UserCheck,
  LayoutGrid,
  Tablet,
  Users,
  UtensilsCrossed,
  Receipt,
  CreditCard,
  Trash2,
  TrendingUp,
  Flame,
  Utensils,
  Monitor,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaiterTabletPage() {
  const { currentScreen, setCurrentScreen, viewMode, setViewMode } = useWaiterStore();

  const screens = [
    { id: 1 as WaiterScreenId, name: '1. Captain Login', icon: <UserCheck className="h-3.5 w-3.5 text-orange-500" />, mobile: <ScreenW1Login />, tablet: <TabletScreen1Login /> },
    { id: 2 as WaiterScreenId, name: '2. Floor Overview', icon: <LayoutGrid className="h-3.5 w-3.5 text-purple-500" />, mobile: <ScreenW2TablesFeed />, tablet: <TabletScreen2TablesFeed /> },
    { id: 3 as WaiterScreenId, name: '3. Table Operations', icon: <UtensilsCrossed className="h-3.5 w-3.5 text-indigo-500" />, mobile: <ScreenW3TableDetail />, tablet: <TabletScreen3TableDetail /> },
    { id: 4 as WaiterScreenId, name: '4. Menu Order Entry', icon: <Utensils className="h-3.5 w-3.5 text-blue-500" />, mobile: <ScreenW4TakeOrder />, tablet: <TabletScreen4TakeOrder /> },
    { id: 5 as WaiterScreenId, name: '5. KOT Dispatch', icon: <Flame className="h-3.5 w-3.5 text-amber-500" />, mobile: <ScreenW5ItemCustom />, tablet: <TabletScreen5ItemCustom /> },
    { id: 6 as WaiterScreenId, name: '6. Table Management', icon: <Users className="h-3.5 w-3.5 text-teal-500" />, mobile: <ScreenW6MergeSplit />, tablet: <TabletScreen6MergeSplit /> },
    { id: 7 as WaiterScreenId, name: '7. Bill Settlement', icon: <CreditCard className="h-3.5 w-3.5 text-emerald-500" />, mobile: <ScreenW7Payment />, tablet: <TabletScreen7Payment /> },
    { id: 8 as WaiterScreenId, name: '8. Receipt & Invoice', icon: <Receipt className="h-3.5 w-3.5 text-cyan-600" />, mobile: <ScreenW8PrintBill />, tablet: <TabletScreen8PrintBill /> },
    { id: 9 as WaiterScreenId, name: '9. Table Vacate', icon: <Trash2 className="h-3.5 w-3.5 text-rose-500" />, mobile: <ScreenW9Vacate />, tablet: <TabletScreen9Vacate /> },
    { id: 10 as WaiterScreenId, name: '10. Shift Performance', icon: <TrendingUp className="h-3.5 w-3.5 text-slate-700" />, mobile: <ScreenW10ShiftStats />, tablet: <TabletScreen10ShiftStats /> },
  ];

  const renderActiveScreen = () => {
    const sc = screens.find((s) => s.id === currentScreen);
    if (!sc) return <ScreenW1Login />;
    return viewMode === 'tablet' ? sc.tablet : sc.mobile;
  };

  return (
    <main className={`min-h-screen flex flex-col ${viewMode === 'tablet' ? 'bg-[#0b0f19]' : 'bg-stone-100'}`}>
      {/* ── Top Console Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 py-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm shadow-orange-500/30">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-1.5 py-0.5">
                WAITER / CAPTAIN TABLET FRAMEWORK • REACT 19 • NEXT.JS
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-400">
                THOOGUDEEPA DONNE BIRYANI MANE
              </span>
            </div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 mt-0.5">
              FLOOR CAPTAIN CONSOLE (MULTI-PANE COMMAND HUB)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Multi-Portal Switcher */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1 shadow-xs font-mono text-xs font-bold">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>CUSTOMER (10)</span>
            </Link>
            <Link
              href="/kitchen"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>KITCHEN (3)</span>
            </Link>
            <span className="rounded-xl bg-orange-600 text-white px-3 py-1.5 shadow-xs flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" />
              <span>WAITER PORTAL</span>
            </span>
            <Link
              href="/manager"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>MANAGER (16)</span>
            </Link>
          </div>

          {/* View Mode Switcher — 3 options now */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1 shadow-xs">
            {/* 📱 Mobile Phone View */}
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'single'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>SINGLE TABLET FLOW</span>
            </button>

            {/* 📟 10" Industrial Tablet View (NEW) */}
            <button
              onClick={() => setViewMode('tablet')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'tablet'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>📟 10&quot; TABLET VIEW</span>
            </button>

            {/* 📊 Side-by-Side View */}
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>ALL 10 SCREENS SIDE-BY-SIDE</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Screen Navigation Tabs ─────────────────────────────────── */}
      <nav
        className={`w-full max-w-7xl mx-auto flex gap-2 overflow-x-auto px-6 py-3 scrollbar-none ${
          viewMode === 'tablet' ? 'bg-[#111827] border-b border-[#374151]' : ''
        }`}
      >
        {screens.map((sc) => {
          const isActive = viewMode !== 'all' && currentScreen === sc.id;
          return (
            <motion.button
              key={sc.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentScreen(sc.id);
                if (viewMode === 'all') setViewMode('single');
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                isActive
                  ? viewMode === 'tablet'
                    ? 'border-orange-500 bg-orange-700 text-white ring-2 ring-orange-500/30'
                    : 'border-orange-500 bg-white text-orange-950 ring-2 ring-orange-500/20 shadow-xs'
                  : viewMode === 'tablet'
                  ? 'border-[#374151] bg-[#1f2937] text-slate-300 hover:bg-[#374151]'
                  : 'border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span>{sc.icon}</span>
              <span>{sc.name}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* ── Main Container ─────────────────────────────────────────── */}
      <div className={`flex-1 py-4 ${viewMode === 'tablet' ? 'px-4 bg-[#0b0f19]' : 'px-4'}`}>

        {/* ── SIDE-BY-SIDE (All 10 phone screens) ─────────────────── */}
        {viewMode === 'all' && (
          <div className="mx-auto w-full max-w-[1680px] px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center pb-20">
            {screens.map((sc) => (
              <div key={sc.id} className="flex flex-col items-center w-[380px] shrink-0">
                {sc.mobile}
              </div>
            ))}
          </div>
        )}

        {/* ── SINGLE PHONE FLOW ────────────────────────────────────── */}
        {viewMode === 'single' && (
          <div className="flex justify-center pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={`phone-${currentScreen}`}
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {screens.find((s) => s.id === currentScreen)?.mobile ?? <ScreenW1Login />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── 10" INDUSTRIAL TABLET VIEW (NEW) ────────────────────── */}
        {viewMode === 'tablet' && (
          <div className="w-full pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={`tablet-${currentScreen}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {screens.find((s) => s.id === currentScreen)?.tablet ?? <TabletScreen1Login />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
