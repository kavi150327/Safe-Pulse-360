import os
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Depends, HTTPException, Body, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .database import (
    Base, engine, get_db, seed_initial_data,
    IntersectionDB, TrafficRecordDB, TrafficPredictionDB,
    OptimizationRunDB, SafetyIncidentDB, EmergencyEventDB,
    RailwayEventDB, SystemEventDB
)
from .services.qubo_solver import QuantumInspiredQUBOSolver
from .services.simulation import TrafficSimulationEngine
from .services.prediction import TrafficPredictor
from .services.emergency import EmergencyCorridorManager
from .services.safety import SafetyManager
from .services.railway import RailwaySafetyManager

# Initialize Database & Seed initial 6 intersections
seed_initial_data()

app = FastAPI(
    title="SAFE PULSE 360 - Urban Safety & Traffic Command Center API",
    description="Intelligent Urban Safety, Adaptive QUBO Signal Optimization & Emergency Green Wave API",
    version="1.0.0"
)

# Enable CORS for local React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate service engines
sim_engine = TrafficSimulationEngine()
predictor = TrafficPredictor()
emergency_mgr = EmergencyCorridorManager()
safety_mgr = SafetyManager()
railway_mgr = RailwaySafetyManager()


# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class SimulateTrafficRequest(BaseModel):
    action: str = Field("TICK", description="TICK, START, PAUSE, RESET, RANDOMIZE, INCREASE, DECREASE")
    delta_traffic: int = Field(0, description="Amount to add/remove")
    speed_multiplier: float = Field(1.0, description="0.5, 1.0, 2.0, 5.0")

class OptimizationRunRequest(BaseModel):
    weights: Optional[Dict[str, float]] = None

class EmergencyRouteRequest(BaseModel):
    start_intersection: str = "I5"
    destination_intersection: str = "I4"
    vehicle_type: str = "Ambulance"

class IncidentCreateRequest(BaseModel):
    incident_type: str
    severity: str = "MEDIUM"
    location: str
    details: str

class IncidentUpdateRequest(BaseModel):
    status: str = "RESOLVED"

class RailwaySimulateRequest(BaseModel):
    action: str = "TRIGGER" # TRIGGER or CLEAR


# -------------------------------------------------------------
# REST ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/health")
def get_health():
    return {"status": "ok", "service": "SAFE PULSE 360 Command API", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/dashboard")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    intersections = db.query(IntersectionDB).all()
    if not intersections:
        return {"status": "NO_DATA"}

    avg_density = round(sum(i.traffic_density for i in intersections) / len(intersections), 1)
    avg_wait = round(sum(i.avg_wait_time for i in intersections) / len(intersections), 1)
    total_queue = sum(i.queue_length for i in intersections)
    
    # Calculate congestion level
    if avg_density > 75:
        congestion_level = "HEAVY"
    elif avg_density > 55:
        congestion_level = "MODERATE"
    else:
        congestion_level = "LIGHT"

    active_incidents = db.query(SafetyIncidentDB).filter(SafetyIncidentDB.status != "RESOLVED").count()
    active_emergencies = db.query(EmergencyEventDB).filter(EmergencyEventDB.status == "ACTIVE").count()

    # Fuel and CO2 calculations
    total_fuel_saved = round(sum(i.queue_length * 0.18 for i in intersections), 1)
    total_co2_reduced = round(total_fuel_saved * 2.31, 1)

    rail_status = railway_mgr.get_status(db)

    # Latest optimization run
    latest_opt = db.query(OptimizationRunDB).order_by(OptimizationRunDB.timestamp.desc()).first()

    return {
        "disclaimer": "Simulation Estimate",
        "system_status": "ONLINE",
        "kpis": {
            "traffic_density": avg_density,
            "avg_wait_time_sec": avg_wait,
            "congestion_level": congestion_level,
            "total_queue_vehicles": total_queue,
            "active_incidents": active_incidents,
            "active_emergency_vehicles": active_emergencies,
            "fuel_saved_liters": total_fuel_saved,
            "co2_reduced_kg": total_co2_reduced,
            "railway_risk_status": rail_status["risk_level"]
        },
        "latest_optimization": {
            "run_id": latest_opt.id if latest_opt else "OPT-INITIAL",
            "objective_value": latest_opt.objective_value if latest_opt else 18.4,
            "execution_time_ms": latest_opt.execution_time_ms if latest_opt else 42.5
        }
    }


@app.get("/api/intersections")
def get_intersections(db: Session = Depends(get_db)):
    intersections = db.query(IntersectionDB).all()
    results = []
    for i in intersections:
        approaches = []
        try:
            approaches = json.loads(i.approaches_json)
        except Exception:
            pass

        results.append({
            "id": i.id,
            "name": i.name,
            "x_pos": i.x_pos,
            "y_pos": i.y_pos,
            "traffic_density": i.traffic_density,
            "queue_length": i.queue_length,
            "avg_wait_time": i.avg_wait_time,
            "avg_speed": i.avg_speed,
            "current_green_time": i.current_green_time,
            "current_red_time": i.current_red_time,
            "recommended_green_time": i.recommended_green_time,
            "signal_phase": i.signal_phase,
            "signal_timer": i.signal_timer,
            "status": i.status,
            "approaches": approaches
        })
    return results


@app.get("/api/traffic")
def get_traffic_records(limit: int = 50, db: Session = Depends(get_db)):
    records = db.query(TrafficRecordDB).order_by(TrafficRecordDB.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "intersection_id": r.intersection_id,
            "vehicle_count": r.vehicle_count,
            "density": r.density,
            "queue_length": r.queue_length,
            "avg_speed": r.avg_speed,
            "wait_time": r.wait_time,
            "fuel_consumption": r.fuel_consumption,
            "co2_emissions": r.co2_emissions
        }
        for r in records
    ]


