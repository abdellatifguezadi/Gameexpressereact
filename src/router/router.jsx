import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';
import AdminDashboard from '../components/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import Forbidden from '../components/Forbidden';
import NotFound from '../components/NotFound';
import Master from '../Layout/Master';
import { useAuth } from '../context/AuthContext';

// Composant pour gérer la redirection des utilisateurs connectés
function RedirectIfAuthenticated({ children }) {
  const { user, hasRole } = useAuth();
  
  if (user) {
    if (hasRole('super_admin') || hasRole('user_manager') || hasRole('product_manager')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques avec redirection si connecté */}
      <Route path="/" element={
        <RedirectIfAuthenticated>
          <Login />
        </RedirectIfAuthenticated>
      } />
      <Route path="/login" element={
        <RedirectIfAuthenticated>
          <Login />
        </RedirectIfAuthenticated>
      } />
      <Route path="/register" element={
        <RedirectIfAuthenticated>
          <Register />
        </RedirectIfAuthenticated>
      } />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      
      {/* Routes protégées avec Master layout */}
      <Route element={<Master />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={['super_admin', 'user_manager', 'product_manager']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Route 404 - doit être la dernière */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};