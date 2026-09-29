'use client';

import React from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import {
  ArrowLeft,
  TrendingUp,
  Clock3,
  Users,
  IndianRupee,
  CreditCard,
  Wallet,
  Banknote,
  ReceiptText,
  Activity,
  LogOut,
} from 'lucide-react';

const KPI_CARDS = [
  {
    label: '[TOTAL ORDERS DONE TODAY VIA TAB]',
    value: '24',
    sub: '[ACROSS 10 UNIQUE TABLES]',
    icon: ReceiptText,
  },
  {
    label: '[TOTAL PAYMENTS PROCESSED]',
    value: '₹ 18,450',
    sub: '[ALL PAYMENT MODES COMBINED]',
    icon: IndianRupee,
  },
  {
    label: '[TOTAL CASH COLLECTED]',
    value: '₹ 7,200',
    sub: '[READY FOR HANDOVER]',
    icon: Banknote,
  },
  {
    label: '[DIGITAL / UPI SETTLEMENTS]',
    value: '₹ 11,250',
    sub: '[INSTANT RECONCILIATION]',
    icon: CreditCard,
  },
  {
    label: '[TOTAL TIPS EARNED TODAY]',
    value: '₹ 1,420',
    sub: '[DIRECT WAITER TIP ACCRUAL]',
    icon: Wallet,
  },
  {
    label: '[AVG TABLE TURNAROUND TIME]',
    value: '38 MINS',
    sub: '[EFFICIENCY BENCHMARK]',
    icon: Clock3,
  },
];

const TIMELINE = [
  {
    time: '12:52 PM',
    table: 'TABLE 04',
    amount: '₹ 1,450.00',
    mode: 'CASH',
  },
  {
    time: '12:20 PM',
    table: 'TABLE 02',
    amount: '₹ 2,100.00',
    mode: 'UPI QR',
  },
  {
    time: '11:45 AM',
    table: 'TABLE 07',
    amount: '₹ 980.00',
    mode: 'CARD POS',
  },
  {
    time: '11:20 AM',
    table: 'TABLE 09',
    amount: '₹ 1,875.00',
    mode: 'UPI QR',
  },
  {
    time: '10:55 AM',
    table: 'TABLE 01',
    amount: '₹ 560.00',
    mode: 'CASH',
  },
];

