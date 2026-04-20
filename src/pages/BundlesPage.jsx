import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { formatCFA } from '../utils/currency';

const NIVEAUX = ['Primaire','Collège','Lycée','Université','Tous'];

function BundleCard({ bundle, onAddAll }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await onAddAll(bundle.id);
      showToast(`✅ Kit "${bundle.nom}" ajouté au panier !`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setTimeout(()=>setAdding(false), 800); }
  };

  return (
    <div className="bg-white border-2 border-[#e8e0d4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Header coloré */}
      <div className="bg-gradient-to-br from-[#0f1923] to-[#1e3a5f] p-6 text-center relative">
        <span className="text-5xl">{bundle.image || '🎒'}</span>
        {bundle.discount_percent > 0 && (
          <div className="absolute top-3 right-3 bg-[#d44040] text-white text-xs font-black px-2.5 py-1 rounded-full">
            -{bundle.discount_percent}%
          </div>
        )}
        {bundle.niveau && (
          <div className="absolute top-3 left-3 bg-[#c9933a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {bundle.niveau}{bundle.classe ? ` · ${bundle.classe}` : ''}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 p-5">
        <h3 className="font-black text-[#0f1923] text-lg mb-1 leading-tight" style={{fontFamily:'Playfair Display,serif'}}>
          {bundle.nom}
        </h3>
        {bundle.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{bundle.description}</p>
        )}

        {/* Articles du kit */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Contenu ({bundle.items?.length} article{bundle.items?.length>1?'s':''})
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {bundle.items?.map(item => {
              const nom = item.nom_produit || item.book?.titre || item.fourniture?.nom || '—';
              const emoji = item.item_type === 'fourniture' ? (item.fourniture?.image || '📦') : (item.book?.image || '📖');
              return (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-base flex-shrink-0">{emoji}</span>
                  <span className="flex-1 truncate text-gray-700">{nom}</span>
                  <span className="text-gray-400 text-xs flex-shrink-0">×{item.quantite}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prix */}
        <div className="border-t border-[#e8e0d4] pt-4">
          {bundle.discount_percent > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-400 text-sm line-through">{formatCFA(bundle.prix_normal)}</span>
              <span className="bg-red-100 text-[#d44040] text-xs font-bold px-2 py-0.5 rounded-full">
                Économie : {formatCFA(bundle.prix_normal - bundle.prix_bundle)}
              </span>
            </div>
          )}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400">Prix du kit</p>
              <p className="text-2xl font-black text-[#2d7a4f]">{formatCFA(bundle.prix_bundle)}</p>
            </div>
            <Link to={`/kits/${bundle.id}`} className="text-xs text-[#c9933a] hover:underline">
              Voir le détail →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleAdd} disabled={adding}
        className={`mx-5 mb-5 py-3 rounded-xl text-sm font-black tracking-wide transition-all active:scale-[0.98] ${
          adding ? 'bg-[#2d7a4f] text-white' : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
        }`}>
        {adding ? '✓ Kit ajouté au panier !' : '🛒 Ajouter tout le kit'}
      </button>
    </div>
  );
}

export default function BundlesPage() {
  const [bundles,   setBundles]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [niveau,    setNiveau]    = useState(searchParams.get('niveau') || '');
  const { addToCart, refresh }    = useCart();

  useEffect(() => {
    setLoading(true);
    const params = niveau && niveau !== 'Tous' ? `?niveau=${encodeURIComponent(niveau)}` : '';
    api.get(`/bundles${params}`)
      .then(r => setBundles(r.data))
      .catch(() => showToast('Erreur de chargement','error'))
      .finally(() => setLoading(false));
  }, [niveau]);

  const handleAddAll = async (bundleId) => {
    await api.post(`/bundles/${bundleId}/add-to-cart`);
    await refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-[#0f1923] rounded-3xl p-8 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:'radial-gradient(circle at 30% 50%, #c9933a 0%, transparent 60%)'}}/>
        <div className="relative">
          <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-2">Kits scolaires</p>
          <h1 className="text-3xl font-black text-white mb-3" style={{fontFamily:'Playfair Display,serif'}}>
            🎒 Kits & Ensembles prêts à l'emploi
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Tout le matériel nécessaire pour la rentrée, réunis en un seul clic. Économisez jusqu'à 25% par rapport à l'achat séparé.
          </p>
        </div>
      </div>

      {/* Filtres niveaux */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
        {NIVEAUX.map(n => (
          <button key={n} onClick={() => setNiveau(n==='Tous'?'':n)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all border-2 ${
              (niveau===n || (n==='Tous'&&!niveau))
                ? 'bg-[#c9933a] border-[#c9933a] text-white shadow-md'
                : 'border-[#e8e0d4] text-gray-600 bg-white hover:border-[#c9933a]'
            }`}>
            {n}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d4] overflow-hidden animate-pulse">
              <div className="skeleton h-36"/><div className="p-5 space-y-3">
                <div className="skeleton h-6 w-3/4 rounded"/><div className="skeleton h-4 w-full rounded"/>
                <div className="skeleton h-10 w-full rounded-xl mt-4"/>
              </div>
            </div>
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎒</p>
          <p className="text-gray-500 mb-2">Aucun kit disponible pour ce niveau.</p>
          <p className="text-gray-400 text-sm">Revenez bientôt — de nouveaux kits sont régulièrement ajoutés !</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map(b => <BundleCard key={b.id} bundle={b} onAddAll={handleAddAll}/>)}
        </div>
      )}
    </div>
  );
}
