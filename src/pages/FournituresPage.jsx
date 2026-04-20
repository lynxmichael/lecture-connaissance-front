import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { CATEGORIES } from '../utils/fournitures';

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d4] overflow-hidden">
      <div className="skeleton h-28" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-20 rounded"/>
        <div className="skeleton h-5 w-full rounded"/>
        <div className="skeleton h-4 w-2/3 rounded"/>
        <div className="skeleton h-6 w-1/2 rounded mt-2"/>
        <div className="skeleton h-9 w-full rounded-xl mt-1"/>
      </div>
    </div>
  );
}

export default function FournituresPage() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [search,      setSearch]     = useState(searchParams.get('search')       || '');
  const [categorie,   setCategorie]  = useState(searchParams.get('categorie')    || '');
  const [sousCat,     setSousCat]    = useState(searchParams.get('sous_categorie')|| '');
  const [tri,         setTri]        = useState(searchParams.get('tri')          || '');
  const [promoOnly,   setPromoOnly]  = useState(searchParams.get('promo_only')==='1');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)    params.append('search', search);
    if (categorie) params.append('categorie', categorie);
    if (sousCat)   params.append('sous_categorie', sousCat);
    if (tri)       params.append('tri', tri);
    if (promoOnly) params.append('promo_only','1');
    setSearchParams(params);
    api.get(`/fournitures?${params}`)
      .then(r => setProducts(r.data))
      .catch(() => showToast('Erreur de chargement','error'))
      .finally(() => setLoading(false));
  }, [search, categorie, sousCat, tri, promoOnly, setSearchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddToCart = async (productId, type) => {
    try {
      await addToCart(productId, 1, type);
      showToast('✅ Article ajouté au panier','success');
    } catch {
      showToast('Connectez-vous pour ajouter au panier','error');
    }
  };

  const reset = () => { setSearch(''); setCategorie(''); setSousCat(''); setTri(''); setPromoOnly(false); };

  const sousCatOptions = categorie ? (CATEGORIES[categorie]?.items ?? []) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Matériel scolaire</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          Fournitures scolaires
        </h1>
      </div>

      {/* Grille catégories */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
        <button
          onClick={() => setCategorie('')}
          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-xs font-bold transition-all ${
            !categorie ? 'bg-[#0f1923] border-[#0f1923] text-white' : 'bg-white border-[#e8e0d4] text-gray-600 hover:border-[#0f1923]'
          }`}>
          <span className="text-2xl">🛍️</span>
          <span>Tout</span>
        </button>
        {Object.entries(CATEGORIES).map(([cat, info]) => (
          <button key={cat}
            onClick={() => { setCategorie(cat === categorie ? '' : cat); setSousCat(''); }}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-xs font-bold transition-all text-center leading-tight ${
              categorie === cat
                ? 'bg-[#c9933a] border-[#c9933a] text-white shadow-md'
                : 'bg-white border-[#e8e0d4] text-gray-600 hover:border-[#c9933a]'
            }`}>
            <span className="text-2xl">{info.emoji}</span>
            <span className="line-clamp-2">{cat}</span>
          </button>
        ))}
      </div>

      {/* Sous-catégories */}
      {categorie && sousCatOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSousCat('')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
              !sousCat ? 'bg-[#0f1923] border-[#0f1923] text-white' : 'border-[#e8e0d4] text-gray-600 hover:border-[#0f1923]'
            }`}>
            Tous les {categorie}
          </button>
          {sousCatOptions.map(sc => (
            <button key={sc} onClick={() => setSousCat(sc === sousCat ? '' : sc)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                sousCat === sc
                  ? 'bg-[#c9933a] border-[#c9933a] text-white'
                  : 'border-[#e8e0d4] text-gray-600 hover:border-[#c9933a] bg-white'
              }`}>
              {sc}
            </button>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-[#e8e0d4] rounded-2xl p-5 mb-8 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Recherche</label>
          <input type="text" placeholder="Nom, marque, référence…" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key==='Enter' && fetchProducts()}
            className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Trier</label>
          <select value={tri} onChange={e => setTri(e.target.value)}
            className="px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 transition bg-white">
            <option value="">Par défaut</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
            <option value="popular">Plus consultés</option>
            <option value="bestseller">Meilleures ventes</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer self-end pb-0.5">
          <div onClick={() => setPromoOnly(v=>!v)}
            className={`w-10 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${promoOnly ? 'bg-[#d44040]' : 'bg-gray-200'}`}
            style={{height:'22px',width:'40px'}}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${promoOnly?'translate-x-5':'translate-x-0.5'}`} style={{left:'2px'}}/>
          </div>
          <span className="text-sm font-medium text-gray-700">🔥 Promos</span>
        </label>

        <div className="flex gap-2 self-end">
          <button onClick={fetchProducts}
            className="px-5 py-2.5 bg-[#0f1923] text-white rounded-xl text-sm font-semibold hover:bg-[#162232] transition">
            Rechercher
          </button>
          {(search || categorie || sousCat || tri || promoOnly) && (
            <button onClick={reset}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition">
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Résultats */}
      <p className="text-sm text-gray-500 mb-5">
        {loading ? 'Chargement…' : (
          <><strong className="text-[#0f1923]">{products.length}</strong> article{products.length!==1?'s':''}
          {categorie && <> dans <strong>{categorie}</strong></>}
          {sousCat && <> — <strong>{sousCat}</strong></>}
          {promoOnly && <span className="ml-2 text-[#d44040] font-semibold">🔥 en promo</span>}</>
        )}
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_,i) => <Skeleton key={i}/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 mb-4">Aucune fourniture trouvée.</p>
          <button onClick={reset} className="text-[#c9933a] hover:underline text-sm font-medium">Effacer les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} type="fourniture" onAddToCart={handleAddToCart}/>
          ))}
        </div>
      )}
    </div>
  );
}
