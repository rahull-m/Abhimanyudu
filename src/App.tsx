import React, { useState, useEffect } from 'react';
import type { Transaction, PolicyConfig, AccountNode, GraphEdge } from './types/payment';
import { 
  DEFAULT_POLICY_CONFIG, 
  evaluateTransaction 
} from './services/riskEngine';
import { 
  generateInitialTransactions, 
  ATTACK_SCENARIOS, 
  INITIAL_GRAPH_NODES, 
  INITIAL_GRAPH_EDGES,
  INITIAL_USER_ACCOUNTS,
  RECIPIENT_CATALOG
} from './services/mockData';

import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { LiveMonitor } from './components/LiveMonitor';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { GraphVisualizer } from './components/GraphVisualizer';
import { ThreatAnalytics } from './components/ThreatAnalytics';
import { PolicyConfigurator } from './components/PolicyConfigurator';
import { CustomTxModal } from './components/CustomTxModal';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'MONITOR' | 'GRAPH' | 'ANALYTICS' | 'POLICY'>('PIPELINE');
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateInitialTransactions());
  const [policy, setPolicy] = useState<PolicyConfig>(DEFAULT_POLICY_CONFIG);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);

  const [nodes] = useState<AccountNode[]>(INITIAL_GRAPH_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_GRAPH_EDGES);

  // Background Auto Traffic Generator
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      // 85% safe traffic, 15% random attack
      const isAttack = Math.random() < 0.15;
      
      let rawTx: Partial<Transaction>;
      if (isAttack) {
        const scenario = ATTACK_SCENARIOS[Math.floor(Math.random() * ATTACK_SCENARIOS.length)];
        rawTx = scenario.payloadGenerator();
      } else {
        const user = INITIAL_USER_ACCOUNTS[Math.floor(Math.random() * INITIAL_USER_ACCOUNTS.length)];
        const rec = RECIPIENT_CATALOG[Math.floor(Math.random() * 4)]; // safe catalog
        rawTx = {
          senderId: user.id,
          senderName: user.name,
          senderVpa: user.vpa,
          senderAvgTxAmount: user.avgAmount,
          amount: Math.round(user.avgAmount * (0.5 + Math.random() * 0.9)),
          currency: 'INR',
          recipient: rec,
          location: { city: user.city, country: 'India', lat: user.lat, lng: user.lng, ip: user.ip },
          device: { deviceId: `dev_${user.id}`, deviceName: `${user.name}'s Phone`, os: 'Android 14', isEmulator: false, isVpn: false, isKnownDevice: true }
        };
      }

      const txId = `TX_${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = new Date().toISOString();

      const partialTx: Partial<Transaction> = {
        id: txId,
        timestamp,
        ...rawTx
      };

      const risk = evaluateTransaction(partialTx, transactions, policy);
      
      let status: Transaction['status'] = 'ALLOWED';
      if (risk.actionRecommendation === 'BLOCK') status = 'BLOCKED';
      else if (risk.actionRecommendation === 'FLAG_REVIEW') status = 'REVIEW_FLAGGED';
      else if (risk.actionRecommendation === 'STEP_UP_AUTH') status = 'STEP_UP_REQUIRED';

      const completeTx: Transaction = {
        ...partialTx as Transaction,
        status,
        riskAssessment: risk
      };

      setTransactions(prev => [completeTx, ...prev.slice(0, 49)]); // keep last 50

      // Add edge to graph if recipient exists
      if (completeTx.recipient?.vpa && completeTx.senderVpa) {
        const newEdge: GraphEdge = {
          id: `e_${Date.now()}`,
          source: completeTx.senderVpa,
          target: completeTx.recipient.vpa,
          amount: completeTx.amount,
          timestamp: completeTx.timestamp,
          isSuspicious: risk.overallScore >= 60
        };
        setEdges(prev => [newEdge, ...prev.slice(0, 15)]);
      }

    }, 3800); // generate every 3.8s

    return () => clearInterval(interval);
  }, [isAutoSimulating, transactions, policy]);

  // Inject Attack Scenario
  const handleInjectAttack = (scenarioId: string) => {
    const scen = ATTACK_SCENARIOS.find(s => s.id === scenarioId);
    if (!scen) return;

    const payload = scen.payloadGenerator();
    const txId = `TX_${scen.vector}_${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const partialTx: Partial<Transaction> = {
      id: txId,
      timestamp,
      ...payload
    };

    const risk = evaluateTransaction(partialTx, transactions, policy);
    
    let status: Transaction['status'] = 'ALLOWED';
    if (risk.actionRecommendation === 'BLOCK') status = 'BLOCKED';
    else if (risk.actionRecommendation === 'FLAG_REVIEW') status = 'REVIEW_FLAGGED';
    else if (risk.actionRecommendation === 'STEP_UP_AUTH') status = 'STEP_UP_REQUIRED';

    const newTx: Transaction = {
      ...partialTx as Transaction,
      status,
      riskAssessment: risk
    };

    setTransactions(prev => [newTx, ...prev]);

    // Also update graph
    if (newTx.recipient?.vpa && newTx.senderVpa) {
      const newEdge: GraphEdge = {
        id: `e_inj_${Date.now()}`,
        source: newTx.senderVpa,
        target: newTx.recipient.vpa,
        amount: newTx.amount,
        timestamp: newTx.timestamp,
        isSuspicious: true
      };
      setEdges(prev => [newEdge, ...prev]);
    }
  };

  // Submit Custom Transaction
  const handleCustomTxSubmit = (partialTx: Partial<Transaction>) => {
    const risk = evaluateTransaction(partialTx, transactions, policy);
    let status: Transaction['status'] = 'ALLOWED';
    if (risk.actionRecommendation === 'BLOCK') status = 'BLOCKED';
    else if (risk.actionRecommendation === 'FLAG_REVIEW') status = 'REVIEW_FLAGGED';
    else if (risk.actionRecommendation === 'STEP_UP_AUTH') status = 'STEP_UP_REQUIRED';

    const newTx: Transaction = {
      ...partialTx as Transaction,
      status,
      riskAssessment: risk
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Analyst Action Override
  const handleOverrideAction = (txId: string, newStatus: Transaction['status']) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // Policy Config Update
  const handleUpdatePolicy = (newPolicy: PolicyConfig) => {
    setPolicy(newPolicy);
    // Recalculate risk for all existing transactions with new policy
    setTransactions(prev => prev.map(t => {
      const newRisk = evaluateTransaction(t, prev, newPolicy);
      let newStatus: Transaction['status'] = 'ALLOWED';
      if (newRisk.actionRecommendation === 'BLOCK') newStatus = 'BLOCKED';
      else if (newRisk.actionRecommendation === 'FLAG_REVIEW') newStatus = 'REVIEW_FLAGGED';
      else if (newRisk.actionRecommendation === 'STEP_UP_AUTH') newStatus = 'STEP_UP_REQUIRED';

      return {
        ...t,
        status: newStatus,
        riskAssessment: newRisk
      };
    }));
  };

  // Reset Data
  const handleResetData = () => {
    setTransactions(generateInitialTransactions());
    setEdges(INITIAL_GRAPH_EDGES);
  };

  const blockedCount = transactions.filter(t => t.status === 'BLOCKED').length;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAutoSimulating={isAutoSimulating}
        setIsAutoSimulating={setIsAutoSimulating}
        onResetData={handleResetData}
        blockedCount={blockedCount}
      />

      {/* Main Command Center Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Stats Overview */}
        <StatsOverview transactions={transactions} />

        {/* Tab 0: Interactive Architecture Pipeline (Matching Prompt Flowchart) */}
        {activeTab === 'PIPELINE' && (
          <ArchitecturePipeline
            policyConfig={policy}
            onTransactionProcessed={(newTx) => {
              setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
            }}
          />
        )}

        {/* Tab 1: Real-Time Live Monitor */}
        {activeTab === 'MONITOR' && (
          <LiveMonitor
            transactions={transactions}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            onInjectAttack={handleInjectAttack}
            onOpenCustomTxModal={() => setIsCustomModalOpen(true)}
          />
        )}

        {/* Tab 2: Financial Graph & Mule Ring Analyzer */}
        {activeTab === 'GRAPH' && (
          <GraphVisualizer nodes={nodes} edges={edges} />
        )}

        {/* Tab 3: Threat Intelligence Analytics */}
        {activeTab === 'ANALYTICS' && (
          <ThreatAnalytics transactions={transactions} />
        )}

        {/* Tab 4: Policy Configurator */}
        {activeTab === 'POLICY' && (
          <PolicyConfigurator policy={policy} onUpdatePolicy={handleUpdatePolicy} />
        )}

      </main>

      {/* Explainable AI (XAI) Transaction Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onOverrideAction={handleOverrideAction}
      />

      {/* Custom Transaction Payload Modal */}
      <CustomTxModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomTxSubmit}
      />

    </div>
  );
};

export default App;
