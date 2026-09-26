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
    <ScreenHousing screenNumber={6} screenTitle="Order Summary">
      <WireHeader
        title="Order Summary"
        showBack={true}
        onBack={() => setCurrentScreen(5)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#fffaf5] via-[#fffaf3] to-[#fff] p-4 space-y-4">
        <div className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-[0_16px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-3 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-slate-400">
            <Receipt className="h-3.5 w-3.5 text-orange-600" />
            <span>List Of Items With Price Breakdown</span>
          </div>

          <div className="space-y-2 border-b border-dashed border-slate-200 pb-3 text-xs">
            {cart.length > 0 ? (
              cart.map((ci) => (
                <div key={ci.cartItemId} className="flex items-center justify-between text-slate-800">
                  <span className="font-semibold">{ci.menuItem.name} × {ci.quantity}</span>
                  <span className="font-mono font-black text-slate-900">₹ {ci.totalPrice}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center text-slate-400">
                <Receipt className="h-6 w-6 text-slate-300 mb-1" />
                <span className="text-xs font-black text-slate-600">No Items In Cart</span>
                <span className="text-[10px] text-slate-400">Add dishes from the menu to generate bill</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-3 text-xs">
            <div className="flex justify-between font-medium text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">₹ {subtotal}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-500">
              <span>Taxes & Charges (5% Gst)</span>
              <span className="font-mono">₹ {tax}</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-bold text-orange-600">
                <span>Staff Tip</span>
                <span className="font-mono">+₹ {payment.tipAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
              <span>Total Amount</span>
              <span className="font-mono text-base font-black text-orange-600">₹ {grandTotal}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-[0_16px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-2.5 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-slate-400">
            <Heart className="h-3.5 w-3.5 text-orange-600" />
            <span>Add Tips To Waiter (Presets + Custom)</span>
          </div>

          <div className="flex gap-2">
            {tipPresets.map((preset) => {
              const isSelected = payment.tipAmount === preset && customTip === '';
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetTip(preset)}
                  className={`flex-1 rounded-2xl border py-2 font-mono text-xs font-black transition ${
                    isSelected
                      ? 'border-orange-500 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_10px_18px_rgba(234,88,12,0.22)]'
                      : 'border-slate-200 bg-[#fff7f2] text-slate-700 hover:bg-[#ffe7d6]'
                  }`}
                >
                  ₹ {preset}
                </button>
              );
            })}
            <button
              onClick={() => handlePresetTip(0)}
              className={`rounded-2xl border px-3 py-2 text-[10.5px] font-black transition ${
                payment.tipAmount === 0 && customTip === ''
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-[#fff7f2] text-slate-600 hover:bg-[#ffe7d6]'
              }`}
            >
              NO TIP
            </button>
          </div>

          <div className="mt-2.5">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customTip}
              onChange={(e) => handleCustomTipChange(e.target.value)}
              placeholder="Enter Custom Tip Amount"
              className="w-full rounded-2xl border border-orange-100 bg-[#fffaf6] px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-[0_8px_18px_rgba(15,23,42,0.02)] focus:border-orange-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={cart.length === 0}
          onClick={() => setCurrentScreen(7)}
          className="flex w-full items-center justify-between rounded-[20px] bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#c2410c] px-4 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_26px_rgba(234,88,12,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Continue To Pay</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
