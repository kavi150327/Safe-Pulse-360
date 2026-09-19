const API_BASE = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : 'http://127.0.0.1:8000/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[SafePulse API Warning] Failed to reach ${endpoint}:`, err);
    throw err;
  }
}

export type IntersectionData = {
  id: string;
  name: string;
  x_pos: number;
  y_pos: number;
  traffic_density: number;
  queue_length: number;
  avg_wait_time: number;
  avg_speed: number;
  current_green_time: number;
  current_red_time: number;
  recommended_green_time: number;
  signal_phase: 'GREEN' | 'YELLOW' | 'RED';
  signal_timer: number;
  status: 'NORMAL' | 'CONGESTED' | 'EMERGENCY' | 'RAILWAY_WARN';
  approaches?: { dir: string; cars: number; queue: number; wait: number; signal: string }[];
};

export type DashboardKpis = {
  disclaimer: string;
  system_status: string;
  kpis: {
    traffic_density: number;
    avg_wait_time_sec: number;
    congestion_level: 'LIGHT' | 'MODERATE' | 'HEAVY';
    total_queue_vehicles: number;
    active_incidents: number;
    active_emergency_vehicles: number;
    fuel_saved_liters: number;
    co2_reduced_kg: number;
    railway_risk_status: 'SAFE' | 'CAUTION' | 'HIGH RISK';
  };
  latest_optimization: {
    run_id: string;
    objective_value: number;
    execution_time_ms: number;
  };
};

export type OptimizationResult = {
  run_id: string;
  timestamp: string;
  algorithm: string;
  execution_time_ms: number;
  iterations: number;
  objective_value: number;
  weights: Record<string, number>;
  before_metrics: {
    avg_wait_time: number;
    queue_length: number;
    congestion: number;
    fuel_liters: number;
    co2_kg: number;
    emergency_delay: number;
  };
  after_metrics: {
    avg_wait_time: number;
    queue_length: number;
    congestion: number;
    fuel_liters: number;
    co2_kg: number;
    emergency_delay: number;
  };
  improvements: {
    wait_time_pct: number;
    queue_pct: number;
    congestion_pct: number;
    fuel_pct: number;
    co2_pct: number;
    emergency_delay_pct: number;
  };
  recommended_signal_plan: Record<string, number>;
};

export type PredictionItem = {
  intersection_id: string;
  intersection_name: string;
  current_density: number;
  predicted_density: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  confidence_score: number;
  method: string;
  explanation: string;
};

export type SafetyIncident = {
  id: string;
  timestamp: string;
  incident_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  details: string;
  status: 'NEW' | 'MONITORING' | 'RESOLVED';
};

export type EmergencyEvent = {
  id: string;
  timestamp: string;
  vehicle_type: string;
  start: string;
  destination: string;
  route: string[];
  normal_eta_sec: number;
  optimized_eta_sec: number;
  time_saved_sec: number;
  status: string;
};

export type RailwayStatus = {
  crossing_name: string;
  gate_status: 'OPEN' | 'CLOSING' | 'CLOSED' | 'OPENING';
  risk_level: 'SAFE' | 'CAUTION' | 'HIGH RISK';
  train_detected: boolean;
  details: string;
  last_updated?: string;
};

export type SystemEvent = {
  id: number;
  timestamp: string;
  event_type: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
};
