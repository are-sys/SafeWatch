import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vitals from './pages/Vitals';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminBackups from './pages/AdminBackups';
import DoctorPatients from './pages/DoctorPatients';
import DoctorPatientDetail from './pages/DoctorPatientDetail';
import Privacy from './pages/Privacy';

function PrivateRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0A0F1F]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) {
        return <Navigate to={user.role === 'admin' ? '/admin/users' : '/dashboard'} replace />;
    }
    return children;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0A0F1F]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;
    if (user) return <Navigate to={user.role === 'admin' ? '/admin/users' : '/dashboard'} replace />;
    return children;
}

function DashboardRedirect() {
    const { user } = useAuth();
    if (user?.role === 'admin') {
        return <Navigate to="/admin/users" replace />;
    }
    return <Dashboard />;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/privacidad" element={<Privacy />} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<DashboardRedirect />} />
                <Route path="dashboard" element={<DashboardRedirect />} />
                <Route path="vitals" element={<PrivateRoute roles={['paciente', 'doctor']}><Vitals /></PrivateRoute>} />
                <Route path="alerts" element={<PrivateRoute roles={['paciente', 'doctor']}><Alerts /></PrivateRoute>} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
                <Route path="admin/backups" element={<PrivateRoute roles={['admin']}><AdminBackups /></PrivateRoute>} />
                <Route path="doctor/patients" element={<PrivateRoute roles={['doctor']}><DoctorPatients /></PrivateRoute>} />
                <Route path="doctor/patient/:id" element={<PrivateRoute roles={['doctor']}><DoctorPatientDetail /></PrivateRoute>} />
            </Route>

            <Route path="*" element={<DashboardRedirect />} />
        </Routes>
    );
}
