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

export function App() {
  const [location, setLocation] = useHashLocation();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [intersections, setIntersections] = useState<IntersectionData[]>([]);
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
      setKpis(kRes);
      setIntersections(iRes);
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