'use client';

import React from 'react';
import { Wifi, Battery, UserCheck, Flame, ShoppingCart } from 'lucide-react';
import { useWaiterStore } from '../../../store/useWaiterStore';

interface WaiterTabletLandscapeHousingProps {
  children: React.ReactNode;
  screenNumber: number;
  screenTitle: string;
  showKitchenHotline?: boolean;
  className?: string;
}

export const WaiterTabletLandscapeHousing: React.FC<WaiterTabletLandscapeHousingProps> = ({
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
    orderCart,
    setCurrentScreen,
  } = useWaiterStore();

  const cartCount = orderCart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full max-w-[1260px] mx-auto flex flex-col items-center">
      {/* Blueprint Screen Indicator */}
      <div className="mb-3 flex items-center gap-2 rounded-full border border-slate-300 bg-white/95 px-4 py-1 text-xs font-bold tracking-wider text-slate-700 shadow-xs backdrop-blur font-mono">
        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-orange-600 font-extrabold">
          TABLET SCREEN {screenNumber}:
        </span>
        <span className="text-slate-900 uppercase font-black">{screenTitle}</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500 text-[10.5px]">10&quot; INDUSTRIAL TABLET (1024x768 / 16:10)</span>
      </div>

      {/* 10" Landscape Tablet Bezel */}
      <div
        className={`w-full bg-[#0f172a] border-[14px] border-[#1e293b] rounded-[28px] shadow-2xl overflow-hidden flex flex-col min-h-[760px] relative ${className}`}
      >
        {/* Tablet Top Notch (Camera & Ambient Sensor) */}
        <div className="h-4 bg-[#1e293b] flex items-center justify-center gap-3 select-none shrink-0">
          <div className="w-4 h-1 bg-[#334155] rounded-full" />
          <div className="w-2 h-2 bg-[#334155] rounded-full border border-[#475569]" />
        </div>

        {/* Tablet Status & Control Header */}
        <div className="h-10 bg-white border-b-2 border-slate-800 px-5 flex items-center justify-between text-xs font-bold font-mono text-slate-800 select-none shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-950 font-black tracking-wide text-xs">
                THOOGUDEEPA DONNE BIRYANI MANE
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-700 font-bold">
              FLOOR CAPTAIN TABLET TERMINAL
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <UserCheck className="h-3.5 w-3.5 text-orange-600" />
              <span className="font-bold">{activeCaptain || 'Captain'}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{activeSection}</span>
            </div>

            {showKitchenHotline && (
              <button
                onClick={() => callKitchenStation('KITCHEN DISPATCH HOTLINE')}
                className="flex items-center gap-1 rounded bg-orange-600 text-white px-2.5 py-1 text-[10.5px] font-bold hover:bg-orange-700 transition shadow-xs cursor-pointer"
              >
                <Flame className="h-3 w-3 fill-white" />
                <span>KITCHEN HOTLINE</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-slate-600 border-l border-slate-300 pl-3">
              <Wifi className="h-3.5 w-3.5 text-slate-800" />
              <Battery className="h-3.5 w-3.5 text-slate-800" />
              <span className="font-mono text-[10.5px]">100%</span>
            </div>
          </div>
        </div>

        {/* Kitchen Hotline Toast Alert */}
        {showKitchenHotline && kitchenCallNotice && (
          <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 flex items-center justify-between z-30 border-b border-slate-700">
            <span className="truncate">⚡ HOTLINE ALERT: {kitchenCallNotice}</span>
            <button
              onClick={dismissKitchenCall}
              className="text-xs text-slate-400 hover:text-white underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tablet Interior Canvas */}
        <div className="flex-1 bg-[#f8fafc] text-slate-900 flex flex-col overflow-y-auto relative">
          {children}
        </div>
      </div>
    </div>
  );
};
