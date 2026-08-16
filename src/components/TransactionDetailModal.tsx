import React from 'react';
import type { Transaction } from '../types/payment';
import { 
  X, 
  ShieldX, 
  CheckCircle2, 
  User, 
  TrendingUp, 
  Cpu,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOverrideAction: (txId: string, newAction: Transaction['status']) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onOverrideAction
}) => {
  if (!transaction) return null;

  const { riskAssessment } = transaction;
  const score = riskAssessment.overallScore;

  // Prepare SHAP Feature Impact Data for Recharts
  const chartData = riskAssessment.featureImpacts.map(f => ({
    name: f.featureName,
    score: f.scoreContribution,
    category: f.category
  }));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GEO': return '#A855F7'; // purple
      case 'DEVICE': return '#06B6D4'; // cyan
      case 'AMOUNT': return '#F59E0B'; // amber
      case 'RECIPIENT': return '#EF4444'; // red
      case 'VELOCITY': return '#F97316'; // orange
      default: return '#3B82F6';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              score >= 80 ? 'bg-red-950/80 text-red-400 border border-red-800' : score >= 60 ? 'bg-amber-950/80 text-amber-400 border border-amber-800' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-outfit text-lg font-bold text-white">
                  Explainable AI (XAI) Risk Analysis
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  {transaction.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calculated at {new Date(transaction.timestamp).toLocaleString()} ({riskAssessment.processingTimeMs}ms inference)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Top Score Dial & Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Risk Dial Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Risk Score</span>
              <div className={`mt-2 font-outfit text-5xl font-extrabold ${
                score >= 80 ? 'text-red-400' : score >= 60 ? 'text-amber-400' : score >= 35 ? 'text-cyan-400' : 'text-emerald-400'
              }`}>
                {score} <span className="text-xs text-slate-500 font-sans">/ 100</span>
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${
                  riskAssessment.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                  riskAssessment.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  riskAssessment.riskLevel === 'MEDIUM' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {riskAssessment.riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Attack Vector & Decision */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Automated Decision Policy</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">Policy Rule #42-B</span>
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  <div className="text-xl font-outfit font-extrabold text-white">
                    Action: <span className="text-amber-400">{riskAssessment.actionRecommendation}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                    Vector: {riskAssessment.attackVector}
                  </span>
                </div>
              </div>

              {/* Natural Language XAI Summary */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="font-semibold text-cyan-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explainable AI Rationale:</span>
                </div>
                {riskAssessment.xaiReasoning.map((reason, idx) => (
                  <p key={idx} className="leading-relaxed pl-4 border-l-2 border-slate-700">
                    {reason}
                  </p>
                ))}
              </div>
            </div>

          </div>

          {/* Feature Attribution (SHAP) Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-outfit text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Feature Attribution Breakdown (SHAP Values)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Individual risk factor score contributions adding up to the total risk score.
                </p>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 font-mono">
                No risk flags triggered. Transaction matches safe baseline.
              </div>
            ) : (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" domain={[0, 60]} stroke="#64748B" fontSize={11} />
                    <YAxis dataKey="name" type="category" width={180} stroke="#94A3B8" fontSize={11} tick={{ fill: '#CBD5E1' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* User Historical Baseline vs Current Transaction Context */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="font-outfit text-sm font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>User Behavioral Context vs Baseline</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Sender Details */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">Sender Baseline Profile</div>
                <div className="font-semibold text-slate-100">{transaction.senderName} ({transaction.senderVpa})</div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span>Average Transfer Size:</span>
                  <span className="font-mono text-cyan-400">₹{transaction.senderAvgTxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Home Geo Location:</span>
                  <span className="font-mono text-slate-200">{transaction.previousLocation?.city || transaction.location.city}</span>
                </div>
              </div>

              {/* Current Context */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">Current Payment Context</div>
                <div className="font-semibold text-slate-100">Attempted Amount: <span className="font-mono text-amber-400">₹{transaction.amount.toLocaleString()}</span></div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span>Transaction IP & City:</span>
                  <span className="font-mono text-slate-200">{transaction.location.city} ({transaction.location.ip})</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Hardware & VPN:</span>
                  <span className="font-mono text-purple-400">
                    {transaction.device.deviceName} {transaction.device.isVpn ? '(VPN Active)' : ''}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Security Analyst Action Override */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-outfit text-sm font-bold text-white">Analyst Manual Override</div>
              <p className="text-xs text-slate-400">
                Override automated AI policy action and log security analyst verdict.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onOverrideAction(transaction.id, 'BLOCKED');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <ShieldX className="w-3.5 h-3.5" />
                <span>Force Block</span>
              </button>

              <button
                onClick={() => {
                  onOverrideAction(transaction.id, 'STEP_UP_REQUIRED');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Require 2FA</span>
              </button>

              <button
                onClick={() => {
                  onOverrideAction(transaction.id, 'ALLOWED');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Whitelist</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
