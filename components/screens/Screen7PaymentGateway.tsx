'use client';

import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { QrCode, Smartphone, CreditCard, Building2, Banknote, Lock, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen7PaymentGateway: React.FC = () => {
  const {
    setCurrentScreen,
    payment,
    setPaymentMethod,
    toggleRedeemPoints,
    confirmAndPay,
    cart,
  } = useCustomer();

  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
  const tax = Math.round(subtotal * 0.05);
  const discount = payment.redeemPoints ? 50 : 0;
  const grandTotal = subtotal + tax + payment.tipAmount - discount;

  const paymentMethods = [
    {
      id: 'UPI' as const,
      label: 'METHOD 1: UPI APPS (GPAY / PHONEPE / PAYTM)',
      icon: <Smartphone className="h-4 w-4 text-emerald-600" />,
      sub: 'Instant 0% fee settlement',
    },
    {
      id: 'CARD' as const,
      label: 'METHOD 2: DEBIT / CREDIT CARD',
      icon: <CreditCard className="h-4 w-4 text-blue-600" />,
      sub: 'Visa, Mastercard, RuPay',
    },
    {
      id: 'NET_BANKING' as const,
      label: 'METHOD 3: NET BANKING',
      icon: <Building2 className="h-4 w-4 text-indigo-600" />,
      sub: 'All major Indian banks',
    },
    {
      id: 'CASH' as const,
      label: 'METHOD 4: CASH TO SERVER',
      icon: <Banknote className="h-4 w-4 text-amber-600" />,
      sub: 'Pay directly at your table',
    },
  ];

  return (
    <ScreenHousing screenNumber={7} screenTitle="PAYMENT PAGE 2 (GATEWAY & QR)">
      {/* Header */}
      <WireHeader
        title="[PAYMENT PAGE 2: GATEWAY]"
        showBack={true}
        onBack={() => setCurrentScreen(6)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* QR Scanner Box Placeholder */}
        <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            [SCANNER / SCAN &amp; PAY QR SPACE]
          </div>

          <div className="relative my-3 flex h-36 w-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-2 shadow-inner">
            <QrCode className="h-16 w-16 text-slate-900" />
            <span className="mt-1 font-mono text-[9px] font-black text-slate-800">
              [DYNAMIC QR CODE]
            </span>
            <span className="font-mono text-xs font-black text-orange-600">
              ₹ {grandTotal}
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-600">
            [SCAN WITH ANY UPI APP TO PAY]
          </div>
        </div>



        {/* Different Payment Options */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
            [DIFFERENT PAYMENT OPTIONS]
          </div>

          <div className="space-y-2">
            {paymentMethods.map((pm) => {
              const isSelected = payment.paymentMethod === pm.id;
              return (
                <label
                  key={pm.id}
                  className={`flex items-center justify-between rounded-2xl p-3 cursor-pointer border transition ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                      : 'border-slate-200 bg-stone-50/50 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-100">
                      {pm.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-slate-900">
                        [{pm.label}]
                      </div>
                      <div className="text-[10px] text-slate-500">{pm.sub}</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="screen7-paym"
                    checked={isSelected}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="accent-orange-600 h-4 w-4 ml-2"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky */}
      <StickyBottomBar label="[PAY BUTTON]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={confirmAndPay}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition"
        >
          <Lock className="h-4 w-4 stroke-[2.5]" />
          <span>🔒 [CONFIRM &amp; PAY ₹ {grandTotal}]</span>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
