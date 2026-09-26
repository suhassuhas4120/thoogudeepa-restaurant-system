'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Download, Share2, RotateCcw, Receipt, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen9DigitalBill: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    payment,
    guestName,
    tableNumber,
    venueName,
    resetSession,
  } = useCustomer();
  const [downloadMsg, setDownloadMsg] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);

  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
  const tax = Math.round(subtotal * 0.05);
  const paidTotal = subtotal + tax + payment.tipAmount;

  const handleDownload = () => {
    setDownloadMsg(true);
    setTimeout(() => setDownloadMsg(false), 2200);
  };

  const handleShareWhatsApp = () => {
    setShareMsg(true);
    setTimeout(() => setShareMsg(false), 2200);
  };

  return (
    <ScreenHousing screenNumber={9} screenTitle="Bill Page">
      {/* Header */}
      <WireHeader
        title="Detailed Bill & Invoice"
        showBack={true}
        onBack={() => setCurrentScreen(8)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Payment Bill with Detailed Breakdown */}
        <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono text-center">
            Payment Bill With Detailed Breakdown
          </div>

          <div className="text-center pb-3 border-b border-dashed border-slate-200">
            <h3 className="text-sm font-black text-slate-900 tracking-wide">
              Tax Invoice / Receipt
            </h3>
            <p className="font-mono text-[10px] font-semibold text-slate-500 mt-0.5">
              Invoice: #{payment.transactionId?.replace('#', '') || 'INV-2026-8921'} | Sac 996331
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 text-[10px] font-mono font-bold text-slate-600">
              <span>{venueName}</span>
              <span>•</span>
              <span>Table: {tableNumber}</span>
            </div>
            <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">
              Guest: {guestName ? guestName.toUpperCase() : 'Valued Guest'}
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-200 text-xs">
            {cart.length > 0 ? (
              cart.map((ci) => (
                <div key={ci.cartItemId} className="flex justify-between items-center text-slate-800">
                  <span className="font-semibold">{ci.menuItem.name} × {ci.quantity}</span>
                  <span className="font-mono font-bold">₹ {ci.totalPrice}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-slate-400 font-mono text-xs">
                No Items Charged - Invoice Empty
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span className="font-mono text-slate-800">₹ {subtotal}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Tax (2.5% Cgst + 2.5% Sgst)</span>
              <span className="font-mono text-slate-800">₹ {tax}</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-medium text-orange-600">
                <span>Waiter Tip</span>
                <span className="font-mono">₹ {payment.tipAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 font-black text-slate-900 border-t border-slate-100 text-sm">
              <span>Paid Total</span>
              <span className="font-mono text-base font-black text-slate-900">₹ {paidTotal}</span>
            </div>
          </div>

          {/* Paid Mode & Payment Status */}
          <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 text-xs">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Paid Mode
              </div>
              <div className="font-black text-slate-800 text-[11px] mt-0.5">
                {payment.paymentMethod} / Settled
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Payment Status
              </div>
              <div className="font-black text-emerald-700 text-[11px] mt-0.5 flex items-center justify-end gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Paid & Settled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Bill Option */}
        <div>
          <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            DOWNLOAD BILL OPTION
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-800 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 stroke-[2.2]" />
            <span>{downloadMsg ? 'Generating PDF Bill...' : 'Download PDF BILL'}</span>
          </motion.button>
        </div>

        {/* Share Bill Through WhatsApp Button */}
        <div>
          <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            SHARE BILL THROUGH WHATSAPP BUTTON
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShareWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/80 py-3 text-xs font-extrabold text-emerald-800 shadow-xs hover:bg-emerald-100 transition"
          >
            <Share2 className="h-4 w-4 stroke-[2.2]" />
            <span>{shareMsg ? 'Preparing Whatsapp Share...' : 'Share Bill Via Whatsapp'}</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Sticky: Return to Home */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetSession();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:bg-slate-800 transition"
        >
          <RotateCcw className="h-4 w-4 stroke-[2.5]" />
          <span>Return To Menu</span>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
