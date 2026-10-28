# Smart Parking Slot Allocation Using ANPR
## Smart Pushkaralu 2027 – Rajahmundry, Andhra Pradesh

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-06b6d4.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev/)

An intelligent, responsive control room web application built for the **Smart Pushkaralu 2027** mega-pilgrimage festival along the Godavari riverfront in Rajahmundry, Andhra Pradesh, India.

---

## 1. System Overview & Visual Design

Based directly on the **Smart Pushkaralu 2027 "Smart Parking Slot Allocation Using ANPR"** control room architecture:
- **Theme**: Smart city pilgrimage crowd management, riverfront ingress/egress control, and intelligent transportation systems.
- **Color Palette**: Deep Navy Blue (`#0b1120`, `#0f172a`), Smart Cyan (`#06b6d4`), Pure White (`#ffffff`), Emerald Green (`#22c55e`), Pushkaralu Sunset Amber (`#f59e0b`), and Saffron Orange (`#f97316`).
- **Ghat Coverage**: Kotilingala Ghat (Zone A), Main Pushkar Ghat (Zone B), Riverfront Bus Depot (Zone C), Saraswathi Ghat (Zone D), and Protocol VIP Enclave (Zone V).

---

## 2. Benchmark Initial Demonstration Dataset

All metrics in the application are derived dynamically from individual slot states:

| Parking Category | Vehicle Types | Total Capacity | Occupied Slots | Available Slots | Initial Occupancy |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Car Parking** | Private Hatchbacks, Sedans, SUVs | **200** | **120** | **80** | **60%** |
| **Bus Parking** | APSRTC Shuttles, Tour Buses | **20** | **12** | **8** | **60%** |
| **Bike Parking** | Two-Wheelers, Scooters | **100** | **45** | **55** | **45%** |
| **VIP Parking** | Protocol Dignitaries, Endowments Escorts | **10** | **5** | **5** | **50%** |
| **Global Total** | **All Categories** | **330** | **182** | **148** | **55.2%** |

*Note: In the mini slide widget, non-bike vehicular slots (Car 120 + Bus 12 + VIP 5 = 137 occupied / 230 slots = 63% occupancy) are tracked synchronously.*

---

## 3. Core Application Modules & 10 Working Screens

1. **Dashboard (`/dashboard`)**:
   - Dynamic category cards with capacity, occupancy rate, real-time entry/exit counts, and status indicators.
   - Exact replica of the slide's **"Parking Dashboard (Live)"** widget.
   - Scenic Rajahmundry Godavari riverfront control room banner.
   - Live activity stream of incoming vehicles and ANPR detections.

2. **Live Parking Map (`/map`)**:
   - Interactive 2D layout of all 330 individual bays.
   - Status color-coded: **Green (Available)**, **Red (Occupied)**, **Amber (Reserved)**, and **Gray (Maintenance)**.
   - Filterable by zone, category, and occupancy status.
   - Click any slot to view telemetry, parked plate number, or manually allocate/release.

3. **ANPR Monitoring (`/anpr`)**:
   - Real-time computer vision simulation with green license plate bounding box overlay `[244, 189, 152, 46]`.
   - Connected webcam capture (via WebRTC) and image upload.
   - Cropped plate texture generation with IND blue strip and high-contrast HSRP text.
   - Indian vehicle registration format regex validation (AP, TS, DL, MH, KA, TN, BH-series).
   - Operator manual review modal and repeat entry collision warning.
   - Pre-loaded test vehicle library featuring reference vehicle `AP 39 XX 1234`.

4. **Vehicle Entry Workflow (`/entry`)**:
   - Ingress gate dispatch (Gates 1 to 5).
   - Automatic execution of the Intelligent Slot Allocation Engine.
   - Printable thermal parking ticket with token QR code, slot assignment, and walking directions.
   - Simulated physical boom barrier gate arm animation with statutory safety interlock.

5. **Vehicle Exit Workflow (`/exit`)**:
   - Scan token QR or lookup license plate.
   - Parked dwell time calculation and pilgrimage pass clearance.
   - Atomic release of slot back to the available pool.

6. **Slot Allocation Engine (`/allocation`)**:
   - Configurable rule-based optimizer evaluating vacancy, walking distance, vehicle category, and entrance road congestion.
   - Multi-objective scoring equation:
     $$\text{ZoneScore} = W_{\text{avail}} \cdot \left(\frac{\text{Free}}{\text{Cap}}\right) + W_{\text{flow}} \cdot (1 - \text{Cong}) + W_{\text{dist}} \cdot \left(1 - \frac{\text{Dist}}{600}\right)$$
   - Interactive weight sliders and step-by-step decision trace visualizer.

7. **Vehicle Records & Audit Log (`/records`)**:
   - Searchable transactional ledger of all active and completed sessions.
   - Full audit trail recording operator identity, timestamps, manual OCR edits, and overrides.
   - 1-click CSV export matching current filters.

8. **Analytics & Reports (`/analytics`)**:
   - 24-Hour hourly vehicular inflow vs outflow chart matching sacred Pushkaralu holy dip rush (4 AM - 8 AM) and evening Harathi (4 PM - 8 PM).
   - Category utilization progress bars and corridor congestion status.
   - Exportable analytics data report.

9. **LED Variable Message Signboard (VMS) Preview (`/signboard`)**:
   - High-fidelity replica of the roadside LED matrix gantry shown on Slide 11.
   - Live availability counters: Main Parking (Green), Ghat Parking (Amber), Bus Parking (Red/Limited), VIP Parking (Green).
   - Directional arrows and dynamic highway diversion advisories.
   - Bilingual display: English and Telugu (*"స్మార్ట్ పుష్కరాలు 2027 | పార్కింగ్ లభ్యత"*).
   - Day / Night mode toggle.

10. **Administration & Settings (`/settings`)**:
    - Role-Based Access Control (RBAC): Admin, Operator, and Traffic Police.
    - ANPR confidence threshold slider (default 85%).
    - Data privacy retention policy (7, 14, 30 days) per Indian DPDP guidelines.
    - Camera and barrier hardware diagnostics.
    - Simulation engine speed slider and 1-click demo benchmark reset.

---

## 4. Local Setup & Execution

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **npm**

### Installation & Run
```powershell
# 1. Install dependencies
npm.cmd install

# 2. Run local development server
npm.cmd run dev

# 3. Open browser at:
# http://localhost:5173/

# 4. Production Build:
npm.cmd run build
```

---

## 5. Hardware Deployment Specifications for Live Operation

When transitioning from Demonstration Mode to Physical Field Deployment:
1. **ANPR Cameras**: High-definition LPR/ANPR IP cameras (HIKVISION / Dahua / Axis) with infrared illuminators and 1080p@60fps RTSP streams.
2. **Barrier Gate Controllers**: Modbus / RS-485 / MQTT PLC relays connected to boom barrier motors.
3. **Variable Message Signs**: Full-matrix RGB LED signboards over NTCIP or TCP/IP socket protocol.
4. **Occupancy Sensors**: Ultrasonic overhead slot sensors or geomagnetic wireless puck sensors per parking bay.
5. **Edge Computer / Gateway**: NVIDIA Jetson Orin or industrial IPC running TensorRT / PaddleOCR inference.
