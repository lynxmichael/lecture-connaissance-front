import { useWishlist } from '../contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { formatCFA, discountPercent } from '../utils/currency';

function Countdown({ endAt }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt) - Date.now();
      if (diff <= 0) { setText('Terminée'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setText(d > 0 ? `${d}j ${h}h` : h > 0 ? `${h}h ${m}m` : `${m} min`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [endAt]);
  return <span className="font-bold">⏱ {text}</span>;
}

export default function BookCard({ book, onAddToCart }) {
  const navigate  = useNavigate();
  const [adding, setAdding] = useState(false);
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const inWish = isInWishlist(book.id, 'book');
  const handleWish = async (e) => { e.stopPropagation(); try { await toggleWishlist(book.id,'book'); } catch {} };
  if (!book) return null;

  const prix       = parseFloat(book.prix || 0);
  const finalPrice = parseFloat(book.final_price ?? prix);
  const hasPromo   = finalPrice < prix - 1;
  const promo      = book.active_promotion_data;
  const pct        = hasPromo ? discountPercent(prix, finalPrice) : 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (book.quantite === 0 || adding) return;
    setAdding(true);
    try { await onAddToCart(book.id, 'book'); }
    finally { setTimeout(() => setAdding(false), 800); }
  };

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-[#e8e0d4] cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Promo badge */}
      {hasPromo && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <span className="bg-[#d44040] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            -{pct}%
          </span>
        </div>
      )}
      {hasPromo && promo?.end_at && (
        <div className="absolute top-3 right-3 z-10 bg-[#0f1923]/80 text-[#f0d49a] text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
          <Countdown endAt={promo.end_at} />
        </div>
      )}

      {/* Cover */}
      <div className={`relative text-6xl text-center py-6 transition-colors duration-300 ${
        hasPromo ? 'bg-gradient-to-br from-red-50 to-orange-50' : 'bg-gradient-to-br from-[#faf7f2] to-[#f0ebe0]'
      }`}>
        <button onClick={handleWish}
          className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-sm hover:scale-110 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10">
          {inWish ? '❤️' : '🤍'}
        </button>
        <span className="block group-hover:scale-110 transition-transform duration-300 select-none">
          {book.image || '📖'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 p-4">
        <p className="text-[10px] font-bold text-[#c9933a] uppercase tracking-widest mb-1">{book.rayon}</p>
        <h3 className="font-bold text-[#0f1923] leading-tight line-clamp-2 mb-1" style={{fontFamily:'Playfair Display,serif'}}>
          {book.titre}
        </h3>
        <p className="text-sm text-gray-500 truncate">{book.auteur}</p>

        {hasPromo && promo?.name && (
          <p className="text-xs text-[#d44040] font-medium mt-1.5 truncate">🏷 {promo.name}</p>
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
          {book.quantite === 0 && (
            <span className="text-[10px] font-bold text-[#d44040] bg-red-50 px-2 py-0.5 rounded-full">Rupture</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={book.quantite === 0}
        className={`mx-4 mb-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
          book.quantite === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : adding
              ? 'bg-[#2d7a4f] text-white scale-95'
              : 'bg-[#0f1923] text-white hover:bg-[#c9933a] active:scale-95'
        }`}
      >
        {book.quantite === 0 ? 'Indisponible' : adding ? '✓ Ajouté !' : 'Ajouter au panier'}
      </button>
    </div>
  );
}
