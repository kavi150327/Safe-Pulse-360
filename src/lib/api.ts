const API_BASE = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : 'http://127.0.0.1:8000/api';

// In-memory simulation state for standalone cloud hosting
let simulatedJunctionState = {
  day_type: "Working Day",
  roads: [
    { road: 'NORTH ROAD', direction: 'North', total_vehicles: 35, bikes: 12, cars: 15, buses: 3, school_buses: 1, heavy_vehicles: 5, emergency_vehicles: 0, density: 'MEDIUM', queue_meters: 145, avg_wait_sec: 38, signal: 'GREEN', countdown: 45 },
    { road: 'EAST ROAD', direction: 'East', total_vehicles: 18, bikes: 8, cars: 7, buses: 1, school_buses: 0, heavy_vehicles: 2, emergency_vehicles: 0, density: 'LOW', queue_meters: 65, avg_wait_sec: 18, signal: 'RED', countdown: 18 },
    { road: 'SOUTH ROAD', direction: 'South', total_vehicles: 52, bikes: 20, cars: 18, buses: 2, school_buses: 0, heavy_vehicles: 11, emergency_vehicles: 1, density: 'HIGH', queue_meters: 230, avg_wait_sec: 55, signal: 'RED', countdown: 32 },
    { road: 'WEST ROAD', direction: 'West', total_vehicles: 27, bikes: 10, cars: 12, buses: 1, school_buses: 0, heavy_vehicles: 4, emergency_vehicles: 0, density: 'MEDIUM', queue_meters: 110, avg_wait_sec: 28, signal: 'RED', countdown: 26 }
  ],
  current_priority: "EMERGENCY VEHICLE",
  priority_road: "South Road",
  rationale: "Ambulance detected on South Road. Immediate corridor signal override active."
};

let simulatedIncidents = [
  { id: 'INC-101', timestamp: new Date().toISOString(), incident_type: 'Sudden Congestion', severity: 'HIGH', location: 'Junction 02 - Market Road', details: 'Heavy traffic surge detected on East approach. Queue length exceeds 30 vehicles.', status: 'NEW' },
  { id: 'INC-102', timestamp: new Date().toISOString(), incident_type: 'Wrong-Way Movement', severity: 'CRITICAL', location: 'Junction 02 - Market Road', details: 'Vehicle detected traveling Westbound on one-way Eastbound lane.', status: 'MONITORING' }
];

let simulatedWrongWay = [
  { id: 'WW-CAM-01', timestamp: new Date().toISOString(), camera_id: 'CAM-J02-EAST', intersection_id: 'Junction 02 - Market Road', detected_direction: 'Westbound (Wrong-way)', expected_direction: 'Eastbound', severity: 'CRITICAL', evidence_status: 'VERIFIED_SIMULATION' }
];

let simulatedAccidents = [
  { id: 'ACC-104', timestamp: new Date().toISOString(), location: 'Junction 04 - Hospital Road', camera_id: 'CAM-C04-HD', severity: 'CRITICAL', emergency_dispatched: true, status: 'ACTIVE' }
];

let simulatedImpaired = [
  { id: 'IMP-8821', timestamp: new Date().toISOString(), vehicle_id: 'KA-01-MJ-8821', location: 'Junction 05 - Tech Park Road', swerving_score: 86.4, risk_score: 82.5, status: 'MONITORING' }
];

let simulatedRailway = {
  crossing_name: "I3 - Railway Junction",
  gate_status: "OPEN" as 'OPEN' | 'CLOSING' | 'CLOSED' | 'OPENING',
  risk_level: "SAFE" as 'SAFE' | 'CAUTION' | 'HIGH RISK',
  train_detected: false,
  details: "Normal railway operations. Signal phase synchronised."
};

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // If running on a static site like GitHub Pages (not localhost), use instant simulation fallback!
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isLocalHost) {
    return getFallbackData<T>(endpoint, options);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 250); // Fast 250ms timeout for local server check

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return getFallbackData<T>(endpoint, options);
  }
}

