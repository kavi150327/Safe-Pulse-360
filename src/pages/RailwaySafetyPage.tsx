import React, { useEffect, useState } from 'react';
import { RailwayStatus, fetchApi } from '../lib/api';
import {
  TrainFront,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  Radio,
  Cpu,
  Volume2,
  Shield,
  BellRing,
  Activity,
  History,
  Sparkles
} from 'lucide-react';

export const RailwaySafetyPage: React.FC = () => {
  const [status, setStatus] = useState<RailwayStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [leftBreach, setLeftBreach] = useState(false);
  const [rightBreach, setRightBreach] = useState(false);
  const [sensorResult, setSensorResult] = useState<any>(null);

  const loadStatus = async () => {
    try {
      const res = await fetchApi<RailwayStatus>('/railway');
      setStatus(res);
    } catch (err) {
      console.warn('Failed to fetch railway status:', err);
    }
  };

  const handleSimulateTrain = async (action: string = 'TRIGGER') => {
    setLoading(true);
    try {
      const res = await fetchApi<RailwayStatus>('/railway/simulate', {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      setStatus(res);
      if (action === 'TRIGGER') {
        // Trigger left sensor breach simulation
        handleSensorTrigger(true, false);
      } else {
        setLeftBreach(false);
        setRightBreach(false);
        setSensorResult(null);
      }
    } catch (err) {
      console.error('Failed to trigger railway event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSensorTrigger = async (left: boolean, right: boolean) => {
    setLeftBreach(left);
    setRightBreach(right);
    try {
      const res = await fetchApi<any>(`/railway/sensor-trigger?left_breach=${left}&right_breach=${right}`, {
        method: 'POST'
      });
      setSensorResult(res);
    } catch (err) {
      console.warn('Sensor trigger fallback:', err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const isClosed = status?.gate_status === 'CLOSED';
  const buzzerOn = isClosed && (leftBreach || rightBreach || status?.risk_level === 'HIGH RISK');

  const historyLogs = [
    { time: '10:32 AM', event: 'Unauthorized Crossing Attempt Detected', gate: 'CLOSED', sensor: 'LEFT SENSOR BREACH', buzzer: 'ON' },
    { time: '09:45 AM', event: 'Express Train Approaching — Barrier Lowered', gate: 'CLOSED', sensor: 'SENSORS ACTIVE', buzzer: 'STANDBY' },
    { time: '08:15 AM', event: 'Train Cleared — Servo Gate Opened', gate: 'OPEN', sensor: 'SAFE', buzzer: 'OFF' }
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/40">
              PAGE 3
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <TrainFront className="w-5 h-5 text-indigo-400" />
              RAILWAY CROSSING SAFETY
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated railway gate interlocking, dual IR/ultrasonic sensor intrusion detection & high-decibel warning buzzer control.
          </p>
        </div>

        {/* Train Simulation Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateTrain(isClosed ? 'CLEAR' : 'TRIGGER')}
            disabled={loading}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              isClosed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 animate-pulse'
            }`}
          >
            <TrainFront className="w-4 h-4" />
            <span>{isClosed ? 'CLEAR TRAIN & REOPEN GATE' : 'SIMULATE APPROACHING TRAIN'}</span>
          </button>
        </div>
      </div>

      {/* DANGEROUS CONDITION / WARNING BANNER */}
      {buzzerOn ? (
        <div className="p-4 bg-rose-950/80 border-2 border-rose-500 rounded-2xl space-y-2 text-rose-200 shadow-2xl shadow-rose-950/80 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="w-7 h-7 text-rose-400 animate-bounce" />
              <div>
                <h2 className="text-lg font-black tracking-wider text-rose-100 flex items-center gap-2">
                  🚨 RAILWAY CROSSING WARNING
                </h2>
                <p className="text-xs font-bold text-rose-300">DO NOT CROSS — TRAIN APPROACHING AT HIGH SPEED</p>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-rose-500/30 border border-rose-400 rounded-xl font-mono text-xs font-black text-rose-100">
              BUZZER STATUS: ON
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">NORMAL CONDITION — RAILWAY CROSSING SAFE — GATE OPEN</span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30">
            BUZZER STATUS: OFF
          </span>
        </div>
      )}

      {/* RAILWAY DASHBOARD STATUS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gate Status */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gate Status</span>
          <p className={`text-xl font-extrabold font-mono ${isClosed ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {status?.gate_status || 'OPEN'}
          </p>
          <span className="text-[10px] text-slate-500">Servo Motor Interlocked</span>
        </div>

        {/* Train Status */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Train Status</span>
          <p className={`text-xl font-extrabold ${isClosed ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isClosed ? 'APPROACHING (75 km/h)' : 'NO TRAIN DETECTED'}
          </p>
          <span className="text-[10px] text-slate-500">Radar / Track Sensor</span>
        </div>

        {/* Left / Right IR Sensors */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IR/Ultrasonic Sensors</span>
          <p className={`text-lg font-extrabold font-mono ${leftBreach || rightBreach ? 'text-rose-400' : 'text-emerald-400'}`}>
            L: {leftBreach ? 'INTRUSION' : 'SAFE'} | R: {rightBreach ? 'INTRUSION' : 'SAFE'}
          </p>
          <span className="text-[10px] text-slate-500">ESP32 Dual-Beam Sweep</span>
        </div>

        {/* Warning Buzzer */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Warning Siren / Buzzer</span>
          <p className={`text-xl font-extrabold font-mono ${buzzerOn ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`}>
            {buzzerOn ? 'BUZZER ACTIVE (110dB)' : 'OFF'}
          </p>
          <span className="text-[10px] text-slate-500">Simulated Hardware Output</span>
        </div>
      </div>

      {/* REALISTIC RAILWAY CROSSING VISUALIZATION DIAGRAM */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            ESP32 / ARDUINO IOT RAILWAY CROSSING SCHEMATIC DIAGRAM
          </h3>
          <span className="text-xs font-mono text-cyan-300">Junction I3 Track Sweep</span>
        </div>

        {/* SVG Railway Track & Servo Barrier Schematic */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative min-h-[300px]">
          <svg className="w-full h-64" viewBox="0 0 500 240">
            {/* Background */}
            <rect x="0" y="0" width="500" height="240" fill="#020617" rx="8" />

            {/* Railway Track (Diagonal / Horizontal) */}
            <rect x="0" y="100" width="500" height="40" fill="#1e293b" />
            {/* Metal Rails */}
            <line x1="0" y1="106" x2="500" y2="106" stroke="#94a3b8" strokeWidth="3" />
            <line x1="0" y1="134" x2="500" y2="134" stroke="#94a3b8" strokeWidth="3" />
            {/* Sleepers */}
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={i} x1={i * 20 + 10} y1="102" x2={i * 20 + 10} y2="138" stroke="#475569" strokeWidth="4" />
            ))}

            {/* Road crossing vertically */}
            <rect x="200" y="0" width="100" height="240" fill="#0f172a" opacity="0.8" />
            <line x1="250" y1="0" x2="250" y2="90" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />
            <line x1="250" y1="150" x2="250" y2="240" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />

            {/* Railway Gate Barriers */}
            {/* Top Gate Barrier (Left Side) */}
            <g className="transition-all duration-500">
              <rect x="180" y="85" width="8" height="20" fill="#475569" />
              <line
                x1="184"
                y1="95"
                x2={isClosed ? '260' : '184'}
                y2={isClosed ? '95' : '25'}
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray="10,10"
                className="transition-all duration-500"
              />
            </g>

            {/* Bottom Gate Barrier (Right Side) */}
            <g className="transition-all duration-500">
              <rect x="312" y="135" width="8" height="20" fill="#475569" />
              <line
                x1="316"
                y1="145"
                x2={isClosed ? '240' : '316'}
                y2={isClosed ? '145' : '215'}
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray="10,10"
                className="transition-all duration-500"
              />
            </g>

            {/* Left Side IR Sensor */}
            <circle cx="160" cy="50" r="12" fill={leftBreach ? '#ef4444' : '#10b981'} className={leftBreach ? 'animate-ping' : ''} />
            <text x="160" y="32" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">LEFT SENSOR</text>

            {/* Right Side IR Sensor */}
            <circle cx="340" cy="190" r="12" fill={rightBreach ? '#ef4444' : '#10b981'} className={rightBreach ? 'animate-ping' : ''} />
            <text x="340" y="215" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">RIGHT SENSOR</text>

            {/* Approaching Train Graphic when Gate is Closed */}
            {isClosed && (
              <g className="animate-pulse">
                <rect x="30" y="108" width="100" height="24" rx="4" fill="#38bdf8" />
                <circle cx="120" cy="120" r="5" fill="#f59e0b" className="animate-ping" />
                <text x="80" y="124" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="extrabold">EXPRESS TRAIN</text>
              </g>
            )}
          </svg>

          {/* Interactive Sensor Breach Trigger Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              onClick={() => handleSensorTrigger(!leftBreach, rightBreach)}
              disabled={!isClosed}
              className={`px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                !isClosed
                  ? 'opacity-40 bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : leftBreach
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {leftBreach ? 'CLEAR LEFT INTRUSION' : 'SIMULATE LEFT SENSOR BREACH'}
            </button>

            <button
              onClick={() => handleSensorTrigger(leftBreach, !rightBreach)}
              disabled={!isClosed}
              className={`px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                !isClosed
                  ? 'opacity-40 bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : rightBreach
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {rightBreach ? 'CLEAR RIGHT INTRUSION' : 'SIMULATE RIGHT SENSOR BREACH'}
            </button>
          </div>
        </div>
      </div>

      {/* EVENT HISTORY LOG TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Railway Crossing Event Log & Telemetry
          </h3>
          <span className="text-xs text-slate-400 font-mono">Log Entries: {historyLogs.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Description</th>
                <th className="p-4">Barrier Gate</th>
                <th className="p-4">Sensor Status</th>
                <th className="p-4">Buzzer Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
              {historyLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 text-slate-400">{log.time}</td>
                  <td className="p-4 font-semibold text-white">{log.event}</td>
                  <td className="p-4 font-bold">
                    <span className={`px-2.5 py-1 rounded text-[10px] ${log.gate === 'CLOSED' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {log.gate}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-cyan-300">{log.sensor}</td>
                  <td className="p-4 font-bold">
                    <span className={`px-2.5 py-1 rounded text-[10px] ${log.buzzer === 'ON' ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                      {log.buzzer}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
