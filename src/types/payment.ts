export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ActionRecommendation = 'BLOCK' | 'FLAG_REVIEW' | 'STEP_UP_AUTH' | 'ALLOW';

export type AttackVectorType = 
  | 'ACCOUNT_TAKEOVER'
  | 'RAPID_VELOCITY'
  | 'MONEY_MULE_RING'
  | 'IMPOSSIBLE_TRAVEL'
  | 'COMPROMISED_DEVICE'
  | 'SCAM_VPA_PHISHING'
  | 'BENIGN';

export interface LocationData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  ip: string;
}

export interface DeviceData {
  deviceId: string;
  deviceName: string;
  os: string;
  isEmulator: boolean;
  isVpn: boolean;
  isKnownDevice: boolean;
}

export interface RecipientProfile {
  vpa: string;
  name: string;
  accountAgeDays: number;
  fraudReportCount: number;
  isKnownMule: boolean;
  riskRating: number; // 0 - 100
}

export interface FeatureImpact {
  featureName: string;
  scoreContribution: number; // positive increases risk score
  category: 'DEVICE' | 'GEO' | 'VELOCITY' | 'AMOUNT' | 'GRAPH' | 'RECIPIENT';
  explanation: string;
}

export interface RiskAssessment {
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  actionRecommendation: ActionRecommendation;
  attackVector: AttackVectorType;
  featureImpacts: FeatureImpact[];
  xaiReasoning: string[];
  calculatedAt: string;
  processingTimeMs: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderVpa: string;
  senderAvgTxAmount: number;
  amount: number;
  currency: string;
  recipient: RecipientProfile;
  location: LocationData;
  previousLocation?: LocationData;
  previousTimestamp?: string;
  device: DeviceData;
  status: 'PENDING' | 'ALLOWED' | 'STEP_UP_REQUIRED' | 'REVIEW_FLAGGED' | 'BLOCKED' | 'HOLD' | 'REJECTED';
  riskAssessment: RiskAssessment;
}

export interface AccountNode {
  id: string; // VPA or Account ID
  label: string;
  type: 'USER' | 'MERCHANT' | 'SUSPECTED_MULE' | 'CONFIRMED_MULE';
  riskScore: number;
  inboundVolume: number;
  outboundVolume: number;
  inDegree: number;
  outDegree: number;
  fraudFlags: string[];
}

export interface GraphEdge {
  id: string;
  source: string; // sender VPA
  target: string; // recipient VPA
  amount: number;
  timestamp: string;
  isSuspicious: boolean;
}

export interface PolicyConfig {
  blockThreshold: number; // e.g. 80
  flagReviewThreshold: number; // e.g. 60
  stepUpAuthThreshold: number; // e.g. 35
  maxGeoSpeedKmh: number; // e.g. 800 km/h
  velocityWindowSeconds: number; // e.g. 120s
  maxVelocityCount: number; // e.g. 3
  enableMuleAutoBlock: boolean;
  enableDeviceFingerprinting: boolean;
  enableGeoVelocityCheck: boolean;
}

export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  vector: AttackVectorType;
  badgeColor: string;
  payloadGenerator: () => Partial<Transaction>;
}
