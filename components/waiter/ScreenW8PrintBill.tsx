'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { ArrowLeft, Printer, Share2, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW8PrintBill: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber, activeCaptain } = useWaiterStore();
  const { tables } = useSharedBridge();
  const [printed, setPrinted] = useState(false);
  const [shared, setShared] = useState(false);
  const [phone, setPhone] = useState('+91 98450 12345');

  const activeTable = tables.find((t) => t.number === selectedTableNumber) || tables[0];
  const runningTotal = activeTable?.currentBill || 0;
  const subtotal = Math.round(runningTotal / 1.05);
  const gst = runningTotal - subtotal;
  const tip = 50;
  const totalPaid = runningTotal + (runningTotal > 0 ? tip : 0);
  const captainName = activeTable.serverName || activeCaptain || 'Floor Captain';
  const invoiceNum = `INV-2026-${activeTable.number}`;

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 2000);
  };

  const handleWhatsApp = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <WaiterTabletHousing screenNumber={8} screenTitle="TAX INVOICE & DIGITAL RECEIPT">
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
              Table: {activeTable.number}
            </span>
          </div>

          {/* Receipt Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2 text-center">
            <div className="font-mono text-xs font-black text-slate-900">
              THOOGUDEEPA DONNE BIRYANI MANE
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Tax Invoice #{invoiceNum} • SAC 996331
            </div>
            <div className="font-mono text-[10.5px] font-bold text-slate-700 pb-2 border-b border-dashed border-slate-200">
              Table: {activeTable.number} • Captain: {captainName}
            </div>

            <div className="space-y-1 text-left text-xs font-medium text-slate-800 py-1">
              {activeTable.activeItems && activeTable.activeItems.length > 0 ? (
                activeTable.activeItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-mono font-bold">₹ {item.quantity * (item.price || 260)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>Dine-In Food &amp; Beverage Service</span>
                  <span className="font-mono font-bold">₹ {subtotal}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-dashed border-slate-200 font-mono text-xs text-left space-y-0.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹ {subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>5% GST:</span>
                <span>₹ {gst}</span>
              </div>
              {runningTotal > 0 && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Staff Tip:</span>
                  <span>₹ {tip}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-100 text-sm">
                <span>Total Paid:</span>
                <span>₹ {totalPaid}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Mobile Number Input */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
              Customer WhatsApp Mobile Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-stone-50 font-mono text-xs font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white font-mono text-xs font-black text-slate-800 shadow-2xs hover:bg-stone-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-700" />
            <span>{printed ? '✓ Thermal Receipt Printed' : 'Print 80mm Thermal Bill'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsApp}
            className="w-full py-3 rounded-xl bg-emerald-600 font-mono text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>{shared ? '✓ Sent via WhatsApp!' : 'Send Receipt via WhatsApp'}</span>
          </motion.button>

          <button
            onClick={() => setCurrentScreen(9)}
            className="w-full py-2.5 font-mono text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
          >
            Proceed to Vacate Table ➔
          </button>
        </div>
      </div>
    </WaiterTabletHousing>
  );
};
