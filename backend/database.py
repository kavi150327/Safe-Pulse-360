import os
import json
from datetime import datetime
from typing import Generator
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# SQLite Database Path
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "safepulse360.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class IntersectionDB(Base):
    __tablename__ = "intersections"

    id = Column(String, primary_key=True, index=True)  # e.g. 'I1', 'I2'
    name = Column(String, nullable=False)               # e.g. 'Central Junction'
    x_pos = Column(Float, nullable=False)               # SVG coordinate X
    y_pos = Column(Float, nullable=False)               # SVG coordinate Y
    traffic_density = Column(Float, default=45.0)       # 0 - 100%
    queue_length = Column(Integer, default=12)          # total vehicles queuing
    avg_wait_time = Column(Float, default=24.0)         # seconds
    avg_speed = Column(Float, default=32.0)             # km/h
    current_green_time = Column(Integer, default=30)
    current_red_time = Column(Integer, default=30)
    recommended_green_time = Column(Integer, default=35)
    signal_phase = Column(String, default="GREEN")      # RED, YELLOW, GREEN
    signal_timer = Column(Integer, default=15)          # countdown seconds
    status = Column(String, default="NORMAL")            # NORMAL, CONGESTED, EMERGENCY, RAILWAY_WARN
    approaches_json = Column(Text, nullable=False)      # JSON stored approaches breakdown


class TrafficRecordDB(Base):
    __tablename__ = "traffic_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    intersection_id = Column(String, ForeignKey("intersections.id"))
    vehicle_count = Column(Integer, default=0)
    density = Column(Float, default=0.0)
    queue_length = Column(Integer, default=0)
    avg_speed = Column(Float, default=0.0)
    wait_time = Column(Float, default=0.0)
    fuel_consumption = Column(Float, default=0.0)  # Liters
    co2_emissions = Column(Float, default=0.0)     # kg CO2


class TrafficPredictionDB(Base):
    __tablename__ = "traffic_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    intersection_id = Column(String, ForeignKey("intersections.id"))
    current_density = Column(Float, nullable=False)
    predicted_density = Column(Float, nullable=False)
    trend = Column(String, default="STABLE")        # INCREASING, DECREASING, STABLE
    confidence_score = Column(Float, default=92.5)  # %
    method = Column(String, default="Weighted Moving Average")


class OptimizationRunDB(Base):
    __tablename__ = "optimization_runs"

    id = Column(String, primary_key=True)           # e.g. OPT-20260919-001
    timestamp = Column(DateTime, default=datetime.utcnow)
    algorithm = Column(String, default="Quantum-Inspired QUBO Solver")
    status = Column(String, default="COMPLETED")
    iterations = Column(Integer, default=100)
    execution_time_ms = Column(Float, default=42.5)
    objective_value = Column(Float, default=18.4)
    weights_json = Column(Text, nullable=False)
    before_metrics_json = Column(Text, nullable=False)
    after_metrics_json = Column(Text, nullable=False)


class SafetyIncidentDB(Base):
    __tablename__ = "safety_incidents"

    id = Column(String, primary_key=True)           # e.g. INC-101
    timestamp = Column(DateTime, default=datetime.utcnow)
    incident_type = Column(String, nullable=False)   # Sudden Congestion, Abnormal Queue, Signal Failure, Railway Crossing Risk
    severity = Column(String, default="MEDIUM")       # LOW, MEDIUM, HIGH, CRITICAL
    location = Column(String, nullable=False)       # Intersection ID / Name
    details = Column(Text, nullable=False)
    status = Column(String, default="NEW")           # NEW, MONITORING, RESOLVED


class EmergencyEventDB(Base):
    __tablename__ = "emergency_events"

    id = Column(String, primary_key=True)           # e.g. EMG-201
    timestamp = Column(DateTime, default=datetime.utcnow)
    vehicle_type = Column(String, default="Ambulance") # Ambulance, Fire Truck, Police
    start_intersection = Column(String, nullable=False)
    destination_intersection = Column(String, nullable=False)
    route_json = Column(Text, nullable=False)       # List of intersection IDs
    normal_eta_sec = Column(Integer, default=180)
    optimized_eta_sec = Column(Integer, default=95)
    time_saved_sec = Column(Integer, default=85)
    status = Column(String, default="ACTIVE")       # ACTIVE, COMPLETED, CANCELLED


