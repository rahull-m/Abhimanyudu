import React, { useState } from 'react';
import type { Transaction, PolicyConfig } from '../types/payment';
import { evaluateTransaction, DEFAULT_POLICY_CONFIG } from '../services/riskEngine';
import { INITIAL_USER_ACCOUNTS } from '../services/mockData';
import { 
  Smartphone, 
  Server, 
  BrainCircuit, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowDown, 
  Play, 
  RotateCcw, 
  Zap, 
  Lock, 
  Sparkles
} from 'lucide-react';

interface ArchitecturePipelineProps {
  onTransactionProcessed: (tx: Transaction) => void;
  policyConfig?: PolicyConfig;
}

export const ArchitecturePipeline: React.FC<ArchitecturePipelineProps> = ({
  onTransactionProcessed,
  policyConfig = DEFAULT_POLICY_CONFIG
}) => {
  // Input Form State matching the user prompt diagram defaults
  const [recipientVpa, setRecipientVpa] = useState('abc@upi');
  const [amount, setAmount] = useState<number>(50000);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [useProxyVpn, setUseProxyVpn] = useState(true);
  const [isEmulator, setIsEmulator] = useState(true);

  // Simulation Animation Steps
  // Steps: 0 = Idle/Input, 1 = PAYMENT_APP, 2 = BACKEND_API, 3 = FRAUD_AI, 4 = RISK_SCORE_XAI, 5 = TRANSACTION_ENGINE, 6 = DECISION (PROCEED or HOLD), 7 = VERIFICATION (if HOLD)
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);

  // Manual verification decision state (ALLOW vs REJECT)
  const [verificationOutcome, setVerificationOutcome] = useState<'ALLOW' | 'REJECT' | null>(null);

  const currentUser = INITIAL_USER_ACCOUNTS[selectedUserIndex];

  // Function to build and process transaction payload
  const runPipelineSimulation = () => {
    setIsAnimating(true);
    setActiveStep(1);
    setVerificationOutcome(null);

    // Prepare raw transaction input
    const partialTx: Partial<Transaction> = {
      id: `TX_PIPE_${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderVpa: currentUser.vpa,
      senderAvgTxAmount: currentUser.avgAmount,
      amount: Number(amount),
      currency: 'INR',
      recipient: {
        vpa: recipientVpa,
        name: recipientVpa === 'abc@upi' ? 'Unverified Account (abc@upi)' : `Recipient (${recipientVpa})`,
        accountAgeDays: recipientVpa === 'abc@upi' ? 3 : 180,
        fraudReportCount: recipientVpa === 'abc@upi' ? 7 : 0,
        isKnownMule: recipientVpa === 'abc@upi',
        riskRating: recipientVpa === 'abc@upi' ? 93 : 15
      },
      location: {
        city: currentUser.city,
        country: 'India',
        lat: currentUser.lat,
        lng: currentUser.lng,
        ip: useProxyVpn ? '185.220.101.99' : currentUser.ip
      },
      device: {
        deviceId: `dev_${currentUser.id}_pipe`,
        deviceName: isEmulator ? 'Android Studio Emulator (x86_64)' : `${currentUser.name}'s Device`,
        os: 'Android 14',
        isEmulator: isEmulator,
        isVpn: useProxyVpn,
        isKnownDevice: !isEmulator
      }
    };

    const risk = evaluateTransaction(partialTx, [], policyConfig);

    let status: Transaction['status'] = 'ALLOWED';
    if (risk.overallScore >= policyConfig.flagReviewThreshold || risk.overallScore >= policyConfig.blockThreshold) {
      status = 'HOLD';
    } else {
      status = 'ALLOWED';
    }

    const tx: Transaction = {
      ...partialTx as Transaction,
      status,
      riskAssessment: risk
    };

    setCurrentTx(tx);

    // Step animation timer sequence
    setTimeout(() => setActiveStep(2), 600); // BACKEND API
    setTimeout(() => setActiveStep(3), 1300); // FRAUD DETECTION AI ENGINE
    setTimeout(() => setActiveStep(4), 2100); // RISK SCORE & EXPLANATION
    setTimeout(() => setActiveStep(5), 2900); // TRANSACTION ENGINE
    setTimeout(() => {
      setActiveStep(6); // DECISION (PROCEED / HOLD)
      setIsAnimating(false);
      onTransactionProcessed(tx);
    }, 3600);
  };

  const handleVerifyAction = (outcome: 'ALLOW' | 'REJECT') => {
    if (!currentTx) return;
    setVerificationOutcome(outcome);
    const updatedStatus: Transaction['status'] = outcome === 'ALLOW' ? 'ALLOWED' : 'REJECTED';
    const updatedTx: Transaction = {
      ...currentTx,
      status: updatedStatus
    };
    setCurrentTx(updatedTx);
    onTransactionProcessed(updatedTx);
  };

  const resetPipeline = () => {
    setActiveStep(0);
    setCurrentTx(null);
    setVerificationOutcome(null);
    setIsAnimating(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Prompt Diagram Reference */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  Interactive Payment Architecture Pipeline
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase">
                  Live Flow Visualizer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Simulate end-to-end payment processing: from user payment input to API ingestion, AI Fraud Risk Scoring (XAI explanation), Transaction Engine evaluation, and Step-up Verification holding.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setRecipientVpa('abc@upi');
                setAmount(50000);
                setUseProxyVpn(true);
                setIsEmulator(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 hover:bg-slate-700 hover:text-white transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Prompt Diagram (₹50k to abc@upi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Visual Flowchart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Payment Form (YOUR PAYMENT APP Input) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#0D121F] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative">
            <div className="flex items-center space-x-2 text-slate-200 border-b border-slate-800/80 pb-3 mb-4">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-400">
                1. YOUR PAYMENT APP (Client)
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* User Selection */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sender Account</label>
                <select
                  value={selectedUserIndex}
                  onChange={(e) => setSelectedUserIndex(Number(e.target.value))}
                  disabled={isAnimating}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {INITIAL_USER_ACCOUNTS.map((usr, idx) => (
                    <option key={usr.id} value={idx}>
                      {usr.name} ({usr.vpa}) - Avg: ₹{usr.avgAmount}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient VPA Input */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">To (Recipient UPI ID)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientVpa}
                    onChange={(e) => setRecipientVpa(e.target.value)}
                    disabled={isAnimating}
                    placeholder="e.g. abc@upi"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500 text-sm"
                  />
                  {recipientVpa === 'abc@upi' && (
                    <span className="absolute right-2 top-2 text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-semibold">
                      Prompt VPA
                    </span>
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    disabled={isAnimating}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white font-mono text-base font-extrabold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Threat Parameters */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Client Context Flags
                </span>
                
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Route via Anonymous VPN IP</span>
                  <input
                    type="checkbox"
                    checked={useProxyVpn}
                    onChange={(e) => setUseProxyVpn(e.target.checked)}
                    disabled={isAnimating}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Run on Hardware Emulator</span>
                  <input
                    type="checkbox"
                    checked={isEmulator}
                    onChange={(e) => setIsEmulator(e.target.checked)}
                    disabled={isAnimating}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  onClick={runPipelineSimulation}
                  disabled={isAnimating || amount <= 0 || !recipientVpa}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
                  <span>{isAnimating ? 'Processing Pipeline...' : 'Send Payment'}</span>
                </button>

                <button
                  onClick={resetPipeline}
                  disabled={isAnimating}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Reset Flow"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Quick Summary Card if transaction executed */}
          {currentTx && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-cyan-400 font-bold">{currentTx.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Final Risk Score:</span>
                <span className={`font-bold font-mono text-sm ${
                  currentTx.riskAssessment.overallScore >= 60 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {currentTx.riskAssessment.overallScore} / 100
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Engine Status:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  currentTx.status === 'HOLD' || currentTx.status === 'STEP_UP_REQUIRED'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : currentTx.status === 'BLOCKED' || currentTx.status === 'REJECTED'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {currentTx.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Architecture Flowchart matching user prompt */}
        <div className="lg:col-span-8 bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
              <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-200">
                Architectural Flow Visualizer (Node Trace)
              </h3>
            </div>

            {/* Active Step Indicator Pill */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">Step:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-bold">
                {activeStep === 0 && 'Ready'}
                {activeStep === 1 && '1. Payment App Payload'}
                {activeStep === 2 && '2. Backend API Ingestion'}
                {activeStep === 3 && '3. AI Engine Fraud Analysis'}
                {activeStep === 4 && '4. Risk Score & XAI Explanation'}
                {activeStep === 5 && '5. Transaction Engine Thresholds'}
                {activeStep >= 6 && '6. Decision & Verification'}
              </span>
            </div>
          </div>

          {/* Interactive Flow Tree Diagram */}
          <div className="space-y-6 relative">

            {/* NODE 1: YOUR PAYMENT APP */}
            <div className={`p-4 rounded-xl border transition-all duration-500 relative ${
              activeStep === 1 
                ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-[1.01]' 
                : activeStep > 1 
                ? 'bg-slate-900/80 border-slate-700' 
                : 'bg-slate-900/40 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-900/60 text-cyan-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                      NODE 1
                    </span>
                    <h4 className="text-sm font-bold text-white">YOUR PAYMENT APP</h4>
                  </div>
                </div>

                {/* Data preview badge */}
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-4">
                  <span className="text-slate-400">To: <strong className="text-cyan-300">{recipientVpa}</strong></span>
                  <span className="text-slate-400">Amount: <strong className="text-emerald-400">₹{Number(amount).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* DOWN ARROW 1 */}
            <div className="flex justify-center my-1">
              <div className={`transition-colors duration-300 flex flex-col items-center ${activeStep >= 2 ? 'text-cyan-400' : 'text-slate-700'}`}>
                <div className={`w-0.5 h-4 ${activeStep === 2 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* NODE 2: BACKEND API */}
            <div className={`p-4 rounded-xl border transition-all duration-500 ${
              activeStep === 2 
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.01]' 
                : activeStep > 2 
                ? 'bg-slate-900/80 border-slate-700' 
                : 'bg-slate-900/40 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-900/60 text-blue-300">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
                      NODE 2
                    </span>
                    <h4 className="text-sm font-bold text-white">BACKEND API</h4>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>POST /api/v1/payment/submit</span>
                  <span className="block text-[10px] text-emerald-400">Session Verified • IP: {useProxyVpn ? '185.220.101.99 (VPN)' : currentUser.ip}</span>
                </div>
              </div>
            </div>

            {/* DOWN ARROW 2 */}
            <div className="flex justify-center my-1">
              <div className={`transition-colors duration-300 flex flex-col items-center ${activeStep >= 3 ? 'text-blue-400' : 'text-slate-700'}`}>
                <div className={`w-0.5 h-4 ${activeStep === 3 ? 'bg-blue-400 animate-pulse' : 'bg-slate-700'}`} />
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* NODE 3: FRAUD DETECTION AI ENGINE */}
            <div className={`p-4 rounded-xl border transition-all duration-500 ${
              activeStep === 3 
                ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]' 
                : activeStep > 3 
                ? 'bg-slate-900/80 border-slate-700' 
                : 'bg-slate-900/40 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-900/60 text-indigo-300">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                      NODE 3
                    </span>
                    <h4 className="text-sm font-bold text-white">FRAUD DETECTION AI ENGINE</h4>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Feature Extraction & Inference</span>
                  <span className="block text-[10px] text-indigo-300">Model: LightGBM + Graph Neural Net</span>
                </div>
              </div>
            </div>

            {/* SPLIT BRANCHES FOR NODE 3 OUTPUT: RISK SCORE & EXPLANATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* BRANCH 3A: RISK SCORE */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep === 4 
                  ? 'bg-purple-950/50 border-purple-500 shadow-md shadow-purple-500/20' 
                  : activeStep > 4 
                  ? 'bg-slate-900/90 border-slate-700' 
                  : 'bg-slate-900/30 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                    OUTPUT 3A
                  </span>
                  <span className="text-xs font-bold text-slate-300">Risk Score</span>
                </div>

                {currentTx && activeStep >= 4 ? (
                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl font-extrabold font-mono ${
                      currentTx.riskAssessment.overallScore >= 60 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {currentTx.riskAssessment.overallScore}/100
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        currentTx.riskAssessment.riskLevel === 'CRITICAL' || currentTx.riskAssessment.riskLevel === 'HIGH'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {currentTx.riskAssessment.riskLevel} RISK
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono italic">Awaiting AI evaluation...</div>
                )}
              </div>

              {/* BRANCH 3B: EXPLANATION ("Why risky?") */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep === 4 
                  ? 'bg-purple-950/50 border-purple-500 shadow-md shadow-purple-500/20' 
                  : activeStep > 4 
                  ? 'bg-slate-900/90 border-slate-700' 
                  : 'bg-slate-900/30 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                    OUTPUT 3B
                  </span>
                  <span className="text-xs font-bold text-slate-300">Explanation (Why risky?)</span>
                </div>

                {currentTx && activeStep >= 4 ? (
                  <div className="space-y-1 text-[11px] text-slate-300 font-sans max-h-24 overflow-y-auto pr-1">
                    {currentTx.riskAssessment.xaiReasoning.map((reason, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5">
                        <span className="text-purple-400">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono italic">Generating XAI feature breakdown...</div>
                )}
              </div>

            </div>

            {/* DOWN ARROW 3 */}
            <div className="flex justify-center my-1">
              <div className={`transition-colors duration-300 flex flex-col items-center ${activeStep >= 5 ? 'text-purple-400' : 'text-slate-700'}`}>
                <div className={`w-0.5 h-4 ${activeStep === 5 ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'}`} />
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* NODE 4: TRANSACTION ENGINE */}
            <div className={`p-4 rounded-xl border transition-all duration-500 ${
              activeStep === 5 
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.01]' 
                : activeStep > 5 
                ? 'bg-slate-900/80 border-slate-700' 
                : 'bg-slate-900/40 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-900/60 text-amber-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                      NODE 4
                    </span>
                    <h4 className="text-sm font-bold text-white">TRANSACTION ENGINE</h4>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Policy Gate Evaluation</span>
                  <span className="block text-[10px] text-amber-300">Block Threshold: ≥{policyConfig.blockThreshold} | Flag Threshold: ≥{policyConfig.flagReviewThreshold}</span>
                </div>
              </div>
            </div>

            {/* DECISION SPLIT BRANCHES: LOW/MEDIUM (Proceed) vs HIGH (HOLD) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

              {/* BRANCH 4A: LOW / MEDIUM -> Proceed */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep >= 6 && currentTx && currentTx.riskAssessment.overallScore < policyConfig.flagReviewThreshold
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/30 border-slate-800 opacity-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    BRANCH: LOW / MEDIUM RISK
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-white mb-1">Proceed (Allowed)</div>
                <p className="text-xs text-slate-400">
                  Transaction clears risk baseline and executes immediately to destination bank network.
                </p>
              </div>

              {/* BRANCH 4B: HIGH -> HOLD */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep >= 6 && currentTx && currentTx.riskAssessment.overallScore >= policyConfig.flagReviewThreshold
                  ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-slate-900/30 border-slate-800 opacity-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
                    BRANCH: HIGH RISK
                  </span>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-sm font-bold text-white mb-1">HOLD (Placed under Review)</div>
                <p className="text-xs text-slate-400">
                  Transaction is intercepted and held pending step-up biometric/OTP verification or analyst review.
                </p>
              </div>

            </div>

            {/* NODE 5: VERIFICATION LAYER (Triggered when on HOLD) */}
            {activeStep >= 6 && currentTx && (currentTx.status === 'HOLD' || currentTx.status === 'STEP_UP_REQUIRED' || currentTx.status === 'ALLOWED' || currentTx.status === 'REJECTED') && (
              <div className="pt-4 border-t border-slate-800">
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-700/60 rounded-2xl p-5 shadow-xl space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-amber-400 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-extrabold text-white">VERIFICATION LAYER (Security Intercept)</h4>
                        <p className="text-xs text-amber-300">
                          {verificationOutcome === 'ALLOW' 
                            ? '✅ Verified & Allowed: Transaction approved.'
                            : verificationOutcome === 'REJECT'
                            ? '❌ Rejected & Blocked: Transaction declined.'
                            : 'Transaction is currently ON HOLD. Select action to resolve:'}
                        </p>
                      </div>
                    </div>

                    {/* Dual Action Buttons matching prompt: Allow / Reject */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerifyAction('ALLOW')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                          verificationOutcome === 'ALLOW' || currentTx.status === 'ALLOWED'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-emerald-950/80 border border-emerald-700 text-emerald-400 hover:bg-emerald-900'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Allow (Approve)</span>
                      </button>

                      <button
                        onClick={() => handleVerifyAction('REJECT')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                          verificationOutcome === 'REJECT' || currentTx.status === 'REJECTED'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                            : 'bg-red-950/80 border border-red-700 text-red-400 hover:bg-red-900'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject (Decline)</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Detail & Log */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Context</span>
                      <div className="text-slate-300">User: <span className="text-cyan-300">{currentTx.senderName}</span></div>
                      <div className="text-slate-300">Recipient: <span className="text-amber-300">{currentTx.recipient.vpa}</span></div>
                      <div className="text-slate-300">Amount: <span className="text-emerald-400">₹{currentTx.amount.toLocaleString()}</span></div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Audit Decision Status</span>
                      <div className="text-slate-300">Initial Engine Action: <span className="text-amber-400 font-bold">HOLD</span></div>
                      <div className="text-slate-300">Final Resolved Outcome: <span className={`font-bold ${
                        currentTx.status === 'ALLOWED' ? 'text-emerald-400' : currentTx.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'
                      }`}>{currentTx.status}</span></div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ArchitecturePipeline;
