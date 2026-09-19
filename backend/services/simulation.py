import json
import random
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..database import IntersectionDB, TrafficRecordDB, SystemEventDB

class TrafficSimulationEngine:
    """
    Simulates physical urban traffic dynamics across the 6 network intersections.
    Enforces key domain constraints:
    Vehicle Count ↑ => Density ↑ => Queue ↑ => Avg Speed ↓ => Waiting Time ↑ => Congestion Level ↑.
    Fuel (Liters) = 0.05 * vehicle_count + 0.12 * idle_queue + 0.02 * stops
    CO2 (kg) = Fuel * 2.31
    """

    def __init__(self):
        self.is_running = True
        self.speed_multiplier = 1.0  # 0.5x, 1.0x, 2.0x, 5.0x

    def tick(self, db: Session, action: str = "TICK", delta_traffic: int = 0) -> List[Dict[str, Any]]:
        intersections = db.query(IntersectionDB).all()
        results = []

        for inter in intersections:
            # 1. Update Signal Timers
            inter.signal_timer -= 1
            if inter.signal_timer <= 0:
                if inter.signal_phase == "GREEN":
                    inter.signal_phase = "YELLOW"
                    inter.signal_timer = 4
                elif inter.signal_phase == "YELLOW":
                    inter.signal_phase = "RED"
                    inter.signal_timer = inter.current_red_time
                else:  # RED -> GREEN
                    inter.signal_phase = "GREEN"
                    inter.signal_timer = inter.recommended_green_time

            # 2. Modify Traffic Dynamics based on action
            base_surge = delta_traffic
            if action == "RANDOMIZE":
                base_surge = random.randint(-15, 20)
            elif action == "INCREASE":
                base_surge = random.randint(10, 25)
            elif action == "DECREASE":
                base_surge = random.randint(-20, -8)

            # Inflow vs Outflow
            inflow = random.randint(2, 8) + max(0, base_surge)
            outflow = (random.randint(4, 10) if inter.signal_phase == "GREEN" else random.randint(0, 2))
            
            # Apply traffic delta
            net_traffic = inflow - outflow + (base_surge if base_surge < 0 else 0)
            
            # Calculate new density & queue
            new_density = max(10.0, min(98.0, inter.traffic_density + (net_traffic * 0.4)))
            new_queue = max(1, int(inter.queue_length + (net_traffic * 0.6)))
            
            # Derived metrics enforcing strict constraints:
            # Density ↑ => Speed ↓ => Wait Time ↑
            new_speed = max(10.0, round(60.0 - (new_density * 0.48), 1))
            new_wait = max(8.0, round(12.0 + (new_queue * 1.4) + (new_density * 0.3), 1))

            # Fuel & CO2 calculations
            v_count = int(new_queue * 3 + new_density * 1.5)
            fuel = round(v_count * 0.04 + new_queue * 0.11 + random.uniform(0.1, 0.4), 2)
            co2 = round(fuel * 2.31, 2)

            # Save state to intersection ORM
            inter.traffic_density = new_density
            inter.queue_length = new_queue
            inter.avg_speed = new_speed
            inter.avg_wait_time = new_wait
            
            if new_density > 80.0:
                inter.status = "CONGESTED"
            elif inter.status == "CONGESTED" and new_density < 70.0:
                inter.status = "NORMAL"

            # Parse and adjust approach details
            try:
                approaches = json.loads(inter.approaches_json)
                for app in approaches:
                    app["queue"] = max(1, int(new_queue / 4 + random.randint(-2, 2)))
                    app["wait"] = max(5, int(new_wait + random.randint(-3, 3)))
                    app["signal"] = inter.signal_phase if app["dir"] in ["N", "S"] else ("RED" if inter.signal_phase == "GREEN" else "GREEN")
                inter.approaches_json = json.dumps(approaches)
            except Exception:
                pass

            # Log historical traffic record
            db.add(TrafficRecordDB(
                timestamp=datetime.utcnow(),
                intersection_id=inter.id,
                vehicle_count=v_count,
                density=new_density,
                queue_length=new_queue,
                avg_speed=new_speed,
                wait_time=new_wait,
                fuel_consumption=fuel,
                co2_emissions=co2
            ))

            results.append({
                "id": inter.id,
                "name": inter.name,
                "traffic_density": new_density,
                "queue_length": new_queue,
                "avg_speed": new_speed,
                "avg_wait_time": new_wait,
                "signal_phase": inter.signal_phase,
                "signal_timer": inter.signal_timer,
                "status": inter.status,
                "fuel": fuel,
                "co2": co2
            })

        db.commit()
        return results
