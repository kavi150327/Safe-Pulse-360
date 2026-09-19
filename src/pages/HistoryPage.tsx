import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { History, Cpu, Ambulance, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'opt' | 'emg' | 'inc' | 'traffic'>('opt');
  const [optHistory, setOptHistory] = useState<any[]>([]);
  const [emgHistory, setEmgHistory] = useState<any[]>([]);
  const [incHistory, setIncHistory] = useState<any[]>([]);
  const [trafficHistory, setTrafficHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'opt') {
        const res = await fetchApi<any[]>('/optimization/history');
        setOptHistory(res);
      } else if (activeTab === 'emg') {
        const res = await fetchApi<any[]>('/emergency/history');
        setEmgHistory(res);
      } else if (activeTab === 'inc') {
        const res = await fetchApi<any[]>('/incidents');
        setIncHistory(res);
      } else {
        const res = await fetchApi<any[]>('/traffic');
        setTrafficHistory(res);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Historical System Audit Records
          </h1>
          <p className="text-xs text-slate-400">
            Persistent database history of optimization runs, emergency events, incidents, and traffic logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('opt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'opt'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Optimization Runs</span>
        </button>
        <button
          onClick={() => setActiveTab('emg')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'emg'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Ambulance className="w-4 h-4" />
          <span>Emergency Events</span>
        </button>
        <button
          onClick={() => setActiveTab('inc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'inc'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Safety Incidents</span>
        </button>
        <button
          onClick={() => setActiveTab('traffic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'traffic'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Traffic Observations</span>
        </button>
      </div>

      {/* Table Data Render */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              {activeTab === 'opt' ? (
                <tr>
                  <th className="p-4">Run ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Algorithm</th>
                  <th className="p-4">Iterations</th>
                  <th className="p-4">Exec Time</th>
                  <th className="p-4">Objective</th>
                  <th className="p-4">Status</th>
                </tr>
              ) : activeTab === 'emg' ? (
                <tr>
                  <th className="p-4">Event ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Normal ETA</th>
                  <th className="p-4">Green Wave ETA</th>
                  <th className="p-4">Time Saved</th>
                </tr>
              ) : activeTab === 'inc' ? (
                <tr>
                  <th className="p-4">Incident ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Status</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Intersection</th>
                  <th className="p-4">Vehicles</th>
                  <th className="p-4">Density</th>
                  <th className="p-4">Queue</th>
                  <th className="p-4">Wait Time</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {activeTab === 'opt' &&
                optHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-white">{item.id}</td>
                    <td className="p-4 text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-cyan-300">{item.algorithm}</td>
                    <td className="p-4 font-mono">{item.iterations}</td>
                    <td className="p-4 font-mono">{item.execution_time_ms} ms</td>
                    <td className="p-4 font-mono">{item.objective_value}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">COMPLETED</span></td>
                  </tr>
                ))}

              {activeTab === 'emg' &&
                emgHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-white">{item.id}</td>
                    <td className="p-4 text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-4 text-cyan-300 font-semibold">{item.vehicle_type}</td>
                    <td className="p-4 font-mono text-xs">{item.route?.join(' → ')}</td>
                    <td className="p-4 text-slate-400 line-through">{item.normal_eta_sec}s</td>
                    <td className="p-4 text-emerald-400 font-bold">{item.optimized_eta_sec}s</td>
                    <td className="p-4 text-cyan-400 font-bold">+{item.time_saved_sec}s</td>
                  </tr>
                ))}

              {activeTab === 'inc' &&
                incHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-white">{item.id}</td>
                    <td className="p-4 text-cyan-300 font-semibold">{item.incident_type}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded text-[10px]">{item.severity}</span></td>
                    <td className="p-4">{item.location}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{item.details}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold rounded text-[10px]">{item.status}</span></td>
                  </tr>
                ))}

              {activeTab === 'traffic' &&
                trafficHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono text-slate-400">{item.id}</td>
                    <td className="p-4 text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4 font-bold text-white">{item.intersection_id}</td>
                    <td className="p-4">{item.vehicle_count}</td>
                    <td className="p-4 text-cyan-300 font-bold">{Math.round(item.density)}%</td>
                    <td className="p-4">{item.queue_length}</td>
                    <td className="p-4">{item.wait_time}s</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
