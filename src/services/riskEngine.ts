import type { 
  Transaction, 
  RiskAssessment, 
  FeatureImpact, 
  PolicyConfig, 
  RiskLevel, 
  ActionRecommendation, 
  AttackVectorType,
  LocationData 
} from '../types/payment';

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  blockThreshold: 80,
  flagReviewThreshold: 60,
  stepUpAuthThreshold: 35,
  maxGeoSpeedKmh: 800,
  velocityWindowSeconds: 120,
  maxVelocityCount: 3,
  enableMuleAutoBlock: true,
  enableDeviceFingerprinting: true,
  enableGeoVelocityCheck: true,
};

// Haversine distance formula in kilometers
function calculateHaversineDistance(loc1: LocationData, loc2: LocationData): number {
  const R = 6371; // Earth radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function evaluateTransaction(
  tx: Partial<Transaction>,
  recentUserTxs: Transaction[] = [],
  policy: PolicyConfig = DEFAULT_POLICY_CONFIG
): RiskAssessment {
  const startTime = performance.now();
  const featureImpacts: FeatureImpact[] = [];
  const xaiReasoning: string[] = [];

  let totalRiskScore = 0;
  let detectedVector: AttackVectorType = 'BENIGN';

  // 1. GEO-VELOCITY / IMPOSSIBLE TRAVEL CHECK
  if (policy.enableGeoVelocityCheck && tx.location && tx.previousLocation && tx.previousTimestamp && tx.timestamp) {
    const distKm = calculateHaversineDistance(tx.previousLocation, tx.location);
    const timeDiffHours = Math.max(
      (new Date(tx.timestamp).getTime() - new Date(tx.previousTimestamp).getTime()) / (1000 * 3600),
      0.001
    );
    const calculatedSpeedKmh = Math.round(distKm / timeDiffHours);

    if (distKm > 50 && calculatedSpeedKmh > policy.maxGeoSpeedKmh) {
      const geoScore = Math.min(Math.round((calculatedSpeedKmh / policy.maxGeoSpeedKmh) * 35), 50);
      totalRiskScore += geoScore;
      detectedVector = 'IMPOSSIBLE_TRAVEL';

      featureImpacts.push({
        featureName: 'Impossible Geo-Travel Velocity',
        scoreContribution: geoScore,
        category: 'GEO',
        explanation: `Detected physical speed of ${calculatedSpeedKmh.toLocaleString()} km/h between ${tx.previousLocation.city} and ${tx.location.city} within ${(timeDiffHours * 60).toFixed(1)} mins.`
      });

      xaiReasoning.push(`🚩 Impossible travel anomaly: User moved ${Math.round(distKm)} km in ${(timeDiffHours * 60).toFixed(0)} minutes (${calculatedSpeedKmh.toLocaleString()} km/h).`);
    }
  }

  // 2. DEVICE & COMPROMISED FINGERPRINT CHECK
  if (policy.enableDeviceFingerprinting && tx.device) {
    let deviceRisk = 0;

    if (tx.device.isEmulator) {
      deviceRisk += 35;
      detectedVector = detectedVector === 'BENIGN' ? 'COMPROMISED_DEVICE' : detectedVector;
      xaiReasoning.push('📱 Hardware emulator environment detected (Common in automated script attacks).');
    }

    if (!tx.device.isKnownDevice) {
      deviceRisk += 25;
      detectedVector = detectedVector === 'BENIGN' ? 'ACCOUNT_TAKEOVER' : detectedVector;
      xaiReasoning.push(`🔒 Unrecognized new device (${tx.device.deviceName} / ${tx.device.os}).`);
    }

    if (tx.device.isVpn) {
      deviceRisk += 15;
      xaiReasoning.push('🌐 Transaction routed through anonymous VPN / Proxy IP address.');
    }

    if (deviceRisk > 0) {
      totalRiskScore += deviceRisk;
      featureImpacts.push({
        featureName: 'Device Fingerprint Anomaly',
        scoreContribution: deviceRisk,
        category: 'DEVICE',
        explanation: `Device trust score depleted. Hardware specs deviated from registered user profile baseline.`
      });
    }
  }

  // 3. TRANSACTION AMOUNT & BEHAVIORAL DEVIATION
  if (tx.amount && tx.senderAvgTxAmount) {
    const ratio = tx.amount / tx.senderAvgTxAmount;
    if (ratio > 10) {
      const amountScore = Math.min(Math.round(ratio * 3), 40);
      totalRiskScore += amountScore;
      if (detectedVector === 'BENIGN') detectedVector = 'ACCOUNT_TAKEOVER';

      featureImpacts.push({
        featureName: 'High Amount Anomaly Ratio',
        scoreContribution: amountScore,
        category: 'AMOUNT',
        explanation: `Transaction amount (₹${tx.amount.toLocaleString()}) is ${ratio.toFixed(1)}x higher than account baseline average (₹${tx.senderAvgTxAmount.toLocaleString()}).`
      });

      xaiReasoning.push(`⚠️ Extreme spending spike: Transfer is ${ratio.toFixed(1)}x larger than standard user baseline.`);
    } else if (ratio > 3) {
      const amountScore = 15;
      totalRiskScore += amountScore;
      featureImpacts.push({
        featureName: 'Moderate Amount Variance',
        scoreContribution: amountScore,
        category: 'AMOUNT',
        explanation: `Transaction amount exceeds typical range.`
      });
      xaiReasoning.push(`📊 Elevated transaction size compared to historical average.`);
    }
  }

  // 4. RECIPIENT & MULE NETWORK GRAPH EVALUATION
  if (tx.recipient) {
    let recipientRisk = 0;

    if (tx.recipient.isKnownMule) {
      recipientRisk += 45;
      detectedVector = 'MONEY_MULE_RING';
      xaiReasoning.push(`🕸️ Recipient account (${tx.recipient.vpa}) is flagged in Central Mule Network Graph.`);
    }

    if (tx.recipient.fraudReportCount > 0) {
      const reportRisk = Math.min(tx.recipient.fraudReportCount * 15, 30);
      recipientRisk += reportRisk;
      if (detectedVector === 'BENIGN') detectedVector = 'SCAM_VPA_PHISHING';
      xaiReasoning.push(`⚠️ Recipient VPA has ${tx.recipient.fraudReportCount} active user fraud reports filed against it.`);
    }

    if (tx.recipient.accountAgeDays < 7) {
      recipientRisk += 20;
      xaiReasoning.push(`🆕 Recipient account created recently (${tx.recipient.accountAgeDays} days ago).`);
    }

    if (recipientRisk > 0) {
      totalRiskScore += recipientRisk;
      featureImpacts.push({
        featureName: 'Recipient Graph & Mule Score',
        scoreContribution: recipientRisk,
        category: 'RECIPIENT',
        explanation: `Recipient VPA linked to high-risk cluster in graph analysis.`
      });
    }
  }

  // 5. VELOCITY & FREQUENCY CHECK
  if (tx.senderVpa && tx.timestamp) {
    const txTime = new Date(tx.timestamp).getTime();
    const windowMs = policy.velocityWindowSeconds * 1000;
    
    const recentCount = recentUserTxs.filter(t => {
      if (t.senderVpa !== tx.senderVpa) return false;
      const tTime = new Date(t.timestamp).getTime();
      return Math.abs(txTime - tTime) <= windowMs;
    }).length;

    if (recentCount >= policy.maxVelocityCount) {
      const velocityScore = Math.min(25 + (recentCount - policy.maxVelocityCount) * 10, 45);
      totalRiskScore += velocityScore;
      detectedVector = 'RAPID_VELOCITY';

      featureImpacts.push({
        featureName: 'High Transaction Velocity',
        scoreContribution: velocityScore,
        category: 'VELOCITY',
        explanation: `Detected ${recentCount + 1} transactions within ${policy.velocityWindowSeconds}s window (Policy Limit: ${policy.maxVelocityCount}).`
      });

      xaiReasoning.push(`⚡ High-frequency transaction burst: ${recentCount + 1} transfers attempted within ${policy.velocityWindowSeconds} seconds.`);
    }
  }

  // Clamp total risk score between 0 and 100
  const finalScore = Math.min(Math.max(totalRiskScore, 0), 100);

  // Assign Risk Level
  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 80) riskLevel = 'CRITICAL';
  else if (finalScore >= 60) riskLevel = 'HIGH';
  else if (finalScore >= 35) riskLevel = 'MEDIUM';

  // Determine Action Recommendation based on policy thresholds
  let actionRecommendation: ActionRecommendation = 'ALLOW';
  if (finalScore >= policy.blockThreshold) {
    actionRecommendation = 'BLOCK';
  } else if (finalScore >= policy.flagReviewThreshold) {
    actionRecommendation = 'FLAG_REVIEW';
  } else if (finalScore >= policy.stepUpAuthThreshold) {
    actionRecommendation = 'STEP_UP_AUTH';
  }

  if (xaiReasoning.length === 0) {
    xaiReasoning.push('✅ Transaction aligns with normal user behavioral profile, verified device, and low-risk recipient.');
  }

  const processingTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    overallScore: finalScore,
    riskLevel,
    actionRecommendation,
    attackVector: detectedVector,
    featureImpacts,
    xaiReasoning,
    calculatedAt: new Date().toISOString(),
    processingTimeMs
  };
}
