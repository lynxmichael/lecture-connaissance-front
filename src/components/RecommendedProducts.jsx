import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from './ProductCard';
import BookCard from './BookCard';
import { formatCFA } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';

export default function RecommendedProducts({ productId, productType, onAddToCart, title = "Les clients ont aussi acheté" }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/recommendations?id=${productId}&type=${productType}&limit=6`)
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [productId, productType]);

  if (loading) return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[...Array(4)].map((_,i) => (
        <div key={i} className="flex-shrink-0 w-40 bg-white rounded-2xl border border-[#e8e0d4] overflow-hidden animate-pulse">
          <div className="skeleton h-24"/><div className="p-3 space-y-1.5">
            <div className="skeleton h-3 w-16 rounded"/><div className="skeleton h-4 w-full rounded"/>
            <div className="skeleton h-5 w-2/3 rounded"/>
          </div>
        </div>
      ))}
    </div>
  );

  if (products.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-black text-[#0f1923] mb-4" style={{fontFamily:'Playfair Display,serif'}}>
        🛍️ {title}
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
        {products.map(p => {
          const type   = p._type || productType;
          const nom    = type === 'fourniture' ? p.nom : p.titre;
          const emoji  = type === 'fourniture' ? getEmoji(p) : (p.image || '📖');
          const prix   = parseFloat(p.final_price ?? p.prix ?? 0);
          const path   = type === 'fourniture' ? `/fourniture/${p.id}` : `/book/${p.id}`;
          return (
            <div key={`${type}-${p.id}`} className="flex-shrink-0 w-44 bg-white rounded-2xl border border-[#e8e0d4] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden">
              <Link to={path}>
                <div className="text-5xl text-center py-4 bg-gradient-to-br from-[#faf7f2] to-[#ede5d4] group-hover:from-indigo-50 group-hover:to-blue-50 transition-colors">
                  {emoji}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold text-[#c9933a] uppercase tracking-widest truncate">
                    {type === 'fourniture' ? p.categorie : p.rayon}
                  </p>
                  <p className="font-bold text-[#0f1923] text-sm leading-tight line-clamp-2 mt-0.5" style={{fontFamily:'Playfair Display,serif'}}>
                    {nom}
                  </p>
                  <p className="font-extrabold text-[#2d7a4f] text-sm mt-2">{formatCFA(prix)}</p>
                </div>
              </Link>
              <button
                onClick={() => onAddToCart && onAddToCart(p.id, type)}
                disabled={p.quantite === 0}
                className={`w-full py-2 text-xs font-bold transition ${
                  p.quantite === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
                }`}
              >
                {p.quantite === 0 ? 'Rupture' : '+ Panier'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
