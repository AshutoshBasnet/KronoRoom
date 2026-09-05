import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MetaBalls from './components/ui/MetaBalls';

import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden bg-[#0a0e17]">
          {/* Subtle Institutional Architectural Grid */}
          <div className="fixed inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {/* Ambient MetaBalls Background (Refined deep navy tone, subtle opacity) */}
          <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-35">
            <MetaBalls
              color="#1e3a8a"
              cursorBallColor="#1d4ed8"
              cursorBallSize={0}
              ballCount={12}
              animationSize={28}
              enableMouseInteraction={false}
              enableTransparency={true}
              hoverSmoothness={0.05}
              clumpFactor={1.2}
              speed={0.18}
              useWindow={false}
            />
          </div>

          <Navbar />
          <main className="flex-1 relative z-10">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/login/faculty" element={<FacultyLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Protected User Schedule */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
