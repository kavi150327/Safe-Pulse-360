import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { OptimizationResult } from '../lib/api';

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: OptimizationResult | null;
}

const STAGES = [
  'TRAFFIC DATA COLLECTED',
  'ANALYZING CONGESTION',
  'BUILDING QUBO',
  'SEARCHING SOLUTIONS',
  'VALIDATING CONSTRAINTS',
  'CLASSICAL REFINEMENT',
  'OPTIMAL SIGNAL PLAN',
  'SIGNALS UPDATED'
];

export const OptimizationModal: React.FC<OptimizationModalProps> = ({ isOpen, onClose, result }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      setIsFinished(false);
      return;
    }

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < STAGES.length) {
        setCurrentStageIdx(idx);
      } else {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <Cpu className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Quantum-Inspired QUBO Optimization
              </h2>
              <p className="text-xs text-slate-400">
                Classical Simulated Annealing & Matrix Cost Minimization
              </p>
            </div>
          </div>
          {isFinished && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stage Progress Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Optimization Stage {Math.min(currentStageIdx + 1, STAGES.length)} of {STAGES.length}</span>
            <span className="text-cyan-400">{Math.round(((currentStageIdx + 1) / STAGES.length) * 100)}%</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIdx || isFinished;
              const isCurrent = idx === currentStageIdx && !isFinished;

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 animate-pulse'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-600 shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results Summary Box when Finished */}
        {isFinished && result && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Optimization Complete
              </span>
              <span>Run ID: {result.run_id}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-slate-400 text-[10px]">Execution Time</p>
                <p className="font-bold text-white text-sm">{result.execution_time_ms} ms</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-slate-400 text-[10px]">Iterations</p>
                <p className="font-bold text-white text-sm">{result.iterations}</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <p className="text-slate-400 text-[10px]">Wait Time Reduction</p>
                <p className="font-bold text-emerald-400 text-sm">-{result.improvements.wait_time_pct}%</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all"
              >
                Apply & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
