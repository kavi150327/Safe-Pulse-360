import React, { useEffect, useState } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OptimizationModal } from './components/OptimizationModal';
import { DashboardPage } from './pages/DashboardPage';
import { DemosShowcasePage } from './pages/DemosShowcasePage';
import { LiveTrafficPage } from './pages/LiveTrafficPage';
import { IntersectionsPage } from './pages/IntersectionsPage';
import { PredictionPage } from './pages/PredictionPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { EmergencyCorridorPage } from './pages/EmergencyCorridorPage';
import { SafetyRadarPage } from './pages/SafetyRadarPage';
import { RailwaySafetyPage } from './pages/RailwaySafetyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SystemMonitoringPage } from './pages/SystemMonitoringPage';
import { DashboardKpis, IntersectionData, OptimizationResult, fetchApi } from './lib/api';
import { Toaster } from './components/ui/toaster';

const INITIAL_INTERSECTIONS: IntersectionData[] = [
  { id: 'I1', name: 'Central Junction', x_pos: 300, y_pos: 180, traffic_density: 65, queue_length: 18, avg_wait_time: 38, avg_speed: 28, current_green_time: 30, current_red_time: 40, recommended_green_time: 45, signal_phase: 'GREEN', signal_timer: 18, status: 'NORMAL' },
  { id: 'I2', name: 'Market Road', x_pos: 600, y_pos: 180, traffic_density: 82, queue_length: 34, avg_wait_time: 56, avg_speed: 18, current_green_time: 25, current_red_time: 50, recommended_green_time: 40, signal_phase: 'RED', signal_timer: 24, status: 'CONGESTED' },
  { id: 'I3', name: 'Railway Junction', x_pos: 850, y_pos: 340, traffic_density: 54, queue_length: 14, avg_wait_time: 31, avg_speed: 34, current_green_time: 35, current_red_time: 35, recommended_green_time: 35, signal_phase: 'GREEN', signal_timer: 12, status: 'NORMAL' },
  { id: 'I4', name: 'Hospital Road', x_pos: 300, y_pos: 480, traffic_density: 48, queue_length: 10, avg_wait_time: 22, avg_speed: 40, current_green_time: 40, current_red_time: 30, recommended_green_time: 35, signal_phase: 'GREEN', signal_timer: 20, status: 'NORMAL' },
  { id: 'I5', name: 'Tech Park', x_pos: 600, y_pos: 480, traffic_density: 74, queue_length: 26, avg_wait_time: 45, avg_speed: 22, current_green_time: 30, current_red_time: 45, recommended_green_time: 42, signal_phase: 'RED', signal_timer: 15, status: 'NORMAL' },
  { id: 'I6', name: 'Highway Junction', x_pos: 150, y_pos: 340, traffic_density: 58, queue_length: 16, avg_wait_time: 29, avg_speed: 36, current_green_time: 35, current_red_time: 35, recommended_green_time: 38, signal_phase: 'GREEN', signal_timer: 22, status: 'NORMAL' }
];

export function App() {
  const [location, setLocation] = useHashLocation();
  const [kpis, setKpis] = useState<DashboardKpis | null>({
    disclaimer: "SIMULATION ENGINE ACTIVE",
    system_status: "ONLINE",
    kpis: {
      traffic_density: 63.5,
      avg_wait_time_sec: 34.8,
      congestion_level: "MODERATE",
      total_queue_vehicles: 114,
      active_incidents: 2,
      active_emergency_vehicles: 1,
      fuel_saved_liters: 24.5,
      co2_reduced_kg: 56.6,
      railway_risk_status: "SAFE"
    },
    latest_optimization: {
      run_id: "OPT-QUBO-01",
      objective_value: 18.4,
      execution_time_ms: 42.5
    }
  });
  const [intersections, setIntersections] = useState<IntersectionData[]>(INITIAL_INTERSECTIONS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isOptModalOpen, setIsOptModalOpen] = useState(false);
  const [latestOptResult, setLatestOptResult] = useState<OptimizationResult | null>(null);

  // Poll backend data every 3 seconds
  const refreshData = async () => {
    try {
      const [kRes, iRes] = await Promise.all([
        fetchApi<DashboardKpis>('/dashboard'),
        fetchApi<IntersectionData[]>('/intersections')
      ]);
      if (kRes && kRes.kpis) setKpis(kRes);
      if (iRes && Array.isArray(iRes) && iRes.length > 0) setIntersections(iRes);
      setIsBackendConnected(true);
    } catch (err) {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDb = async () => {
    try {
      await fetchApi('/reset', { method: 'POST' });
      await refreshData();
    } catch (err) {
      console.error('Failed to reset database:', err);
    }
  };

  const handleTriggerOpt = () => {
    setIsOptModalOpen(true);
  };

  const handleOptDone = (res: OptimizationResult) => {
    setLatestOptResult(res);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        systemStatus={kpis?.system_status || 'ONLINE'}
        onReset={handleResetDb}
        isBackendConnected={isBackendConnected}
      />

      {/* Optimization Modal */}
      <OptimizationModal
        isOpen={isOptModalOpen}
        onClose={() => setIsOptModalOpen(false)}
        result={latestOptResult}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Router hook={useHashLocation}>
            <Switch>
              <Route path="/">
                <LiveTrafficPage intersections={intersections} onRefresh={refreshData} />
              </Route>

              <Route path="/dashboard">
                <DashboardPage
                  kpis={kpis}
                  intersections={intersections}
                  onNavigate={(href) => setLocation(href)}
                  onRunOptimization={handleTriggerOpt}
                />
              </Route>

              <Route path="/demos">
                <DemosShowcasePage />
              </Route>

              <Route path="/traffic">
                <LiveTrafficPage intersections={intersections} onRefresh={refreshData} />
              </Route>

              <Route path="/intersections">
                <IntersectionsPage
                  intersections={intersections}
                  onRunOptimization={handleTriggerOpt}
                />
              </Route>

              <Route path="/prediction">
                <PredictionPage />
              </Route>

              <Route path="/optimization">
                <OptimizationPage
                  latestResult={latestOptResult}
                  onOptimizationDone={handleOptDone}
                />
              </Route>

              <Route path="/emergency">
                <EmergencyCorridorPage
                  intersections={intersections}
                  onCorridorActivated={() => refreshData()}
                />
              </Route>

              <Route path="/safety">
                <SafetyRadarPage />
              </Route>

              <Route path="/railway">
                <RailwaySafetyPage />
              </Route>

              <Route path="/analytics">
                <AnalyticsPage />
              </Route>

              <Route path="/history">
                <HistoryPage />
              </Route>

              <Route path="/system">
                <SystemMonitoringPage onResetDb={handleResetDb} />
              </Route>
            </Switch>
          </Router>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default App;