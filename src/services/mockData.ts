import type { Transaction, AccountNode, GraphEdge, AttackScenario } from '../types/payment';
import { evaluateTransaction, DEFAULT_POLICY_CONFIG } from './riskEngine';

// Initial legitimate accounts baseline
export const INITIAL_USER_ACCOUNTS = [
  { id: 'usr_rahul', name: 'Rahul Sharma', vpa: 'rahul.sharma@okicici', avgAmount: 1850, city: 'Mumbai', lat: 19.0760, lng: 72.8777, ip: '103.44.12.98' },
  { id: 'usr_ananya', name: 'Ananya Verma', vpa: 'ananya.v@upi', avgAmount: 2400, city: 'Bengaluru', lat: 12.9716, lng: 77.5946, ip: '49.207.198.41' },
  { id: 'usr_vikram', name: 'Vikram Mehta', vpa: 'vikram.mehta@axisbank', avgAmount: 4200, city: 'Delhi', lat: 28.7041, lng: 77.1025, ip: '115.242.78.10' },
  { id: 'usr_priya', name: 'Priya Nair', vpa: 'priyanair@paytm', avgAmount: 950, city: 'Kochi', lat: 9.9312, lng: 76.2673, ip: '117.200.45.89' },
  { id: 'usr_amit', name: 'Amit Patel', vpa: 'amit.patel@ybl', avgAmount: 3100, city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, ip: '103.21.124.12' },
];

export const RECIPIENT_CATALOG = [
  { vpa: 'swiggy@icici', name: 'Swiggy Food Delivery', accountAgeDays: 1450, fraudReportCount: 0, isKnownMule: false, riskRating: 5 },
  { vpa: 'amazon.pay@apl', name: 'Amazon Online Services', accountAgeDays: 2100, fraudReportCount: 0, isKnownMule: false, riskRating: 2 },
  { vpa: 'supermarket@hdfc', name: 'Metro Supermarket', accountAgeDays: 890, fraudReportCount: 0, isKnownMule: false, riskRating: 4 },
  { vpa: 'fasttrack.cabs@upi', name: 'City Cab Services', accountAgeDays: 420, fraudReportCount: 0, isKnownMule: false, riskRating: 8 },
  { vpa: 'crypto.exchange.mule@ybl', name: 'Crypto Gateway Account #99', accountAgeDays: 3, fraudReportCount: 8, isKnownMule: true, riskRating: 98 },
  { vpa: 'lottery.claim.scam@okaxis', name: 'Quick Cash Prize Winner', accountAgeDays: 2, fraudReportCount: 12, isKnownMule: true, riskRating: 95 },
  { vpa: 'unknown.mule.ring42@pnb', name: 'Global Wire Aggregator X', accountAgeDays: 5, fraudReportCount: 15, isKnownMule: true, riskRating: 99 },
];

