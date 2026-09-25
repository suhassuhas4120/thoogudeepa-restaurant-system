'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Users, Scissors, Heart, ArrowRight, Plus, Minus, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen6PaymentBreakdown: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    payment,
    updateTip,
    setSplitMode,
  } = useCustomer();

  const [customTip, setCustomTip] = useState<string>('');
  const [splitPersons, setSplitPersons] = useState<number>(2);

  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + tax + payment.tipAmount;

  const handlePresetTip = (amount: number) => {
    setCustomTip('');
    updateTip(amount);
  };

  const handleCustomTipChange = (val: string) => {
    const sanitized = val.replace(/[^\d]/g, '');
    setCustomTip(sanitized);
    const num = parseInt(sanitized, 10);
    updateTip(isNaN(num) || num < 0 ? 0 : num);
  };

  const tipPresets = [30, 50, 100];

  return (
    <ScreenHousing screenNumber={6} screenTitle="PAYMENT PAGE 1 (SPLIT & TIPS)">
      {/* Header */}
      <WireHeader
        title="[PAYMENT PAGE 1: BREAKDOWN & SPLIT]"
        showBack={true}
        onBack={() => setCurrentScreen(5)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* List of Items with Price Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            <Receipt className="h-3.5 w-3.5 text-orange-600" />
            <span>[LIST OF ITEMS WITH PRICE BREAKDOWN]</span>
          </div>

          <div className="space-y-2 pb-3 border-b border-dashed border-slate-200 text-xs">
            {cart.length > 0 ? (
              cart.map((ci) => (
                <div key={ci.cartItemId} className="flex justify-between items-center text-slate-800">
                  <span className="font-semibold">[{ci.menuItem.name} × {ci.quantity}]</span>
                  <span className="font-mono font-bold text-slate-900">[₹ {ci.totalPrice}]</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center text-slate-400">
                <Receipt className="h-6 w-6 text-slate-300 mb-1" />
                <span className="text-xs font-bold text-slate-600">[NO ITEMS IN CART]</span>
                <span className="text-[10px] text-slate-400">Add dishes from the menu to generate bill</span>
              </div>
            )}
          </div>

          {/* Subtotal, Tax, Tip, Total */}
          <div className="space-y-1.5 pt-3 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>[SUBTOTAL]</span>
              <span className="font-mono">[₹ {subtotal}]</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>[TAXES & CHARGES (5% GST)]</span>
              <span className="font-mono">[₹ {tax}]</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between text-orange-600 font-bold">
                <span>[STAFF TIP]</span>
                <span className="font-mono">[+₹ {payment.tipAmount}]</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 text-sm font-black text-slate-900 border-t border-slate-100">
              <span>[TOTAL AMOUNT]</span>
              <span className="font-mono text-base text-orange-600 font-black">[₹ {grandTotal}]</span>
            </div>
          </div>
        </div>



        {/* Add Tips to Waiter Option */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            <Heart className="h-3.5 w-3.5 text-orange-600" />
            <span>[ADD TIPS TO WAITER (PRESETS + CUSTOM)]</span>
          </div>

          <div className="flex gap-2">
            {tipPresets.map((preset) => {
              const isSelected = payment.tipAmount === preset && customTip === '';
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetTip(preset)}
                  className={`flex-1 rounded-xl py-2 font-mono text-xs font-black transition border ${
                    isSelected
                      ? 'border-orange-500 bg-orange-600 text-white shadow-sm'
                      : 'border-slate-200 bg-stone-50/70 text-slate-700 hover:bg-stone-100'
                  }`}
                >
                  [₹ {preset}]
                </button>
              );
            })}
            <button
              onClick={() => handlePresetTip(0)}
              className={`rounded-xl px-3 py-2 text-[10.5px] font-extrabold transition border ${
                payment.tipAmount === 0 && customTip === ''
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-stone-50/70 text-slate-600 hover:bg-stone-100'
              }`}
            >
              [NO TIP]
            </button>
          </div>

          <div className="mt-2.5">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customTip}
              onChange={(e) => handleCustomTipChange(e.target.value)}
              placeholder="[ENTER CUSTOM TIP AMOUNT]"
              className="w-full rounded-xl border border-slate-200 bg-stone-50/60 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky */}
      <StickyBottomBar label="[GO TO PAYMENT PAGE 2 BUTTON]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={cart.length === 0}
          onClick={() => setCurrentScreen(7)}
          className="flex w-full items-center justify-between rounded-2xl bg-orange-600 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span>[CONTINUE TO PAYMENT (PAGE 2)]</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
