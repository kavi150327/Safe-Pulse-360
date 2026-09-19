import React, { useEffect, useState } from 'react';
import { IntersectionData } from '../lib/api';
import { Siren, TrainFront, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TrafficMapProps {
  intersections: IntersectionData[];
  activeRoute?: string[];
  railwayStatus?: { gate_status: string; train_detected: boolean; risk_level: string };
  onSelectIntersection?: (intersection: IntersectionData) => void;
  selectedId?: string;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  intersections,
  activeRoute = [],
  railwayStatus = { gate_status: 'OPEN', train_detected: false, risk_level: 'SAFE' },
  onSelectIntersection,
  selectedId
}) => {
  const [vehicleTick, setVehicleTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleTick((t) => (t + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getInter = (id: string) => intersections.find((i) => i.id === id);

  // Define road links between intersections
  const links = [
    { from: 'I6', to: 'I1' },
    { from: 'I1', to: 'I2' },
    { from: 'I2', to: 'I3' },
    { from: 'I6', to: 'I4' },
    { from: 'I1', to: 'I4' },
    { from: 'I2', to: 'I5' },
    { from: 'I4', to: 'I5' },
    { from: 'I5', to: 'I3' }
  ];

  const isLinkActive = (from: string, to: string) => {
    if (!activeRoute || activeRoute.length < 2) return false;
    for (let idx = 0; idx < activeRoute.length - 1; idx++) {
      if (
        (activeRoute[idx] === from && activeRoute[idx + 1] === to) ||
        (activeRoute[idx] === to && activeRoute[idx + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Background Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 text-xs text-slate-300 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Green Signal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Yellow Signal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Red Signal</span>
        </div>
        {activeRoute.length > 0 && (
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold border-l border-slate-700 pl-3">
            <Siren className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
            <span>Green Wave Active</span>
          </div>
        )}
      </div>

      <svg className="w-full h-full" viewBox="0 0 1000 600">
        {/* Draw Road Connections */}
        {links.map((link, idx) => {
          const source = getInter(link.from);
          const target = getInter(link.to);
          if (!source || !target) return null;
          const active = isLinkActive(link.from, link.to);

          return (
            <g key={idx}>
              {/* Outer Road Outline */}
              <line
                x1={source.x_pos}
                y1={source.y_pos}
                x2={target.x_pos}
                y2={target.y_pos}
                stroke={active ? '#06b6d4' : '#1e293b'}
                strokeWidth={active ? '22' : '16'}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              {/* Center Road Lane Line */}
              <line
                x1={source.x_pos}
                y1={source.y_pos}
                x2={target.x_pos}
                y2={target.y_pos}
                stroke={active ? '#22d3ee' : '#475569'}
                strokeWidth={active ? '3' : '2'}
                strokeDasharray={active ? '8,4' : '6,6'}
                strokeLinecap="round"
              />

              {/* Moving Vehicles along lanes */}
              {[0.2, 0.5, 0.8].map((offset, vIdx) => {
                const progress = (vehicleTick / 100 + offset) % 1.0;
                const vx = source.x_pos + (target.x_pos - source.x_pos) * progress;
                const vy = source.y_pos + (target.y_pos - source.y_pos) * progress;
                const isEmergencyVeh = active && vIdx === 1;

                return (
                  <circle
                    key={vIdx}
                    cx={vx}
                    cy={vy}
                    r={isEmergencyVeh ? 6 : 3.5}
                    fill={isEmergencyVeh ? '#f43f5e' : active ? '#22d3ee' : '#94a3b8'}
                    className={isEmergencyVeh ? 'animate-ping' : ''}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Railway Line at I3 */}
        <g transform="translate(850, 340)">
          {/* Railway Tracks */}
          <line x1="-120" y1="0" x2="120" y2="0" stroke="#64748b" strokeWidth="8" strokeDasharray="4,4" />
          {railwayStatus.train_detected && (
            <g className="animate-pulse">
              <rect x="-60" y="-12" width="120" height="24" rx="4" fill="#e11d48" opacity="0.85" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                TRAIN APPROACHING
              </text>
            </g>
          )}
        </g>

        {/* Intersections Nodes (I1 - I6) */}
        {intersections.map((inter) => {
          const isSelected = selectedId === inter.id;
          const isEmergency = inter.status === 'EMERGENCY' || activeRoute.includes(inter.id);
          const isRailway = inter.id === 'I3' && railwayStatus.train_detected;

          const signalColor =
            inter.signal_phase === 'GREEN'
              ? '#10b981'
              : inter.signal_phase === 'YELLOW'
              ? '#f59e0b'
              : '#ef4444';

          return (
            <g
              key={inter.id}
              transform={`translate(${inter.x_pos}, ${inter.y_pos})`}
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => onSelectIntersection && onSelectIntersection(inter)}
            >
              {/* Glow backdrop for high density or emergency */}
              <circle
                r="36"
                fill={isEmergency ? '#06b6d4' : isRailway ? '#ef4444' : signalColor}
                opacity={isEmergency ? 0.35 : isSelected ? 0.4 : 0.15}
                className={isEmergency ? 'animate-pulse' : ''}
              />

              {/* Main Node Junction Box */}
              <rect
                x="-28"
                y="-28"
                width="56"
                height="56"
                rx="12"
                fill="#0f172a"
                stroke={isSelected ? '#38bdf8' : isEmergency ? '#06b6d4' : isRailway ? '#f43f5e' : '#334155'}
                strokeWidth={isSelected || isEmergency || isRailway ? '3' : '2'}
              />

              {/* Signal Status Pill */}
              <circle cx="-16" cy="-16" r="6" fill={signalColor} className="animate-pulse" />

              {/* Node ID */}
              <text x="0" y="-4" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold">
                {inter.id}
              </text>
              <text x="0" y="14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="semibold">
                {Math.round(inter.traffic_density)}%
              </text>

              {/* Queue Badge */}
              <g transform="translate(18, -18)">
                <circle r="10" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                  {inter.queue_length}
                </text>
              </g>

              {/* Intersection Name Label Below */}
              <text x="0" y="44" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="medium">
                {inter.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
