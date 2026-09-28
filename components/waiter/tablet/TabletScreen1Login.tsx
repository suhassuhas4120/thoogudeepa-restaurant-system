'use client';

import React, { useState } from 'react';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { WaiterTabletLandscapeHousing } from './WaiterTabletLandscapeHousing';
import { ArrowRight } from 'lucide-react';

export const TabletScreen1Login: React.FC = () => {
  const {
    setCurrentScreen,
    activeCaptain,
    setActiveCaptain,
    activeSection,
    setActiveSection,
  } = useWaiterStore();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const sections = [
    'ALL',
    'SECTION A',
    'SECTION B',
    'SECTION C',
    'SECTION D',
  ];

  const presetWaiters = [
    { name: 'Captain Ramesh', section: 'SECTION A' },
    { name: 'Captain Suresh', section: 'SECTION B' },
    { name: 'Captain Vijay', section: 'SECTION C' },
    { name: 'Captain Kiran', section: 'SECTION D' },
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
      screenTitle="CAPTAIN AUTHENTICATION & TABLET LOGIN"
    >
      <div className="flex flex-1 min-h-[700px] bg-slate-100">

        {/* =========================================================
            LEFT SIDE
        ========================================================= */}
        <div className="w-[45%] bg-slate-100 p-7 flex flex-col">

          {/* BRAND CARD */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">

            <div className="w-full h-24 rounded-xl overflow-hidden bg-[#3a0d0d] p-1.5">
              <img
                src="/images/thoogudeepa-banner.jpg"
                alt="Thoogudeepa Donne Biriyani Mane"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="mt-4">
              <h1 className="text-[18px] font-black tracking-tight text-slate-950 font-mono leading-tight">
                THOOGUDEEPA DONNE
                <br />
                BIRIYANI MANE
              </h1>

              {/* <p className="font-mono text-[11px] font-extrabold text-orange-600 mt-2 uppercase tracking-wider">
                Floor Captain / Waiter Service Console
              </p> */}
            </div>

          </div>

          {/* FLOOR SECTION CARD */}
          <div className="flex-1 flex items-center py-5">

            <div className="w-full bg-white rounded-2xl p-5 shadow-sm">

              <div className="mb-4">

                <h2 className="font-mono text-[15px] font-black text-slate-950 uppercase mt-1">
                  Assigned Floor Section
                </h2>

              </div>

              <div className="grid grid-cols-2 gap-2.5">

                {sections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setActiveSection(sec)}
                    className={`h-[52px] rounded-xl px-3 font-mono text-[11px] font-black transition-all cursor-pointer ${
                      activeSection === sec
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sec}
                  </button>
                ))}

              </div>

            </div>

          </div>

        </div>

        {/* =========================================================
            RIGHT SIDE
        ========================================================= */}
        <div className="w-[55%] bg-white p-7 flex items-center">

          <div className="w-full max-w-[500px] mx-auto">

            {/* RIGHT HEADER */}
            <div className="mb-5">

              <h2 className="text-[18px] font-black text-slate-950 font-mono">
                CAPTAIN LOGIN
              </h2>

              {/* <p className="font-mono text-[10px] font-bold text-slate-400 uppercase mt-1">
                Select captain and enter security PIN
              </p> */}

            </div>

            {/* =====================================================
                CAPTAIN SELECTION
            ===================================================== */}
            <div className="mb-5">

              <label className="block font-mono text-[10px] font-black text-slate-600 uppercase mb-2">
                Select or Enter Captain Name
              </label>

              <div className="grid grid-cols-4 gap-2 mb-2.5">

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
                      className={`h-[60px] rounded-xl px-1.5 text-center font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >

                      <span className="text-[11px] font-black truncate w-full">
                        {w.name.replace('Captain ', '')}
                      </span>

                      <span
                        className={`text-[8px] font-bold uppercase ${
                          isSelected
                            ? 'text-slate-300'
                            : 'text-slate-400'
                        }`}
                      >
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
                className="w-full h-11 border-2 border-slate-800 rounded-xl px-4 font-mono text-[12px] font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Or type custom name (e.g. Captain Ramesh)"
              />

            </div>

            {/* =====================================================
                PIN SECTION
            ===================================================== */}
            <div className="mb-4">

              <div className="flex justify-between items-center mb-2">

                {/* <label className="font-mono text-[10px] font-black text-slate-600 uppercase">
                  Security PIN / Passcode
                </label> */}

                {errorMsg ? (
                  <span className="font-mono text-[9px] font-black text-rose-600 animate-pulse">
                    {errorMsg}
                  </span>
                ) : pin === '1234' ? (
                  <span className="font-mono text-[9px] font-black text-emerald-600">
                    PIN VERIFIED ✓
                  </span>
                ) : pin.length === 4 ? (
                  <span className="font-mono text-[9px] font-black text-rose-600">
                    INVALID PIN
                  </span>
                ) : null }

              </div>

              {/* PIN DISPLAY */}
              <div
                className={`h-[52px] rounded-xl flex items-center justify-center gap-5 ${
                  errorMsg ||
                  (pin.length === 4 && pin !== '1234')
                    ? 'bg-rose-50'
                    : pin === '1234'
                    ? 'bg-emerald-50'
                    : 'bg-slate-100'
                }`}
              >

                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      idx < pin.length
                        ? pin === '1234'
                          ? 'bg-emerald-600 scale-110'
                          : pin.length === 4
                          ? 'bg-rose-600 scale-110'
                          : 'bg-slate-900 scale-110'
                        : 'bg-transparent border-2 border-slate-400'
                    }`}
                  />
                ))}

              </div>

            </div>

            {/* =====================================================
                KEYPAD
            ===================================================== */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">

              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
                (num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNum(num)}
                    className="h-[48px] bg-white border-2 border-slate-800 rounded-xl font-mono text-[17px] font-black text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                  >
                    {num}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={handleDel}
                className="h-[48px] bg-slate-100 border-2 border-slate-800 rounded-xl font-mono text-[10px] font-black text-slate-800 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
              >
                DEL
              </button>

              <button
                type="button"
                onClick={() => handleNum('0')}
                className="h-[48px] bg-white border-2 border-slate-800 rounded-xl font-mono text-[17px] font-black text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="h-[48px] bg-slate-100 border-2 border-slate-800 rounded-xl font-mono text-[10px] font-black text-slate-800 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
              >
                CLR
              </button>

            </div>

            {/* =====================================================
                LOGIN BUTTON
            ===================================================== */}
            <button
              type="button"
              onClick={handleLogin}
              className={`w-full h-[52px] rounded-xl font-mono text-[11px] font-black transition-all flex items-center justify-center gap-2 ${
                pin === '1234'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md cursor-pointer'
                  : 'bg-slate-900 text-white hover:bg-black shadow-sm cursor-pointer'
              }`}
            >
              <span>LOGIN TO FLOOR CONSOLE</span>

              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </div>

      </div>
    </WaiterTabletLandscapeHousing>
  );
};

/* Active Shift Announcement
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
*/