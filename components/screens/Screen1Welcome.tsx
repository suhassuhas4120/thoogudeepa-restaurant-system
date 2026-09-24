'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { Wifi, ArrowRight, Crown, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen1Welcome: React.FC = () => {
  const { setCurrentScreen, guestName, setGuestName, venueName } = useCustomer();
  const [wifiConnected, setWifiConnected] = useState(false);

  const handleWifiConnect = () => {
    setWifiConnected(true);
  };

  return (
    <ScreenHousing screenNumber={1} screenTitle="WELCOME & CONNECT">
      <div className="flex h-full flex-col justify-between p-6 bg-gradient-to-b from-amber-50/40 via-white to-stone-50">
        {/* Top: Venue Logo & Name with QR Scan Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center text-center gap-3 pt-4"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 font-mono">
            [LOGO ANIMATION ON QR SCAN]
          </div>

          <motion.div
            initial={{ rotate: -8, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
            className="relative flex h-24 w-24 flex-col items-center justify-center rounded-3xl border-2 border-orange-200/80 bg-gradient-to-tr from-amber-100 to-orange-50 p-2 shadow-md shadow-orange-500/10"
          >
            <Crown className="h-10 w-10 text-orange-600 stroke-[1.8]" />
            <span className="mt-1 text-[8.5px] font-black tracking-wider text-orange-950 text-center uppercase">THOOGUDEEPA</span>
          </motion.div>

          <div className="mt-2 w-full">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [ESTABLISHMENT / VENUE NAME]
            </div>
            <div className="mt-1 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
              <h2 className="text-base font-black tracking-wide text-slate-900">{venueName}</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Authentic Donne Biryani &amp; Military Flavours</p>
            </div>
          </div>
        </motion.div>

        {/* Middle: Wi-Fi Connect & Continue with Mobile Data Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-3 my-auto"
        >
          {/* Wi-Fi Connect Button */}
          <div>
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [WIFI CONNECT BUTTON]
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleWifiConnect}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl border py-3.5 px-4 text-xs font-extrabold tracking-wide transition shadow-sm ${
                wifiConnected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {wifiConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[WI-FI CONNECTED: FREE HIGH-SPEED]</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-orange-600 animate-pulse" />
                  <span>[CONNECT TO RESTAURANT FREE WI-FI]</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Continue with Mobile Data Button */}
          <div>
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [CONTINUE WITH MOBILE DATA BUTTON]
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!guestName.trim()) setGuestName('Guest (Table A-04)');
                setCurrentScreen(2);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <span>🌐</span>
              <span>[CONTINUE WITH MOBILE DATA]</span>
            </motion.button>
          </div>

          {/* Customer Name Input */}
          <div>
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [CUSTOMER NAME INPUT]
            </div>
            <div className="relative">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="[ENTER YOUR NAME]"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Bottom: Go To Menu Button & Small Company Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 pb-2"
        >
          <div>
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [GO TO MENU BUTTON]
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!guestName.trim()) setGuestName('Guest (Table A-04)');
                setCurrentScreen(2);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700 transition"
            >
              <span>[PROCEED TO MENU]</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* Small Our Company Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              [SMALL OUR COMPANY LOGO]
            </div>
            <div className="mt-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-xs">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span>[POWERED BY PLATFORM]</span>
            </div>
          </div>
        </motion.div>
      </div>
    </ScreenHousing>
  );
};
