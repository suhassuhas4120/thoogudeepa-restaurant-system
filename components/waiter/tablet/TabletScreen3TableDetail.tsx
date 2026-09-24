'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { INITIAL_MENU_ITEMS } from '../../../data/menuItems';
import { MenuItem } from '../../../types/customer';
import {
  ArrowLeft,
  CreditCard,
  Users,
  Trash2,
  Utensils,
  Check,
  Plus,
  Minus,
  Search,
  Flame,
  QrCode,
  Smartphone,
  Printer,
  MessageCircle,
  CheckCircle2,
  ShoppingBag,
  Ban,
  Lock,
  X,
} from 'lucide-react';

type RightPaneMode = 'bill_summary' | 'take_order' | 'item_custom' | 'merge' | 'payment' | 'bill_done';

export const TabletScreen3TableDetail: React.FC = () => {
  const {
    selectedTableNumber,
    setCurrentScreen,
    activeCaptain,
  } = useWaiterStore();
  const {
    tables,
    inventory86,
    waiterMergeTables,
    waiterFiresKOT,
    waiterRecordsPayment,
    waiterVacatesTable,
  } = useSharedBridge();

  const [rightPane, setRightPane] = useState<RightPaneMode>('bill_summary');
  const [selectedMergeChip, setSelectedMergeChip] = useState<string>('A-02');
  const [mergeConfirmed, setMergeConfirmed] = useState(false);
  const [vacateNotice, setVacateNotice] = useState<string | null>(null);
  const [kotNotice, setKotNotice] = useState<string | null>(null);
  const [isPaymentDone, setIsPaymentDone] = useState(false);
  const [printSent, setPrintSent] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Take Orders State (Screen 4 within Right Pane)
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [draftCart, setDraftCart] = useState<Array<{ item: MenuItem; quantity: number; selectedOption: string }>>([]);

  // Item Customization State (Screen 5 within Right Pane)
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [portion, setPortion] = useState<'REGULAR' | 'LARGE'>('REGULAR');
  const [spice, setSpice] = useState<'MILD' | 'MEDIUM' | 'VERY SPICY'>('MEDIUM');
  const [options, setOptions] = useState({ lessSpice: true, noOnion: false, extraCheese: false, extraSauce: false });
  const [chefNote, setChefNote] = useState('');

  // Payment State (Screen 7 within Right Pane)
  const [payMode, setPayMode] = useState<'CASH' | 'UPI' | 'POS'>('CASH');

  const activeTable = tables.find((t) => t.number === selectedTableNumber) || tables[0];
  const runningTotal = activeTable?.currentBill || 0;
  const subtotal = Math.round(runningTotal / 1.05);
  const gst = Math.round(subtotal * 0.05);
  const serviceCharge = Math.round(subtotal * 0.05);

  const canVacate = isPaymentDone || activeTable?.status === 'BILLING';

  const categories = ['ALL', 'BIRYANI', 'STARTERS', 'GRAVY & SIDES', 'BEVERAGES'];

  const filteredMenuItems = INITIAL_MENU_ITEMS.filter((item) => {
    const matchCat =
      selectedCat === 'ALL' ||
      item.category.toUpperCase().includes(selectedCat) ||
      (selectedCat === 'BIRYANI' && item.name.toLowerCase().includes('biryani'));
    const matchSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableTablesToMerge = tables
    .filter((t) => t.number !== activeTable?.number && t.number !== activeTable?.mergedWith)
    .map((t) => t.number);

  // Cart operations for Take Order (Screen 4)
  const handleAddItem = (item: MenuItem) => {
    setDraftCart((prev) => {
      const idx = prev.findIndex((p) => p.item.id === item.id);
      if (idx > -1) {
        return prev.map((p, i) => (i === idx ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { item, quantity: 1, selectedOption: 'Standard' }];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setDraftCart((prev) =>
      prev
        .map((p) => {
          if (p.item.id === itemId) {
            const nextQty = p.quantity + delta;
            return nextQty > 0 ? { ...p, quantity: nextQty } : null;
          }
          return p;
        })
        .filter(Boolean) as Array<{ item: MenuItem; quantity: number; selectedOption: string }>
    );
  };

  const draftItemCount = draftCart.reduce((s, i) => s + i.quantity, 0);
  const draftTotal = draftCart.reduce((s, i) => s + i.item.price * i.quantity, 0);

  // Confirm and fire KOT from Take Order
  const handleFireDraftKOT = () => {
    if (draftCart.length === 0) return;
    waiterFiresKOT(
      activeTable.number,
      activeCaptain || 'Captain Ramesh',
      draftCart.map((d) => ({
        item: d.item,
        selectedOption: d.selectedOption,
        quantity: d.quantity,
      }))
    );
    setDraftCart([]);
    setKotNotice(`✓ KOT FIRED TO KITCHEN FOR TABLE ${activeTable.number}!`);
    setTimeout(() => {
      setKotNotice(null);
      setRightPane('bill_summary');
    }, 2000);
  };

  // Open customization (Screen 5)
  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setRightPane('item_custom');
  };

  // Fire KOT from Customization page
  const handleFireCustomKOT = () => {
    if (!customizingItem) return;
    const addOnPrice = (portion === 'LARGE' ? 60 : 0) + (options.extraCheese ? 40 : 0);
    const customizedItem: MenuItem = {
      ...customizingItem,
      price: customizingItem.price + addOnPrice,
    };
    waiterFiresKOT(activeTable.number, activeCaptain || 'Captain Ramesh', [
      {
        item: customizedItem,
        selectedOption: `${portion} • Spice: ${spice}`,
        quantity: 1,
      },
    ]);
    setKotNotice(`✓ CUSTOM KOT FIRED TO KITCHEN FOR ${customizingItem.name.toUpperCase()}!`);
    setTimeout(() => {
      setKotNotice(null);
      setCustomizingItem(null);
      setRightPane('bill_summary');
    }, 2000);
  };

  // Merge table confirmation
  const handleConfirmMerge = () => {
    waiterMergeTables(activeTable.number, selectedMergeChip);
    setMergeConfirmed(true);
    setTimeout(() => setMergeConfirmed(false), 3000);
  };

  // Payment confirmation (Screen 7 -> Screen 8)
  const handleConfirmPayment = () => {
    waiterRecordsPayment(activeTable.number, payMode, runningTotal);
    setIsPaymentDone(true);
    setRightPane('bill_done');
  };

  // Direct Vacate (Screen 8 or Left Action)
  const handleDirectVacate = () => {
    if (!canVacate) return;
    waiterVacatesTable(activeTable.number);
    setIsPaymentDone(false);
    setVacateNotice(`✓ TABLE ${activeTable.number} IS NOW VACANT & AVAILABLE!`);
    setTimeout(() => {
      setVacateNotice(null);
      setRightPane('bill_summary');
    }, 2500);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={3}
      screenTitle="DETAILED TABLE VIEW & DYNAMIC COMMAND HUB"
    >
      <div className="flex flex-col flex-1 min-h-[700px]">
        {/* TOP HEADER */}
        <div className="border-b-2 border-slate-800 bg-white px-5 py-2.5 flex items-center justify-between shrink-0 font-mono text-xs select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen(2)}
              className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>[⬅ BACK TO ALL TABLES (SCREEN 2)]</span>
            </button>
            <h3 className="font-black text-slate-950 text-sm">
              {activeTable.mergedWith
                ? `[TABLE ${activeTable.number} + ${activeTable.mergedWith} (MERGED)]`
                : `[${activeTable.number} SELECTED]`}
            </h3>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
              activeTable.status === 'OCCUPIED'
                ? 'bg-orange-50 text-orange-950 border-orange-300'
                : activeTable.status === 'BILLING'
                ? 'bg-purple-50 text-purple-950 border-purple-300'
                : 'border-slate-900 bg-slate-100 text-slate-800'
            }`}>
              [STATUS: {activeTable.status} • {activeTable.status === 'BILLING' ? 'SETTLED' : 'DINING'}]
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeTable.mergedWith && (
              <span className="bg-purple-100 border border-purple-300 text-purple-900 px-2 py-0.5 rounded text-[10.5px] font-black">
                🔗 MERGED TABLE (TOTAL GUESTS: {activeTable.guestCount})
              </span>
            )}
            <span className="text-slate-600 font-bold text-[11px]">
              [ASSIGNED FLOOR CAPTAIN: {activeCaptain}]
            </span>
          </div>
        </div>

        {/* Global Success / Notice Toasts */}
        {vacateNotice && (
          <div className="bg-emerald-700 text-white font-mono text-xs font-black px-5 py-2 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
            <span>{vacateNotice}</span>
          </div>
        )}
        {kotNotice && (
          <div className="bg-emerald-700 text-white font-mono text-xs font-black px-5 py-2 flex items-center gap-2 shrink-0">
            <Flame className="h-4 w-4 fill-white" />
            <span>{kotNotice}</span>
          </div>
        )}

        {/* MAIN SPLIT: LEFT 55% / RIGHT 45% */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT 55%: TABLE DETAILS & ACTION BUTTONS */}
          <div className="w-[55%] border-r-2 border-slate-800 p-5 overflow-y-auto bg-slate-50 flex flex-col justify-between gap-4 font-mono">
            <div className="flex flex-col gap-4">
              {/* Running KOT Card */}
              <div className="bg-white border-2 border-slate-300 rounded-xl p-4 flex justify-between items-center shadow-xs">
                <div>
                  <strong className="text-sm font-black text-slate-900 block">
                    [KOT #{activeTable.kotCount || 104} • SEATED {activeTable.seatedTime || '12:52 PM'}]
                  </strong>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    [GUEST COUNT: {activeTable.guestCount || 3} GUESTS • SERVER: {activeCaptain}]
                  </div>
                  {activeTable.mergedWith && (
                    <div className="text-[10.5px] text-purple-700 font-black mt-0.5">
                      • CONSOLIDATED WITH TABLE {activeTable.mergedWith}
                    </div>
                  )}
                </div>
                <span className="border-2 border-slate-900 bg-slate-100 px-3 py-1 rounded-md font-black text-slate-950 text-xs">
                  [RUNNING BILL: ₹ {runningTotal.toFixed(2)}]
                </span>
              </div>

              {/* Ordered Items List & Preparation Tracking */}
              <div>
                <span className="font-black text-xs text-slate-900 uppercase tracking-wider block mb-2">
                  [ORDERED ITEMS LIST &amp; PREPARATION TRACKING]:
                </span>

                <div className="flex flex-col gap-2">
                  {activeTable.activeItems && activeTable.activeItems.length > 0 ? (
                    activeTable.activeItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-300 rounded-lg p-3 flex justify-between items-center shadow-2xs"
                      >
                        <div>
                          <strong className="text-xs font-black text-slate-900">
                            {item.quantity}x {item.name}
                          </strong>
                          <div className="text-[10.5px] text-slate-500 font-bold">
                            [PREPARATION IN KITCHEN • PROTECTED]
                          </div>
                        </div>
                        <span className={`border px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          item.status === 'Ready' || item.status === 'Served'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                            : 'border-slate-900 bg-amber-50 text-amber-950'
                        }`}>
                          [{item.status === 'Ready' ? 'STAGE 3: READY' : item.status === 'Served' ? 'STAGE 4: SERVED' : 'STAGE 2: PREPARING'}]
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border border-slate-300 rounded-lg p-3 text-slate-400 italic text-xs">
                      [No active items placed yet. Click TAKE ORDERS to add dishes.]
                    </div>
                  )}
                </div>
              </div>

              {/* Special Customer Service Notes */}
              <div className="bg-white border border-slate-300 rounded-xl p-3.5 flex flex-col gap-1 text-[11px] shadow-2xs">
                <span className="font-black text-slate-500 uppercase text-[10px]">
                  [SPECIAL CUSTOMER SERVICE NOTES]:
                </span>
                <div className="text-slate-700">
                  • [CUSTOMER REQUEST: EXTRA WATER BOTTLE PROVIDED AT 01:05 PM]
                </div>
                <div className="text-slate-700">
                  • [ALLERGY ALERT: NUT-FREE PREPARATION CONFIRMED WITH HEAD CHEF]
                </div>
              </div>
            </div>

            {/* 4 ACTION BUTTONS (DYNAMIC EXPANSION INTO RIGHT PANE WITHOUT FULL PAGE REDIRECT) */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 shrink-0">
              {/* 1. Take Orders Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'take_order' ? 'bill_summary' : 'take_order')}
                className={`py-3.5 px-4 rounded-lg font-black text-xs transition flex items-center justify-center gap-2 shadow-2xs ${
                  rightPane === 'take_order' || rightPane === 'item_custom'
                    ? 'bg-orange-600 text-white border-2 border-orange-700'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                <Utensils className="h-4 w-4" />
                <span>🍽️ [TAKE ORDERS BUTTON ➔ SCREEN 4]</span>
              </button>

              {/* 2. Payment Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'payment' ? 'bill_summary' : 'payment')}
                className={`py-3.5 px-4 rounded-lg font-black text-xs transition flex items-center justify-center gap-2 shadow-2xs ${
                  rightPane === 'payment' || rightPane === 'bill_done'
                    ? 'bg-orange-600 text-white border-2 border-orange-700'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>💳 [PAYMENT BUTTON (EXPANDS RIGHT 40%)]</span>
              </button>

              {/* 3. Merge Tables Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'merge' ? 'bill_summary' : 'merge')}
                className={`py-3.5 px-4 rounded-lg font-black text-xs transition flex items-center justify-center gap-2 border ${
                  rightPane === 'merge'
                    ? 'bg-slate-900 text-white border-black'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-400'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>🔗 [MERGE TABLES BUTTON (EXPANDS RIGHT 40%)]</span>
              </button>

              {/* 4. Table Vacate Button (ENABLED ONLY WHEN PAYMENT IS DONE) */}
              <button
                type="button"
                disabled={!canVacate}
                onClick={handleDirectVacate}
                title={canVacate ? 'Vacate table immediately' : 'Payment required before table can be vacated'}
                className={`py-3.5 px-4 rounded-lg font-black text-xs transition flex items-center justify-center gap-2 ${
                  canVacate
                    ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span>🧹 {canVacate ? '[TABLE VACATE (ENABLED)]' : '[VACATE (LOCKED: PAY PENDING)]'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT 45%: DYNAMIC MULTI-PANE (CHANGES BASED ON BUTTON CLICKS) */}
          <div className="w-[45%] bg-white p-5 overflow-y-auto flex flex-col justify-between font-mono select-none border-l border-slate-200">
            {/* ─── PANE 1: DEFAULT BILL SUMMARY ────────────────────────── */}
            {rightPane === 'bill_summary' && (
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    [RIGHT CONSOLE — LIVE BILL SUMMARY]:
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    TABLE [{activeTable.number}]
                  </span>
                </div>

                <div className="border-2 border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 bg-slate-50 shadow-xs">
                  <strong className="text-xs font-black text-slate-900">
                    [BILL SUMMARY FOR {activeTable.number}]
                  </strong>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>[SUBTOTAL]:</span>
                    <span>₹ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>[CGST 2.5%]:</span>
                    <span>₹ {(gst / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>[SGST 2.5%]:</span>
                    <span>₹ {(gst / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>[SERVICE CHARGE 5%]:</span>
                    <span>₹ {serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-950">
                    <span>[GRAND TOTAL DUE]:</span>
                    <span>₹ {runningTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setRightPane('take_order')}
                    className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>🍽️ [OPEN ORDER TAKING MENU (SCREEN 4)]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPane('payment')}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>💳 [COLLECT PAYMENT (SCREEN 7)]</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── PANE 2: SCREEN 4 TAKE ORDER (WITH STEPPERS & ORDER SAFETY) ── */}
            {rightPane === 'take_order' && (
              <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    [SCREEN 4: MENU ORDER TAKING FOR {activeTable.number}]
                  </span>
                  <button
                    onClick={() => setRightPane('bill_summary')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Safety Check: Already ordered items lock */}
                {activeTable.activeItems && activeTable.activeItems.length > 0 && (
                  <div className="border border-slate-300 bg-slate-100 rounded-lg p-2.5 flex flex-col gap-1 text-[10.5px]">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Lock className="h-3 w-3 text-slate-500" />
                      [ALREADY FIRED ITEMS (LOCKED AGAINST DUPLICATION)]:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {activeTable.activeItems.map((it, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 font-bold">
                          • {it.quantity}x {it.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories & Search */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={`px-2.5 py-1 rounded text-[10.5px] font-bold border whitespace-nowrap transition ${
                          selectedCat === cat
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        [{cat === 'ALL' ? 'ALL' : cat}]
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="[SEARCH MENU DISHES...]"
                      className="w-full pl-8 pr-2.5 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* Dish Cards List with Stepper (- qty +) */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredMenuItems.map((item) => {
                    const item86 = inventory86.find((i) => i.id === item.id);
                    const isSoldOut = !!item86?.is86;
                    const draftEntry = draftCart.find((d) => d.item.id === item.id);
                    const qty = draftEntry ? draftEntry.quantity : 0;

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-2.5 flex items-center justify-between gap-2 transition ${
                          isSoldOut
                            ? 'bg-stone-50 border-rose-200 opacity-60'
                            : 'bg-white border-slate-300 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-xs font-black text-slate-950 truncate">
                              [{item.name}]
                            </strong>
                            {isSoldOut && (
                              <span className="bg-rose-600 text-white text-[8.5px] font-black px-1 rounded">
                                86 SOLD OUT
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            [₹ {item.price.toFixed(2)}] • {item.category}
                          </span>
                        </div>

                        {/* Action Stepper or Add Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenCustomize(item)}
                            className="text-[9.5px] font-bold text-slate-500 hover:text-slate-900 border border-slate-300 rounded px-1.5 py-1"
                            title="Customize item"
                          >
                            ⚙️
                          </button>

                          {qty === 0 ? (
                            <button
                              type="button"
                              disabled={isSoldOut}
                              onClick={() => !isSoldOut && handleAddItem(item)}
                              className={`py-1 px-2.5 rounded font-bold text-xs transition flex items-center gap-1 shadow-2xs ${
                                isSoldOut
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-900 hover:bg-black text-white'
                              }`}
                            >
                              <Plus className="h-3 w-3" />
                              <span>[+ ADD]</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 rounded border border-slate-300 bg-white p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-black flex items-center justify-center text-xs"
                              >
                                <Minus className="h-3 w-3 stroke-[2.5]" />
                              </button>
                              <span className="min-w-4 text-center text-xs font-black text-slate-950">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-5 h-5 rounded bg-slate-900 hover:bg-black text-white font-black flex items-center justify-center text-xs"
                              >
                                <Plus className="h-3 w-3 stroke-[2.5]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Order Bar */}
                <div className="border-t-2 border-slate-800 pt-2 shrink-0 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">
                      [NEW SELECTION: {draftItemCount} ITEMS]
                    </span>
                    <strong className="text-xs font-black text-slate-900">
                      ₹ {draftTotal.toFixed(2)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    disabled={draftItemCount === 0}
                    onClick={handleFireDraftKOT}
                    className={`py-2 px-3.5 rounded-lg font-black text-xs transition flex items-center gap-1.5 shadow-2xs ${
                      draftItemCount > 0
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5 fill-white" />
                    <span>🔥 [FIRE KOT TO KITCHEN ➔]</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── PANE 3: SCREEN 5 ITEM CUSTOMIZATION ─────────────────── */}
            {rightPane === 'item_custom' && customizingItem && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    [SCREEN 5: ITEM CUSTOMIZATION]
                  </span>
                  <button
                    onClick={() => setRightPane('take_order')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="border border-slate-300 bg-slate-50 rounded-xl p-3">
                  <strong className="text-xs font-black text-slate-950 block">
                    [{customizingItem.name.toUpperCase()}]
                  </strong>
                  <span className="text-[10px] font-bold text-slate-500">
                    [BASE PRICE: ₹ {customizingItem.price.toFixed(2)}] • {customizingItem.category}
                  </span>
                </div>

                {/* Portion Size */}
                <div className="border border-slate-300 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    [PORTION SIZE]:
                  </span>
                  <div className="flex gap-2">
                    {(['REGULAR', 'LARGE'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPortion(p)}
                        className={`flex-1 py-1.5 rounded text-xs font-bold border transition ${
                          portion === p
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        [{p} {p === 'LARGE' ? '+₹60' : ''}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spice Level */}
                <div className="border border-slate-300 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    [SPICE LEVEL]:
                  </span>
                  <div className="flex gap-1.5">
                    {(['MILD', 'MEDIUM', 'VERY SPICY'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpice(s)}
                        className={`flex-1 py-1 rounded text-[10.5px] font-bold border transition ${
                          spice === s
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        [{s}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Dietary */}
                <div className="border border-slate-300 rounded-lg p-2.5 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    [PREPARATION OPTIONS]:
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.lessSpice}
                      onChange={(e) => setOptions({ ...options, lessSpice: e.target.checked })}
                      className="accent-slate-900"
                    />
                    <span>[LESS SPICE]</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.noOnion}
                      onChange={(e) => setOptions({ ...options, noOnion: e.target.checked })}
                      className="accent-slate-900"
                    />
                    <span>[NO ONION / JAIN CUT]</span>
                  </label>
                </div>

                {/* Chef Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    [CHEF KOT NOTE]:
                  </label>
                  <input
                    type="text"
                    value={chefNote}
                    onChange={(e) => setChefNote(e.target.value)}
                    placeholder="[E.G., CRISPY ROAST, SERVE HOT]"
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFireCustomKOT}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2"
                >
                  <Flame className="h-4 w-4 fill-white" />
                  <span>🔥 [CONFIRM &amp; FIRE KOT TO KITCHEN ➔]</span>
                </button>
              </div>
            )}

            {/* ─── PANE 4: SCREEN 6 TABLE MERGE (NO SPLIT, NO TIPS) ─────── */}
            {rightPane === 'merge' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    [SCREEN 6: TABLE MERGE CONTROLLER]
                  </span>
                  <button
                    onClick={() => setRightPane('bill_summary')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="border border-slate-300 bg-white rounded-xl p-3.5 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    [PRIMARY TABLE: {activeTable.number}]
                  </span>
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase">
                    [SELECT TABLE NUMBER TO MERGE TOGETHER]:
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {availableTablesToMerge.slice(0, 6).map((tbl) => (
                      <button
                        key={tbl}
                        onClick={() => setSelectedMergeChip(tbl)}
                        className={`py-2 px-1 border rounded-lg text-xs font-bold transition ${
                          selectedMergeChip === tbl
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        [{tbl}]
                      </button>
                    ))}
                  </div>

                  <div className="text-[10.5px] font-bold text-purple-700 mt-1">
                    [MERGE PREVIEW: {activeTable.number} + {selectedMergeChip} COMBINED]
                  </div>
                  <div className="text-[10px] text-slate-500">
                    [BILLS &amp; ACTIVE ORDERS WILL UNIFY UNDER ONE COMBINED TABLE]
                  </div>

                  {mergeConfirmed && (
                    <div className="p-2 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>✓ TABLES MERGED SUCCESSFULLY!</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmMerge}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>🔗 [CONFIRM MERGE TABLES WITH {selectedMergeChip}]</span>
                </button>
              </div>
            )}

            {/* ─── PANE 5: SCREEN 7 PAYMENT (NO POINTS, NO CASH CALCULATOR) ── */}
            {rightPane === 'payment' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    [SCREEN 7: PAYMENT SETTLEMENT FOR {activeTable.number}]
                  </span>
                  <button
                    onClick={() => setRightPane('bill_summary')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="border-2 border-slate-900 bg-slate-50 rounded-xl p-3 text-center">
                  <span className="text-[10.5px] font-bold text-slate-500 block uppercase">
                    [TOTAL BILL PAYABLE]
                  </span>
                  <strong className="text-xl font-black text-slate-950 font-mono">
                    ₹ {runningTotal.toFixed(2)}
                  </strong>
                </div>

                {/* Method Switcher */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['CASH', 'UPI', 'POS'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMode(m)}
                      className={`py-2 rounded-lg border text-[11px] font-bold transition ${
                        payMode === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'CASH' ? '💵 CASH' : m === 'UPI' ? '📱 UPI' : '💳 POS'}
                    </button>
                  ))}
                </div>

                {/* Method Visual Content */}
                <div className="border border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center bg-white flex-1 min-h-[160px]">
                  {payMode === 'UPI' ? (
                    <>
                      <div className="w-28 h-28 border border-dashed border-slate-400 bg-slate-50 rounded-lg flex flex-col items-center justify-center">
                        <QrCode className="h-16 w-16 text-slate-800" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">
                        [SCAN QR CODE TO PAY ₹ {runningTotal.toFixed(2)}]
                      </span>
                      <span className="text-[10px] text-slate-500">
                        [TIMEOUT: 04:58 MINS REMAINING]
                      </span>
                    </>
                  ) : payMode === 'CASH' ? (
                    <>
                      <span className="text-4xl">💵</span>
                      <span className="text-xs font-black text-slate-900">
                        [COLLECT CASH TENDER: ₹ {runningTotal.toFixed(2)}]
                      </span>
                      <span className="text-[10px] text-slate-500">
                        [CONFIRM CURRENCY NOTES FROM GUEST]
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-12 w-12 text-slate-800" />
                      <span className="text-xs font-black text-slate-900">
                        [SWIPE / TAP CARD ON POS MACHINE]
                      </span>
                      <span className="text-[10px] text-slate-500">
                        [CARD TRANSACTION: ₹ {runningTotal.toFixed(2)}]
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✓ [CONFIRM PAYMENT ➔ GENERATE BILL (SCREEN 8)]</span>
                </button>
              </div>
            )}

            {/* ─── PANE 6: SCREEN 8 BILL GENERATION & CONDITIONAL VACATE ── */}
            {rightPane === 'bill_done' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    [SCREEN 8: BILL SETTLEMENT &amp; VACATE]
                  </span>
                  <button
                    onClick={() => setRightPane('bill_summary')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="border border-emerald-400 bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="text-xs font-black text-emerald-950 block">
                      [PAYMENT SUCCESSFUL — BILL SETTLED]
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      [INV-2026-{activeTable.number} • PAID VIA {payMode}]
                    </span>
                  </div>
                </div>

                {/* Thermal Receipt Summary */}
                <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 font-mono text-[10.5px] space-y-1">
                  <div className="text-center font-black pb-1 border-b border-dashed border-slate-300 text-xs">
                    THOOGUDEEPA DONNE BIRYANI MANE
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Table:</span><span>{activeTable.number}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Captain:</span><span>{activeCaptain}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span><span>₹ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%):</span><span>₹ {gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-950 border-t border-slate-300 pt-1 text-xs">
                    <span>TOTAL PAID:</span><span>₹ {runningTotal.toFixed(2)}</span>
                  </div>
                </div>

                {printSent && (
                  <div className="p-2 bg-slate-900 text-white rounded text-[10.5px] font-bold text-center">
                    [PRINT JOB SENT TO POS PRINTER #PRN-104]
                  </div>
                )}
                {whatsappSent && (
                  <div className="p-2 bg-emerald-700 text-white rounded text-[10.5px] font-bold text-center">
                    [DIGITAL BILL SHARED TO GUEST VIA WHATSAPP]
                  </div>
                )}

                {/* Action Buttons: WhatsApp & Print */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappSent(true);
                      setTimeout(() => setWhatsappSent(false), 2500);
                    }}
                    className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>[WHATSAPP]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrintSent(true);
                      setTimeout(() => setPrintSent(false), 2500);
                    }}
                    className="py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>[PRINT BILL]</span>
                  </button>
                </div>

                {/* VACATE BUTTON (ENABLED ONLY WHEN PAYMENT IS DONE) */}
                <button
                  type="button"
                  disabled={!canVacate}
                  onClick={handleDirectVacate}
                  className={`w-full py-3.5 rounded-lg font-black text-xs transition shadow-sm mt-auto flex items-center justify-center gap-2 ${
                    canVacate
                      ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>🧹 {canVacate ? '[VACATE & RESET TABLE FOR NEXT GUEST]' : '[VACATE DISABLED: PAYMENT PENDING]'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