@app.post("/api/traffic/simulate")
def simulate_traffic(req: SimulateTrafficRequest, db: Session = Depends(get_db)):
    sim_engine.speed_multiplier = req.speed_multiplier
    if req.action == "RESET":
        seed_initial_data()
        return {"status": "RESET", "message": "Simulation state reset to default initial baseline."}

    results = sim_engine.tick(db, action=req.action, delta_traffic=req.delta_traffic)
    safety_mgr.scan_for_incidents(db)
    
    return {
        "status": "SUCCESS",
        "action": req.action,
        "intersections": results
    }


@app.get("/api/predictions")
def get_predictions(db: Session = Depends(get_db)):
    predictions = predictor.generate_predictions(db)
    return {
        "disclaimer": "Simulation Estimate",
        "method": "Weighted Moving Average",
        "how_it_works": "Recent traffic observations are used to estimate the next traffic condition.",
        "predictions": predictions
    }


@app.post("/api/predictions/generate")
def generate_predictions(db: Session = Depends(get_db)):
    return get_predictions(db)


@app.post("/api/optimization/run")
def run_qubo_optimization(req: Optional[OptimizationRunRequest] = None, db: Session = Depends(get_db)):
    weights = req.weights if req and req.weights else None
    solver = QuantumInspiredQUBOSolver(weights=weights)
    result = solver.solve(db)
    return result


@app.get("/api/optimization/history")
def get_optimization_history(limit: int = 20, db: Session = Depends(get_db)):
    runs = db.query(OptimizationRunDB).order_by(OptimizationRunDB.timestamp.desc()).limit(limit).all()
    out = []
    for r in runs:
        out.append({
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "algorithm": r.algorithm,
            "status": r.status,
            "iterations": r.iterations,
            "execution_time_ms": r.execution_time_ms,
            "objective_value": r.objective_value,
            "weights": json.loads(r.weights_json) if r.weights_json else {},
            "before_metrics": json.loads(r.before_metrics_json) if r.before_metrics_json else {},
            "after_metrics": json.loads(r.after_metrics_json) if r.after_metrics_json else {}
        })
    return out


@app.post("/api/emergency/route")
def compute_emergency_route(req: EmergencyRouteRequest):
    route = emergency_mgr.compute_route(req.start_intersection, req.destination_intersection)
    return {
        "start": req.start_intersection,
        "destination": req.destination_intersection,
        "route": route,
        "intersections_cleared": len(route)
    }


