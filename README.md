# 🏛️ KronoRoom — Smart Classroom & Lab Booking System

**KronoRoom** is a production-ready, modular, and responsive Full-Stack MERN (MongoDB Atlas, Express, React, Node.js) Classroom & Lab Booking Platform tailored for London Metropolitan University. It features real-time occupancy tracking, strict concurrency conflict prevention, role-based access policies, and automated 15-minute slot management.

---

## 🌟 Key Features

1. **Live Occupancy Tracking & Real-Time Sync (Socket.io):**
   - Instant visual indicators (`🟢 Available Now`, `🔴 Occupied until HH:MM`) with real-time WebSocket sync across all connected clients.

2. **Strict Concurrency & Overlap Prevention Engine:**
   - Evaluates interval overlaps using MongoDB compound indexing:
     ```javascript
     { room: roomId, status: 'confirmed', startTime: { $lt: requestedEndTime }, endTime: { $gt: requestedStartTime } }
     ```
   - Instantly rejects overlapping reservations with `409 Conflict` and details of the current occupant.

3. **Role-Based Constraints & Policies (RBAC):**
   - **Students:** Max 2 hours per session, advance booking window up to 3 days.
   - **Faculty / Teachers:** Extended 6 hours per lecture/lab session, advance booking window up to 30 days.
   - **Administrators:** Unrestricted scheduling, room inventory management (Create/Edit/Deactivate), and campus-wide override cancellations.

4. **Automated 15-Minute Auto-Release Cron (`node-cron`):**
   - Runs in the background every 5 minutes (`*/5 * * * *`).
   - If a confirmed booking's start time was >15 minutes ago and the user has not checked in (`checkedIn: false`), the booking is automatically set to `'cancelled'` and the room is instantly freed up for walk-ins.

5. **Clean, Modern UI / UX with Tailwind CSS v4 & Lucide Icons:**
   - Dark theme with glassmorphism, Google Fonts (`Outfit`, `Plus Jakarta Sans`, `Space Grotesk`, `JetBrains Mono`), responsive navigation drawer, interactive modals, and filter controls.

---

## ⚡ Quick Start Guide

### 1. Environment Configuration
Create a `.env` file in the `server/` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your_mongodb_username>:<your_mongodb_password>@<your_cluster>.mongodb.net/smart-classroom?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

---

### 2. Seed Database
```bash
cd server
npm run seed
```
> Populates MongoDB with 6 London Met users, 6 diverse rooms, and active sample bookings.

---

### 3. Start Application

#### **Start Backend Server**
```bash
cd server
npm run dev
```
> Runs at `http://localhost:5000` (API Health: `http://localhost:5000/api/health`).

#### **Start Frontend Client**
```bash
cd client
npm run dev
```
> Runs at `http://localhost:5173`.

---

## 🔑 Preloaded Test Accounts (Password: `Password123`)

| Role | Name | Email | London Met ID | Department | Portal Link |
|---|---|---|---|---|---|
| **Admin** | Dr. Eleanor Vance | `admin@londonmet.ac.uk` | `LM-ADM-001` | Campus Estates & IT | `/login/faculty` |
| **Faculty** | Prof. Arthur Pendelton | `a.pendelton@londonmet.ac.uk` | `LM-FAC-101` | Computing & Digital Media | `/login/faculty` |
| **Faculty** | Dr. Fiona Gallagher | `f.gallagher@londonmet.ac.uk` | `LM-FAC-102` | Guildhall School of Business | `/login/faculty` |
| **Student** | Marcus Sterling | `m.sterling@londonmet.ac.uk` | `LM-STU-202401` | Computing & Digital Media | `/login/student` |
| **Student** | Zara Chen | `z.chen@londonmet.ac.uk` | `LM-STU-202402` | Architecture & Design | `/login/student` |
| **Student** | Liam O'Connor | `l.oconnor@londonmet.ac.uk` | `LM-STU-202403` | Human Sciences | `/login/student` |

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — User registration (student/faculty/admin)
- `POST /api/auth/login` — Authenticate and obtain JWT
- `GET /api/auth/me` — Authenticated user profile

### Rooms (`/api/rooms`)
- `GET /api/rooms` — Query rooms with type, building, and capacity filters
- `GET /api/rooms/live-status` — Aggregated real-time room occupancy with countdown timers
- `GET /api/rooms/:id` — Single room details
- `POST /api/rooms` — Create room (Admin only)
- `PUT /api/rooms/:id` — Update room (Admin only)
- `DELETE /api/rooms/:id` — Deactivate room (Admin only)

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create booking with conflict check & role policies
- `GET /api/bookings/my-bookings` — Personal schedule for logged-in user
- `GET /api/bookings/room/:roomId` — Room schedule slots
- `GET /api/bookings/all` — Campus-wide booking analytics and logs (Admin only)
- `PATCH /api/bookings/:id/cancel` — Cancel booking (Owner or Admin)
- `PATCH /api/bookings/:id/check-in` — Check-in upon room arrival
