import React, { useState, useEffect } from 'react';
import { CameraDetectorCanvas, DetectionMode } from '../components/CameraDetectorCanvas';
import { fetchApi } from '../lib/api';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Bus,
  Truck,
  TrendingUp,
  ShieldAlert,
  TrainFront,
  Smartphone,
  Cpu,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DemosShowcasePage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<number>(1);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [demoLog, setDemoLog] = useState<string[]>([]);
  const [demoStatus, setDemoStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS'>('IDLE');

  // Interactive Demo Parameters
  const [schoolBusDetected, setSchoolBusDetected] = useState(false);
  const [heavyPlatoonActive, setHeavyPlatoonActive] = useState(false);
  const [ambulanceCorridorActive, setAmbulanceCorridorActive] = useState(false);
  const [eventDayType, setEventDayType] = useState('Festival');
  const [wrongWayCaptured, setWrongWayCaptured] = useState(false);
  const [accidentDispatched, setAccidentDispatched] = useState(false);
  const [railwayIntruderAlert, setRailwayIntruderAlert] = useState(false);
  const [pedestrianWarningTriggered, setPedestrianWarningTriggered] = useState(false);

  const demoList = [
    {
      id: 1,
      title: 'Demo 1: Normal Traffic Detection & Adaptive Signal',
      icon: CameraDetectorCanvas,
      description: 'Roadside cameras capture traffic. YOLO detects vehicles (Cars, Bikes, Buses, Pedestrians) & counts density per approach to adapt signal green duration.',
      mode: 'NORMAL' as DetectionMode
    },
    {
      id: 2,
      title: 'Demo 2: School & College Vehicle Priority',
      icon: Bus,
      description: 'Detects school/college buses during peak school hours (7:30–9:00 AM & 4:00–5:30 PM) and adjusts signal timing, enforcing Emergency > School > Heavy > Normal priority.',
      mode: 'SCHOOL_BUS' as DetectionMode
    },
    {
      id: 3,
      title: 'Demo 3: Heavy Vehicle Fuel Optimization',
      icon: Truck,
      description: 'Detects heavy freight vehicle platoons and optimizes timing via QUBO formulation to minimize frequent braking, stopping, idling, and fuel consumption.',
      mode: 'HEAVY_PLATOON' as DetectionMode
    },
    {
      id: 4,
      title: 'Demo 4: Emergency Vehicle Green Corridor',
      icon: Siren,
      description: 'Trigger Ambulance Mode. Generates a green wave across Hospital → Signal 1 (GREEN) → Signal 2 (Prepare GREEN) → Signal 3 (Prepare GREEN).',
      mode: 'EMERGENCY' as DetectionMode
    },
    {
      id: 5,
      title: 'Demo 5: Sunday / Festival / Celebration Prediction',
      icon: TrendingUp,
      description: 'Predicts traffic patterns for special days (Sunday, Festival, Public Gatherings) ahead of time and pre-adjusts signal schedules before congestion builds up.',
      mode: 'NORMAL' as DetectionMode
    },
    {
      id: 6,
      title: 'Demo 6: Wrong-Way Vehicle Detection',
      icon: AlertTriangle,
      description: 'Tracks vehicle trajectories against expected direction. Detects wrong-way vector, logs timestamped camera evidence, and alerts traffic control.',
      mode: 'WRONG_WAY' as DetectionMode
    },
    {
      id: 7,
      title: 'Demo 7: Accident Detection & Dispatch',
      icon: ShieldAlert,
      description: 'AI model detects collision patterns, sudden abrupt stops, and abnormal trajectories. Generates incident report & dispatches nearest emergency unit.',
      mode: 'ACCIDENT' as DetectionMode
    },
    {
      id: 8,
      title: 'Demo 8: Railway Crossing IoT Safety Sensor',
      icon: TrainFront,
      description: 'When railway gate is CLOSED for an approaching train, IoT sensors detect any vehicle or pedestrian attempting to cross and sound the warning siren buzzer.',
      mode: 'NORMAL' as DetectionMode
    },
    {
      id: 9,
      title: 'Demo 9: Distracted Pedestrian Crosswalk Warning',
      icon: Smartphone,
      description: 'Detects pedestrians using mobile phones crossing during a RED signal. Triggers visual LED warning board: 🚨 WARNING | PLEASE STOP | RED SIGNAL.',
      mode: 'PEDESTRIAN_DISTRACTED' as DetectionMode
    }
  ];

  const logMessage = (msg: string) => {
    setDemoLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const runDemoStep = async (demoId: number) => {
    setActiveDemo(demoId);
    setDemoStatus('RUNNING');

    switch (demoId) {
      case 1:
        logMessage('Demo 1: Camera scanning North, East, South, West approaches...');
        logMessage('YOLO Counts: South Road highest density (52 vehicles).');
        logMessage('Optimization Engine: Extended South approach green duration to 45 sec.');
        break;
      case 2:
        logMessage('Demo 2: School Bus detected on North Approach (Time: 08:15 AM).');
        setSchoolBusDetected(true);
        logMessage('Priority Matrix: Emergency (Prio 1) > School Bus (Prio 2).');
        logMessage('Signal adjusted: North approach green light extended +15 seconds for school bus.');
        break;
      case 3:
        logMessage('Demo 3: Heavy freight vehicle platoon detected (3 trucks).');
        setHeavyPlatoonActive(true);
        logMessage('QUBO Objective: Min (Waiting Time + Queue + Idling/Fuel Cost).');
        logMessage('Continuous green window granted: Saves estimated ~4.2 Liters of diesel fuel.');
        break;
      case 4:
        logMessage('Demo 4: 🚑 AMBULANCE MODE TRIGGERED (Hospital -> Accident Location).');
        setAmbulanceCorridorActive(true);
        try {
          await fetchApi('/emergency/activate', {
            method: 'POST',
            body: JSON.stringify({ start_intersection: 'I5', destination_intersection: 'I4', vehicle_type: 'Ambulance' })
          });
        } catch (e) {}
        logMessage('Green Corridor Activated: Signal 1 (I5) -> GREEN | Signal 2 (I1) -> Prepare GREEN | Signal 3 (I4) -> Prepare GREEN.');
        logMessage('Saved 85 seconds estimated ETA delay!');
        break;
      case 5:
        logMessage(`Demo 5: Day type switched to [${eventDayType}].`);
        logMessage('Historical ML Predictor: Peak traffic anticipated at 10 AM, 1 PM, 6 PM.');
        logMessage('Pre-adjustment applied: Extended green timing pre-allocated prior to peak arrival.');
        break;
      case 6:
        logMessage('Demo 6: 🚨 WRONG-WAY VECTOR DETECTED!');
        setWrongWayCaptured(true);
        try {
          await fetchApi('/safety/wrongway/trigger', { method: 'POST' });
        } catch (e) {}
        logMessage('Camera CAM-I2-EAST captured timestamped evidence photo.');
        logMessage('Alert dispatched to Traffic Police Control Room.');
        break;
      case 7:
        logMessage('Demo 7: 💥 ACCIDENT COLLISION DETECTED at Junction I4!');
        setAccidentDispatched(true);
        try {
          await fetchApi('/safety/accidents/trigger', { method: 'POST' });
        } catch (e) {}
        logMessage('AI Anomaly Score: 98.7% Sudden Stop & Collision Trajectory.');
        logMessage('Emergency SOS Dispatch: Hospital unit notified (ETA: 4 mins).');
        break;
      case 8:
        logMessage('Demo 8: 🚆 TRAIN APPROACHING -> Railway Crossing Gate LOWERED (CLOSED).');
        setRailwayIntruderAlert(true);
        try {
          await fetchApi('/railway/simulate', { method: 'POST', body: JSON.stringify({ action: 'TRIGGER' }) });
        } catch (e) {}
        logMessage('IoT Dual Infrared Sensor: Intruder detected attempting to cross closed barrier!');
        logMessage('🚨 SIREN BUZZER ACTIVE! Warning sound & red flashing LEDs activated.');
        break;
      case 9:
        logMessage('Demo 9: RED SIGNAL ACTIVE at Crosswalk CW-01.');
        setPedestrianWarningTriggered(true);
        logMessage('Vision Engine: Pedestrian detected with phone device (Distracted behaviour).');
        logMessage('🚨 LED WARNING BOARD DISPLAYED: "WARNING! PLEASE STOP! RED SIGNAL - DO NOT CROSS"');
        break;
    }

    setTimeout(() => {
      setDemoStatus('SUCCESS');
    }, 1200);
  };

  const handlePlayAll = async () => {
    setIsPlayingAll(true);
    for (let id = 1; id <= 9; id++) {
      await new Promise((res) => setTimeout(res, 300));
      await runDemoStep(id);
      await new Promise((res) => setTimeout(res, 2800));
    }
    setIsPlayingAll(false);
  };

  const currDemoInfo = demoList.find((d) => d.id === activeDemo) || demoList[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            SafePulse-360 — Interactive 9-Demo Working Suite
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive step-by-step working demonstrations for traffic optimization & urban safety extension modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={isPlayingAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isPlayingAll
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-950/50'
            }`}
          >
            <Play className={`w-4 h-4 ${isPlayingAll ? 'animate-spin' : ''}`} />
            <span>{isPlayingAll ? 'Executing 9 Demos Flow...' : 'PLAY ALL 9 DEMOS IN SEQUENCE'}</span>
          </button>
        </div>
      </div>

      {/* Demo Selector Grid (1 to 9) */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {demoList.map((demo) => {
          const isActive = activeDemo === demo.id;
          return (
            <button
              key={demo.id}
              onClick={() => runDemoStep(demo.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1 ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Demo {demo.id}</span>
              <span className="text-xs font-bold truncate max-w-full">{demo.title.split(':')[1]?.trim() || demo.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Demo Showcase Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vision Stream & Animation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center border border-cyan-500/30">
                    {currDemoInfo.id}
                  </span>
                  {currDemoInfo.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{currDemoInfo.description}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                  demoStatus === 'RUNNING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {demoStatus === 'RUNNING' ? 'SIMULATION ACTIVE' : 'READY / COMPLETED'}
              </span>
            </div>

            {/* YOLO Camera Canvas Component */}
            <CameraDetectorCanvas mode={currDemoInfo.mode} intersectionName="Junction I1 - Central Node" />
          </div>

          {/* Special Visual Demo Interactive Cards */}
          {activeDemo === 2 && (
            <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-4 h-4" /> School & College Bus Priority Hierarchy Matrix
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-lg">
                  <p className="text-rose-300 font-bold">1. Emergency</p>
                  <p className="text-[10px] text-slate-400">Highest Override</p>
                </div>
                <div className="p-2.5 bg-amber-950/50 border border-amber-500/60 rounded-lg ring-1 ring-amber-500">
                  <p className="text-amber-300 font-bold">2. School Bus</p>
                  <p className="text-[10px] text-slate-400">High Priority Active</p>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <p className="text-slate-300 font-bold">3. Heavy Freight</p>
                  <p className="text-[10px] text-slate-400">Medium Priority</p>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <p className="text-slate-400 font-bold">4. Mixed Traffic</p>
                  <p className="text-[10px] text-slate-400">Adaptive Base</p>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 4 && (
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/50 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Siren className="w-4 h-4 text-rose-400 animate-bounce" /> Green Wave Signal Synchronization
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold">
                  <p className="text-[10px] text-slate-400">Signal 1 (I5)</p>
                  <p className="text-base">GREEN (Active)</p>
                </div>
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold">
                  <p className="text-[10px] text-slate-400">Signal 2 (I1)</p>
                  <p className="text-base">Prepare GREEN</p>
                </div>
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold">
                  <p className="text-[10px] text-slate-400">Signal 3 (I4)</p>
                  <p className="text-base">Prepare GREEN</p>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 5 && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200">Special Event Day Selector</h4>
                <div className="flex gap-2">
                  {['Working Day', 'Weekend', 'Festival', 'Sports Event'].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setEventDayType(d);
                        runDemoStep(5);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        eventDayType === d ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Predicted Peak Times for <strong className="text-cyan-300">{eventDayType}</strong>: 10:00 AM (High), 1:00 PM (Very High), 6:00 PM (Very High). Pre-adjusted timing active.
              </p>
            </div>
          )}

          {activeDemo === 6 && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Recorded Wrong-Way Evidence Card
                </h4>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">CONFIRMED EVIDENCE</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
                <div className="p-2 bg-slate-950 rounded">Camera: CAM-I2-EAST</div>
                <div className="p-2 bg-slate-950 rounded">Location: I2 Market Rd</div>
                <div className="p-2 bg-slate-950 rounded">Vector: Westbound</div>
                <div className="p-2 bg-slate-950 rounded text-rose-400 font-bold">Status: Alert Dispatched</div>
              </div>
            </div>
          )}

          {activeDemo === 7 && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/80 rounded-xl space-y-3 animate-pulse">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                ⚠ ACCIDENT DETECTED — EMERGENCY DISPATCH ACTIVE
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                Location: Junction 04 | Time: 10:32 AM | Severity: HIGH | Camera: C04 | Ambulance Unit #04 Dispatched (ETA 4 min)
              </p>
            </div>
          )}

          {activeDemo === 8 && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <TrainFront className="w-4 h-4 text-amber-400 animate-bounce" /> Railway Safety IoT Sensor & Siren Module
                </h4>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded animate-pulse">
                  SIREN BUZZER ACTIVE 🚨
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gate Status: <strong className="text-rose-400">CLOSED</strong> | Intruder detected by Dual IR Sensors on Left & Right approaches!
              </p>
            </div>
          )}

          {activeDemo === 9 && (
            <div className="p-5 bg-slate-950 border-2 border-rose-500 rounded-xl text-center space-y-2 shadow-2xl shadow-rose-950">
              <h4 className="text-lg font-black text-rose-500 tracking-wider animate-pulse flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-400" /> 🚨 WARNING BOARD TRIGGERED
              </h4>
              <div className="py-3 px-4 bg-rose-950/80 border border-rose-500/80 rounded-lg text-white font-mono text-sm font-bold">
                PLEASE STOP! RED SIGNAL - DO NOT CROSS!
              </div>
              <p className="text-[11px] text-slate-400">Crosswalk camera detected distracted pedestrian using mobile device during RED phase.</p>
            </div>
          )}
        </div>

        {/* Right Column: Execution Terminal Log */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Live Demo Command Terminal
              </span>
              <button
                onClick={() => setDemoLog([])}
                className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </h3>

            <div className="mt-3 p-3 bg-slate-950 border border-slate-800/80 rounded-lg font-mono text-[11px] text-slate-300 space-y-2 h-[340px] overflow-y-auto">
              {demoLog.length === 0 ? (
                <p className="text-slate-600 italic">No events logged yet. Click any demo button above to trigger physical simulation.</p>
              ) : (
                demoLog.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-cyan-400">&gt;</span>
                    <span className={log.includes('🚨') || log.includes('CRITICAL') || log.includes('ACCIDENT') ? 'text-rose-400 font-bold' : log.includes('Saved') || log.includes('Green Corridor') ? 'text-emerald-300' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Active Demo Step</span>
              <span className="text-cyan-300 font-bold">{activeDemo} of 9</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${(activeDemo / 9) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
