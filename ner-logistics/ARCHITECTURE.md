# NERA — COMPLETE SYSTEM ARCHITECTURE & GOVERNANCE MODEL

## 1. High-Level Architectural Flow

```mermaid
flowchart TD
    EXT["External Data Feeds (Open-Meteo, AIS-140 GPS, Geological Advisories, Supabase)"] --> PR["1. Data Provenance & Freshness Engine (lib/data-source-health.ts)"]
    PR --> HZ["2. Hazard Feed & Route Vulnerability Adapter (lib/hazard-feed.ts)"]
    HZ --> INC["3. Incident Lifecycle (PREDICTED -> REPORTED -> CONFIRMED -> RESOLVED)"]
    
    INC --> RI{"Corridor Status Check"}
    RI -- "CONFIRMED Incident" --> RT["4. Dynamic Dijkstra + OSRM Routing Engine (lib/routing.ts)"]
    RI -- "PREDICTED / REPORTED" --> NBL["Corridor Remains Open (Advisory Only)"]
    
    RT --> MSN["5. Emergency Mission Management & Allocation (lib/missions.ts)"]
    MSN --> SG["6. Phase 11 Physical Vehicle Safety Gate (lib/vehicle-readiness.ts)"]
    SG --> AI["7. Phase 15 AI Predictive Vehicle Health (lib/vehicle-health-ai.ts)"]
    
    SG -- "READY / WARNING" --> OA["8. Statutory Commander Approval (lib/access-control.ts)"]
    SG -- "NOT_READY" --> BLK["BLOCKED: Cannot Deploy Unsafe Vehicle"]
    
    OA --> DSP["9. Official Convoy Dispatch & Telemetry Stream (lib/vehicle-data-provider.ts)"]
    DSP --> FLT{"In-Transit Obstruction / Failure"}
    FLT -- "Obstruction" --> RR["Mid-Route Reroute from Current Vehicle GPS"]
    FLT -- "Carrier Failure" --> REP["Replacement Dispatch -> Handover Verification (lib/vehicle-failure.ts)"]
    
    RR --> VAP["10. Vehicle Access Point (VAP) & Last-Mile Engine (lib/last-mile.ts)"]
    REP --> VAP
    
    VAP --> LM["11. Non-Road Last-Mile Response (Boat / 4x4 / Walking Team)"]
    LM --> DL["12. Final Recipient Delivery Verification"]
    DL --> CL["13. Statutory Authority Sign-Off & Mission Completion"]
    CL --> AUD["14. Append-Only Operational Statutory Audit Log (lib/audit-log.ts)"]
```

---

## 2. Architectural Layer Classification

| Layer | Type | Authority Scope | Responsibilities |
|---|---|---|---|
| **Layer 1: Deterministic Physical Safety** | `DETERMINISTIC` | Absolute | 8-point physical vehicle safety gate (`READY` / `NOT_READY`), finite depot inventory checks, zero phantom stock, strict Dijkstra/OSRM route geometry. |
| **Layer 2: AI Predictive Intelligence** | `AI ADVISORY` | Advisory Only | Weather disruption scoring, terrain landslide vulnerability, vehicle maintenance health risk (`LOW` to `CRITICAL`). **Never overrides physical safety or closes roads.** |
| **Layer 3: Human Administrative Authority** | `HUMAN AUTHORITY` | Statutory Sign-off | 8-role RBAC matrix (`COMMANDER`, `DISASTER_AUTHORITY`, etc.). Official disaster confirmation, mission dispatch approval, and mission completion. |

---

## 3. Data Provenance Standards

- `LIVE`: Verified external endpoint connected and updating within threshold (Open-Meteo, OSRM, Supabase).
- `STALE`: Outdated telemetry preserved at last known GPS coordinates without artificial drift.
- `OFFLINE`: Network disconnected; field reports buffered in local IndexedDB.
- `UNAVAILABLE`: Unconfigured external feeds explicitly labeled `DATA UNAVAILABLE` / `DATA INSUFFICIENT`.
- `SIMULATED`: Demonstration datasets explicitly labeled with `isSimulated: true`.

