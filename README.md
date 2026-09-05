# 🏛️ KronoRoom v2.0 — Intelligent Classroom & Lab Booking System

**KronoRoom v2.0** is an enterprise-grade, real-time Full-Stack MERN (MongoDB Atlas, Express.js, React 19, Node.js) Classroom & Lab Booking Platform custom-engineered for **London Metropolitan University**.

Version 2.0 brings a bespoke institutional academic design system, interactive WebGL fluid background physics, real-time cinema-style seat reservation, live occupancy telemetry, sub-second socket synchronization, role-based booking policies, and automated lifecycle background workers.

---

## 🚀 What's New in Version 2.0

- 🎓 **Bespoke Academic Design System:** High-contrast London Met university aesthetic utilizing Tailwind CSS v4, clean obsidian slate surfaces (`#0a0e17`, `#0f172a`), London Met Royal Blue accents (`#2563eb`), and subtle architectural grid depth.
- 🌊 **Interactive WebGL Fluid Physics:** Ambient fluid dynamics powered by custom WebGL shaders (`ogl`), rendered in signature fluid indigo (`#2623a8`) with atmospheric ambient glows.
- 💺 **Interactive Cinema-Style Seat Map:** Visual seat selection mapped to exact room capacities (50 workstations, 80 seminar seats, 100 auditorium seats) with instant multi-seat picking (`A1, A2, A3`) and architectural stage dividers.
- ⚡ **Real-Time WebSockets (`Socket.io`):** Instant campus-wide broadcast of seat reservations, cancellations, and check-ins without requiring manual page refreshes.
- ⏱️ **Live Occupancy Telemetry & Dynamic Timers:** Real-time countdowns indicating time until session release (e.g., `Free in 24m 15s`) and elapsed session badges.
- 🛡️ **Chair-Level Concurrency & Conflict Prevention:** Fine-grained time interval collision detection preventing overlapping seat bookings while allowing concurrent bookings in the same room.
- 🤖 **Automated Auto-Release Daemon:** Background cron worker (`node-cron`) that monitors overdue bookings and releases unclaimed seats automatically every 5 minutes.
- 💾 **Dual-Mode Zero-Config Database:** Seamlessly connects to MongoDB Atlas or automatically falls back to an embedded in-memory database with automatic seeding.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, WebGL / OGL (Fluid Dynamics), Framer Motion, Lucide React, Axios, Socket.io Client, React Router v7, date-fns |
| **Backend** | Node.js (ES Modules), Express.js, Socket.io, Mongoose (MongoDB Atlas), JSON Web Tokens (JWT), Bcrypt.js, Node-Cron, CORS |
| **Architecture & Tools** | RESTful APIs, WebSockets, Role-Based Access Control (RBAC), Oxlint |

---

## 🌟 Core Features & Modules

### 1. Interactive Multi-Seat Reservation
- Dynamic grid generation matching exact architectural layouts:
  - 🟢 **Available (Emerald):** Open for immediate reservation.
  - 🟡 **Upcoming Reservation (Amber):** Booked for an upcoming academic session.
  - 🔴 **In-Session / Active (Rose):** Actively occupied with live occupancy telemetry & countdown.
  - 🔵 **Selected (Royal Blue):** Current user's active seat selection.

### 2. Role-Based Access Control (RBAC)
- **👨‍🎓 Students:** Maximum 2-hour sessions, advance reservation window up to 3 days. Accessible via `/login/student`.
- **👨‍🏫 Faculty:** Extended 6-hour lecture/lab allocations, advance booking up to 30 days. Accessible via `/login/faculty`.
- **🛡️ Administrators:** Full campus analytics, room CRUD inventory management, user controls, and force-cancellation overrides.