// Pre-built Attack Scenarios for the Interactive Simulator
export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'scen_prompt_diagram',
    name: 'Prompt High-Risk Flow (abc@upi - ₹50,000)',
    description: 'Transaction of ₹50,000 sent to unverified VPA abc@upi triggering High Risk (Score 93/100) -> HOLD status.',
    vector: 'SCAM_VPA_PHISHING',
    badgeColor: 'border-red-500 bg-red-500/10 text-red-400',
    payloadGenerator: () => ({
      senderId: 'usr_rahul',
      senderName: 'Rahul Sharma',
      senderVpa: 'rahul.sharma@okicici',
      senderAvgTxAmount: 1850,
      amount: 50000,
      currency: 'INR',
      recipient: {
        vpa: 'abc@upi',
        name: 'Unverified Merchant (abc@upi)',
        accountAgeDays: 4,
        fraudReportCount: 7,
        isKnownMule: true,
        riskRating: 93
      },
      location: { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, ip: '185.220.101.99' },
      device: { deviceId: 'dev_unknown_abc', deviceName: 'Emulated Android Device', os: 'Android 13', isEmulator: true, isVpn: true, isKnownDevice: false }
    })
  },
  {
    id: 'scen_ato',
    name: 'Account Takeover (ATO)',
    description: 'Stolen credentials used to transfer ₹1,45,000 from an unrecognized device in a foreign IP block.',
    vector: 'ACCOUNT_TAKEOVER',
    badgeColor: 'border-red-500 bg-red-500/10 text-red-400',
    payloadGenerator: () => ({
      senderId: 'usr_rahul',
      senderName: 'Rahul Sharma',
      senderVpa: 'rahul.sharma@okicici',
      senderAvgTxAmount: 1850,
      amount: 145000,
      currency: 'INR',
      recipient: RECIPIENT_CATALOG[4], // Crypto mule
      location: { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, ip: '185.220.101.4' },
      previousLocation: { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, ip: '103.44.12.98' },
      previousTimestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
      device: { deviceId: 'dev_unk_998', deviceName: 'Linux / Unknown Browser', os: 'Linux x86_64', isEmulator: true, isVpn: true, isKnownDevice: false }
    })
  },
  {
    id: 'scen_geo',
    name: 'Impossible Geo-Travel',
    description: 'Transaction initiated from London 4 minutes after a cash transfer in Mumbai (8,200+ km/h velocity).',
    vector: 'IMPOSSIBLE_TRAVEL',
    badgeColor: 'border-purple-500 bg-purple-500/10 text-purple-400',
    payloadGenerator: () => ({
      senderId: 'usr_ananya',
      senderName: 'Ananya Verma',
      senderVpa: 'ananya.v@upi',
      senderAvgTxAmount: 2400,
      amount: 48000,
      currency: 'INR',
      recipient: RECIPIENT_CATALOG[5],
      location: { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, ip: '81.2.69.142' },
      previousLocation: { city: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, ip: '49.207.198.41' },
      previousTimestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      device: { deviceId: 'dev_uk_77', deviceName: 'iPhone 15 Pro', os: 'iOS 17.4', isEmulator: false, isVpn: true, isKnownDevice: false }
    })
  },
  {
    id: 'scen_mule',
    name: 'Money Mule Ring Transfer',
    description: 'Compromised funds routed directly into a known mule aggregator node with 15 active fraud reports.',
    vector: 'MONEY_MULE_RING',
    badgeColor: 'border-orange-500 bg-orange-500/10 text-orange-400',
    payloadGenerator: () => ({
      senderId: 'usr_vikram',
      senderName: 'Vikram Mehta',
      senderVpa: 'vikram.mehta@axisbank',
      senderAvgTxAmount: 4200,
      amount: 89000,
      currency: 'INR',
      recipient: RECIPIENT_CATALOG[6], // Mule aggregator
      location: { city: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, ip: '115.242.78.10' },
      device: { deviceId: 'dev_vikram_phone', deviceName: 'Samsung Galaxy S24', os: 'Android 14', isEmulator: false, isVpn: false, isKnownDevice: true }
    })
  },
  {
    id: 'scen_velocity',
    name: 'Rapid Velocity Drain Burst',
    description: 'High-frequency automated bot script triggering multiple sequential high-value transfers in under 15 seconds.',
    vector: 'RAPID_VELOCITY',
    badgeColor: 'border-amber-500 bg-amber-500/10 text-amber-400',
    payloadGenerator: () => ({
      senderId: 'usr_priya',
      senderName: 'Priya Nair',
      senderVpa: 'priyanair@paytm',
      senderAvgTxAmount: 950,
      amount: 35000,
      currency: 'INR',
      recipient: RECIPIENT_CATALOG[4],
      location: { city: 'Kochi', country: 'India', lat: 9.9312, lng: 76.2673, ip: '117.200.45.89' },
      device: { deviceId: 'dev_bot_net_01', deviceName: 'Automated Botnet Shell', os: 'Custom Linux', isEmulator: true, isVpn: true, isKnownDevice: false }
    })
  }
];

