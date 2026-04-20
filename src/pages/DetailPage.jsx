import { useWishlist } from '../contexts/WishlistContext';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { formatCFA, discountPercent } from '../utils/currency';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import RecommendedProducts from '../components/RecommendedProducts';
import RecentlyViewed from '../components/RecentlyViewed';

const Stars = ({ note, interactive=false, onChange }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button"
        onClick={() => interactive && onChange?.(n)}
        className={`text-xl transition-transform ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} ${n<=note ? 'text-[#c9933a]' : 'text-gray-200'}`}>
        ★
      </button>
    ))}
  </div>
);

function PromoBlock({ promo, originalPrice, finalPrice }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!promo?.end_at) return;
    const calc = () => {
      const diff = new Date(promo.end_at) - Date.now();
      if (diff<=0) { setTimeLeft('Terminée'); return; }
      const d=Math.floor(diff/86400000), h=Math.floor((diff%86400000)/3600000), m=Math.floor((diff%3600000)/60000);
      setTimeLeft(d>0?`${d}j ${h}h`:h>0?`${h}h ${m}min`:`${m} min`);
    };
    calc();
    const t=setInterval(calc,30000);
    return ()=>clearInterval(t);
  },[promo]);

  const pct = discountPercent(originalPrice, finalPrice);
  const savings = originalPrice - finalPrice;

  return (
    <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-[#d44040] text-white text-xs font-bold px-2.5 py-1 rounded-full">-{pct}%</span>
        <span className="font-bold text-[#d44040] text-sm">{promo.name}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <span className="text-gray-400 text-xs">Remise :</span>
          <p className="font-bold text-[#d44040]">
            {promo.type==='percentage' ? `-${promo.value}%` : `-${formatCFA(promo.value)}`}
          </p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Vous économisez :</span>
          <p className="font-bold text-[#2d7a4f]">{formatCFA(savings)}</p>
        </div>
        {promo.start_at && (
          <div>
            <span className="text-gray-400 text-xs">Du :</span>
            <p>{new Date(promo.start_at).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
        {promo.end_at && (
          <div>
            <span className="text-gray-400 text-xs">Au :</span>
            <p>{new Date(promo.end_at).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </div>
      {timeLeft && timeLeft!=='Terminée' && (
        <div className="mt-3 flex items-center gap-2 bg-amber-100 rounded-xl px-3 py-2">
          <span className="text-lg">⏱</span>
          <span className="text-sm font-semibold text-amber-800">Expire dans <strong>{timeLeft}</strong></span>
        </div>
      )}
      {promo.conditions && Object.keys(promo.conditions).length>0 && (
        <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-2">
          {promo.conditions.min_stock  && <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Stock ≥ {promo.conditions.min_stock}</span>}
          {promo.conditions.max_stock  && <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Stock ≤ {promo.conditions.max_stock}</span>}
          {promo.conditions.min_sales  && <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Dès {promo.conditions.min_sales} ventes</span>}
        </div>
      )}
    </div>
  );
}

export default function DetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { addToCart }= useCart();
  const { isInWishlist, toggle: toggleWish } = useWishlist();
  const inWish = book ? isInWishlist(book.id, 'book') : false;

  const [book, setBook]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [qty, setQty]               = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [comment, setComment]       = useState({ contenu:'', note:5 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);
        // Tracker dans l'historique récent
        addRecentlyViewed({
          id: res.data.id, type: 'book',
          nom: res.data.titre, image: res.data.image_url || res.data.image || '📖',
          prix: res.data.final_price ?? res.data.prix,
        });
      })
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const avgNote = book?.comments?.length
    ? (book.comments.reduce((s,c)=>s+c.note,0)/book.comments.length).toFixed(1)
    : null;

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Connectez-vous pour ajouter au panier','error');
      navigate('/login',{state:{from:{pathname:`/book/${id}`}}});
      return;
    }
    setAddingCart(true);
    try {
      await addToCart(book.id, qty);
      showToast(`✅ "${book.titre}" ajouté au panier (×${qty})`,'success');
    } catch (err) {
      showToast(err.response?.data?.message||'Erreur','error');
    } finally { setAddingCart(false); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.contenu.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/books/${book.id}/comment`, comment);
      setBook(prev => ({...prev, comments:[...(prev.comments||[]), res.data]}));
      setComment({contenu:'', note:5});
      showToast('Commentaire publié !','success');
    } catch (err) {
      showToast(err.response?.data?.message||'Vous avez peut-être déjà commenté','error');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="animate-pulse flex flex-col md:flex-row gap-10">
        <div className="md:w-1/3 h-72 bg-[#e8e0d4] rounded-2xl"/>
        <div className="md:w-2/3 space-y-4">
          <div className="h-8 bg-[#e8e0d4] rounded-xl w-3/4"/>
          <div className="h-5 bg-[#e8e0d4] rounded-xl w-1/2"/>
          <div className="h-20 bg-[#e8e0d4] rounded-xl mt-6"/>
          <div className="h-14 bg-[#e8e0d4] rounded-xl w-1/3 mt-4"/>
        </div>
      </div>
    </div>
  );
  if (!book) return null;

  const originalPrice = parseFloat(book.prix);
  const finalPrice    = parseFloat(book.final_price ?? book.prix);
  const hasPromo      = finalPrice < originalPrice - 1;
  const promo         = book.active_promotion_data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
        <Link to="/" className="hover:text-[#c9933a] transition">Accueil</Link>
        <span>›</span>
        <Link to="/catalog" className="hover:text-[#c9933a] transition">Catalogue</Link>
        <span>›</span>
        <Link to={`/catalog?rayon=${encodeURIComponent(book.rayon)}`} className="hover:text-[#c9933a] transition">{book.rayon}</Link>
        <span>›</span>
        <span className="text-gray-600 truncate max-w-[180px]">{book.titre}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Couverture */}
        <div className="md:w-5/12 flex-shrink-0">
          <div className={`relative text-9xl rounded-3xl p-12 text-center shadow-inner mb-4 ${
            hasPromo ? 'bg-gradient-to-br from-red-50 to-amber-50' : 'bg-gradient-to-br from-[#faf7f2] to-[#ede5d4]'
          }`}>
            {hasPromo && (
              <span className="absolute top-4 left-4 bg-[#d44040] text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                -{discountPercent(originalPrice, finalPrice)}%
              </span>
            )}
{book.image_url ? (
              <img src={book.image_url} alt={book.titre}
                className="max-h-full max-w-full object-contain rounded-xl" />
            ) : book.image || '📖'}
          </div>
          <div className="text-center">
            <span className="inline-block bg-[#0f1923] text-[#c9933a] text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
              {book.rayon}
            </span>
          </div>
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black text-[#0f1923] leading-tight mb-2" style={{fontFamily:'Playfair Display,serif'}}>
            {book.titre}
          </h1>
          <p className="text-xl text-gray-600 mb-1">{book.auteur}</p>
          <p className="text-gray-400 text-sm mb-5">
            {book.editeur}{book.annee ? ` · ${book.annee}` : ''} · ISBN: {book.isbn}
          </p>

          {avgNote && (
            <div className="flex items-center gap-2 mb-5">
              <Stars note={Math.round(avgNote)} />
              <span className="font-bold text-[#0f1923]">{avgNote}/5</span>
              <span className="text-gray-400 text-sm">({book.comments.length} avis)</span>
            </div>
          )}

          {/* Bloc promo */}
          {hasPromo && promo && (
            <PromoBlock promo={promo} originalPrice={originalPrice} finalPrice={finalPrice} />
          )}

          {/* Prix */}
          <div className="flex items-center gap-5 mb-6">
            {hasPromo ? (
              <div>
                <p className="text-sm text-gray-400 line-through">{formatCFA(originalPrice)}</p>
                <p className="text-4xl font-black text-[#d44040]">{formatCFA(finalPrice)}</p>
              </div>
            ) : (
              <p className="text-4xl font-black text-[#2d7a4f]">{formatCFA(originalPrice)}</p>
            )}
            {book.quantite > 0 ? (
              <span className="text-sm bg-green-50 text-[#2d7a4f] border border-green-200 px-3 py-1.5 rounded-xl font-medium">
                ✓ En stock ({book.quantite})
              </span>
            ) : (
              <span className="text-sm bg-red-50 text-[#d44040] border border-red-200 px-3 py-1.5 rounded-xl font-medium">
                ✗ Rupture
              </span>
            )}
          </div>

          {/* Quantité + ajout panier */}
          {book.quantite > 0 && (
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center border-2 border-[#e8e0d4] rounded-xl overflow-hidden">
                <button onClick={() => setQty(q=>Math.max(1,q-1))}
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]">−</button>
                <span className="px-5 py-2.5 font-bold text-[#0f1923] min-w-[44px] text-center">{qty}</span>
                <button onClick={() => setQty(q=>Math.min(book.quantite,q+1))}
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={addingCart}
                className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  addingCart
                    ? 'bg-[#2d7a4f] text-white'
                    : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
                } disabled:opacity-70`}>
                {addingCart ? '✓ Ajouté au panier !' : '🛒 Ajouter au panier'}
              </button>
              {user && (
                <button
                  onClick={() => toggleWish(book.id, 'book')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all active:scale-95 ${
                    inWish ? 'bg-red-50 border-red-300 text-[#d44040]' : 'border-[#e8e0d4] text-gray-500 hover:border-red-300 hover:text-[#d44040]'
                  }`}
                  title={inWish ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  {inWish ? '❤️' : '🤍'}
                </button>
              )}
              <Link to={`/comparer?ids=${book.id}&type=book`}
                className="px-4 py-3 rounded-xl border-2 border-[#e8e0d4] text-gray-500 hover:border-[#c9933a] hover:text-[#c9933a] transition-all"
                title="Comparer">
                ⚖️
              </Link>
            </div>
          )}

          {/* Description */}
          <div className="border-t border-[#e8e0d4] pt-6">
            <h2 className="text-base font-bold text-[#0f1923] mb-3 uppercase tracking-wide">Description</h2>
            <p className="text-gray-600 leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>

      {/* ── Recommandations ── */}
      <div className="mt-10 border-t border-[#e8e0d4] pt-8 space-y-10">
        <RecommendedProducts
          productId={book.id}
          productType="book"
          onAddToCart={(id,type) => addToCart(id,1,type)}
        />
        <RecentlyViewed excludeId={book.id} excludeType="book" />
      </div>

      {/* ── Commentaires ── */}
      <div className="mt-14 border-t border-[#e8e0d4] pt-10">
        <h2 className="text-2xl font-black text-[#0f1923] mb-8" style={{fontFamily:'Playfair Display,serif'}}>
          Avis des lecteurs
          {book.comments?.length>0 && <span className="text-gray-400 text-lg font-normal ml-2">({book.comments.length})</span>}
        </h2>

        {user ? (
          <form onSubmit={handleCommentSubmit}
            className="bg-white border border-[#e8e0d4] rounded-2xl p-6 mb-10 shadow-sm">
            <h3 className="font-bold text-[#0f1923] mb-4">Laissez votre avis</h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Votre note</label>
              <Stars note={comment.note} interactive onChange={n=>setComment(c=>({...c,note:n}))} />
            </div>
            <textarea
              value={comment.contenu} onChange={e=>setComment(c=>({...c,contenu:e.target.value}))}
              placeholder="Partagez votre avis sur ce livre…"
              className="w-full px-4 py-3 border border-[#e8e0d4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] text-sm transition mb-4"
              rows={3} required />
            <button type="submit" disabled={submitting||!comment.contenu.trim()}
              className="bg-[#0f1923] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c9933a] transition disabled:opacity-50">
              {submitting ? '⏳ Publication…' : '✍️ Publier mon avis'}
            </button>
          </form>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <p className="text-sm text-amber-800">
              <Link to="/login" state={{from:{pathname:`/book/${id}`}}} className="font-bold underline">
                Connectez-vous
              </Link>{' '}pour laisser un avis.
            </p>
          </div>
        )}

        {!book.comments?.length ? (
          <p className="text-gray-400 text-center py-12 text-sm">Aucun avis pour le moment. Soyez le premier !</p>
        ) : (
          <div className="space-y-4">
            {[...book.comments].reverse().map(c => (
              <div key={c.id} className="bg-white border border-[#e8e0d4] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center text-sm font-black text-[#c9933a]">
                    {c.user?.name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#0f1923]">{c.user?.prenom||''} {c.user?.name||'Anonyme'}</p>
                    <p className="text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="ml-auto"><Stars note={c.note} /></div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{c.contenu}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
