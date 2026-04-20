import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { useWishlist } from '../contexts/WishlistContext';
import { formatCFA, discountPercent } from '../utils/currency';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import FournitureReviews from '../components/FournitureReviews';
import RecommendedProducts from '../components/RecommendedProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import { getEmoji, CATEGORIES } from '../utils/fournitures';

export default function FournitureDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggle: toggleWish } = useWishlist();
  const inWish = product ? isInWishlist(product.id, 'fourniture') : false;

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [qty,        setQty]        = useState(1);
  const [adding,     setAdding]     = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/fournitures/${id}?with=comments`)
      .then(r => {
        setProduct(r.data);
        addRecentlyViewed({
          id: r.data.id, type: 'fourniture',
          nom: r.data.nom, image: r.data.image_url || r.data.image || '📦',
          prix: r.data.final_price ?? r.data.prix,
        });
      })
      .catch(() => navigate('/fournitures'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    if (!user) {
      showToast('Connectez-vous pour ajouter au panier','error');
      navigate('/login',{state:{from:{pathname:`/fourniture/${id}`}}});
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, qty, 'fourniture');
      showToast(`✅ "${product.nom}" ajouté au panier (×${qty})`,'success');
    } catch (err) {
      showToast(err.response?.data?.message||'Erreur','error');
    } finally { setAdding(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-5/12 h-72 bg-[#e8e0d4] rounded-3xl"/>
        <div className="md:w-7/12 space-y-4">
          <div className="h-7 bg-[#e8e0d4] rounded w-3/4"/>
          <div className="h-5 bg-[#e8e0d4] rounded w-1/2"/>
          <div className="h-16 bg-[#e8e0d4] rounded mt-6"/>
          <div className="h-14 bg-[#e8e0d4] rounded w-1/3 mt-4"/>
        </div>
      </div>
    </div>
  );
  if (!product) return null;

  const emoji       = getEmoji(product);
  const prix        = parseFloat(product.prix);
  const finalPrice  = parseFloat(product.final_price ?? product.prix);
  const hasPromo    = finalPrice < prix - 1;
  const promo       = product.active_promotion_data;
  const catInfo     = CATEGORIES[product.categorie];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
        <Link to="/" className="hover:text-[#c9933a] transition">Accueil</Link>
        <span>›</span>
        <Link to="/fournitures" className="hover:text-[#c9933a] transition">Fournitures</Link>
        <span>›</span>
        <Link to={`/fournitures?categorie=${encodeURIComponent(product.categorie)}`} className="hover:text-[#c9933a] transition">
          {product.categorie}
        </Link>
        {product.sous_categorie && <><span>›</span><span className="text-gray-600">{product.sous_categorie}</span></>}
      </nav>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Visuel */}
        <div className="md:w-5/12 flex-shrink-0">
          <div className={`relative text-9xl rounded-3xl p-12 text-center shadow-inner mb-4 ${
            hasPromo ? 'bg-gradient-to-br from-red-50 to-amber-50' : 'bg-gradient-to-br from-indigo-50 to-blue-100'
          }`}>
            {hasPromo && (
              <span className="absolute top-4 left-4 bg-[#d44040] text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                -{discountPercent(prix,finalPrice)}%
              </span>
            )}
    {product.image_url
              ? <img src={product.image_url} alt={product.nom} className="max-h-full max-w-full object-contain rounded-xl"/>
              : emoji}
          </div>
          <div className="flex justify-center gap-2">
            <span className="bg-[#0f1923] text-[#c9933a] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              {catInfo?.emoji} {product.categorie}
            </span>
            {product.sous_categorie && (
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                {product.sous_categorie}
              </span>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black text-[#0f1923] leading-tight mb-2" style={{fontFamily:'Playfair Display,serif'}}>
            {product.nom}
          </h1>

          <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
            {product.marque   && <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">🏷 {product.marque}</span>}
            {product.reference && <span className="bg-gray-100 px-3 py-1 rounded-full font-mono text-xs">Réf: {product.reference}</span>}
          </div>

          {/* Bloc promo */}
          {hasPromo && promo && (
            <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#d44040] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPercent(prix,finalPrice)}%
                </span>
                <span className="font-bold text-[#d44040] text-sm">{promo.name}</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div><p className="text-xs text-gray-400">Économie</p><p className="font-bold text-[#2d7a4f]">{formatCFA(prix-finalPrice)}</p></div>
                {promo.end_at && <div><p className="text-xs text-gray-400">Expire le</p><p className="font-semibold">{new Date(promo.end_at).toLocaleDateString('fr-FR')}</p></div>}
              </div>
            </div>
          )}

          {/* Prix */}
          <div className="flex items-center gap-5 mb-6">
            {hasPromo ? (
              <div>
                <p className="text-sm text-gray-400 line-through">{formatCFA(prix)}</p>
                <p className="text-4xl font-black text-[#d44040]">{formatCFA(finalPrice)}</p>
              </div>
            ) : (
              <p className="text-4xl font-black text-[#2d7a4f]">{formatCFA(prix)}</p>
            )}
            {product.quantite > 0 ? (
              <span className="text-sm bg-green-50 text-[#2d7a4f] border border-green-200 px-3 py-1.5 rounded-xl font-medium">
                ✓ En stock ({product.quantite})
              </span>
            ) : (
              <span className="text-sm bg-red-50 text-[#d44040] border border-red-200 px-3 py-1.5 rounded-xl font-medium">
                ✗ Rupture
              </span>
            )}
          </div>

          {/* Quantité + panier */}
          {product.quantite > 0 && (
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center border-2 border-[#e8e0d4] rounded-xl overflow-hidden">
                <button onClick={() => setQty(q=>Math.max(1,q-1))}
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]">−</button>
                <span className="px-5 py-2.5 font-bold text-[#0f1923] min-w-[44px] text-center">{qty}</span>
                <button onClick={() => setQty(q=>Math.min(product.quantite,q+1))}
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]">+</button>
              </div>
              <button onClick={handleAdd} disabled={adding}
                className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  adding ? 'bg-[#2d7a4f] text-white' : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
                } disabled:opacity-70`}>
                {adding ? '✓ Ajouté !' : '🛒 Ajouter au panier'}
              </button>
              {user && (
                <button onClick={() => toggleWish(product.id, 'fourniture')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all active:scale-95 ${inWish ? 'bg-red-50 border-red-300 text-[#d44040]' : 'border-[#e8e0d4] text-gray-500 hover:border-red-300 hover:text-[#d44040]'}`}
                  title={inWish ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                  {inWish ? '❤️' : '🤍'}
                </button>
              )}
              <Link to={`/comparer?ids=${product.id}&type=fourniture`}
                className="px-4 py-3 rounded-xl border-2 border-[#e8e0d4] text-gray-500 hover:border-[#c9933a] hover:text-[#c9933a] transition-all"
                title="Comparer">⚖️</Link>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-[#e8e0d4] pt-6">
              <h2 className="text-base font-bold text-[#0f1923] mb-3 uppercase tracking-wide">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Produits liés dans la même catégorie */}
          <div className="border-t border-[#e8e0d4] pt-5 mt-6">
            <Link to={`/fournitures?categorie=${encodeURIComponent(product.categorie)}`}
              className="inline-flex items-center gap-2 text-sm text-[#c9933a] hover:underline font-medium">
              {catInfo?.emoji} Voir tous les {product.categorie} →
            </Link>
          </div>
        </div>
      <div className="mt-10 space-y-8">
        <div className="border-t border-[#e8e0d4] pt-8 space-y-10">
          <RecommendedProducts
            productId={product.id}
            productType="fourniture"
            onAddToCart={(id,type) => addToCart(id,1,type)}
          />
          <RecentlyViewed excludeId={product.id} excludeType="fourniture" />
        </div>
        <FournitureReviews
          fournitureId={product.id}
          comments={product.comments}
          onNewComment={(c) => setProduct(p => ({...p, comments:[...(p.comments||[]),c]}))}
        />
      </div>
    </div>
    </div>
  );

}

