from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from ..database import IntersectionDB, RailwayEventDB, SafetyIncidentDB, SystemEventDB

class RailwaySafetyManager:
    """
    Simulates Railway Safety Crossing logic for I3 - Railway Junction.
    Triggers train approach alerts, closes crossing gates, updates risk levels,
    and automatically adjusts nearby traffic signal phase timings to prevent gridlock.
    """

    def trigger_train_event(self, db: Session, action: str = "TRIGGER") -> Dict[str, Any]:
        i3 = db.query(IntersectionDB).filter(IntersectionDB.id == "I3").first()
        if not i3:
            return {"status": "ERROR", "message": "Railway Junction (I3) not found"}

        latest_event = (
            db.query(RailwayEventDB)
            .order_by(RailwayEventDB.timestamp.desc())
            .first()
        )

        event_id = f"RAIL-{datetime.utcnow().strftime('%M%S')}"

        if action == "CLEAR" or (latest_event and latest_event.gate_status == "CLOSED" and action != "TRIGGER"):
            # Clear Train Event
            gate_status = "OPEN"
            risk_level = "SAFE"
            train_detected = False
            details = "Train has cleared the crossing. Gates reopened. Normal signal plan restored."
            i3.status = "NORMAL"
            i3.signal_phase = "GREEN"
            i3.signal_timer = 30
        else:
            # Trigger Train Event
            gate_status = "CLOSED"
            risk_level = "HIGH RISK"
            train_detected = True
            details = "Train approach detected (Speed: 75 km/h, ETA: 30s). Crossing gates lowered. Emergency red signal active for railway approach."
            
            i3.status = "RAILWAY_WARN"
            i3.signal_phase = "RED"
            i3.signal_timer = 90
            i3.queue_length += 12
            i3.avg_wait_time += 25.0

            # Automatically create safety incident if risk is HIGH
            inc_id = f"INC-RAIL-{datetime.utcnow().strftime('%M%S')}"
            db.add(SafetyIncidentDB(
                id=inc_id,
                timestamp=datetime.utcnow(),
                incident_type="Railway Crossing Risk",
                severity="CRITICAL",
                location="I3 - Railway Junction",
                details="Active train crossing event. Gate closed and traffic queue building rapidly.",
                status="NEW"
            ))

        rail_event = RailwayEventDB(
            id=event_id,
            timestamp=datetime.utcnow(),
            crossing_name="I3 - Railway Junction",
            gate_status=gate_status,
            risk_level=risk_level,
            train_detected=train_detected,
            details=details
        )
        db.add(rail_event)

        db.add(SystemEventDB(
            timestamp=datetime.utcnow(),
            event_type="RAILWAY_EVENT_TRIGGERED",
            message=f"Railway event {event_id}: Gate is now {gate_status} (Risk Level: {risk_level}).",
            severity="WARNING" if train_detected else "SUCCESS"
        ))

        db.commit()

        return {
            "event_id": event_id,
            "crossing_name": "I3 - Railway Junction",
            "gate_status": gate_status,
            "risk_level": risk_level,
            "train_detected": train_detected,
            "details": details,
            "intersection_status": i3.status,
            "signal_phase": i3.signal_phase,
            "signal_timer": i3.signal_timer
        }

    def get_status(self, db: Session) -> Dict[str, Any]:
        latest_event = (
            db.query(RailwayEventDB)
            .order_by(RailwayEventDB.timestamp.desc())
            .first()
        )
        if not latest_event:
            return {
                "crossing_name": "I3 - Railway Junction",
                "gate_status": "OPEN",
                "risk_level": "SAFE",
                "train_detected": False,
                "details": "Normal railway operations."
            }
        return {
            "crossing_name": latest_event.crossing_name,
            "gate_status": latest_event.gate_status,
            "risk_level": latest_event.risk_level,
            "train_detected": latest_event.train_detected,
            "details": latest_event.details,
            "last_updated": latest_event.timestamp.isoformat()
        }
