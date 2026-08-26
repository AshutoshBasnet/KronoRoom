# 🏛️ KronoRoom v1.0 — Intelligent Classroom & Lab Booking & Occupancy System

**KronoRoom v1.0** is a production-ready, real-time Full-Stack MERN (MongoDB Atlas, Express, React, Node.js) Classroom & Lab Booking Platform tailored for London Metropolitan University. It features interactive cinema-style multi-seat reservation maps, live granular occupancy tracking, strict seat-level concurrency conflict prevention, dynamic countdown timers, role-based access policies, and automated 15-minute slot management.

---

## 🌟 Key Features (Version 1.0)

1. **Interactive Multi-Seat Cinema Map:**
   - Real-time seat layouts generated to exact room capacities (50, 80, 100 seats).
   - Multi-seat picking (select single or multiple seats like `A1, A2, A3`).
   - Color-coded statuses:
     - 🟢 **Green:** Free to book
     - 🟡 **Yellow:** Reserved for upcoming session
     - 🔴 **Red:** Students currently studying / In session
     - 🟣 **Indigo:** Active selection

2. **Granular Seat-Level Concurrency & Conflict Prevention:**
   - Allows multiple students to concurrently book separate seats in the same room.
   - Evaluates interval overlaps down to the chair level, instantly blocking conflicts with informative messages.

3. **Dynamic Real-Time Countdowns:**
   - Live second-by-second countdown on occupied seats and banner showing exact time until seats become free (`Free in 24m 15s`).

4. **Curated London Met Subject Module Catalog:**
   - Pre-loaded modules: `CC5051NI` Databases, `CS5053NI` Cloud Computing & IoT, `CT5052NI` NOS, `CC5067NI` Smart Data Discovery, `CS5054NI` Advanced Programming, `CS5071NI` Professional & Ethical Issues, `CS5002NI` Software Engineering.

5. **Role-Based Constraints & Policies (RBAC):**
   - **Students:** Max 2 hours per session, advance booking window up to 3 days.
   - **Faculty / Teachers:** Extended 6 hours per lecture/lab session, advance booking window up to 30 days.
   - **Administrators:** Full management dashboard, inventory control, and cancellation overrides.

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
> Populates MongoDB with the 5 London Met users, 5 campus rooms, and active sample bookings.

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
| **Admin** | Admin | `admin@londonmet.ac.uk` | `LM-ADM-001` | Campus Estates & IT | `/login/faculty` |
| **Faculty** | Subigyan Adhikari | `s.adhikari@londonmet.ac.uk` | `LM-FAC-101` | Computing & Engineering | `/login/faculty` |
| **Student** | Ashutosh Basnet | `a.basnet@londonmet.ac.uk` | `LM-STU-202401` | Computing & Engineering | `/login/student` |
| **Student** | Anmol Poudel | `a.poudel@londonmet.ac.uk` | `LM-STU-202402` | Computing & Engineering | `/login/student` |
| **Student** | Parjun Rai | `p.rai@londonmet.ac.uk` | `LM-STU-202403` | Computing & Engineering | `/login/student` |

---

## 🏢 Facility & Room Roster

| Facility | Room Number | Location | Capacity | Type |
|---|---|---|---|---|
| **Computer Lab 1** | `Lab-01` | Skill Block | 50 Workstations | Computer Lab |
| **Computer Lab 2** | `Lab-02` | Skill Block | 50 Workstations | Computer Lab |
| **Seminar Room 1** | `LT-01` | London Block | 80 Seats | Seminar Room |
| **Seminar Room 2** | `LT-02` | London Block | 80 Seats | Seminar Room |
| **Lecture Hall 1** | `Hall-01` | Kumari Block | 100 Seats | Lecture Hall |

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
