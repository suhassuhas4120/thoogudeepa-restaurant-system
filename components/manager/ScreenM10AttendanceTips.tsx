'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Clock, Gift, Users } from 'lucide-react';

export function ScreenM10AttendanceTips() {
  const { staffRoster } = useManagerStore();
  const { shiftStats } = useSharedBridge();

  const totalTipPool = Math.max(2850, shiftStats.tipsEarned || 2850);
  const tipRecipients = staffRoster.filter((st) => st.status === 'ACTIVE' && (st.tipReceived ?? 0) > 0);
  const totalAllocatedTips = tipRecipients.reduce((sum, st) => sum + (st.tipReceived ?? 0), 0);
  const remainingPool = Math.max(0, totalTipPool - totalAllocatedTips);

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            SHIFT CHECK-IN &amp; INDIVIDUAL TIP RECEIVABLES
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-bold">TOTAL TIP POOL TODAY:</span>
          <div className="text-2xl font-black text-emerald-700">₹ {totalTipPool.toLocaleString('en-IN')}.00</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Individual Tip Allocation */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-orange-600" />
            <span>INDIVIDUAL TIP RECEIVABLES</span>
          </h4>
          <div className="space-y-3 mt-4 text-xs">
            {tipRecipients.map((st) => (
              <div key={st.id} className="p-3 bg-stone-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div className="font-bold text-slate-900">{st.name}</div>
                <div className="text-right">
                  <div className="font-black text-slate-900">₹ {st.tipReceived}</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Receivable</div>
                </div>
              </div>
            ))}

            {remainingPool > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 font-bold text-xs">
                Unassigned pool: ₹ {remainingPool}
              </div>
            )}

            <button
              onClick={() => alert('Individual tip payouts approved and logged to the receiving staff accounts!')}
              className="w-full mt-2 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition"
            >
              APPROVE &amp; DISBURSE INDIVIDUAL TIP PAYOUTS ➔
            </button>
          </div>
        </div>

        {/* Staff Attendance Log */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-600" />
            <span>Shift Attendance Log</span>
          </h4>
          <div className="space-y-2 mt-3 text-xs max-h-72 overflow-y-auto pr-1">
            {staffRoster.map((st) => (
              <div key={st.id} className="flex justify-between items-center p-2 rounded bg-stone-50 border border-slate-200">
                <span className="font-bold text-slate-800">{st.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700">
                    ₹ {st.tipReceived}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    st.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    [{st.status}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
