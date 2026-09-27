'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Banknote, Calculator, CheckCircle2, IndianRupee } from 'lucide-react';

export function ScreenM6WaiterCash() {
  const { staffRoster, reconcileStaffCash } = useManagerStore();
  const [cashInputs, setCashInputs] = useState<Record<string, { collected: string; handedOver: string }>>(() =>
    Object.fromEntries(staffRoster.map((st) => [st.id, { collected: String(st.cashCollected), handedOver: String(st.cashHandedOver) }]))
  );
  const [inputError, setInputError] = useState('');

  // Denominations
  const [counts, setCounts] = useState<{ [denom: number]: number }>({
    500: 12,
    200: 8,
    100: 25,
    50: 10,
    20: 15,
    10: 20,
  });

  const totalCalculated = Object.entries(counts).reduce(
    (acc, [denom, qty]) => acc + Number(denom) * qty,
    0
  );

  const handleQtyChange = (denom: number, val: string) => {
    const n = Math.max(0, parseInt(val, 10) || 0);
    setCounts((prev) => ({ ...prev, [denom]: n }));
  };

  const handleCashInput = (staffId: string, field: 'collected' | 'handedOver', value: string) => {
    setInputError('');
    setCashInputs((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], [field]: value },
    }));
  };

  const handleSaveCash = (staffId: string, staffName: string) => {
    const input = cashInputs[staffId];
    const collected = Number(input?.collected);
    const handedOver = Number(input?.handedOver);
    if (!input || !Number.isFinite(collected) || !Number.isFinite(handedOver) || collected < 0 || handedOver < 0) {
      setInputError('Enter valid non-negative amounts before saving.');
      return;
    }
    reconcileStaffCash(staffId, collected, handedOver);
    setInputError(`${staffName} cash reconciliation saved.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-5 font-mono">
      {/* Left Captain Cash Balance */}
      <div className="md:col-span-6 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500">[CASH SETTLEMENT DESK]</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                CAPTAIN TABLE-SIDE CASH RECONCILIATION
              </h3>
            </div>
            <Banknote className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="space-y-3 mt-4">
            {staffRoster.map((st) => {
                const diff = st.cashCollected - st.cashHandedOver;
                const input = cashInputs[st.id] || { collected: String(st.cashCollected), handedOver: String(st.cashHandedOver) };
                return (
                  <div key={st.id} className="p-3 bg-stone-50 rounded-xl border border-slate-300 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900">{st.name}</span>
                      <span className="text-slate-500">{st.assignedSection}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-400">COLLECTED</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-slate-600">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={input.collected}
                            onChange={(e) => handleCashInput(st.id, 'collected', e.target.value)}
                            className="w-full min-w-0 border border-slate-900 rounded p-1 font-bold"
                            aria-label={`${st.name} cash collected`}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">HANDED OVER</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-slate-600">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={input.handedOver}
                            onChange={(e) => handleCashInput(st.id, 'handedOver', e.target.value)}
                            className="w-full min-w-0 border border-slate-900 rounded p-1 font-bold text-emerald-700"
                            aria-label={`${st.name} cash handed over`}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">DIFF / DUE</div>
                        <div className={`font-black ${diff === 0 ? 'text-slate-500' : 'text-rose-600'}`}>
                          ₹ {diff}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveCash(st.id, st.name)}
                      className="w-full mt-2 bg-slate-900 text-white py-1 rounded text-xs font-bold hover:bg-emerald-600 transition text-center"
                    >
                      SAVE CASH RECONCILIATION
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {inputError && <p className="mt-3 text-xs font-bold text-slate-600">{inputError}</p>}

        <div className="mt-4 p-3 bg-stone-100 rounded-lg border border-slate-300 text-xs text-slate-600">
          All table-side cash collections must be deposited into till before shift handover.
        </div>
      </div>

      {/* Right Denomination Counter */}
      <div className="md:col-span-6 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Physical Cash Denomination Counter
            </h3>
            <Calculator className="h-5 w-5 text-slate-600" />
          </div>

          <div className="space-y-2 mt-4 text-xs">
            {[500, 200, 100, 50, 20, 10].map((denom) => (
              <div key={denom} className="flex items-center justify-between p-2 rounded bg-stone-50 border border-slate-200">
                <span className="font-black text-slate-800 w-16">₹ {denom} x</span>
                <input
                  type="number"
                  min="0"
                  value={counts[denom]}
                  onChange={(e) => handleQtyChange(denom, e.target.value)}
                  className="w-20 text-center bg-white border border-slate-900 rounded p-1 font-bold"
                />
                <span className="font-black text-slate-900 w-24 text-right">
                  = ₹ {(denom * (counts[denom] || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-slate-900">
          <div className="flex justify-between items-center text-sm font-black">
            <span>TOTAL PHYSICAL CASH IN TILL:</span>
            <span className="text-xl text-emerald-700">₹ {totalCalculated.toLocaleString('en-IN')}.00</span>
          </div>
          <button
            onClick={() => alert(`Physical Cash Count ₹${totalCalculated} locked into Master Shift Audit!`)}
            className="w-full mt-4 bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition shadow-[3px_3px_0px_#0f172a]"
          >
            CONFIRM &amp; LOCK TILL BALANCE ➔
          </button>
        </div>
      </div>
    </div>
  );
}
