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
      <div className="flex h-full flex-col justify-between bg-gradient-to-b from-[#fff8ef] via-[#fffdfb] to-[#f7f0ea] p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3 pt-3 text-center"
        >

          <motion.div
            initial={{ rotate: -8, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
            className="relative flex h-24 w-24 flex-col items-center justify-center rounded-[28px] border border-orange-200 bg-gradient-to-br from-[#fff4d6] via-[#ffedd5] to-[#ffd7b0] p-2 shadow-[0_18px_35px_rgba(249,115,22,0.18)]"
          >
            <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(255,255,255,0)_55%)]" />
            <Crown className="relative h-10 w-10 text-orange-600 stroke-[1.8]" />
            <span className="relative mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-orange-950">THOOGUDEEPA</span>
          </motion.div>

          <div className="mt-1 w-full">
            <div className="mt-2 rounded-[24px] border border-orange-100 bg-white/85 px-4 py-3 shadow-[0_10px_25px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <h2 className="text-base font-black tracking-[0.08em] text-slate-900 uppercase">{venueName}</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-500 capitalize">Authentic Donne Biryani &amp; Military Flavours</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="my-3 flex flex-col gap-3"
        >
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleWifiConnect}
              className={`flex w-full items-center justify-center gap-2 rounded-[20px] border py-3.5 px-4 text-[11px] font-extrabold tracking-[0.12em] shadow-[0_10px_20px_rgba(15,23,42,0.06)] transition ${
                wifiConnected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-orange-100 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              {wifiConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Wi-Fi Connected: Free High-Speed</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-orange-600 animate-pulse" />
                  <span>Connect To Restaurant Free Wi-Fi</span>
                </>
              )}
            </motion.button>
          </div>
              
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!guestName.trim()) setGuestName('GUEST (TABLE A-04)');
                setCurrentScreen(2);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-white/90 py-3 px-4 text-[11px] font-black tracking-[0.12em] text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
            >
              <span>🌐</span>
              <span className="capitalize">Continue With Mobile Data</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center pb-2 pt-1"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mt-1 flex items-center gap-1.5 rounded-full border border-orange-100 bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700 shadow-[0_5px_10px_rgba(15,23,42,0.04)]">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span className="capitalize">Powered By Platform</span>
            </div>
          </div>
        </motion.div>
      </div>
    </ScreenHousing>
  );
};
