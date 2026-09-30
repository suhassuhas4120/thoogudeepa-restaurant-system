'use client';

import React, { useState } from 'react';
import { useWaiterStore, formatCaptainName } from '../../store/useWaiterStore';
import { useSharedBridge, getTableBillBreakdown } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  Share2,
  Trash2,
  Check,
} from 'lucide-react';
import { triggerHapticVibrate } from '../../lib/soundEffects';

export const ScreenW5BillingSettlement: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    activeCaptain,
  } = useWaiterStore();

  const { tables, waiterRecordsPayment, waiterVacatesTable } = useSharedBridge();

  const cleanSelected = (selectedTableNumber || '').replace(/\D/g, '');
  const activeTable =
    tables.find((t) => t.number === selectedTableNumber) ||
    tables.find((t) => {
      const cleanT = t.number.replace(/\D/g, '');
      return cleanSelected !== '' && cleanT !== '' && cleanSelected === cleanT;
    }) ||
    tables[0];
  const currentTableNum = activeTable?.number || selectedTableNumber || 'A-02';

  // Zero tip: bill is strictly Subtotal + 5% GST
  const breakdown = getTableBillBreakdown(activeTable, 0);
  const captainName = formatCaptainName(activeCaptain || activeTable?.serverName);

  // Payment methods: CASH first, UPI second, CARD third
  const [method, setMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(
    activeTable?.status === 'BILLING'
  );

  // Post-payment actions state
  const [printed, setPrinted] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('+91 98450 12345');

  const handleConfirmPayment = () => {
    waiterRecordsPayment(
      activeTable?.number || currentTableNum,
      method,
      breakdown.grandTotal,
      0, // Zero tip
      captainName
    );
    triggerHapticVibrate([50, 40, 100]);
    setIsPaymentConfirmed(true);
  };

  const handlePrintReceipt = () => {
    setPrinted(true);
    triggerHapticVibrate(30);
    setTimeout(() => setPrinted(false), 2500);
  };

  const handleSendWhatsApp = () => {
    setWhatsAppSent(true);
    triggerHapticVibrate(30);
    setTimeout(() => setWhatsAppSent(false), 2500);
  };

  const handleVacateTableAndReturn = () => {
    if (activeTable?.number) {
      waiterVacatesTable(activeTable.number);
    }
    triggerHapticVibrate(50);
    setCurrentScreen(2);
  };

  return (
    <WaiterTabletHousing
      screenNumber={5}
      screenTitle="PAYMENT"
    >
      <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3 overflow-y-auto bg-stone-50/70 font-mono relative">
        <div className="space-y-3">

          {/* Top Bar: Back & Status */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen(3)}
              className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-slate-900 transition cursor-pointer py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Table {currentTableNum}</span>
              {activeTable?.mergedWith && (
                <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider">
                  MERGED
                </span>
              )}
            </button>

            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                isPaymentConfirmed
                  ? 'bg-purple-100 text-purple-950 border-purple-300'
                  : 'bg-amber-100 text-amber-950 border-amber-300'
              }`}
            >
              {isPaymentConfirmed ? 'Settled' : 'Payment Due'}
            </span>
          </div>

          {/* ===================================================
              THE SINGLE BILL INVOICE (ONLY 1 BILL ON SCREEN)
              Itemized ordered dishes, net subtotal, 5% tax, total
          ==================================================== */}
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-3.5 shadow-xs space-y-2.5">
            {/* Bill Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-950">
                  TABLE {activeTable?.mergedWith ? `${activeTable.number} + ${activeTable.mergedWith}` : activeTable?.number}
                </span>
                {activeTable?.mergedWith && (
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[8.5px] font-black uppercase tracking-wider shadow-2xs">
                    MERGED
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600 font-bold shrink-0">
                {captainName}
              </div>
            </div>

            {/* Itemized Ordered Dishes List */}
            <div className="space-y-1 pt-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between pb-1 border-b border-dashed border-slate-200">
                <span>Dish</span>
                <span>Amount</span>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {breakdown.items.length > 0 ? (
                  breakdown.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs py-1.5 border-b border-dashed border-slate-100 last:border-0 gap-2"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-900 truncate text-xs">
                          {item.name}
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                          ₹{item.unitPrice.toFixed(2)} ea
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Highlighted Multiply on the right side */}
                        <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs">
                          <span className="text-orange-400 mr-0.5 font-bold">×</span>
                          <span>{item.quantity}</span>
                        </span>

                        <span className="font-mono font-black text-xs text-slate-950 min-w-[56px] text-right">
                          ₹{item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-xs text-slate-500 py-1">
                    <span>Dine-In Service</span>
                    <span className="font-bold">₹{breakdown.foodSubtotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations: Subtotal & Taxes (No Tip) */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between text-[11px]">
                <span>Food Subtotal:</span>
                <span className="font-bold text-slate-900">₹{breakdown.foodSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (2.5%):</span>
                <span>₹{breakdown.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (2.5%):</span>
                <span>₹{breakdown.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-950 font-black text-lg pt-1.5 border-t border-slate-900">
                <span className="text-lg">Total:</span>
                <span className="text-lg text-emerald-700 font-mono">₹{breakdown.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ===================================================
              IF NOT PAID: PAYMENT METHODS (CASH FIRST, UPI, CARD)
          ==================================================== */}
          {!isPaymentConfirmed ? (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
              {/* Method Switcher: CASH FIRST, UPI SECOND, CARD THIRD */}
              <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl border border-slate-200">
                {/* 1. CASH FIRST */}
                <button
                  type="button"
                  onClick={() => setMethod('CASH')}
                  className={`py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    method === 'CASH'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Cash</span>
                </button>

                {/* 2. UPI SECOND */}
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    method === 'UPI'
                      ? 'bg-white text-orange-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>UPI</span>
                </button>

                {/* 3. CARD THIRD */}
                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    method === 'CARD'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Card</span>
                </button>
              </div>

              {/* Mode Visual Body (Matching Tablet View) */}
              <div className="pt-1">
                {/* CASH */}
                {method === 'CASH' && (
                  <div className="p-4 bg-stone-50 border border-slate-200 rounded-2xl text-center space-y-1.5 shadow-2xs">
                    <span className="text-3xl block">💵</span>
                    <div className="font-mono text-xs font-black text-slate-950">
                      Collect Cash Tender
                    </div>
                    <div className="text-xl font-black text-emerald-700 font-mono">
                      ₹{breakdown.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      Confirm currency received from guest
                    </div>
                  </div>
                )}

                {/* UPI: ENLARGED DYNAMIC QR */}
                {method === 'UPI' && (
                  <div className="flex flex-col items-center justify-center p-3 bg-stone-50 border border-slate-200 rounded-2xl text-center space-y-1.5 shadow-2xs">
                    <div className="p-2.5 bg-white border-2 border-slate-900 rounded-2xl shadow-sm">
                      <QrCode className="h-40 w-40 text-slate-950" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">
                        Scan Dynamic QR to Pay
                      </div>
                      <div className="text-base font-black text-emerald-700">
                        ₹{breakdown.grandTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        BHIM • GPay • PhonePe • Paytm • UPI
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD */}
                {method === 'CARD' && (
                  <div className="p-4 bg-stone-50 border border-slate-200 rounded-2xl text-center space-y-1.5 shadow-2xs">
                    <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border border-purple-200">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="font-mono text-xs font-black text-slate-950">
                      Card POS Swipe / Tap
                    </div>
                    <div className="text-xl font-black text-purple-900 font-mono">
                      ₹{breakdown.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      Swipe or tap card on countertop terminal
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Payment Button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Confirm Payment</span>
              </button>
            </div>
          ) : (
            /* ===================================================
                IF PAID: DIGITAL INVOICE ACTIONS (NO SECOND BILL!)
            ==================================================== */
            <div className="space-y-3">
              {/* Success Banner */}
              <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-2.5 shadow-2xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="text-xs font-mono">
                  <div className="font-black text-emerald-950">
                    Payment Received via {method}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    ₹{breakdown.grandTotal.toFixed(2)} Settled
                  </div>
                </div>
              </div>

              {/* Digital Invoice & Print Section */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
                <div className="text-xs font-black text-slate-900 uppercase">
                  Digital Invoice & Print
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">
                    Customer Phone:
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-stone-50 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Print Bill & WhatsApp Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 bg-stone-50 hover:bg-stone-100 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-600" />
                    <span>{printed ? 'Printed ✓' : 'Print Bill'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{whatsAppSent ? 'Sent ✓' : 'WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Vacate Table Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleVacateTableAndReturn}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Vacate Table</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </WaiterTabletHousing>
  );
};
