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
        <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
          {/* Universal Theme MetaBalls Background */}
          <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
            <MetaBalls
              color="#2623a8"
              cursorBallColor="#2623a8"
              cursorBallSize={2}
              ballCount={15}
              animationSize={30}
              enableMouseInteraction={true}
              enableTransparency={true}
              hoverSmoothness={0.05}
              clumpFactor={1}
              speed={0.3}
              useWindow={true}
            />
          </div>

          {/* Universal Ambient Oceanic Glows */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#0077b6]/20 rounded-full blur-3xl"></div>
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
