'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Banknote } from 'lucide-react';

export function ScreenM6WaiterCash() {
  const { staffRoster, reconcileStaffCash } = useManagerStore();
  const [cashInputs, setCashInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(staffRoster.map((st) => [st.id, String(st.cashHandedOver)]))
  );
  const [inputError, setInputError] = useState('');

  const handleCashInput = (staffId: string, value: string) => {
    setInputError('');
    setCashInputs((prev) => ({
      ...prev,
      [staffId]: value,
    }));
  };

  const handleSaveCash = (staffId: string, staffName: string) => {
    const input = cashInputs[staffId];
    const handedOver = Number(input);
    if (input === undefined || !Number.isFinite(handedOver) || handedOver < 0) {
      setInputError('Enter a valid non-negative handover amount before saving.');
      return;
    }
    const staff = staffRoster.find((st) => st.id === staffId);
    if (!staff) return;
    reconcileStaffCash(staffId, staff.cashCollected, handedOver);
    setInputError(`${staffName} cash reconciliation saved.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-5 font-mono">
      {/* Left Captain Cash Balance */}
      <div className="md:col-span-12 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
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
                const handedOverInput = cashInputs[st.id] ?? String(st.cashHandedOver);
                const enteredHandedOver = handedOverInput.trim() === '' ? null : Number(handedOverInput);
                const diff = enteredHandedOver !== null && Number.isFinite(enteredHandedOver)
                  ? st.cashCollected - enteredHandedOver
                  : st.cashCollected - st.cashHandedOver;
                return (
                  <div key={st.id} className="p-3 bg-stone-50 rounded-xl border border-slate-300 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900">{st.name}</span>
                      <span className="text-slate-500">{st.assignedSection}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-400">COLLECTED</div>
                        <div className="font-bold text-slate-800 mt-1">₹ {st.cashCollected}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">HANDED OVER</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-slate-600">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={handedOverInput}
                            onChange={(e) => handleCashInput(st.id, e.target.value)}
                            className="w-full min-w-0 h-10 border-2 border-slate-900 rounded p-2 text-base font-bold text-emerald-700"
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

    </div>
  );
}
