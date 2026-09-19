# 🚦 SafePulse 360

### Quantum-Enhanced Adaptive Urban Traffic Optimization

**SafePulse 360** is an intelligent urban traffic and safety management platform designed to optimize traffic signals across connected intersections using adaptive traffic analysis and quantum-inspired optimization techniques.

The system focuses on reducing traffic congestion, waiting time, fuel consumption, and CO₂ emissions while supporting emergency vehicle priority and safer urban mobility.

---

## 🌐 Live Demo

### 🚀 Deployed Application

**[Open SafePulse 360 →](https://kavi150327.github.io/Safe-Pulse-360/)**

> The live version is deployed using GitHub Pages.

---

## 📌 Problem Statement

### Quantum-Enhanced Adaptive Urban Traffic Optimization

Traditional traffic signals often use fixed timing patterns. They cannot efficiently respond to:

* 🚗 Sudden changes in traffic density
* 🚦 Long vehicle queues
* 🚑 Emergency vehicle movement
* 🚧 Accidents and road closures
* 🚶 Pedestrian movement
* 🌐 Congestion across multiple connected intersections

Poor coordination between intersections can increase:

* Waiting time
* Traffic congestion
* Fuel consumption
* CO₂ emissions
* Emergency response time

---

## 💡 Proposed Solution

SafePulse 360 provides an intelligent traffic command center that continuously monitors urban traffic conditions and dynamically optimizes traffic signals.

The platform combines:

**Real-Time Traffic Data → Prediction → Optimization → Safety Validation → Adaptive Signals**

The system can also prioritize emergency vehicles and create coordinated green corridors across multiple intersections.

---

## ✨ Key Features

### 🚦 Adaptive Traffic Signal Optimization

Traffic signal timing can be adjusted according to:

* Vehicle density
* Queue length
* Road capacity
* Current signal status
* Traffic congestion

### 🧠 Quantum-Inspired Optimization

The traffic signal optimization problem is formulated as a **QUBO (Quadratic Unconstrained Binary Optimization)** problem.

The optimization considers multiple objectives such as:

* Waiting time
* Queue length
* Congestion
* Emergency priority
* Fuel consumption
* CO₂ emissions

The system uses a hybrid/quantum-inspired approach to search for improved signal configurations.

### 🚑 Emergency Green Corridor

When an emergency vehicle is detected, SafePulse 360 can coordinate multiple intersections to create a green corridor.

Example:

```text
Emergency Vehicle
       ↓
Intersection 1
       ↓
Intersection 2
       ↓
Intersection 3
       ↓
Destination
```

This helps reduce unnecessary stopping at consecutive traffic signals.

### 🔄 Post-Emergency Recovery

After an emergency vehicle passes, the system can re-evaluate traffic conditions and adjust the affected intersections to reduce queues created during emergency priority.

### 🚧 Dynamic Incident Handling

The system can simulate events such as:

* Accidents
* Road closures
* Sudden congestion
* Emergency vehicle arrival
* Traffic spikes

### 📊 Traffic Analytics

The dashboard provides traffic-related information such as:

* Vehicle density
* Queue length
* Waiting time
* Throughput
* Fuel consumption
* CO₂ emissions
* Signal states

### 🏙️ Urban Safety Monitoring

SafePulse 360 is designed as a centralized command-center interface for monitoring traffic and safety conditions across an urban intersection network.

---

## 🏗️ System Architecture

```text
             ┌─────────────────────┐
             │ Traffic Data /      │
             │ Simulation Input    │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ Traffic Monitoring  │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ Traffic Prediction  │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ QUBO Formulation    │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ Quantum-Inspired /  │
             │ Hybrid Optimization │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ Safety Validation   │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ Adaptive Signals    │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │ Analytics Dashboard │
             └─────────────────────┘
```

---

## 🚑 Emergency Green Corridor

The emergency module provides coordinated traffic priority.

### Workflow

```text
Emergency Detected
        ↓
Find Emergency Route
        ↓
Identify Affected Intersections
        ↓
Calculate Green Corridor
        ↓
Coordinate Traffic Signals
        ↓
Emergency Vehicle Passes
        ↓
Recalculate Traffic
        ↓
Normal Traffic Recovery
```

The objective is not only to prioritize the emergency vehicle but also to minimize disruption to surrounding traffic.

---

## 🧠 QUBO Optimization

The traffic optimization problem can be represented using a Quadratic Unconstrained Binary Optimization formulation.

The optimization objective can consider:

```text
Traffic Cost =
    Waiting Time
  + Queue Length
  + Congestion
  + Emergency Priority
  + Fuel Consumption
  + CO₂ Emissions
```

Example optimization weights:

| Parameter          | Weight |
| ------------------ | -----: |
| Waiting Time       |    35% |
| Queue Length       |    20% |
| Congestion         |    20% |
| Emergency Priority |    15% |
| Fuel Consumption   |     5% |
| CO₂ Emissions      |     5% |

These weights can be adjusted according to the simulation scenario.

---

## 📈 Before vs After Optimization

SafePulse 360 can compare traffic conditions before and after optimization.

| Metric                | Before |    After |
| --------------------- | -----: | -------: |
| Average Waiting Time  | Higher |  Reduced |
| Queue Length          | Higher |  Reduced |
| Congestion            | Higher |  Reduced |
| Throughput            |  Lower | Improved |
| Fuel Consumption      | Higher |  Reduced |
| CO₂ Emissions         | Higher |  Reduced |
| Emergency Travel Time | Higher |  Reduced |

> The actual values depend on the traffic simulation scenario.

---

## 🖥️ Dashboard

The SafePulse 360 interface is designed as an urban traffic command center.

Possible dashboard sections include:

* 🏠 Dashboard
* 🚦 Live Traffic
* 🛣️ Intersections
* 📈 Prediction
* 🧠 Optimization
* 🚑 Emergency Corridor
* 🛡️ Safety
* 🚆 Railway Safety
* 📊 Analytics
* 🕒 History
* ⚙️ System

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Recharts
* Lucide Icons

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite

### Optimization

* QUBO
* Quantum-inspired optimization
* Hybrid quantum-classical approach
* Traffic simulation

### Deployment

* GitHub
* GitHub Pages

The repository currently includes frontend configuration such as `package.json`, `vite.config.ts`, `src`, and `public`, together with backend-related files and `requirements.txt`.

---

## 📂 Project Structure

```text
Safe-Pulse-360/
│
├── backend/
│   └── Backend services and APIs
│
├── public/
│   └── Static assets
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── application source
│
├── docs/
│   └── Documentation
│
├── .github/
│   └── workflows/
│
├── index.html
├── package.json
├── package-lock.json
├── requirements.txt
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Running the Frontend Locally

Clone the repository:

```bash
git clone https://github.com/kavi150327/Safe-Pulse-360.git
```

Move into the project:

```bash
cd Safe-Pulse-360
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The terminal will provide the local development URL.

---

## 🔧 Backend Setup

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Then start the backend according to the backend entry point configured in the project.

---

## 🌐 Deployment

The frontend is deployed through **GitHub Pages**.

### Live URL

**https://kavi150327.github.io/Safe-Pulse-360/**

Repository:

**https://github.com/kavi150327/Safe-Pulse-360**

---

## 🎯 Hackathon Demo Flow

A simple demonstration can follow this sequence:

```text
1. Open Dashboard
        ↓
2. Show Live Traffic
        ↓
3. Select Multiple Intersections
        ↓
4. Show Traffic Prediction
        ↓
5. Run Optimization
        ↓
6. Compare Before vs After
        ↓
7. Trigger Emergency Vehicle
        ↓
8. Show Green Corridor
        ↓
9. Simulate Accident / Congestion
        ↓
10. Show Adaptive Recovery
        ↓
11. Display Analytics
```

---

## 🌱 Expected Impact

SafePulse 360 aims to support:

* Reduced traffic waiting time
* Reduced queue length
* Better intersection coordination
* Faster emergency response
* Reduced fuel wastage
* Reduced CO₂ emissions
* Improved traffic throughput
* More responsive urban traffic management

---

## 🔬 Research Direction

The project builds on existing research into QUBO-based traffic-signal optimization and extends the idea toward an event-aware traffic-management workflow.

Instead of optimizing traffic only once, the proposed system follows a continuous loop:

```text
Monitor
   ↓
Detect Event
   ↓
Select Affected Intersections
   ↓
Optimize
   ↓
Validate
   ↓
Apply Signal Plan
   ↓
Measure Result
   ↓
Recover / Re-optimize
```

This makes the system suitable for dynamic scenarios such as congestion, accidents, road closures, and emergency vehicle movement.

---

## ⚠️ Important Note

SafePulse 360 is a **prototype/simulation-based hackathon project**.

The quantum optimization component should be described as **quantum-inspired or hybrid quantum-classical optimization** unless actual quantum hardware execution has been connected and experimentally validated.

The traffic, fuel, and CO₂ results are simulation estimates and should not be interpreted as measurements from a real city traffic network.

---

## 👥 Team

**Team ID:** QUAN045

### Team Members

* Maha Smirthi S.S
* Kalaiselvi M
* Kiruthika N
* Kaviya D

---

## 📜 License

This project is developed as a hackathon prototype for demonstrating intelligent and quantum-enhanced urban traffic optimization.

---

## 🔗 Links

* 🚀 **Live Demo:** https://kavi150327.github.io/Safe-Pulse-360/
* 💻 **GitHub Repository:** https://github.com/kavi150327/Safe-Pulse-360

---

### 🚦 SafePulse 360

**Smarter Signals. Safer Streets. Faster Response.**

