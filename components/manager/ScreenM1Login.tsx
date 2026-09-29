'use client';

import React, { useState } from 'react';
import { useManagerStore, MANAGER_PROFILES, INITIAL_SHIFTS } from '../../store/useManagerStore';
import { ShieldCheck, Lock, Unlock, Clock, AlertCircle, CheckCircle2, RefreshCw, KeyRound } from 'lucide-react';

export function ScreenM1Login() {
  const {
    activeManager,
    setActiveManager,
    activeShift,
    setActiveShift,
    pinInput,
    enterPinDigit,
    clearPin,
    deletePinDigit,
    verifyPin,
    isAuthenticated,
    openingFloat,
    verifyOpeningFloat,
    setCurrentScreen,
  } = useManagerStore();

  const [authError, setAuthError] = useState(false);
  const [floatInput, setFloatInput] = useState('');
  const [floatError, setFloatError] = useState('');
  const [isEditingFloat, setIsEditingFloat] = useState(false);
  const [isCustomProfile, setIsCustomProfile] = useState(false);
  const [customProfileName, setCustomProfileName] = useState('');

  const handlePress = (d: string) => {
    setAuthError(false);
    enterPinDigit(d);
  };

  const handleUnlock = () => {
    if (!openingFloat) {
      setFloatError('Verify the opening cash float before unlocking the desk.');
      return;
    }
    const ok = verifyPin();
    if (!ok) {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleVerifyFloat = () => {
    const amount = Number(floatInput);
    if (!floatInput.trim() || !Number.isFinite(amount) || amount < 0) {
      setFloatError('Enter a valid non-negative opening amount.');
      return;
    }
    verifyOpeningFloat(amount);
    setFloatInput('');
    setFloatError('');
    setIsEditingFloat(false);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
      {/* Left Control Column */}
      <div className="md:col-span-5 flex flex-col gap-4">
        {/* Terminal Header */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a]">
          <h2 className="text-base font-black text-slate-900 mt-3 font-mono">
            THOOGUDEEPA DONNE BIRYANI MANE
          </h2>
        </div>

        {/* Shift Selection */}
        <div className="bg-stone-50 border border-slate-300 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-orange-600" />
            <h3 className="font-mono text-xs font-black uppercase text-slate-900">
              Select Restaurant Shift
            </h3>
          </div>
          <div className="space-y-2">
            {INITIAL_SHIFTS.map((sh) => (
              <label
                key={sh.name}
                onClick={() => setActiveShift(sh)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition ${
                  activeShift.name === sh.name
                    ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{sh.name} ({sh.timeRange})</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  sh.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  [{sh.status}]
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Opening Float Box */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500">
            <span>OPENING CASH FLOAT:</span>
            <span className={`px-1.5 py-0.5 rounded font-bold ${openingFloat ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {openingFloat ? 'VERIFIED' : 'REQUIRED'}
            </span>
          </div>
          {openingFloat ? (
            <div className="mt-1">
              {!isEditingFloat ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-2xl font-black font-mono text-slate-900">₹ {openingFloat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setFloatInput(String(openingFloat.amount));
                      setFloatError('');
                      setIsEditingFloat(true);
                    }}
                    className="border border-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-900 hover:bg-slate-100"
                  >
                    ADJUST FLOAT
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="number" min="0" step="0.01" value={floatInput} onChange={(e) => setFloatInput(e.target.value)} autoFocus className="min-w-0 flex-1 border border-slate-900 rounded-lg p-2 font-mono text-sm" />
                  <button type="button" onClick={handleVerifyFloat} className="bg-slate-900 text-white rounded-lg px-3 text-xs font-bold">UPDATE</button>
                  <button type="button" onClick={() => { setFloatInput(''); setFloatError(''); setIsEditingFloat(false); }} className="border border-slate-300 rounded-lg px-2 text-xs font-bold text-slate-600">CANCEL</button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <input type="number" min="0" step="0.01" value={floatInput} onChange={(e) => setFloatInput(e.target.value)} placeholder="Count till amount" className="min-w-0 flex-1 border border-slate-900 rounded-lg p-2 font-mono text-sm" />
              <button type="button" onClick={handleVerifyFloat} className="bg-slate-900 text-white rounded-lg px-3 text-xs font-bold">VERIFY</button>
            </div>
          )}
          {floatError && <p className="text-[11px] text-rose-600 font-bold mt-1">{floatError}</p>}
        </div>

      </div>

      {/* Right PIN Pad Column */}
      <div className="md:col-span-7 bg-white border-2 border-slate-900 rounded-xl p-6 shadow-[5px_5px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="inline-flex p-2.5 rounded-full bg-orange-100 text-orange-600 mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black font-mono text-slate-900">
              MANAGER / CASHIER AUTHENTICATION
            </h3>
          </div>

          {/* Profile Select */}
          <div className="mt-4">
            <select
              value={isCustomProfile ? 'custom' : activeManager.id}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomProfile(true);
                  setCustomProfileName('');
                  setActiveManager({ ...MANAGER_PROFILES[0], id: 'custom-manager', name: 'OTHER STAFF' });
                  return;
                }
                setIsCustomProfile(false);
                const found = MANAGER_PROFILES.find((m) => m.id === e.target.value);
                if (found) setActiveManager(found);
              }}
              className="w-full bg-stone-50 border-2 border-slate-900 rounded-lg p-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-none"
            >
              {MANAGER_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({p.role})
                </option>
              ))}
              <option value="custom">OTHER STAFF — (ENTER NAME)</option>
            </select>
            {isCustomProfile && (
              <input
                type="text"
                value={customProfileName}
                onChange={(e) => {
                  const name = e.target.value;
                  setCustomProfileName(name);
                  setActiveManager({ ...MANAGER_PROFILES[0], id: 'custom-manager', name: name || 'OTHER STAFF' });
                }}
                placeholder="Enter staff name"
                aria-label="Staff name"
                className="w-full mt-2 bg-white border-2 border-slate-900 rounded-lg p-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-none"
                autoFocus
              />
            )}
          </div>

          {/* PIN Indicators */}
          <div className="my-6 text-center">
            <div className="flex justify-center gap-4 mb-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border-2 border-slate-900 transition-all ${
                      isFilled ? 'bg-slate-900 scale-110' : 'bg-stone-100'
                    }`}
                  />
                );
              })}
            </div>
            <div className="font-mono text-xs font-bold text-slate-500">
              {authError && <span className="text-rose-600 font-black">INVALID PIN</span>}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePress(digit)}
                className="h-12 bg-white border-2 border-slate-900 rounded-lg font-mono text-lg font-black text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:bg-stone-100 transition"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={clearPin}
              className="h-12 bg-stone-100 border-2 border-slate-900 rounded-lg font-mono text-xs font-black text-rose-700 shadow-[2px_2px_0px_#0f172a] hover:bg-rose-50 transition"
            >
              CLR
            </button>
            <button
              onClick={() => handlePress('0')}
              className="h-12 bg-white border-2 border-slate-900 rounded-lg font-mono text-lg font-black text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:bg-stone-100 transition"
            >
              0
            </button>
            <button
              onClick={deletePinDigit}
              className="h-12 bg-stone-100 border-2 border-slate-900 rounded-lg font-mono text-xs font-black text-slate-700 shadow-[2px_2px_0px_#0f172a] hover:bg-stone-200 transition"
            >
              DEL
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleUnlock}
            className="flex-1 bg-slate-900 text-white py-3 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0f172a] hover:bg-orange-600 transition"
          >
            <Unlock className="h-4 w-4" />
            <span>VERIFY & UNLOCK DESK ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
