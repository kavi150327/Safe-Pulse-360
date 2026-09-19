import React from 'react';
import { DashboardKpis, IntersectionData } from '../lib/api';
import { TrafficMap } from '../components/TrafficMap';
import {
  Activity,
  Clock,
  AlertTriangle,
  Siren,
  Fuel,
  TrendingDown,
  TrainFront,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardPageProps {
  kpis: DashboardKpis | null;
  intersections: IntersectionData[];
  onNavigate: (href: string) => void;
  onRunOptimization: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  intersections,
  onNavigate,
  onRunOptimization
}) => {
  const data = kpis?.kpis;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Disclaimer & Demos launcher banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <span className="font-bold text-white text-sm">SafePulse-360 Hackathon Command Dashboard</span>
            <p className="text-slate-400 text-xs">Multi-intersection adaptive QUBO signal optimization & urban safety engine</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/demos')}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>LAUNCH 9 DEMOS SHOWCASE</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Traffic Density */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Density</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white">{data?.traffic_density ?? 63.5}%</p>
          <span className="text-[10px] text-slate-500">Network Avg</span>
        </div>

        {/* 2. Avg Wait Time */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Wait Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white">{data?.avg_wait_time_sec ?? 36.8}s</p>
          <span className="text-[10px] text-slate-500">Per Vehicle</span>
        </div>

        {/* 3. Congestion Level */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Congestion</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-amber-400">{data?.congestion_level ?? 'MODERATE'}</p>
          <span className="text-[10px] text-slate-500">Status</span>
        </div>

        {/* 4. Active Incidents */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400">{data?.active_incidents ?? 1}</p>
          <span className="text-[10px] text-slate-500">Active Radar</span>
        </div>

        {/* 5. Emergency Vehicles */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Emergency</span>
            <Siren className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-cyan-300">{data?.active_emergency_vehicles ?? 0}</p>
          <span className="text-[10px] text-slate-500">Corridor Wave</span>
        </div>

        {/* 6. Fuel Saved */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fuel Saved</span>
            <Fuel className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">{data?.fuel_saved_liters ?? 21.2} L</p>
          <span className="text-[10px] text-slate-500">Sim. Estimate</span>
        </div>

        {/* 7. CO2 Reduced */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CO₂ Reduced</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">{data?.co2_reduced_kg ?? 49.0} kg</p>
          <span className="text-[10px] text-slate-500">Sim. Estimate</span>
        </div>

        {/* 8. Railway Risk Status */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Railway Risk</span>
            <TrainFront className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-indigo-300">{data?.railway_risk_status ?? 'SAFE'}</p>
          <span className="text-[10px] text-slate-500">Crossing I3</span>
        </div>
      </div>

      {/* Main Map & Quick Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Urban Traffic Command Map (Intersections I1 - I6)
            </h2>
            <button
              onClick={() => onNavigate('/traffic')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Open Live Simulation &rarr;
            </button>
          </div>
          <TrafficMap intersections={intersections} />
        </div>

        {/* Quick System Action Panels */}
        <div className="space-y-4">
          {/* SYSTEM STATUS */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              System Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-400">Backend API</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-400">QUBO Optimization</span>
                <span className="text-cyan-400 font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-400">SQLite Database</span>
                <span className="text-emerald-400 font-bold">CONNECTED</span>
              </div>
            </div>
          </div>

          {/* OPTIMIZATION & EMERGENCY SHORTCUTS */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Optimization Engine
            </h3>
            <p className="text-xs text-slate-400">
              Run quantum-inspired QUBO solver to optimize green light allocation across all 6 junctions.
            </p>
            <button
              onClick={onRunOptimization}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              RUN QUBO OPTIMIZATION
            </button>
          </div>

          {/* EMERGENCY WAVE SHORTCUT */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-400" />
              Emergency Green Wave
            </h3>
            <p className="text-xs text-slate-400">
              Clear route corridors instantly for priority emergency vehicles (I5 &rarr; I4).
            </p>
            <button
              onClick={() => onNavigate('/emergency')}
              className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Siren className="w-4 h-4 text-rose-400" />
              Configure Green Corridor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
