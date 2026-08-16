import React from 'react';
import { ShieldCheck, Activity, Sliders, Network, BarChart3, Radio, RefreshCw, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'MONITOR' | 'GRAPH' | 'ANALYTICS' | 'POLICY';
  setActiveTab: (tab: 'MONITOR' | 'GRAPH' | 'ANALYTICS' | 'POLICY') => void;
  isAutoSimulating: boolean;
  setIsAutoSimulating: (sim: boolean) => void;
  onResetData: () => void;
  blockedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAutoSimulating,
  setIsAutoSimulating,
  onResetData,
  blockedCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Identity */}
          <div className="flex items-center space-x-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F19]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-outfit text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SentinelPay <span className="text-cyan-400 font-bold">AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold tracking-wide uppercase">
                  v2.4 Autonomous Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Digital Payment Attack Detection & Prevention System
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('MONITOR')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'MONITOR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Monitor</span>
            </button>

            <button
              onClick={() => setActiveTab('GRAPH')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'GRAPH'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Mule Graph Network</span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Threat Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('POLICY')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'POLICY'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Policy Configurator</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Auto Stream Simulation Toggle */}
            <button
              onClick={() => setIsAutoSimulating(!isAutoSimulating)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isAutoSimulating
                  ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400 shadow-sm shadow-emerald-900/40 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
              title="Toggle continuous live background stream of benign & randomized test payments"
            >
              <Radio className={`w-3.5 h-3.5 ${isAutoSimulating ? 'text-emerald-400 animate-spin' : ''}`} />
              <span>{isAutoSimulating ? 'Live Traffic: ON' : 'Live Traffic: PAUSED'}</span>
            </button>

            {/* Block Counter Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-mono font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{blockedCount} BLOCKED</span>
            </div>

            {/* Reset Stream Data */}
            <button
              onClick={onResetData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Reset stream to initial baseline data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
