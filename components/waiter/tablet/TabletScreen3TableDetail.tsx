'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge, getTableBillBreakdown } from '../../../store/useSharedBridge';
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
  ShoppingCart,
  ShoppingBag,
  Ban,
  Lock,
  X,
  Clock,
  UtensilsCrossed,
  ExternalLink,
  Link2,
  Receipt,
  FileText,
  Sparkles,
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
    waiterUnmergeTable,
    waiterFiresKOT,
    waiterRecordsPayment,
    waiterVacatesTable,
  } = useSharedBridge();

  const [rightPane, setRightPane] = useState<RightPaneMode>('bill_summary');
  const [selectedMergeChip, setSelectedMergeChip] = useState<string>('');
  const [mergeNotice, setMergeNotice] = useState<string | null>(null);
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

  const currentTable = selectedTableNumber || 'A-04';
  const activeTable = tables.find((t) => t.number === currentTable) || tables[0];
  const isAlreadyMerged = Boolean(activeTable?.mergedWith);
  const breakdown = getTableBillBreakdown(activeTable);
  const runningTotal = breakdown.grandTotal;
  const subtotal = breakdown.foodSubtotal;
  const gst = breakdown.totalTax;

  const canVacate = isPaymentDone || activeTable?.status === 'BILLING';

  const categories = ['ALL', 'CHEF SPECIAL', 'BIRYANI', 'STARTERS', 'GRAVY & SIDES', 'BEVERAGES'];

  const filteredMenuItems = INITIAL_MENU_ITEMS.filter((item) => {
    const matchCat =
      selectedCat === 'ALL' ||
      (selectedCat === 'CHEF SPECIAL' &&
        (item.badge === 'Chef Special' ||
          item.badge?.toLowerCase().includes('special') ||
          item.name.toLowerCase().includes('special') ||
          item.name.toLowerCase().includes('thoogudeepa'))) ||
      item.category.toUpperCase().includes(selectedCat) ||
      (selectedCat === 'BIRYANI' && item.name.toLowerCase().includes('biryani'));
    const matchSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableTablesToMerge = tables.filter(
    (t) => t.number !== activeTable?.number && t.number !== activeTable?.mergedWith
  );

  const effectiveMergeChip =
    selectedMergeChip && availableTablesToMerge.some((t) => t.number === selectedMergeChip)
      ? selectedMergeChip
      : availableTablesToMerge[0]?.number || 'A-02';

  const targetMergeTableObj = tables.find((t) => t.number === effectiveMergeChip);

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
      activeCaptain || 'Staff Captain',
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
    waiterFiresKOT(activeTable.number, activeCaptain || 'Staff Captain', [
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
    if (!activeTable?.number || !effectiveMergeChip) return;
    waiterMergeTables(activeTable.number, effectiveMergeChip);
    setMergeNotice(`✓ Table ${activeTable.number} and Table ${effectiveMergeChip} merged into unified bill!`);
    setTimeout(() => setMergeNotice(null), 3500);
  };

  // Unmerge table confirmation
  const handleUnmerge = () => {
    if (!activeTable?.number) return;
    const partner = activeTable.mergedWith;
    waiterUnmergeTable(activeTable.number);
    setMergeNotice(`✓ Table ${activeTable.number} and Table ${partner} separated into individual tables.`);
    setTimeout(() => setMergeNotice(null), 3500);
  };

  // Payment confirmation (Screen 7 -> Screen 8)
  const handleConfirmPayment = () => {
    waiterRecordsPayment(activeTable.number, payMode, runningTotal, breakdown.tip, activeCaptain || 'Waiter 1');
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
      screenTitle="TABLE OPERATIONS & DYNAMIC COMMAND HUB"
    >
      <div className="flex flex-col flex-1 min-h-[700px]">
        {/* TOP HEADER */}
        <div className="border-b-2 border-slate-800 bg-white px-5 py-2.5 flex items-center justify-between shrink-0 font-mono text-xs select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen(2)}
              className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Floor Overview</span>
            </button>
            <h3 className="font-black text-slate-950 text-sm">
              {activeTable.mergedWith
                ? `Table ${activeTable.number} + ${activeTable.mergedWith} (Merged)`
                : `Table ${activeTable.number}`}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
              activeTable.status === 'OCCUPIED'
                ? 'bg-amber-50 text-amber-950 border-amber-300'
                : activeTable.status === 'BILLING'
                ? 'bg-purple-50 text-purple-950 border-purple-300'
                : 'border-emerald-300 bg-emerald-50 text-emerald-950'
            }`}>
              ● Status: {activeTable.status} • {activeTable.status === 'BILLING' ? 'Settled' : 'Dining'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeTable.mergedWith && (
              <span className="bg-purple-100 border border-purple-300 text-purple-900 px-2.5 py-0.5 rounded-md text-[10.5px] font-black">
                🔗 Merged Table ({activeTable.guestCount} Guests)
              </span>
            )}
            <span className="text-slate-600 font-bold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Assigned Captain: {activeCaptain || 'Staff Captain'}
            </span>
          </div>
        </div>

        {/* Global Success / Notice Toasts */}
        {mergeNotice && (
          <div className="bg-purple-800 text-white font-mono text-xs font-black px-5 py-2 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
            <span>{mergeNotice}</span>
          </div>
        )}
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
                    KOT #{activeTable.kotCount || 104} • Seated {activeTable.seatedTime || '12:52 PM'}
                  </strong>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    Guest Count: {activeTable.guestCount || 3} Guests • Server: {activeCaptain || activeTable.serverName}
                  </div>
                  {activeTable.mergedWith && (
                    <div className="text-[10.5px] text-purple-700 font-black mt-0.5">
                      • Consolidated with Table {activeTable.mergedWith}
                    </div>
                  )}
                </div>
                <span className="border border-orange-300 bg-orange-50 px-3 py-1 rounded-lg font-black text-orange-950 text-xs shadow-2xs">
                  Running Bill: ₹{runningTotal.toFixed(2)}
                </span>
              </div>

              {/* Ordered Items List & Preparation Tracking */}
              <div>
                <span className="font-black text-xs text-slate-900 uppercase tracking-wider block mb-2">
                  ORDERED ITEMS &amp; PREPARATION STATUS
                </span>

                <div className="flex flex-col gap-2">
                  {breakdown.items && breakdown.items.length > 0 ? (
                    breakdown.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-300 rounded-lg p-3 flex justify-between items-center shadow-2xs gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs font-black text-slate-900 truncate block">
                            {item.quantity}x {item.name}
                          </strong>
                          <div className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                            ₹{item.lineTotal.toFixed(2)} (₹{item.unitPrice.toFixed(2)} ea) • Kitchen Prep
                          </div>
                        </div>
                        <span className={`border px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                          item.status === 'Ready'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                            : item.status === 'Served'
                            ? 'border-blue-300 bg-blue-50 text-blue-950'
                            : 'border-amber-300 bg-amber-50 text-amber-950'
                        }`}>
                          {item.status === 'Ready' ? 'Ready to Serve' : item.status === 'Served' ? 'Served' : 'Preparing'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border border-slate-300 rounded-lg p-3 text-slate-400 italic text-xs">
                      No active items placed yet. Click Take Orders below to add dishes.
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Service Briefing */}
              <div className="bg-white border border-slate-300 rounded-xl p-3.5 flex flex-col gap-1 text-[11px] shadow-2xs">
                <span className="font-black text-slate-500 uppercase text-[10px]">
                  Table Service Briefing
                </span>
                <div className="text-slate-700">
                  • Assigned Service: Table {activeTable.number} • Seated at {activeTable.seatedTime || 'Active Shift'}
                </div>
                <div className="text-slate-700">
                  • Dining Party: {activeTable.guestCount || 2} Guests • Floor Captain: {activeCaptain || activeTable.serverName}
                </div>
                {activeTable.mergedWith && (
                  <div className="text-purple-700 font-bold">
                    • Consolidated with Table {activeTable.mergedWith} (Unified Orders &amp; Billing)
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS (DYNAMIC EXPANSION INTO RIGHT PANE WITHOUT FULL PAGE REDIRECT) */}
            <div className="grid grid-cols-2 gap-2 pt-2 shrink-0">
              {/* 1. Take Orders Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'take_order' ? 'bill_summary' : 'take_order')}
                className={`py-3 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                  rightPane === 'take_order' || rightPane === 'item_custom'
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                    : 'bg-orange-50 text-orange-950 border border-orange-300 hover:bg-orange-600 hover:text-white'
                }`}
              >
                <Utensils className="h-4 w-4" />
                <span>Take Orders {draftItemCount > 0 ? `(${draftItemCount})` : ''}</span>
              </button>

              {/* 2. Payment Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'payment' ? 'bill_summary' : 'payment')}
                className={`py-3 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                  rightPane === 'payment'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Collect Payment</span>
              </button>

              {/* 3. Merge Tables Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'merge' ? 'bill_summary' : 'merge')}
                className={`py-3 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                  rightPane === 'merge'
                    ? 'bg-purple-700 text-white ring-2 ring-purple-400'
                    : isAlreadyMerged
                    ? 'bg-purple-100 border border-purple-400 text-purple-950 hover:bg-purple-700 hover:text-white'
                    : 'bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-950 border border-purple-300'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{isAlreadyMerged ? `Merged (+${activeTable.mergedWith})` : 'Merge Tables'}</span>
              </button>

              {/* 4. Print / Invoice Button */}
              <button
                type="button"
                onClick={() => setRightPane(rightPane === 'bill_done' ? 'bill_summary' : 'bill_done')}
                className={`py-3 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                  rightPane === 'bill_done'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-950 border border-blue-300'
                }`}
              >
                <Printer className="h-4 w-4" />
                <span>Print Bill</span>
              </button>

              {/* 5. Bill Summary Button */}
              <button
                type="button"
                onClick={() => setRightPane('bill_summary')}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                  rightPane === 'bill_summary'
                    ? 'bg-slate-800 text-white ring-2 ring-slate-600'
                    : 'bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-800 border border-slate-300'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Live Bill Summary</span>
              </button>

              {/* 6. Table Vacate Button (ENABLED ONLY WHEN PAYMENT IS DONE) */}
              <button
                type="button"
                disabled={!canVacate}
                onClick={handleDirectVacate}
                title={canVacate ? 'Vacate table immediately' : 'Payment required before table can be vacated'}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs ${
                  canVacate
                    ? 'bg-rose-50 text-rose-950 border border-rose-300 hover:bg-rose-700 hover:text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{canVacate ? 'Vacate Table' : 'Vacate (Locked)'}</span>
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
                    Live Bill Summary
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Table {activeTable.number}
                  </span>
                </div>

                <div className="border-2 border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 bg-slate-50 shadow-xs">
                  <strong className="text-xs font-black text-slate-900">
                    Bill Summary — Table {activeTable.number}
                  </strong>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Net Subtotal:</span>
                    <span>₹ {breakdown.foodSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>CGST @ 2.5%:</span>
                    <span>₹ {breakdown.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>SGST @ 2.5%:</span>
                    <span>₹ {breakdown.sgst.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-950">
                    <span>Grand Total Due:</span>
                    <span>₹ {breakdown.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setRightPane('take_order')}
                    className="w-full py-3 bg-orange-50 text-orange-950 border border-orange-300 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>Open Menu Order Entry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPane('payment')}
                    className="w-full py-3 bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Collect Payment</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── PANE 2: SCREEN 4 TAKE ORDER (WITH STEPPERS & ORDER SAFETY) ── */}
            {rightPane === 'take_order' && (
              <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    Table {activeTable.number}: Menu Order Entry
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentScreen(4)}
                      className="text-[10px] font-bold text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Open full dedicated Menu Screen 4"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Full Screen Menu</span>
                    </button>
                    <button
                      onClick={() => setRightPane('bill_summary')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Safety Check: Already ordered items lock */}
                {activeTable.activeItems && activeTable.activeItems.length > 0 && (
                  <div className="border border-slate-300 bg-slate-100 rounded-lg p-2.5 flex flex-col gap-1 text-[10.5px]">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Lock className="h-3 w-3 text-slate-500" />
                      Already Fired Items (Locked):
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
                    {categories.map((cat) => {
                      const isChef = cat === 'CHEF SPECIAL';
                      const isSelected = selectedCat === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCat(cat)}
                          className={`px-2.5 py-1 rounded text-[10.5px] font-bold border whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? isChef
                                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-600 shadow-2xs'
                                : 'bg-slate-900 text-white border-slate-900'
                              : isChef
                              ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isChef && <Sparkles className={`h-2.5 w-2.5 ${isSelected ? 'text-amber-200' : 'text-orange-500'}`} />}
                          <span>{cat === 'ALL' ? 'All' : cat === 'CHEF SPECIAL' ? 'Chef Special' : cat}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search menu dishes..."
                        className="w-full pl-8 pr-2.5 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                    {/* Cart Icon only with proper number — directly after search */}
                    <button
                      type="button"
                      onClick={() => setRightPane('item_custom')}
                      className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-black transition cursor-pointer"
                      title="View Order Cart"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-orange-400 stroke-[2.2]" />
                      {draftItemCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5 bg-orange-600 text-white text-[8.5px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                          {draftItemCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dish Cards List with Stepper (- qty +) or Clean Empty State */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredMenuItems.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 my-auto">
                      <div className="h-11 w-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <UtensilsCrossed className="h-6 w-6" />
                      </div>
                      <strong className="text-xs font-black text-slate-900 uppercase">
                        No Dishes Available in {selectedCat}
                      </strong>
                      <p className="text-[10.5px] text-slate-500 max-w-[240px] leading-relaxed">
                        {search
                          ? `No items found matching "${search}".`
                          : 'All items in this section are currently sold out or fresh batches are in kitchen preparation.'}
                      </p>
                      {(selectedCat !== 'ALL' || search) && (
                        <button
                          onClick={() => { setSelectedCat('ALL'); setSearch(''); }}
                          className="mt-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[10.5px] font-bold transition cursor-pointer"
                        >
                          View All Dishes
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => {
                      const item86 = inventory86.find((i) => i.id === item.id);
                      const isSoldOut = !!item86?.is86;
                      const prepDelay = item86?.prepDelayMinutes || 0;
                      const draftEntry = draftCart.find((d) => d.item.id === item.id);
                      const qty = draftEntry ? draftEntry.quantity : 0;

                      return (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-2.5 flex items-center justify-between gap-2 transition ${
                            isSoldOut
                              ? 'bg-stone-50 border-rose-200 opacity-65'
                              : prepDelay > 0
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-white border-slate-300 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-xs font-black text-slate-950 truncate">
                                {item.name}
                              </strong>
                              {item.badge && !isSoldOut && (
                                <span
                                  className={`text-[8.5px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 uppercase shrink-0 ${
                                    item.badge === 'Chef Special'
                                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  <Sparkles className="h-2 w-2 text-orange-600" />
                                  <span>{item.badge}</span>
                                </span>
                              )}
                              {isSoldOut ? (
                                <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Ban className="h-2 w-2" />
                                  <span>86 SOLD OUT</span>
                                </span>
                              ) : prepDelay > 0 ? (
                                <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Clock className="h-2 w-2" />
                                  <span>+{prepDelay}M PREP</span>
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              ₹{item.price.toFixed(2)} • {item.category}
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
                                    : 'bg-slate-900 hover:bg-black text-white cursor-pointer active:scale-95'
                                }`}
                              >
                                <Plus className="h-3 w-3" />
                                <span>+ Add</span>
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
                    })
                  )}
                </div>

                {/* Bottom Order Bar */}
                <div className="border-t-2 border-slate-800 pt-2 shrink-0 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">
                      New Selection: {draftItemCount} items
                    </span>
                    <strong className="text-xs font-black text-slate-900">
                      ₹{draftTotal.toFixed(2)}
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
                    <span>Fire KOT to Kitchen ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── PANE 3: SCREEN 5 ITEM CUSTOMIZATION ─────────────────── */}
            {rightPane === 'item_custom' && customizingItem && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    Order Item Customization
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
                    {customizingItem.name.toUpperCase()}
                  </strong>
                  <span className="text-[10px] font-bold text-slate-500">
                    Base Price: ₹{customizingItem.price.toFixed(2)} • {customizingItem.category}
                  </span>
                </div>

                {/* Portion Size */}
                <div className="border border-slate-300 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    PORTION SIZE:
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
                        {p} {p === 'LARGE' ? '(+₹60)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spice Level */}
                <div className="border border-slate-300 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    SPICE LEVEL:
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
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Dietary */}
                <div className="border border-slate-300 rounded-lg p-2.5 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    PREPARATION OPTIONS:
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.lessSpice}
                      onChange={(e) => setOptions({ ...options, lessSpice: e.target.checked })}
                      className="accent-slate-900"
                    />
                    <span>Less Spice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.noOnion}
                      onChange={(e) => setOptions({ ...options, noOnion: e.target.checked })}
                      className="accent-slate-900"
                    />
                    <span>No Onion / Jain Cut</span>
                  </label>
                </div>

                {/* Chef Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    CHEF KOT NOTE:
                  </label>
                  <input
                    type="text"
                    value={chefNote}
                    onChange={(e) => setChefNote(e.target.value)}
                    placeholder="e.g., Crispy roast, serve hot"
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFireCustomKOT}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2"
                >
                  <Flame className="h-4 w-4 fill-white" />
                  <span>Fire KOT to Kitchen ➔</span>
                </button>
              </div>
            )}

            {/* ─── PANE 4: SCREEN 6 TABLE MERGE ─────── */}
            {rightPane === 'merge' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-700" />
                    <span className="font-black text-xs text-slate-900 uppercase">
                      Table Merge Controller
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentScreen(6)}
                      className="text-[10px] font-bold text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Open full dedicated Merge Screen 6"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Full Merge Screen</span>
                    </button>
                    <button
                      onClick={() => setRightPane('bill_summary')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isAlreadyMerged ? (
                  <div className="border-2 border-purple-300 bg-purple-50/70 rounded-xl p-4 flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-purple-950 font-black text-xs">
                      <Link2 className="h-4 w-4 text-purple-700" />
                      <span>Table Consolidation Active</span>
                    </div>
                    <div className="text-xs text-purple-950 font-bold">
                      Table {activeTable.number} is currently consolidated with Table {activeTable.mergedWith}.
                    </div>
                    <div className="text-[11px] text-purple-900 space-y-1 bg-white/80 p-3 rounded-lg border border-purple-200">
                      <div className="flex justify-between">
                        <span>Consolidated Bill:</span>
                        <span className="font-black">₹{runningTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Combined Party:</span>
                        <span className="font-black">{activeTable.guestCount || 4} Guests</span>
                      </div>
                      <div className="text-[10px] text-purple-700 mt-1">
                        • Kitchen KOTs and billing unified under one consolidated account.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleUnmerge}
                      className="w-full py-3 bg-rose-50 text-rose-950 border border-rose-300 hover:bg-rose-700 hover:text-white rounded-lg font-black text-xs transition-all shadow-2xs mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>Unmerge / Separate Table {activeTable.number} &amp; {activeTable.mergedWith}</span>
                    </button>
                  </div>
                ) : (
                  <div className="border border-slate-300 bg-white rounded-xl p-3.5 flex flex-col gap-3 shadow-2xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Primary Master Table:</span>
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        Table {activeTable.number} (₹{runningTotal.toFixed(2)})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1.5">
                        Select Table to Merge:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTablesToMerge.slice(0, 6).map((tbl) => {
                          const isSelected = effectiveMergeChip === tbl.number;
                          return (
                            <button
                              key={tbl.number}
                              onClick={() => setSelectedMergeChip(tbl.number)}
                              className={`py-2 px-1.5 border rounded-lg text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                  : 'bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-100'
                              }`}
                            >
                              <span className="font-black">{tbl.number}</span>
                              <span className="text-[9px] opacity-75 font-mono">
                                ₹{tbl.currentBill} • {tbl.status === 'OCCUPIED' ? 'Occ' : 'Vac'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview box */}
                    <div className="border border-dashed border-purple-300 bg-purple-50/50 p-2.5 rounded-lg text-xs font-bold text-purple-900 space-y-1">
                      <div className="flex justify-between">
                        <span>Merge Preview:</span>
                        <span>{activeTable.number} + {effectiveMergeChip}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-purple-700">
                        <span>Consolidated Bill:</span>
                        <span>₹{(runningTotal + (targetMergeTableObj?.currentBill || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-purple-700">
                        <span>Total Guests:</span>
                        <span>{(activeTable.guestCount || 2) + (targetMergeTableObj?.guestCount || 2)} Guests</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmMerge}
                      className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>Confirm Merge with Table {effectiveMergeChip}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── PANE 5: SCREEN 7 PAYMENT ── */}
            {rightPane === 'payment' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    Payment Settlement — Table {activeTable.number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentScreen(7)}
                      className="text-[10px] font-bold text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Open full dedicated Payment Screen 7"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Full Payment Screen</span>
                    </button>
                    <button
                      onClick={() => setRightPane('bill_summary')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-2 border-slate-900 bg-slate-50 rounded-xl p-3 text-center shadow-xs">
                  <span className="text-[10.5px] font-bold text-slate-500 block uppercase">
                    TOTAL BILL PAYABLE
                  </span>
                  <strong className="text-xl font-black text-slate-950 font-mono">
                    ₹{breakdown.grandTotal.toFixed(2)}
                  </strong>
                  <div className="flex justify-center gap-4 text-[10.5px] font-bold text-slate-600 mt-1 pt-1 border-t border-slate-200">
                    <span>Subtotal: ₹{breakdown.foodSubtotal.toFixed(2)}</span>
                    <span>CGST (2.5%): ₹{breakdown.cgst.toFixed(2)}</span>
                    <span>SGST (2.5%): ₹{breakdown.sgst.toFixed(2)}</span>
                  </div>
                </div>

                {/* Method Switcher */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['CASH', 'UPI', 'POS'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMode(m)}
                      className={`py-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        payMode === m
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'CASH' ? '💵 Cash' : m === 'UPI' ? '📱 UPI' : '💳 Card POS'}
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
                        Scan Dynamic QR to Pay ₹{runningTotal.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Supported: BHIM, GPay, PhonePe, Paytm &amp; Bank UPI
                      </span>
                    </>
                  ) : payMode === 'CASH' ? (
                    <>
                      <span className="text-4xl">💵</span>
                      <span className="text-xs font-black text-slate-900">
                        Collect Cash Tender: ₹{runningTotal.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Confirm exact currency notes received from guest
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-12 w-12 text-slate-800" />
                      <span className="text-xs font-black text-slate-900">
                        Swipe / Tap Card on Countertop POS
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Card Authorization: ₹{runningTotal.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Payment &amp; Generate Tax Invoice ➔</span>
                </button>
              </div>
            )}

            {/* ─── PANE 6: SCREEN 8 BILL GENERATION & CONDITIONAL VACATE ── */}
            {rightPane === 'bill_done' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                  <span className="font-black text-xs text-slate-900 uppercase">
                    Tax Invoice &amp; Table Settlement
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentScreen(8)}
                      className="text-[10px] font-bold text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Open full dedicated Tax Invoice Screen 8"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Full Invoice Screen</span>
                    </button>
                    <button
                      onClick={() => setRightPane('bill_summary')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-emerald-400 bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="text-xs font-black text-emerald-950 block">
                      Payment Successful — Bill Settled
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      INV-2026-{activeTable.number} • Paid via {payMode}
                    </span>
                  </div>
                </div>

                {/* Thermal Receipt Summary with Dynamic Items */}
                <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 font-mono text-[10.5px] space-y-1.5">
                  <div className="text-center font-black pb-1 border-b border-dashed border-slate-300 text-xs">
                    THOOGUDEEPA DONNE BIRYANI MANE
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Table:</span><span>{activeTable.number}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Captain:</span><span>{activeCaptain || activeTable.serverName}</span>
                  </div>

                  {/* Dynamic Itemized Dishes */}
                  <div className="border-t border-b border-dashed border-slate-200 py-1.5 my-1 space-y-1">
                    {breakdown.items.length > 0 ? (
                      breakdown.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-800">
                          <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                          <span className="font-bold">₹{item.lineTotal.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-slate-800">
                        <span>1x F&amp;B Dine-In Service</span>
                        <span className="font-bold">₹{breakdown.foodSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span><span>₹ {breakdown.foodSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (2.5%):</span><span>₹ {breakdown.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (2.5%):</span><span>₹ {breakdown.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-950 border-t border-slate-300 pt-1 text-xs">
                    <span>TOTAL PAID:</span><span>₹ {breakdown.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {printSent && (
                  <div className="p-2 bg-slate-900 text-white rounded text-[10.5px] font-bold text-center">
                    ✓ Print job sent to Thermal POS Printer #PRN-104
                  </div>
                )}
                {whatsappSent && (
                  <div className="p-2 bg-emerald-700 text-white rounded text-[10.5px] font-bold text-center">
                    ✓ Digital receipt shared to guest via WhatsApp
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
                    className="py-2.5 bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-700 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrintSent(true);
                      setTimeout(() => setPrintSent(false), 2500);
                    }}
                    className="py-2.5 bg-blue-50 text-blue-950 border border-blue-300 hover:bg-blue-700 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Bill</span>
                  </button>
                </div>

                {/* VACATE BUTTON (ENABLED ONLY WHEN PAYMENT IS DONE) */}
                <button
                  type="button"
                  disabled={!canVacate}
                  onClick={handleDirectVacate}
                  className={`w-full py-3.5 rounded-lg font-black text-xs transition shadow-2xs mt-auto flex items-center justify-center gap-2 ${
                    canVacate
                      ? 'bg-rose-50 text-rose-950 border border-rose-300 hover:bg-rose-700 hover:text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>🧹 {canVacate ? 'Vacate & Reset Table for Next Guest' : 'Vacate Disabled (Payment Pending)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