function getFallbackData<T>(endpoint: string, options?: RequestInit): T {
  // Handle mutations
  if (endpoint.includes('/traffic/simulate') && options?.body) {
    try {
      const parsed = JSON.parse(options.body as string);
      if (parsed.action === 'RANDOMIZE') {
        simulatedJunctionState.roads = simulatedJunctionState.roads.map(r => ({
          ...r,
          total_vehicles: Math.floor(Math.random() * 45) + 15,
          cars: Math.floor(Math.random() * 20) + 5,
          bikes: Math.floor(Math.random() * 15) + 5,
          density: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM'
        }));
      }
    } catch (e) {}
  }

  if (endpoint.includes('/safety/wrongway/trigger')) {
    const newEv = {
      id: `WW-CAM-0${simulatedWrongWay.length + 1}`,
      timestamp: new Date().toISOString(),
      camera_id: 'CAM-J01-NORTH',
      intersection_id: 'Central Junction (J1)',
      detected_direction: 'Southbound (Wrong-way)',
      expected_direction: 'Northbound',
      severity: 'CRITICAL',
      evidence_status: 'DETECTED_LIVE'
    };
    simulatedWrongWay = [newEv, ...simulatedWrongWay];
    return newEv as unknown as T;
  }

  if (endpoint.includes('/safety/accidents/trigger')) {
    const newAcc = {
      id: `ACC-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toISOString(),
      location: 'Junction 01 - Central Junction',
      camera_id: 'CAM-C01-HD',
      severity: 'CRITICAL',
      emergency_dispatched: true,
      status: 'DISPATCHED_SIMULATION'
    };
    simulatedAccidents = [newAcc, ...simulatedAccidents];
    return newAcc as unknown as T;
  }

  if (endpoint.includes('/railway/simulate') && options?.body) {
    try {
      const parsed = JSON.parse(options.body as string);
      if (parsed.action === 'TRIGGER') {
        simulatedRailway.train_detected = true;
        simulatedRailway.gate_status = 'CLOSED';
        simulatedRailway.risk_level = 'HIGH RISK';
        simulatedRailway.details = '🚨 ALERT: High Speed Express Train approaching crossing! Gate CLOSED.';
      } else {
        simulatedRailway.train_detected = false;
        simulatedRailway.gate_status = 'OPEN';
        simulatedRailway.risk_level = 'SAFE';
        simulatedRailway.details = 'Normal railway operations. Signal phase synchronised.';
      }
    } catch (e) {}
    return simulatedRailway as unknown as T;
  }

  if (endpoint.includes('/emergency/activate') && options?.body) {
    try {
      const parsed = JSON.parse(options.body as string);
      return {
        id: `EMG-${Math.floor(Math.random() * 9000) + 1000}`,
        timestamp: new Date().toISOString(),
        vehicle_type: parsed.vehicle_type || 'Ambulance',
        start: parsed.start_intersection || 'I5',
        destination: parsed.destination_intersection || 'I4',
        route: [parsed.start_intersection || 'I5', 'I1', parsed.destination_intersection || 'I4'],
        normal_eta_sec: 240,
        optimized_eta_sec: 110,
        time_saved_sec: 130,
        status: 'GREEN_WAVE_ACTIVE'
      } as unknown as T;
    } catch (e) {}
  }

  if (endpoint.includes('/optimization/run')) {
    return {
      run_id: `OPT-QUBO-${Math.floor(Math.random() * 90) + 10}`,
      timestamp: new Date().toISOString(),
      algorithm: "QUBO / Quantum-Inspired Simulated Annealing",
      execution_time_ms: 38.4,
      iterations: 1500,
      objective_value: 14.2,
      weights: { wait_time: 0.35, queue: 0.20, congestion: 0.20, emergency: 0.15, fuel: 0.05, co2: 0.05 },
      before_metrics: { avg_wait_time: 54.2, queue_length: 42, congestion: 78.5, fuel_liters: 45.0, co2_kg: 104.0, emergency_delay: 85.0 },
      after_metrics: { avg_wait_time: 32.1, queue_length: 21, congestion: 48.0, fuel_liters: 28.5, co2_kg: 65.8, emergency_delay: 22.0 },
      improvements: { wait_time_pct: 40.7, queue_pct: 50.0, congestion_pct: 38.8, fuel_pct: 36.6, co2_pct: 36.7, emergency_delay_pct: 74.1 },
      recommended_signal_plan: { I1: 45, I2: 30, I3: 40, I4: 50, I5: 35, I6: 40 }
    } as unknown as T;
  }

  if (endpoint.includes('/dashboard')) {
    return {
      disclaimer: "SIMULATION ENGINE ACTIVE",
      system_status: "ONLINE",
      kpis: {
        traffic_density: 63.5,
        avg_wait_time_sec: 34.8,
        congestion_level: "MODERATE",
        total_queue_vehicles: 114,
        active_incidents: simulatedIncidents.length,
        active_emergency_vehicles: 1,
        fuel_saved_liters: 24.5,
        co2_reduced_kg: 56.6,
        railway_risk_status: simulatedRailway.risk_level
      },
      latest_optimization: {
        run_id: "OPT-QUBO-01",
        objective_value: 18.4,
        execution_time_ms: 42.5
      }
    } as unknown as T;
  }

  if (endpoint.includes('/intersections')) {
    return [
      { id: 'I1', name: 'Central Junction', x_pos: 300, y_pos: 180, traffic_density: 65, queue_length: 18, avg_wait_time: 38, avg_speed: 28, current_green_time: 30, current_red_time: 40, recommended_green_time: 45, signal_phase: 'GREEN', signal_timer: 18, status: 'NORMAL' },
      { id: 'I2', name: 'Market Road', x_pos: 600, y_pos: 180, traffic_density: 82, queue_length: 34, avg_wait_time: 56, avg_speed: 18, current_green_time: 25, current_red_time: 50, recommended_green_time: 40, signal_phase: 'RED', signal_timer: 24, status: 'CONGESTED' },
      { id: 'I3', name: 'Railway Junction', x_pos: 850, y_pos: 340, traffic_density: 54, queue_length: 14, avg_wait_time: 31, avg_speed: 34, current_green_time: 35, current_red_time: 35, recommended_green_time: 35, signal_phase: 'GREEN', signal_timer: 12, status: 'NORMAL' },
      { id: 'I4', name: 'Hospital Road', x_pos: 300, y_pos: 480, traffic_density: 48, queue_length: 10, avg_wait_time: 22, avg_speed: 40, current_green_time: 40, current_red_time: 30, recommended_green_time: 35, signal_phase: 'GREEN', signal_timer: 20, status: 'NORMAL' },
      { id: 'I5', name: 'Tech Park', x_pos: 600, y_pos: 480, traffic_density: 74, queue_length: 26, avg_wait_time: 45, avg_speed: 22, current_green_time: 30, current_red_time: 45, recommended_green_time: 42, signal_phase: 'RED', signal_timer: 15, status: 'NORMAL' },
      { id: 'I6', name: 'Highway Junction', x_pos: 150, y_pos: 340, traffic_density: 58, queue_length: 16, avg_wait_time: 29, avg_speed: 36, current_green_time: 35, current_red_time: 35, recommended_green_time: 38, signal_phase: 'GREEN', signal_timer: 22, status: 'NORMAL' }
    ] as unknown as T;
  }

  if (endpoint.includes('/junction-4road')) {
    if (endpoint.includes('day_type=')) {
      const match = endpoint.match(/day_type=([^&]+)/);
      if (match) simulatedJunctionState.day_type = decodeURIComponent(match[1]);
    }
    return {
      disclaimer: "DEMO / SIMULATION DATA",
      day_type: simulatedJunctionState.day_type,
      junction_name: "Central Command Intersection (J1)",
      roads: simulatedJunctionState.roads,
      current_priority: simulatedJunctionState.current_priority,
      priority_road: simulatedJunctionState.priority_road,
      rationale: simulatedJunctionState.rationale,
      summary: {
        total_vehicles: simulatedJunctionState.roads.reduce((acc, r) => acc + r.total_vehicles, 0),
        congestion_level: "HIGH",
        avg_wait_time: 34.8,
        total_queue: 550,
        school_buses: 1,
        heavy_vehicles: 22,
        emergency_vehicles: 1,
        estimated_delay_reduction_pct: 38.5,
        before_wait_sec: 52.0,
        after_wait_sec: 32.0
      }
    } as unknown as T;
  }

  if (endpoint.includes('/predictions')) {
    return {
      predictions: [
        { intersection_id: 'I1', intersection_name: 'Central Junction', current_density: 65, predicted_density: 78, trend: 'INCREASING', confidence_score: 92.4, method: 'LSTM Time Series', explanation: 'Surge expected due to peak office hours.' },
        { intersection_id: 'I2', intersection_name: 'Market Road', current_density: 82, predicted_density: 88, trend: 'INCREASING', confidence_score: 89.1, method: 'XGBoost Regressor', explanation: 'Commercial area heavy activity.' },
        { intersection_id: 'I3', intersection_name: 'Railway Junction', current_density: 54, predicted_density: 42, trend: 'DECREASING', confidence_score: 95.0, method: 'Random Forest', explanation: 'Train passage cleared, traffic dispersing.' },
        { intersection_id: 'I4', intersection_name: 'Hospital Road', current_density: 48, predicted_density: 46, trend: 'STABLE', confidence_score: 91.8, method: 'Random Forest', explanation: 'Steady hospital corridor flow.' },
        { intersection_id: 'I5', intersection_name: 'Tech Park', current_density: 74, predicted_density: 62, trend: 'DECREASING', confidence_score: 94.2, method: 'LSTM Time Series', explanation: 'Shift end outflow dispersing.' },
        { intersection_id: 'I6', intersection_name: 'Highway Junction', current_density: 58, predicted_density: 64, trend: 'INCREASING', confidence_score: 88.5, method: 'XGBoost Regressor', explanation: 'Intercity transit influx.' }
      ]
    } as unknown as T;
  }

  if (endpoint.includes('/incidents')) return simulatedIncidents as unknown as T;
  if (endpoint.includes('/wrongway')) return simulatedWrongWay as unknown as T;
  if (endpoint.includes('/accidents')) return simulatedAccidents as unknown as T;
  if (endpoint.includes('/impaired')) return simulatedImpaired as unknown as T;
  if (endpoint.includes('/railway')) return simulatedRailway as unknown as T;

  return {} as unknown as T;
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
