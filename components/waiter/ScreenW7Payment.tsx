'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
  CheckCircle2,
  Camera,
  ShieldCheck,
  RefreshCw,
  Clock,
  Zap,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenW7Payment: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber } = useWaiterStore();
  const { tables, waiterRecordsPayment } = useSharedBridge();

  const [method, setMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [tip, setTip] = useState(50);
  const [success, setSuccess] = useState(false);

  // UPI specific states
  const [upiView, setUpiView] = useState<'SHOW_QR' | 'SCAN_CAMERA'>('SHOW_QR');
  const [upiVerified, setUpiVerified] = useState(false);

  // Card specific states
  const [posAuthCode, setPosAuthCode] = useState('');
  const [cardAuthorized, setCardAuthorized] = useState(false);

  // Cash specific states
  const currentTableNum = selectedTableNumber || 'A-04';
  const activeTable = tables.find((t) => t.number === currentTableNum) || tables[0];
  const billAmount = activeTable?.currentBill || 0;
  const subtotal = Math.round(billAmount / 1.05);
  const tax = billAmount - subtotal;
  const total = billAmount + (billAmount > 0 ? tip : 0);

  const [cashReceived, setCashReceived] = useState<number>(total);

  const handlePay = () => {
    waiterRecordsPayment(activeTable?.number || currentTableNum, method, total);
    setSuccess(true);
    setTimeout(() => {
      setCurrentScreen(8);
    }, 1200);
  };

  const handleSimulateUpi = () => {
    setUpiVerified(true);
  };

  const handleSimulateCard = () => {
    setPosAuthCode(`AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
    setCardAuthorized(true);
  };

  return (
    <WaiterTabletHousing screenNumber={7} screenTitle="BILL SETTLEMENT & PAYMENT COLLECTION">
      <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3 overflow-y-auto">
        <div className="space-y-2.5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(3)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Table</span>
            </button>
            <span className="font-mono text-xs font-black text-slate-900">
              Table: {currentTableNum}
            </span>
          </div>

          {/* Amount Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs text-center">
            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Collection Amount
            </div>
            <div className="font-mono text-2xl font-black text-orange-600 mt-0.5">
              ₹ {total}
            </div>
            <div className="font-mono text-[10.5px] text-slate-500 mt-0.5">
              Net Subtotal: ₹{subtotal} + 5% GST: ₹{tax} + Tip: ₹{tip}
            </div>
          </div>

          {/* 3-Tab Payment Method Switcher */}
          <div>
            <div className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Settlement Method
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'UPI' as const, name: 'UPI QR', icon: <QrCode className="h-3.5 w-3.5" /> },
                { id: 'CARD' as const, name: 'Card POS', icon: <CreditCard className="h-3.5 w-3.5" /> },
                { id: 'CASH' as const, name: 'Cash', icon: <Banknote className="h-3.5 w-3.5" /> },
              ].map((m) => {
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 font-mono text-[11px] font-bold transition cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'border-orange-500 bg-orange-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── DYNAMIC PAYMENT WORKSPACE BASED ON METHOD ─────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            {/* 1. UPI QR & SCANNER WORKSPACE */}
            {method === 'UPI' && (
              <div className="space-y-2.5">
                {/* UPI Sub-Mode Switcher */}
                <div className="flex bg-stone-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUpiView('SHOW_QR')}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-[10.5px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                      upiView === 'SHOW_QR'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Show Merchant QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiView('SCAN_CAMERA')}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-[10.5px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                      upiView === 'SCAN_CAMERA'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Camera Scanner</span>
                  </button>
                </div>

                {upiView === 'SHOW_QR' ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 py-1">
                    {/* Visual Dynamic Merchant QR Code */}
                    <div className="relative p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                      {/* Corner Targets */}
                      <div className="relative w-36 h-36 border border-dashed border-slate-300 bg-stone-50 rounded-xl flex flex-col items-center justify-center p-2">
                        {/* QR Code SVG Aesthetic Simulation */}
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          {/* Corner Squares */}
                          <rect x="5" y="5" width="26" height="26" rx="4" />
                          <rect x="9" y="9" width="18" height="18" fill="white" />
                          <rect x="13" y="13" width="10" height="10" />

                          <rect x="69" y="5" width="26" height="26" rx="4" />
                          <rect x="73" y="9" width="18" height="18" fill="white" />
                          <rect x="77" y="13" width="10" height="10" />

                          <rect x="5" y="69" width="26" height="26" rx="4" />
                          <rect x="9" y="73" width="18" height="18" fill="white" />
                          <rect x="13" y="77" width="10" height="10" />

                          {/* Data Matrix Dots */}
                          <rect x="36" y="8" width="8" height="8" rx="1" />
                          <rect x="48" y="8" width="6" height="6" rx="1" />
                          <rect x="58" y="12" width="6" height="6" rx="1" />
                          <rect x="36" y="22" width="6" height="6" rx="1" />
                          <rect x="48" y="24" width="8" height="8" rx="1" />
                          <rect x="58" y="24" width="6" height="6" rx="1" />

                          <rect x="8" y="36" width="6" height="6" rx="1" />
                          <rect x="20" y="36" width="8" height="8" rx="1" />
                          <rect x="34" y="36" width="6" height="6" rx="1" />
                          <rect x="46" y="36" width="8" height="8" rx="1" />
                          <rect x="60" y="36" width="6" height="6" rx="1" />
                          <rect x="72" y="36" width="8" height="8" rx="1" />
                          <rect x="86" y="36" width="6" height="6" rx="1" />

                          <rect x="8" y="48" width="8" height="8" rx="1" />
                          <rect x="22" y="48" width="6" height="6" rx="1" />
                          <rect x="72" y="48" width="6" height="6" rx="1" />
                          <rect x="84" y="48" width="8" height="8" rx="1" />

                          <rect x="36" y="58" width="6" height="6" rx="1" />
                          <rect x="48" y="58" width="8" height="8" rx="1" />
                          <rect x="60" y="58" width="6" height="6" rx="1" />
                          <rect x="36" y="72" width="8" height="8" rx="1" />
                          <rect x="48" y="74" width="6" height="6" rx="1" />
                          <rect x="60" y="72" width="8" height="8" rx="1" />
                          <rect x="74" y="72" width="6" height="6" rx="1" />
                          <rect x="86" y="74" width="6" height="6" rx="1" />
                          <rect x="74" y="86" width="8" height="8" rx="1" />
                          <rect x="86" y="86" width="6" height="6" rx="1" />
                        </svg>

                        {/* Center Brand Badge */}
                        <div className="absolute inset-0 m-auto h-7 w-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                          🍗
                        </div>
                      </div>

                      {/* Scan Tag */}
                      <span className="font-mono text-[9px] font-black text-slate-800 mt-1 uppercase tracking-wider">
                        Scan to Pay ₹{total}
                      </span>
                    </div>

                    {/* Supported Apps Badge */}
                    <div className="text-[10px] font-mono font-bold text-slate-500">
                      GPay • PhonePe • Paytm • BHIM • Cred
                    </div>

                    {/* Timer & Status */}
                    <div className="flex items-center justify-between w-full font-mono text-[10px] px-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Valid: 04:52 mins</span>
                      </span>
                      {upiVerified ? (
                        <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Payment Verified ✓
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                          ● Waiting for Guest Scan
                        </span>
                      )}
                    </div>

                    {/* Simulate Payment Confirmation */}
                    {!upiVerified && (
                      <button
                        type="button"
                        onClick={handleSimulateUpi}
                        className="w-full py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Zap className="h-3 w-3 text-amber-600" />
                        <span>Simulate Guest Scanned &amp; Paid</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
                    {/* Simulated Camera Scanner Viewfinder */}
                    <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center p-3 text-white">
                      {/* Laser Scanning Animation */}
                      <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />

                      {/* Viewfinder Target Box */}
                      <div className="w-28 h-28 border-2 border-emerald-400/80 rounded-xl flex items-center justify-center relative">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />
                        <Camera className="h-6 w-6 text-emerald-400/60" />
                      </div>

                      <span className="font-mono text-[9.5px] font-bold text-emerald-300 mt-2">
                        {upiVerified ? '✓ Customer QR Code Recognized!' : 'Align Customer QR inside camera frame'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateUpi}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{upiVerified ? 'QR Captured & Verified ✓' : 'Capture & Verify Customer Code'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. CARD POS TERMINAL WORKSPACE */}
            {method === 'CARD' && (
              <div className="space-y-2.5 py-1">
                {/* POS Machine Header */}
                <div className="border border-slate-200 bg-stone-50 rounded-xl p-2.5 flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                    <span>PineLabs EDC Machine #POS-03</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
                    Connected
                  </span>
                </div>

                {/* Card Terminal Graphic / Prompt */}
                <div className="border-2 border-dashed border-slate-300 bg-stone-50 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="h-10 w-16 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-xs">
                    <CreditCard className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-900 block font-mono">
                      Insert, Swipe or Tap NFC Card
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Charge: ₹{total}.00 • Visa / Mastercard / RuPay
                    </span>
                  </div>
                </div>

                {/* POS Auth Reference ID Input */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 mb-1">
                    <span>POS TRANSACTION AUTH CODE:</span>
                    <button
                      type="button"
                      onClick={handleSimulateCard}
                      className="text-orange-600 underline cursor-pointer"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={posAuthCode}
                    onChange={(e) => {
                      setPosAuthCode(e.target.value);
                      setCardAuthorized(Boolean(e.target.value));
                    }}
                    placeholder="e.g. AUTH-982341"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                {cardAuthorized && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-[10.5px] font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Card Approved via PineLabs Countertop Terminal ✓</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. CASH TENDER WORKSPACE */}
            {method === 'CASH' && (
              <div className="space-y-2.5 py-1">
                <div className="border border-slate-200 bg-stone-50 rounded-xl p-2.5 flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-slate-600">CASH TENDER PAYABLE:</span>
                  <span className="font-black text-slate-900 text-xs">₹ {total}</span>
                </div>

                {/* Quick Tender Currency Presets */}
                <div>
                  <span className="font-mono text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
                    Quick Currency Presets:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: `Exact (₹${total})`, val: total },
                      { label: '₹500', val: 500 },
                      { label: '₹1000', val: 1000 },
                      { label: '₹2000', val: 2000 },
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashReceived(btn.val)}
                        className={`py-1.5 px-1 rounded-lg border font-mono text-[10px] font-bold transition cursor-pointer text-center ${
                          cashReceived === btn.val
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-stone-50'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Tendered Input */}
                <div>
                  <label className="block font-mono text-[10px] font-bold text-slate-600 mb-1">
                    CASH RECEIVED FROM GUEST:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-mono text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold bg-white focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Change Due Return Box */}
                <div
                  className={`p-2.5 rounded-xl border font-mono text-xs font-bold flex justify-between items-center ${
                    cashReceived >= total
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <span>{cashReceived >= total ? 'Change to Return to Guest:' : 'Balance Due / Shortage:'}</span>
                  <span className="font-black text-sm">
                    ₹ {Math.abs(cashReceived - total)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Staff Tip Selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="font-mono text-[9.5px] font-bold uppercase text-slate-400 mb-1.5">
              Staff Tip Preset
            </div>
            <div className="flex gap-1.5">
              {[0, 30, 50, 100].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTip(t)}
                  className={`flex-1 py-1 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                    tip === t
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  ₹{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePay}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {success ? (
              <span>✓ Payment Recorded!</span>
            ) : method === 'UPI' ? (
              <span>Confirm &amp; Record ₹{total} via UPI ➔</span>
            ) : method === 'CARD' ? (
              <span>Confirm &amp; Record ₹{total} via Card POS ➔</span>
            ) : (
              <span>Confirm &amp; Record ₹{total} Cash ➔</span>
            )}
          </motion.button>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
