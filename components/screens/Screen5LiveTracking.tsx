'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { OrderStage } from '../../types/customer';
import { Check, Clock, ChefHat, Sparkles, Star, Plus, ArrowRight, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrderTrackingQuery } from '../../hooks/useOrderTrackingQuery';

export const Screen5LiveTracking: React.FC = () => {
  const {
    setCurrentScreen,
    orderStage,
    setOrderStage,
    itemTracking,
    tableNumber,
  } = useCustomer();

  const { kdsTickets } = useSharedBridge();
  const myTicket = kdsTickets.find((t) => t.tableNumber === tableNumber);

  // Derive live stage directly from kitchen KDS ticket if available!
  const currentStage: OrderStage = myTicket
    ? myTicket.status === 'NEW'
      ? 'PLACED'
      : myTicket.status === 'PREP'
      ? 'PREP'
      : myTicket.status === 'READY'
      ? 'READY'
      : 'SERVED'
    : orderStage;

  const { isFetching: isQuerySyncing } = useOrderTrackingQuery();

  const stages: { key: OrderStage; label: string; icon: string }[] = [
    { key: 'PLACED', label: 'PLACED', icon: '📝' },
    { key: 'PREP', label: 'PREP', icon: '🔥' },
    { key: 'READY', label: 'READY', icon: '🍽️' },
    { key: 'SERVED', label: 'SERVED', icon: '✨' },
  ];

  const getStageIndex = (stage: OrderStage) => {
    switch (stage) {
      case 'PLACED':
        return 0;
      case 'PREP':
        return 1;
      case 'PLATED':
      case 'READY':
        return 2;
      case 'SERVED':
        return 3;
      default:
        return 0;
    }
  };

  const currentIdx = getStageIndex(currentStage);

  return (
    <ScreenHousing screenNumber={5} screenTitle="Live Order Status">
      {/* Header */}
      <WireHeader
        title="Live Order Status"
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Live Tracking 4 Stages */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <span className={`h-1.5 w-1.5 rounded-full ${isQuerySyncing ? 'bg-orange-500 animate-spin' : 'bg-emerald-500 animate-ping'}`} />
              {isQuerySyncing ? 'Syncing Server...' : 'TanStack Query Synced'}
            </span>
          </div>

          <div className="relative flex justify-between px-2 pt-2 pb-1">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-slate-100 -z-0" />
            {/* Active Progress Line */}
            <div
              className="absolute top-6 left-6 h-1 bg-orange-500 transition-all duration-500 -z-0"
              style={{ width: `${(currentIdx / 3) * 85}%` }}
            />

            {stages.map((st, i) => {
              const isPast = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div
                  key={st.key}
                  onClick={() => setOrderStage(st.key)}
                  className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group"
                  title={st.label}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all shadow-xs ${
                      isPast
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100 animate-pulse'
                        : 'border-2 border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4 stroke-[3]" /> : <span>{st.icon}</span>}
                  </motion.div>
                  <span
                    className={`text-[9.5px] font-mono tracking-tight font-extrabold ${
                      isCurrent
                        ? 'text-orange-600'
                        : isPast
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="space-y-2.5">
            {myTicket && myTicket.items.length > 0 ? (
              myTicket.items.map((it) => {
                const displayStage = it.stage === 'PLATED' ? 'READY' : it.stage;
                return (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-slate-100 bg-stone-50/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {it.quantity}x {it.name}
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold whitespace-nowrap ${
                        displayStage === 'SERVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : displayStage === 'READY'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : displayStage === 'PREP'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-stone-100 text-slate-700 border-slate-200'
                      }`}>
                        STATUS: {displayStage}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 font-mono">
                      <ChefHat className="h-3.5 w-3.5 text-orange-500" />
                      <span>PREP MODE: {(it.prepMode || 'POT DUM').toUpperCase()}</span>
                    </div>
                  </div>
                );
              })
            ) : itemTracking.length > 0 ? (
              itemTracking.map((item) => {
                const displayStatus = item.status === 'PLATED' ? 'READY' : item.status;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-stone-50/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {item.name}
                      </span>
                      <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 font-mono text-[9px] font-bold text-orange-700 whitespace-nowrap">
                        STATUS: {displayStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 font-mono">
                      <ChefHat className="h-3.5 w-3.5 text-orange-500" />
                      <span>PREP MODE: {item.prepMode.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-stone-50/50 rounded-2xl border border-dashed border-slate-200">
                <ChefHat className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-700">NO ACTIVE DISHES IN KITCHEN</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Please add and place items from the menu to start tracking.</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-2 pt-1">
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(2)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50/60 py-3 text-xs font-extrabold text-orange-700 hover:bg-orange-100 transition shadow-xs"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>ADD MORE ITEMS TO SAME BILL</span>
            </motion.button>
          </div>
        </div>
      </div>

      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(6)}
          className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:bg-slate-800"
        >
          <span>PROCEED TO PAYMENT 💰</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