// Helper to generate a realistic initial set of 12 historical transactions
export function generateInitialTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const now = Date.now();

  // Create 8 safe transactions
  for (let i = 0; i < 8; i++) {
    const user = INITIAL_USER_ACCOUNTS[i % INITIAL_USER_ACCOUNTS.length];
    const rec = RECIPIENT_CATALOG[i % 4];
    const timeMs = now - (i * 12 * 60 * 1000); // spaced 12 mins apart

    const rawTx: Partial<Transaction> = {
      id: `TX_${1000 + i}`,
      timestamp: new Date(timeMs).toISOString(),
      senderId: user.id,
      senderName: user.name,
      senderVpa: user.vpa,
      senderAvgTxAmount: user.avgAmount,
      amount: Math.round(user.avgAmount * (0.6 + Math.random() * 0.8)),
      currency: 'INR',
      recipient: rec,
      location: { city: user.city, country: 'India', lat: user.lat, lng: user.lng, ip: user.ip },
      device: { deviceId: `dev_${user.id}`, deviceName: `${user.name}'s Primary Phone`, os: 'Android 14', isEmulator: false, isVpn: false, isKnownDevice: true },
      status: 'ALLOWED'
    };

    const risk = evaluateTransaction(rawTx, [], DEFAULT_POLICY_CONFIG);
    txs.push({
      ...rawTx as Transaction,
      riskAssessment: risk
    });
  }

  // Create 4 initial attack/suspicious transactions to pre-populate dashboard
  const attack1Payload = ATTACK_SCENARIOS[0].payloadGenerator();
  const rawTx1: Partial<Transaction> = {
    id: 'TX_ATO_9901',
    timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
    ...attack1Payload,
    status: 'BLOCKED'
  };
  rawTx1.riskAssessment = evaluateTransaction(rawTx1, txs, DEFAULT_POLICY_CONFIG);
  txs.unshift(rawTx1 as Transaction);

  const attack2Payload = ATTACK_SCENARIOS[1].payloadGenerator();
  const rawTx2: Partial<Transaction> = {
    id: 'TX_GEO_9902',
    timestamp: new Date(now - 10 * 60 * 1000).toISOString(),
    ...attack2Payload,
    status: 'REVIEW_FLAGGED'
  };
  rawTx2.riskAssessment = evaluateTransaction(rawTx2, txs, DEFAULT_POLICY_CONFIG);
  txs.unshift(rawTx2 as Transaction);

  return txs;
}

// Initial Graph Network Nodes (Accounts & Mule Rings)
export const INITIAL_GRAPH_NODES: AccountNode[] = [
  { id: 'rahul.sharma@okicici', label: 'Rahul Sharma', type: 'USER', riskScore: 12, inboundVolume: 45000, outboundVolume: 147500, inDegree: 2, outDegree: 4, fraudFlags: [] },
  { id: 'ananya.v@upi', label: 'Ananya Verma', type: 'USER', riskScore: 8, inboundVolume: 82000, outboundVolume: 50400, inDegree: 3, outDegree: 3, fraudFlags: [] },
  { id: 'vikram.mehta@axisbank', label: 'Vikram Mehta', type: 'USER', riskScore: 15, inboundVolume: 120000, outboundVolume: 89000, inDegree: 4, outDegree: 2, fraudFlags: [] },
  { id: 'priyanair@paytm', label: 'Priya Nair', type: 'USER', riskScore: 18, inboundVolume: 35000, outboundVolume: 35000, inDegree: 1, outDegree: 3, fraudFlags: [] },
  
  // Safe Merchants
  { id: 'swiggy@icici', label: 'Swiggy Merchant', type: 'MERCHANT', riskScore: 4, inboundVolume: 450000, outboundVolume: 12000, inDegree: 85, outDegree: 1, fraudFlags: [] },
  { id: 'amazon.pay@apl', label: 'Amazon Services', type: 'MERCHANT', riskScore: 2, inboundVolume: 890000, outboundVolume: 0, inDegree: 142, outDegree: 0, fraudFlags: [] },

  // Mule Network Cluster
  { id: 'crypto.exchange.mule@ybl', label: 'Mule Aggregator A1', type: 'CONFIRMED_MULE', riskScore: 98, inboundVolume: 1450000, outboundVolume: 1400000, inDegree: 18, outDegree: 2, fraudFlags: ['FRAUD_REPORTED_18X', 'MULE_RING_LEADER', 'FAST_DRAIN'] },
  { id: 'lottery.claim.scam@okaxis', label: 'Scam QR Receiver B2', type: 'SUSPECTED_MULE', riskScore: 92, inboundVolume: 640000, outboundVolume: 620000, inDegree: 12, outDegree: 1, fraudFlags: ['NEW_ACCOUNT_SPURT', 'PHISHING_VPA'] },
  { id: 'unknown.mule.ring42@pnb', label: 'Offshore Drain Node C3', type: 'CONFIRMED_MULE', riskScore: 99, inboundVolume: 2800000, outboundVolume: 2800000, inDegree: 24, outDegree: 1, fraudFlags: ['CROSS_BORDER_DRAIN', 'BLACK_HAWK_TAGGED'] }
];

