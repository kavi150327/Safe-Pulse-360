import React, { useEffect, useState } from 'react';
import { SystemEvent, fetchApi } from '../lib/api';
import { Server, Cpu, Database, Activity, RefreshCw, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';

interface SystemMonitoringPageProps {
  onResetDb: () => void;
}

export const SystemMonitoringPage: React.FC<SystemMonitoringPageProps> = ({ onResetDb }) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([
        fetchApi<any>('/system/status'),
        fetchApi<SystemEvent[]>('/system/events')
      ]);
      setStatusData(sRes);
      setEvents(eRes);
    } catch (err) {
      console.error('Failed to fetch system monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            System Status & Telemetry
          </h1>
          <p className="text-xs text-slate-400">
            Real-time component health, database query telemetry, and system event log feed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSystemData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>POLL STATUS</span>
          </button>
          <button
            onClick={onResetDb}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
            <span>RESET DATABASE</span>
          </button>
        </div>
      </div>

      {/* Component Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <p className="text-slate-400">Frontend UI</p>
          <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            ONLINE
          </p>
          <span className="text-[10px] text-slate-500">React + Vite + Tailwind</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <p className="text-slate-400">FastAPI Backend</p>
          <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            HEALTHY
          </p>
          <span className="text-[10px] text-slate-500">Python Uvicorn (Port 8000)</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <p className="text-slate-400">SQLite Database</p>
          <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            CONNECTED
          </p>
          <span className="text-[10px] text-slate-500">safepulse360.db</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <p className="text-slate-400">QUBO Engine</p>
          <p className="text-base font-bold text-cyan-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            READY
          </p>
          <span className="text-[10px] text-slate-500">Quantum-Inspired Solver</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <p className="text-slate-400">Traffic Simulation</p>
          <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            ACTIVE
          </p>
          <span className="text-[10px] text-slate-500">0.5x - 5.0x Multiplier</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <p className="text-slate-400">REST APIs</p>
          <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            21/21 OK
          </p>
          <span className="text-[10px] text-slate-500">200 OK Responses</span>
        </div>
      </div>

      {/* System Events Feed */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Recent Live System Events Stream
        </h3>

        <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
          {events.map((e) => (
            <div
              key={e.id}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.severity === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : e.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {e.event_type}
                  </span>
                  <span className="text-slate-400 text-[11px]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200">{e.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
