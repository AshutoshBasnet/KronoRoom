# ⚔️ London Met — 2D Pixel RPG Classroom & Lab Booking Quest

A production-ready, modular, intuitive, and fun **2D Pixel RPG-styled Full-Stack MERN** (MongoDB Atlas, Express, React, Node.js) Classroom & Lab Booking System tailored for London Metropolitan University.

---

## 🌟 Key Features & 2D Pixel RPG Theme

1. **2D Pixel RPG & Nostalgic Arcade Aesthetics:**
   - Pixel art fonts (`Pixelify Sans`, `Press Start 2P`, `Silkscreen`).
   - Tactile 8-bit clicky buttons (`pixel-btn`), retro dialogue boxes (`pixel-dialog`), and dungeon room chamber cards (`pixel-box`).
   - Hero Class Badges: `🛡️ Scholar Knight (Student)`, `🔮 Archmage Faculty`, `👑 Dungeon Master (Admin)`.
   - 2D Interactive Campus Mini-Map chamber overview.

2. **Strict Concurrency & Overlap Prevention Engine:**
   - Evaluates interval overlaps using MongoDB compound indexing:
     ```javascript
     { room: roomId, status: 'confirmed', startTime: { $lt: requestedEndTime }, endTime: { $gt: requestedStartTime } }
     ```
   - Instantly rejects overlapping reservations with `409 Conflict` and details of the current occupant.

3. **Role-Based Constraints & RBAC:**
   - **Students:** Max 2 hours per session, advance booking window up to 3 days.
   - **Faculty / Teachers:** Extended 6 hours per lecture/lab session, advance booking window up to 30 days.
   - **Administrators:** Unrestricted chamber management (Forge/Edit/Seal chambers), and campus-wide override cancellations.

4. **Real-Time WebSocket Sync (Socket.io):**
   - Instant live grid updates whenever any campus member books, checks in, or cancels a chamber slot.

5. **Automated 15-Minute Auto-Release Cron (`node-cron`):**
   - Runs in the background every 5 minutes (`*/5 * * * *`).
   - If a confirmed booking's start time was >15 minutes ago and the party has not checked in (`checkedIn: false`), the booking is automatically set to `'cancelled'` and the chamber is instantly freed up for walk-in adventurers.

---

## ⚡ Quick Start Guide

### 1. MongoDB Atlas Configuration
In `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://romenrengs102_db_user:XvSWavVcpn370CXr@cluster0.s6wt3ki.mongodb.net/smart-classroom?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=london_met_smart_classroom_jwt_secret_key_2026_super_secure
CLIENT_URL=http://localhost:5173
```

---

### 2. Seed Database
```bash
cd server
npm run seed
```
> Connected directly to MongoDB Atlas and preloaded with 6 users, 6 rooms, and sample live bookings!

---

### 3. Start Application

#### **Start Backend Server**
```bash
cd server
npm run dev
```
> Runs on `http://localhost:5000` with WebSocket support.

#### **Start Frontend Client**
```bash
cd client
npm run dev
```
> Runs on `http://localhost:5173`.

---

## 🔑 Preloaded Test Credentials (Password: `Password123`)

| Role | Hero Name | Email | London Met ID | Department |
|---|---|---|---|---|
| **Admin** | 👑 Dr. Eleanor Vance | `admin@londonmet.ac.uk` | `LM-ADM-001` | Campus Estates & IT |
| **Faculty** | 🔮 Prof. Arthur Pendelton | `a.pendelton@londonmet.ac.uk` | `LM-FAC-101` | Computing & Digital Media |
| **Faculty** | 🔮 Dr. Fiona Gallagher | `f.gallagher@londonmet.ac.uk` | `LM-FAC-102` | Guildhall School of Business |
| **Student** | 🛡️ Marcus Sterling | `m.sterling@londonmet.ac.uk` | `LM-STU-202401` | Computing & Digital Media |
| **Student** | 🏹 Zara Chen | `z.chen@londonmet.ac.uk` | `LM-STU-202402` | Architecture & Design |
| **Student** | 🗡️ Liam O'Connor | `l.oconnor@londonmet.ac.uk` | `LM-STU-202403` | Human Sciences |

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Character creation for student/faculty/admin
- `POST /api/auth/login` — Authenticate and obtain JWT
- `GET /api/auth/me` — Authenticated hero profile

### Rooms (`/api/rooms`)
- `GET /api/rooms` — Query chambers with type, wing, and capacity filters
- `GET /api/rooms/live-status` — Aggregated real-time chamber occupancy with countdown timers
- `GET /api/rooms/:id` — Single chamber details
- `POST /api/rooms` — Forge chamber (Admin only)
- `PUT /api/rooms/:id` — Update chamber (Admin only)
- `DELETE /api/rooms/:id` — Seal / Deactivate chamber (Admin only)

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Claim chamber with conflict shield & role policies
- `GET /api/bookings/my-bookings` — Personal quest log for logged-in hero
- `GET /api/bookings/room/:roomId` — Chamber schedule slots
- `GET /api/bookings/all` — Realm-wide booking analytics and logs (Admin only)
- `PATCH /api/bookings/:id/cancel` — Cancel / abandon booking (Owner or Admin)
- `PATCH /api/bookings/:id/check-in` — Check-in upon chamber arrival
