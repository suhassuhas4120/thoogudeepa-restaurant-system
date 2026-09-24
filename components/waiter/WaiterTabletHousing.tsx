'use client';

import React from 'react';
import { Wifi, Battery, Bell, UserCheck, Flame, Utensils } from 'lucide-react';
import { useWaiterStore } from '../../store/useWaiterStore';

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
  showKitchenHotline = screenNumber !== 1,
  className = '',
}) => {
  const {
    activeCaptain,
    activeSection,
    callKitchenStation,
    kitchenCallNotice,
    dismissKitchenCall,
  } = useWaiterStore();

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

        {/* Waiter Sub-Header with Station & Kitchen Hotline */}
        <div className="h-8 bg-stone-100 border-b border-slate-200 px-4 flex items-center justify-between text-[10px] font-bold font-mono text-slate-600 select-none shrink-0 z-20">
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="h-3 w-3 text-orange-600" />
            <span className="truncate">{activeCaptain || 'Captain'}</span>
            <span className="text-slate-300">•</span>
            <span>{activeSection}</span>
          </div>
          {showKitchenHotline && (
            <button
              onClick={() => callKitchenStation('KITCHEN DISPATCH HOTLINE')}
              className="flex items-center gap-1 rounded bg-orange-600 text-white px-1.5 py-0.5 text-[9.5px] hover:bg-orange-700 transition"
            >
              <Flame className="h-2.5 w-2.5 fill-white" />
              <span>KITCHEN</span>
            </button>
          )}
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
      </div>
    </div>
  );
};
