'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { INITIAL_MENU_ITEMS } from '../../../data/menuItems';
import { ArrowLeft, Printer, MessageCircle, CheckCircle2, Trash2 } from 'lucide-react';

export const TabletScreen8PrintBill: React.FC = () => {
  const { setCurrentScreen, selectedTableNumber, orderCart, activeCaptain } = useWaiterStore();
  const { tables, waiterVacatesTable } = useSharedBridge();
  const [printSent, setPrintSent] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [tableVacated, setTableVacated] = useState(false);

  const activeTable = tables.find((t) => t.number === (selectedTableNumber || 'A-04')) || tables[0];
  const items = (activeTable.activeItems && activeTable.activeItems.length > 0)
    ? activeTable.activeItems.map((ai) => {
        const found = INITIAL_MENU_ITEMS.find((m) => m.name.toLowerCase() === ai.name.toLowerCase());
        const unitPrice = found ? found.price : 260;
        return {
          name: ai.name,
          qty: ai.quantity,
          price: unitPrice * ai.quantity,
          status: ai.status,
        };
      })
    : (orderCart.length > 0
        ? orderCart.map((c) => ({
            name: c.menuItem.name,
            qty: c.quantity,
            price: c.menuItem.price * c.quantity,
            status: 'Served',
          }))
        : [
            { name: 'Donne Mutton Biryani', qty: 1, price: 320, status: 'Served' },
            { name: 'Donne Chicken Biryani', qty: 1, price: 240, status: 'Served' },
          ]);

  const subtotal = activeTable.currentBill || items.reduce((sum, item) => sum + (item.price || 0), 0);
  const netBeforeGst = Math.round(subtotal / 1.05);
  const totalGst = subtotal - netBeforeGst;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;
  const netTotal = subtotal;
  const invoiceNum = `INV-2026-${activeTable.number.replace(/\D/g, '') || '104'}`;
  const txnId = `TXN_${(activeTable.number.replace(/\D/g, '') || '104').padStart(4, '0')}7892`;
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    setPrintSent(true);
    setTimeout(() => setPrintSent(false), 4000);
  };

  const handleWhatsapp = () => {
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 3000);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={8}
      screenTitle="TAX INVOICE & DIGITAL RECEIPT"
    >
      <div className="flex flex-col flex-1 min-h-[700px] p-5 font-mono select-none">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setCurrentScreen(2)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tables</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Tax Invoice & Thermal Print Hub
          </h3>
          <span className="border border-slate-400 bg-slate-100 px-3 py-1 rounded font-bold text-xs text-slate-700">
            {invoiceNum}
          </span>
        </div>

        {/* PAYMENT SUCCESSFUL BANNER */}
        <div className="border-2 border-slate-900 bg-slate-100 rounded-xl px-5 py-3 flex justify-between items-center mb-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <strong className="text-sm font-black text-slate-950 block">
                Payment Successful — Bill Settled
              </strong>
              <p className="text-[11px] font-bold text-slate-500">
                Transaction ID: {txnId} • Time: {now}
              </p>
            </div>
          </div>
          <span className="border-2 border-slate-900 bg-white px-3 py-1 rounded font-black text-xs text-slate-900">
            Status: Paid ✓
          </span>
        </div>

        {/* MAIN CONTENT: THERMAL RECEIPT + ACTIONS */}
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* LEFT: 80mm THERMAL RECEIPT PREVIEW */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-xs mx-auto bg-white border border-slate-300 rounded-xl p-4 shadow-md font-mono text-xs">
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-slate-400 pb-3 mb-3">
                <div className="font-black text-xs tracking-wide">THOOGUDEEPA DONNE BIRYANI MANE</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  123, Food Street, Bangalore - 560001
                </div>
                <div className="text-[10px] text-slate-500">GSTIN: 29AAAAA0000A1Z5</div>
                <div className="text-[10px] text-slate-500">FSSAI: 10012345067891</div>
                <div className="font-black text-[11px] mt-1">TAX INVOICE</div>
              </div>

              {/* Order Meta */}
              <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>Invoice:</span><span className="font-bold">{invoiceNum}</span>
                </div>
                <div className="flex justify-between">
                  <span>Table:</span><span className="font-bold">{activeTable.number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Captain:</span><span className="font-bold">{activeTable.serverName || activeCaptain || 'Staff'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span><span className="font-bold">{now}</span>
                </div>
              </div>

              {/* Itemized Bill */}
              <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-200 pb-1 mb-1">
                  <span>ITEM</span><span>QTY</span><span>AMT</span>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-slate-700 py-0.5">
                    <span className="flex-1 truncate pr-2">{item.name}</span>
                    <span className="w-6 text-center">{item.qty}</span>
                    <span className="w-14 text-right">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* GST Breakdown */}
              <div className="text-[10px] text-slate-600 flex flex-col gap-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Subtotal (Net):</span><span>₹ {netBeforeGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST @ 2.5%:</span><span>₹ {cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST @ 2.5%:</span><span>₹ {sgst}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between font-black text-sm text-slate-950 border-t-2 border-slate-800 pt-2 mb-3">
                <span>NET TOTAL PAID:</span>
                <span>₹ {netTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Payment Mode */}
              <div className="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-2">
                <div>Payment: CASH/UPI • Thank You For Dining With Us!</div>
                <div className="mt-1 font-bold">Please Come Again 🙏</div>
              </div>
            </div>
          </div>

          {/* RIGHT: BILL ACTIONS */}
          <div className="flex-1 flex flex-col gap-4 justify-start">
            <span className="font-black text-xs text-slate-900 uppercase">BILL DISPATCH OPTIONS:</span>

            {/* ITEMIZED INVOICE SUMMARY */}
            <div className="border border-slate-300 bg-white rounded-xl p-4 flex flex-col gap-2">
              <strong className="text-xs font-black text-slate-900">Tax Invoice Details:</strong>
              <div className="flex flex-col gap-1 font-mono text-xs">
                {items.map((row, i) => (
                  <div key={i} className="flex justify-between text-slate-700">
                    <span>{row.qty}x {row.name}</span>
                    <span>₹ {row.price}.00</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-300 mt-1 pt-1 flex justify-between text-[10px] text-slate-500">
                  <span>Subtotal (Net):</span><span>₹ {netBeforeGst}.00</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>CGST 2.5%:</span><span>₹ {cgst}.00</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>SGST 2.5%:</span><span>₹ {sgst}.00</span>
                </div>
                <div className="border-t-2 border-slate-900 mt-1 pt-1 flex justify-between font-black text-sm text-slate-950">
                  <span>Net Total Paid:</span><span>₹ {netTotal.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            {/* Print Confirmation */}
            {printSent && (
              <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-bold text-center font-mono">
                Print command sent directly to manager POS printer — Job #PRN-884
              </div>
            )}

            {whatsappSent && (
              <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs font-bold text-center font-mono">
                Digital invoice shared with customer via WhatsApp
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleWhatsapp}
                className="flex-1 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp Receipt</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print 80mm Receipt</span>
              </button>
            </div>

            {/* Direct Vacate (ENABLED ONLY WHEN PAYMENT IS CONFIRMED & BILL GENERATED) */}
            {(() => {
              const isPaymentDone = activeTable.status === 'BILLING' || tableVacated;
              return (
                <button
                  disabled={!isPaymentDone}
                  onClick={() => {
                    if (!isPaymentDone) return;
                    waiterVacatesTable(activeTable.number);
                    setTableVacated(true);
                    setTimeout(() => {
                      setTableVacated(false);
                      setCurrentScreen(2);
                    }, 2000);
                  }}
                  className={`w-full rounded-xl font-black text-xs px-4 py-3.5 transition flex items-center justify-center gap-2 shadow-2xs ${
                    isPaymentDone
                      ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>🧹 {isPaymentDone ? 'Vacate & Reset Table for Next Guest' : 'Vacate Disabled (Payment Pending)'}</span>
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
