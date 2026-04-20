import { useWishlist } from '../contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { formatCFA, discountPercent } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';

export default function ProductCard({ product, type = 'book', onAddToCart }) {
  const navigate  = useNavigate();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const inWish = isInWishlist(product.id, type);
  
  const handleWish = async (e) => {
    e.stopPropagation();
    try { await toggleWishlist(product.id, type); }
    catch { /* not logged in */ }
  };
  const [adding, setAdding] = useState(false);
  if (!product) return null;

  const isFourniture = type === 'fourniture';
  const nom          = isFourniture ? product.nom : product.titre;
  const sousTitre    = isFourniture ? (product.marque || product.sous_categorie) : product.auteur;
  const categorie    = isFourniture ? product.categorie : product.rayon;
  const emoji        = isFourniture ? getEmoji(product) : (product.image || '📖');
  const prix         = parseFloat(product.prix || 0);
  const finalPrice   = parseFloat(product.final_price ?? prix);
  const hasPromo     = finalPrice < prix - 1;
  const promo        = product.active_promotion_data;
  const pct          = hasPromo ? discountPercent(prix, finalPrice) : 0;
  const path         = isFourniture ? `/fourniture/${product.id}` : `/book/${product.id}`;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (product.quantite === 0 || adding) return;
    setAdding(true);
    try {
      await onAddToCart(product.id, isFourniture ? 'fourniture' : 'book');
    } finally {
      setTimeout(() => setAdding(false), 800);
    }
  };

  return (
    <div
      onClick={() => navigate(path)}
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-[#e8e0d4] cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Badge promo */}
      {hasPromo && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#d44040] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            -{pct}%
          </span>
        </div>
      )}

      {/* Badge type fourniture */}
      {isFourniture && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-[#0f1923]/70 text-[#c9933a] text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            Fourniture
          </span>
        </div>
      )}

      {/* Cover */}
      <div className={`relative text-6xl text-center py-6 transition-colors duration-300 select-none ${
        hasPromo ? 'bg-gradient-to-br from-red-50 to-orange-50'
        : isFourniture ? 'bg-gradient-to-br from-indigo-50 to-blue-50'
        : 'bg-gradient-to-br from-[#faf7f2] to-[#f0ebe0]'
      }`}>
        <span className="block group-hover:scale-110 transition-transform duration-300">{emoji}</span>
        <button onClick={handleWish}
          className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-sm hover:scale-110 transition-all shadow-sm opacity-0 group-hover:opacity-100">
          {inWish ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 p-4">
        <p className="text-[10px] font-bold text-[#c9933a] uppercase tracking-widest mb-1 truncate">{categorie}</p>
        <h3 className="font-bold text-[#0f1923] leading-tight line-clamp-2 mb-1 text-sm" style={{fontFamily:'Playfair Display,serif'}}>
          {nom}
        </h3>
        {sousTitre && <p className="text-xs text-gray-500 truncate">{sousTitre}</p>}
        {hasPromo && promo?.name && (
          <p className="text-xs text-[#d44040] font-medium mt-1 truncate">🏷 {promo.name}</p>
        )}

        {/* Prix */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {hasPromo ? (
              <>
                <p className="text-xs text-gray-400 line-through leading-none">{formatCFA(prix)}</p>
                <p className="text-lg font-extrabold text-[#d44040] leading-tight">{formatCFA(finalPrice)}</p>
              </>
            ) : (
              <p className="text-lg font-extrabold text-[#2d7a4f]">{formatCFA(prix)}</p>
            )}
          </div>
          {product.quantite === 0 && (
            <span className="text-[10px] font-bold text-[#d44040] bg-red-50 px-2 py-0.5 rounded-full">Rupture</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={product.quantite === 0}
        className={`mx-4 mb-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
          product.quantite === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : adding ? 'bg-[#2d7a4f] text-white scale-95'
          : 'bg-[#0f1923] text-white hover:bg-[#c9933a] active:scale-95'
        }`}
      >
        {product.quantite === 0 ? 'Indisponible' : adding ? '✓ Ajouté !' : 'Ajouter au panier'}
      </button>
    </div>
  );
}
