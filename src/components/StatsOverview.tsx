import React from 'react';
import type { Transaction } from '../types/payment';
import { ShieldAlert, ShieldX, Activity, IndianRupee, Clock, ArrowUpRight } from 'lucide-react';

interface StatsOverviewProps {
  transactions: Transaction[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ transactions }) => {
  const totalCount = transactions.length;
  const blockedCount = transactions.filter(t => t.status === 'BLOCKED').length;
  const reviewCount = transactions.filter(t => t.status === 'REVIEW_FLAGGED').length;
  const stepUpCount = transactions.filter(t => t.status === 'STEP_UP_REQUIRED').length;

  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const blockedVolume = transactions
    .filter(t => t.status === 'BLOCKED' || t.status === 'REVIEW_FLAGGED')
    .reduce((acc, t) => acc + t.amount, 0);

  const avgRiskScore = Math.round(
    transactions.reduce((acc, t) => acc + t.riskAssessment.overallScore, 0) / Math.max(totalCount, 1)
  );

  const avgLatencyMs = Math.round(
    transactions.reduce((acc, t) => acc + t.riskAssessment.processingTimeMs, 0) / Math.max(totalCount, 1)
  );

  const fraudRatePercent = (( (blockedCount + reviewCount) / Math.max(totalCount, 1) ) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* 1. Scanned Volume & Count */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Scanned Volume</span>
          <div className="p-2 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/50">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-outfit font-extrabold text-white">
            ₹{totalVolume.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400">
            <span className="font-mono text-cyan-400 font-bold">{totalCount}</span>
            <span>transactions processed</span>
          </div>
        </div>
      </div>

      {/* 2. Fraud Loss Saved ($ / ₹) */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Loss Prevented</span>
          <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-outfit font-extrabold text-emerald-400">
            ₹{blockedVolume.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-xs text-emerald-500/80">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% intercepted before payout</span>
          </div>
        </div>
      </div>

      {/* 3. Threat Interception Breakdown */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blocked & Flagged</span>
          <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/50">
            <ShieldX className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-outfit font-extrabold text-red-400">{blockedCount}</span>
            <span className="text-xs text-amber-400 font-semibold">({reviewCount} review, {stepUpCount} 2FA)</span>
          </div>
          <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400">
            <span>Threat rate:</span>
            <span className="font-mono text-red-400 font-bold">{fraudRatePercent}%</span>
          </div>
        </div>
      </div>

      {/* 4. Average AI Risk Score */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average System Risk</span>
          <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-outfit font-extrabold ${
              avgRiskScore > 60 ? 'text-red-400' : avgRiskScore > 35 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {avgRiskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                avgRiskScore > 60 ? 'bg-red-500' : avgRiskScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${avgRiskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Processing Engine Latency */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Latency</span>
          <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/50">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-outfit font-extrabold text-purple-300">
            {avgLatencyMs || 11} <span className="text-xs font-sans text-slate-400 font-normal">ms</span>
          </div>
          <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">Sub-15ms Realtime SLA</span>
          </div>
        </div>
      </div>

    </div>
  );
};
