import React, { useState } from 'react';
import type { PolicyConfig } from '../types/payment';
import { Sliders, ShieldCheck, Zap, Save } from 'lucide-react';

interface PolicyConfiguratorProps {
  policy: PolicyConfig;
  onUpdatePolicy: (newPolicy: PolicyConfig) => void;
}

export const PolicyConfigurator: React.FC<PolicyConfiguratorProps> = ({ policy, onUpdatePolicy }) => {
  const [tempPolicy, setTempPolicy] = useState<PolicyConfig>({ ...policy });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdatePolicy(tempPolicy);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="font-outfit text-base font-bold text-white">
              Autonomous Risk Policy & Rule Engine Configurator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tune system prevention thresholds, velocity limits, and heuristic modules in real-time.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-900/30"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Policy Deployed!' : 'Save & Deploy Policy'}</span>
        </button>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Risk Thresholds */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-outfit text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Prevention Action Risk Score Thresholds</span>
            </h3>
            <p className="text-xs text-slate-400">Score cutoffs for automated intervention</p>
          </div>

          {/* Auto Block Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-red-400">Auto-BLOCK Threshold Score</span>
              <span className="font-mono font-bold text-white">{tempPolicy.blockThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={tempPolicy.blockThreshold}
              onChange={(e) => setTempPolicy({ ...tempPolicy, blockThreshold: Number(e.target.value) })}
              className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Transactions with score ≥ {tempPolicy.blockThreshold} are instantly blocked.</p>
          </div>

          {/* Flag for Manual Review Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-400">FLAG FOR REVIEW Threshold</span>
              <span className="font-mono font-bold text-white">{tempPolicy.flagReviewThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="40"
              max="80"
              value={tempPolicy.flagReviewThreshold}
              onChange={(e) => setTempPolicy({ ...tempPolicy, flagReviewThreshold: Number(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Sent to security analyst desk for manual verification.</p>
          </div>

          {/* Require Step-Up Auth (2FA) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-cyan-400">STEP-UP 2FA AUTH Threshold</span>
              <span className="font-mono font-bold text-white">{tempPolicy.stepUpAuthThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              value={tempPolicy.stepUpAuthThreshold}
              onChange={(e) => setTempPolicy({ ...tempPolicy, stepUpAuthThreshold: Number(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Triggers mandatory biometric or SMS OTP verification.</p>
          </div>

        </div>

        {/* 2. Velocity & Geo Limits */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-outfit text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Velocity & Physical Speed Parameters</span>
            </h3>
            <p className="text-xs text-slate-400">Heuristic limits for rapid transfer bots & geo movement</p>
          </div>

          {/* Max Geo Speed Limit */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-purple-400">Max Geo Velocity Limit (km/h)</span>
              <span className="font-mono font-bold text-white">{tempPolicy.maxGeoSpeedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="300"
              max="2000"
              step="50"
              value={tempPolicy.maxGeoSpeedKmh}
              onChange={(e) => setTempPolicy({ ...tempPolicy, maxGeoSpeedKmh: Number(e.target.value) })}
              className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Speed above {tempPolicy.maxGeoSpeedKmh} km/h triggers Impossible Travel alert.</p>
          </div>

          {/* Velocity Window */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-400">Velocity Monitoring Window</span>
              <span className="font-mono font-bold text-white">{tempPolicy.velocityWindowSeconds} seconds</span>
            </div>
            <input
              type="range"
              min="30"
              max="600"
              step="30"
              value={tempPolicy.velocityWindowSeconds}
              onChange={(e) => setTempPolicy({ ...tempPolicy, velocityWindowSeconds: Number(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Max Velocity Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-400">Max Transactions Allowed in Window</span>
              <span className="font-mono font-bold text-white">{tempPolicy.maxVelocityCount} transactions</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={tempPolicy.maxVelocityCount}
              onChange={(e) => setTempPolicy({ ...tempPolicy, maxVelocityCount: Number(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Heuristic Module Toggle Switches */}
      <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4">
        <h3 className="font-outfit text-sm font-bold text-white">Active Heuristic Detection Modules</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all">
            <div>
              <div className="font-semibold text-slate-200">Impossible Travel Check</div>
              <div className="text-[11px] text-slate-400">Geo velocity distance calculation</div>
            </div>
            <input
              type="checkbox"
              checked={tempPolicy.enableGeoVelocityCheck}
              onChange={(e) => setTempPolicy({ ...tempPolicy, enableGeoVelocityCheck: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all">
            <div>
              <div className="font-semibold text-slate-200">Mule Auto-Freeze</div>
              <div className="text-[11px] text-slate-400">Block known mule ring VPAs</div>
            </div>
            <input
              type="checkbox"
              checked={tempPolicy.enableMuleAutoBlock}
              onChange={(e) => setTempPolicy({ ...tempPolicy, enableMuleAutoBlock: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all">
            <div>
              <div className="font-semibold text-slate-200">Device Fingerprinting</div>
              <div className="text-[11px] text-slate-400">Detect emulators & new devices</div>
            </div>
            <input
              type="checkbox"
              checked={tempPolicy.enableDeviceFingerprinting}
              onChange={(e) => setTempPolicy({ ...tempPolicy, enableDeviceFingerprinting: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </label>

        </div>
      </div>

    </div>
  );
};
