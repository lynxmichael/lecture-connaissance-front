import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d4] overflow-hidden animate-pulse">
      <div className="skeleton h-28"/><div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded"/><div className="skeleton h-5 w-full rounded"/>
        <div className="skeleton h-9 w-full rounded-xl mt-2"/>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams]  = useSearchParams();
  const q               = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!q || q.length < 2) { setResults(null); return; }
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(q)}&limit=40`)
      .then(r => setResults(r.data))
      .catch(() => setResults({ books: [], fournitures: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [q]);

  const handleAdd = async (id, type = 'book') => {
    try { await addToCart(id, 1, type); showToast('✅ Ajouté au panier', 'success'); }
    catch { showToast('Connectez-vous pour ajouter au panier', 'error'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-2">Recherche globale</p>
        <SearchBar fullPage placeholder="Livres, fournitures, auteurs, marques…" />
      </div>

      {!q ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p>Entrez un terme pour rechercher dans tout le catalogue.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_,i) => <Skeleton key={i}/>)}
        </div>
      ) : results?.total === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-gray-500">Aucun résultat pour «<strong>{q}</strong>»</p>
          <p className="text-gray-400 text-sm mt-2">Essayez avec d'autres mots-clés.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <p className="text-sm text-gray-500">
            <strong className="text-[#0f1923]">{results?.total}</strong> résultat{results?.total>1?'s':''} pour «<strong>{q}</strong>»
          </p>

          {results?.books?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>📚 Livres</h2>
                <span className="bg-[#0f1923]/10 text-[#0f1923] text-xs font-bold px-2.5 py-1 rounded-full">{results.books.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.books.map(b => (
                  <BookCard key={b.id} book={b} onAddToCart={(id) => handleAdd(id,'book')}/>
                ))}
              </div>
            </section>
          )}

          {results?.fournitures?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>✏️ Fournitures</h2>
                <span className="bg-[#c9933a]/15 text-[#c9933a] text-xs font-bold px-2.5 py-1 rounded-full">{results.fournitures.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.fournitures.map(f => (
                  <ProductCard key={f.id} product={f} type="fourniture" onAddToCart={(id,t) => handleAdd(id,t)}/>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
