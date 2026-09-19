import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { BarChart3, TrendingDown, Clock, Activity, Fuel } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DEFAULT_CHART_DATA = [
  { time: '10:00', density: 45, wait_time: 25, co2: 42 },
  { time: '10:15', density: 58, wait_time: 32, co2: 55 },
  { time: '10:30', density: 72, wait_time: 48, co2: 78 },
  { time: '10:45', density: 84, wait_time: 56, co2: 92 },
  { time: '11:00', density: 63, wait_time: 35, co2: 58 },
  { time: '11:15', density: 52, wait_time: 28, co2: 46 }
];

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('15m');
  const [chartData, setChartData] = useState<any[]>(DEFAULT_CHART_DATA);
  const [summary, setSummary] = useState<any>(null);

  const loadAnalytics = async () => {
    try {
      const res = await fetchApi<any>(`/analytics?timeframe=${timeframe}`);
      if (res && Array.isArray(res.chart_data) && res.chart_data.length > 0) {
        setChartData(res.chart_data);
      }
      if (res && res.summary) setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Urban Safety & Traffic Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time aggregate performance metrics pulled directly from backend SQLite history.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['5m', '15m', '1h', 'Today'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf === '5m' ? '5 Minutes' : tf === '15m' ? '15 Minutes' : tf === '1h' ? '1 Hour' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Traffic Density & Speed */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Traffic Density vs Speed Trend
            </h3>
            <span className="text-[10px] text-slate-500">Simulation Estimate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="density" stroke="#22d3ee" fillOpacity={1} fill="url(#colorDensity)" name="Density (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Wait Time & Queue Length */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Average Waiting Time (sec)
            </h3>
            <span className="text-[10px] text-slate-500">Simulation Estimate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="wait_time" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Wait Time (s)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fuel Consumption & CO2 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-400" />
              Simulated Fuel Consumption & CO₂ Impact
            </h3>
            <span className="text-[10px] text-slate-500">Simulation Estimate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="co2" stroke="#10b981" fillOpacity={1} fill="url(#colorCo2)" name="CO2 Emissions (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
