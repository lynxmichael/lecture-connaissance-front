import { CATEGORIES } from '../utils/fournitures';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import BookCard from '../components/BookCard';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { formatCFA } from '../utils/currency';

const RAYONS = [
  { nom:'Informatique', emoji:'💻', color:'bg-blue-900/40 border-blue-700/50' },
  { nom:'Sciences',     emoji:'🔬', color:'bg-emerald-900/40 border-emerald-700/50' },
  { nom:'Littérature',  emoji:'📖', color:'bg-amber-900/40 border-amber-700/50' },
  { nom:'Histoire',     emoji:'🏛️', color:'bg-red-900/40 border-red-700/50' },
  { nom:'Arts',         emoji:'🎨', color:'bg-purple-900/40 border-purple-700/50' },
  { nom:'Philosophie',  emoji:'🧠', color:'bg-slate-700/40 border-slate-600/50' },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d4] overflow-hidden">
      <div className="skeleton h-28" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-6 w-1/2 rounded mt-3" />
        <div className="skeleton h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [promoBooks,    setPromoBooks]    = useState([]);
  const [bestsellers,   setBestsellers]   = useState([]);
  const [loadingPromo,  setLoadingPromo]  = useState(true);
  const [loadingBest,   setLoadingBest]   = useState(true);
  const [searchInput,   setSearchInput]   = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/books?promo_only=1')
      .then(r => setPromoBooks(r.data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingPromo(false));

    api.get('/books?tri=bestseller')
      .then(r => setBestsellers(r.data.slice(0, 4)))
      .catch(() => {
        api.get('/books').then(r => setBestsellers(r.data.slice(0, 4))).catch(() => {});
      })
      .finally(() => setLoadingBest(false));
  }, []);

  const handleAddToCart = async (bookId) => {
    try {
      await addToCart(bookId);
      showToast('✅ Livre ajouté au panier', 'success');
    } catch {
      showToast('Connectez-vous pour ajouter au panier', 'error');
      navigate('/login');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/catalog?search=${encodeURIComponent(searchInput.trim())}`);
    else navigate('/catalog');
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f1923] relative overflow-hidden">
        {/* Texture de fond */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage:'radial-gradient(circle at 20% 50%, #c9933a 0%, transparent 50%), radial-gradient(circle at 80% 50%, #4a6fa5 0%, transparent 50%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-[#c9933a] text-sm font-semibold tracking-[0.25em] uppercase mb-4 fade-up">
            Librairie francophone · Abidjan
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black leading-tight mb-6 fade-up fade-up-1"
            style={{fontFamily:'Playfair Display,serif'}}>
            Le savoir à portée<br />
            <span className="text-[#c9933a]">de votre main</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto fade-up fade-up-2">
            Des milliers de livres en Franc CFA. Commandez, payez, recevez votre bon de commande instantanément.
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch}
            className="flex gap-2 max-w-lg mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 fade-up fade-up-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Titre, auteur, ISBN…"
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-2 text-sm outline-none"
            />
            <button type="submit"
              className="bg-[#c9933a] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-[#b8832d] transition shrink-0">
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* ── Rayons ──────────────────────────────────────────────────────── */}
      <section className="bg-[#162232] py-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {RAYONS.map(r => (
              <Link key={r.nom} to={`/catalog?rayon=${encodeURIComponent(r.nom)}`}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-white text-sm font-medium hover:brightness-125 transition ${r.color}`}>
                <span>{r.emoji}</span>
                <span>{r.nom}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* ── Promotions ─────────────────────────────────────────────────── */}
        {(loadingPromo || promoBooks.length > 0) && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Offres spéciales</p>
                <h2 className="text-2xl font-bold text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
                  🔥 Promotions en cours
                </h2>
              </div>
              <Link to="/catalog?promo_only=1"
                className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block">
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingPromo
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : promoBooks.map(b => <BookCard key={b.id} book={b} onAddToCart={handleAddToCart} />)
              }
            </div>
          </section>
        )}

        {/* ── Bestsellers ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Les plus populaires</p>
              <h2 className="text-2xl font-bold text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
                ⭐ Meilleures ventes
              </h2>
            </div>
            <Link to="/catalog?tri=bestseller"
              className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingBest
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.map(b => <BookCard key={b.id} book={b} onAddToCart={handleAddToCart} />)
            }
          </div>
        </section>


        {/* ── Fournitures scolaires ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Matériel scolaire</p>
              <h2 className="text-2xl font-bold text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
                ✏️ Fournitures scolaires
              </h2>
            </div>
            <Link to="/fournitures" className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block">
              Tout voir →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Object.entries(CATEGORIES).slice(0,6).map(([cat, info]) => (
              <Link key={cat} to={`/fournitures?categorie=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e8e0d4] rounded-2xl hover:border-[#c9933a] hover:-translate-y-0.5 transition-all shadow-sm group text-center">
                <span className="text-3xl group-hover:scale-110 transition-transform">{info.emoji}</span>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
            {Object.entries(CATEGORIES).slice(6).map(([cat, info]) => (
              <Link key={cat} to={`/fournitures?categorie=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e8e0d4] rounded-2xl hover:border-[#c9933a] hover:-translate-y-0.5 transition-all shadow-sm group text-center">
                <span className="text-3xl group-hover:scale-110 transition-transform">{info.emoji}</span>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA bas de page ─────────────────────────────────────────────── */}
        <section className="bg-[#0f1923] rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'radial-gradient(circle at 30% 50%, #c9933a 0%, transparent 60%)' }} />
          <div className="relative">
            <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-3">
              Catalogue complet
            </p>
            <h2 className="text-white text-3xl font-black mb-4" style={{fontFamily:'Playfair Display,serif'}}>
              Des milliers de titres vous attendent
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Informatique, sciences, littérature, histoire… Trouvez votre prochain livre en quelques secondes.
            </p>
            <Link to="/catalog"
              className="inline-block bg-[#c9933a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b8832d] transition shadow-lg">
              Explorer le catalogue
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
