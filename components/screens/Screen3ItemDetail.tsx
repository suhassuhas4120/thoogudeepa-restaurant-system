'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { ShoppingCart, ArrowRight, Check, Sparkles, Utensils, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen3ItemDetail: React.FC = () => {
  const { setCurrentScreen, selectedDetailItem, addToCart } = useCustomer();
  const { inventory86 } = useSharedBridge();

  const item = selectedDetailItem;
  const item86 = inventory86.find((i) => i.id === item.id);
  const isSoldOut = !!item86?.is86;

  const [selectedOption, setSelectedOption] = useState<string>(
    item.optionsGroup1.choices[0] || 'Standard'
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const handleToggleAddOn = (addonName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  const handleAddAndGoToCart = () => {
    if (isSoldOut) return;
    addToCart(item, selectedOption, selectedAddOns, 1);
    setCurrentScreen(4);
  };

  // Compute calculated total
  let currentTotal = item.price;
  selectedAddOns.forEach((addonName) => {
    const found = item.optionsGroup2.addOns.find((a) => a.name === addonName);
    if (found) currentTotal += found.extraPrice;
  });

  return (
    <ScreenHousing screenNumber={3} screenTitle="DETAILED ITEM PAGE">
      {/* Top Header */}
      <WireHeader
        title="Item Details"
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Big Item Image Space */}
        <div>
          <div className="relative flex h-44 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-gradient-to-tr from-amber-100/60 via-orange-50 to-white p-4 shadow-sm text-center">
            <span className="text-4xl">🍛</span>
            <span className="mt-2 font-mono text-xs font-black tracking-wider text-orange-950">
              Big Item Image Container: {item.imagePlaceholder}
            </span>
            <span className="mt-1 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
              Prep Mode: {item.prepMode}
            </span>
          </div>
        </div>

        {/* Item Name & Price */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="text-base font-black text-slate-900 mt-0.5">
            {item.name}
          </div>
          <div className="text-sm font-extrabold text-orange-600 font-mono mt-0.5">
            PRICE: ₹ {item.price}
          </div>
        </div>

        {/* Item Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="text-[9.5px] font-bold tracking-wider text-slate-400 font-mono">
            Food Description
          </div>
          <p className="text-xs leading-relaxed text-slate-600 mt-1">
            {item.description}
          </p>
        </div>

        {/* Customisable Options Group 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="text-[9.5px] font-bold tracking-wider text-slate-400 font-mono">
            Flavours
          </div>
          <div className="mt-2 space-y-1.5">
            {item.optionsGroup1.choices.map((choice) => {
              const isSelected = selectedOption === choice;
              return (
                <label
                  key={choice}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer border transition ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950'
                      : 'border-slate-200 bg-stone-50/60 text-slate-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{choice}</span>
                  <input
                    type="radio"
                    name="screen3-opt1"
                    checked={isSelected}
                    onChange={() => setSelectedOption(choice)}
                    className="accent-orange-600 h-4 w-4"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Customisable Options Group 2: Add-Ons */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="text-[9.5px] font-bold tracking-wider text-slate-400 font-mono">
            Add-Ons
          </div>
          <div className="mt-2 space-y-1.5">
            {item.optionsGroup2.addOns.map((addon) => {
              const isChecked = selectedAddOns.includes(addon.name);
              return (
                <label
                  key={addon.name}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer border transition ${
                    isChecked
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950'
                      : 'border-slate-200 bg-stone-50/60 text-slate-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{addon.name}</span>
                    <span className="font-mono text-orange-600 font-bold">(₹ {addon.extraPrice})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleAddOn(addon.name)}
                    className="accent-orange-600 h-4 w-4 rounded"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky: Go To Cart Button */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: isSoldOut ? 1 : 0.98 }}
          disabled={isSoldOut}
          onClick={handleAddAndGoToCart}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition ${
            isSoldOut
              ? 'bg-stone-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-orange-600 shadow-orange-600/30 hover:bg-orange-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {isSoldOut ? <Ban className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4 stroke-[2.2]" />}
            <span>{isSoldOut ? '🚫 Item Sold Out In Kitchen (86)' : 'Add To Cart'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold text-amber-200">
              ₹ {currentTotal}
            </span>
            {!isSoldOut && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
