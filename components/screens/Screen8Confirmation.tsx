'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { CheckCircle2, Star, MessageSquare, Camera, Globe, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen8Confirmation: React.FC = () => {
  const { setCurrentScreen, payment, guestName, tableNumber } = useCustomer();
  const [selectedChips, setSelectedChips] = useState<string[]>(['Super Quick Service']);
  const [customFeedback, setCustomFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const chips = [
    'Super Quick Service',
    'Delicious Food Quality',
    'Courteous Staff',
    'Great Ambience',
    'Crisp Garam Naan',
  ];

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  return (
    <ScreenHousing screenNumber={8} screenTitle="CONFIRMATION & REVIEW">
      {/* Header */}
      <WireHeader
        title="[CONFIRMATION & REVIEW]"
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Successful Payment Confirmation */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 via-white to-stone-50 p-5 text-center shadow-sm"
        >
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            [SUCCESSFUL CONFIRMATION OF PAYMENT]
          </div>

          <div className="my-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>

          <h3 className="text-base font-black text-slate-900">[PAYMENT SUCCESSFUL]</h3>
          <div className="font-mono text-sm font-black text-emerald-600 mt-1">
            [AMOUNT PAID: ₹ {payment.totalAmount}]
          </div>
          <div className="font-mono text-[11px] font-bold text-slate-500 mt-0.5">
            [TRANSACTION ID: {payment.transactionId || '#TXN-CONFIRMED'}]
          </div>
          <div className="text-[10px] font-semibold text-slate-400 font-mono mt-1">
            [GUEST: {guestName || 'Valued Guest'} | TABLE: {tableNumber}]
          </div>
        </motion.div>

        {/* Direct Google Review Button */}
        <div>
          <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            [DIRECT GOOGLE REVIEW BUTTON]
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Opening Official Google Review Link')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50/80 py-3 text-xs font-extrabold text-amber-900 shadow-xs hover:bg-amber-100 transition"
          >
            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
            <span>⭐ [LEAVE A GOOGLE REVIEW]</span>
          </motion.button>
        </div>

        {/* Feedback & Review Option */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              [READY FEEDBACK OPTIONS (CHIPS)]
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => {
                const isSelected = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className={`rounded-full border px-3 py-1 text-[10.5px] font-bold transition ${
                      isSelected
                        ? 'border-orange-500 bg-orange-600 text-white shadow-xs'
                        : 'border-slate-200 bg-stone-50/80 text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    [{chip.toUpperCase()}]
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
              [CUSTOM FEEDBACK OPTION]
            </div>
            <input
              type="text"
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
              placeholder="[TYPE YOUR PERSONAL FEEDBACK HERE...]"
              className="w-full rounded-xl border border-slate-200 bg-stone-50/60 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFeedbackSubmitted(true);
                setTimeout(() => setFeedbackSubmitted(false), 2200);
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 py-2 text-[11px] font-extrabold text-slate-800 hover:bg-stone-100 transition"
            >
              <MessageSquare className="h-3.5 w-3.5 text-orange-600" />
              <span>{feedbackSubmitted ? '✓ [FEEDBACK RECORDED]' : '[SUBMIT FEEDBACK]'}</span>
            </motion.button>
          </div>
        </div>

        {/* Social & Direct Web Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [DIRECT INSTAGRAM]
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => alert('Opening Restaurant Instagram Profile')}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-800 shadow-xs hover:bg-slate-50 transition"
            >
              <Camera className="h-4 w-4 text-pink-600" />
              <span>📷 [INSTAGRAM]</span>
            </motion.button>
          </div>

          <div>
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [DIRECT WEBSITE]
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => alert('Opening Official Website')}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-800 shadow-xs hover:bg-slate-50 transition"
            >
              <Globe className="h-4 w-4 text-blue-600" />
              <span>🌐 [WEBSITE]</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky */}
      <StickyBottomBar label="[GO TO BILL PAGE BUTTON]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(9)}
          className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>📄 [VIEW OFFICIAL BILL &amp; INVOICE]</span>
          </div>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
