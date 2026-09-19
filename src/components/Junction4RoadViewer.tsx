import React, { useEffect, useState } from 'react';
import { Siren, Bus, Car, Truck, Bike, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

export interface RoadData {
  road: string;
  direction: string;
  total_vehicles: number;
  bikes: number;
  cars: number;
  buses: number;
  school_buses: number;
  heavy_vehicles: number;
  emergency_vehicles: number;
  density: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  queue_meters: number;
  avg_wait_sec: number;
  signal: 'GREEN' | 'YELLOW' | 'RED';
  countdown: number;
}

interface Junction4RoadViewerProps {
  roads: RoadData[];
  currentPriority: string;
  priorityRoad: string;
  rationale: string;
}

export const Junction4RoadViewer: React.FC<Junction4RoadViewerProps> = ({
  roads,
  currentPriority,
  priorityRoad,
  rationale
}) => {
  const [timers, setTimers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const initialTimers: { [key: string]: number } = {};
    roads.forEach((r) => {
      initialTimers[r.direction] = r.countdown;
    });
    setTimers(initialTimers);

    const interval = setInterval(() => {
      setTimers((prev) => {
        const next: { [key: string]: number } = {};
        Object.keys(prev).forEach((key) => {
          const val = prev[key];
          next[key] = val <= 1 ? 45 : val - 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roads]);

  const getRoad = (dir: string) => roads.find((r) => r.direction.toLowerCase() === dir.toLowerCase()) || roads[0];

  const north = getRoad('North');
  const east = getRoad('East');
  const south = getRoad('South');
  const west = getRoad('West');

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'VERY HIGH':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'MEDIUM':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    }
  };

  const getSignalBadge = (signal: string, timerVal: number) => {
    const isGreen = signal === 'GREEN';
    const isYellow = signal === 'YELLOW';
    return (
      <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono text-xs font-bold ${
        isGreen
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/50'
          : isYellow
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
          : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full ${isGreen ? 'bg-emerald-400 animate-ping' : isYellow ? 'bg-amber-400' : 'bg-rose-500'}`}></span>
        <span>{signal} 00:{timerVal < 10 ? `0${timerVal}` : timerVal}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Simulation Banner Label */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-extrabold text-white tracking-wider">LIVE TRAFFIC COMMAND JUNCTION</span>
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            DEMO / SIMULATION AI FEED
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Cam ID: CAM-4WAY-J1</span>
      </div>

      {/* Main Intersection SVG + 4 Road Data Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Side: West & North Cards */}
        <div className="lg:col-span-4 space-y-3">
          {/* North Road Card */}
          <div className={`p-4 bg-slate-900/95 border rounded-2xl space-y-2 transition-all ${north.signal === 'GREEN' ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center justify-center border border-slate-700">N</span>
                <div>
                  <h4 className="font-bold text-white text-xs">{north.road}</h4>
                  <span className="text-[10px] text-slate-400">{north.total_vehicles} Vehicles Detected</span>
                </div>
              </div>
              {getSignalBadge(north.signal, timers['North'] ?? north.countdown)}
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-[11px] text-center pt-1">
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Bikes/Cars</span>
                <span className="font-bold text-slate-200">{north.bikes} / {north.cars}</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Buses</span>
                <span className="font-bold text-cyan-300">{north.buses + north.school_buses} ({north.school_buses} Sch)</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Heavy/Emg</span>
                <span className="font-bold text-amber-300">{north.heavy_vehicles} / {north.emergency_vehicles}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDensityColor(north.density)}`}>
                Density: {north.density}
              </span>
              <span className="text-slate-400 font-mono">Q: {north.queue_meters}m | Wait: {north.avg_wait_sec}s</span>
            </div>
          </div>

          {/* West Road Card */}
          <div className={`p-4 bg-slate-900/95 border rounded-2xl space-y-2 transition-all ${west.signal === 'GREEN' ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center justify-center border border-slate-700">W</span>
                <div>
                  <h4 className="font-bold text-white text-xs">{west.road}</h4>
                  <span className="text-[10px] text-slate-400">{west.total_vehicles} Vehicles Detected</span>
                </div>
              </div>
              {getSignalBadge(west.signal, timers['West'] ?? west.countdown)}
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-[11px] text-center pt-1">
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Bikes/Cars</span>
                <span className="font-bold text-slate-200">{west.bikes} / {west.cars}</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Buses</span>
                <span className="font-bold text-cyan-300">{west.buses + west.school_buses} ({west.school_buses} Sch)</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Heavy/Emg</span>
                <span className="font-bold text-amber-300">{west.heavy_vehicles} / {west.emergency_vehicles}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDensityColor(west.density)}`}>
                Density: {west.density}
              </span>
              <span className="text-slate-400 font-mono">Q: {west.queue_meters}m | Wait: {west.avg_wait_sec}s</span>
            </div>
          </div>
        </div>

        {/* Center: 4-Way Animated Cross Canvas / Graphic */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl min-h-[340px]">
          {/* Compass labels */}
          <div className="absolute top-2 text-[11px] font-bold text-cyan-400 tracking-widest uppercase">NORTH ↓</div>
          <div className="absolute bottom-2 text-[11px] font-bold text-cyan-400 tracking-widest uppercase">↑ SOUTH</div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-cyan-400 tracking-widest uppercase">WEST →</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-cyan-400 tracking-widest uppercase">← EAST</div>

          {/* SVG Road Layout */}
          <svg className="w-full h-72" viewBox="0 0 300 300">
            {/* Background grass/buildings */}
            <rect x="0" y="0" width="300" height="300" fill="#020617" />

            {/* Vertical Road */}
            <rect x="110" y="0" width="80" height="300" fill="#0f172a" />
            <line x1="150" y1="0" x2="150" y2="110" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />
            <line x1="150" y1="190" x2="150" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />

            {/* Horizontal Road */}
            <rect x="0" y="110" width="300" height="80" fill="#0f172a" />
            <line x1="0" y1="150" x2="110" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />
            <line x1="190" y1="150" x2="300" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />

            {/* Intersection Center Box */}
            <rect x="110" y="110" width="80" height="80" fill="#1e293b" rx="4" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4,4" />

            {/* Pedestrian Crosswalk Lines */}
            <rect x="110" y="98" width="80" height="12" fill="url(#stripe)" opacity="0.4" />
            <rect x="110" y="190" width="80" height="12" fill="url(#stripe)" opacity="0.4" />
            <rect x="98" y="110" width="12" height="80" fill="url(#stripe)" opacity="0.4" />
            <rect x="190" y="110" width="12" height="80" fill="url(#stripe)" opacity="0.4" />

            {/* Signal Lights */}
            {/* North Signal */}
            <circle cx="150" cy="85" r="10" fill={north.signal === 'GREEN' ? '#10b981' : '#f43f5e'} className="transition-all" />
            {/* South Signal */}
            <circle cx="150" cy="215" r="10" fill={south.signal === 'GREEN' ? '#10b981' : '#f43f5e'} className="transition-all" />
            {/* East Signal */}
            <circle cx="215" cy="150" r="10" fill={east.signal === 'GREEN' ? '#10b981' : '#f43f5e'} className="transition-all" />
            {/* West Signal */}
            <circle cx="85" cy="150" r="10" fill={west.signal === 'GREEN' ? '#10b981' : '#f43f5e'} className="transition-all" />

            {/* Animated Moving Vehicles */}
            {/* North -> South Moving Vehicle */}
            <g className={north.signal === 'GREEN' ? 'animate-bounce' : ''}>
              <rect x="125" y="40" width="12" height="24" rx="3" fill="#38bdf8" />
              <rect x="127" y="44" width="8" height="6" fill="#0f172a" />
            </g>

            {/* South -> North Moving Ambulance */}
            <g className={south.signal === 'GREEN' ? 'animate-bounce' : ''}>
              <rect x="160" y="240" width="14" height="28" rx="4" fill="#ef4444" />
              <circle cx="167" cy="245" r="3" fill="#00f0ff" className="animate-ping" />
              <rect x="163" y="254" width="8" height="8" fill="#ffffff" />
            </g>

            {/* East -> West Moving Car */}
            <g>
              <rect x="240" y="125" width="24" height="12" rx="3" fill="#f59e0b" />
            </g>

            {/* West -> East Moving Truck */}
            <g>
              <rect x="40" y="160" width="32" height="14" rx="3" fill="#10b981" />
            </g>

            <defs>
              <pattern id="stripe" width="8" height="8" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="4" />
              </pattern>
            </defs>
          </svg>

          {/* Center Badge */}
          <div className="mt-2 text-center">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">
              ACTIVE CYCLE: {currentPriority}
            </span>
          </div>
        </div>

        {/* Right Side: East & South Cards */}
        <div className="lg:col-span-4 space-y-3">
          {/* East Road Card */}
          <div className={`p-4 bg-slate-900/95 border rounded-2xl space-y-2 transition-all ${east.signal === 'GREEN' ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center justify-center border border-slate-700">E</span>
                <div>
                  <h4 className="font-bold text-white text-xs">{east.road}</h4>
                  <span className="text-[10px] text-slate-400">{east.total_vehicles} Vehicles Detected</span>
                </div>
              </div>
              {getSignalBadge(east.signal, timers['East'] ?? east.countdown)}
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-[11px] text-center pt-1">
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Bikes/Cars</span>
                <span className="font-bold text-slate-200">{east.bikes} / {east.cars}</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Buses</span>
                <span className="font-bold text-cyan-300">{east.buses + east.school_buses} ({east.school_buses} Sch)</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Heavy/Emg</span>
                <span className="font-bold text-amber-300">{east.heavy_vehicles} / {east.emergency_vehicles}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDensityColor(east.density)}`}>
                Density: {east.density}
              </span>
              <span className="text-slate-400 font-mono">Q: {east.queue_meters}m | Wait: {east.avg_wait_sec}s</span>
            </div>
          </div>

          {/* South Road Card */}
          <div className={`p-4 bg-slate-900/95 border rounded-2xl space-y-2 transition-all ${south.signal === 'GREEN' ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center justify-center border border-slate-700">S</span>
                <div>
                  <h4 className="font-bold text-white text-xs">{south.road}</h4>
                  <span className="text-[10px] text-slate-400">{south.total_vehicles} Vehicles Detected</span>
                </div>
              </div>
              {getSignalBadge(south.signal, timers['South'] ?? south.countdown)}
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-[11px] text-center pt-1">
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Bikes/Cars</span>
                <span className="font-bold text-slate-200">{south.bikes} / {south.cars}</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Buses</span>
                <span className="font-bold text-cyan-300">{south.buses + south.school_buses} ({south.school_buses} Sch)</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Heavy/Emg</span>
                <span className="font-bold text-amber-300">{south.heavy_vehicles} / {south.emergency_vehicles}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDensityColor(south.density)}`}>
                Density: {south.density}
              </span>
              <span className="text-slate-400 font-mono">Q: {south.queue_meters}m | Wait: {south.avg_wait_sec}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Priority Order Rationale Box */}
      <div className="p-4 bg-slate-900/90 border border-cyan-500/40 rounded-2xl space-y-2 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white tracking-wider uppercase">
              SMART TRAFFIC CLEARANCE PRIORITY DECISION
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
            CURRENT PRIORITY: {currentPriority} ({priorityRoad})
          </span>
        </div>

        <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed font-mono">
          <strong className="text-cyan-400">WHY?</strong> {rationale}
        </p>

        {/* Priority Order Hierarchy Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-300">
            <Siren className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>1. Emergency Vehicle (Highest)</span>
          </div>
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300">
            <Bus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>2. School / College Bus</span>
          </div>
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center gap-2 text-cyan-300">
            <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>3. Heavy Vehicles</span>
          </div>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-300">
            <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>4. Normal Mixed Traffic (60s Cycle)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
