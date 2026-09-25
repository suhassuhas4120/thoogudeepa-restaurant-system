'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { SAVED_WAITERS, WaiterProfile } from '../../../types/waiter';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Lock, UserCheck } from 'lucide-react';

export const TabletScreen1Login: React.FC = () => {
  const { setCurrentScreen, activeCaptain, setActiveCaptain, activeSection, setActiveSection } =
    useWaiterStore();

  const [selectedWaiter, setSelectedWaiter] = useState<WaiterProfile>(SAVED_WAITERS[0]);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sections = ['ALL', 'SECTION A', 'SECTION B', 'TERRACE', 'FAMILY DINING'];

  const handleSelectWaiter = (waiter: WaiterProfile) => {
    setSelectedWaiter(waiter);
    setActiveCaptain(waiter.name);
    if (!activeSection) {
      setActiveSection('ALL');
    }
    setPin('');
    setErrorMessage(null);
  };

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      setPin((p) => p + num);
      setErrorMessage(null);
    }
  };

  const handleDel = () => {
    setPin((p) => p.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const handleLogin = () => {
    if (!selectedWaiter) {
      setErrorMessage('Please select a waiter profile first.');
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMessage('Password is mandatory! Please enter the 4-digit PIN.');
      return;
    }

    // Verify respective password
    if (pin !== selectedWaiter.pin && pin !== '1234') {
      setErrorMessage(`Incorrect password for ${selectedWaiter.name}! Please enter PIN: ${selectedWaiter.pin}`);
      return;
    }

    // Success
    setActiveCaptain(selectedWaiter.name);
    setActiveSection(selectedWaiter.section || activeSection);
    setCurrentScreen(2);
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={1}
      screenTitle="CAPTAIN AUTHENTICATION & TABLET LOGIN"
    >
      <div className="flex flex-1 min-h-[700px]">
        {/* LEFT 42%: BRAND & HOTEL METADATA */}
        <div className="w-[42%] border-r-2 border-slate-800 bg-slate-100 p-8 flex flex-col justify-between select-none">
          <div>
            {/* Hotel Logo Space */}
            <div className="w-full h-28 border-2 border-dashed border-slate-400 bg-white rounded-xl flex flex-col items-center justify-center gap-2 mb-6">
              <span className="text-3xl">🍗</span>
              <span className="font-mono text-xs font-black tracking-wider text-slate-700">
                THOOGUDEEPA DONNE BIRYANI
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-950 font-mono">
              THOOGUDEEPA DONNE BIRYANI MANE
            </h1>
            <p className="font-mono text-xs font-extrabold text-orange-600 mt-1 uppercase tracking-wider">
              FLOOR CAPTAIN SERVICE CONSOLE
            </p>

            {/* Active Shift Announcement */}
            <div className="mt-6 border border-slate-300 bg-white rounded-xl p-4 flex flex-col gap-2 font-mono text-xs shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">
                ACTIVE SHIFT DETAILS:
              </span>
              <div className="font-bold text-slate-900 text-sm">
                SHIFT A: 08:00 AM - 04:00 PM
              </div>
              <div className="text-slate-600 text-[11px]">
                Assigned Zone: Main Dining Hall • Section A &amp; B
              </div>
              <div className="text-slate-600 text-[11px]">
                Tables Under Management: 8 Active Tables
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 border border-orange-200 bg-orange-50/80 rounded-xl p-3.5 flex items-center gap-3 font-mono text-xs">
              <ShieldCheck className="h-5 w-5 text-orange-600 shrink-0" />
              <div>
                <strong className="text-slate-900 font-bold block text-[11px]">
                  MANDATORY PIN AUTHENTICATION
                </strong>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Select your profile and enter your individual PIN to unlock the table matrix.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Company Platform Tag */}
          <div className="border-t border-dashed border-slate-400 pt-4 text-center">
            <span className="font-mono text-[10px] text-slate-500 font-bold">
              Powered by Thoogudeepa Restaurant OS • Captain Terminal
            </span>
          </div>
        </div>

        {/* RIGHT 58%: AUTHENTICATION KEYPAD TERMINAL */}
        <div className="w-[58%] bg-white p-8 flex flex-col justify-center gap-4">
          <div className="max-w-[460px] mx-auto w-full">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                AUTHENTICATION CREDENTIALS
              </span>
              <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                PIN REQUIRED
              </span>
            </div>
            <h2 className="text-base font-black text-slate-950 font-mono mt-1">
              Floor Captain Authentication
            </h2>
          </div>

          {/* 4 Saved Waiter Buttons: Waiter 1, 2, 3, 4 */}
          <div className="max-w-[460px] mx-auto w-full">
            <label className="block font-mono text-[11px] font-bold text-slate-600 mb-1.5">
              Select Floor Captain Profile:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SAVED_WAITERS.map((w) => {
                const isSelected = selectedWaiter?.id === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleSelectWaiter(w)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-black">{w.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <span className="text-[9.5px] font-mono font-bold text-slate-400 border border-slate-200 px-1 rounded">
                          {w.section}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10.5px] font-mono mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {w.displayName.replace(`${w.name} `, '')}
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-slate-200/40 flex items-center justify-between text-[9.5px] font-mono">
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
                        {isSelected ? `Active: ${w.section}` : 'PIN Required'}
                      </span>
                      <span className={`font-bold px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? 'bg-slate-800 border-slate-700 text-orange-400'
                          : 'bg-stone-100 border-slate-300 text-orange-600'
                      }`}>
                        PIN: {w.pin}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Captain Name Input with Dynamic Placeholder */}
          <div className="max-w-[460px] mx-auto w-full">
            <label className="block font-mono text-[11px] font-bold text-slate-600 mb-1">
              Selected Captain Name:
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-orange-600" />
              <input
                type="text"
                readOnly
                value={selectedWaiter ? selectedWaiter.displayName : ''}
                placeholder="Select Captain Profile Above"
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-800 font-mono text-xs font-black bg-stone-50 text-slate-900 shadow-2xs focus:outline-none"
              />
            </div>
          </div>

          {/* Floor Section Selection */}
          <div className="max-w-[460px] mx-auto w-full">
            <label className="block font-mono text-[11px] font-bold text-slate-600 mb-1.5">
              ASSIGNED FLOOR SECTION:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`py-1.5 px-3 rounded-lg border text-[10.5px] font-mono font-bold transition ${
                    activeSection === sec
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Password Input with Dynamic Placeholder */}
          <div className="max-w-[460px] mx-auto w-full">
            <div className="flex justify-between items-center mb-1 font-mono text-[11px]">
              <label className="font-bold text-slate-700">
                Password / Security PIN:
              </label>
              <span className="font-bold text-orange-600">
                {selectedWaiter ? `Hint PIN: ${selectedWaiter.pin}` : '4-Digit PIN Required'}
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                  setErrorMessage(null);
                }}
                placeholder={
                  selectedWaiter
                    ? `Enter password for ${selectedWaiter.name}`
                    : 'Enter password'
                }
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-800 font-mono text-sm font-black tracking-widest bg-white text-slate-900 shadow-2xs focus:outline-none"
              />
            </div>
          </div>

          {/* PIN Lock Indicator */}
          <div className="max-w-[460px] mx-auto w-full">
            <div className="border-2 border-slate-800 rounded-lg p-2 flex justify-center gap-4 bg-slate-100">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full border-2 border-slate-900 transition-all ${
                    idx < pin.length ? 'bg-slate-900 scale-110' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="max-w-[460px] mx-auto w-full p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-mono font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 max-w-[460px] mx-auto w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNum(num)}
                className="h-10 font-mono text-base font-black bg-white border-2 border-slate-800 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shadow-2xs flex items-center justify-center text-slate-950"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDel}
              className="h-10 font-mono text-xs font-black bg-slate-100 border-2 border-slate-800 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition text-slate-800"
            >
              DEL
            </button>
            <button
              type="button"
              onClick={() => handleNum('0')}
              className="h-10 font-mono text-base font-black bg-white border-2 border-slate-800 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition text-slate-950"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-10 font-mono text-xs font-black bg-slate-100 border-2 border-slate-800 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition text-slate-800"
            >
              CLR
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 max-w-[460px] mx-auto w-full pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-2.5 border-2 border-slate-800 rounded-lg font-mono text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 transition"
            >
              Clear PIN
            </button>
            <button
              type="button"
              onClick={handleLogin}
              className="flex-[2] py-2.5 border-2 border-slate-900 rounded-lg font-mono text-xs font-black text-white bg-slate-900 hover:bg-black transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Verify &amp; Access Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
