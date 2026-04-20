import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth }             from './contexts/AuthContext';
import { CartProvider }                      from './contexts/CartContext';
import { WishlistProvider }                  from './contexts/WishlistContext';
import { NotificationProvider }              from './contexts/NotificationContext';
import Navbar                                from './components/Navbar';
import Footer                                from './components/Footer';
import Toast                                 from './components/Toast';
import HomePage                              from './pages/HomePage';
import CatalogPage                           from './pages/CatalogPage';
import DetailPage                            from './pages/DetailPage';
import FournituresPage                       from './pages/FournituresPage';
import FournitureDetailPage                  from './pages/FournitureDetailPage';
import BundlesPage                           from './pages/BundlesPage';
import SearchPage                            from './pages/SearchPage';
import WishlistPage                          from './pages/WishlistPage';
import ComparePage                           from './pages/ComparePage';
import CartPage                              from './pages/CartPage';
import CheckoutPage                          from './pages/CheckoutPage';
import OrderTrackingPage                     from './pages/OrderTrackingPage';
import ProfilePage                           from './pages/ProfilePage';
import LoyaltyPage                           from './pages/LoyaltyPage';
import AdminPage                             from './pages/AdminPage';
import StockAlertsPage                       from './pages/StockAlertsPage';
import LoginPage                             from './pages/LoginPage';
import RegisterPage                          from './pages/RegisterPage';
import NotFoundPage                          from './pages/NotFoundPage';
import TermsPage                             from './pages/TermsPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin text-4xl text-gray-400">⟳</div></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user.role !== 'libraire') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/catalog"        element={<CatalogPage />} />
          <Route path="/book/:id"       element={<DetailPage />} />
          <Route path="/fournitures"    element={<FournituresPage />} />
          <Route path="/fourniture/:id" element={<FournitureDetailPage />} />
          <Route path="/kits"           element={<BundlesPage />} />
          <Route path="/recherche"      element={<SearchPage />} />
          <Route path="/comparer"       element={<ComparePage />} />
          <Route path="/conditions"     element={<TermsPage />} />
          <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to={user.role==='libraire'?'/admin':'/'} replace />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
          <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/fidelite" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin"        element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/stocks" element={<ProtectedRoute adminOnly><StockAlertsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
