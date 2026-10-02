'use client';

import React from 'react';
import Link from 'next/link';
import { useCustomer, useCustomerStore } from '../context/CustomerContext';
import { ScreenId } from '../types/customer';
import { Screen1Welcome } from '../components/screens/Screen1Welcome';
import { Screen2Menu } from '../components/screens/Screen2Menu';
import { Screen3ItemDetail } from '../components/screens/Screen3ItemDetail';
import { Screen4Cart } from '../components/screens/Screen4Cart';
import { Screen5LiveTracking } from '../components/screens/Screen5LiveTracking';
import { Screen6PaymentBreakdown } from '../components/screens/Screen6PaymentBreakdown';
import { Screen7PaymentGateway } from '../components/screens/Screen7PaymentGateway';
import { Screen8Confirmation } from '../components/screens/Screen8Confirmation';
import { Screen9DigitalBill } from '../components/screens/Screen9DigitalBill';
import { Screen10WaiterCall } from '../components/screens/Screen10WaiterCall';
import {
  Smartphone,
  LayoutGrid,
  UtensilsCrossed,
  Sparkles,
  Crown,
  Bell,
  ShoppingCart,
  Clock,
  CreditCard,
  CheckCircle2,
  FileText,
  MessageSquare,
  Flame,
  UserCheck,
  Utensils,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateSeatAccess } from '../lib/session/seatSessionManager';
import { useSharedBridge } from '../store/useSharedBridge';

