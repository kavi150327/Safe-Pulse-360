import React from 'react';
import { IntersectionData } from '../lib/api';
import { GitMerge, Clock, Sliders, ShieldCheck } from 'lucide-react';

interface IntersectionsPageProps {
  intersections: IntersectionData[];
  onRunOptimization: () => void;
}

export const IntersectionsPage: React.FC<IntersectionsPageProps> = ({ intersections, onRunOptimization }) => {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-cyan-400" />
            Multi-Intersection Signal Management
          </h1>
          <p className="text-xs text-slate-400">
            Monitor and configure signal timing plans across all 6 core urban junctions.
          </p>
        </div>

        <button
          onClick={onRunOptimization}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Sliders className="w-4 h-4" />
          RUN OPTIMIZATION ENGINE
        </button>
      </div>

      {/* Grid of 6 Intersections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {intersections.map((inter) => {
          const isCongested = inter.traffic_density > 75;
          const isEmergency = inter.status === 'EMERGENCY';

          return (
            <div
              key={inter.id}
              className={`p-5 rounded-2xl border backdrop-blur-md space-y-4 transition-all ${
                isEmergency
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-950/50'
                  : isCongested
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-slate-700">
                    {inter.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{inter.name}</h3>
                    <span className="text-[10px] text-slate-400">Junction ID: {inter.id}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    inter.signal_phase === 'GREEN'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : inter.signal_phase === 'YELLOW'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {inter.signal_phase} ({inter.signal_timer}s)
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <p className="text-slate-400 text-[10px]">Traffic Density</p>
                  <p className="text-base font-bold text-white">{Math.round(inter.traffic_density)}%</p>
                </div>
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <p className="text-slate-400 text-[10px]">Queue Length</p>
                  <p className="text-base font-bold text-cyan-400">{inter.queue_length} vehicles</p>
                </div>
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <p className="text-slate-400 text-[10px]">Current Green Time</p>
                  <p className="text-base font-bold text-emerald-400">{inter.current_green_time}s</p>
                </div>
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <p className="text-slate-400 text-[10px]">Current Red Time</p>
                  <p className="text-base font-bold text-rose-400">{inter.current_red_time}s</p>
                </div>
              </div>

              {/* Recommended Green Time Banner */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 font-medium">Recommended Green</span>
                </div>
                <span className="font-bold text-cyan-300 text-sm">{inter.recommended_green_time}s</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
