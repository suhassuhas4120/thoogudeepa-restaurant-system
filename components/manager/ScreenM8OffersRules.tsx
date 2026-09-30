'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Tag, ShieldAlert, CheckCircle, Percent } from 'lucide-react';

export function ScreenM8OffersRules() {
  const { promos, togglePromo } = useManagerStore();

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            ACTIVE PROMOTIONAL CAMPAIGNS &amp; MANAGER OVERRIDES
          </h3>
        </div>
        <Tag className="h-5 w-5 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-xl border-2 transition flex flex-col justify-between ${
              p.isActive
                ? 'bg-white border-slate-900 shadow-[3px_3px_0px_#0f172a]'
                : 'bg-stone-50 border-slate-300 opacity-60'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  {p.code}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {p.isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>

              <h4 className="font-black text-sm text-slate-900 mt-2">{p.title}</h4>
              <p className="text-xs text-slate-600 mt-1">{p.description}</p>

              <div className="mt-3 flex gap-3 text-xs text-slate-500">
                <span>Discount: <strong className="text-orange-600 font-black">{p.discountPercent}% OFF</strong></span>
                <span>Min Order: <strong>₹ {p.minBillAmount}</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => togglePromo(p.id)}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                  p.isActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {p.isActive ? 'PAUSE PROMOTION' : 'ENABLE PROMOTION'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
