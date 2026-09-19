import React, { useEffect, useState } from 'react';
import { Activity, Radio, Cpu, RefreshCw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  systemStatus: string;
  onReset: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ systemStatus, onReset, isBackendConnected }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-6 flex items-center justify-between shadow-lg">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              SAFE PULSE 360
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SIMULATION PROTOTYPE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Intelligent Urban Safety & Traffic Command Center
          </p>
        </div>
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-6">
        {/* System Status Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-emerald-400 font-bold">
            SafePulse Engine Online
          </span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 font-mono text-sm text-cyan-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{timeStr || '12:00:00'} UTC</span>
        </div>

        {/* System Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
          title="Reset Database & Simulation"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset DB</span>
        </button>
      </div>
    </header>
  );
};