@app.post("/api/emergency/activate")
def activate_emergency_corridor(req: EmergencyRouteRequest, db: Session = Depends(get_db)):
    res = emergency_mgr.activate_corridor(
        db, 
        start=req.start_intersection, 
        dest=req.destination_intersection, 
        vehicle_type=req.vehicle_type
    )
    return res


@app.get("/api/emergency/history")
def get_emergency_history(db: Session = Depends(get_db)):
    events = db.query(EmergencyEventDB).order_by(EmergencyEventDB.timestamp.desc()).limit(20).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "vehicle_type": e.vehicle_type,
            "start": e.start_intersection,
            "destination": e.destination_intersection,
            "route": json.loads(e.route_json) if e.route_json else [],
            "normal_eta_sec": e.normal_eta_sec,
            "optimized_eta_sec": e.optimized_eta_sec,
            "time_saved_sec": e.time_saved_sec,
            "status": e.status
        }
        for e in events
    ]


@app.get("/api/incidents")
def get_safety_incidents(db: Session = Depends(get_db)):
    incidents = db.query(SafetyIncidentDB).order_by(SafetyIncidentDB.timestamp.desc()).all()
    return [
        {
            "id": inc.id,
            "timestamp": inc.timestamp.isoformat(),
            "incident_type": inc.incident_type,
            "severity": inc.severity,
            "location": inc.location,
            "details": inc.details,
            "status": inc.status
        }
        for inc in incidents
    ]


@app.post("/api/incidents")
def create_incident(req: IncidentCreateRequest, db: Session = Depends(get_db)):
    inc_id = f"INC-MANUAL-{datetime.utcnow().strftime('%M%S')}"
    inc = SafetyIncidentDB(
        id=inc_id,
        timestamp=datetime.utcnow(),
        incident_type=req.incident_type,
        severity=req.severity,
        location=req.location,
        details=req.details,
        status="NEW"
    )
    db.add(inc)
    db.commit()
    return {"status": "SUCCESS", "id": inc_id}


@app.patch("/api/incidents/{incident_id}")
def update_incident_status(incident_id: str, req: IncidentUpdateRequest, db: Session = Depends(get_db)):
    return safety_mgr.resolve_incident(db, incident_id)


