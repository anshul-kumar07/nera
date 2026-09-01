# NERA — SMART INDIA HACKATHON DEMONSTRATION SCRIPT (5–7 MINUTES)

---

## 00:00 — Problem & Challenge
> "Respected Judges, the North Eastern Region of India faces extreme geographical vulnerability—heavy monsoons, frequent landslides, and severe mountain choke points that disconnect entire districts during crises. Current disaster logistics rely on disconnected phone calls, unverified rumors, and slow paper authorizations. When a major corridor like NH-27 is blocked, emergency supply chains collapse."

---

## 00:30 — NERA Overview
> "To solve this, we built **NERA** — *North Eastern Resilience and Accessibility*. NERA is a production-grade, government-standard command and control platform that combines AI early warnings, dynamic road network routing, strict physical safety gates, last-mile Vehicle Access Points (VAP), and official RBAC approvals into one unified decision support center."

---

## 01:00 — Step 1 & 2: AI Early Warning & Hazard Ingestion
> "Let's begin in our Command Center (`/demo`). In Step 1, baseline operations are normal. In Step 2, our hazard engine detects heavy rainfall and slope saturation along NH-27 KM 48. Notice: NERA generates an advisory risk alert, but strictly **does NOT close the road**. In NERA, AI recommends and alerts, but never autonomously severs corridors."

---

## 01:30 — Step 3 & 4: Field Report & Statutory Confirmation
> "In Step 3, a field officer on the ground submits a geotagged photo report. The incident is marked as `REPORTED`. In Step 4, the District Disaster Authority reviews the evidence and officially confirms the landslide. **Only upon official statutory confirmation** does the corridor become blocked, instantly triggering our dynamic Dijkstra + OSRM engine to compute the Lanka alternate bypass."

---

## 02:30 — Step 5 & 6: Logistics Mission & Physical Safety Gate
> "In Step 5, Haflong DEOC requests 350 emergency pediatric and trauma kits. NERA matches this to our Guwahati Apex Depot without phantom stock. In Step 6, our 8-point physical safety gate evaluates the candidate carrier. Notice our critical architectural distinction: **Deployment Safety** (`READY`) is strictly independent from **AI Maintenance Risk** (`LOW`). An unsafe vehicle is strictly blocked from deployment."

---

## 03:30 — Step 7 & 8: Official Commander Approval & Live GPS Telemetry
> "In Step 7, Brigadier Barman (Senior Commander) authorizes the mission. In Step 8, the convoy is dispatched and streams real-time GPS telemetry following actual OSRM road geometry at 45 km/h along the mountain corridor."

---

## 04:15 — Step 9 & 10: Mid-Route Reroute & In-Transit Vehicle Failure
> "In Step 9, a secondary culvert floods. NERA reroutes the convoy dynamically **from its current GPS location**—no depot teleportation. In Step 10, the carrier experiences transmission failure. The mission transitions to `INTERRUPTED`, preserving exact GPS coordinates and generating a critical P0 attention card."

---

## 05:00 — Step 11: Replacement Carrier & Cargo Handover
> "In Step 11, NERA identifies eligible replacement carrier NER-TRUCK-07 based on readiness and proximity. A physical cargo handover is verified on site before resuming transit."

---

## 05:45 — Step 12: Last-Mile VAP Response
> "In Step 12, the convoy reaches the Vehicle Access Point (VAP). Reaching VAP does **NOT** equal delivery. NERA calculates a 3.8 km non-road gap and designates a specialized 4x4 / Walking Field Team mode."

---

## 06:15 — Step 13: Final Delivery & Statutory Completion Sign-off
> "In Step 13, the field team confirms delivery at Haflong Civil Hospital. The Medical Superintendent and Disaster Authority sign off, officially completing the mission, releasing the vehicle back to `AVAILABLE`, and recording an immutable entry in our append-only audit trail."

---

## 06:45 — Conclusion
> "NERA is explainable, deterministic, secure, and preserves full human authority at every operational junction. Thank you!"

