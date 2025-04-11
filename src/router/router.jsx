import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';
import AdminDashboard from '../components/AdminDashboard';
import Categories from '../components/Categories';
import Products from '../components/Products';
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
        
        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={['super_admin', 'user_manager', 'product_manager']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Categories Management - Super Admin Only */}
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requiredRoles={['super_admin']}>
              <Categories />
            </ProtectedRoute>
          }
        />

        {/* Products Management - Super Admin and Product Manager */}
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requiredRoles={['super_admin', 'product_manager']}>
              <Products />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect API routes to corresponding frontend routes */}
      <Route
        path="/api/v1/admin/dashboard"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      <Route
        path="/api/v1/admin/categories"
        element={<Navigate to="/admin/categories" replace />}
      />

      <Route
        path="/api/v1/admin/products"
        element={<Navigate to="/admin/products" replace />}
      />

      {/* Route 404 - doit être la dernière */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};