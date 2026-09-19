import React, { useEffect, useState } from 'react';
import { PredictionItem, fetchApi } from '../lib/api';
import { TrendingUp, Info, Activity, ShieldCheck, Sparkles, RefreshCw, Calendar, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const PredictionPage: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'Random Forest' | 'XGBoost' | 'LSTM'>('Random Forest');
  const [dayType, setDayType] = useState<string>('Working Day');

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<{ predictions: PredictionItem[] }>('/predictions');
      setPredictions(data.predictions);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            AI & ML Traffic Prediction Engine
          </h1>
          <p className="text-xs text-slate-400">
            Predict upcoming traffic conditions before congestion develops using historical & real-time time-series data.
          </p>
        </div>

        <button
          onClick={loadPredictions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RE-RUN FORECAST</span>
        </button>
      </div>

      {/* Model & Special Day Config Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ML Model Selector Card */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Model Architecture Selector
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
              Active: {selectedModel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['Random Forest', 'XGBoost', 'LSTM'] as const).map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`p-2.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedModel === model
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Sunday / Festival / Event Day Selector Card */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Day Type / Special Event Condition
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
              {dayType}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['Working Day', 'Weekend', 'Festival', 'Celebration'].map((dt) => (
              <button
                key={dt}
                onClick={() => setDayType(dt)}
                className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                  dayType === dt
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {dt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS Explanation Box */}
      <div className="p-5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>HOW IT WORKS — Traffic Prediction Pipeline</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Input features (Time, Day Type, Vehicle Counts, School Hours 7:30–9:00 AM / 4:00–5:30 PM, Weather, Historical Trends) are processed by the selected <strong className="text-cyan-300">{selectedModel}</strong> engine. Instead of reacting to congestion after gridlock forms, signals are pre-adjusted 5–10 minutes ahead of peak arrival.
        </p>
      </div>

      {/* Grid of Intersection Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((pred) => {
          const isIncreasing = pred.trend === 'INCREASING';
          const isDecreasing = pred.trend === 'DECREASING';

          const chartData = [
            { t: 't-15m', val: Math.max(10, pred.current_density - 8) },
            { t: 't-10m', val: Math.max(10, pred.current_density - 4) },
            { t: 't-5m', val: pred.current_density - 2 },
            { t: 'Current', val: pred.current_density },
            { t: '+5m (Pred)', val: pred.predicted_density },
          ];

          return (
            <div
              key={pred.intersection_id}
              className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{pred.intersection_name}</h3>
                  <span className="text-[10px] text-slate-400">ID: {pred.intersection_id}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isIncreasing
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : isDecreasing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  {pred.trend}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Current Density</p>
                  <p className="text-lg font-bold text-white">{Math.round(pred.current_density)}%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Next 5-10m Forecast</p>
                  <p className="text-lg font-bold text-cyan-400">{Math.round(pred.predicted_density)}%</p>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`grad-${pred.intersection_id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${pred.intersection_id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Confidence: <strong className="text-emerald-400">{pred.confidence_score}%</strong></span>
                <span className="text-[10px]">Model: {selectedModel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
