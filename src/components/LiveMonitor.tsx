import React, { useState } from 'react';
import type { Transaction, AttackVectorType } from '../types/payment';
import { ATTACK_SCENARIOS } from '../services/mockData';
import { 
  Zap, 
  Search, 
  Eye, 
  ShieldAlert, 
  ShieldX, 
  ShieldCheck, 
  KeyRound, 
  Globe, 
  Smartphone, 
  Plus, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface LiveMonitorProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onInjectAttack: (scenarioId: string) => void;
  onOpenCustomTxModal: () => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  transactions,
  onSelectTransaction,
  onInjectAttack,
  onOpenCustomTxModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Filter transactions
  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.senderVpa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient.vpa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.location.city.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRisk === 'ALL') return true;
    if (filterRisk === 'BLOCKED') return tx.status === 'BLOCKED';
    if (filterRisk === 'REVIEW') return tx.status === 'REVIEW_FLAGGED';
    if (filterRisk === 'STEP_UP') return tx.status === 'STEP_UP_REQUIRED';
    if (filterRisk === 'ALLOWED') return tx.status === 'ALLOWED';
    if (filterRisk === 'CRITICAL') return tx.riskAssessment.riskLevel === 'CRITICAL';
    if (filterRisk === 'HIGH') return tx.riskAssessment.riskLevel === 'HIGH';

    return true;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/80 shadow-sm shadow-red-950">
            <ShieldX className="w-3 h-3 text-red-400" />
            <span>BLOCKED</span>
          </span>
        );
      case 'REVIEW_FLAGGED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>FLAG REVIEW</span>
          </span>
        );
      case 'STEP_UP_REQUIRED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
            <KeyRound className="w-3 h-3 text-cyan-400" />
            <span>STEP-UP 2FA</span>
          </span>
        );
      case 'ALLOWED':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>APPROVED</span>
          </span>
        );
    }
  };

  const getVectorBadge = (vector: AttackVectorType) => {
    switch (vector) {
      case 'ACCOUNT_TAKEOVER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-900/40 text-red-300 border border-red-700/50">🚨 Account Takeover</span>;
      case 'IMPOSSIBLE_TRAVEL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-900/40 text-purple-300 border border-purple-700/50">📍 Geo Velocity Anomaly</span>;
      case 'MONEY_MULE_RING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-900/40 text-orange-300 border border-orange-700/50">🕸️ Mule Network Ring</span>;
      case 'RAPID_VELOCITY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-900/40 text-amber-300 border border-amber-700/50">⚡ Velocity Burst</span>;
      case 'COMPROMISED_DEVICE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">📱 Emulator / VPN</span>;
      case 'SCAM_VPA_PHISHING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-pink-900/40 text-pink-300 border border-pink-700/50">⚠️ Phishing Scam VPA</span>;
      case 'BENIGN':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">Legitimate Transfer</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Attack Scenario Simulator Ingestion Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-cyan-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
              <h2 className="font-outfit text-base font-bold text-white tracking-wide">
                Attack Simulation Studio
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono font-semibold">
                Live Attack Injection
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly inject simulated attack vectors into the real-time AI risk engine to verify threat mitigation.
            </p>
          </div>

          <button
            onClick={onOpenCustomTxModal}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Inject Custom Payload</span>
          </button>
        </div>

        {/* Attack Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ATTACK_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => onInjectAttack(scen.id)}
              className={`p-3 rounded-xl border text-left transition-all group relative hover:-translate-y-0.5 hover:shadow-lg ${scen.badgeColor} hover:border-slate-500`}
            >
              <div className="flex items-center justify-between">
                <span className="font-outfit text-xs font-bold text-slate-100 group-hover:text-white">
                  {scen.name}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {scen.description}
              </p>
              <div className="mt-2.5 flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 group-hover:underline">
                <span>Simulate Attack</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Transaction Feed Control Header & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A]/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, User, VPA, Recipient, or City..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {['ALL', 'BLOCKED', 'REVIEW', 'STEP_UP', 'ALLOWED', 'CRITICAL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterRisk(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterRisk === f
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

      </div>

      {/* Real-time Stream Table */}
      <div className="bg-[#0F172A]/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Tx ID & Time</th>
                <th className="py-3 px-4">Sender & VPA</th>
                <th className="py-3 px-4">Recipient Account</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Device & Geo Context</th>
                <th className="py-3 px-4">AI Risk Score</th>
                <th className="py-3 px-4">Status & Action</th>
                <th className="py-3 px-4 text-center">XAI Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No transactions match the selected search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const score = tx.riskAssessment.overallScore;
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        tx.status === 'BLOCKED' ? 'bg-red-950/10' : tx.status === 'REVIEW_FLAGGED' ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* ID & Time */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-200">{tx.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </td>

                      {/* Sender */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{tx.senderName}</div>
                        <div className="text-[11px] font-mono text-cyan-400/80">{tx.senderVpa}</div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{tx.recipient.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                          <span>{tx.recipient.vpa}</span>
                          {tx.recipient.isKnownMule && (
                            <span className="text-[10px] px-1 py-0.2 bg-red-900/60 text-red-300 rounded font-bold">MULE</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-slate-100">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Device & Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1 text-slate-300">
                          <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{tx.location.city}, {tx.location.country}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                          <Smartphone className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{tx.device.deviceName}</span>
                          {tx.device.isEmulator && <span className="text-[9px] px-1 bg-purple-900 text-purple-300 rounded font-mono">EMU</span>}
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-extrabold text-sm ${
                            score >= 80 ? 'text-red-400' : score >= 60 ? 'text-amber-400' : score >= 35 ? 'text-cyan-400' : 'text-emerald-400'
                          }`}>
                            {score}
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${
                                score >= 80 ? 'bg-red-500' : score >= 60 ? 'bg-amber-500' : score >= 35 ? 'bg-cyan-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-1">
                          {getVectorBadge(tx.riskAssessment.attackVector)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(tx.status)}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onSelectTransaction(tx)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 border border-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center space-x-1.5 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Inspect XAI</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
