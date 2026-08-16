import React, { useState } from 'react';
import type { AccountNode, GraphEdge } from '../types/payment';
import { Network } from 'lucide-react';

interface GraphVisualizerProps {
  nodes: AccountNode[];
  edges: GraphEdge[];
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ nodes, edges }) => {
  const [selectedNode, setSelectedNode] = useState<AccountNode | null>(nodes.find(n => n.type === 'CONFIRMED_MULE') || nodes[0]);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter nodes
  const filteredNodes = nodes.filter(n => {
    if (filterType === 'MULES') return n.type === 'SUSPECTED_MULE' || n.type === 'CONFIRMED_MULE';
    if (filterType === 'USERS') return n.type === 'USER';
    if (filterType === 'MERCHANTS') return n.type === 'MERCHANT';
    return true;
  });

  // Calculate position coordinates for the node layout in a nice radial graph layout
  const nodePositions = React.useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    const width = 750;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes into rings: Center for Mules, Middle for Users, Outer for Merchants
    const mules = nodes.filter(n => n.type === 'CONFIRMED_MULE' || n.type === 'SUSPECTED_MULE');
    const users = nodes.filter(n => n.type === 'USER');
    const merchants = nodes.filter(n => n.type === 'MERCHANT');

    // Inner ring: Mules
    mules.forEach((m, idx) => {
      const angle = (idx / Math.max(mules.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const radius = 130;
      coords[m.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Middle ring: Users
    users.forEach((u, idx) => {
      const angle = (idx / Math.max(users.length, 1)) * 2 * Math.PI;
      const radius = 260;
      coords[u.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Outer ring: Merchants
    merchants.forEach((m, idx) => {
      const angle = (idx / Math.max(merchants.length, 1)) * 2 * Math.PI + Math.PI / 4;
      const radius = 320;
      coords[m.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    return coords;
  }, [nodes]);

  const getNodeColor = (type: AccountNode['type']) => {
    switch (type) {
      case 'CONFIRMED_MULE': return '#EF4444'; // glowing red
      case 'SUSPECTED_MULE': return '#F97316'; // orange
      case 'MERCHANT': return '#06B6D4'; // cyan
      case 'USER': default: return '#10B981'; // emerald green
    }
  };

  const connectedEdges = selectedNode 
    ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="font-outfit text-base font-bold text-white">
              Financial Graph & Mule Ring Analyzer
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-red-950 text-red-400 border border-red-800">
              3 Mule Clusters Tagged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Graph network visualization revealing multi-hop financial flows, account centrality, and mule aggregator rings.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-1">
          {['ALL', 'MULES', 'USERS', 'MERCHANTS'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === t
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Node-Link Canvas (2 Columns) */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl relative min-h-[500px] flex items-center justify-center overflow-hidden">
          
          <svg className="w-full h-[480px]" viewBox="0 0 750 480">
            <defs>
              {/* Arrow Marker Definitions */}
              <marker id="arrow-safe" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
              </marker>
              <marker id="arrow-suspicious" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
              </marker>

              {/* Glow Filters */}
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Edges */}
            {edges.map(edge => {
              const srcPos = nodePositions[edge.source];
              const tgtPos = nodePositions[edge.target];
              if (!srcPos || !tgtPos) return null;

              const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

              return (
                <g key={edge.id}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={edge.isSuspicious ? '#EF4444' : isHighlighted ? '#38BDF8' : '#334155'}
                    strokeWidth={edge.isSuspicious ? (isHighlighted ? 3 : 2) : 1.5}
                    strokeDasharray={edge.isSuspicious ? '5,5' : 'none'}
                    markerEnd={edge.isSuspicious ? 'url(#arrow-suspicious)' : 'url(#arrow-safe)'}
                    className="transition-all duration-300"
                  />
                  {/* Amount label on edge */}
                  <text
                    x={(srcPos.x + tgtPos.x) / 2}
                    y={(srcPos.y + tgtPos.y) / 2 - 5}
                    fill={edge.isSuspicious ? '#FCA5A5' : '#64748B'}
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    ₹{edge.amount.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring for confirmed mules */}
                  {(node.type === 'CONFIRMED_MULE' || node.type === 'SUSPECTED_MULE') && (
                    <circle
                      r={isSelected ? 24 : 20}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer ring */}
                  <circle
                    r={isSelected ? 20 : 16}
                    fill="#0F172A"
                    stroke={isSelected ? '#38BDF8' : color}
                    strokeWidth={isSelected ? 3 : 2}
                    filter={node.type === 'CONFIRMED_MULE' ? 'url(#glow-red)' : undefined}
                    className="transition-all duration-200 group-hover:scale-110"
                  />

                  {/* Inner Node Icon/Dot */}
                  <circle
                    r={8}
                    fill={color}
                  />

                  {/* Label */}
                  <text
                    y={30}
                    fill={isSelected ? '#38BDF8' : '#E2E8F0'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Graph Legend */}
          <div className="absolute bottom-3 left-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5 backdrop-blur-md">
            <div className="font-semibold text-slate-300 font-mono">Legend</div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Legitimate User</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Verified Merchant</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Suspected Mule</span>
            </div>
            <div className="flex items-center space-x-2 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Confirmed Mule Ring</span>
            </div>
          </div>

        </div>

        {/* Selected Node Inspector Details Panel (1 Column) */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-5">
          {selectedNode ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Account Graph Node</span>
                  <h3 className="font-outfit text-base font-bold text-white">{selectedNode.label}</h3>
                  <div className="text-xs font-mono text-cyan-400">{selectedNode.id}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                  selectedNode.type === 'CONFIRMED_MULE' ? 'bg-red-950 text-red-400 border border-red-800' :
                  selectedNode.type === 'SUSPECTED_MULE' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                  selectedNode.type === 'MERCHANT' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {selectedNode.type}
                </span>
              </div>

              {/* Node Risk Index */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Cluster Centrality Risk:</span>
                  <span className="font-mono font-bold text-white">{selectedNode.riskScore} / 100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${selectedNode.riskScore > 80 ? 'bg-red-500' : selectedNode.riskScore > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${selectedNode.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Inbound & Outbound Financial Flow */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Inbound Flow ({selectedNode.inDegree} tx)</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-1">
                    ₹{selectedNode.inboundVolume.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Outbound Flow ({selectedNode.outDegree} tx)</div>
                  <div className="font-mono font-bold text-amber-400 text-sm mt-1">
                    ₹{selectedNode.outboundVolume.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Fraud Flags */}
              {selectedNode.fraudFlags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mule Network Flags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.fraudFlags.map((flag, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-mono">
                        🚩 {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Transfer Edges List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Direct Connected Transfers ({connectedEdges.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {connectedEdges.map(edge => (
                    <div key={edge.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-mono text-slate-300 truncate max-w-[160px]">
                          {edge.source === selectedNode.id ? `➔ ${edge.target}` : `⬅ ${edge.source}`}
                        </div>
                        <div className="text-[10px] text-slate-500">{new Date(edge.timestamp).toLocaleTimeString()}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-200">
                        ₹{edge.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500 font-mono">
              Click any node in the graph visualizer to inspect its financial flow details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
