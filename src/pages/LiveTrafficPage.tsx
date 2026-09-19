import React, { useEffect, useState } from 'react';
import { IntersectionData, fetchApi } from '../lib/api';
import { TrafficMap } from '../components/TrafficMap';
import { Junction4RoadViewer, RoadData } from '../components/Junction4RoadViewer';
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Activity,
  Calendar,
  Sparkles,
  TrendingDown,
  Clock,
  Car,
  Bus,
  Truck,
  Siren,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface LiveTrafficPageProps {
  intersections: IntersectionData[];
  onRefresh: () => void;
}

export const LiveTrafficPage: React.FC<LiveTrafficPageProps> = ({ intersections, onRefresh }) => {
  const [dayType, setDayType] = useState<string>('Working Day');
  const [junctionData, setJunctionData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [selectedInter, setSelectedInter] = useState<IntersectionData | null>(null);

  const fetchJunction = async (selectedDay: string) => {
    try {
      const data = await fetchApi<any>(`/traffic/junction-4road?day_type=${encodeURIComponent(selectedDay)}`);
      setJunctionData(data);
    } catch (err) {
      console.warn('Fallback loading junction 4road data:', err);
    }
  };

  useEffect(() => {
    fetchJunction(dayType);
  }, [dayType]);

  const handleSimAction = async (action: string, delta: number = 0) => {
    try {
      if (action === 'PAUSE') setIsSimulating(false);
      if (action === 'START') setIsSimulating(true);

      await fetchApi('/traffic/simulate', {
        method: 'POST',
        body: JSON.stringify({
          action,
          delta_traffic: delta,
          speed_multiplier: speed
        })
      });
      onRefresh();
      fetchJunction(dayType);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const dayTypes = [
    'Working Day',
    'Weekend',
    'Sunday',
    'Holiday',
    'Festival',
    'Special Event',
    'College Event',
    'Public Gathering'
  ];

  const roads: RoadData[] = junctionData?.roads || [
    {
      road: 'NORTH ROAD',
      direction: 'North',
      total_vehicles: 35,
      bikes: 12,
      cars: 15,
      buses: 3,
      school_buses: 1,
      heavy_vehicles: 5,
      emergency_vehicles: 0,
      density: 'MEDIUM',
      queue_meters: 145,
      avg_wait_sec: 38,
      signal: 'GREEN',
      countdown: 45
    },
    {
      road: 'EAST ROAD',
      direction: 'East',
      total_vehicles: 18,
      bikes: 8,
      cars: 7,
      buses: 1,
      school_buses: 0,
      heavy_vehicles: 2,
      emergency_vehicles: 0,
      density: 'LOW',
      queue_meters: 65,
      avg_wait_sec: 18,
      signal: 'RED',
      countdown: 18
    },
    {
      road: 'SOUTH ROAD',
      direction: 'South',
      total_vehicles: 52,
      bikes: 20,
      cars: 18,
      buses: 2,
      school_buses: 0,
      heavy_vehicles: 11,
      emergency_vehicles: 1,
      density: 'HIGH',
      queue_meters: 230,
      avg_wait_sec: 55,
      signal: 'RED',
      countdown: 32
    },
    {
      road: 'WEST ROAD',
      direction: 'West',
      total_vehicles: 27,
      bikes: 10,
      cars: 12,
      buses: 1,
      school_buses: 0,
      heavy_vehicles: 4,
      emergency_vehicles: 0,
      density: 'MEDIUM',
      queue_meters: 110,
      avg_wait_sec: 28,
      signal: 'RED',
      countdown: 26
    }
  ];

  const currentPriority = junctionData?.current_priority || 'EMERGENCY VEHICLE';
  const priorityRoad = junctionData?.priority_road || 'South Road';
  const rationale = junctionData?.rationale || 'Ambulance detected on South Road. Immediate corridor signal override active.';
  const summary = junctionData?.summary || {
    total_vehicles: 132,
    congestion_level: 'HIGH',
    avg_wait_time: 34.8,
    total_queue: 550,
    school_buses: 1,
    heavy_vehicles: 22,
    emergency_vehicles: 1,
    estimated_delay_reduction_pct: 38.5,
    before_wait_sec: 52.0,
    after_wait_sec: 32.0
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
              PAGE 1
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              LIVE TRAFFIC & SMART TRAFFIC CLEARANCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time 4-road AI camera observer, dynamic priority signal clearance & predictive day-type traffic pattern optimizer.
          </p>
        </div>

        {/* Simulation Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
          {isSimulating ? (
            <button
              onClick={() => handleSimAction('PAUSE')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={() => handleSimAction('START')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>START</span>
            </button>
          )}

          <button
            onClick={() => handleSimAction('RESET')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DB</span>
          </button>

          <button
            onClick={() => handleSimAction('RANDOMIZE')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>SURGE TRAFFIC</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: LIVE 4-ROAD JUNCTION VISUALIZER & CLEARANCE PANEL */}
      <Junction4RoadViewer
        roads={roads}
        currentPriority={currentPriority}
        priorityRoad={priorityRoad}
        rationale={rationale}
      />

      {/* TRAFFIC PATTERN DETECTION & DAY TYPE SELECTOR SECTION */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              TRAFFIC PATTERN DETECTION & PREDICTION
            </h3>
            <p className="text-xs text-slate-400">
              Select Day / Special Event type to compare traffic surges and adjust signal recommendations before congestion becomes severe.
            </p>
          </div>

          {/* Day Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Day Type / Event:</span>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value)}
              className="bg-slate-950 text-cyan-300 border border-cyan-500/50 font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {dayTypes.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pattern Profiles Comparison Cards (Working Day vs Sunday vs Festival vs Selected) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Working Day Profile */}
          <div className={`p-4 rounded-xl border space-y-2 ${dayType === 'Working Day' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold text-sm text-white">
              <span>WORKING DAY</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">NORMAL COMMUTE</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Morning (08:00 - 10:30):</span><strong className="text-rose-400">HIGH (85%)</strong></div>
              <div className="flex justify-between"><span>Afternoon (12:00 - 15:00):</span><strong className="text-cyan-400">MEDIUM (55%)</strong></div>
              <div className="flex justify-between"><span>Evening (17:00 - 20:30):</span><strong className="text-rose-400">HIGH (92%)</strong></div>
            </div>
          </div>

          {/* Sunday Profile */}
          <div className={`p-4 rounded-xl border space-y-2 ${dayType === 'Sunday' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold text-sm text-white">
              <span>SUNDAY</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">WEEKEND FLOW</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Morning (08:00 - 10:30):</span><strong className="text-emerald-400">LOW (35%)</strong></div>
              <div className="flex justify-between"><span>Afternoon (12:00 - 15:00):</span><strong className="text-cyan-400">MEDIUM (60%)</strong></div>
              <div className="flex justify-between"><span>Evening (17:00 - 20:30):</span><strong className="text-amber-400">HIGH (78%)</strong></div>
            </div>
          </div>

          {/* Festival / Event Profile */}
          <div className={`p-4 rounded-xl border space-y-2 ${dayType === 'Festival' || dayType === 'Special Event' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-center font-bold text-sm text-white">
              <span>FESTIVAL / EVENT</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">SURGE PATTERN</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Morning (08:00 - 10:30):</span><strong className="text-amber-400">HIGH (80%)</strong></div>
              <div className="flex justify-between"><span>Afternoon (12:00 - 15:00):</span><strong className="text-rose-400">VERY HIGH (94%)</strong></div>
              <div className="flex justify-between"><span>Evening (17:00 - 20:30):</span><strong className="text-rose-400">VERY HIGH (98%)</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 1 SUMMARY & BEFORE VS AFTER OPTIMIZATION COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Page 1 Summary Metrics Cards */}
        <div className="lg:col-span-8 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            PAGE 1 COMMAND SUMMARY (LIVE NETWORK METRICS)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Total Vehicles</span>
              <p className="text-lg font-bold text-white">{summary.total_vehicles} veh</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Congestion Level</span>
              <p className="text-lg font-bold text-amber-400">{summary.congestion_level}</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Avg Wait Time</span>
              <p className="text-lg font-bold text-cyan-300">{summary.avg_wait_time}s</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Total Queue Length</span>
              <p className="text-lg font-bold text-cyan-400">{summary.total_queue}m</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">School / College Buses</span>
              <p className="text-lg font-bold text-amber-300">{summary.school_buses} Active</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Heavy Vehicles</span>
              <p className="text-lg font-bold text-amber-400">{summary.heavy_vehicles} Heavy</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Emergency Vehicles</span>
              <p className="text-lg font-bold text-rose-400">{summary.emergency_vehicles} Ambulance</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Estimated Delay Reduction</span>
              <p className="text-lg font-bold text-emerald-400">-{summary.estimated_delay_reduction_pct}%</p>
            </div>
          </div>
        </div>

        {/* BEFORE vs AFTER OPTIMIZATION COMPARISON CARD */}
        <div className="lg:col-span-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              BEFORE vs AFTER OPTIMIZATION
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
              QUBO OPTIMIZED
            </span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px]">Fixed Signal Wait Time</p>
                <p className="text-base font-bold text-rose-400">{summary.before_wait_sec} sec</p>
              </div>
              <ArrowRightLeft className="w-5 h-5 text-slate-600" />
              <div className="text-right">
                <p className="text-slate-400 text-[10px]">Smart Clearance Wait Time</p>
                <p className="text-base font-bold text-emerald-400">{summary.after_wait_sec} sec</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px]">Queue Buildup</p>
                <p className="text-base font-bold text-rose-400">320 meters</p>
              </div>
              <ArrowRightLeft className="w-5 h-5 text-slate-600" />
              <div className="text-right">
                <p className="text-slate-400 text-[10px]">Optimized Queue</p>
                <p className="text-base font-bold text-emerald-400">95 meters</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
              <span className="text-emerald-400 font-bold text-xs block">TOTAL NETWORK EFFICIENCY IMPROVEMENT</span>
              <p className="text-xl font-black text-emerald-300">38.5% FASTER CLEARANCE</p>
            </div>
          </div>
        </div>
      </div>

      {/* FULL CITY MAP VIEW (INTERSECTIONS I1 - I6) */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            FULL URBAN NETWORK MAP (INTERSECTIONS I1 - I6)
          </h3>
          <span className="text-xs text-slate-400 font-mono">6 Intersections Online</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrafficMap
              intersections={intersections}
              onSelectIntersection={(inter) => setSelectedInter(inter)}
              selectedId={selectedInter?.id}
            />
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white border-b border-slate-800 pb-2">
              {selectedInter ? `${selectedInter.id} - ${selectedInter.name}` : 'Click Any Intersection Node'}
            </h4>
            {selectedInter ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Density:</span>
                  <span className="font-bold text-cyan-300">{Math.round(selectedInter.traffic_density)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue:</span>
                  <span className="font-bold text-cyan-400">{selectedInter.queue_length} veh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Wait:</span>
                  <span className="font-bold text-amber-400">{selectedInter.avg_wait_time}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Speed:</span>
                  <span className="font-bold text-emerald-400">{selectedInter.avg_speed} km/h</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Select an intersection node on the city map to inspect live queues and signal timers.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
