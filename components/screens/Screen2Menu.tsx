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

  const categories = ['All', 'Starters', 'Mains', 'Breads', 'Rice & Bowls', 'Desserts'];
  const filters = ['All', 'Pure Veg', 'Chef Special', 'Quick Serve'];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Chef Special' && item.badge === 'Chef Special') ||
      (selectedFilter === 'Pure Veg');
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
      {/* Top Header */}
      <WireHeader
        title="[MENU PAGE]"
        leftSubtitle={`[VENUE: ${venueName} | TABLE ${tableNumber}]`}
        showBack={false}
        showCallWaiter={true}
        showCart={true}
      />

      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          [SEARCH TAB]
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 [SEARCH TAB / SEARCH ITEMS]"
            className="w-full rounded-xl border border-slate-200 bg-stone-50/70 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Food Categories Horizontal Bar */}
      <div className="px-4 py-1.5 bg-white border-b border-slate-100">
        <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          [FOOD CATEGORIES]
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                [{cat.toUpperCase()}]
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Dietary Filters */}
      <div className="px-4 py-2 bg-stone-50 border-b border-slate-200/60">
        <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          [FOOD FILTERS]
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {filters.map((fil) => {
            const isActive = selectedFilter === fil;
            return (
              <button
                key={fil}
                onClick={() => setSelectedFilter(fil)}
                className={`whitespace-nowrap rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold tracking-tight transition ${
                  isActive
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                [{fil.toUpperCase()}]
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notice */}
      {addedNotice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-2 rounded-xl bg-slate-900 p-2 text-center text-xs font-bold text-white shadow-md"
        >
          ✓ {addedNotice}
        </motion.div>
      )}

      {/* Label for Double Column Grid */}
      <div className="px-4 pt-3">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          [MENU ITEMS: DOUBLE COLUMN GRID WITH SMALL ADD BUTTON BELOW]
        </div>
      </div>

      {/* Double Column Grid */}
      <div className="grid grid-cols-2 gap-2.5 p-3 flex-1 overflow-y-auto">
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
                  setAddedNotice(`[${item.name}] is currently SOLD OUT (86) in Kitchen!`);
                  setTimeout(() => setAddedNotice(null), 2500);
                  return;
                }
                handleOpenDetail(item);
              }}
              className={`flex flex-col justify-between rounded-2xl border p-2.5 shadow-xs transition cursor-pointer ${
                isSoldOut
                  ? 'border-rose-200 bg-stone-50 opacity-60'
                  : 'border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              {/* Visual Container */}
              <div className="relative flex h-24 w-full flex-col items-center justify-center rounded-xl border border-dashed border-orange-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-2 text-center">
                <span className="text-2xl">{isSoldOut ? '🚫' : '🍲'}</span>
                <span className="font-mono text-[9.5px] font-black text-orange-950 mt-1 line-clamp-1">
                  [{item.imagePlaceholder}]
                </span>
                {isSoldOut ? (
                  <span className="absolute top-1.5 right-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-white shadow-xs">
                    86 SOLD OUT
                  </span>
                ) : (
                  item.badge && (
                    <span className="absolute top-1.5 right-1.5 rounded-md bg-orange-600 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-white shadow-xs">
                      {item.badge}
                    </span>
                  )
                )}
                {prepDelay > 0 && !isSoldOut && (
                  <span className="absolute bottom-1 right-1 rounded-md bg-amber-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-xs flex items-center gap-0.5">
                    <Clock className="h-2 w-2" />
                    <span>+{prepDelay}m delay</span>
                  </span>
                )}
              </div>

              {/* Name & Price */}
              <div className="mt-2 space-y-0.5">
                <div className="font-extrabold text-xs text-slate-900 line-clamp-1">
                  [{item.name}]
                </div>
                <div className="font-mono text-xs font-extrabold text-slate-800">
                  [PRICE: ₹ {item.price}]
                </div>
              </div>

              {/* Add Button or Quantity Stepper */}
              {isSoldOut ? (
                <div className="mt-2 flex w-full items-center justify-center rounded-xl bg-stone-200 py-1.5 text-[11px] font-extrabold uppercase text-slate-400 border border-slate-300 cursor-not-allowed">
                  <span>[SOLD OUT]</span>
                </div>
              ) : itemCartQty > 0 ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 flex w-full items-center justify-between rounded-xl border border-orange-500 bg-orange-50 px-1.5 py-1 text-xs font-black text-orange-950 shadow-xs"
                >
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => handleDecrementItem(e, item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-600 hover:text-white transition shadow-2xs"
                    title="Remove 1 item"
                  >
                    <Minus className="h-3.5 w-3.5 stroke-[3]" />
                  </motion.button>
                  <span className="font-mono text-xs font-black text-slate-900 tracking-tight">
                    [{itemCartQty}]
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => handleIncrementItem(e, item)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition shadow-2xs"
                    title="Add 1 more item"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleOpenDrawer(e, item)}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-orange-300 bg-orange-50/80 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-orange-700 hover:bg-orange-600 hover:text-white transition"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>[ADD]</span>
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom: Go To Cart Button */}
      <StickyBottomBar label="[GO TO CART BUTTON]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(4)}
          className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            <span>🛒 [GO TO CART]</span>
            {totalCartCount > 0 && (
              <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold">
                {totalCartCount} items
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
