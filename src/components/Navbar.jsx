import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }      from '../contexts/AuthContext';
import { useCart }      from '../contexts/CartContext';
import { useWishlist }  from '../contexts/WishlistContext';
import SearchBar        from './SearchBar';
import NotificationBell from './NotificationBell';


/* ── Menu utilisateur déroulant ─────────────────────────────────────────── */
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fermer en cliquant ailleurs
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin      = user.role === 'libraire' || !!user.is_shop_member; // collaborateurs inclus
  const isSuperAdmin = user.is_super_admin || user.role === 'super_admin';
  const initial      = (user.prenom || user.name || '?')[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Bouton avatar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition group"
      >
        <div className="w-8 h-8 rounded-lg bg-[#c9933a] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          {initial}
        </div>
        <div className="text-left hidden lg:block">
          <p className="text-xs font-semibold text-white leading-none">
            {user.prenom || user.name}
          </p>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">
            {isSuperAdmin ? '👑 Super Admin' : isAdmin ? '🏪 Libraire' : '👤 Client'}
          </p>
        </div>
        <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#162232] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <p className="text-white font-bold text-sm truncate">{user.prenom} {user.name}</p>
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </div>

          {/* Liens */}
          <div className="py-1.5">
            <MenuLink to="/profile"  icon="👤" label="Mon profil"     onClick={() => setOpen(false)} />
            <MenuLink to="/orders"   icon="📦" label="Mes commandes"  onClick={() => setOpen(false)} />
            <MenuLink to="/wishlist" icon="❤️" label="Mes favoris"    onClick={() => setOpen(false)} />
            <MenuLink to="/fidelite" icon="⭐" label="Mes points"     onClick={() => setOpen(false)} />

            {(isAdmin || isSuperAdmin) && (
              <>
                <div className="border-t border-white/10 my-1.5" />
                {isAdmin && (
                  <MenuLink to="/admin"   icon="⚙️" label="Administration" onClick={() => setOpen(false)}
                    highlight />
                )}
                {isSuperAdmin && (
                  <MenuLink to="/super-admin" icon="👑" label="Super Admin" onClick={() => setOpen(false)}
                    highlight />
                )}
                <MenuLink to="/profile?tab=localisation" icon="🗺️" label="Ma localisation"
                  onClick={() => setOpen(false)} />
                <MenuLink to="/profile?tab=paiement"     icon="💳" label="Mes paiements"
                  onClick={() => setOpen(false)} />
              </>
            )}
          </div>

          {/* Déconnexion */}
          <div className="border-t border-white/10 p-1.5">
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition font-medium">
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon, label, onClick, highlight }) {
  return (
    <Link to={to} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 mx-1.5 rounded-xl text-sm transition font-medium
        ${highlight
          ? 'text-[#c9933a] hover:bg-[#c9933a]/15'
          : 'text-gray-300 hover:text-white hover:bg-white/8'}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { cartCount }           = useCart();
  const { count: wishCount }    = useWishlist();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a1219]/97 backdrop-blur-md shadow-lg' : 'bg-[#0f1923]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <span className="w-9 h-9 bg-[#c9933a] rounded-lg flex items-center justify-center text-lg shadow">📚</span>
          <div className="hidden sm:block leading-tight">
            <p className="text-white font-bold text-sm tracking-tight" style={{fontFamily:'Playfair Display,serif'}}>L&C</p>
          </div>
        </Link>

        {/* SearchBar desktop */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <SearchBar />
        </div>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1 ml-2">
          {[
            { to:'/catalog',     label:'Livres' },
            { to:'/fournitures', label:'Fournitures' },
            { to:'/communaute',  label:'Communauté' },
            { to:'/entreprise',  label:'Entreprise' },
            ...(user ? [{ to:'/orders', label:'Commandes' }] : []),
          ].map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
              {label}
            </NavLink>
          ))}
          {(user?.role === 'libraire' || user?.is_shop_member) && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive ? 'bg-[#c9933a] text-white' : 'bg-[#c9933a]/20 text-[#c9933a] hover:bg-[#c9933a]/30'
                }`}>
              ⚙️ Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Search mobile */}
          <button onClick={() => setSearchOpen(s => !s)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition">
            🔍
          </button>

          {/* Notification bell */}
          {user && <NotificationBell />}

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist"
              className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition">
              <span className="text-lg">❤️</span>
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#d44040] text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-0.5">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>
          )}

          {/* Panier */}
          <Link to="/cart"
            className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#c9933a] text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-0.5">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-2 relative">
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white px-2 py-1.5 transition">Connexion</Link>
                <Link to="/register" className="text-sm bg-[#c9933a] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8832d] transition font-medium">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition text-xl">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-white/10 pt-3">
          <SearchBar />
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#162232] border-t border-white/10 px-4 py-4 space-y-1">
          {[
            { to:'/catalog',    label:'📚 Livres' },
            { to:'/fournitures',label:'✏️ Fournitures' },
            { to:'/recherche',  label:'🔍 Recherche' },
            ...(user ? [
              { to:'/cart',     label:`🛒 Panier${cartCount>0?` (${cartCount})`:''}` },
              { to:'/orders',   label:'📦 Commandes' },
              { to:'/wishlist', label:`❤️ Favoris${wishCount>0?` (${wishCount})`:''}` },
              { to:'/profile',  label:'👤 Profil' },
            ] : []),
          ].map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
              {label}
            </NavLink>
          ))}
          {(user?.role === 'libraire' || user?.is_shop_member) && (
            <NavLink to="/admin" className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#c9933a] hover:bg-[#c9933a]/10 transition">
              ⚙️ Administration
            </NavLink>
          )}
          <div className="border-t border-white/10 pt-3 mt-2">
            {user ? (
              <button onClick={handleLogout} className="text-red-400 text-sm px-4">Déconnexion</button>
            ) : (
              <div className="flex gap-3 px-2">
                <Link to="/login"    className="text-sm text-gray-400">Connexion</Link>
                <Link to="/register" className="text-sm text-[#c9933a] font-semibold">S'inscrire</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
