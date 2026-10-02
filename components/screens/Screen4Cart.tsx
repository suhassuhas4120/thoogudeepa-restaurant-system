'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Plus, Minus, Flame, ArrowRight, ShoppingBag, Utensils, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen4Cart: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    updateCartQuantity,
    orderSeparately,
    placeAllOrders,
  } = useCustomer();

  const [separateNotice, setSeparateNotice] = useState<string | null>(null);

  const handleSeparateOrder = (cartItemId: string, name: string) => {
    orderSeparately(cartItemId);
    setSeparateNotice(`Order fired separately for ${name}!`);
    setTimeout(() => setSeparateNotice(null), 2500);
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <ScreenHousing screenNumber={4} screenTitle="CART">
      {/* Header */}
      <WireHeader
        title="Cart"
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {separateNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white shadow-md"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>⚡ {separateNotice}</span>
          </motion.div>
        )}

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <ShoppingBag className="h-12 w-12 text-slate-300 stroke-[1.5]" />
            <div className="mt-3 text-sm font-extrabold text-slate-900">Cart Is Empty</div>
            <p className="mt-1 text-xs text-slate-500">Explore the Delicious Menu</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen(2)}
              className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm"
            >
              Browse Menu
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            {cart.map((ci) => {
              const isLocked = !!ci.isOrdered;

              return (
                <motion.div
                  key={ci.cartItemId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col gap-2.5 rounded-2xl border p-3 shadow-xs transition ${
                    isLocked
                      ? 'bg-slate-50/90 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-orange-200 bg-gradient-to-br from-amber-50 to-orange-50 text-[10px] font-black text-orange-900 font-mono">
                      <span className="text-base">{isLocked ? '🔒' : '🥘'}</span>
                      <span>IMG</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate text-xs font-extrabold text-slate-900">
                          {ci.menuItem.name}
                        </span>
                        {isLocked && (
                          <span className="rounded bg-slate-200 text-slate-700 text-[9px] font-mono font-bold px-1.5 py-0.2">
                            Already Sent To Kitchen
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">
                        Custom: {ci.selectedOption}
                        {ci.selectedAddOns.length > 0 ? ` + ${ci.selectedAddOns.join(', ')}` : ''}
                      </div>
                      <div className="font-mono text-xs font-black text-slate-900 mt-1">
                        Price: ₹ {ci.totalPrice}
                      </div>
                    </div>

                    {/* Quantity Stepper (+,-) */}
                    <div className={`flex items-center gap-1.5 rounded-xl border p-1 shadow-xs ${
                      isLocked ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-stone-50 border-slate-200'
                    }`}>
                      <motion.button
                        whileTap={{ scale: isLocked ? 1 : 0.85 }}
                        disabled={isLocked}
                        onClick={() => !isLocked && updateCartQuantity(ci.cartItemId, -1)}
                        className={`flex h-6 w-6 items-center justify-center rounded-lg bg-white font-black text-slate-700 shadow-xs ${
                          isLocked ? 'cursor-not-allowed opacity-40' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Minus className="h-3 w-3 stroke-[2.5]" />
                      </motion.button>
                      <span className="min-w-5 text-center font-mono text-xs font-black text-slate-900">
                        {ci.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: isLocked ? 1 : 0.85 }}
                        disabled={isLocked}
                        onClick={() => !isLocked && updateCartQuantity(ci.cartItemId, 1)}
                        className={`flex h-6 w-6 items-center justify-center rounded-lg bg-white font-black text-slate-700 shadow-xs ${
                          isLocked ? 'cursor-not-allowed opacity-40' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Separate Ordering Button or Locked Status */}
                  {isLocked ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-1 text-center text-[10px] font-mono font-bold text-slate-500">
                      ✓ Order has been successfully sent to the kitchen
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSeparateOrder(ci.cartItemId, ci.menuItem.name)}
                      className="rounded-xl border border-slate-200 bg-stone-50/70 py-1.5 text-[10.5px] font-extrabold tracking-wide text-slate-700 hover:bg-stone-100 transition"
                    >
                      Order This Item Separately
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Sticky: Place Order Button */}
      {(() => {
        const newItems = cart.filter((c) => !c.isOrdered);
        const newItemsTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const hasNewItems = newItems.length > 0;

        return (
          <StickyBottomBar >
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={cart.length === 0}
              onClick={placeAllOrders}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition ${
                hasNewItems
                  ? 'bg-orange-600 shadow-orange-600/30 hover:bg-orange-700'
                  : 'bg-slate-900 shadow-slate-900/30 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 stroke-[2.2]" />
                <span>
                  {hasNewItems
                    ? `Place Order (${newItems.length} New Item${newItems.length > 1 ? 's' : ''})`
                    : 'Live Order Status'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold text-amber-200">
                  ₹ {hasNewItems ? newItemsTotal : totalCartAmount}
                </span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </motion.button>
          </StickyBottomBar>
        );
      })()}
    </ScreenHousing>
  );
};
