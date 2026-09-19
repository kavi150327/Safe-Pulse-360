import React from 'react';
import { Link } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import {
  LayoutDashboard,
  Grid2X2,
  GitMerge,
  TrendingUp,
  Cpu,
  Ambulance,
  ShieldAlert,
  TrainFront,
  BarChart3,
  History,
  Server,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [location, setLocation] = useHashLocation();

  const mainPages = [
    { href: '/', label: '1. Live Traffic & Clearance', badge: 'PAGE 1', icon: Grid2X2 },
    { href: '/safety', label: '2. Safety & Emergency Center', badge: 'PAGE 2', icon: ShieldAlert },
    { href: '/railway', label: '3. Railway Crossing Safety', badge: 'PAGE 3', icon: TrainFront }
  ];

  const secondaryPages = [
    { href: '/demos', label: '9 Interactive Demos', icon: Sparkles },
    { href: '/intersections', label: 'Intersections Map', icon: GitMerge },
    { href: '/prediction', label: 'Traffic Prediction', icon: TrendingUp },
    { href: '/optimization', label: 'QUBO Optimizer', icon: Cpu },
    { href: '/emergency', label: 'Emergency Corridor', icon: Ambulance },
    { href: '/analytics', label: 'Analytics & CO₂', icon: BarChart3 },
    { href: '/history', label: 'Event History', icon: History },
    { href: '/system', label: 'System Monitoring', icon: Server }
  ];

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] bg-slate-950/95 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div className="space-y-4">
        {/* Core 3 Main Pages Section */}
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider uppercase text-cyan-400 mb-2 flex items-center justify-between">
            <span>Core System Pages</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">MAIN 3</span>
          </p>
          <div className="space-y-1">
            {mainPages.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => setLocation(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-300 bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 font-mono border border-slate-800">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Analytics & Tools */}
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
            Additional Analytics & Tools
          </p>
          <div className="space-y-1">
            {secondaryPages.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => setLocation(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>Engine Status</span>
          <span className="text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">QUBO Active</span>
        </div>
        <p className="text-[11px] text-slate-500">6 Urban Intersections (I1 - I6)</p>
      </div>
    </aside>
  );
};
