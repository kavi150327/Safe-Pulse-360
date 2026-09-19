import React, { useState } from 'react';
import { EmergencyEvent, IntersectionData, fetchApi } from '../lib/api';
import { TrafficMap } from '../components/TrafficMap';
import { Ambulance, Siren, ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';

interface EmergencyCorridorPageProps {
  intersections: IntersectionData[];
  onCorridorActivated: (route: string[]) => void;
}

export const EmergencyCorridorPage: React.FC<EmergencyCorridorPageProps> = ({
  intersections,
  onCorridorActivated
}) => {
  const [start, setStart] = useState('I5');
  const [dest, setDest] = useState('I4');
  const [vehicleType, setVehicleType] = useState('Ambulance');
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<EmergencyEvent>('/emergency/activate', {
        method: 'POST',
        body: JSON.stringify({
          start_intersection: start,
          destination_intersection: dest,
          vehicle_type: vehicleType
        })
      });
      setActiveEvent(res);
      onCorridorActivated(res.route);
    } catch (err) {
      console.error('Failed to activate corridor:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableIntersections = (intersections && intersections.length > 0) ? intersections : [
    { id: 'I1', name: 'Central Junction' },
    { id: 'I2', name: 'Market Road' },
    { id: 'I3', name: 'Railway Junction' },
    { id: 'I4', name: 'Hospital Road' },
    { id: 'I5', name: 'Tech Park' },
    { id: 'I6', name: 'Highway Junction' }
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-cyan-400" />
            Emergency Green Corridor Control
          </h1>
          <p className="text-xs text-slate-400">
            Dijkstra shortest-path routing & dynamic signal green waves for emergency response vehicles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
            Corridor Configuration
          </h3>

          <div className="space-y-4 text-xs">
            {/* Vehicle Type */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-medium"
              >
                <option value="Ambulance">Ambulance (Code 3)</option>
                <option value="Fire Truck">Fire Truck Heavy Engine</option>
                <option value="Police">Police Escort Patrol</option>
              </select>
            </div>

            {/* Start Junction */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Start Intersection</label>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-medium"
              >
                {availableIntersections.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} - {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Junction */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Destination Intersection</label>
              <select
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-medium"
              >
                {availableIntersections.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} - {i.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleActivate}
              disabled={loading || start === dest}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>ACTIVATE GREEN CORRIDOR</span>
            </button>
          </div>

          {/* Active Event Summary */}
          {activeEvent && (
            <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-cyan-300 border-b border-slate-800 pb-2">
                <span>Green Corridor Active</span>
                <span>ID: {activeEvent.id}</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <p>Normal ETA: <span className="line-through text-slate-500">{activeEvent.normal_eta_sec}s</span></p>
                <p>Optimized Green Wave ETA: <strong className="text-emerald-400">{activeEvent.optimized_eta_sec}s</strong></p>
                <p>Time Saved: <strong className="text-cyan-400">+{activeEvent.time_saved_sec}s saved</strong></p>
                <p>Intersections Cleared: <strong>{activeEvent.route?.length}</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-2 space-y-3">
          <TrafficMap
            intersections={intersections}
            activeRoute={activeEvent?.route || [start, dest]}
          />
        </div>
      </div>
    </div>
  );
};