# -------------------------------------------------------------
# ADDITIONAL SAFETY & DETECTION ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/traffic/junction-4road")
def get_junction_4road(day_type: str = "Working Day", db: Session = Depends(get_db)):
    # Base multipliers depending on selected day type
    multipliers = {
        "Working Day": 1.0,
        "Weekend": 0.85,
        "Sunday": 0.70,
        "Holiday": 0.65,
        "Festival": 1.45,
        "Special Event": 1.35,
        "College Event": 1.25,
        "Public Gathering": 1.40
    }
    m = multipliers.get(day_type, 1.0)

    # 4 Approaches with exact live simulated breakdowns
    north = {
        "road": "NORTH ROAD",
        "direction": "North",
        "total_vehicles": int(35 * m),
        "bikes": int(12 * m),
        "cars": int(15 * m),
        "buses": int(3 * m),
        "school_buses": 1 if day_type in ["Working Day", "College Event"] else 0,
        "heavy_vehicles": int(5 * m),
        "emergency_vehicles": 0,
        "density": "HIGH" if m > 1.2 else ("MEDIUM" if m >= 0.9 else "LOW"),
        "queue_meters": int(145 * m),
        "avg_wait_sec": int(38 * m),
        "signal": "GREEN",
        "countdown": 45
    }

    east = {
        "road": "EAST ROAD",
        "direction": "East",
        "total_vehicles": int(18 * m),
        "bikes": int(8 * m),
        "cars": int(7 * m),
        "buses": int(1 * m),
        "school_buses": 0,
        "heavy_vehicles": int(2 * m),
        "emergency_vehicles": 0,
        "density": "HIGH" if m > 1.3 else ("MEDIUM" if m > 1.0 else "LOW"),
        "queue_meters": int(65 * m),
        "avg_wait_sec": int(18 * m),
        "signal": "RED",
        "countdown": 18
    }

    south = {
        "road": "SOUTH ROAD",
        "direction": "South",
        "total_vehicles": int(52 * m),
        "bikes": int(20 * m),
        "cars": int(18 * m),
        "buses": int(2 * m),
        "school_buses": 0,
        "heavy_vehicles": int(11 * m), # Highest heavy vehicle load
        "emergency_vehicles": 1,        # Ambulance detected!
        "density": "VERY HIGH" if m > 1.1 else "HIGH",
        "queue_meters": int(230 * m),
        "avg_wait_sec": int(55 * m),
        "signal": "RED",
        "countdown": 32
    }

    west = {
        "road": "WEST ROAD",
        "direction": "West",
        "total_vehicles": int(27 * m),
        "bikes": int(10 * m),
        "cars": int(12 * m),
        "buses": int(1 * m),
        "school_buses": 0,
        "heavy_vehicles": int(4 * m),
        "emergency_vehicles": 0,
        "density": "HIGH" if m > 1.3 else "MEDIUM",
        "queue_meters": int(110 * m),
        "avg_wait_sec": int(28 * m),
        "signal": "RED",
        "countdown": 26
    }

    # Determine Priority Order & Rationale
    if south["emergency_vehicles"] > 0:
        current_priority = "EMERGENCY VEHICLE"
        priority_road = "South Road"
        rationale = "Ambulance detected on South Road. Immediate corridor signal override active."
    elif north["school_buses"] > 0 and day_type in ["Working Day", "College Event"]:
        current_priority = "SCHOOL / COLLEGE BUS"
        priority_road = "North Road"
        rationale = "School/College bus detected during morning transit hours on North Road. Green phase prioritized."
    elif south["heavy_vehicles"] >= max(north["heavy_vehicles"], east["heavy_vehicles"], west["heavy_vehicles"]):
        current_priority = "HEAVY VEHICLES"
        priority_road = "South Road"
        rationale = f"South Road has highest heavy-vehicle load ({south['heavy_vehicles']} heavy trucks/trailers). Allocating extended green phase window."
    else:
        current_priority = "NORMAL MIXED TRAFFIC"
        priority_road = "North Road"
        rationale = "Adaptive 60-second signal cycle active based on total network density and queue length."

    return {
        "disclaimer": "DEMO / SIMULATION DATA",
        "day_type": day_type,
        "junction_name": "Central Command Intersection (J1)",
        "roads": [north, east, south, west],
        "current_priority": current_priority,
        "priority_road": priority_road,
        "rationale": rationale,
        "summary": {
            "total_vehicles": north["total_vehicles"] + east["total_vehicles"] + south["total_vehicles"] + west["total_vehicles"],
            "congestion_level": "HIGH" if m >= 1.0 else "MEDIUM",
            "avg_wait_time": round((north["avg_wait_sec"] + east["avg_wait_sec"] + south["avg_wait_sec"] + west["avg_wait_sec"]) / 4, 1),
            "total_queue": north["queue_meters"] + east["queue_meters"] + south["queue_meters"] + west["queue_meters"],
            "school_buses": north["school_buses"] + east["school_buses"] + south["school_buses"] + west["school_buses"],
            "heavy_vehicles": north["heavy_vehicles"] + east["heavy_vehicles"] + south["heavy_vehicles"] + west["heavy_vehicles"],
            "emergency_vehicles": north["emergency_vehicles"] + east["emergency_vehicles"] + south["emergency_vehicles"] + west["emergency_vehicles"],
            "estimated_delay_reduction_pct": 38.5,
            "before_wait_sec": 52.0,
            "after_wait_sec": 32.0
        }
    }


