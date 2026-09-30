'use client';

import React from 'react';
import {
  Wifi,
  Battery,
  Bell,
  UserCheck,
  Flame,
  Utensils,
  LayoutGrid,
  UtensilsCrossed,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';

interface WaiterTabletHousingProps {
  children: React.ReactNode;
  screenNumber: number;
  screenTitle: string;
  showKitchenHotline?: boolean;
  className?: string;
}

export const WaiterTabletHousing: React.FC<WaiterTabletHousingProps> = ({
  children,
  screenNumber,
  screenTitle,
  showKitchenHotline = false,
  className = '',
}) => {
  const {
    activeCaptain,
    activeSection,
    callKitchenStation,
    kitchenCallNotice,
    dismissKitchenCall,
    setCurrentScreen,
    orderCart,
    activeToast,
    dismissToast,
    setActiveAlertFilter,
  } = useWaiterStore();

  const {
    waiterResolvePing,
    waiterMarkKitchenItemServed,
    waiterMarkTableFoodServed,
  } = useSharedBridge();

  const cartCount = orderCart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col items-center w-[380px] shrink-0">
      {/* Blueprint Screen Indicator */}
      <div className="mb-2.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1 text-xs font-bold tracking-wider text-slate-700 shadow-sm backdrop-blur">
        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="font-mono text-[11px] text-orange-600 font-extrabold">
          WAITER SCREEN {screenNumber}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-800 font-semibold">{screenTitle}</span>
      </div>

      {/* Modern Floor Captain Tablet Chassis */}
      <div
        className={`phone-mockup relative flex flex-col w-[380px] h-[800px] bg-white border-4 border-slate-800 rounded-[40px] shadow-2xl overflow-hidden ${className}`}
      >
        {/* Status Bar */}
        <div className="flex h-9 w-full items-center justify-between px-5 text-[11px] font-bold text-slate-700 bg-white/95 border-b border-slate-100 z-30 select-none">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-900 font-black">THOOGUDEEPA</span>
          </div>
          <div className="h-3.5 w-16 rounded-full bg-slate-900" />
          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[10px]">
            <Wifi className="h-3 w-3 text-slate-800" />
            <Battery className="h-3 w-3 text-slate-800" />
          </div>
        </div>

        {/* =====================================================
            GLOBAL HEADS-UP NOTIFICATION TOAST
            Visible on ANY screen (Screen 1 to 10), even when waiter
            is working on another table. Provides 1-click Serve,
            Attend, and View Alert with auto-screen navigation!
        ====================================================== */}
        <div className="absolute top-11 left-2.5 right-2.5 z-50 pointer-events-none">
          <AnimatePresence>
            {activeToast && (
              <motion.div
                key={activeToast.id}
                initial={{ y: -60, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 320 }}
                className={`pointer-events-auto w-full rounded-2xl p-3.5 shadow-2xl border-2 text-white overflow-hidden relative backdrop-blur-md ${
                  activeToast.source === 'KITCHEN'
                    ? 'bg-slate-950/95 border-emerald-400 ring-4 ring-emerald-500/25 shadow-emerald-950/50'
                    : activeToast.source === 'CUSTOMER'
                    ? 'bg-slate-950/95 border-orange-400 ring-4 ring-orange-500/25 shadow-orange-950/50'
                    : 'bg-slate-950/95 border-purple-400 ring-4 ring-purple-500/25 shadow-purple-950/50'
                }`}
              >
                {/* Header: Clean Single Line (Icon + Time + Close Button) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 font-mono text-[10.5px] font-black uppercase tracking-wider">
                      {activeToast.source === 'KITCHEN' && <Flame className="h-3.5 w-3.5 text-emerald-400" />}
                      {activeToast.source === 'CUSTOMER' && <Bell className="h-3.5 w-3.5 text-orange-400" />}
                      {activeToast.source === 'MANAGER' && <AlertTriangle className="h-3.5 w-3.5 text-purple-400" />}
                      <span className={
                        activeToast.source === 'KITCHEN'
                          ? 'text-emerald-400'
                          : activeToast.source === 'CUSTOMER'
                          ? 'text-orange-400'
                          : 'text-purple-300'
                      }>
                        {activeToast.source === 'KITCHEN' ? 'Kitchen Alert' : activeToast.source === 'CUSTOMER' ? 'Guest Call' : 'Manager Notice'}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      • ⏱ {activeToast.timestamp}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={dismissToast}
                    className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content: Title & Detail */}
                <div className="space-y-1 mb-3">
                  <div className="font-mono text-sm font-black text-white tracking-tight">
                    {activeToast.title}
                  </div>
                  <p className="font-mono text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {activeToast.detail}
                  </p>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                  {/* View Alert button: Automatically opens Screen 2 and selects the respective alert pill! */}
                  <button
                    type="button"
                    onClick={() => {
                      if (activeToast.source === 'KITCHEN') setActiveAlertFilter('KITCHEN');
                      else if (activeToast.source === 'CUSTOMER') setActiveAlertFilter('CUSTOMER');
                      else if (activeToast.source === 'MANAGER') setActiveAlertFilter('MANAGER');
                      setCurrentScreen(2);
                      dismissToast();
                    }}
                    className="h-8 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-mono text-xs font-bold transition cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    View Alert
                  </button>

                  {/* Immediate Action Button */}
                  {activeToast.source === 'KITCHEN' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeToast.ticketId) {
                          waiterMarkKitchenItemServed(activeToast.ticketId);
                        }
                        if (activeToast.tableNumber) {
                          waiterMarkTableFoodServed(activeToast.tableNumber);
                        }
                        dismissToast();
                      }}
                      className="h-8 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <Utensils className="h-3.5 w-3.5" />
                      <span>Serve Food</span>
                    </button>
                  )}

                  {activeToast.source === 'CUSTOMER' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeToast.pingId) {
                          waiterResolvePing(activeToast.pingId);
                        }
                        dismissToast();
                      }}
                      className="h-8 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Attend</span>
                    </button>
                  )}

                  {activeToast.source === 'MANAGER' && (
                    <button
                      type="button"
                      onClick={dismissToast}
                      className="h-8 px-4 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Understood</span>
                    </button>
                  )}
                </div>

                {/* Animated Countdown Progress Bar at Bottom */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 8, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
                    activeToast.source === 'KITCHEN'
                      ? 'bg-emerald-400'
                      : activeToast.source === 'CUSTOMER'
                      ? 'bg-orange-400'
                      : 'bg-purple-400'
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kitchen Hotline Toast */}
        {showKitchenHotline && kitchenCallNotice && (
          <div className="bg-slate-900 text-white text-[10.5px] font-bold px-3 py-1.5 flex items-center justify-between z-30 border-b border-slate-700">
            <span className="truncate">⚡ {kitchenCallNotice}</span>
            <button
              onClick={dismissKitchenCall}
              className="text-[9.5px] text-slate-400 hover:text-white underline ml-1"
            >
              x
            </button>
          </div>
        )}

        {/* Interior Canvas */}
        <div className="flex-1 overflow-y-auto bg-stone-50/70 text-slate-900 flex flex-col relative">
          {children}
        </div>

        {/* Mobile Quick Jump Dock with Icons (Active when Logged In: Screens 2 to 6) */}
        {screenNumber !== 1 && (
          <div className="h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 flex items-center justify-around select-none shrink-0 z-30 shadow-lg">
            {/* 1. FLOOR */}
            <button
              type="button"
              onClick={() => setCurrentScreen(2)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer active:scale-95 ${
                screenNumber === 2 || screenNumber === 3
                  ? 'text-orange-600 font-extrabold scale-105 bg-orange-50/70'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-[9.5px] font-mono leading-none">Floor</span>
            </button>

            {/* 2. ORDER */}
            <button
              type="button"
              onClick={() => setCurrentScreen(4)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer active:scale-95 ${
                screenNumber === 4
                  ? 'text-orange-600 font-extrabold scale-105 bg-orange-50/70'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-[9.5px] font-mono leading-none">Order</span>
            </button>

            {/* 3. PAY */}
            <button
              type="button"
              onClick={() => setCurrentScreen(5)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer active:scale-95 ${
                screenNumber === 5 || screenNumber === 7 || screenNumber === 8 || screenNumber === 9
                  ? 'text-orange-600 font-extrabold scale-105 bg-orange-50/70'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-[9.5px] font-mono leading-none">Pay</span>
            </button>

            {/* 4. SHIFT */}
            <button
              type="button"
              onClick={() => setCurrentScreen(6)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer active:scale-95 ${
                screenNumber === 6 || screenNumber === 10
                  ? 'text-orange-600 font-extrabold scale-105 bg-orange-50/70'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-[9.5px] font-mono leading-none">Shift</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
