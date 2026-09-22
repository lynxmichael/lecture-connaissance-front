
import { useParams, useNavigate, Link } from 'react-router-dom';

import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { showToast } from '../components/Toast';

import { formatCFA, discountPercent } from '../utils/currency';
import { addRecentlyViewed } from '../utils/recentlyViewed';

import RecommendedProducts from '../components/RecommendedProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import ImageGallery from '../components/ImageGallery';

const Stars = ({ note = 0, interactive = false, onChange }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => interactive && onChange?.(n)}
        className={`text-xl transition-transform ${
          interactive
            ? 'cursor-pointer hover:scale-125'
            : 'cursor-default'
        } ${n <= note ? 'text-[#c9933a]' : 'text-gray-200'}`}
        disabled={!interactive}
        aria-label={`Note ${n} sur 5`}
      >
        ★
      </button>
    ))}
  </div>
);

function InfoRow({ label, value, mono = false }) {
  if (!value && value !== 0) return null;

  return (
    <div className="flex gap-3 py-2.5 border-b border-[#f0ece4] last:border-0">
      <span className="w-32 flex-shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">
        {label}
      </span>

      <span
        className={`text-sm text-[#0f1923] font-medium flex-1 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PromoBlock({ promo, originalPrice, finalPrice }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!promo?.end_at) {
      setTimeLeft('');
      return undefined;
    }

    const calc = () => {
      const diff = new Date(promo.end_at).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft('Terminée');
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);

      setTimeLeft(
        d > 0
          ? `${d}j ${h}h`
          : h > 0
            ? `${h}h ${m}min`
            : `${m} min`
      );
    };

    calc();

    const timer = setInterval(calc, 30000);

    return () => clearInterval(timer);
  }, [promo]);

  const pct = discountPercent(originalPrice, finalPrice);
  const savings = Math.max(0, originalPrice - finalPrice);

  return (
    <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-[#d44040] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          -{pct}%
        </span>

        <span className="font-bold text-[#d44040] text-sm">
          {promo.name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <span className="text-gray-400 text-xs">Remise :</span>
          <p className="font-bold text-[#d44040]">
            {promo.type === 'percentage'
              ? `-${promo.value}%`
              : `-${formatCFA(promo.value)}`}
          </p>
        </div>

        <div>
          <span className="text-gray-400 text-xs">
            Vous économisez :
          </span>
          <p className="font-bold text-[#2d7a4f]">
            {formatCFA(savings)}
          </p>
        </div>

        {promo.start_at && (
          <div>
            <span className="text-gray-400 text-xs">Du :</span>
            <p>
              {new Date(promo.start_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        {promo.end_at && (
          <div>
            <span className="text-gray-400 text-xs">Au :</span>
            <p>
              {new Date(promo.end_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}
      </div>

      {timeLeft && timeLeft !== 'Terminée' && (
        <div className="mt-3 flex items-center gap-2 bg-amber-100 rounded-xl px-3 py-2">
          <span className="text-lg">⏱</span>
          <span className="text-sm font-semibold text-amber-800">
            Expire dans <strong>{timeLeft}</strong>
          </span>
        </div>
      )}

      {promo.conditions &&
        Object.keys(promo.conditions).length > 0 && (
          <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-2">
            {promo.conditions.min_stock && (
              <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Stock ≥ {promo.conditions.min_stock}
              </span>
            )}

            {promo.conditions.max_stock && (
              <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Stock ≤ {promo.conditions.max_stock}
              </span>
            )}

            {promo.conditions.min_sales && (
              <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Dès {promo.conditions.min_sales} ventes
              </span>
            )}
          </div>
        )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-5/12 h-80 bg-[#e8e0d4] rounded-3xl" />

        <div className="md:w-7/12 space-y-4">
          <div className="h-8 bg-[#e8e0d4] rounded-xl w-3/4" />
          <div className="h-5 bg-[#e8e0d4] rounded-xl w-1/2" />
          <div className="h-32 bg-[#e8e0d4] rounded-xl mt-6" />
          <div className="h-14 bg-[#e8e0d4] rounded-xl w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggle: toggleWish } = useWishlist();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [comment, setComment] = useState({
    contenu: '',
    note: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('description');

  const inWish = book
    ? isInWishlist(book.id, 'book')
    : false;

  useEffect(() => {
    let mounted = true;

    const loadBook = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/books/${id}`);

        if (!mounted) return;

        setBook(res.data);

        addRecentlyViewed({
          id: res.data.id,
          type: 'book',
          nom: res.data.titre,
          image: res.data.image_url || res.data.image || '📖',
          prix: res.data.final_price ?? res.data.prix,
        });
      } catch {
        if (mounted) {
          navigate('/catalog');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!book) return;

    const stock = Number(book.quantite || 0);

    setQty((current) => {
      if (stock <= 0) return 1;
      return Math.min(Math.max(1, current), stock);
    });
  }, [book]);

  const avgNote = book?.comments?.length
    ? (
        book.comments.reduce(
          (sum, current) => sum + Number(current.note || 0),
          0
        ) / book.comments.length
      ).toFixed(1)
    : null;

  const handleAddToCart = async () => {
    if (!book) return;

    if (!user) {
      showToast(
        'Connectez-vous pour ajouter au panier',
        'error'
      );

      navigate('/login', {
        state: {
          from: {
            pathname: `/book/${id}`,
          },
        },
      });

      return;
    }

    setAddingCart(true);

    try {
      await addToCart(book.id, qty);

      showToast(
        `✅ "${book.titre}" ajouté au panier (×${qty})`,
        'success'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors de l’ajout au panier',
        'error'
      );
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!book) return;

    if (!user) {
      showToast(
        'Connectez-vous pour gérer vos favoris',
        'error'
      );

      navigate('/login', {
        state: {
          from: {
            pathname: `/book/${id}`,
          },
        },
      });

      return;
    }

    try {
      await toggleWish(book.id, 'book');
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          'Impossible de modifier les favoris',
        'error'
      );
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!book || !comment.contenu.trim()) return;

    setSubmitting(true);

    try {
      const res = await api.post(
        `/books/${book.id}/comment`,
        comment
      );

      setBook((prev) => ({
        ...prev,
        comments: [
          ...(prev.comments || []),
          res.data,
        ],
      }));

      setComment({
        contenu: '',
        note: 5,
      });

      showToast(
        'Commentaire publié !',
        'success'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          'Vous avez peut-être déjà commenté',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!book) {
    return null;
  }

  const originalPrice = parseFloat(book.prix) || 0;
  const finalPrice =
    parseFloat(book.final_price ?? book.prix) ||
    originalPrice;

  const hasPromo = finalPrice < originalPrice - 1;
  const promo = book.active_promotion_data;

  const nbPhotos =
    (book.images?.length ?? 0) +
    (book.image_url ? 1 : 0);

  const stock = Number(book.quantite || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
        <Link
          to="/"
          className="hover:text-[#c9933a] transition"
        >
          Accueil
        </Link>

        <span>›</span>

        <Link
          to="/catalog"
          className="hover:text-[#c9933a] transition"
        >
          Catalogue
        </Link>

        <span>›</span>

        <Link
          to={`/catalog?rayon=${encodeURIComponent(
            book.rayon || ''
          )}`}
          className="hover:text-[#c9933a] transition"
        >
          {book.rayon}
        </Link>

        <span>›</span>

        <span className="text-gray-600 truncate max-w-[200px]">
          {book.titre}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Galerie */}
        <div className="md:w-5/12 flex-shrink-0">
          <ImageGallery
            mainUrl={book.image_url}
            images={book.images ?? []}
            alt={book.titre}
            fallback={book.image || '📖'}
            hasBadge={
              hasPromo
                ? `-${discountPercent(
                    originalPrice,
                    finalPrice
                  )}%`
                : null
            }
          />

          {nbPhotos > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {nbPhotos} photo
              {nbPhotos > 1 ? 's' : ''} disponible
              {nbPhotos > 1 ? 's' : ''} · Cliquez pour
              agrandir
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="bg-[#0f1923] text-[#c9933a] text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
              {book.rayon}
            </span>

            {book.annee && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                📅 {book.annee}
              </span>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-3xl font-black text-[#0f1923] leading-tight mb-2"
            style={{
              fontFamily: 'Playfair Display,serif',
            }}
          >
            {book.titre}
          </h1>

          <p className="text-lg text-gray-600 mb-1 font-medium">
            {book.auteur}
          </p>

          <p className="text-gray-400 text-sm mb-4">
            {book.editeur}
            {book.annee ? ` · ${book.annee}` : ''}
            {book.isbn ? ` · ISBN: ${book.isbn}` : ''}
          </p>

          {/* Note moyenne */}
          {avgNote && (
            <div className="flex items-center gap-3 mb-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 w-fit">
              <Stars note={Math.round(Number(avgNote))} />

              <span className="font-bold text-[#0f1923]">
                {avgNote}/5
              </span>

              <span className="text-gray-400 text-sm">
                ({book.comments.length} avis)
              </span>
            </div>
          )}

          {/* Promotion */}
          {hasPromo && promo && (
            <PromoBlock
              promo={promo}
              originalPrice={originalPrice}
              finalPrice={finalPrice}
            />
          )}

          {/* Prix + stock */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {hasPromo ? (
              <div>
                <p className="text-sm text-gray-400 line-through">
                  {formatCFA(originalPrice)}
                </p>

                <p className="text-4xl font-black text-[#d44040]">
                  {formatCFA(finalPrice)}
                </p>
              </div>
            ) : (
              <p className="text-4xl font-black text-[#2d7a4f]">
                {formatCFA(originalPrice)}
              </p>
            )}

            {stock > 0 ? (
              <span className="text-sm bg-green-50 text-[#2d7a4f] border border-green-200 px-3 py-1.5 rounded-xl font-medium">
                ✓ En stock ({stock})
              </span>
            ) : (
              <span className="text-sm bg-red-50 text-[#d44040] border border-red-200 px-3 py-1.5 rounded-xl font-medium">
                ✗ Rupture de stock
              </span>
            )}
          </div>

          {/* Quantité + actions */}
          {stock > 0 && (
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <div className="flex items-center border-2 border-[#e8e0d4] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setQty((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]"
                >
                  −
                </button>

                <span className="px-5 py-2.5 font-bold text-[#0f1923] min-w-[44px] text-center">
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQty((current) =>
                      Math.min(stock, current + 1)
                    )
                  }
                  className="px-4 py-2.5 bg-[#faf7f2] hover:bg-[#ede5d4] text-xl font-bold transition text-[#0f1923]"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingCart}
                className={`flex-1 min-w-[180px] py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  addingCart
                    ? 'bg-[#2d7a4f] text-white'
                    : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
                } disabled:opacity-70`}
              >
                {addingCart
                  ? '✓ Ajouté au panier !'
                  : '🛒 Ajouter au panier'}
              </button>

              {user && (
                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`px-4 py-3 rounded-xl border-2 transition-all active:scale-95 ${
                    inWish
                      ? 'bg-red-50 border-red-300 text-[#d44040]'
                      : 'border-[#e8e0d4] text-gray-500 hover:border-red-300 hover:text-[#d44040]'
                  }`}
                  title={
                    inWish
                      ? 'Retirer des favoris'
                      : 'Ajouter aux favoris'
                  }
                >
                  {inWish ? '❤️' : '🤍'}
                </button>
              )}

              <Link
                to={`/comparer?ids=${book.id}&type=book`}
                className="px-4 py-3 rounded-xl border-2 border-[#e8e0d4] text-gray-500 hover:border-[#c9933a] hover:text-[#c9933a] transition-all"
                title="Comparer"
              >
                ⚖️
              </Link>
            </div>
          )}

          {/* Onglets */}
          <div className="border border-[#e8e0d4] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[#e8e0d4]">
              {[
                ['description', '📄 Description'],
                ['details', '📋 Fiche technique'],
                ['livraison', '🚚 Livraison'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`flex-1 py-3 text-sm font-semibold transition ${
                    tab === key
                      ? 'bg-white text-[#0f1923] border-b-2 border-[#c9933a]'
                      : 'bg-[#faf7f2] text-gray-400 hover:text-[#0f1923]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 bg-white">
              {tab === 'description' && (
                <p className="text-gray-600 leading-relaxed text-sm">
                  {book.description ||
                    'Aucune description disponible pour ce livre.'}
                </p>
              )}

              {tab === 'details' && (
                <div className="divide-y divide-[#f0ece4]">
                  <InfoRow
                    label="Titre"
                    value={book.titre}
                  />
                  <InfoRow
                    label="Auteur"
                    value={book.auteur}
                  />
                  <InfoRow
                    label="Éditeur"
                    value={book.editeur}
                  />
                  <InfoRow
                    label="ISBN"
                    value={book.isbn}
                    mono
                  />
                  <InfoRow
                    label="Année"
                    value={book.annee}
                  />
                  <InfoRow
                    label="Rayon"
                    value={book.rayon}
                  />
                  <InfoRow
                    label="Stock"
                    value={`${stock} exemplaire${
                      stock > 1 ? 's' : ''
                    }`}
                  />
                  <InfoRow
                    label="Réf. interne"
                    value={`LIV-${String(book.id).padStart(
                      5,
                      '0'
                    )}`}
                    mono
                  />

                  {hasPromo && (
                    <InfoRow
                      label="Promotion"
                      value={`-${discountPercent(
                        originalPrice,
                        finalPrice
                      )}% → ${formatCFA(finalPrice)}`}
                    />
                  )}
                </div>
              )}

              {tab === 'livraison' && (
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">🏪</span>
                    <div>
                      <p className="font-semibold text-[#0f1923]">
                        Retrait en magasin
                      </p>
                      <p className="text-xs text-gray-400">
                        Gratuit · Disponible aujourd'hui · Cocody,
                        Abidjan
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="font-semibold text-[#0f1923]">
                        Livraison à domicile
                      </p>
                      <p className="text-xs text-gray-400">
                        Abidjan : 24–48h · Autres villes : 3–5 jours
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-[#0f1923]">
                        Paiement mobile
                      </p>
                      <p className="text-xs text-gray-400">
                        Orange Money · MTN · Moov · Wave
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="font-semibold text-[#0f1923]">
                        Retour & échange
                      </p>
                      <p className="text-xs text-gray-400">
                        7 jours après réception, si non ouvert
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description courte */}
          <div className="mt-5">
            <Link
              to={`/catalog?rayon=${encodeURIComponent(
                book.rayon || ''
              )}`}
              className="inline-flex items-center gap-2 text-sm text-[#c9933a] hover:underline font-medium"
            >
              Voir les autres livres du rayon →
            </Link>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="mt-12 border-t border-[#e8e0d4] pt-10 space-y-10">
        <RecommendedProducts
          productId={book.id}
          productType="book"
          onAddToCart={(productId, type) =>
            addToCart(productId, 1, type)
          }
        />

        <RecentlyViewed
          excludeId={book.id}
          excludeType="book"
        />
      </div>

      {/* Avis */}
      <div className="mt-14 border-t border-[#e8e0d4] pt-10">
        <h2
          className="text-2xl font-black text-[#0f1923] mb-8"
          style={{
            fontFamily: 'Playfair Display,serif',
          }}
        >
          Avis des lecteurs

          {book.comments?.length > 0 && (
            <span className="text-gray-400 text-lg font-normal ml-2">
              ({book.comments.length})
            </span>
          )}
        </h2>

        {user ? (
          <form
            onSubmit={handleCommentSubmit}
            className="bg-white border border-[#e8e0d4] rounded-2xl p-6 mb-10 shadow-sm"
          >
            <h3 className="font-bold text-[#0f1923] mb-4">
              Laissez votre avis
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Votre note
              </label>

              <Stars
                note={comment.note}
                interactive
                onChange={(note) =>
                  setComment((current) => ({
                    ...current,
                    note,
                  }))
                }
              />
            </div>

            <textarea
              value={comment.contenu}
              onChange={(e) =>
                setComment((current) => ({
                  ...current,
                  contenu: e.target.value,
                }))
              }
              placeholder="Partagez votre avis sur ce livre…"
              className="w-full px-4 py-3 border border-[#e8e0d4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] text-sm transition mb-4"
              rows={3}
              required
            />

            <button
              type="submit"
              disabled={
                submitting || !comment.contenu.trim()
              }
              className="bg-[#0f1923] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c9933a] transition disabled:opacity-50"
            >
              {submitting
                ? '⏳ Publication…'
                : '✍️ Publier mon avis'}
            </button>
          </form>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <p className="text-sm text-amber-800">
              <Link
                to="/login"
                state={{
                  from: {
                    pathname: `/book/${id}`,
                  },
                }}
                className="font-bold underline"
              >
                Connectez-vous
              </Link>{' '}
              pour laisser un avis.
            </p>
          </div>
        )}

        {!book.comments?.length ? (
          <p className="text-gray-400 text-center py-12 text-sm">
            Aucun avis pour le moment. Soyez le premier !
          </p>
        ) : (
          <div className="space-y-4">
            {[...book.comments]
              .reverse()
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-[#e8e0d4] rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center text-sm font-black text-[#c9933a]">
                      {c.user?.name?.[0]?.toUpperCase() ||
                        '?'}
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-[#0f1923]">
                        {c.user?.prenom || ''}{' '}
                        {c.user?.name || 'Anonyme'}
                      </p>

                      <p className="text-gray-400 text-xs">
                        {c.created_at
                          ? new Date(
                              c.created_at
                            ).toLocaleDateString('fr-FR')
                          : ''}
                      </p>
                    </div>

                    <div className="ml-auto">
                      <Stars note={Number(c.note) || 0} />
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {c.contenu}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
