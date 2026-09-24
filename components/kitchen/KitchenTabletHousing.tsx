'use client';

import React from 'react';
import { Wifi, Bell, Flame, ChefHat } from 'lucide-react';
import { useKitchenStore } from '../../store/useKitchenStore';

interface KitchenTabletHousingProps {
  children: React.ReactNode;
  screenNumber: number;
  screenTitle: string;
  className?: string;
}

export const KitchenTabletHousing: React.FC<KitchenTabletHousingProps> = ({
  children,
  screenNumber,
  screenTitle,
  className = '',
}) => {
  const {
    activeStation,
    chefName,
    callFloorWaiter,
    waiterAlertNotice,
    dismissWaiterAlert,
  } = useKitchenStore();

  return (
    <div className="flex flex-col items-center w-full max-w-[1080px] shrink-0">
      {/* Blueprint Screen Indicator */}
      <div className="mb-2.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1 text-xs font-bold tracking-wider text-slate-700 shadow-sm backdrop-blur">
        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="font-mono text-[11px] text-orange-600 font-extrabold">
          KDS SCREEN {screenNumber}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-800 font-semibold">{screenTitle}</span>
      </div>

      {/* Industrial Landscape Tablet Bezel */}
      <div
        className={`relative flex flex-col w-full h-[700px] bg-slate-900 border-[10px] border-slate-800 rounded-[28px] shadow-2xl overflow-hidden ${className}`}
      >
        {/* Tablet Top Camera & Sensor Bar */}
        <div className="h-4 bg-slate-800 flex items-center justify-center gap-2 px-4 select-none">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-700 border border-slate-600" />
          <div className="h-1 w-4 rounded-full bg-slate-700" />
        </div>

        {/* KDS Tablet Status Header */}
        <header className="h-11 bg-white border-b border-slate-200 px-5 flex items-center justify-between text-xs font-bold select-none shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-orange-700 font-black font-mono">
              <Flame className="h-4 w-4 text-orange-600 fill-orange-500" />
              <span>THOOGUDEEPA KDS</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="rounded-md border border-slate-200 bg-stone-50 px-2 py-0.5 text-[10.5px] font-mono text-slate-700">
              STATION: {activeStation}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <ChefHat className="h-3.5 w-3.5 text-slate-500" />
              <span>{chefName}</span>
            </div>
            <button
              onClick={() => callFloorWaiter('ALL', 'Kitchen Dispatch Calling')}
              className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10.5px] font-extrabold text-orange-800 hover:bg-orange-100 transition shadow-2xs"
            >
              <Bell className="h-3 w-3 text-orange-600" />
              <span>Call Waiter</span>
            </button>
            <div className="flex items-center gap-1 text-emerald-600 font-mono text-[10px] font-bold">
              <Wifi className="h-3.5 w-3.5" />
              <span>ONLINE</span>
            </div>
          </div>
        </header>

        {/* Waiter Alert Notification Toast */}
        {waiterAlertNotice && (
          <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 flex items-center justify-between z-30 border-b border-slate-700">
            <span>⚡ {waiterAlertNotice}</span>
            <button
              onClick={dismissWaiterAlert}
              className="text-[10px] text-slate-400 hover:text-white underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Canvas Interior */}
        <div className="flex-1 bg-stone-50 text-slate-900 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};