export default function CustomerJourneyPage() {
  const {
    currentScreen,
    setCurrentScreen,
    viewMode,
    setViewMode,
    tableNumber,
    seatNumber,
    setTableNumber,
    setSeatNumber,
  } = useCustomer();

  const [sessionNotice, setSessionNotice] = React.useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table') || 'A-01';
      const seatParam = params.get('seat') || '1';
      setTableNumber(tableParam);
      const parsedSeat = parseInt(seatParam, 10) || 1;
      setSeatNumber(parsedSeat);

      // Check current seat state from shared bridge
      const bridge = useSharedBridge.getState();
      const targetTable = bridge.tables.find(
        (t) => t.number.toLowerCase() === tableParam.toLowerCase()
      );
      const targetSeat = targetTable?.seats?.find((s) => s.seatNumber === parsedSeat);
      const isOccupied = targetSeat ? targetSeat.status === 'OCCUPIED' : false;
      const activeBill = targetSeat?.currentBill || 0;
      const guestName = targetSeat?.guestName;

      const result = validateSeatAccess(
        tableParam,
        parsedSeat,
        isOccupied,
        activeBill,
        guestName
      );

      if (result.status === 'SESSION_RESTORED' || result.status === 'FINGERPRINT_RECOVERED') {
        setSessionNotice(result.message);
        if (activeBill > 0 && currentScreen === 1) {
          setCurrentScreen(2);
        }
      } else if (result.status === 'SEAT_OCCUPIED_CONFLICT') {
        setConflictWarning(result.message);
      }
    }
  }, [setTableNumber, setSeatNumber]);

  const screens = [
    { id: 1 as ScreenId, name: '1. Welcome & Wi-Fi', icon: <Crown className="h-3.5 w-3.5 text-orange-500" />, comp: <Screen1Welcome /> },
    { id: 2 as ScreenId, name: '2. Menu (2-Col Grid)', icon: <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />, comp: <Screen2Menu /> },
    { id: 3 as ScreenId, name: '3. Item Details', icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" />, comp: <Screen3ItemDetail /> },
    { id: 4 as ScreenId, name: '4. Cart & Stepper', icon: <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />, comp: <Screen4Cart /> },
    { id: 5 as ScreenId, name: '5. Live Tracking', icon: <Clock className="h-3.5 w-3.5 text-indigo-500" />, comp: <Screen5LiveTracking /> },
    { id: 6 as ScreenId, name: '6. Payment Breakdown', icon: <CreditCard className="h-3.5 w-3.5 text-purple-500" />, comp: <Screen6PaymentBreakdown /> },
    { id: 7 as ScreenId, name: '7. Payment Gateway (QR)', icon: <CreditCard className="h-3.5 w-3.5 text-emerald-500" />, comp: <Screen7PaymentGateway /> },
    { id: 8 as ScreenId, name: '8. Confirmation', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />, comp: <Screen8Confirmation /> },
    { id: 9 as ScreenId, name: '9. Digital Tax Bill', icon: <FileText className="h-3.5 w-3.5 text-slate-700" />, comp: <Screen9DigitalBill /> },
    { id: 10 as ScreenId, name: '10. Call Waiter', icon: <Bell className="h-3.5 w-3.5 text-rose-500" />, comp: <Screen10WaiterCall /> },
  ];

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 1:
        return <Screen1Welcome />;
      case 2:
        return <Screen2Menu />;
      case 3:
        return <Screen3ItemDetail />;
      case 4:
        return <Screen4Cart />;
      case 5:
        return <Screen5LiveTracking />;
      case 6:
        return <Screen6PaymentBreakdown />;
      case 7:
        return <Screen7PaymentGateway />;
      case 8:
        return <Screen8Confirmation />;
      case 9:
        return <Screen9DigitalBill />;
      case 10:
        return <Screen10WaiterCall />;
      default:
        return <Screen1Welcome />;
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Console Header */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 py-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm shadow-orange-500/30">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-1.5 py-0.5">
                TAILWIND CSS • FRAMER MOTION • LUCIDE • ZUSTAND • TANSTACK QUERY
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-sm font-black tracking-tight text-slate-900">
                CUSTOMER JOURNEY SKELETON ARCHITECTURE
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[11px] font-black text-emerald-800 font-mono shadow-xs">
                🪑 TABLE {tableNumber} {seatNumber ? `• SEAT ${seatNumber}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Portal Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1 shadow-xs font-mono text-xs font-bold">
            <span className="rounded-xl bg-orange-600 text-white px-3 py-1.5 shadow-xs flex items-center gap-1">
              <Utensils className="h-3.5 w-3.5" />
              <span>CUSTOMER (10)</span>
            </span>
            <Link
              href="/kitchen"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>KITCHEN (3)</span>
            </Link>
            <Link
              href="/waiter"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>WAITER (10)</span>
            </Link>
            <Link
              href="/manager"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>MANAGER (16)</span>
            </Link>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1 shadow-xs">
          <button
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === 'single'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>SINGLE SCREEN FLOW</span>
          </button>
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

      {/* Session Restored Notice Banner */}
      {sessionNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{sessionNotice}</span>
          </div>
          <button
            onClick={() => setSessionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Anti-Hijack Conflict Dialog (Washroom Protection) */}
      {conflictWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-rose-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Seat Currently In Use</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{conflictWarning}</p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => setConflictWarning(null)}
                className="w-full rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
              >
                I am Returning to My Seat
              </button>
              <button
                onClick={() => {
                  useCustomerStore.getState().pingWaiter('GENERAL CALL', 'Table conflict: please clear or reassign chair');
                  setConflictWarning(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                New Diner (Ask Captain to Clear)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Navigation Tabs */}
      <nav className="w-full max-w-7xl mx-auto flex gap-2 overflow-x-auto px-6 py-3 scrollbar-none">
        {screens.map((sc) => {
          const isActive = viewMode === 'single' && currentScreen === sc.id;
          return (
            <motion.button
              key={sc.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentScreen(sc.id);
                if (viewMode !== 'single') setViewMode('single');
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                isActive
                  ? 'border-orange-500 bg-white text-orange-950 ring-2 ring-orange-500/20 shadow-xs'
                  : 'border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span>{sc.icon}</span>
              <span>{sc.name}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Main Container */}
      <div className="flex-1 py-4 px-4">
        {viewMode === 'single' ? (
          <div className="flex justify-center pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1680px] px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center pb-20">
            {screens.map((sc) => (
              <div key={sc.id} className="flex flex-col items-center w-[380px] shrink-0">
                {sc.comp}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
