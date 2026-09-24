'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
import { MenuItem } from '../../types/customer';
import { ArrowLeft, Search, Plus, Minus, ShoppingBag, ArrowRight, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenW4TakeOrder: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    orderCart,
    addToOrderCart,
    updateOrderCartQty,
  } = useWaiterStore();

  const { inventory86 } = useSharedBridge();

  const [selectedCat, setSelectedCat] = useState('ALL');
  const [query, setQuery] = useState('');

  const categories = ['ALL', 'Rice & Bowls', 'Starters', 'Desserts'];

  const filtered = INITIAL_MENU_ITEMS.filter((i) => {
    const matchCat = selectedCat === 'ALL' || i.category === selectedCat;
    const matchQ = i.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const cartCount = orderCart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = orderCart.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <WaiterTabletHousing screenNumber={4} screenTitle="MENU ORDER ENTRY & KOT PUNCH">
      <div className="flex-1 flex flex-col p-3 space-y-2 overflow-hidden">
        {/* Top Search & Back */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentScreen(3)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dish name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1 rounded-lg font-mono text-[10.5px] font-black whitespace-nowrap transition ${
                selectedCat === c
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Food Items 2-Col Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-2">
          {filtered.map((item) => {
            const item86 = inventory86.find((i) => i.id === item.id);
            const isSoldOut = !!item86?.is86;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-2.5 flex flex-col justify-between shadow-2xs transition ${
                  isSoldOut
                    ? 'bg-stone-50 border-rose-200 opacity-60'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 line-clamp-1">{item.name}</span>
                    {isSoldOut && (
                      <span className="text-[8px] font-black bg-rose-600 text-white px-1 py-0.2 rounded">
                        86 SOLD OUT
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs font-black text-orange-600 mt-0.5">
                    ₹ {item.price}
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  {(() => {
                    const inCart = orderCart.find((ci) => ci.menuItem.id === item.id);
                    const qty = inCart ? inCart.quantity : 0;

                    if (isSoldOut) {
                      return (
                        <button
                          disabled
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-mono font-black flex items-center justify-center gap-1 bg-stone-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        >
                          <Ban className="h-2.5 w-2.5" />
                          <span>Sold Out</span>
                        </button>
                      );
                    }

                    if (qty === 0) {
                      return (
                        <button
                          onClick={() => addToOrderCart(item)}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-mono font-black flex items-center justify-center gap-1 transition bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Add</span>
                        </button>
                      );
                    }

                    return (
                      <div className="flex-1 flex items-center justify-between rounded-lg border border-orange-300 bg-orange-50 px-1 py-0.5">
                        <button
                          onClick={() => inCart && updateOrderCartQty(inCart.cartItemId, -1)}
                          className="w-5 h-5 rounded bg-white text-slate-900 font-black flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="font-mono text-xs font-black text-orange-950">
                          {qty}
                        </span>
                        <button
                          onClick={() => inCart && updateOrderCartQty(inCart.cartItemId, 1)}
                          className="w-5 h-5 rounded bg-orange-600 text-white font-black flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })()}
                  {!isSoldOut && (
                    <button
                      onClick={() => {
                        addToOrderCart(item);
                        setCurrentScreen(5);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10px] font-mono font-bold transition cursor-pointer"
                    >
                      Customize
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Bottom CTA */}
        {cartCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen(5)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-600 text-white font-mono text-xs font-black shadow-lg shadow-orange-600/30 shrink-0 cursor-pointer"
          >
            <span>Review KOT Order ({cartCount} items)</span>
            <span>₹ {cartTotal} ➔</span>
          </motion.button>
        )}
      </div>
    </WaiterTabletHousing>
  );
};
