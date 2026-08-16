import React from 'react';
import { HOURLY_THREAT_DATA, ATTACK_VECTOR_DISTRIBUTION } from '../services/mockData';
import type { Transaction } from '../types/payment';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPie, 
  Pie, 
  Cell 
} from 'recharts';

interface ThreatAnalyticsProps {
  transactions: Transaction[];
}

export const ThreatAnalytics: React.FC<ThreatAnalyticsProps> = ({ transactions }) => {
  // Aggregate real-time vector breakdown from stream
  const vectorCounts: Record<string, number> = {};
  transactions.forEach(t => {
    const vec = t.riskAssessment.attackVector;
    if (vec !== 'BENIGN') {
      vectorCounts[vec] = (vectorCounts[vec] || 0) + 1;
    }
  });

  const dynamicPieData = Object.keys(vectorCounts).map(vec => ({
    name: vec.replace('_', ' '),
    value: vectorCounts[vec],
    color: vec === 'ACCOUNT_TAKEOVER' ? '#EF4444' :
           vec === 'MONEY_MULE_RING' ? '#F97316' :
           vec === 'IMPOSSIBLE_TRAVEL' ? '#A855F7' :
           vec === 'RAPID_VELOCITY' ? '#F59E0B' : '#06B6D4'
  }));

  const pieDataToDisplay = dynamicPieData.length > 0 ? dynamicPieData : ATTACK_VECTOR_DISTRIBUTION;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-outfit text-base font-bold text-white">
              System Threat Intelligence & Attack Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics summarizing cyberattack vectors, hourly velocity trends, and fraud interception telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Threat & Volume Telemetry (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-outfit text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Hourly Scanned Traffic vs Intercepted Attack Attempts</span>
              </h3>
              <p className="text-xs text-slate-400">
                Safe payment processing vs high-risk fraud attacks blocked over time.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_THREAT_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="safeCount" name="Safe Transactions" stroke="#10B981" fillOpacity={1} fill="url(#colorSafe)" />
                <Area type="monotone" dataKey="attackCount" name="Blocked Attacks" stroke="#EF4444" fillOpacity={1} fill="url(#colorAttack)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Vector Distribution (1 Column) */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-outfit text-sm font-bold text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Attack Vector Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of detected payment fraud techniques.
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieDataToDisplay}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieDataToDisplay.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-1 text-xs">
            {pieDataToDisplay.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[170px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
