
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api/client';
import { showToast } from '../components/Toast';

import OrderDevis from '../components/OrderDevis';
import CouponInput from '../components/CouponInput';
import DeliveryZoneSelector from '../components/DeliveryZoneSelector';
import LoyaltyPoints from '../components/LoyaltyPoints';
import { formatCFA } from '../utils/currency';

const STEPS = ['Réception', 'Coordonnées', 'Paiement'];

const OPERATORS = [
  {
    id: 'orange',
    name: 'Orange Money',
    color: '#FF6600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Orange_logo.svg/480px-Orange_logo.svg.png',
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    color: '#FFCC00',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/MTN_Logo.svg/480px-MTN_Logo.svg.png',
  },
  {
    id: 'wave',
    name: 'Wave',
    color: '#1AC8ED',
    logo: 'https://play-lh.googleusercontent.com/CEKbN8z26lhEWuHPLDnIFsQ7ePqUJgKdN8m8xmQCVCrBoFUZXpMXpWJ1KtKfsFgVlQ=w480-h960-rw',
  },
  {
    id: 'moov',
    name: 'Moov Money',
    color: '#0066CC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Moov_Africa.svg/480px-Moov_Africa.svg.png',
  },
  {
    id: 'card',
    name: 'Visa / Mastercard',
    color: '#1A1F71',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/480px-Visa_Inc._logo.svg.png',
  },
];

const STORE_ADDRESS = 'Avenue de la République, Cocody, Abidjan';
const STORE_PHONE = '+225 07 00 00 00 00';
const STORE_HOURS = 'Lun–Ven : 08h–18h30 · Sam : 08h–17h';

function InputF({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>

      <input
        {...props}
        className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition bg-white"
      />

      {hint && <p className="text-xs text-[#c9933a] mt-1">{hint}</p>}
    </div>
  );
}

