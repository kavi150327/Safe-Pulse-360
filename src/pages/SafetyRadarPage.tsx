import React, { useEffect, useState } from 'react';
import { SafetyIncident, fetchApi } from '../lib/api';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  AlertOctagon,
  Car,
  Siren,
  Building2,
  Eye,
  Activity,
  BarChart2,
  Send,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';

export const SafetyRadarPage: React.FC = () => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [wrongWayEvents, setWrongWayEvents] = useState<any[]>([]);
  const [accidentEvents, setAccidentEvents] = useState<any[]>([]);
  const [impairedEvents, setImpairedEvents] = useState<any[]>([]);
  const [policeReported, setPoliceReported] = useState<{ [key: string]: boolean }>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [incData, wwData, accData, impData] = await Promise.all([
        fetchApi<SafetyIncident[]>('/incidents'),
        fetchApi<any[]>('/safety/wrongway'),
        fetchApi<any[]>('/safety/accidents'),
        fetchApi<any[]>('/safety/impaired')
      ]);
      setIncidents(incData);
      setWrongWayEvents(wwData);
      setAccidentEvents(accData);
      setImpairedEvents(impData);
    } catch (err) {
      console.warn('Fallback safety data loading:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerWrongWay = async () => {
    try {
      await fetchApi('/safety/wrongway/trigger', { method: 'POST' });
      loadData();
    } catch (err) {
      console.error('Trigger wrongway error:', err);
    }
  };

  const triggerAccident = async () => {
    try {
      await fetchApi('/safety/accidents/trigger', { method: 'POST' });
      loadData();
    } catch (err) {
      console.error('Trigger accident error:', err);
    }
  };

  const handlePoliceReport = (id: string) => {
    setPoliceReported((prev) => ({ ...prev, [id]: true }));
  };

  const handleResolveIncident = async (id: string) => {
    try {
      await fetchApi(`/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      loadData();
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    }
  };

  // Roadside Safety Awareness Stats
  const awarenessStats = [
    { day: 'MONDAY', count: 3 },
    { day: 'TUESDAY', count: 2 },
    { day: 'WEDNESDAY', count: 4 },
    { day: 'THURSDAY', count: 1 },
    { day: 'FRIDAY', count: 5 },
    { day: 'SATURDAY', count: 3 },
    { day: 'SUNDAY', count: 2 }
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/40">
              PAGE 2
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              SAFETY & EMERGENCY CENTER
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time computer vision detection for wrong-way vehicles, suspected impaired driving, collision response & public safety awareness.
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerWrongWay}
            className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Wrong-Way</span>
          </button>

          <button
            onClick={triggerAccident}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
            <span>Simulate Accident</span>
          </button>

          <button
            onClick={loadData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* WRONG ROUTE / WRONG-WAY DETECTION MODULE */}
      <div className="p-6 bg-slate-900/90 border border-rose-500/40 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              🚨 WRONG-WAY VEHICLE DETECTED
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/40">
            DEMO / SIMULATION AI TRACKER
          </span>
        </div>

        {/* Vector Direction Indicator Graphic */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">NORMAL TRAFFIC DIRECTION</span>
            <div className="text-emerald-400 font-mono font-bold text-lg tracking-widest">→ → → → → (Eastbound Lane)</div>
          </div>

          <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-center">
            <span className="text-rose-400 font-bold text-xs block">CONFLICTING VEHICLE VECTOR</span>
            <div className="text-rose-300 font-mono font-extrabold text-lg animate-pulse">← WRONG-WAY (Westbound)</div>
          </div>
        </div>

        {/* Wrong Way Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(wrongWayEvents.length > 0 ? wrongWayEvents : [
            {
              id: 'WW-CAM-01',
              timestamp: new Date().toISOString(),
              camera_id: 'CAM-J02-EAST',
              intersection_id: 'Junction 02 - Market Road',
              detected_direction: 'Westbound (Wrong-way)',
              expected_direction: 'Eastbound',
              severity: 'CRITICAL',
              evidence_status: 'VERIFIED_SIMULATION'
            }
          ]).map((ww) => (
            <div key={ww.id} className="p-4 bg-slate-950 border border-rose-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-bold font-mono text-rose-400">
                <span>EVENT ID: {ww.id}</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">{ww.severity} RISK</span>
              </div>
              <p className="text-white font-semibold">Location: {ww.intersection_id} ({ww.camera_id})</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-mono text-slate-400">
                <div>Direction Detected: <span className="text-rose-300 font-bold">{ww.detected_direction}</span></div>
                <div>Expected Direction: <span className="text-emerald-400 font-bold">{ww.expected_direction}</span></div>
              </div>

              {/* Simulated Camera Snapshot Placeholder */}
              <div className="mt-2 h-28 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[9px] font-mono bg-slate-950/80 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                  SNAPSHOT: {ww.camera_id} [DEMO IMAGE]
                </div>
                <div className="text-center space-y-1">
                  <Car className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
                  <span className="text-[10px] text-slate-500 font-mono">Simulated Vehicle Evidence Snapshot</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUSPECTED IMPAIRED DRIVING & ACCIDENT RESPONSE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 2: Suspected Impaired Driving */}
        <div className="p-6 bg-slate-900/90 border border-amber-500/40 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              SUSPECTED IMPAIRED DRIVING
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/40">
              BEHAVIORAL RISK SCORE
            </span>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            ⚠ <strong>Realistic System Notice:</strong> Camera vision tracks abnormal swerving trajectory, sudden braking, and speed variance. Scientific proof requires law enforcement breath testing.
          </div>

          {/* Impaired Driving Events List */}
          <div className="space-y-3">
            {(impairedEvents.length > 0 ? impairedEvents : [
              {
                id: 'IMP-8821',
                vehicle_id: 'KA-01-MJ-8821',
                location: 'Junction 05 - Tech Park Road',
                swerving_score: 86.4,
                risk_score: 82.5,
                status: 'MONITORING'
              }
            ]).map((imp) => {
              const isReported = policeReported[imp.id];
              return (
                <div key={imp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center font-bold text-amber-400 font-mono">
                    <span>VEHICLE: {imp.vehicle_id}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      RISK SCORE: {imp.risk_score}% (HIGH)
                    </span>
                  </div>
                  <p className="text-slate-300">Location: {imp.location}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                    <div>Swerving Index: <strong className="text-amber-300">{imp.swerving_score}%</strong></div>
                    <div>Speed Variation: <strong className="text-rose-400">ABNORMAL</strong></div>
                  </div>

                  {/* Police Control Room Report Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Prototype Reporting Workflow</span>
                    {isReported ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        REPORTED TO POLICE CONTROL ROOM
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePoliceReport(imp.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        REPORT TO AUTHORIZED POLICE CONTROL ROOM
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 3: Accident Detection & Emergency Dispatch */}
        <div className="p-6 bg-slate-900/90 border border-rose-500/40 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
              ACCIDENT DETECTION & EMERGENCY RESPONSE
            </h3>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold border border-rose-500/40">
              DISPATCH AUTOMATION
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Continuously monitors traffic feeds for sudden impact events, abrupt stops, and collision trajectories. Instantly broadcasts emergency response alerts.
          </p>

          {/* Accident Cards & Hospital Dispatch Status */}
          <div className="space-y-3">
            {(accidentEvents.length > 0 ? accidentEvents : [
              {
                id: 'ACC-104',
                timestamp: new Date().toISOString(),
                location: 'Junction 04 - Hospital Road',
                camera_id: 'CAM-C04-HD',
                severity: 'CRITICAL',
                emergency_dispatched: true,
                status: 'ACTIVE'
              }
            ]).map((acc) => (
              <div key={acc.id} className="p-4 bg-slate-950 border border-rose-500/50 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold font-mono text-rose-400">
                  <span>🚨 ACCIDENT EVENT: {acc.id}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">SEVERITY: {acc.severity}</span>
                </div>
                <p className="text-white font-semibold">Location: {acc.location} ({acc.camera_id})</p>

                {/* Automated Dispatch Status Timeline */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AUTOMATED EMERGENCY RESPONSE STATUS (DEMO)</span>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-emerald-300 font-bold">
                      <Building2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                      Hospital Notification: <br /><span className="text-emerald-400">SENT</span>
                    </div>
                    <div className="p-2 bg-cyan-500/15 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold">
                      <Siren className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
                      Ambulance Request: <br /><span className="text-cyan-400">DISPATCHED</span>
                    </div>
                    <div className="p-2 bg-rose-500/15 border border-rose-500/40 rounded-lg text-rose-300 font-bold">
                      <Radio className="w-3.5 h-3.5 mx-auto mb-1 text-rose-400" />
                      Control Room: <br /><span className="text-rose-400">ALERTED</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PUBLIC SAFETY AWARENESS BOARD */}
      <div className="p-6 bg-slate-900/90 border border-cyan-500/40 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              ROAD SAFETY AWARENESS BOARD (ROADSIDE LED DISPLAY)
            </h3>
            <p className="text-xs text-slate-400">
              Digital public safety stats chart & community safety guidelines.
            </p>
          </div>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-cyan-500/40">
            PUBLIC BOARD DEMO
          </span>
        </div>

        {/* Day-by-day Accident Statistics Chart */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs pt-2">
          {awarenessStats.map((item) => (
            <div key={item.day} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block">{item.day}</span>
              <div className="h-16 bg-slate-900 rounded-lg flex items-end justify-center p-1 relative">
                <div
                  className="w-full bg-cyan-500/60 rounded-t-md transition-all"
                  style={{ height: `${item.count * 18}%` }}
                ></div>
              </div>
              <span className="font-extrabold text-cyan-300 text-sm">{item.count} Incidents</span>
            </div>
          ))}
        </div>

        {/* Digital Banners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs pt-2">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl font-extrabold text-cyan-300 tracking-wider">
            DRIVE SAFELY
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl font-extrabold text-emerald-300 tracking-wider">
            FOLLOW TRAFFIC SIGNALS
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl font-extrabold text-rose-300 tracking-wider">
            DO NOT DRIVE AGAINST TRAFFIC
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl font-extrabold text-amber-300 tracking-wider">
            REPORT ROAD HAZARDS
          </div>
        </div>
      </div>

      {/* PAGE 2 SAFETY EVENT HISTORY MASTER LOG */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Page 2 Safety Event History Master Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">Total Logged: {incidents.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Event ID</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Action Taken</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Resolve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {incidents.map((inc) => {
                const isResolved = inc.status === 'RESOLVED';
                return (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString() : 'Recent'}</td>
                    <td className="p-4 font-mono font-bold text-white">{inc.id}</td>
                    <td className="p-4 font-semibold text-cyan-300">{inc.incident_type}</td>
                    <td className="p-4">{inc.location}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          inc.severity === 'CRITICAL' || inc.severity === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{inc.details}</td>
                    <td className="p-4 font-semibold">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${isResolved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {!isResolved ? (
                        <button
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RESOLVE</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">RESOLVED</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
