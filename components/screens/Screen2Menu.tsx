'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { ItemDrawer } from '../ui/ItemDrawer';
import { MenuItem } from '../../types/customer';
import { Search, Plus, Minus, Sparkles, ArrowRight, ShoppingCart, Flame, Utensils, Ban, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen2Menu: React.FC = () => {
  const {
    setCurrentScreen,
    menuItems,
    setSelectedDetailItem,
    addToCart,
    updateCartQuantity,
    cart,
    venueName,
    tableNumber,
  } = useCustomer();

  const { inventory86 } = useSharedBridge();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Vaul Bottom Sheet state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItem | null>(null);

  const categories = ['All', 'Starters', 'Rice & Bowls', 'Beverages'];
  const filters = ['All', 'Chef Special', 'Quick Serve'];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Chef Special' && item.badge === 'Chef Special') ||
      // (selectedFilter === 'Pure Veg' && !!item.isVeg) ||
      (selectedFilter === 'Quick Serve' && (item.category === 'Starters' || item.category === 'Desserts'));
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleOpenDetail = (item: MenuItem) => {
    setSelectedDetailItem(item);
    setCurrentScreen(3);
  };

  const handleOpenDrawer = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    setDrawerItem(item);
    setDrawerOpen(true);
  };

  const handleDrawerAddToCart = (
    item: MenuItem,
    selectedOption: string,
    selectedAddOns: string[],
    quantity: number
  ) => {
    addToCart(item, selectedOption, selectedAddOns, quantity);
    setAddedNotice(`Added ${item.name}!`);
    setTimeout(() => setAddedNotice(null), 1800);
  };

  const handleDecrementItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const matching = cart.filter((ci) => ci.menuItem.id === itemId);
    if (matching.length > 0) {
      const last = matching[matching.length - 1];
      updateCartQuantity(last.cartItemId, -1);
    }
  };

  const handleIncrementItem = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    const matching = cart.filter((ci) => ci.menuItem.id === item.id);
    if (matching.length > 0) {
      const last = matching[matching.length - 1];
      updateCartQuantity(last.cartItemId, 1);
    } else {
      addToCart(item);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <ScreenHousing screenNumber={2} screenTitle="MENU PAGE (DOUBLE COLUMN GRID)">
      <WireHeader
        title="Menu"
        leftSubtitle={`${venueName} | TABLE ${tableNumber}`}
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="bg-gradient-to-b from-[#fffaf1] to-[#fff] pb-2">
        <div className="px-4 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-orange-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Items"
              className="w-full rounded-2xl border border-orange-100 bg-white/90 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-[0_10px_20px_rgba(15,23,42,0.04)] focus:border-orange-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="border-b border-orange-100 bg-white/70 px-4 py-2 backdrop-blur-sm">
          <div className="mb-1 text-[9.5px] font-black tracking-[0.24em] text-slate-400">
            Food Categories
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black tracking-[0.08em] transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_10px_18px_rgba(234,88,12,0.24)]'
                      : 'bg-[#fff3e6] text-slate-700 hover:bg-[#ffe7cf]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-orange-100 bg-[#fff8f3] px-4 py-2">
          <div className="mb-1 text-[9.5px] font-black tracking-[0.24em] text-slate-400">
            Food Filters
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {filters.map((fil) => {
              const isActive = selectedFilter === fil;
              return (
                <button
                  key={fil}
                  onClick={() => setSelectedFilter(fil)}
                  className={`whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-[10px] font-black tracking-[0.08em] transition ${
                    isActive
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {fil}
                </button>
              );
            })}
          </div>
        </div>

        {addedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-2 rounded-2xl bg-slate-900 px-3 py-2 text-center text-xs font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
          >
            ✓ {addedNotice}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-2.5 p-3">
          {filteredItems.map((item) => {
            const item86 = inventory86.find((i) => i.id === item.id);
            const isSoldOut = !!item86?.is86;
            const prepDelay = item86?.prepDelayMinutes || 0;
            const itemCartQty = cart
              .filter((ci) => ci.menuItem.id === item.id)
              .reduce((sum, ci) => sum + ci.quantity, 0);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: isSoldOut ? 0 : -2 }}
                onClick={() => {
                  if (isSoldOut) {
                    setAddedNotice(`${item.name} is currently SOLD OUT (86) in Kitchen!`);
                    setTimeout(() => setAddedNotice(null), 2500);
                    return;
                  }
                  handleOpenDetail(item);
                }}
                className={`flex cursor-pointer flex-col justify-between rounded-[24px] border p-2.5 shadow-[0_12px_24px_rgba(15,23,42,0.04)] transition ${
                  isSoldOut
                    ? 'border-rose-200 bg-stone-50 opacity-60'
                    : 'border-orange-100 bg-white hover:border-orange-200 hover:shadow-[0_14px_28px_rgba(249,115,22,0.10)]'
                }`}
              >
                <div className="relative flex h-24 w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-orange-200 bg-gradient-to-br from-[#fff7ed] via-[#fff8eb] to-[#ffe7cf] p-2 text-center">
                  <span className="text-2xl">{isSoldOut ? '🚫' : '🍲'}</span>
                  <span className="mt-1 font-mono text-[9.5px] font-black text-orange-950 line-clamp-1">
                    {item.imagePlaceholder}
                  </span>
                  {isSoldOut ? (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[8.5px] font-black text-white shadow-sm">
                      86 Sold Out
                    </span>
                  ) : (
                    item.badge && (
                      <span className="absolute right-1.5 top-1.5 rounded-md bg-orange-600 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-white shadow-sm">
                        {item.badge}
                      </span>
                    )
                  )}
                  {prepDelay > 0 && !isSoldOut && (
                    <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-md bg-amber-500 px-1.5 py-0.2 text-[8px] font-black text-white shadow-sm">
                      <Clock className="h-2 w-2" />
                      <span>+{prepDelay}m Delay</span>
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  <div className="line-clamp-1 text-xs font-extrabold text-slate-900">
                    {item.name}
                  </div>
                  <div className="font-mono text-xs font-extrabold text-slate-800">
                    Price: ₹ {item.price}
                  </div>
                </div>

                {isSoldOut ? (
                  <div className="mt-2 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-stone-200 py-1.5 text-[11px] font-extrabold text-slate-400">
                    <span>Sold Out</span>
                  </div>
                ) : itemCartQty > 0 ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-1.5 py-1 text-xs font-black text-orange-950 shadow-sm"
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => handleDecrementItem(e, item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-orange-200 bg-white text-orange-700 transition hover:bg-orange-600 hover:text-white"
                      title="Remove 1 item"
                    >
                      <Minus className="h-3.5 w-3.5 stroke-[3]" />
                    </motion.button>
                    <span className="font-mono text-xs font-black tracking-tight text-slate-900">
                      {itemCartQty}
                    </span>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => handleIncrementItem(e, item)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600 text-white transition hover:bg-orange-700"
                      title="Add 1 more item"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleOpenDrawer(e, item)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-[#fff7ed] py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-orange-700 transition hover:bg-orange-600 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <StickyBottomBar >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(4)}
          className="flex w-full items-center justify-between rounded-[20px] bg-gradient-to-r from-[#1f2937] to-[#111827] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_32px_rgba(31,41,55,0.25)] transition hover:brightness-110"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            <span>Go To Cart</span>
            {totalCartCount > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black">
                {totalCartCount} Items
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {totalCartAmount > 0 && (
              <span className="font-mono text-sm font-bold text-amber-300">
                ₹ {totalCartAmount}
              </span>
            )}
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>

      {/* Vaul Bottom Sheet for Customization */}
      <ItemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={drawerItem}
        onAddToCart={handleDrawerAddToCart}
      />
    </ScreenHousing>
  );
};