class PriorityEventDB(Base):
    __tablename__ = "priority_events"

    id = Column(String, primary_key=True)           # e.g. PRIO-401
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String, nullable=False)     # Emergency Vehicle, School/College Bus, Heavy Vehicle, Railway Event, Severe Congestion, Safety Incident, Accident
    priority_level = Column(Integer, default=1)     # 1 (Highest) to 5
    location = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")       # ACTIVE, RESOLVED


class VehicleDetectionDB(Base):
    __tablename__ = "vehicle_detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    intersection_id = Column(String, ForeignKey("intersections.id"))
    approach = Column(String, default="North")       # North, East, South, West
    cars_count = Column(Integer, default=12)
    bikes_count = Column(Integer, default=8)
    buses_count = Column(Integer, default=2)
    school_buses_count = Column(Integer, default=1)
    heavy_vehicles_count = Column(Integer, default=3)
    emergency_vehicles_count = Column(Integer, default=0)
    pedestrians_count = Column(Integer, default=5)
    highest_density_approach = Column(String, default="North")


class WrongWayEventDB(Base):
    __tablename__ = "wrong_way_events"

    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    camera_id = Column(String, default="CAM-101")
    intersection_id = Column(String, nullable=False)
    detected_direction = Column(String, default="Southbound")
    expected_direction = Column(String, default="Northbound")
    severity = Column(String, default="CRITICAL")
    evidence_status = Column(String, default="VERIFIED_SIMULATION")


class AccidentEventDB(Base):
    __tablename__ = "accident_events"

    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location = Column(String, nullable=False)
    camera_id = Column(String, default="CAM-204")
    severity = Column(String, default="CRITICAL")
    emergency_dispatched = Column(Boolean, default=True)
    status = Column(String, default="ACTIVE")


class ImpairedDrivingDB(Base):
    __tablename__ = "impaired_driving_events"

    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    vehicle_id = Column(String, default="VEH-882")
    location = Column(String, nullable=False)
    swerving_score = Column(Float, default=84.5)
    risk_score = Column(Float, default=78.2)         # 0 - 100%
    status = Column(String, default="MONITORING")


class PedestrianSafetyDB(Base):
    __tablename__ = "pedestrian_safety_events"

    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location = Column(String, nullable=False)
    crosswalk_id = Column(String, default="CW-01")
    signal_state = Column(String, default="RED")
    phone_distracted = Column(Boolean, default=True)
    warning_displayed = Column(Boolean, default=True)


class RailwayEventDB(Base):
    __tablename__ = "railway_events"

    id = Column(String, primary_key=True)           # e.g. RAIL-301
    timestamp = Column(DateTime, default=datetime.utcnow)
    crossing_name = Column(String, default="I3 - Railway Junction")
    gate_status = Column(String, default="OPEN")    # OPEN, CLOSING, CLOSED, OPENING
    risk_level = Column(String, default="SAFE")      # SAFE, CAUTION, HIGH RISK
    train_detected = Column(Boolean, default=False)
    details = Column(Text, default="Normal railway operations.")


