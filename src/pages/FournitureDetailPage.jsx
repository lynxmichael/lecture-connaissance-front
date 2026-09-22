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
<<<<<<< HEAD
=======
import ImageGallery from '../components/ImageGallery';

function InfoRow({ label, value, mono=false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b border-[#f0ece4] last:border-0">
      <span className="w-36 flex-shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
      <span className={`text-sm text-[#0f1923] font-medium flex-1 ${mono?'font-mono':''}`}>{value}</span>
    </div>
  );
}
>>>>>>> 294c6dc (Initial commit)

export default function FournitureDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggle: toggleWish } = useWishlist();
<<<<<<< HEAD
  const inWish = product ? isInWishlist(product.id, 'fourniture') : false;

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [qty,        setQty]        = useState(1);
  const [adding,     setAdding]     = useState(false);
=======

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [adding,   setAdding]   = useState(false);
  const [tab,      setTab]      = useState('description');

  const inWish = product ? isInWishlist(product.id, 'fourniture') : false;
>>>>>>> 294c6dc (Initial commit)

  useEffect(() => {
    setLoading(true);
    api.get(`/fournitures/${id}?with=comments`)
      .then(r => {
        setProduct(r.data);
<<<<<<< HEAD
        addRecentlyViewed({
          id: r.data.id, type: 'fourniture',
          nom: r.data.nom, image: r.data.image_url || r.data.image || '📦',
          prix: r.data.final_price ?? r.data.prix,
        });
=======
        addRecentlyViewed({ id:r.data.id, type:'fourniture', nom:r.data.nom, image:r.data.image_url||r.data.image||'📦', prix:r.data.final_price??r.data.prix });
>>>>>>> 294c6dc (Initial commit)
      })
      .catch(() => navigate('/fournitures'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
<<<<<<< HEAD
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
=======
    if (!user) { showToast('Connectez-vous pour ajouter au panier','error'); navigate('/login',{state:{from:{pathname:`/fourniture/${id}`}}}); return; }
    setAdding(true);
    try { await addToCart(product.id, qty, 'fourniture'); showToast(`✅ "${product.nom}" ajouté au panier (×${qty})`,'success'); }
    catch(err) { showToast(err.response?.data?.message||'Erreur','error'); }
    finally { setAdding(false); }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-5/12 h-80 bg-[#e8e0d4] rounded-3xl"/>
        <div className="md:w-7/12 space-y-4">
          <div className="h-7 bg-[#e8e0d4] rounded w-3/4"/>
          <div className="h-5 bg-[#e8e0d4] rounded w-1/2"/>
          <div className="h-32 bg-[#e8e0d4] rounded mt-6"/>
>>>>>>> 294c6dc (Initial commit)
          <div className="h-14 bg-[#e8e0d4] rounded w-1/3 mt-4"/>
        </div>
      </div>
    </div>
  );
  if (!product) return null;

<<<<<<< HEAD
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
=======
  const emoji      = getEmoji(product);
  const prix       = parseFloat(product.prix);
  const finalPrice = parseFloat(product.final_price ?? product.prix);
  const hasPromo   = finalPrice < prix - 1;
  const promo      = product.active_promotion_data;
  const catInfo    = CATEGORIES[product.categorie];
  const nbPhotos   = (product.images?.length ?? 0) + (product.image_url ? 1 : 0);
  const prixPromo  = product.promotion > 0 ? Math.round(prix * (1 - product.promotion / 100)) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
        <Link to="/" className="hover:text-[#c9933a] transition">Accueil</Link><span>›</span>
        <Link to="/fournitures" className="hover:text-[#c9933a] transition">Fournitures</Link><span>›</span>
        <Link to={`/fournitures?categorie=${encodeURIComponent(product.categorie)}`} className="hover:text-[#c9933a] transition">{product.categorie}</Link>
        {product.sous_categorie&&<><span>›</span><span className="text-gray-600">{product.sous_categorie}</span></>}
        <span>›</span>
        <span className="text-gray-600 truncate max-w-[160px]">{product.nom}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10">

        {/* ── Galerie photos ─────────────────────────────────────────── */}
        <div className="md:w-5/12 flex-shrink-0">
          <ImageGallery
            mainUrl={product.image_url}
            images={product.images ?? []}
            alt={product.nom}
            fallback={emoji}
            hasBadge={hasPromo ? `-${discountPercent(prix,finalPrice)}%` : product.promotion>0 ? `-${product.promotion}%` : null}
          />

          {nbPhotos > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {nbPhotos} photo{nbPhotos>1?'s':''} · Cliquez pour agrandir
            </p>
          )}

          {/* Badges catégorie */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
>>>>>>> 294c6dc (Initial commit)
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

<<<<<<< HEAD
        {/* Infos */}
        <div className="flex-1 min-w-0">
=======
        {/* ── Informations produit ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">

>>>>>>> 294c6dc (Initial commit)
          <h1 className="text-3xl font-black text-[#0f1923] leading-tight mb-2" style={{fontFamily:'Playfair Display,serif'}}>
            {product.nom}
          </h1>

<<<<<<< HEAD
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
=======
          {/* Marque + référence */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.marque    && <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">🏷 {product.marque}</span>}
            {product.reference && <span className="bg-gray-100 text-gray-500 text-xs font-mono px-3 py-1.5 rounded-full">Réf: {product.reference}</span>}
          </div>

          {/* Bloc promo dynamique */}
          {hasPromo && promo && (
            <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#d44040] text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPercent(prix,finalPrice)}%</span>
>>>>>>> 294c6dc (Initial commit)
                <span className="font-bold text-[#d44040] text-sm">{promo.name}</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div><p className="text-xs text-gray-400">Économie</p><p className="font-bold text-[#2d7a4f]">{formatCFA(prix-finalPrice)}</p></div>
<<<<<<< HEAD
                {promo.end_at && <div><p className="text-xs text-gray-400">Expire le</p><p className="font-semibold">{new Date(promo.end_at).toLocaleDateString('fr-FR')}</p></div>}
=======
                {promo.end_at&&<div><p className="text-xs text-gray-400">Expire le</p><p className="font-semibold">{new Date(promo.end_at).toLocaleDateString('fr-FR')}</p></div>}
>>>>>>> 294c6dc (Initial commit)
              </div>
            </div>
          )}

<<<<<<< HEAD
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
=======
          {/* Prix + stock */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              {hasPromo ? (
                <>
                  <p className="text-sm text-gray-400 line-through">{formatCFA(prix)}</p>
                  <p className="text-4xl font-black text-[#d44040]">{formatCFA(finalPrice)}</p>
                </>
              ) : prixPromo ? (
                <>
                  <p className="text-sm text-gray-400 line-through">{formatCFA(prix)}</p>
                  <p className="text-4xl font-black text-[#d44040]">{formatCFA(prixPromo)}</p>
                </>
              ) : (
                <p className="text-4xl font-black text-[#2d7a4f]">{formatCFA(prix)}</p>
              )}
            </div>
            {product.quantite > 0
              ? <span className="text-sm bg-green-50 text-[#2d7a4f] border border-green-200 px-3 py-1.5 rounded-xl font-medium">✓ En stock ({product.quantite})</span>
              : <span className="text-sm bg-red-50 text-[#d44040] border border-red-200 px-3 py-1.5 rounded-xl font-medium">✗ Rupture de stock</span>
            }
>>>>>>> 294c6dc (Initial commit)
          </div>

          {/* Quantité + panier */}
          {product.quantite > 0 && (
<<<<<<< HEAD
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
=======
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <div className="flex items-center border-2 border-[#e8e0d4] rounded-xl overflow-hidden">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]">−</button>
                <span className="px-5 py-2.5 font-bold text-[#0f1923] min-w-[44px] text-center">{qty}</span>
                <button onClick={()=>setQty(q=>Math.min(product.quantite,q+1))} className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]">+</button>
              </div>
              <button onClick={handleAdd} disabled={adding}
                className={`flex-1 min-w-[180px] py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${adding?'bg-[#2d7a4f] text-white':'bg-[#0f1923] text-white hover:bg-[#c9933a]'} disabled:opacity-70`}>
                {adding?'✓ Ajouté !':'🛒 Ajouter au panier'}
              </button>
              {user && (
                <button onClick={()=>toggleWish(product.id,'fourniture')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all active:scale-95 ${inWish?'bg-red-50 border-red-300 text-[#d44040]':'border-[#e8e0d4] text-gray-500 hover:border-red-300 hover:text-[#d44040]'}`}>
                  {inWish?'❤️':'🤍'}
                </button>
              )}
              <Link to={`/comparer?ids=${product.id}&type=fourniture`}
                className="px-4 py-3 rounded-xl border-2 border-[#e8e0d4] text-gray-500 hover:border-[#c9933a] hover:text-[#c9933a] transition-all" title="Comparer">⚖️</Link>
            </div>
          )}

          {/* Onglets */}
          <div className="border border-[#e8e0d4] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[#e8e0d4]">
              {[['description','📄 Description'],['details','📋 Caractéristiques'],['livraison','🚚 Livraison']].map(([key,label])=>(
                <button key={key} onClick={()=>setTab(key)}
                  className={`flex-1 py-3 text-sm font-semibold transition ${tab===key?'bg-white text-[#0f1923] border-b-2 border-[#c9933a]':'bg-[#faf7f2] text-gray-400 hover:text-[#0f1923]'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 bg-white">
              {tab==='description' && (
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.description || 'Aucune description disponible pour ce produit.'}
                </p>
              )}

              {tab==='details' && (
                <div className="divide-y divide-[#f0ece4]">
                  <InfoRow label="Nom"           value={product.nom} />
                  <InfoRow label="Catégorie"     value={`${catInfo?.emoji||''} ${product.categorie}`} />
                  <InfoRow label="Sous-catégorie" value={product.sous_categorie} />
                  <InfoRow label="Marque"        value={product.marque} />
                  <InfoRow label="Référence"     value={product.reference} mono />
                  <InfoRow label="Prix unitaire" value={formatCFA(prix)} />
                  {(hasPromo||prixPromo) && <InfoRow label="Prix promo" value={formatCFA(hasPromo?finalPrice:prixPromo)} />}
                  {product.promotion>0 && <InfoRow label="Remise"  value={`-${product.promotion}%`} />}
                  <InfoRow label="Stock"         value={`${product.quantite} unité${product.quantite>1?'s':''}`} />
                  <InfoRow label="Réf. interne"  value={`FOURN-${String(product.id).padStart(5,'0')}`} mono />
                </div>
              )}

              {tab==='livraison' && (
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex gap-3 items-start"><span className="text-2xl">🏪</span><div><p className="font-semibold text-[#0f1923]">Retrait en magasin</p><p className="text-xs text-gray-400">Gratuit · Disponible aujourd'hui · Cocody, Abidjan</p></div></div>
                  <div className="flex gap-3 items-start"><span className="text-2xl">📦</span><div><p className="font-semibold text-[#0f1923]">Livraison à domicile</p><p className="text-xs text-gray-400">Abidjan : 24–48h · Autres villes : 3–5 jours</p></div></div>
                  <div className="flex gap-3 items-start"><span className="text-2xl">💳</span><div><p className="font-semibold text-[#0f1923]">Paiement mobile</p><p className="text-xs text-gray-400">Orange Money · MTN · Moov · Wave</p></div></div>
                  <div className="flex gap-3 items-start"><span className="text-2xl">🔄</span><div><p className="font-semibold text-[#0f1923]">Retour & échange</p><p className="text-xs text-gray-400">7 jours après réception, si non utilisé</p></div></div>
                </div>
              )}
            </div>
          </div>

          {/* Lien vers la catégorie */}
          <div className="mt-5">
>>>>>>> 294c6dc (Initial commit)
            <Link to={`/fournitures?categorie=${encodeURIComponent(product.categorie)}`}
              className="inline-flex items-center gap-2 text-sm text-[#c9933a] hover:underline font-medium">
              {catInfo?.emoji} Voir tous les {product.categorie} →
            </Link>
          </div>
        </div>
<<<<<<< HEAD
      <div className="mt-10 space-y-8">
        <div className="border-t border-[#e8e0d4] pt-8 space-y-10">
          <RecommendedProducts
            productId={product.id}
            productType="fourniture"
            onAddToCart={(id,type) => addToCart(id,1,type)}
          />
          <RecentlyViewed excludeId={product.id} excludeType="fourniture" />
        </div>
=======
      </div>

      {/* Recommandations + récents */}
      <div className="mt-12 border-t border-[#e8e0d4] pt-10 space-y-10">
        <RecommendedProducts productId={product.id} productType="fourniture" onAddToCart={(id,type)=>addToCart(id,1,type)} />
        <RecentlyViewed excludeId={product.id} excludeType="fourniture" />
      </div>

      {/* Avis */}
      <div className="mt-10">
>>>>>>> 294c6dc (Initial commit)
        <FournitureReviews
          fournitureId={product.id}
          comments={product.comments}
          onNewComment={(c) => setProduct(p => ({...p, comments:[...(p.comments||[]),c]}))}
        />
      </div>
    </div>
<<<<<<< HEAD
    </div>
  );

}

=======
  );
}
>>>>>>> 294c6dc (Initial commit)
