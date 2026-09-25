'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { STATION_LABELS } from '../../types/kitchen';
import {
  User,
  LogOut,
  X,
  Clock,
  Building2,
  Hash,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KitchenProfileDropdown: React.FC = () => {
  const {
    chefName,
    activeStation,
    shiftStartTime,
    resetForSignOut,
  } = useKitchenStore();

  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setConfirmSignOut(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setConfirmSignOut(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const displayName = chefName?.trim() || 'Kitchen Staff';
  const initial = displayName.charAt(0).toUpperCase();
  const shiftTime = shiftStartTime || '--:--';

  const handleConfirmSignOut = () => {
    setConfirmSignOut(false);
    setOpen(false);
    resetForSignOut();
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Profile trigger button */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setConfirmSignOut(false);
        }}
        className={`flex items-center gap-2 rounded-xl border px-2.5 py-1 transition shadow-2xs cursor-pointer ${
          open
            ? 'border-orange-400 bg-orange-50'
            : 'border-slate-200 bg-white hover:bg-stone-50'
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white font-black text-[11px] shadow-sm">
          {initial}
        </div>
        <div className="hidden md:flex flex-col items-start leading-none text-left">
          <span className="font-mono text-[10.5px] font-black text-slate-800">
            {displayName}
          </span>
          <span className="font-mono text-[9px] text-slate-500 font-bold">
            {STATION_LABELS[activeStation] || 'Master Dispatch'}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_#0f172a] overflow-hidden z-50"
          >
            {/* Header block */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 px-4 py-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-orange-700 font-black text-base shadow-sm">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="font-black text-white text-sm truncate">
                  {displayName}
                </div>
                <div className="font-mono text-[10px] text-orange-100 font-bold">
                  KITCHEN STAFF
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <Building2 className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <span className="text-slate-500 font-bold">STATION:</span>
                <span className="text-slate-900 font-black">
                  {STATION_LABELS[activeStation] || 'Master Dispatch'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <Hash className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <span className="text-slate-500 font-bold">TERMINAL:</span>
                <span className="text-slate-900 font-black">
                  KDS Terminal #01
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <Clock className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <span className="text-slate-500 font-bold">
                  SHIFT STARTED:
                </span>
                <span className="text-slate-900 font-black">{shiftTime}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 font-black">
                  STATUS: ONLINE
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Sign out or confirm */}
            <div className="p-3">
              {!confirmSignOut ? (
                <button
                  onClick={() => setConfirmSignOut(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-2.5 font-mono text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>[SIGN OUT]</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-[10.5px] font-bold text-rose-800 text-center">
                    Sign out of KDS Terminal?
                    <br />
                    You will need to re-enter PIN.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmSignOut(false)}
                      className="flex-1 rounded-lg border border-slate-300 bg-stone-50 py-2 font-mono text-[10.5px] font-black text-slate-700 hover:bg-stone-100 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmSignOut}
                      className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-2 font-mono text-[10.5px] font-black uppercase transition shadow-sm cursor-pointer"
                    >
                      YES, SIGN OUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