@app.get("/api/safety/awareness-board")
def get_awareness_board_stats(db: Session = Depends(get_db)):
    return {
        "disclaimer": "DEMO / SIMULATION",
        "accident_stats_by_day": [
            {"day": "MONDAY", "incidents": 3},
            {"day": "TUESDAY", "incidents": 2},
            {"day": "WEDNESDAY", "incidents": 4},
            {"day": "THURSDAY", "incidents": 1},
            {"day": "FRIDAY", "incidents": 5},
            {"day": "SATURDAY", "incidents": 3},
            {"day": "SUNDAY", "incidents": 2}
        ],
        "summary": {
            "total_accidents_this_week": 20,
            "total_accidents_this_month": 78,
            "most_common_incident": "Wrong-Way Entry / Over-speed Swerving",
            "active_safety_alerts": 2
        },
        "awareness_banners": [
            "DRIVE SAFELY",
            "FOLLOW TRAFFIC SIGNALS",
            "DO NOT DRIVE AGAINST TRAFFIC",
            "REPORT ROAD HAZARDS TO CONTROL ROOM"
        ]
    }


@app.post("/api/railway/sensor-trigger")
def trigger_railway_sensor(left_breach: bool = True, right_breach: bool = False, db: Session = Depends(get_db)):
    # Toggle railway crossing risk and buzzer state
    r_status = railway_mgr.get_status(db)
    gate_closed = r_status["gate_status"] == "CLOSED"
    
    buzzer_active = gate_closed and (left_breach or right_breach)
    
    return {
        "disclaimer": "DEMO / SIMULATION",
        "gate_status": r_status["gate_status"],
        "left_sensor": "DETECTION" if left_breach else "SAFE",
        "right_sensor": "DETECTION" if right_breach else "SAFE",
        "buzzer_status": "ON" if buzzer_active else "OFF",
        "warning_message": "🚨 RAILWAY CROSSING WARNING — DO NOT CROSS — TRAIN APPROACHING" if buzzer_active else "SAFE TO CROSS"
    }



@app.get("/api/safety/wrongway")
def get_wrong_way_events(db: Session = Depends(get_db)):
    events = db.query(WrongWayEventDB).order_by(WrongWayEventDB.timestamp.desc()).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "camera_id": e.camera_id,
            "intersection_id": e.intersection_id,
            "detected_direction": e.detected_direction,
            "expected_direction": e.expected_direction,
            "severity": e.severity,
            "evidence_status": e.evidence_status
        }
        for e in events
    ]


@app.post("/api/safety/wrongway/trigger")
def trigger_wrong_way_event(intersection_id: str = "I2", db: Session = Depends(get_db)):
    event_id = f"WW-{datetime.utcnow().strftime('%M%S')}"
    e = WrongWayEventDB(
        id=event_id,
        timestamp=datetime.utcnow(),
        camera_id=f"CAM-{intersection_id}-EAST",
        intersection_id=f"{intersection_id} - Market Road",
        detected_direction="Westbound (Wrong-way Vector)",
        expected_direction="Eastbound (One-way)",
        severity="CRITICAL",
        evidence_status="LIVE_SNAPSHOT_CAPTURED"
    )
    db.add(e)
    db.add(SystemEventDB(
        timestamp=datetime.utcnow(),
        event_type="WRONG_WAY_DETECTED",
        message=f"CRITICAL: Wrong-way vehicle vector detected at {intersection_id}. Camera evidence logged & alert generated.",
        severity="ERROR"
    ))
    db.commit()
    return {"status": "SUCCESS", "event_id": event_id}


@app.get("/api/safety/accidents")
def get_accident_events(db: Session = Depends(get_db)):
    events = db.query(AccidentEventDB).order_by(AccidentEventDB.timestamp.desc()).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "location": e.location,
            "camera_id": e.camera_id,
            "severity": e.severity,
            "emergency_dispatched": e.emergency_dispatched,
            "status": e.status
        }
        for e in events
    ]


@app.post("/api/safety/accidents/trigger")
def trigger_accident_event(location: str = "I4 - Hospital Road", db: Session = Depends(get_db)):
    event_id = f"ACC-{datetime.utcnow().strftime('%M%S')}"
    e = AccidentEventDB(
        id=event_id,
        timestamp=datetime.utcnow(),
        location=location,
        camera_id="CAM-C04-HD",
        severity="CRITICAL",
        emergency_dispatched=True,
        status="ACTIVE"
    )
    db.add(e)
    db.add(SystemEventDB(
        timestamp=datetime.utcnow(),
        event_type="ACCIDENT_DETECTED",
        message=f"ACCIDENT ALERT: Collision pattern detected at {location} (Camera C04). Dispatching nearest hospital emergency unit.",
        severity="ERROR"
    ))
    db.commit()
    return {"status": "SUCCESS", "event_id": event_id}


