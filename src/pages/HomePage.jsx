
import { Link, useNavigate } from 'react-router-dom';

import api from '../api/client';
import BookCard from '../components/BookCard';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { MapView } from '../components/LeafletMap';
import { useEffect, useState } from 'react';

const RAYONS = [
  {
    nom: 'Informatique',
    color: 'border-blue-400',
    badge: 'bg-blue-700',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=220&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Sciences',
    color: 'border-emerald-400',
    badge: 'bg-emerald-700',
    img: 'https://images.unsplash.com/photo-1532094349884-32d2b3cc4327?w=400&h=220&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Littérature',
    color: 'border-amber-400',
    badge: 'bg-amber-700',
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=220&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Histoire',
    color: 'border-red-400',
    badge: 'bg-red-700',
    img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=220&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Arts',
    color: 'border-purple-400',
    badge: 'bg-purple-700',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=220&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Philosophie',
    color: 'border-slate-400',
    badge: 'bg-slate-700',
    img: 'https://images.unsplash.com/photo-1456234624233-09a3ee5916d0?w=400&h=220&fit=crop&auto=format&q=80',
  },
];

const FOURNITURES_VISUELS = [
  {
    cat: 'Stylos & Bics',
    label: 'Stylos & Bics',
    img: 'https://images.unsplash.com/photo-1526170375-a8f1cf4a8748?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Crayons',
    label: 'Crayons de couleur',
    img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Cahiers',
    label: 'Cahiers',
    img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Géométrie',
    label: 'Géométrie',
    img: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Colles & Adhésifs',
    label: 'Colles & Adhésifs',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Papiers Spéciaux',
    label: 'Papiers spéciaux',
    img: 'https://images.unsplash.com/photo-1507842217074-94af29d9b8be?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Taille-crayons & Gommes',
    label: 'Gommes & Taille-crayons',
    img: 'https://images.unsplash.com/photo-1583485088034-d0315aaa0bd0?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Classeurs & Rangement',
    label: 'Classeurs & Rangement',
    img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Ciseaux & Découpe',
    label: 'Ciseaux & Découpe',
    img: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Peinture & Art',
    label: 'Peinture & Art',
    img: 'https://images.unsplash.com/photo-1513519245088-1c754b77a3a3?w=300&h=180&fit=crop&auto=format&q=80',
  },
  {
    cat: 'Autres Fournitures',
    label: 'Autres fournitures',
    img: 'https://images.unsplash.com/photo-1568010434849-bdb97e8f2b4e?w=300&h=180&fit=crop&auto=format&q=80',
  },
];

