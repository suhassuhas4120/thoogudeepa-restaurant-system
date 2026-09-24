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
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW7Payment: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber } = useWaiterStore();
  const { tables, waiterRecordsPayment } = useSharedBridge();
  const [method, setMethod] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [tip, setTip] = useState(50);
  const [success, setSuccess] = useState(false);

  const activeTable = tables.find((t) => t.number === selectedTableNumber) || tables[0];
  const billAmount = activeTable?.currentBill || 0;
  const subtotal = Math.round(billAmount / 1.05);
  const tax = billAmount - subtotal;
  const total = billAmount + (billAmount > 0 ? tip : 0);

  const handlePay = () => {
    waiterRecordsPayment(activeTable?.number || selectedTableNumber, method, total);
    setSuccess(true);
    setTimeout(() => {
      setCurrentScreen(8);
    }, 1200);
  };

  return (
    <WaiterTabletHousing screenNumber={7} screenTitle="BILL SETTLEMENT & PAYMENT COLLECTION">
      <div className="flex-1 flex flex-col justify-between p-4 space-y-3 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(3)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Table</span>
            </button>
            <span className="font-mono text-xs font-black text-slate-900">
              Table: {selectedTableNumber}
            </span>
          </div>

          {/* Amount Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center">
            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase">
              Total Collection Amount
            </div>
            <div className="font-mono text-2xl font-black text-orange-600 mt-1">
              ₹ {total}
            </div>
            <div className="font-mono text-[10.5px] text-slate-500 mt-0.5">
              Net Subtotal: ₹{subtotal} + 5% GST: ₹{tax} + Tip: ₹{tip}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Settlement Method
            </div>

            {[
              { id: 'UPI' as const, name: 'Customer Dynamic UPI QR', icon: <QrCode className="h-4 w-4" /> },
              { id: 'CARD' as const, name: 'Card POS Terminal Machine', icon: <CreditCard className="h-4 w-4" /> },
              { id: 'CASH' as const, name: 'Cash Handed to Server', icon: <Banknote className="h-4 w-4" /> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition font-mono text-xs font-black cursor-pointer ${
                  method === m.id
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{m.icon}</span>
                  <span>{m.name}</span>
                </div>
                {method === m.id && <CheckCircle2 className="h-4 w-4 text-orange-600" />}
              </button>
            ))}
          </div>

          {/* Staff Tip Selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="font-mono text-[10px] font-bold uppercase text-slate-400 mb-2">
              Staff Tip Preset
            </div>
            <div className="flex gap-2">
              {[0, 30, 50, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                    tip === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-100 text-slate-700'
                  }`}
                >
                  ₹{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePay}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition cursor-pointer"
        >
          {success ? '✓ Payment Recorded!' : `Confirm & Record ₹${total} ➔`}
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
