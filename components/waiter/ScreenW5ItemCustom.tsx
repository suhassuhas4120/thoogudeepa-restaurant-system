'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { ArrowLeft, Plus, Minus, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW5ItemCustom: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    activeCaptain,
    orderCart,
    updateOrderCartQty,
    clearOrderCart,
  } = useWaiterStore();
  const { waiterFiresKOT } = useSharedBridge();

  const [dietaryNote, setDietaryNote] = useState('');
  const cartTotal = orderCart.reduce((s, i) => s + i.totalPrice, 0);

  const handleFireKOT = () => {
    if (orderCart.length === 0) return;
    const tableNum = selectedTableNumber || 'A-04';
    const captain = activeCaptain || 'Floor Captain';

    const itemsToFire = orderCart.map((ci) => ({
      item: ci.menuItem,
      selectedOption: dietaryNote
        ? `${ci.selectedOption} • Note: ${dietaryNote}`
        : ci.selectedOption,
      quantity: ci.quantity,
    }));

    waiterFiresKOT(tableNum, captain, itemsToFire);
    clearOrderCart();
    setCurrentScreen(3);
  };

  return (
    <WaiterTabletHousing screenNumber={5} screenTitle="ORDER CUSTOMIZATION & KOT DISPATCH">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen(4)}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Back to Menu</span>
            </button>
            <span className="font-mono text-xs font-black text-slate-900">
              Table: {selectedTableNumber}
            </span>
          </div>

          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">
            KOT Items for Kitchen Submission
          </div>

          {/* Cart List */}
          <div className="space-y-2">
            {orderCart.length > 0 ? (
              orderCart.map((ci) => (
                <div
                  key={ci.cartItemId}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {ci.menuItem.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      ₹ {ci.totalPrice} • {ci.selectedOption}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateOrderCartQty(ci.cartItemId, -1)}
                      className="h-6 w-6 rounded bg-white font-mono font-bold text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="min-w-4 text-center font-mono font-bold text-xs">
                      {ci.quantity}
                    </span>
                    <button
                      onClick={() => updateOrderCartQty(ci.cartItemId, 1)}
                      className="h-6 w-6 rounded bg-white font-mono font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-xl bg-white">
                No dishes in cart. Tap back to add items.
              </div>
            )}
          </div>

          {/* Kitchen Dietary Notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <label className="text-[10px] font-bold font-mono uppercase text-slate-500">
              Special Guest Dietary Instructions / Chef Notes
            </label>
            <input
              type="text"
              value={dietaryNote}
              onChange={(e) => setDietaryNote(e.target.value)}
              placeholder="e.g. Less spicy, Extra salan on side..."
              className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-stone-50 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Submit KOT Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={orderCart.length === 0}
          onClick={handleFireKOT}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-600 text-white font-mono text-xs font-black shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 fill-white" />
            <span>Fire KOT to Kitchen</span>
          </div>
          <span>₹ {cartTotal} ➔</span>
        </motion.button>
      </div>
    </WaiterTabletHousing>
  );
};