const TYPES_CAHIERS = [
  {
    nom: 'Cahier TP',
    desc: '50 pages · Petits carreaux',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=240&h=160&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Cahier Privilège',
    desc: '100 pages · Grands carreaux',
    img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=240&h=160&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Cahier spirale',
    desc: '200 pages · Spirale',
    img: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=240&h=160&fit=crop&auto=format&q=80',
  },
  {
    nom: 'Cahier étudiant',
    desc: 'Format A4 · 300 pages',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=240&h=160&fit=crop&auto=format&q=80',
  },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d4] overflow-hidden">
      <div className="h-28 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
        <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded mt-3" />
        <div className="h-9 w-full bg-gray-200 animate-pulse rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [promoBooks, setPromoBooks] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [stores, setStores] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/books?promo_only=1')
      .then((r) => setPromoBooks((r.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingPromo(false));

    api
      .get('/books?tri=bestseller')
      .then((r) => setBestsellers((r.data || []).slice(0, 4)))
      .catch(() => {
        api
          .get('/books')
          .then((r) => setBestsellers((r.data || []).slice(0, 4)))
          .catch(() => {});
      })
      .finally(() => setLoadingBest(false));

    api
      .get('/stores')
      .then((r) => setStores(r.data || []))
      .catch(() => {});
  }, []);

  const handleAddToCart = async (bookId) => {
    try {
      await addToCart(bookId);
      showToast('✅ Livre ajouté au panier', 'success');
    } catch {
      showToast('Connectez-vous pour ajouter au panier', 'error');
      navigate('/login');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchInput.trim();

    navigate(
      query
        ? `/catalog?search=${encodeURIComponent(query)}`
        : '/catalog'
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#0f1923] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #c9933a 0%, transparent 50%), radial-gradient(circle at 80% 50%, #4a6fa5 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-[#c9933a] text-sm font-semibold tracking-[0.25em] uppercase mb-4">
            Librairie francophone · Abidjan
          </p>

          <h1
            className="text-white text-4xl md:text-6xl font-black leading-tight mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Le savoir à portée
            <br />
            <span className="text-[#c9933a]">de votre main</span>
          </h1>

          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Des milliers de livres en Franc CFA. Commandez, payez, recevez
            votre bon de commande instantanément.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex gap-2 max-w-lg mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Titre, auteur, ISBN…"
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-2 text-sm outline-none"
            />

            <button
              type="submit"
              className="bg-[#c9933a] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-[#b8832d] transition shrink-0"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Rayons */}
      <section className="bg-white py-12 border-b border-[#e8e0d4]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
                Nos rayons
              </p>
              <h2
                className="text-2xl font-bold text-[#0f1923]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Parcourir par catégorie
              </h2>
            </div>

            <Link
              to="/catalog"
              className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block"
            >
              Tout le catalogue →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {RAYONS.map((r) => (
              <Link
                key={r.nom}
                to={`/catalog?rayon=${encodeURIComponent(r.nom)}`}
                className={`group relative overflow-hidden rounded-2xl border-2 ${r.color} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <span
                    className={`absolute bottom-2 left-2 right-2 text-center text-white text-xs font-bold py-0.5 rounded-full ${r.badge}`}
                  >
                    {r.nom}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Promotions */}
        {(loadingPromo || promoBooks.length > 0) && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
                  Offres spéciales
                </p>
                <h2
                  className="text-2xl font-bold text-[#0f1923]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  🔥 Promotions en cours
                </h2>
              </div>

              <Link
                to="/catalog?promo_only=1"
                className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block"
              >
                Voir tout →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingPromo
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : promoBooks.map((b) => (
                    <BookCard
                      key={b.id}
                      book={b}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Bestsellers */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
                Les plus populaires
              </p>
              <h2
                className="text-2xl font-bold text-[#0f1923]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                ⭐ Meilleures ventes
              </h2>
            </div>

            <Link
              to="/catalog?tri=bestseller"
              className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingBest
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.map((b) => (
                  <BookCard
                    key={b.id}
                    book={b}
                    onAddToCart={handleAddToCart}
                  />
                ))}
          </div>
        </section>

        {/* Fournitures scolaires */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
                Matériel scolaire
              </p>
              <h2
                className="text-2xl font-bold text-[#0f1923]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                ✏️ Fournitures scolaires
              </h2>
            </div>

            <Link
              to="/fournitures"
              className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block"
            >
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {FOURNITURES_VISUELS.slice(0, 6).map((f) => (
              <Link
                key={f.cat}
                to={`/fournitures?categorie=${encodeURIComponent(f.cat)}`}
                className="group relative overflow-hidden rounded-2xl border border-[#e8e0d4] shadow-sm hover:shadow-md hover:border-[#c9933a] hover:-translate-y-0.5 transition-all duration-200 bg-white"
              >
                <div className="h-24 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 text-center">
                  <span className="text-xs font-semibold text-gray-700 leading-tight block">
                    {f.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
            {FOURNITURES_VISUELS.slice(6).map((f) => (
              <Link
                key={f.cat}
                to={`/fournitures?categorie=${encodeURIComponent(f.cat)}`}
                className="group relative overflow-hidden rounded-2xl border border-[#e8e0d4] shadow-sm hover:shadow-md hover:border-[#c9933a] hover:-translate-y-0.5 transition-all duration-200 bg-white"
              >
                <div className="h-24 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 text-center">
                  <span className="text-xs font-semibold text-gray-700 leading-tight block">
                    {f.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Types de cahiers */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
                Nos cahiers
              </p>
              <h2
                className="text-2xl font-bold text-[#0f1923]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Types de cahiers disponibles
              </h2>
            </div>

            <Link
              to="/fournitures?categorie=Cahiers"
              className="text-sm text-[#c9933a] hover:underline font-medium hidden sm:block"
            >
              Voir tous les cahiers →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TYPES_CAHIERS.map((c) => (
              <Link
                key={c.nom}
                to="/fournitures?categorie=Cahiers"
                className="group relative overflow-hidden rounded-2xl border border-[#e8e0d4] shadow-sm hover:shadow-lg hover:border-[#c9933a] transition-all duration-200 bg-white"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="p-3">
                  <p className="font-bold text-[#0f1923] text-sm">{c.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Localisation du magasin */}
        <section>
          <div className="mb-6">
            <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
              Nous trouver
            </p>
            <h2
              className="text-2xl font-bold text-[#0f1923]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {stores.length > 1
                ? `${stores.length} Librairies partenaires`
                : 'Notre magasin à Abidjan'}
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-[#e8e0d4] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#c9933a] rounded-xl flex items-center justify-center text-white text-xl">
                    📚
                  </div>
                  <div>
                    <p
                      className="font-bold text-[#0f1923]"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      Lecture & Connaissance
                    </p>
                    <p className="text-xs text-[#c9933a] font-semibold">
                      Librairie · Papeterie
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3 items-start">
                    <span className="text-[#c9933a] text-base mt-0.5">📍</span>
                    <span>
                      Avenue de la République, Cocody
                      <br />
                      <span className="text-gray-500 text-xs">
                        Abidjan, Côte d'Ivoire
                      </span>
                    </span>
                  </li>

                  <li className="flex gap-3 items-center">
                    <span className="text-[#c9933a] text-base">📞</span>
                    <a
                      href="tel:+2250700000000"
                      className="hover:text-[#c9933a] transition font-medium"
                    >
                      +225 07 00 00 00 00
                    </a>
                  </li>

                  <li className="flex gap-3 items-center">
                    <span className="text-[#c9933a] text-base">✉️</span>
                    <a
                      href="mailto:contact@lecture-connaissance.ci"
                      className="hover:text-[#c9933a] transition text-xs break-all"
                    >
                      contact@lecture-connaissance.ci
                    </a>
                  </li>
                </ul>

                <hr className="my-4 border-[#e8e0d4]" />

                <p className="text-xs font-bold text-[#0f1923] uppercase tracking-wide mb-2">
                  Horaires d'ouverture
                </p>

                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex justify-between">
                    <span>Lun – Ven</span>
                    <span className="font-semibold text-[#0f1923]">
                      08h00 – 18h30
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-semibold text-[#0f1923]">
                      08h00 – 17h00
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="font-semibold text-red-500">Fermé</span>
                  </li>
                </ul>

                <a
                  href="https://maps.google.com/?q=Cocody+Abidjan+Cote+d%27Ivoire"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-[#c9933a] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#b8832d] transition"
                >
                  🗺️ Ouvrir dans Google Maps
                </a>
              </div>
            </div>

            <div className="md:col-span-3">
              {stores.length > 0 ? (
                <MapView
                  stores={stores}
                  height="380px"
                  zoom={stores.length === 1 ? 15 : 12}
                />
              ) : (
                <MapView
                  stores={[
                    {
                      name: 'Lecture & Connaissance',
                      address: 'Avenue de la République, Cocody, Abidjan',
                      latitude: 5.3595,
                      longitude: -3.9981,
                    },
                  ]}
                  height="380px"
                  zoom={15}
                />
              )}

              {stores.length > 1 && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  {stores.length} librairies partenaires sur la carte · Cliquez
                  sur un marqueur pour les détails
                </p>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0f1923] rounded-3xl p-10 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 50%, #c9933a 0%, transparent 60%)',
            }}
          />

          <div className="relative">
            <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-3">
              Catalogue complet
            </p>

            <h2
              className="text-white text-3xl font-black mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Des milliers de titres vous attendent
            </h2>

            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Informatique, sciences, littérature, histoire… Trouvez votre
              prochain livre en quelques secondes.
            </p>

            <Link
              to="/catalog"
              className="inline-block bg-[#c9933a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b8832d] transition shadow-lg"
            >
              Explorer le catalogue
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
