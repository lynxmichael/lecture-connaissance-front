import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }      from '../contexts/AuthContext';
import { useCart }      from '../contexts/CartContext';
import { useWishlist }  from '../contexts/WishlistContext';
import SearchBar        from './SearchBar';
import NotificationBell from './NotificationBell';

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
          {user?.role === 'libraire' && (
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
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-gray-400 max-w-[90px] truncate">{user.prenom || user.name}</span>
                <button onClick={handleLogout}
                  className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition">
                  Déco.
                </button>
              </>
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
          {user?.role === 'libraire' && (
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