export const TabletScreen10ShiftStats: React.FC = () => {
  const { setCurrentScreen, activeCaptain, activeSection } =
    useWaiterStore();

  const shiftStats = useSharedBridge((s) => s.shiftStats);

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={10}
      screenTitle="WAITER DAILY SHIFT PERFORMANCE OVERVIEW"
    >
      <div className="flex flex-col flex-1 min-h-[700px] bg-slate-50 font-mono select-none overflow-y-auto">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="sticky top-0 z-20 bg-white border-b-2 border-slate-800 px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentScreen(2)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-black text-xs transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>BACK </span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700">
                SHIFT ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CONTENT */}
        {/* ========================================================= */}

        <div className="p-4 sm:p-5 space-y-4">
          {/* ======================================================= */}
          {/* CAPTAIN PROFILE */}
          {/* ======================================================= */}

          <div className="bg-white border-2 border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-sm">
                  {activeCaptain.charAt(0)}
                </div>

                <div>
                  <div className="text-base font-black text-slate-950">
                    {activeCaptain}
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-1">
                    {activeSection} • Morning Shift A
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    08:00 AM – 04:00 PM
                  </div>
                </div>
              </div>

              {/* Shift Status */}
              <div className="sm:ml-auto">
                <div className="inline-flex items-center gap-2 border-2 border-emerald-200 bg-emerald-50 rounded-xl px-3 py-2.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />

                  <div>
                    <div className="text-[10px] font-black text-emerald-700">
                      [SHIFT ACTIVE]
                    </div>

                    <div className="text-[10px] font-bold text-emerald-600">
                      5h 32m elapsed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* SHIFT ANNOUNCEMENT */}
          {/* ======================================================= */}

          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4" />

              <span className="text-[10px] font-black uppercase tracking-wide text-slate-300">
                Active Shift Announcement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-slate-700 bg-slate-800 rounded-lg p-3">
                <div className="text-[9px] font-bold text-slate-400">
                  SHIFT
                </div>

                <div className="text-xs font-black mt-1">
                  Shift A
                </div>

                <div className="text-[10px] text-slate-300 mt-1">
                  08:00 AM – 04:00 PM
                </div>
              </div>

              <div className="border border-slate-700 bg-slate-800 rounded-lg p-3">
                <div className="text-[9px] font-bold text-slate-400">
                  ASSIGNED ZONE
                </div>

                <div className="text-xs font-black mt-1">
                  Main Dining Hall
                </div>

                <div className="text-[10px] text-slate-300 mt-1">
                  Section A & B
                </div>
              </div>

              <div className="border border-slate-700 bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-300" />

                  <div className="text-[9px] font-bold text-slate-400">
                    TABLES UNDER MANAGEMENT
                  </div>
                </div>

                <div className="text-xl font-black mt-1">
                  16
                </div>

                <div className="text-[10px] text-slate-300">
                  Active Tables
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* KPI SECTION HEADER */}
          {/* ======================================================= */}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-950">
                SHIFT PERFORMANCE
              </h3>

              {/* <p className="text-[9px] font-bold text-slate-400 mt-1">
                TODAY'S WAITER TERMINAL ACTIVITY
              </p> */}
            </div>

            <div className="border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-[9px] font-black text-slate-500">
              LIVE METRICS
            </div>
          </div>

          {/* ======================================================= */}
          {/* KPI CARDS */}
          {/* ======================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {KPI_CARDS.map((card, idx) => {
              const Icon = card.icon;

              return (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase leading-tight">
                        {card.label}
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-3 leading-none">
                        {card.value}
                      </div>

                      <div className="text-[9px] font-bold text-slate-400 mt-2">
                        {card.sub}
                      </div>
                    </div>

                    <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================= */}
          {/* ACTIVITY TIMELINE */}
          {/* ======================================================= */}

          <div className="bg-white border-2 border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-950">
                  [TODAY'S SHIFT ACTIVITY TIMELINE]
                </div>

                <div className="text-[9px] font-bold text-slate-400 mt-1">
                  RECENTLY SETTLED TABLES
                </div>
              </div>

              <Clock3 className="h-4 w-4 text-slate-500" />
            </div>

            {/* Timeline */}
            <div className="p-3">
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 px-3 py-2 text-[9px] font-black text-slate-400 uppercase">
                <span>Time / Table</span>
                <span>Amount</span>
                <span>Payment Mode</span>
                <span>Status</span>
              </div>

              <div className="space-y-2">
                {TIMELINE.map((row, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    {/* Desktop */}
                    <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                      <div>
                        <div className="text-xs font-black text-slate-950">
                          {row.table}
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 mt-1">
                          {row.time}
                        </div>
                      </div>

                      <div className="text-xs font-black text-slate-900">
                        {row.amount}
                      </div>

                      <div className="text-[10px] font-black text-slate-600">
                        {row.mode}
                      </div>

                      <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-2.5 py-1 text-[9px] font-black text-center">
                        SETTLED
                      </div>
                    </div>

                    {/* Mobile / Small Tablet */}
                    <div className="sm:hidden">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="text-xs font-black text-slate-950">
                            {row.table}
                          </div>

                          <div className="text-[10px] font-bold text-slate-400 mt-1">
                            {row.time}
                          </div>
                        </div>

                        <div className="text-sm font-black text-slate-950">
                          {row.amount}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-slate-200">
                        <span className="text-[10px] font-black text-slate-500">
                          {row.mode}
                        </span>

                        <span className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 text-[9px] font-black">
                          SETTLED
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* CLOSE SHIFT */}
          {/* ======================================================= */}

          <button
            onClick={() => setCurrentScreen(1)}
            className="w-full border-2 border-slate-800 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 rounded-2xl py-4 px-4 font-black text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="h-4 w-4" />

            <span>
              CLOSE SHIFT & LOG OUT 
            </span>
          </button>

          <div className="text-center pb-2">
            {/* <span className="text-[8px] font-bold text-slate-400">
              WAITER TERMINAL • SHIFT PERFORMANCE CONSOLE
            </span> */}
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};