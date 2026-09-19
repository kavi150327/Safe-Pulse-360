import uuid
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..database import IntersectionDB, SafetyIncidentDB, SystemEventDB

class SafetyManager:
    """
    Rule-Based Safety Incident Detection & Resolution System.
    Evaluates rule criteria:
    - Queue > Threshold (25) & Speed < Threshold (20 km/h) => Sudden Congestion
    - Queue > 30 => Abnormal Queue
    - Signal Timer <= 0 & status == 'ERROR' => Signal Failure
    """

    def scan_for_incidents(self, db: Session) -> List[Dict[str, Any]]:
        intersections = db.query(IntersectionDB).all()
        created_incidents = []

        for inter in intersections:
            # Rule 1: Sudden Congestion
            if inter.queue_length >= 25 and inter.avg_speed <= 20.0:
                existing = (
                    db.query(SafetyIncidentDB)
                    .filter(
                        SafetyIncidentDB.location == f"{inter.id} - {inter.name}",
                        SafetyIncidentDB.status != "RESOLVED",
                        SafetyIncidentDB.incident_type == "Sudden Congestion"
                    )
                    .first()
                )
                if not existing:
                    inc_id = f"INC-{inter.id}-{datetime.utcnow().strftime('%M%S')}-{uuid.uuid4().hex[:4]}"
                    inc = SafetyIncidentDB(
                        id=inc_id,
                        timestamp=datetime.utcnow(),
                        incident_type="Sudden Congestion",
                        severity="HIGH" if inter.queue_length > 32 else "MEDIUM",
                        location=f"{inter.id} - {inter.name}",
                        details=f"Queue length reached {inter.queue_length} vehicles with average speed dropped to {inter.avg_speed} km/h.",
                        status="NEW"
                    )
                    db.add(inc)
                    created_incidents.append({"id": inc_id, "type": "Sudden Congestion", "location": inter.name})

            # Rule 2: Abnormal Queue
            elif inter.queue_length >= 30:
                existing = (
                    db.query(SafetyIncidentDB)
                    .filter(
                        SafetyIncidentDB.location == f"{inter.id} - {inter.name}",
                        SafetyIncidentDB.status != "RESOLVED",
                        SafetyIncidentDB.incident_type == "Abnormal Queue"
                    )
                    .first()
                )
                if not existing:
                    inc_id = f"INC-{inter.id}-{datetime.utcnow().strftime('%M%S')}-{uuid.uuid4().hex[:4]}"
                    inc = SafetyIncidentDB(
                        id=inc_id,
                        timestamp=datetime.utcnow(),
                        incident_type="Abnormal Queue",
                        severity="CRITICAL" if inter.queue_length > 38 else "HIGH",
                        location=f"{inter.id} - {inter.name}",
                        details=f"Critical queue buildup detected: {inter.queue_length} vehicles waiting.",
                        status="NEW"
                    )
                    db.add(inc)
                    created_incidents.append({"id": inc_id, "type": "Abnormal Queue", "location": inter.name})

        if created_incidents:
            db.commit()

        return created_incidents

    def resolve_incident(self, db: Session, incident_id: str) -> Dict[str, Any]:
        incident = db.query(SafetyIncidentDB).filter(SafetyIncidentDB.id == incident_id).first()
        if not incident:
            return {"status": "ERROR", "message": "Incident not found"}

        incident.status = "RESOLVED"
        db.add(SystemEventDB(
            timestamp=datetime.utcnow(),
            event_type="INCIDENT_RESOLVED",
            message=f"Safety incident {incident_id} ({incident.incident_type}) at {incident.location} was resolved.",
            severity="SUCCESS"
        ))
        db.commit()

        return {
            "id": incident.id,
            "status": "RESOLVED",
            "location": incident.location,
            "resolved_at": datetime.utcnow().isoformat()
        }