### 3. London Met Academic Module Catalog
Pre-configured with official computing modules:
- `CC5051NI` — Databases
- `CS5053NI` — Cloud Computing & IoT
- `CT5052NI` — Network Operating Systems
- `CC5067NI` — Smart Data Discovery
- `CS5054NI` — Advanced Programming
- `CS5071NI` — Professional & Ethical Issues
- `CS5002NI` — Software Engineering

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Environment Setup
Create a `.env` file in the project root (or `server/`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-classroom?retryWrites=true&w=majority
JWT_SECRET=london_met_smart_classroom_jwt_secret_key_2026_super_secure
CLIENT_URL=http://localhost:5173
```
*(If no `MONGO_URI` is supplied or remote DB is unreachable, KronoRoom automatically falls back to an in-memory database with automatic seeding).*

---

### 3. Install Dependencies

```bash
# Install Server Dependencies
npm install --prefix server

# Install Client Dependencies
npm install --prefix client
```

---

### 4. Database Seeding (Optional)

The database will auto-seed on initial launch if empty. You can also manually reseed anytime:
```bash
npm run seed
```

---

### 5. Running the Application

You can launch both services individually or from the root:

#### **Start Backend Server**
```bash
npm run server
```
> Server runs at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

#### **Start Frontend Client**
```bash
npm run client
```
> Vite dev server runs at `http://localhost:5173`.

#### **Build for Production**
```bash
npm run build
```
> Verifies TypeScript / JSX bundle output in `client/dist`.

---

## 🔑 Preloaded Test Accounts (Password: `Password123`)

| Role | Name | Email | London Met ID | Department | Portal Link |
|---|---|---|---|---|---|
| **Admin** | Campus Administrator | `admin@londonmet.ac.uk` | `LM-ADM-001` | Campus Estates & IT | `/login/faculty` |
| **Faculty** | Subigyan Adhikari | `s.adhikari@londonmet.ac.uk` | `LM-FAC-101` | Computing & Engineering | `/login/faculty` |
| **Student** | Ashutosh Basnet | `a.basnet@londonmet.ac.uk` | `LM-STU-202401` | Computing & Engineering | `/login/student` |
| **Student** | Anmol Poudel | `a.poudel@londonmet.ac.uk` | `LM-STU-202402` | Computing & Engineering | `/login/student` |
| **Student** | Parjun Rai | `p.rai@londonmet.ac.uk` | `LM-STU-202403` | Computing & Engineering | `/login/student` |

---

## 🏢 Facility & Room Roster

| Facility | Room Number | Location | Capacity | Type | Amenities |
|---|---|---|---|---|---|
| **Computer Lab 1** | `Lab-01` | Skill Block | 50 Workstations | Computer Lab | High Power Workstations, AC, Smart Board |
| **Computer Lab 2** | `Lab-02` | Skill Block | 50 Workstations | Computer Lab | High Power Workstations, AC, Smart Board |
| **Seminar Room 1** | `LT-01` | London Block | 80 Seats | Seminar Room | Small Projector, AC |
| **Seminar Room 2** | `LT-02` | London Block | 80 Seats | Seminar Room | Small Projector, AC |
| **Lecture Hall 1** | `Hall-01` | Kumari Block | 100 Seats | Lecture Hall | 100-Seat Auditorium, Surround Sound, Big Projector Display Wall |

---

## 📡 API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student/faculty/admin account
- `POST /api/auth/login` — Login and receive JWT access token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Rooms (`/api/rooms`)
- `GET /api/rooms` — List rooms with filters (type, location, amenities, capacity)
- `GET /api/rooms/live-status` — Aggregated real-time room occupancy and countdown metrics
- `GET /api/rooms/:id` — Get detailed room info and capacity map
- `POST /api/rooms` — Create room *(Admin only)*
- `PUT /api/rooms/:id` — Update room *(Admin only)*
- `DELETE /api/rooms/:id` — Deactivate room *(Admin only)*

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create seat booking with concurrency conflict checking
- `GET /api/bookings/my-bookings` — List personal booking history and upcoming slots
- `GET /api/bookings/room/:roomId` — List all active bookings for a specific room
- `GET /api/bookings/all` — Retrieve campus-wide booking logs *(Admin only)*
- `PATCH /api/bookings/:id/cancel` — Cancel booking *(Owner or Admin)*
- `PATCH /api/bookings/:id/check-in` — Confirm check-in upon room entry

---

## 📄 License
This project is developed for educational and campus management purposes at London Metropolitan University.

