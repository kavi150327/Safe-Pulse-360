import json
import heapq
from datetime import datetime
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from ..database import IntersectionDB, EmergencyEventDB, PriorityEventDB, SystemEventDB

class EmergencyCorridorManager:
    """
    Manages Emergency Green Wave Corridors across the intersection graph (I1-I6).
    Calculates optimal shortest routes, overrides signal phase timings along the corridor,
    and calculates normal vs optimized ETAs.
    """

    def __init__(self):
        # Graph adjacency list with edge weights (distances in meters)
        self.graph = {
            "I1": [("I2", 300), ("I4", 300), ("I6", 200)],
            "I2": [("I1", 300), ("I3", 300), ("I5", 300)],
            "I3": [("I2", 300), ("I5", 300)],
            "I4": [("I1", 300), ("I5", 300), ("I6", 200)],
            "I5": [("I2", 300), ("I3", 300), ("I4", 300)],
            "I6": [("I1", 200), ("I4", 200)]
        }

    def compute_route(self, start: str, dest: str) -> List[str]:
        if start not in self.graph or dest not in self.graph:
            return [start, dest]
        if start == dest:
            return [start]

        distances = {node: float('inf') for node in self.graph}
        previous = {node: None for node in self.graph}
        distances[start] = 0
        pq = [(0, start)]

        while pq:
            curr_dist, curr_node = heapq.heappop(pq)
            if curr_dist > distances[curr_node]:
                continue
            if curr_node == dest:
                break

            for neighbor, weight in self.graph[curr_node]:
                dist = curr_dist + weight
                if dist < distances[neighbor]:
                    distances[neighbor] = dist
                    previous[neighbor] = curr_node
                    heapq.heappush(pq, (dist, neighbor))

        path = []
        curr = dest
        while curr:
            path.append(curr)
            curr = previous[curr]
        path.reverse()
        return path if path[0] == start else [start, dest]

    def activate_corridor(self, db: Session, start: str, dest: str, vehicle_type: str = "Ambulance") -> Dict[str, Any]:
        route = self.compute_route(start, dest)
        
        # Calculate normal vs optimized ETA
        intersections = db.query(IntersectionDB).filter(IntersectionDB.id.in_(route)).all()
        inter_map = {i.id: i for i in intersections}

        total_wait_on_route = sum(inter_map[nid].avg_wait_time if nid in inter_map else 30.0 for nid in route)
        distance_meters = len(route) * 350
        
        normal_travel_time_sec = int((distance_meters / 8.33) + total_wait_on_route)  # ~30 km/h + wait times
        optimized_travel_time_sec = int((distance_meters / 13.88) + (len(route) * 4)) # ~50 km/h + zero red lights
        time_saved_sec = max(25, normal_travel_time_sec - optimized_travel_time_sec)

        # Update signal timing and status on route
        for nid in route:
            if nid in inter_map:
                inter = inter_map[nid]
                inter.signal_phase = "GREEN"
                inter.signal_timer = 60
                inter.status = "EMERGENCY"
                inter.recommended_green_time = 60

        # Create Emergency Event record
        event_id = f"EMG-{datetime.utcnow().strftime('%M%S')}"
        emg_record = EmergencyEventDB(
            id=event_id,
            timestamp=datetime.utcnow(),
            vehicle_type=vehicle_type,
            start_intersection=start,
            destination_intersection=dest,
            route_json=json.dumps(route),
            normal_eta_sec=normal_travel_time_sec,
            optimized_eta_sec=optimized_travel_time_sec,
            time_saved_sec=time_saved_sec,
            status="ACTIVE"
        )
        db.add(emg_record)

        # Log system notification
        start_name = inter_map.get(start, None).name if start in inter_map else start
        dest_name = inter_map.get(dest, None).name if dest in inter_map else dest
        db.add(SystemEventDB(
            timestamp=datetime.utcnow(),
            event_type="EMERGENCY_CORRIDOR_ACTIVATED",
            message=f"Green corridor activated for {vehicle_type} from {start_name} to {dest_name}. Saved ~{time_saved_sec}s.",
            severity="WARNING"
        ))

        db.commit()

        return {
            "event_id": event_id,
            "vehicle_type": vehicle_type,
            "start_intersection": start,
            "destination_intersection": dest,
            "route": route,
            "intersections_cleared": len(route),
            "normal_eta_sec": normal_travel_time_sec,
            "optimized_eta_sec": optimized_travel_time_sec,
            "time_saved_sec": time_saved_sec,
            "status": "ACTIVE"
        }
