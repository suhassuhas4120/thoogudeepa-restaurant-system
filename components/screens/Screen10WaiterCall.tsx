'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { WaiterPingType } from '../../types/customer';
import { Droplets, Scroll, Utensils, Sparkles, Bell, Send, CheckCircle2, ArrowRight, ArrowLeft, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen10WaiterCall: React.FC = () => {
  const { navigateTo, previousScreen, pingWaiter, waiterNotification, tableNumber } = useCustomer();
  const { pings } = useSharedBridge();
  const activePing = pings.find((p) => p.tableNumber === tableNumber);
  const [customText, setCustomText] = useState('');

  const handlePing = (type: WaiterPingType) => {
    pingWaiter(type);
  };

  const handleSendCustomText = () => {
    if (!customText.trim()) return;
    pingWaiter('GENERAL CALL', customText.trim());
    setCustomText('');
  };

  const pingButtons: { type: WaiterPingType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'WATER',
      label: '[WATER]',
      icon: <Droplets className="h-6 w-6 text-blue-500" />,
      color: 'hover:border-blue-300 hover:bg-blue-50/50',
    },
    {
      type: 'TISSUE',
      label: '[TISSUE]',
      icon: <Scroll className="h-6 w-6 text-slate-500" />,
      color: 'hover:border-slate-400 hover:bg-slate-50',
    },
    {
      type: 'CUTLERY',
      label: '[CUTLERY]',
      icon: <Utensils className="h-6 w-6 text-amber-500" />,
      color: 'hover:border-amber-300 hover:bg-amber-50/50',
    },
    {
      type: 'TABLE CLEAN',
      label: '[TABLE CLEAN]',
      icon: <Sparkles className="h-6 w-6 text-emerald-500" />,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    },
  ];

  const returnTarget = previousScreen && previousScreen !== 10 ? previousScreen : 2;

  return (
    <ScreenHousing screenNumber={10} screenTitle="CUSTOMER WAITER CALL PAGE">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateTo(returnTarget)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
        <div className="text-sm font-extrabold tracking-tight text-slate-900">
          [CUSTOMER WAITER CALL PAGE]
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description */}
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-0.5">
            [READY REQUEST BUTTONS (ONE-TAP PINGS)]
          </div>
          <p className="text-xs font-medium text-slate-500">
            Select a request below for immediate server notification:
          </p>
        </div>

        {/* Ready Request Grid: Water, Tissue, Cutlery, Table Clean, Call */}
        <div className="grid grid-cols-2 gap-2.5">
          {pingButtons.map((btn) => (
            <motion.button
              key={btn.type}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePing(btn.type)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition ${btn.color}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50">
                {btn.icon}
              </div>
              <span className="font-mono text-xs font-black text-slate-800">
                {btn.label}
              </span>
            </motion.button>
          ))}

          {/* Full-width General Call button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePing('GENERAL CALL')}
            className="col-span-2 flex items-center justify-center gap-2.5 rounded-2xl bg-orange-600 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
          >
            <Bell className="h-4 w-4 stroke-[2.5]" />
            <span>[CALL WAITER TO TABLE]</span>
          </motion.button>
        </div>

        {/* Custom Text Option to Waiter */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            [CUSTOM TEXT OPTION TO WAITER]
          </div>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="[TYPE CUSTOM NOTE OR SPECIAL ASSISTANCE REQUEST...]"
            className="w-full rounded-xl border border-slate-200 bg-stone-50/60 p-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none resize-none"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSendCustomText}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-stone-100 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-stone-200 transition"
          >
            <Send className="h-3.5 w-3.5 text-orange-600" />
            <span>[SEND CUSTOM MESSAGE TO WAITER]</span>
          </motion.button>
        </div>

        {/* Real-Time Request Status Confirmation */}
        {activePing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-2xl border border-orange-300 bg-orange-50/90 p-3.5 text-center shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-orange-900">
              <span className="h-2 w-2 rounded-full bg-orange-600 animate-ping" />
              <span>[TRANSMITTED TO FLOOR SERVERS: {activePing.type}]</span>
            </div>
            <div className="text-[10.5px] font-medium text-orange-700 mt-0.5 font-mono">
              Table [{tableNumber}] • Server handheld vibrating • Est response: &lt; 2 mins
            </div>
          </motion.div>
        ) : waiterNotification?.active ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-2xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-center shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>✓ [REQUEST RESOLVED BY FLOOR CAPTAIN]</span>
            </div>
            <div className="text-[10.5px] font-medium text-emerald-700 mt-0.5">
              Request for [{waiterNotification.type}] has been attended to at Table {tableNumber}!
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Bottom Sticky: Back to Dining Menu or Previous Screen */}
      <StickyBottomBar>
        <div className="flex gap-2">
          {returnTarget !== 2 && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo(returnTarget)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition shadow-xs"
            >
              <span>↩ [BACK TO SCREEN {returnTarget}]</span>
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo(2)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:bg-slate-800 transition"
          >
            <span>➔ [RETURN TO DINING MENU]</span>
          </motion.button>
        </div>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
