'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { WaiterTabletHousing } from './WaiterTabletHousing';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
import { MenuItem } from '../../types/customer';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Ban,
  UtensilsCrossed,
  CheckCircle2,
  X,
  Sliders,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHapticVibrate } from '../../lib/soundEffects';

// High quality culinary photography mapped to menu items
const ITEM_IMAGES: Record<string, string> = {
  'item-1': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
  'item-2': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&auto=format&fit=crop&q=80',
  'item-3': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  'item-4': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
  'item-5': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&auto=format&fit=crop&q=80',
  'item-6': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=80',
  'item-7': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&auto=format&fit=crop&q=80',
  'item-8': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&auto=format&fit=crop&q=80',
  'item-9': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Rice & Bowls': '🍛',
  'Starters': '🍗',
  'Mains': '🥘',
  'Breads': '🫓',
  'Desserts': '🥥',
};

export const ScreenW4TakeOrder: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    activeCaptain,
    orderCart,
    addToOrderCart,
    updateOrderCartQty,
    clearOrderCart,
  } = useWaiterStore();

  const { inventory86, tables, waiterFiresKOT, waiterSeatsGuests } = useSharedBridge();

  const cleanSelected = (selectedTableNumber || '').replace(/\D/g, '');
  const activeTable =
    tables.find((t) => t.number === selectedTableNumber) ||
    tables.find((t) => {
      const cleanT = t.number.replace(/\D/g, '');
      return cleanSelected !== '' && cleanT !== '' && cleanSelected === cleanT;
    });
  const currentTable = activeTable?.number || selectedTableNumber || 'A-02';

  const [selectedCat, setSelectedCat] = useState('ALL');
  const [query, setQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Quick review modal state (minimal, non-intrusive)
  const [showReview, setShowReview] = useState(false);
  const [kotSuccessNotice, setKotSuccessNotice] = useState(false);

  // Item Customization state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customSpice, setCustomSpice] = useState<'MILD' | 'MEDIUM' | 'SPICY'>('MEDIUM');
  const [customPortion, setCustomPortion] = useState<'REGULAR' | 'LARGE'>('REGULAR');
  const [customPrefTags, setCustomPrefTags] = useState<string[]>([]);
  const [customChefNote, setCustomChefNote] = useState('');

  const categories = [
    'ALL',
    'Chef Special',
    'Rice & Bowls',
    'Starters',
    'Mains',
    'Breads',
    'Desserts',
  ];

  const prefOptions = [
    'Less Oil',
    'No Onion',
    'Extra Crispy',
    'Separate Gravy',
    'Extra Spicy',
  ];

  const togglePrefTag = (tag: string) => {
    setCustomPrefTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  /* Filter Menu Items */
  const filtered = INITIAL_MENU_ITEMS.filter((i) => {
    const matchCat =
      selectedCat === 'ALL' ||
      (selectedCat === 'Chef Special' &&
        (i.badge === 'Chef Special' ||
          i.badge?.toLowerCase().includes('special') ||
          i.name.toLowerCase().includes('special') ||
          i.name.toLowerCase().includes('thoogudeepa'))) ||
      i.category === selectedCat;

    const matchQ =
      query === '' ||
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.description.toLowerCase().includes(query.toLowerCase());

    return matchCat && matchQ;
  });

  const cartCount = orderCart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = orderCart.reduce((s, i) => s + i.totalPrice, 0);

  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setCustomSpice('MEDIUM');
    setCustomPortion('REGULAR');
    setCustomPrefTags([]);
    setCustomChefNote('');
  };

  const handleSaveCustomization = () => {
    if (!customizingItem) return;

    const noteParts: string[] = [];
    if (customSpice !== 'MEDIUM') noteParts.push(customSpice);
    if (customPortion !== 'REGULAR') noteParts.push('Large');
    if (customPrefTags.length > 0) noteParts.push(customPrefTags.join(', '));
    if (customChefNote.trim()) noteParts.push(customChefNote.trim());

    const selectedOption = noteParts.length > 0 ? noteParts.join(' • ') : 'Standard';

    addToOrderCart(customizingItem, selectedOption, 1);
    triggerHapticVibrate(40);
    setCustomizingItem(null);
  };

  const handleFireKOTNow = () => {
    if (orderCart.length === 0) return;

    const captain = activeCaptain || 'Captain';
    const itemsToFire = orderCart.map((ci) => ({
      item: ci.menuItem,
      selectedOption: ci.selectedOption,
      quantity: ci.quantity,
    }));

    waiterFiresKOT(currentTable, captain, itemsToFire);

    const activeTable = tables.find((t) => t.number === currentTable);
    if (activeTable && activeTable.status === 'VACANT') {
      waiterSeatsGuests(currentTable, 1, captain);
    }

    triggerHapticVibrate([60, 50, 100]);
    clearOrderCart();
    setShowReview(false);
    setKotSuccessNotice(true);

    setTimeout(() => {
      setKotSuccessNotice(false);
      setCurrentScreen(3);
    }, 700);
  };

  return (
    <WaiterTabletHousing
      screenNumber={4}
      screenTitle="ORDER PAD"
    >
      <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-hidden bg-stone-50/70 relative font-mono">

        {/* Top Bar: Back & Search */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentScreen(3)}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs text-xs font-black active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Table {currentTable}</span>
            {activeTable?.mergedWith && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[8.5px] font-black uppercase tracking-wider">
                MERGED
              </span>
            )}
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-full text-[10.5px] font-black shrink-0 transition cursor-pointer shadow-2xs ${
                selectedCat === c
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Success Notice */}
        <AnimatePresence>
          {kotSuccessNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs font-black z-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>KOT Fired</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items Grid: 2 Items per Row */}
        <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
              <UtensilsCrossed className="h-7 w-7 text-slate-300" />
              <span className="font-bold text-slate-700">No dishes found</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filtered.map((item) => {
                const isSoldOut = inventory86?.some((it) => it.id === item.id && it.is86);
                const inCart = orderCart.find((ci) => ci.menuItem.id === item.id);
                const qty = inCart ? inCart.quantity : 0;
                const imageUrl = (item as any).image || ITEM_IMAGES[item.id] || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between transition duration-150 shadow-2xs ${
                      isSoldOut
                        ? 'bg-stone-50 border-slate-200 opacity-60'
                        : qty > 0
                        ? 'bg-orange-50/40 border-orange-500 ring-2 ring-orange-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-full h-24 bg-slate-100 overflow-hidden select-none shrink-0">
                      {!imageErrors[item.id] ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-slate-700">
                          <span className="text-2xl">{CATEGORY_ICONS[item.category] || '🍛'}</span>
                          <span className="text-[9px] font-mono font-bold text-orange-900 mt-0.5 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      )}

                      {/* Veg / Non-Veg Indicator */}
                      <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs border border-slate-200/80">
                        <span
                          className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                      </div>

                      {/* Floating Badge */}
                      {item.badge && !isSoldOut && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider shadow-xs bg-slate-950/85 text-amber-300 backdrop-blur-xs border border-white/20">
                          {item.badge}
                        </span>
                      )}

                      {/* Sold Out Overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-1">
                          <span className="text-[9px] font-black text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-500 uppercase tracking-wider flex items-center gap-1">
                            <Ban className="h-2.5 w-2.5" />
                            <span>Sold Out</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        <h3
                          className="font-mono text-xs font-black text-slate-950 line-clamp-2 leading-snug min-h-[30px]"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <div className="text-[10px] text-slate-400 font-mono font-semibold truncate mt-0.5">
                          {item.prepMode || item.category}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-mono text-xs font-black text-orange-600">
                          ₹{item.price}
                        </span>

                        {!isSoldOut && (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomize(item)}
                            className="text-[9.5px] font-mono font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 transition cursor-pointer"
                            title="Customize item"
                          >
                            <Sliders className="h-2.5 w-2.5 text-slate-500" />
                            <span>Opt</span>
                          </button>
                        )}
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-0.5">
                        {isSoldOut ? (
                          <button
                            type="button"
                            disabled
                            className="w-full h-7 rounded-lg bg-stone-100 text-slate-400 font-mono text-[10px] font-bold cursor-not-allowed border border-slate-200 flex items-center justify-center gap-1"
                          >
                            <Ban className="h-2.5 w-2.5" />
                            <span>Sold Out</span>
                          </button>
                        ) : qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              addToOrderCart(item);
                              triggerHapticVibrate(30);
                            }}
                            className="w-full h-7 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-900 hover:text-white border border-orange-300 font-mono text-[11px] font-black transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                          >
                            <Plus className="h-3 w-3 stroke-[3]" />
                            <span>ADD</span>
                          </button>
                        ) : (
                          <div className="w-full h-7 flex items-center justify-between bg-orange-100 border border-orange-300 rounded-lg px-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (inCart) updateOrderCartQty(inCart.cartItemId, -1);
                                triggerHapticVibrate(25);
                              }}
                              className="h-5 w-5 rounded bg-white text-slate-900 font-black flex items-center justify-center text-[10px] shadow-2xs cursor-pointer active:scale-90"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>

                            <span className="font-mono font-black text-xs text-orange-950 px-1">
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (inCart) updateOrderCartQty(inCart.cartItemId, 1);
                                triggerHapticVibrate(25);
                              }}
                              className="h-5 w-5 rounded bg-orange-600 text-white font-black flex items-center justify-center text-[10px] shadow-2xs cursor-pointer active:scale-90"
                            >
                              <Plus className="h-2.5 w-2.5 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clean Sticky Bottom Bar: No Giant Shopping Cart */}
        {cartCount > 0 && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30">
            <div className="rounded-2xl bg-slate-950 text-white p-2.5 shadow-2xl border-2 border-orange-500/40 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 text-left"
              >
                <div className="h-8 w-8 rounded-xl bg-orange-600 flex items-center justify-center font-black text-xs text-white shrink-0">
                  {cartCount}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Order Summary
                  </div>
                  <div className="text-sm font-black text-orange-400">
                    ₹{cartTotal}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleFireKOTNow}
                className="h-9 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 shrink-0"
              >
                <Flame className="h-3.5 w-3.5 fill-white" />
                <span>Fire KOT</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimal Order Review Sheet */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end justify-center p-3"
            >
              <motion.div
                initial={{ y: 150 }}
                animate={{ y: 0 }}
                exit={{ y: 150 }}
                className="w-full bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-2xl space-y-3 font-mono"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-sm text-slate-900">
                    Selected Items ({cartCount})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearOrderCart}
                      className="text-[10px] text-rose-600 font-bold px-2 py-0.5 rounded bg-rose-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReview(false)}
                      className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {orderCart.map((ci) => (
                    <div
                      key={ci.cartItemId}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100"
                    >
                      <div className="truncate flex-1 pr-2">
                        <span className="font-bold text-slate-900">{ci.menuItem.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{ci.selectedOption}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-orange-600">₹{ci.totalPrice}</span>
                        <div className="flex items-center gap-1 bg-stone-100 px-1 py-0.5 rounded">
                          <button
                            type="button"
                            onClick={() => updateOrderCartQty(ci.cartItemId, -1)}
                            className="h-4 w-4 bg-white text-xs font-bold rounded flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold min-w-3 text-center">{ci.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateOrderCartQty(ci.cartItemId, 1)}
                            className="h-4 w-4 bg-orange-600 text-white text-xs font-bold rounded flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-sm">Total: ₹{cartTotal}</span>
                  <button
                    type="button"
                    onClick={handleFireKOTNow}
                    className="px-4 py-2 bg-orange-600 text-white text-xs font-black rounded-xl active:scale-95"
                  >
                    Fire KOT
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customization Modal */}
        <AnimatePresence>
          {customizingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end justify-center p-3"
            >
              <motion.div
                initial={{ y: 150 }}
                animate={{ y: 0 }}
                exit={{ y: 150 }}
                className="w-full bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-2xl space-y-3 font-mono"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-sm text-slate-900 truncate pr-2">
                    {customizingItem.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomizingItem(null)}
                    className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Spice */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Spice:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['MILD', 'MEDIUM', 'SPICY'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCustomSpice(lvl)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          customSpice === lvl
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-stone-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lvl === 'MILD' ? 'Mild 🌶' : lvl === 'MEDIUM' ? 'Medium 🌶🌶' : 'Spicy 🌶🌶🌶'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preference Tags */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Options:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {prefOptions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => togglePrefTag(tag)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                          customPrefTags.includes(tag)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-stone-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {tag} {customPrefTags.includes(tag) ? '✓' : '+'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Note:</div>
                  <input
                    type="text"
                    placeholder="e.g. Less oil..."
                    value={customChefNote}
                    onChange={(e) => setCustomChefNote(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-stone-50 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomizingItem(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomization}
                    className="flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-black shadow-md active:scale-95"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </WaiterTabletHousing>
  );
};