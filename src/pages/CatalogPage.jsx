import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import BookCard from '../components/BookCard';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';

const RAYONS = ['Informatique','Sciences','Littérature','Histoire','Arts','Philosophie'];

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

export default function CatalogPage() {
  const [books,   setBooks]  = useState([]);
  const [loading, setLoading]= useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [search,     setSearch]     = useState(searchParams.get('search')    || '');
  const [rayon,      setRayon]      = useState(searchParams.get('rayon')     || '');
  const [tri,        setTri]        = useState(searchParams.get('tri')       || '');
  const [promoOnly,  setPromoOnly]  = useState(searchParams.get('promo_only')==='1');

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)    params.append('search',    search);
    if (rayon)     params.append('rayon',     rayon);
    if (tri)       params.append('tri',       tri);
    if (promoOnly) params.append('promo_only','1');
    setSearchParams(params);
    api.get(`/books?${params}`)
      .then(r => setBooks(r.data))
      .catch(() => showToast('Erreur de chargement','error'))
      .finally(() => setLoading(false));
  }, [search, rayon, tri, promoOnly, setSearchParams]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleAddToCart = async (bookId) => {
    try { await addToCart(bookId, 1, 'book'); showToast('✅ Livre ajouté au panier','success'); }
    catch { showToast('Connectez-vous pour ajouter au panier','error'); navigate('/login'); }
  };

  const reset = () => { setSearch(''); setRayon(''); setTri(''); setPromoOnly(false); };
  const hasFilters = search || rayon || tri || promoOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Titre */}
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Notre sélection</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          Catalogue
        </h1>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-[#e8e0d4] rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Recherche</label>
            <input
              type="text"
              placeholder="Titre, auteur, ISBN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchBooks()}
              className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rayon</label>
            <select value={rayon} onChange={e => setRayon(e.target.value)}
              className="px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition bg-white">
              <option value="">Tous les rayons</option>
              {RAYONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Trier</label>
            <select value={tri} onChange={e => setTri(e.target.value)}
              className="px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition bg-white">
              <option value="">Par défaut</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
              <option value="popular">Plus consultés</option>
              <option value="bestseller">Meilleures ventes</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setPromoOnly(v => !v)}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${promoOnly ? 'bg-[#d44040]' : 'bg-gray-200'}`}
                style={{height:'22px', width:'40px'}}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${promoOnly ? 'translate-x-5' : 'translate-x-0.5'}`} style={{left:'2px'}} />
              </div>
              <span className="text-sm font-medium text-gray-700">🔥 Promos</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={fetchBooks}
              className="px-5 py-2.5 bg-[#0f1923] text-white rounded-xl text-sm font-semibold hover:bg-[#162232] transition">
              Rechercher
            </button>
            {hasFilters && (
              <button onClick={reset}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition">
                ✕ Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {loading ? 'Chargement…' : (
            <><strong className="text-[#0f1923]">{books.length}</strong> livre{books.length !== 1 ? 's' : ''}
            {rayon && <> dans <strong>{rayon}</strong></>}
            {search && <> pour «{search}»</>}
            {promoOnly && <span className="ml-2 text-[#d44040] font-semibold">🔥 en promotion</span>}</>
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_,i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 mb-2">Aucun livre ne correspond à vos critères.</p>
          <button onClick={reset} className="text-[#c9933a] hover:underline text-sm font-medium">Effacer les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map(b => <BookCard key={b.id} book={b} onAddToCart={handleAddToCart} />)}
        </div>
      )}
    </div>
  );
}