export const INITIAL_GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'rahul.sharma@okicici', target: 'swiggy@icici', amount: 850, timestamp: '2026-08-16T14:30:00Z', isSuspicious: false },
  { id: 'e2', source: 'ananya.v@upi', target: 'amazon.pay@apl', amount: 2400, timestamp: '2026-08-16T15:10:00Z', isSuspicious: false },
  { id: 'e3', source: 'rahul.sharma@okicici', target: 'crypto.exchange.mule@ybl', amount: 145000, timestamp: '2026-08-16T16:00:00Z', isSuspicious: true },
  { id: 'e4', source: 'ananya.v@upi', target: 'lottery.claim.scam@okaxis', amount: 48000, timestamp: '2026-08-16T16:05:00Z', isSuspicious: true },
  { id: 'e5', source: 'vikram.mehta@axisbank', target: 'unknown.mule.ring42@pnb', amount: 89000, timestamp: '2026-08-16T16:12:00Z', isSuspicious: true },
  { id: 'e6', source: 'priyanair@paytm', target: 'crypto.exchange.mule@ybl', amount: 35000, timestamp: '2026-08-16T16:15:00Z', isSuspicious: true },
  { id: 'e7', source: 'crypto.exchange.mule@ybl', target: 'unknown.mule.ring42@pnb', amount: 400000, timestamp: '2026-08-16T16:16:00Z', isSuspicious: true },
  { id: 'e8', source: 'lottery.claim.scam@okaxis', target: 'unknown.mule.ring42@pnb', amount: 300000, timestamp: '2026-08-16T16:16:30Z', isSuspicious: true }
];

// Historical Threat Analytics Data for Charts
export const HOURLY_THREAT_DATA = [
  { hour: '00:00', safeCount: 420, attackCount: 8, totalVolume: 850000 },
  { hour: '04:00', safeCount: 180, attackCount: 14, totalVolume: 420000 },
  { hour: '08:00', safeCount: 890, attackCount: 12, totalVolume: 1950000 },
  { hour: '12:00', safeCount: 1450, attackCount: 32, totalVolume: 3400000 },
  { hour: '16:00', safeCount: 1680, attackCount: 48, totalVolume: 4100000 },
  { hour: '20:00', safeCount: 1120, attackCount: 22, totalVolume: 2800000 },
];

export const ATTACK_VECTOR_DISTRIBUTION = [
  { name: 'Account Takeover (ATO)', value: 38, color: '#EF4444' },
  { name: 'Money Mule Ring', value: 26, color: '#F97316' },
  { name: 'Impossible Geo-Travel', value: 18, color: '#A855F7' },
  { name: 'Rapid Velocity Burst', value: 12, color: '#F59E0B' },
  { name: 'Compromised Device', value: 6, color: '#06B6D4' },
];