function SuccessPage({ nom, deliveryMode }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow">
        🎉
      </div>

      <h1
        className="text-3xl font-black text-[#0f1923] mb-3"
        style={{ fontFamily: 'Playfair Display,serif' }}
      >
        Paiement confirmé !
      </h1>

      <p className="text-gray-500 mb-2">
        Merci <strong>{nom}</strong> !
      </p>

      <div
        className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border-2 my-4 ${
          deliveryMode === 'pickup'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <span className="text-2xl">
          {deliveryMode === 'pickup' ? '🏪' : '🚚'}
        </span>

        <div className="text-left">
          <p className="font-bold text-sm">
            {deliveryMode === 'pickup'
              ? 'Retrait en boutique'
              : 'Livraison à domicile'}
          </p>

          <p className="text-xs opacity-75">
            {deliveryMode === 'pickup'
              ? `Venez récupérer votre commande : ${STORE_ADDRESS}`
              : 'Votre commande sera livrée à votre adresse'}
          </p>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-8">
        Vous recevrez un SMS de confirmation.
      </p>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          to="/orders"
          className="bg-[#0f1923] text-white px-6 py-3 rounded-xl hover:bg-[#c9933a] transition font-bold"
        >
          📦 Mes commandes
        </Link>

        <Link
          to="/catalog"
          className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-6 py-3 rounded-xl hover:border-[#c9933a] transition font-semibold"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

function WaitingPayment({
  transactionId,
  total,
  onSuccess,
  onCancel,
}) {
  const [status, setStatus] = useState('pending');
  const [dots, setDots] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    dotsRef.current = setInterval(() => {
      setDots((value) => (value + 1) % 4);
    }, 500);

    intervalRef.current = setInterval(async () => {
      setElapsed((value) => value + 4);

      try {
        const response = await api.get(`/payment/status/${transactionId}`);
        const paymentStatus = response.data?.status;

        if (paymentStatus === 'paid' || paymentStatus === 'success') {
          clearInterval(intervalRef.current);
          clearInterval(dotsRef.current);
          setStatus('paid');

          setTimeout(() => {
            onSuccess();
          }, 1200);
        } else if (
          paymentStatus === 'failed' ||
          paymentStatus === 'cancelled' ||
          paymentStatus === 'canceled'
        ) {
          clearInterval(intervalRef.current);
          clearInterval(dotsRef.current);
          setStatus('failed');
        }
      } catch {
        // Le prochain polling réessaiera automatiquement.
      }
    }, 4000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(dotsRef.current);
    };
  }, [transactionId, onSuccess]);

  const dotStr = '.'.repeat(dots + 1);

  if (status === 'paid') {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
          ✅
        </div>

        <p className="text-2xl font-black text-[#0f1923]">
          Paiement reçu !
        </p>

        <p className="text-gray-500 mt-1">
          Création de votre commande{dotStr}
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
          ❌
        </div>

        <p className="text-xl font-black text-[#d44040] mb-2">
          Paiement échoué
        </p>

        <p className="text-gray-500 text-sm mb-6">
          Le paiement n&apos;a pas abouti. Veuillez réessayer.
        </p>

        <button
          type="button"
          onClick={onCancel}
          className="bg-[#0f1923] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c9933a] transition"
        >
          ← Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-8 px-4">
      <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 border-4 border-[#c9933a]/20">
        <span className="animate-pulse">📱</span>
      </div>

      <h2 className="text-xl font-black text-[#0f1923] mb-2">
        Confirmez sur votre téléphone
      </h2>

      <p className="text-gray-500 text-sm mb-1">
        Montant :{' '}
        <strong className="text-[#0f1923]">{formatCFA(total)}</strong>
      </p>

      <p className="text-gray-400 text-sm mb-6">
        Validez le paiement dans l&apos;application ou par OTP{dotStr}
      </p>

      <div className="bg-[#faf7f2] rounded-2xl p-4 text-sm text-gray-600 mb-6 border border-[#e8e0d4] max-w-xs mx-auto">
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
          Étapes
        </p>

        <div className="space-y-1.5 text-left">
          <p>1️⃣ Ouvrez votre application mobile money</p>
          <p>2️⃣ Acceptez la demande de paiement</p>
          <p>3️⃣ Entrez votre code secret</p>
        </div>
      </div>

      {elapsed > 120 && (
        <p className="text-xs text-gray-400 mb-4">
          Attente depuis {Math.floor(elapsed / 60)} min…
        </p>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-[#d44040] transition underline"
      >
        Annuler et recommencer
      </button>
    </div>
  );
}

function PaymentOperatorCard({ operator, selected, onSelect }) {
  const fallback = {
    orange: '🟠',
    mtn: '🟡',
    wave: '🔵',
    moov: '💙',
    card: '💳',
  };

  const handleImageError = (event) => {
    event.currentTarget.style.display = 'none';
    const parent = event.currentTarget.parentNode;

    if (parent && !parent.querySelector('[data-payment-fallback]')) {
      const span = document.createElement('span');
      span.dataset.paymentFallback = 'true';
      span.style.fontSize = '1.4rem';
      span.textContent = fallback[operator.id] || '💳';
      parent.appendChild(span);
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(operator.id)}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-[0.97] ${
        selected
          ? 'border-[#c9933a] shadow-md bg-amber-50'
          : 'border-[#e8e0d4] hover:border-[#c9933a]/50 bg-white hover:bg-amber-50/30'
      }`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#c9933a] rounded-full text-white text-xs flex items-center justify-center font-black">
          ✓
        </span>
      )}

      <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
        <img
          src={operator.logo}
          alt={operator.name}
          className="w-9 h-9 object-contain"
          onError={handleImageError}
        />
      </div>

      <span
        className={`text-xs font-bold text-center leading-tight ${
          selected ? 'text-[#c9933a]' : 'text-gray-700'
        }`}
      >
        {operator.name}
      </span>
    </button>
  );
}

export default function CheckoutPage() {
  const { cart, cartTotal, cartSavings, refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTransactionId = searchParams.get('transaction_id');

  const [step, setStep] = useState(returnTransactionId ? 4 : 1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [transactionId, setTransactionId] = useState(
    returnTransactionId || null
  );

  const [deliveryMode, setDeliveryMode] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);

  const [delivery, setDelivery] = useState({
    prenom: user?.prenom || '',
    nom: user?.name || '',
    telephone: user?.telephone || '',
    adresse: '',
    ville: 'Abidjan',
    pays: "Côte d'Ivoire",
  });

  const [selectedZone, setSelectedZone] = useState(null);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [remisePoints, setRemisePoints] = useState(0);

  const fraisLivraison =
    deliveryMode === 'pickup'
      ? 0
      : selectedZone
        ? selectedZone.gratuit_a_partir !== null &&
          selectedZone.gratuit_a_partir !== undefined &&
          cartTotal >= Number(selectedZone.gratuit_a_partir)
          ? 0
          : Number(selectedZone.frais || 0)
        : 0;

  const couponDiscount = Number(appliedCoupon?.discount || 0);

  const totalFinal = Math.max(
    0,
    Number(cartTotal || 0) +
      fraisLivraison -
      couponDiscount -
      Number(remisePoints || 0)
  );

  useEffect(() => {
    if (!user) return;

    setDelivery((current) => ({
      ...current,
      prenom: current.prenom || user.prenom || '',
      nom: current.nom || user.name || '',
      telephone: current.telephone || user.telephone || '',
    }));

    if (user.adresses?.length && !delivery.adresse) {
      const firstAddress = user.adresses[0];
      setDelivery((current) => ({
        ...current,
        adresse:
          firstAddress?.split(',')[0]?.trim() || firstAddress || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (returnTransactionId) {
      setStep(4);
      setTransactionId(returnTransactionId);
    }
  }, [returnTransactionId]);

  const handleDeliveryChange = (event) => {
    const { name, value } = event.target;

    setDelivery((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateInfos = () => {
    const { prenom, nom, telephone } = delivery;

    if (!prenom || !nom) {
      showToast('Prénom et nom requis', 'error');
      return false;
    }

    if (!telephone) {
      showToast('Téléphone requis', 'error');
      return false;
    }

    if (deliveryMode === 'delivery') {
      if (!delivery.adresse) {
        showToast('Adresse de livraison requise', 'error');
        return false;
      }

      if (!delivery.ville) {
        showToast('Ville requise', 'error');
        return false;
      }

      if (!selectedZone) {
        showToast('Choisissez une zone de livraison', 'error');
        return false;
      }
    }

    return true;
  };

  const handlePay = async () => {
    if (!selectedOperator) {
      showToast('Veuillez choisir une méthode de paiement', 'error');
      return;
    }

    if (!validateInfos()) {
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const adresse =
        deliveryMode === 'pickup'
          ? STORE_ADDRESS
          : `${delivery.adresse}, ${delivery.ville}, ${delivery.pays}`;

      const response = await api.post('/payment/initiate', {
        adresse,
        client_nom: `${delivery.prenom} ${delivery.nom}`,
        telephone: delivery.telephone,
        delivery_mode: deliveryMode,
        zone_id:
          deliveryMode === 'delivery' ? selectedZone?.id : null,
        coupon_code: appliedCoupon?.coupon?.code,
        use_points: usedPoints,
        payment_channel: selectedOperator,
      });

      if (!response.data?.payment_url) {
        throw new Error('URL de paiement absente de la réponse serveur.');
      }

      setTransactionId(response.data.transaction_id || null);

      // CinetPay prend ensuite la main sur la page.
      window.location.href = response.data.payment_url;
    } catch (error) {
      showToast(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Erreur lors de l’initiation du paiement',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await refreshCart();
    } catch {
      // La confirmation de paiement reste valide même si le refresh du panier échoue.
    }

    addNotif(
      '📦 Paiement confirmé ! Votre commande est en cours de traitement.',
      'order',
      0
    );

    setDone(true);
  };

  if (done) {
    return (
      <SuccessPage
        nom={delivery.prenom || user?.prenom || 'Cher client'}
        deliveryMode={deliveryMode}
      />
    );
  }

  if (step === 4 && transactionId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white border border-[#e8e0d4] rounded-3xl p-8 shadow-sm">
          <WaitingPayment
            transactionId={transactionId}
            total={totalFinal}
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setStep(3);
              setTransactionId(null);
              navigate('/checkout', { replace: true });
            }}
          />
        </div>
      </div>
    );
  }

  if (!cart?.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-5">🛒</div>

        <h1 className="text-2xl font-black text-[#0f1923] mb-2">
          Votre panier est vide
        </h1>

        <p className="text-gray-500 mb-5">
          Ajoutez des articles avant de passer commande.
        </p>

        <Link
          to="/catalog"
          className="inline-flex text-[#c9933a] hover:underline font-medium"
        >
          ← Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">
          Commander
        </p>

        <h1
          className="text-3xl font-black text-[#0f1923]"
          style={{ fontFamily: 'Playfair Display,serif' }}
        >
          Finaliser ma commande
        </h1>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const completed = step > number;
          const current = step === number;

          return (
            <div
              key={label}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  completed
                    ? 'bg-green-500 text-white'
                    : current
                      ? 'bg-[#0f1923] text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {completed ? '✓' : number}
              </div>

              <span
                className={`text-xs font-semibold ${
                  current ? 'text-[#0f1923]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>

              {index < STEPS.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Colonne principale */}
        <div className="flex-1 space-y-6">
          {/* ÉTAPE 1 */}
          <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8e0d4]">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                  step > 1
                    ? 'bg-green-500 text-white'
                    : 'bg-[#0f1923] text-white'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </div>

              <h2 className="font-black text-[#0f1923]">
                Comment souhaitez-vous recevoir votre commande ?
              </h2>

              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-[#c9933a] hover:underline font-medium"
                >
                  Modifier
                </button>
              )}
            </div>

            {step === 1 && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Retrait */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode('pickup');
                      setSelectedZone(null);
                      setStep(2);
                    }}
                    className={`group relative text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98] ${
                      deliveryMode === 'pickup'
                        ? 'border-[#0f1923] bg-[#0f1923] text-white'
                        : 'border-[#e8e0d4] hover:border-[#0f1923] bg-white'
                    }`}
                  >
                    <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                      Gratuit
                    </span>

                    <div className="text-4xl mb-3">🏪</div>

                    <p className="font-black text-lg mb-1">
                      Retrait en boutique
                    </p>

                    <p
                      className={`text-sm mb-3 ${
                        deliveryMode === 'pickup'
                          ? 'text-gray-300'
                          : 'text-gray-500'
                      }`}
                    >
                      Venez récupérer votre commande directement chez nous.
                    </p>

                    <div
                      className={`text-xs space-y-1 ${
                        deliveryMode === 'pickup'
                          ? 'text-gray-300'
                          : 'text-gray-400'
                      }`}
                    >
                      <p>📍 {STORE_ADDRESS}</p>
                      <p>📞 {STORE_PHONE}</p>
                      <p>🕐 {STORE_HOURS}</p>
                    </div>

                    <div
                      className={`mt-3 text-sm font-bold ${
                        deliveryMode === 'pickup'
                          ? 'text-green-300'
                          : 'text-green-600'
                      }`}
                    >
                      ✓ Frais de livraison : 0 FCFA
                    </div>
                  </button>

                  {/* Livraison */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode('delivery');
                      setStep(2);
                    }}
                    className={`group relative text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98] ${
                      deliveryMode === 'delivery'
                        ? 'border-[#c9933a] bg-[#c9933a] text-white'
                        : 'border-[#e8e0d4] hover:border-[#c9933a] bg-white'
                    }`}
                  >
                    <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-[#0f1923] text-white">
                      Selon zone
                    </span>

                    <div className="text-4xl mb-3">🚚</div>

                    <p className="font-black text-lg mb-1">
                      Livraison à domicile
                    </p>

                    <p
                      className={`text-sm mb-3 ${
                        deliveryMode === 'delivery'
                          ? 'text-orange-100'
                          : 'text-gray-500'
                      }`}
                    >
                      Recevez votre commande directement à votre adresse.
                    </p>

                    <div
                      className={`text-xs space-y-1 ${
                        deliveryMode === 'delivery'
                          ? 'text-orange-100'
                          : 'text-gray-400'
                      }`}
                    >
                      <p>🏙️ Abidjan : 24–48h</p>
                      <p>🌍 Autres villes : 3–5 jours</p>
                    </div>

                    <div
                      className={`mt-3 text-sm font-bold ${
                        deliveryMode === 'delivery'
                          ? 'text-yellow-200'
                          : 'text-[#c9933a]'
                      }`}
                    >
                      Frais calculés selon votre zone
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step > 1 && deliveryMode && (
              <div
                className={`px-6 py-3 text-sm flex items-center gap-3 ${
                  deliveryMode === 'pickup'
                    ? 'bg-gray-50'
                    : 'bg-amber-50'
                }`}
              >
                <span className="text-xl">
                  {deliveryMode === 'pickup' ? '🏪' : '🚚'}
                </span>

                <div>
                  <p className="font-bold text-[#0f1923]">
                    {deliveryMode === 'pickup'
                      ? 'Retrait en boutique'
                      : 'Livraison à domicile'}
                  </p>

                  <p className="text-xs text-gray-500">
                    {deliveryMode === 'pickup'
                      ? `${STORE_ADDRESS} · ${STORE_HOURS}`
                      : 'Adresse renseignée ci-dessous'}
                  </p>
                </div>

                {deliveryMode === 'pickup' && (
                  <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    Gratuit
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ÉTAPE 2 */}
          {step >= 2 && (
            <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8e0d4]">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    step > 2
                      ? 'bg-green-500 text-white'
                      : 'bg-[#0f1923] text-white'
                  }`}
                >
                  {step > 2 ? '✓' : '2'}
                </div>

                <h2 className="font-black text-[#0f1923]">
                  {deliveryMode === 'pickup'
                    ? '👤 Vos coordonnées'
                    : '📍 Adresse de livraison'}
                </h2>

                {step > 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="ml-auto text-xs text-[#c9933a] hover:underline"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {step === 2 && (
                <div className="p-6 space-y-4">
                  {deliveryMode === 'delivery' &&
                    user?.adresses?.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {user.adresses.map((address, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-3 border border-[#e8e0d4] rounded-xl p-3 cursor-pointer hover:border-[#c9933a] transition text-sm"
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              className="accent-[#c9933a]"
                              onChange={() =>
                                setDelivery((current) => ({
                                  ...current,
                                  adresse:
                                    address?.split(',')[0]?.trim() ||
                                    address ||
                                    '',
                                }))
                              }
                            />

                            <span>📍 {address}</span>
                          </label>
                        ))}

                        <p className="text-xs text-gray-400 text-center my-1">
                          — ou entrez une autre adresse —
                        </p>
                      </div>
                    )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputF
                      label="Prénom *"
                      name="prenom"
                      value={delivery.prenom}
                      onChange={handleDeliveryChange}
                      required
                    />

                    <InputF
                      label="Nom *"
                      name="nom"
                      value={delivery.nom}
                      onChange={handleDeliveryChange}
                      required
                    />
                  </div>

                  <InputF
                    label="Téléphone *"
                    name="telephone"
                    type="tel"
                    value={delivery.telephone}
                    onChange={handleDeliveryChange}
                    placeholder="+225 07 00 00 00 00"
                    hint={
                      deliveryMode === 'pickup'
                        ? 'Requis pour confirmer votre retrait'
                        : 'Requis pour la livraison'
                    }
                    required
                  />

                  {deliveryMode === 'delivery' && (
                    <>
                      <InputF
                        label="Adresse *"
                        name="adresse"
                        value={delivery.adresse}
                        onChange={handleDeliveryChange}
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputF
                          label="Ville *"
                          name="ville"
                          value={delivery.ville}
                          onChange={handleDeliveryChange}
                          required
                        />

                        <InputF
                          label="Pays"
                          name="pays"
                          value={delivery.pays}
                          onChange={handleDeliveryChange}
                        />
                      </div>

                      <DeliveryZoneSelector
                        orderTotal={cartTotal}
                        onSelect={setSelectedZone}
                        selectedId={selectedZone?.id}
                      />
                    </>
                  )}

                  {deliveryMode === 'pickup' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-2xl mt-0.5">🏪</span>

                      <div>
                        <p className="font-bold text-blue-800 text-sm">
                          Lieu de retrait
                        </p>

                        <p className="text-xs text-blue-600 mt-0.5">
                          {STORE_ADDRESS}
                        </p>

                        <p className="text-xs text-blue-600 mt-0.5">
                          📞 {STORE_PHONE}
                        </p>

                        <p className="text-xs text-blue-500 mt-1">
                          🕐 {STORE_HOURS}
                        </p>
                      </div>
                    </div>
                  )}

                  <CouponInput
                    orderTotal={cartTotal}
                    onApply={setAppliedCoupon}
                    appliedCoupon={appliedCoupon}
                  />

                  <LoyaltyPoints
                    onUsePoints={(points, discount) => {
                      setUsedPoints(points);
                      setRemisePoints(discount);
                    }}
                    usedPoints={usedPoints}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (validateInfos()) {
                        setStep(3);
                      }
                    }}
                    className="w-full mt-2 bg-[#0f1923] text-white py-4 rounded-xl hover:bg-[#c9933a] transition font-bold text-lg active:scale-[0.98]"
                  >
                    Continuer → Paiement
                  </button>
                </div>
              )}

              {step > 2 && (
                <div className="px-6 py-3 text-sm text-gray-600 bg-[#faf7f2]">
                  <p>
                    <strong>
                      {delivery.prenom} {delivery.nom}
                    </strong>{' '}
                    · {delivery.telephone}
                  </p>

                  {deliveryMode === 'delivery' && (
                    <p className="text-gray-400">
                      {delivery.adresse}, {delivery.ville}
                    </p>
                  )}

                  {deliveryMode === 'pickup' && (
                    <p className="text-gray-400">
                      Retrait : {STORE_ADDRESS}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 3 */}
          {step >= 3 && (
            <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8e0d4]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-[#0f1923] text-white">
                  3
                </div>

                <h2 className="font-black text-[#0f1923]">
                  💳 Paiement sécurisé
                </h2>
              </div>

              <div className="p-6">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                  Choisissez votre méthode de paiement{' '}
                  <span className="text-red-500">*</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {OPERATORS.map((operator) => (
                    <PaymentOperatorCard
                      key={operator.id}
                      operator={operator}
                      selected={selectedOperator === operator.id}
                      onSelect={setSelectedOperator}
                    />
                  ))}
                </div>

                {!selectedOperator && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
                    <span className="text-lg">👆</span>

                    <p className="text-sm text-amber-700 font-medium">
                      Sélectionnez votre méthode de paiement ci-dessus
                    </p>
                  </div>
                )}

                {selectedOperator && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-4 flex items-center gap-2">
                    <span className="text-lg">✅</span>

                    <p className="text-sm text-green-700 font-medium">
                      {
                        OPERATORS.find(
                          (operator) =>
                            operator.id === selectedOperator
                        )?.name
                      }{' '}
                      sélectionné
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm">
                  <span className="text-2xl">🔒</span>

                  <div>
                    <p className="font-bold text-green-800">
                      Paiement sécurisé via CinetPay
                    </p>

                    <p className="text-green-600 text-xs">
                      Vos données sont chiffrées.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0f1923] rounded-2xl p-5 mb-5 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm">
                        Montant total
                      </p>

                      <p className="text-3xl font-black mt-1">
                        {formatCFA(totalFinal)}
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-400 space-y-0.5">
                      <p>Articles : {formatCFA(cartTotal)}</p>

                      {deliveryMode === 'pickup' && (
                        <p className="text-green-400 font-semibold">
                          🏪 Retrait : Gratuit
                        </p>
                      )}

                      {deliveryMode === 'delivery' &&
                        fraisLivraison > 0 && (
                          <p>
                            🚚 Livraison : +{formatCFA(fraisLivraison)}
                          </p>
                        )}

                      {deliveryMode === 'delivery' &&
                        fraisLivraison === 0 &&
                        selectedZone && (
                          <p className="text-green-400">
                            🚚 Livraison : Gratuite
                          </p>
                        )}

                      {couponDiscount > 0 && (
                        <p>
                          Coupon : -{formatCFA(couponDiscount)}
                        </p>
                      )}

                      {remisePoints > 0 && (
                        <p>
                          Points : -{formatCFA(remisePoints)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={loading || !selectedOperator}
                  className="w-full bg-[#c9933a] text-white py-4 rounded-2xl font-black text-xl hover:bg-[#b8832d] transition-all active:scale-[0.97] disabled:opacity-60 shadow-lg shadow-[#c9933a]/30 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin text-2xl">⏳</span>
                      Connexion à CinetPay…
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">💳</span>
                      Payer {formatCFA(totalFinal)} →
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  Vous serez redirigé vers la page de paiement sécurisée
                  CinetPay.
                </p>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-3 text-sm text-gray-400 hover:text-[#0f1923] transition"
                >
                  ← Modifier mes informations
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif panier */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm sticky top-24 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8e0d4]">
              <h3 className="font-black text-[#0f1923]">
                Votre panier ({cart.length})
              </h3>
            </div>

            <div className="divide-y divide-[#e8e0d4] max-h-72 overflow-y-auto">
              {cart.map((item) => {
                const price =
                  item.final_price ??
                  parseFloat(item.book?.prix ?? item.fourniture?.prix ?? 0);

                const lineTotal =
                  item.line_total ?? price * item.quantite;

                const name =
                  item.product_nom ||
                  item.book?.titre ||
                  item.fourniture?.nom ||
                  'Article';

                const image =
                  item.book?.image ||
                  item.fourniture?.image ||
                  '';

                const isImage =
                  typeof image === 'string' &&
                  (image.startsWith('http') ||
                    image.startsWith('/'));

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 px-5 py-3 items-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#faf7f2] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {isImage ? (
                        <img
                          src={image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">
                          {image || '📦'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0f1923] truncate">
                        {name}
                      </p>

                      <p className="text-xs text-gray-400">
                        ×{item.quantite}
                      </p>
                    </div>

                    <p className="font-bold text-sm flex-shrink-0">
                      {formatCFA(lineTotal)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 bg-[#faf7f2] space-y-2 text-sm">
              {cartSavings > 0 && (
                <div className="flex justify-between text-[#2d7a4f] font-semibold">
                  <span>🎉 Promotions</span>
                  <span>-{formatCFA(cartSavings)}</span>
                </div>
              )}

              {deliveryMode === 'pickup' && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span>🏪</span>
                    Retrait boutique
                  </span>

                  <span className="text-green-600 font-bold">
                    Gratuit
                  </span>
                </div>
              )}

              {deliveryMode === 'delivery' && fraisLivraison > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>🚚 Livraison</span>
                  <span>+{formatCFA(fraisLivraison)}</span>
                </div>
              )}

              {deliveryMode === 'delivery' &&
                fraisLivraison === 0 &&
                selectedZone && (
                  <div className="flex justify-between text-[#2d7a4f] font-semibold">
                    <span>🚚 Livraison</span>
                    <span>Gratuite</span>
                  </div>
                )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#d44040] font-semibold">
                  <span>🏷 Coupon</span>
                  <span>-{formatCFA(couponDiscount)}</span>
                </div>
              )}

              {remisePoints > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>⭐ Points fidélité</span>
                  <span>-{formatCFA(remisePoints)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-lg text-[#0f1923] border-t border-[#e8e0d4] pt-3 mt-1">
                <span>Total</span>
                <span className="text-[#2d7a4f]">
                  {formatCFA(totalFinal)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
