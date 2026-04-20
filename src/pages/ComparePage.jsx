import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { formatCFA, discountPercent } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids   = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const type  = searchParams.get('type') || 'book';

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (ids.length === 0) return;
    setLoading(true);
    const endpoint = type === 'fourniture' ? 'fournitures' : 'books';
    Promise.all(ids.map(id => api.get(`/${endpoint}/${id}`).then(r => r.data)))
      .then(setProducts)
      .catch(() => showToast('Erreur de chargement', 'error'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const removeProduct = (id) => {
    const newIds = ids.filter(i => i !== String(id));
    setSearchParams({ ids: newIds.join(','), type });
  };

  const handleAddToCart = async (id) => {
    try {
      await addToCart(id, 1, type);
      showToast('✅ Ajouté au panier', 'success');
    } catch { showToast('Connectez-vous pour ajouter', 'error'); }
  };

  if (products.length === 0 && !loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">⚖️</p>
      <h1 className="text-2xl font-black text-[#0f1923] mb-3" style={{fontFamily:'Playfair Display,serif'}}>
        Comparer des produits
      </h1>
      <p className="text-gray-500 mb-6">Aucun produit sélectionné pour la comparaison.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/catalog"     className="bg-[#0f1923] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#c9933a] transition">📚 Livres</Link>
        <Link to="/fournitures" className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:border-[#c9933a] transition">✏️ Fournitures</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">
      <div className="text-4xl animate-spin mb-3">⟳</div>
      <p>Chargement de la comparaison…</p>
    </div>
  );

  // Build comparison attributes
  const attrs = type === 'book'
    ? [
        { label: 'Auteur',      fn: p => p.auteur || '—' },
        { label: 'Éditeur',     fn: p => p.editeur || '—' },
        { label: 'Rayon',       fn: p => p.rayon || '—' },
        { label: 'Année',       fn: p => p.annee || '—' },
        { label: 'ISBN',        fn: p => <span className="font-mono text-xs">{p.isbn}</span> },
        { label: 'Prix',        fn: p => <span className="font-black text-[#2d7a4f]">{formatCFA(p.final_price ?? p.prix)}</span> },
        { label: 'En stock',    fn: p => p.quantite > 0 ? <span className="text-[#2d7a4f] font-bold">✓ {p.quantite} ex.</span> : <span className="text-[#d44040] font-bold">Rupture</span> },
        { label: 'Promotion',   fn: p => p.active_promotion_data ? <span className="text-[#d44040] font-bold">-{discountPercent(p.prix, p.final_price)}%</span> : '—' },
      ]
    : [
        { label: 'Catégorie',      fn: p => p.categorie || '—' },
        { label: 'Sous-catégorie', fn: p => p.sous_categorie || '—' },
        { label: 'Marque',         fn: p => p.marque || '—' },
        { label: 'Référence',      fn: p => <span className="font-mono text-xs">{p.reference || '—'}</span> },
        { label: 'Prix',           fn: p => <span className="font-black text-[#2d7a4f]">{formatCFA(p.final_price ?? p.prix)}</span> },
        { label: 'En stock',       fn: p => p.quantite > 0 ? <span className="text-[#2d7a4f] font-bold">✓ {p.quantite}</span> : <span className="text-[#d44040] font-bold">Rupture</span> },
        { label: 'Promotion',      fn: p => p.active_promotion_data ? <span className="text-[#d44040] font-bold">-{discountPercent(p.prix, p.final_price)}%</span> : '—' },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Comparaison</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          ⚖️ Comparer les produits
        </h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          {/* Header produits */}
          <thead>
            <tr>
              <th className="w-32 p-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b-2 border-[#e8e0d4]">
                Critère
              </th>
              {products.map(p => {
                const nom   = type === 'fourniture' ? p.nom : p.titre;
                const emoji = type === 'fourniture' ? getEmoji(p) : (p.image || '📖');
                const path  = type === 'fourniture' ? `/fourniture/${p.id}` : `/book/${p.id}`;
                return (
                  <th key={p.id} className="p-4 border-b-2 border-[#e8e0d4] text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <Link to={path} className="text-5xl block hover:scale-105 transition">{emoji}</Link>
                        <button onClick={() => removeProduct(p.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-[#d44040] text-white rounded-full text-xs flex items-center justify-center hover:scale-110 transition">
                          ✕
                        </button>
                      </div>
                      <Link to={path} className="font-bold text-[#0f1923] text-sm text-center leading-tight hover:text-[#c9933a] transition line-clamp-2"
                        style={{fontFamily:'Playfair Display,serif'}}>
                        {nom}
                      </Link>
                      <button onClick={() => handleAddToCart(p.id)}
                        disabled={p.quantite === 0}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                          p.quantite === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
                        }`}>
                        {p.quantite === 0 ? 'Indisponible' : '🛒 Ajouter'}
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {attrs.map((attr, i) => (
              <tr key={attr.label} className={i % 2 === 0 ? 'bg-[#faf7f2]' : 'bg-white'}>
                <td className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide border-r border-[#e8e0d4]">
                  {attr.label}
                </td>
                {products.map(p => (
                  <td key={p.id} className="px-4 py-3 text-sm text-[#0f1923] text-center border-r border-[#e8e0d4]/50">
                    {attr.fn(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note bas */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Vous pouvez comparer jusqu'à 4 produits. Cliquez sur ✕ pour retirer un produit.
      </p>
    </div>
  );
}
