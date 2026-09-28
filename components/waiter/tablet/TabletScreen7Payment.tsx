'use client';

import React, { useState, useEffect } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge, getTableBillBreakdown } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import {
  ArrowLeft,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle2,
  UtensilsCrossed,
  Zap,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

type PayMode = 'CASH' | 'UPI' | 'POS';

export const TabletScreen7Payment: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber, settlementTip, setSettlementTip, activeCaptain } =
    useWaiterStore();
  const { tables, waiterRecordsPayment } = useSharedBridge();
  const [payMode, setPayMode] = useState<PayMode>('CASH');
  const [paidConfirmed, setPaidConfirmed] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [posAuthCode, setPosAuthCode] = useState('');
  const [cardAuthorized, setCardAuthorized] = useState(false);

  const activeTable = tables.find((t) => t.number === (selectedTableNumber || 'A-04')) || tables[0];
  const breakdown = getTableBillBreakdown(activeTable, settlementTip);

  const [cashReceived, setCashReceived] = useState<number>(breakdown.grandTotal);

  useEffect(() => {
    setCashReceived(breakdown.grandTotal);
  }, [breakdown.grandTotal]);

  const qrTimer = '04:58';

  const handleConfirmPay = () => {
    waiterRecordsPayment(
      activeTable?.number || selectedTableNumber,
      payMode,
      breakdown.grandTotal,
      breakdown.tip,
      activeCaptain || 'Waiter 1'
    );
    setPaidConfirmed(true);
    setTimeout(() => {
      setPaidConfirmed(false);
      setCurrentScreen(8);
    }, 1500);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={7}
      screenTitle="BILL SETTLEMENT & PAYMENT COLLECTION"
    >
      <div className="flex flex-col flex-1 min-h-[700px] p-5 font-mono select-none">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setCurrentScreen(3)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Table</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Payment Gateway & Settlement Hub
          </h3>
          <span className="border border-slate-400 bg-slate-100 px-3 py-1 rounded font-bold text-xs text-slate-700">
            Table {activeTable.number} Settlement
          </span>
        </div>

        {/* PAYMENT SUCCESS BANNER */}
        {paidConfirmed && (
          <div className="mb-3 p-3 bg-emerald-700 text-white rounded-xl font-black text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 fill-white" />
            ✓ Payment Confirmed — Generating Tax Invoice (Screen 8)...
          </div>
        )}

        {/* PAYMENT METHOD SWITCHER */}
        <div className="flex gap-3 mb-4 shrink-0">
          {[
            { mode: 'CASH' as PayMode, icon: '💵', label: 'Cash Settlement' },
            { mode: 'UPI' as PayMode, icon: '📱', label: 'UPI Scan & Pay' },
            { mode: 'POS' as PayMode, icon: '💳', label: 'Card POS Swipe' },
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setPayMode(mode)}
              className={`flex-1 py-3 rounded-xl border-2 font-black text-xs transition flex items-center justify-center gap-2 ${
                payMode === mode
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* MAIN CONTENT SPLIT */}
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* LEFT: VISUAL SETTLEMENT TERMINAL */}
          <div className="flex-1 border-2 border-slate-300 rounded-2xl bg-white flex flex-col items-center justify-center gap-3 p-6 text-center shadow-xs overflow-y-auto">
            {payMode === 'UPI' ? (
              <>
                <div className="w-48 h-48 border-2 border-dashed border-slate-400 bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                  <QrCode className="h-24 w-24 text-slate-800" />
                  <span className="font-mono text-[10px] font-bold text-slate-600">
                    UPI Dynamic QR Code
                  </span>
                </div>
                <strong className="text-lg font-black text-slate-950 font-mono">
                  Scan to Pay ₹{breakdown.grandTotal.toLocaleString('en-IN')}.00
                </strong>
                <span className="font-mono text-xs font-bold text-slate-500">
                  Supported: BHIM, GPay, PhonePe, Paytm, CRED &amp; Bank UPI
                </span>

                {upiVerified ? (
                  <div className="w-full max-w-xs p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>UPI Payment Verified &amp; Received ✓</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUpiVerified(true)}
                    className="py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 border border-slate-300 font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    <span>Simulate Customer Scanned &amp; Paid</span>
                  </button>
                )}

                <div className="border border-slate-300 bg-slate-50 px-3 py-1 rounded-lg font-mono text-xs font-bold text-slate-600">
                  QR Timeout: {qrTimer} mins remaining
                </div>
              </>
            ) : payMode === 'CASH' ? (
              <div className="w-full max-w-sm flex flex-col gap-3 text-left">
                <div className="text-center pb-2 border-b border-slate-200">
                  <span className="text-4xl block mb-1">💵</span>
                  <strong className="text-base font-black text-slate-950">
                    Cash Tender Settlement
                  </strong>
                  <div className="text-2xl font-black text-slate-950 font-mono mt-0.5">
                    ₹{breakdown.grandTotal.toLocaleString('en-IN')}.00
                  </div>
                </div>

                {/* Quick Currency Presets */}
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Quick Currency Presets:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: `Exact (₹${breakdown.grandTotal})`, val: breakdown.grandTotal },
                      {
                        label: `₹${Math.ceil(breakdown.grandTotal / 100) * 100}`,
                        val: Math.ceil(breakdown.grandTotal / 100) * 100,
                      },
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

                {/* Cash Received Input */}
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
                    cashReceived >= breakdown.grandTotal
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <span>
                    {cashReceived >= breakdown.grandTotal
                      ? 'Change to Return:'
                      : 'Shortage / Balance:'}
                  </span>
                  <span className="font-black text-sm">
                    ₹ {Math.abs(cashReceived - breakdown.grandTotal)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm flex flex-col gap-3 text-left">
                <div className="text-center pb-2 border-b border-slate-200">
                  <CreditCard className="h-12 w-12 text-slate-800 mx-auto mb-1" />
                  <strong className="text-base font-black text-slate-950 block">
                    Card POS Terminal Swipe
                  </strong>
                  <div className="text-2xl font-black text-slate-950 font-mono mt-0.5">
                    ₹{breakdown.grandTotal.toLocaleString('en-IN')}.00
                  </div>
                </div>

                <div className="border border-slate-200 bg-stone-50 rounded-xl p-2.5 flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                    <span>PineLabs EDC #POS-03</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
                    Terminal Ready
                  </span>
                </div>

                {/* POS Auth Reference ID Input */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 mb-1">
                    <span>POS AUTH CODE:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPosAuthCode(`AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
                        setCardAuthorized(true);
                      }}
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
                    <span>Card Approved via Countertop Terminal ✓</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: ORDER ITEMS & SETTLEMENT BREAKDOWN */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            {/* Selected Food Items List */}
            <div className="border border-slate-300 bg-white rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-orange-600" />
                  SELECTED FOOD ITEMS ({breakdown.itemCount})
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Subtotal: ₹{breakdown.foodSubtotal}
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {breakdown.items.length > 0 ? (
                  breakdown.items.map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700 py-0.5">
                      <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                        <span className="font-bold text-orange-600 bg-orange-50 px-1 rounded">
                          {row.quantity}x
                        </span>
                        <span className="font-medium truncate">{row.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 mr-2">@ ₹{row.unitPrice}</span>
                        <span className="font-bold text-slate-900">₹{row.lineTotal}.00</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic text-center py-2">
                    Dine-In Food &amp; Beverage Service (₹{breakdown.foodSubtotal}.00)
                  </div>
                )}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border border-slate-300 bg-white rounded-xl p-3.5 flex flex-col gap-2">
              <strong className="text-xs font-black text-slate-900">TAX INVOICE &amp; GST BREAKDOWN:</strong>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Table Number:</span>
                <span className="font-bold text-slate-900">{activeTable.number}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Selected Mode:</span>
                <span className="font-bold text-slate-900">{payMode}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Food Items Subtotal (Net):</span>
                <span className="font-bold text-slate-800">₹{breakdown.foodSubtotal.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>CGST @ 2.5%:</span>
                <span className="font-bold text-slate-800">₹{breakdown.cgst.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>SGST @ 2.5%:</span>
                <span className="font-bold text-slate-800">₹{breakdown.sgst.toLocaleString('en-IN')}.00</span>
              </div>

              {/* Staff Tip Preset Chips */}
              <div className="pt-1.5 border-t border-dashed border-slate-200">
                <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                  <span>Staff Gratuity / Tip:</span>
                  <span className="font-bold text-orange-600">₹{breakdown.tip.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex gap-1.5">
                  {[0, 30, 50, 100].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSettlementTip(t)}
                      className={`flex-1 py-1 rounded font-mono text-[10px] font-bold transition cursor-pointer ${
                        settlementTip === t
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                      }`}
                    >
                      ₹{t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-950">
                <span>Total Amount Payable:</span>
                <span>₹{breakdown.grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            {/* CONFIRM & PAY */}
            <button
              type="button"
              onClick={handleConfirmPay}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-sm transition shadow-sm flex items-center justify-center gap-2 mt-auto cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5 fill-white" />
              <span>Confirm &amp; Record ₹{breakdown.grandTotal.toLocaleString('en-IN')}.00 ➔</span>
            </button>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
