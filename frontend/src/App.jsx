import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SlotsPage } from './pages/SlotsPage';
import { EntryPage } from './pages/EntryPage';
import { ExitPage } from './pages/ExitPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { UsersPage } from './pages/UsersPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes within MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="entry" element={<EntryPage />} />
        <Route path="exit" element={<ExitPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
