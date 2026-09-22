import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SplashScreen         from './components/SplashScreen';
import { AuthProvider, useAuth }        from './contexts/AuthContext';
import { CartProvider }                 from './contexts/CartContext';
import { WishlistProvider }             from './contexts/WishlistContext';
import { NotificationProvider }         from './contexts/NotificationContext';
import Navbar                           from './components/Navbar';
import Footer                           from './components/Footer';
import Toast                            from './components/Toast';
import HomePage                         from './pages/HomePage';
import CatalogPage                      from './pages/CatalogPage';
import DetailPage                       from './pages/DetailPage';
import FournituresPage                  from './pages/FournituresPage';
import FournitureDetailPage             from './pages/FournitureDetailPage';
import BundlesPage                      from './pages/BundlesPage';
import SearchPage                       from './pages/SearchPage';
import WishlistPage                     from './pages/WishlistPage';
import ComparePage                      from './pages/ComparePage';
import CartPage                         from './pages/CartPage';
import CheckoutPage                     from './pages/CheckoutPage';
import OrderTrackingPage                from './pages/OrderTrackingPage';
import ProfilePage                      from './pages/ProfilePage';
import LoyaltyPage                      from './pages/LoyaltyPage';
import AdminPage                        from './pages/AdminPage';
import StockAlertsPage                  from './pages/StockAlertsPage';
import LoginPage                        from './pages/LoginPage';
import RegisterPage                     from './pages/RegisterPage';
import NotFoundPage                     from './pages/NotFoundPage';
import TermsPage                        from './pages/TermsPage';
import CommunityPage                    from './pages/CommunityPage';
import SubscriptionPage                 from './pages/SubscriptionPage';
import SuperAdminPage                   from './pages/SuperAdminPage';
import SuspendedScreen                  from './components/SuspendedScreen';

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE (simplifié — le blocage principal est dans SuspendedScreen)
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin text-4xl text-gray-400">⟳</div>
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (superAdminOnly && !user.is_super_admin && user.role !== 'super_admin')
    return <Navigate to="/" replace />;
  // Collaborateurs (comptes administrateurs ajoutés par un libraire) inclus
  if (adminOnly && user.role !== 'libraire' && !user.is_super_admin && !user.is_shop_member)
    return <Navigate to="/" replace />;

  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────
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
          <Route path="/communaute"     element={<CommunityPage />} />
          <Route path="/entreprise"     element={<SubscriptionPage />} />
          <Route path="/login"    element={!user ? <LoginPage /> : <Navigate to={user.is_super_admin || user.role === 'super_admin' ? '/super-admin' : user.role === 'libraire' ? '/admin' : '/'} replace />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
          <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/fidelite" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin"        element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/stocks" element={<ProtectedRoute adminOnly><StockAlertsPage /></ProtectedRoute>} />
          <Route path="/super-admin"  element={<ProtectedRoute superAdminOnly><SuperAdminPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE BLOQUÉ — seule la page /entreprise reste accessible (choix de formule,
// paiement). Avant, /entreprise était elle aussi remplacée par l'écran de
// blocage : impossible de souscrire ou de changer de formule.
// ─────────────────────────────────────────────────────────────────────────────
function BlockedSubscriptionLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2]">
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 text-sm text-white bg-slate-900">
        <button type="button" onClick={() => navigate('/')} className="font-semibold hover:text-amber-300">
          ← Retour
        </button>
        <span className="hidden text-slate-300 sm:inline">🔒 Accès limité — réglez votre abonnement pour tout débloquer</span>
        <button type="button" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
          className="text-slate-300 hover:text-white">
          Se déconnecter
        </button>
      </div>
      <main className="flex-1"><SubscriptionPage /></main>
      <Toast />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WRAPPER — Détecte la suspension et bloque l'app (sauf /entreprise)
// ─────────────────────────────────────────────────────────────────────────────
function AppContent() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();

  // Libraire sans abonnement actif → bloquer l'app
  const isSuspended =
    user &&
    user.role === 'libraire' &&
    !user.is_super_admin &&
    user.has_active_subscription === false;

  if (isSuspended) {
    if (location.pathname === '/entreprise') return <BlockedSubscriptionLayout />;
    return <SuspendedScreen user={user} onRenewed={refreshUser} />;
  }

  return <AppRoutes />;
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  return (
    <>
      {splash && <SplashScreen onFinish={() => setSplash(false)} />}
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AppContent />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </>
  );
}