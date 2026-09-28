'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { INITIAL_MENU_ITEMS } from '../../../data/menuItems';
import { MenuItem } from '../../../types/customer';
import { ArrowLeft, Flame, ImageIcon } from 'lucide-react';

export const TabletScreen5ItemCustom: React.FC = () => {
  const { setCurrentScreen, orderCart, clearOrderCart, selectedTableNumber, activeCaptain } =
    useWaiterStore();
  const { waiterFiresKOT } = useSharedBridge();

  const [portion, setPortion] = useState<'REGULAR' | 'LARGE'>('REGULAR');
  const [spice, setSpice] = useState<'MILD' | 'MEDIUM' | 'VERY SPICY'>('MEDIUM');
  const [options, setOptions] = useState({ lessSpice: true, noOnion: false, extraCheese: false, extraSauce: false });
  const [chefNote, setChefNote] = useState('');
  const [kotFired, setKotFired] = useState(false);

  const selectedItem = orderCart.length > 0
    ? orderCart[orderCart.length - 1].menuItem
    : INITIAL_MENU_ITEMS[0];
  const isVeg = selectedItem.category.toLowerCase().includes('veg') ||
    selectedItem.name.toLowerCase().includes('paneer') ||
    selectedItem.name.toLowerCase().includes('gobi');
  const portionAddOn = portion === 'LARGE' ? 60 : 0;
  const cheeseAddon = options.extraCheese ? 40 : 0;
  const sauceAddon = options.extraSauce ? 25 : 0;
  const totalItemPrice = selectedItem.price + portionAddOn + cheeseAddon + sauceAddon;

  const handleFireKOT = () => {
    const tableNum = selectedTableNumber || 'A-04';
    const captain = activeCaptain || 'Floor Captain';

    const customItem: MenuItem = {
      ...selectedItem,
      price: totalItemPrice,
    };

    const itemsToFire = orderCart.length > 0
      ? orderCart.map((ci, idx) => {
          if (idx === orderCart.length - 1) {
            return {
              item: customItem,
              selectedOption: `${portion} • Spice: ${spice}${chefNote ? ` • Note: ${chefNote}` : ''}`,
              quantity: ci.quantity,
            };
          }
          return {
            item: ci.menuItem,
            selectedOption: ci.selectedOption,
            quantity: ci.quantity,
          };
        })
      : [
          {
            item: customItem,
            selectedOption: `${portion} • Spice: ${spice}${chefNote ? ` • Note: ${chefNote}` : ''}`,
            quantity: 1,
          },
        ];

    waiterFiresKOT(tableNum, captain, itemsToFire);
    clearOrderCart();
    setKotFired(true);
    setTimeout(() => {
      setKotFired(false);
      setCurrentScreen(3);
    }, 1500);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={5}
      screenTitle="ORDER CUSTOMIZATION & KOT DISPATCH"
    >
      <div className="flex flex-col flex-1 min-h-[700px] p-5 font-mono select-none">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setCurrentScreen(4)}
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Menu</span>
          </button>
          <h3 className="font-black text-slate-950 text-sm">
            Detailed Item Customization
          </h3>
          <span className="border-2 border-slate-800 bg-slate-100 px-3 py-1 rounded font-black text-xs text-slate-800">
            {selectedItem.name.toUpperCase()} Selected
          </span>
        </div>

        {/* KOT FIRED SUCCESS BANNER */}
        {kotFired && (
          <div className="mb-3 p-3 bg-emerald-700 text-white rounded-xl font-black text-xs text-center flex items-center justify-center gap-2">
            <Flame className="h-4 w-4 fill-white" />
            ✓ KOT Fired to Kitchen — Order Sent Successfully!
          </div>
        )}

        {/* MAIN CONTENT: TWO COLUMNS */}
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* LEFT: BIG IMAGE & DIETARY DETAILS */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Item Image Space */}
            <div className="flex-1 min-h-[300px] border-2 border-dashed border-slate-400 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2">
              <span className="text-5xl">
                {isVeg ? '🥗' : (selectedItem.name.toLowerCase().includes('biryani') ? '🍛' : '🍗')}
              </span>
              <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">
                {selectedItem.name}
              </span>
            </div>

            {/* Prep & Diet Info */}
            <div className="border border-slate-300 bg-white rounded-xl p-3.5 flex justify-between items-center text-xs shadow-2xs">
              <span className="font-bold text-slate-600">Prep: ⏱ {selectedItem.prepMode || '15-20 mins'}</span>
              <span className="font-bold text-slate-600">Diet: {isVeg ? 'Pure Veg' : 'Non-Veg'} • Fresh Prep</span>
            </div>

            {/* Cart Items Summary */}
            <div className="border border-slate-300 bg-white rounded-xl p-3.5 flex flex-col gap-2 text-xs shadow-2xs">
              <div className="flex justify-between items-center font-mono">
                <span className="font-black text-slate-900 uppercase text-[10.5px]">
                  Order Cart ({orderCart.length} item{orderCart.length === 1 ? '' : 's'})
                </span>
                <span className="font-bold text-orange-600 text-[11px]">
                  Table: {selectedTableNumber || 'A-04'}
                </span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {orderCart.length > 0 ? (
                  orderCart.map((ci, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] text-slate-700 py-0.5 border-b border-dashed border-slate-100 last:border-0">
                      <span className="truncate flex-1 pr-2">
                        • {ci.quantity}x {ci.menuItem.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        ₹{ci.totalPrice}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10.5px] text-slate-400 italic">
                    1x {selectedItem.name} (Direct Single Item Customization)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATIONS & NOTES */}
          <div className="flex-[1.2] flex flex-col gap-3 overflow-y-auto">
            {/* Item Info Card */}
            <div className="border-2 border-slate-800 rounded-xl p-4 bg-slate-50">
              <h2 className="text-lg font-black text-slate-950">{selectedItem.name.toUpperCase()}</h2>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                {selectedItem.category.toUpperCase()} • Price: ₹{selectedItem.price.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            {/* Portion Size Selection */}
            <div className="border border-slate-300 bg-white rounded-xl p-4 flex flex-col gap-2.5">
              <strong className="text-xs font-black text-slate-900">PORTION SIZE SELECTION:</strong>
              <div className="flex gap-2.5">
                {(['REGULAR', 'LARGE'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPortion(p)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${
                      portion === p
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {p} Portion ({p === 'REGULAR' ? `₹${selectedItem.price}` : `+₹60`})
                  </button>
                ))}
              </div>
            </div>

            {/* Spice Level */}
            <div className="border border-slate-300 bg-white rounded-xl p-4 flex flex-col gap-2.5">
              <strong className="text-xs font-black text-slate-900">SPICE LEVEL:</strong>
              <div className="flex gap-2">
                {(['MILD', 'MEDIUM', 'VERY SPICY'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpice(s)}
                    className={`flex-1 py-2 rounded-lg border text-[11px] font-bold transition ${
                      spice === s
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Customisable Options */}
            <div className="border border-slate-300 bg-white rounded-xl p-4 flex flex-col gap-2.5">
              <strong className="text-xs font-black text-slate-900">CUSTOMISABLE OPTIONS:</strong>
              {[
                { key: 'lessSpice', label: 'Option 1: Less Spicy / Mild' },
                { key: 'noOnion', label: 'Option 2: No Onions / No Garlic' },
                { key: 'extraCheese', label: 'Option 3: Extra Cheese Topping (+₹40.00)' },
                { key: 'extraSauce', label: 'Option 4: Extra Sauce Dip (+₹25.00)' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-[11.5px] font-mono cursor-pointer text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={options[key as keyof typeof options]}
                    onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                    className="accent-slate-900 w-4 h-4"
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Chef Note */}
            <div>
              <label className="block font-bold text-[11px] text-slate-600 mb-1.5 uppercase">
                Special Chef Instruction Note:
              </label>
              <input
                type="text"
                value={chefNote}
                onChange={(e) => setChefNote(e.target.value)}
                placeholder="e.g., Crispy roast, serve hot..."
                className="w-full border border-slate-400 rounded-lg px-3 py-2.5 font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Total & Fire KOT */}
            <div className="flex gap-2.5 mt-auto pt-2">
              <div className="flex-1 border-2 border-slate-800 rounded-xl p-3 bg-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-600">Item Total:</span>
                <span className="text-xl font-black text-slate-950 font-mono">₹{totalItemPrice.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handleFireKOT}
                className="flex-[2] py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Flame className="h-5 w-5 fill-white" />
                <span>Fire KOT to Kitchen ➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
