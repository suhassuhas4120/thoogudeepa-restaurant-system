'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const TabletScreen1Login: React.FC = () => {
  const { setCurrentScreen, activeCaptain, setActiveCaptain, activeSection, setActiveSection } =
    useWaiterStore();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const sections = ['ALL', 'SECTION A', 'SECTION B', 'TERRACE', 'FAMILY DINING'];

  const presetWaiters = [
    { name: 'Captain Ramesh', section: 'SECTION A' },
    { name: 'Captain Suresh', section: 'SECTION B' },
    { name: 'Captain Vijay', section: 'TERRACE' },
    { name: 'Captain Kiran', section: 'FAMILY DINING' },
  ];

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4 && nextPin !== '1234') {
        setErrorMsg('INVALID PIN: ENTER 1234');
      }
    }
  };

  const handleDel = () => {
    setPin((p) => p.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleLogin = () => {
    if (pin === '1234') {
      setErrorMsg('');
      setCurrentScreen(2);
    } else {
      setErrorMsg('ACCESS DENIED: PIN 1234 REQUIRED');
    }
  };

  return (
    <WaiterTabletLandscapeHousing
      screenNumber={1}
      screenTitle="CAPTAIN AUTHENTICATION &amp; TABLET LOGIN"
    >
      <div className="flex flex-1 min-h-[700px]">
        {/* LEFT 42%: BRAND & HOTEL METADATA */}
        <div className="w-[42%] border-r-2 border-slate-800 bg-slate-100 p-8 flex flex-col justify-between select-none">
          <div>
            {/* Hotel Logo Space */}
            <div className="w-full h-28 border-2 border-slate-800 bg-[#3a0d0d] rounded-xl overflow-hidden mb-5 shadow-sm flex items-center justify-center p-1.5 relative">
              <img
                src="/images/thoogudeepa-banner.jpg"
                alt="Thoogudeepa Donne Biriyani Mane"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-950 font-mono">
              THOOGUDEEPA DONNE BIRYANI MANE
            </h1>
            <p className="font-mono text-xs font-extrabold text-orange-600 mt-1 uppercase tracking-wider">
              Floor Captain / Waiter Service Console
            </p>

            {/* Active Shift Announcement */}
            <div className="mt-6 border border-slate-300 bg-white rounded-xl p-4 flex flex-col gap-2 font-mono text-xs shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">
                Active Shift Announcement
              </span>
              <div className="font-bold text-slate-900 text-sm">
                Shift A: 08:00 AM – 04:00 PM
              </div>
              <div className="text-slate-600 text-[11px]">
                Assigned Zone: Main Dining Hall • Section A &amp; B
              </div>
              <div className="text-slate-600 text-[11px]">
                Tables Under Management: 16 Active Tables
              </div>
            </div>


          </div>

          {/* Bottom Company Platform Tag */}
          <div className="border-t border-dashed border-slate-400 pt-4 text-center">
            <span className="font-mono text-[10px] text-slate-500 font-bold">
              Powered by Nelja-UrQR • Tablet Client v2.4
            </span>
          </div>
        </div>

        {/* RIGHT 58%: AUTHENTICATION KEYPAD TERMINAL */}
        <div className="w-[58%] bg-white p-10 flex flex-col justify-center gap-5">
          <div className="max-w-[440px] mx-auto w-full">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Authentication Credentials
            </span>
            <h2 className="text-lg font-black text-slate-950 font-mono mt-1">
              Enter Captain Name &amp; Security PIN
            </h2>
          </div>

          {/* Waiter Name Input & Quick Selector */}
          <div className="max-w-[440px] mx-auto w-full">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-mono text-[11px] font-bold text-slate-600 uppercase">
                Select or Enter Captain Name
              </label>
              <span className="font-mono text-[10px] text-slate-400">QUICK TAP PROFILE</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {presetWaiters.map((w) => {
                const isSelected = activeCaptain === w.name;
                return (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => {
                      setActiveCaptain(w.name);
                      setActiveSection(w.section);
                    }}
                    className={`py-2 px-1.5 rounded-lg border text-center font-mono text-[11px] font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate w-full">{w.name.replace('Captain ', '')}</span>
                    <span className={`text-[9px] font-normal ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {w.section.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={activeCaptain}
              onChange={(e) => setActiveCaptain(e.target.value)}
              className="w-full border-2 border-slate-800 rounded-lg px-4 py-2 font-mono text-sm font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Or type custom name (e.g. Captain Ramesh)"
            />
          </div>

          {/* Floor Section Selection */}
          <div className="max-w-[440px] mx-auto w-full">
            <label className="block font-mono text-[11px] font-bold text-slate-600 mb-1.5 uppercase">
              Assigned Floor Section
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
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

          {/* PIN Lock Indicator */}
          <div className="max-w-[440px] mx-auto w-full">
            <div className="flex justify-between items-center mb-1.5 font-mono text-[11px]">
              <label className="font-bold text-slate-600 uppercase">Security PIN / Passcode:</label>
              {errorMsg ? (
                <span className="font-bold text-rose-600 animate-pulse">
                  {errorMsg}
                </span>
              ) : pin === '1234' ? (
                <span className="font-bold text-emerald-600">
                  PIN Verified • Access Granted ✓
                </span>
              ) : pin.length === 4 ? (
                <span className="font-bold text-rose-600">
                  Invalid PIN (Enter 1234)
                </span>
              ) : (
                <span className="font-bold text-orange-600">
                  {4 - pin.length} digits required • Default: 1234
                </span>
              )}
            </div>
            <div
              className={`border-2 rounded-lg p-3 flex justify-center gap-4 transition-colors ${
                errorMsg || (pin.length === 4 && pin !== '1234')
                  ? 'border-rose-500 bg-rose-50'
                  : pin === '1234'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-800 bg-slate-100'
              }`}
            >
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    idx < pin.length
                      ? pin === '1234'
                        ? 'border-emerald-600 bg-emerald-600 scale-110'
                        : pin.length === 4
                        ? 'border-rose-600 bg-rose-600 scale-110'
                        : 'border-slate-900 bg-slate-900 scale-110'
                      : 'border-slate-400 bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[440px] mx-auto w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNum(num)}
                className="h-12 font-mono text-lg font-black bg-white border-2 border-slate-800 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shadow-2xs flex items-center justify-center text-slate-950 cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDel}
              className="h-12 font-mono text-xs font-black bg-slate-100 border-2 border-slate-800 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition text-slate-800 cursor-pointer"
            >
              DEL
            </button>
            <button
              type="button"
              onClick={() => handleNum('0')}
              className="h-12 font-mono text-lg font-black bg-white border-2 border-slate-800 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition text-slate-950 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-12 font-mono text-xs font-black bg-slate-100 border-2 border-slate-800 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition text-slate-800 cursor-pointer"
            >
              CLR
            </button>
          </div>

          {/* Action Button */}
          <div className="max-w-[440px] mx-auto w-full">
            <button
              type="button"
              onClick={handleLogin}
              className={`w-full py-3.5 border-2 rounded-lg font-mono text-xs font-black transition shadow-sm flex items-center justify-center gap-2 ${
                pin === '1234'
                  ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-md'
                  : 'border-slate-900 bg-slate-900 text-white hover:bg-black cursor-pointer'
              }`}
            >
              <span>Login to Floor Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </WaiterTabletLandscapeHousing>
  );
};