@app.get("/api/safety/impaired")
def get_impaired_events(db: Session = Depends(get_db)):
    events = db.query(ImpairedDrivingDB).order_by(ImpairedDrivingDB.timestamp.desc()).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "vehicle_id": e.vehicle_id,
            "location": e.location,
            "swerving_score": e.swerving_score,
            "risk_score": e.risk_score,
            "status": e.status
        }
        for e in events
    ]


@app.get("/api/safety/pedestrian")
def get_pedestrian_events(db: Session = Depends(get_db)):
    events = db.query(PedestrianSafetyDB).order_by(PedestrianSafetyDB.timestamp.desc()).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "location": e.location,
            "crosswalk_id": e.crosswalk_id,
            "signal_state": e.signal_state,
            "phone_distracted": e.phone_distracted,
            "warning_displayed": e.warning_displayed
        }
        for e in events
    ]


@app.get("/api/railway")
def get_railway_status(db: Session = Depends(get_db)):
    return railway_mgr.get_status(db)


@app.post("/api/railway/simulate")
def simulate_railway_event(req: RailwaySimulateRequest, db: Session = Depends(get_db)):
    return railway_mgr.trigger_train_event(db, action=req.action)


@app.get("/api/analytics")
def get_analytics(timeframe: str = "15m", db: Session = Depends(get_db)):
    # Build chart data series for density, wait time, queue, fuel, CO2
    records = (
        db.query(TrafficRecordDB)
        .order_by(TrafficRecordDB.timestamp.asc())
        .limit(60)
        .all()
    )

    chart_data = []
    for r in records[-20:]:
        chart_data.append({
            "time": r.timestamp.strftime("%H:%M:%S"),
            "intersection": r.intersection_id,
            "density": r.density,
            "wait_time": r.wait_time,
            "queue": r.queue_length,
            "fuel": r.fuel_consumption,
            "co2": r.co2_emissions,
            "speed": r.avg_speed
        })

    return {
        "disclaimer": "Simulation Estimate",
        "timeframe": timeframe,
        "chart_data": chart_data,
        "summary": {
            "avg_network_density": 62.4,
            "avg_wait_time_sec": 34.8,
            "total_co2_kg": round(sum(r.co2_emissions for r in records), 1),
            "emergency_corridors_cleared": 4
        }
    }


@app.get("/api/system/events")
def get_system_events(limit: int = 30, db: Session = Depends(get_db)):
    events = db.query(SystemEventDB).order_by(SystemEventDB.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "event_type": e.event_type,
            "message": e.message,
            "severity": e.severity
        }
        for e in events
    ]


@app.get("/api/system/status")
def get_system_status(db: Session = Depends(get_db)):
    return {
        "status": "OPERATIONAL",
        "components": {
            "frontend": "ONLINE",
            "backend": "ONLINE (FastAPI 0.141)",
            "database": "ONLINE (SQLite / SQLAlchemy 2.0)",
            "qubo_optimizer": "READY (Quantum-Inspired QUBO Solver)",
            "simulation_engine": "RUNNING (0.5x - 5.0x active)",
            "api_server": "HEALTHY"
        },
        "active_intersections": db.query(IntersectionDB).count(),
        "total_traffic_records": db.query(TrafficRecordDB).count(),
        "total_optimization_runs": db.query(OptimizationRunDB).count(),
        "uptime_seconds": 3600
    }


@app.post("/api/reset")
def reset_system_database(db: Session = Depends(get_db)):
    Base.metadata.drop_all(bind=engine)
    seed_initial_data()
    return {"status": "SUCCESS", "message": "All database tables reset and seed data initialized successfully."}


# -------------------------------------------------------------
# UNIFIED FRONTEND STATIC SERVING (ONE SINGLE LINK PORT 8000)
# -------------------------------------------------------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))