class SystemEventDB(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="INFO")       # INFO, WARNING, ERROR, SUCCESS


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_initial_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(IntersectionDB).count() == 0:
        initial_intersections = [
            {
                "id": "I1",
                "name": "Central Junction",
                "x_pos": 300,
                "y_pos": 180,
                "traffic_density": 65.0,
                "queue_length": 18,
                "avg_wait_time": 38.0,
                "avg_speed": 28.0,
                "current_green_time": 30,
                "current_red_time": 40,
                "recommended_green_time": 45,
                "signal_phase": "GREEN",
                "signal_timer": 18,
                "status": "NORMAL",
                "approaches_json": json.dumps([
                    {"dir": "N", "cars": 45, "queue": 6, "wait": 35, "signal": "GREEN"},
                    {"dir": "E", "cars": 60, "queue": 8, "wait": 42, "signal": "RED"},
                    {"dir": "S", "cars": 30, "queue": 2, "wait": 20, "signal": "GREEN"},
                    {"dir": "W", "cars": 25, "queue": 2, "wait": 18, "signal": "RED"},
                ]),
            },
            {
                "id": "I2",
                "name": "Market Road",
                "x_pos": 600,
                "y_pos": 180,
                "traffic_density": 82.0,
                "queue_length": 34,
                "avg_wait_time": 56.0,
                "avg_speed": 18.0,
                "current_green_time": 25,
                "current_red_time": 50,
                "recommended_green_time": 40,
                "signal_phase": "RED",
                "signal_timer": 24,
                "status": "CONGESTED",
                "approaches_json": json.dumps([
                    {"dir": "N", "cars": 80, "queue": 12, "wait": 60, "signal": "RED"},
                    {"dir": "E", "cars": 95, "queue": 14, "wait": 68, "signal": "RED"},
                    {"dir": "S", "cars": 50, "queue": 5, "wait": 40, "signal": "GREEN"},
                    {"dir": "W", "cars": 40, "queue": 3, "wait": 30, "signal": "GREEN"},
                ]),
            },
            {
                "id": "I3",
                "name": "Railway Junction",
                "x_pos": 850,
                "y_pos": 340,
                "traffic_density": 54.0,
                "queue_length": 14,
                "avg_wait_time": 31.0,
                "avg_speed": 34.0,
                "current_green_time": 35,
                "current_red_time": 35,
                "recommended_green_time": 35,
                "signal_phase": "GREEN",
                "signal_timer": 12,
                "status": "NORMAL",
                "approaches_json": json.dumps([
                    {"dir": "N", "cars": 35, "queue": 4, "wait": 28, "signal": "GREEN"},
                    {"dir": "E", "cars": 40, "queue": 4, "wait": 30, "signal": "RED"},
                    {"dir": "S", "cars": 30, "queue": 3, "wait": 24, "signal": "GREEN"},
                    {"dir": "W", "cars": 35, "queue": 3, "wait": 26, "signal": "RED"},
                ]),
            },
            {
                "id": "I4",
                "name": "Hospital Road",
                "x_pos": 300,
                "y_pos": 480,
                "traffic_density": 48.0,
                "queue_length": 10,
                "avg_wait_time": 22.0,
                "avg_speed": 40.0,
                "current_green_time": 40,
                "current_red_time": 30,
                "recommended_green_time": 35,
                "signal_phase": "GREEN",
                "signal_timer": 20,
                "status": "NORMAL",
                "approaches_json": json.dumps([
                    {"dir": "N", "cars": 30, "queue": 3, "wait": 20, "signal": "GREEN"},
                    {"dir": "E", "cars": 35, "queue": 3, "wait": 22, "signal": "RED"},
                    {"dir": "S", "cars": 25, "queue": 2, "wait": 18, "signal": "GREEN"},
                    {"dir": "W", "cars": 20, "queue": 2, "wait": 15, "signal": "RED"},
                ]),
            },
            {
                "id": "I5",
                "name": "Tech Park",
                "x_pos": 600,
                "y_pos": 480,
                "traffic_density": 74.0,
                "queue_length": 26,
                "avg_wait_time": 45.0,
                "avg_speed": 22.0,
                "current_green_time": 30,
                "current_red_time": 45,
                "recommended_green_time": 42,
                "signal_phase": "RED",
                "signal_timer": 15,
                "status": "NORMAL",
                "approaches_json": json.dumps([
                    {"dir": "N", "cars": 70, "queue": 9, "wait": 48, "signal": "RED"},
                    {"dir": "E", "cars": 75, "queue": 10, "wait": 52, "signal": "RED"},
                    {"dir": "S", "cars": 40, "queue": 4, "wait": 32, "signal": "GREEN"},
                    {"dir": "W", "cars": 45, "queue": 3, "wait": 30, "signal": "GREEN"},
                ]),
            },
            {
                "id": "I6",
                "name": "Highway Junction",
                "x_pos": 150,
                "y_pos": 340,
                "traffic_density": 58.0,
                "queue_length": 16,
                "avg_wait_time": 29.0,
                "avg_speed": 36.0,
                "current_green_time": 35,
                "current_red_time": 35,
                "recommended_green_time": 38,
                "signal_phase": "GREEN",
                "signal_timer": 22,
                "status": "NORMAL",
                "approaches_json": json.dumps([
                    {"dir": "N", "cars": 40, "queue": 4, "wait": 26, "signal": "GREEN"},
                    {"dir": "E", "cars": 45, "queue": 5, "wait": 30, "signal": "RED"},
                    {"dir": "S", "cars": 35, "queue": 4, "wait": 25, "signal": "GREEN"},
                    {"dir": "W", "cars": 30, "queue": 3, "wait": 20, "signal": "RED"},
                ]),
            }
        ]
        for item in initial_intersections:
            db.add(IntersectionDB(**item))
        
        # Initial Safety Incident
        db.add(SafetyIncidentDB(
            id="INC-101",
            timestamp=datetime.utcnow(),
            incident_type="Sudden Congestion",
            severity="HIGH",
            location="I2 - Market Road",
            details="Heavy traffic surge detected on East approach. Queue length exceeds 30 vehicles.",
            status="NEW"
        ))

        # Initial Vehicle Detections
        db.add(VehicleDetectionDB(
            intersection_id="I1",
            approach="South",
            cars_count=22,
            bikes_count=18,
            buses_count=3,
            school_buses_count=2,
            heavy_vehicles_count=4,
            emergency_vehicles_count=1,
            pedestrians_count=12,
            highest_density_approach="South"
        ))

        # Initial Priority Event
        db.add(PriorityEventDB(
            id="PRIO-101",
            timestamp=datetime.utcnow(),
            event_type="School/College Bus",
            priority_level=2,
            location="I1 - Central Junction",
            status="ACTIVE"
        ))

        # Initial Wrong Way Event
        db.add(WrongWayEventDB(
            id="WW-2026-001",
            timestamp=datetime.utcnow(),
            camera_id="CAM-I2-EAST",
            intersection_id="I2 - Market Road",
            detected_direction="Westbound (Wrong-way)",
            expected_direction="Eastbound",
            severity="CRITICAL",
            evidence_status="VERIFIED_CAMERA_FEED"
        ))

        # Initial Accident Event
        db.add(AccidentEventDB(
            id="ACC-2026-004",
            timestamp=datetime.utcnow(),
            location="I4 - Hospital Road",
            camera_id="CAM-I4-NORTH",
            severity="HIGH",
            emergency_dispatched=True,
            status="ACTIVE"
        ))

        # Initial Impaired Driving Event
        db.add(ImpairedDrivingDB(
            id="IMP-2026-088",
            timestamp=datetime.utcnow(),
            vehicle_id="KA-01-MJ-8821",
            location="I5 - Tech Park",
            swerving_score=86.4,
            risk_score=79.5,
            status="MONITORING"
        ))

        # Initial Pedestrian Safety Event
        db.add(PedestrianSafetyDB(
            id="PED-2026-012",
            timestamp=datetime.utcnow(),
            location="I1 - Central Junction",
            crosswalk_id="CW-NORTH-01",
            signal_state="RED",
            phone_distracted=True,
            warning_displayed=True
        ))

        # Initial System Event
        db.add(SystemEventDB(
            timestamp=datetime.utcnow(),
            event_type="SYSTEM_INIT",
            message="SAFE PULSE 360 backend initialized with 6 core urban intersections and safety monitors.",
            severity="SUCCESS"
        ))

        db.commit()
    db.close()

