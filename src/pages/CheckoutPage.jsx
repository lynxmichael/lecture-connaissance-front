<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
=======
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
>>>>>>> 294c6dc (Initial commit)
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { showToast } from '../components/Toast';
<<<<<<< HEAD
import OrderDevis from '../components/OrderDevis';
=======
>>>>>>> 294c6dc (Initial commit)
import CouponInput from '../components/CouponInput';
import DeliveryZoneSelector from '../components/DeliveryZoneSelector';
import LoyaltyPoints from '../components/LoyaltyPoints';
import { useNotifications } from '../contexts/NotificationContext';
import { formatCFA } from '../utils/currency';

<<<<<<< HEAD
const STEPS = ['Livraison', 'Paiement', 'Confirmation'];
const MOBILE_OPERATORS = [
  { id:'orange', name:'Orange Money', shortname:'Orange', color:'#FF6600', bg:'bg-orange-50', border:'border-orange-300', ring:'ring-orange-300', logo:'🟠', ussd:'#144#', hint:'Numéros Orange : 07 XX XX XX XX' },
  { id:'mtn',    name:'MTN Mobile Money', shortname:'MTN MoMo', color:'#FFCC00', bg:'bg-yellow-50', border:'border-yellow-400', ring:'ring-yellow-300', logo:'🟡', ussd:'*133#', hint:'Numéros MTN : 05 XX XX XX XX' },
  { id:'moov',   name:'Moov Money', shortname:'Moov', color:'#0066CC', bg:'bg-blue-50', border:'border-blue-400', ring:'ring-blue-300', logo:'🔵', ussd:'#555#', hint:'Numéros Moov : 01 XX XX XX XX' },
  { id:'wave',   name:'Wave', shortname:'Wave', color:'#1AC8ED', bg:'bg-cyan-50', border:'border-cyan-400', ring:'ring-cyan-300', logo:'🌊', ussd:null, hint:'Entrez votre numéro Wave CI' },
];

function MobilePaymentStep({ total, onValidated, onBack }) {
  const [selected, setSelected] = useState(null);
  const [phone,    setPhone]    = useState('');
  const [simStep,  setSimStep]  = useState('select');
  const [pinCode,  setPinCode]  = useState('');
  const [countdown,setCountdown]= useState(30);

  const op = MOBILE_OPERATORS.find(o => o.id === selected);

  useEffect(() => {
    if (simStep !== 'processing') return;
    if (countdown <= 0) { setSimStep('success'); return; }
    const t = setTimeout(() => setCountdown(c => c-1), 100);
    return () => clearTimeout(t);
  }, [simStep, countdown]);

  return (
    <div className="bg-white border border-[#e8e0d4] rounded-2xl p-7 shadow-sm">
      <h2 className="text-xl font-black text-[#0f1923] mb-6" style={{fontFamily:'Playfair Display,serif'}}>
        📱 Paiement Mobile Money
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MOBILE_OPERATORS.map(o => (
          <button key={o.id} onClick={() => { setSelected(o.id); setPhone(''); setPinCode(''); setSimStep('select'); }}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
              selected===o.id ? `${o.bg} ${o.border} ring-2 ${o.ring} shadow-md scale-[1.02]` : 'border-[#e8e0d4] hover:border-gray-300'
            }`}>
            <span className="text-3xl">{o.logo}</span>
            <div>
              <p className="font-black text-[#0f1923] text-sm leading-tight">{o.shortname}</p>
              <p className="text-gray-400 text-xs">{o.hint.split(':')[0]}</p>
            </div>
            {selected===o.id && <span className="ml-auto text-green-600 font-black">✓</span>}
          </button>
        ))}
      </div>
      {selected && simStep==='select' && (
        <div className={`${op.bg} border ${op.border} rounded-2xl p-5 space-y-4`}>
          <div className="bg-white/70 rounded-xl px-4 py-3 flex justify-between items-center border border-white">
            <span className="text-sm text-gray-600">Montant à payer</span>
            <span className="font-black text-xl text-[#0f1923]">{formatCFA(total)}</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5">Numéro {op.shortname} *</label>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^\d\s+]/g,''))}
              placeholder={`+225 07 XX XX XX XX`}
              className="w-full px-4 py-3 border-2 border-white rounded-xl text-sm bg-white focus:outline-none focus:border-[#0f1923] transition font-mono"/>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 bg-white/70 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-white transition border border-white">← Retour</button>
            <button onClick={() => phone.replace(/\s/g,'').length >= 8 ? setSimStep('confirm') : showToast('Numéro invalide','error')}
              className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 active:scale-[0.98]"
              style={{backgroundColor:op.color}}>
              Continuer →
            </button>
          </div>
        </div>
      )}
      {selected && simStep==='confirm' && (
        <div className={`${op.bg} border ${op.border} rounded-2xl p-5 space-y-4`}>
          <div className="bg-white/70 rounded-xl p-4 border border-white space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Opérateur</span><span className="font-bold">{op.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Numéro</span><span className="font-mono font-bold">{phone}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-bold">Total</span><span className="font-black text-xl">{formatCFA(total)}</span></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5">Code PIN {op.shortname} *</label>
            <input type="password" value={pinCode} onChange={e=>setPinCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="••••" maxLength={6}
              className="w-full px-4 py-3 border-2 border-white rounded-xl text-sm bg-white focus:outline-none focus:border-[#0f1923] transition font-mono tracking-widest text-center text-xl"/>
            {op.ussd && <p className="text-xs text-gray-500 mt-1">Ou composez <strong>{op.ussd}</strong> sur votre téléphone.</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setSimStep('select')} className="flex-1 bg-white/70 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-white transition border border-white">← Modifier</button>
            <button onClick={()=>{if(pinCode.length>=4){setSimStep('processing');setCountdown(30);}else showToast('Code PIN invalide','error');}}
              className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 active:scale-[0.98]"
              style={{backgroundColor:op.color}}>
              Payer {formatCFA(total)} →
            </button>
          </div>
        </div>
      )}
      {simStep==='processing' && (
        <div className={`${op.bg} border ${op.border} rounded-2xl p-8 text-center`}>
          <div className="text-5xl mb-4 animate-spin">⏳</div>
          <p className="font-black text-[#0f1923] text-lg mb-2">Paiement en cours…</p>
          <p className="text-gray-500 text-sm mb-5">Traitement {op.name}. Ne fermez pas cette page.</p>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-100" style={{width:`${((30-countdown)/30)*100}%`,backgroundColor:op.color}}/>
          </div>
          <p className="text-xs text-gray-400">{countdown}s restantes…</p>
        </div>
      )}
      {simStep==='success' && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow">✅</div>
          <p className="font-black text-[#0f1923] text-xl mb-1">Paiement confirmé !</p>
          <p className="text-green-700 text-sm font-semibold mb-1">{op.name}</p>
          <p className="text-gray-500 text-sm mb-1">Numéro : <strong>{phone}</strong></p>
          <p className="text-gray-500 text-sm mb-6">Montant : <strong>{formatCFA(total)}</strong></p>
          <button onClick={() => onValidated(`${op.name} (${phone})`)}
            className="bg-[#0f1923] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#c9933a] transition">
            Finaliser la commande →
          </button>
        </div>
      )}
    </div>
  );
}
=======
const OPERATORS = [
  { id:'orange', name:'Orange Money',      color:'#FF6600', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Orange_logo.svg/480px-Orange_logo.svg.png' },
  { id:'mtn',    name:'MTN Mobile Money',  color:'#FFCC00', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/MTN_Logo.svg/480px-MTN_Logo.svg.png' },
  { id:'wave',   name:'Wave',              color:'#1AC8ED', logo:'https://play-lh.googleusercontent.com/CEKbN8z26lhEWuHPLDnIFsQ7ePqUJgKdN8m8xmQCVCrBoFUZXpMXpWJ1KtKfsFgVlQ=w480-h960-rw' },
  { id:'moov',   name:'Moov Money',        color:'#0066CC', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Moov_Africa.svg/480px-Moov_Africa.svg.png' },
  { id:'card',   name:'Visa / Mastercard', color:'#1A1F71', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/480px-Visa_Inc._logo.svg.png' },
];

const STORE_ADDRESS = "Avenue de la République, Cocody, Abidjan";
const STORE_PHONE   = "+225 07 00 00 00 00";
const STORE_HOURS   = "Lun–Ven : 08h–18h30 · Sam : 08h–17h";
>>>>>>> 294c6dc (Initial commit)

const InputF = ({ label, hint, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
<<<<<<< HEAD
    <input {...props}
      className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition bg-white"/>
=======
    <input {...props} className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition bg-white" />
>>>>>>> 294c6dc (Initial commit)
    {hint && <p className="text-xs text-[#c9933a] mt-1">{hint}</p>}
  </div>
);

<<<<<<< HEAD
export default function CheckoutPage() {
  const { cart, cartTotal, cartOriginal, cartSavings, refresh: refreshCart } = useCart();
  const { user }   = useAuth();
  const { add: addNotif } = useNotifications();

  const [step,          setStep]         = useState(1);
  const [loading,       setLoading]      = useState(false);
  const [placedOrder,   setPlacedOrder]  = useState(null);
  const [paymentMethod, setPaymentMethod]= useState(null);

  // Livraison
  const [delivery, setDelivery] = useState({
    prenom: user?.prenom||'', nom: user?.name||'', telephone: user?.telephone||'',
    adresse:'', codePostal:'', ville:'', pays:"Côte d'Ivoire",
  });
  const [selectedZone, setSelectedZone] = useState(null);
  const fraisLivraison = selectedZone
    ? (selectedZone.gratuit_a_partir !== null && cartTotal >= selectedZone.gratuit_a_partir ? 0 : selectedZone.frais)
    : 0;

  // Promo & fidélité
=======
/* ── Page succès ──────────────────────────────────────────────────────────── */
function SuccessPage({ nom, deliveryMode }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow">🎉</div>
      <h1 className="text-3xl font-black text-[#0f1923] mb-3" style={{fontFamily:'Playfair Display,serif'}}>
        Paiement confirmé !
      </h1>
      <p className="text-gray-500 mb-2">Merci <strong>{nom}</strong> !</p>
      <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border-2 my-4 ${
        deliveryMode === 'pickup'
          ? 'bg-blue-50 border-blue-200 text-blue-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <span className="text-2xl">{deliveryMode === 'pickup' ? '🏪' : '🚚'}</span>
        <div className="text-left">
          <p className="font-bold text-sm">
            {deliveryMode === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile'}
          </p>
          <p className="text-xs opacity-75">
            {deliveryMode === 'pickup'
              ? `Venez récupérer votre commande : ${STORE_ADDRESS}`
              : 'Votre commande sera livrée à votre adresse'}
          </p>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-8">Vous recevrez un SMS de confirmation.</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/orders" className="bg-[#0f1923] text-white px-6 py-3 rounded-xl hover:bg-[#c9933a] transition font-bold">📦 Mes commandes</Link>
        <Link to="/catalog" className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-6 py-3 rounded-xl hover:border-[#c9933a] transition font-semibold">Continuer mes achats</Link>
      </div>
    </div>
  );
}

/* ── Attente de confirmation (polling) ───────────────────────────────────── */
function WaitingPayment({ transactionId, clientNom, total, onSuccess, onCancel }) {
  const [status,  setStatus]  = useState('pending');
  const [dots,    setDots]    = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const dotsRef     = useRef(null);

  useEffect(() => {
    dotsRef.current    = setInterval(() => setDots(d => (d + 1) % 4), 500);
    intervalRef.current = setInterval(async () => {
      setElapsed(e => e + 4);
      try {
        const res = await api.get(`/payment/status/${transactionId}`);
        if (res.data.status === 'paid') {
          clearInterval(intervalRef.current); clearInterval(dotsRef.current);
          setStatus('paid'); setTimeout(onSuccess, 1500);
        } else if (res.data.status === 'failed') {
          clearInterval(intervalRef.current); clearInterval(dotsRef.current);
          setStatus('failed');
        }
      } catch {}
    }, 4000);
    return () => { clearInterval(intervalRef.current); clearInterval(dotsRef.current); };
  }, [transactionId, onSuccess]);

  const dotStr = '.'.repeat(dots + 1);

  if (status === 'paid') return (
    <div className="text-center py-10">
      <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
      <p className="text-2xl font-black text-[#0f1923]">Paiement reçu !</p>
      <p className="text-gray-500 mt-1">Création de votre commande{dotStr}</p>
    </div>
  );

  if (status === 'failed') return (
    <div className="text-center py-10">
      <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">❌</div>
      <p className="text-xl font-black text-[#d44040] mb-2">Paiement échoué</p>
      <p className="text-gray-500 text-sm mb-6">Le paiement n'a pas abouti. Veuillez réessayer.</p>
      <button onClick={onCancel} className="bg-[#0f1923] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c9933a] transition">← Réessayer</button>
    </div>
  );

  return (
    <div className="text-center py-8 px-4">
      <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 border-4 border-[#c9933a]/20">
        <span className="animate-pulse">📱</span>
      </div>
      <h2 className="text-xl font-black text-[#0f1923] mb-2">Confirmez sur votre téléphone</h2>
      <p className="text-gray-500 text-sm mb-1">Montant : <strong className="text-[#0f1923]">{formatCFA(total)}</strong></p>
      <p className="text-gray-400 text-sm mb-6">Validez le paiement dans l'app ou par OTP{dotStr}</p>
      <div className="bg-[#faf7f2] rounded-2xl p-4 text-sm text-gray-600 mb-6 border border-[#e8e0d4] max-w-xs mx-auto">
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Étapes</p>
        <div className="space-y-1.5 text-left">
          <p>1️⃣ Ouvrez votre app mobile money</p>
          <p>2️⃣ Acceptez la demande de paiement</p>
          <p>3️⃣ Entrez votre code secret</p>
        </div>
      </div>
      {elapsed > 120 && <p className="text-xs text-gray-400 mb-4">Attente depuis {Math.floor(elapsed/60)}min…</p>}
      <button onClick={onCancel} className="text-sm text-gray-400 hover:text-[#d44040] transition underline">
        Annuler et recommencer
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { cart, cartTotal, cartSavings, refresh: refreshCart } = useCart();
  const { user }   = useAuth();
  const { add: addNotif } = useNotifications();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();

  const returnTx = params.get('transaction_id');

  const [step,        setStep]       = useState(1);  // 1=mode 2=infos 3=paiement 4=attente
  const [loading,     setLoading]    = useState(false);
  const [done,        setDone]       = useState(false);
  const [txId,        setTxId]       = useState(returnTx || null);
  const [totalFinal,  setTotalFinal] = useState(0);

  // ── Mode de livraison ─────────────────────────────────────────────────────
  const [deliveryMode,      setDeliveryMode]      = useState(null); // null | 'delivery' | 'pickup'
  const [selectedOperator, setSelectedOperator] = useState(null); // opérateur paiement choisi

  // ── Infos contact/livraison ───────────────────────────────────────────────
  const [delivery, setDelivery] = useState({
    prenom: user?.prenom||'', nom: user?.name||'', telephone: user?.telephone||'',
    adresse:'', ville:'Abidjan', pays:"Côte d'Ivoire",
  });

  const [selectedZone,  setSelectedZone]  = useState(null);
>>>>>>> 294c6dc (Initial commit)
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [usedPoints,    setUsedPoints]    = useState(0);
  const [remisePoints,  setRemisePoints]  = useState(0);

<<<<<<< HEAD
  const couponDiscount  = appliedCoupon?.discount ?? 0;
  const totalFinal      = Math.max(0, cartTotal + fraisLivraison - couponDiscount - remisePoints);

  useEffect(() => {
    if (user?.adresses?.length) {
      const parts = user.adresses[0].split(',').map(s=>s.trim());
      if (parts[0]) setDelivery(d=>({...d, adresse:parts[0]}));
    }
  }, [user]);

  const handleD = e => setDelivery(d=>({...d,[e.target.name]:e.target.value}));

  const validateDelivery = () => {
    const {prenom,nom,telephone,adresse,codePostal,ville} = delivery;
    if (!prenom||!nom||!adresse||!codePostal||!ville) { showToast('Remplissez tous les champs *','error'); return false; }
    if (!telephone) { showToast('Téléphone requis','error'); return false; }
    if (!selectedZone) { showToast('Choisissez une zone de livraison','error'); return false; }
    return true;
  };

  const handlePaymentValidated = (method) => { setPaymentMethod(method); setStep(3); };

  const handleSubmitOrder = async () => {
    setLoading(true);
    const fullAdresse = `${delivery.adresse}, ${delivery.codePostal} ${delivery.ville}, ${delivery.pays}`;
    try {
      const res = await api.post('/orders', {
        adresse:     fullAdresse,
        client_nom:  `${delivery.prenom} ${delivery.nom}`,
        telephone:   delivery.telephone,
        zone_id:     selectedZone?.id,
        coupon_code: appliedCoupon?.coupon?.code,
        use_points:  usedPoints,
      });
      await refreshCart();
      addNotif(`📦 Commande ${res.data.numero_commande} confirmée ! Total : ${formatCFA(res.data.total)}`, 'order', 0);
      setPlacedOrder({ ...res.data, client_telephone:delivery.telephone, client_email:user?.email, payment_method:paymentMethod });
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur','error');
    } finally { setLoading(false); }
  };

  if (placedOrder) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow">🎉</div>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>Commande confirmée !</h1>
        <p className="text-gray-500 mt-2 text-sm">Merci <strong>{delivery.prenom}</strong> ! Votre PDF se télécharge automatiquement.</p>
        {placedOrder.points_gagnes > 0 && (
          <div className="inline-flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            <span className="text-lg">⭐</span>
            <span className="text-amber-800 font-semibold text-sm">+{placedOrder.points_gagnes} points de fidélité gagnés !</span>
          </div>
        )}
      </div>
      <OrderDevis order={placedOrder} autoExport={true}/>
      <div className="flex gap-3 mt-6 justify-center flex-wrap">
        <Link to="/orders" className="bg-[#0f1923] text-white px-6 py-3 rounded-xl hover:bg-[#c9933a] transition font-bold">📦 Mes commandes</Link>
        <Link to="/catalog" className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-6 py-3 rounded-xl hover:border-[#c9933a] transition font-semibold">Continuer</Link>
=======
  // Frais de livraison : 0 si retrait en boutique
  const fraisLivraison = deliveryMode === 'pickup' ? 0 :
    selectedZone
      ? (selectedZone.gratuit_a_partir !== null && cartTotal >= selectedZone.gratuit_a_partir ? 0 : selectedZone.frais)
      : 0;

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, cartTotal + fraisLivraison - couponDiscount - remisePoints);

  useEffect(() => { setTotalFinal(total); }, [total]);
  useEffect(() => {
    if (user?.adresses?.length) {
      const a = user.adresses[0];
      setDelivery(d => ({ ...d, adresse: a.split(',')[0]?.trim() || a }));
    }
  }, [user]);

  useEffect(() => {
    if (returnTx) { setStep(4); setTxId(returnTx); }
  }, [returnTx]);

  const handleD = e => setDelivery(d => ({ ...d, [e.target.name]: e.target.value }));

  const validateInfos = () => {
    const { prenom, nom, telephone } = delivery;
    if (!prenom || !nom) { showToast('Prénom et nom requis', 'error'); return false; }
    if (!telephone)       { showToast('Téléphone requis', 'error'); return false; }
    if (deliveryMode === 'delivery') {
      if (!delivery.adresse) { showToast('Adresse de livraison requise', 'error'); return false; }
      if (!selectedZone)     { showToast('Choisissez une zone de livraison', 'error'); return false; }
    }
    return true;
  };

  const handlePay = async () => {
    if (!selectedOperator) {
      showToast('Veuillez choisir un opérateur de paiement', 'error');
      return;
    }
    setLoading(true);
    try {
      const adresse = deliveryMode === 'pickup'
        ? STORE_ADDRESS
        : `${delivery.adresse}, ${delivery.ville}, ${delivery.pays}`;

      const res = await api.post('/payment/initiate', {
        adresse,
        client_nom:    `${delivery.prenom} ${delivery.nom}`,
        telephone:     delivery.telephone,
        delivery_mode:    deliveryMode,
        zone_id:          deliveryMode === 'delivery' ? selectedZone?.id : null,
        coupon_code:      appliedCoupon?.coupon?.code,
        use_points:       usedPoints,
        payment_channel:  selectedOperator || 'ALL',
      });

      setTxId(res.data.transaction_id);
      window.location.href = res.data.payment_url;
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors du paiement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await refreshCart();
    addNotif(`📦 Paiement confirmé ! Commande en cours.`, 'order', 0);
    setDone(true);
  };

  if (done) return <SuccessPage nom={delivery.prenom || user?.prenom || 'Cher client'} deliveryMode={deliveryMode} />;

  if (step === 4 && txId) return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white border border-[#e8e0d4] rounded-3xl p-8 shadow-sm">
        <WaitingPayment
          transactionId={txId} clientNom={delivery.prenom || user?.prenom || ''}
          total={totalFinal} onSuccess={handlePaymentSuccess}
          onCancel={() => { setStep(3); setTxId(null); navigate('/checkout', { replace: true }); }}
        />
>>>>>>> 294c6dc (Initial commit)
      </div>
    </div>
  );

<<<<<<< HEAD
  if (cart.length===0) return (
=======
  if (cart.length === 0) return (
>>>>>>> 294c6dc (Initial commit)
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 mb-4">Votre panier est vide.</p>
      <Link to="/catalog" className="text-[#c9933a] hover:underline font-medium">← Retour au catalogue</Link>
    </div>
  );

  return (
<<<<<<< HEAD
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Passer une commande</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>Commander</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((label,i) => {
          const num=i+1,done=step>num,current=step===num;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-sm ${done?'bg-[#2d7a4f] text-white':current?'bg-[#0f1923] text-white ring-4 ring-[#0f1923]/20':'bg-[#e8e0d4] text-gray-400'}`}>
                  {done?'✓':num}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${current?'text-[#0f1923]':'text-gray-400'}`}>{label}</span>
              </div>
              {i<STEPS.length-1 && <div className={`flex-1 h-1 mx-2 rounded-full ${step>num?'bg-[#2d7a4f]':'bg-[#e8e0d4]'}`}/>}
            </div>
          );
        })}
      </div>

      {/* Étape 1 */}
      {step===1 && (
        <div className="bg-white border border-[#e8e0d4] rounded-2xl p-7 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-[#0f1923] mb-2" style={{fontFamily:'Playfair Display,serif'}}>📍 Livraison</h2>
          {user?.adresses?.length > 0 && (
            <div>
              {user.adresses.map((a,i)=>(
                <label key={i} className="flex items-center gap-3 border border-[#e8e0d4] rounded-xl p-3 mb-2 cursor-pointer hover:border-[#c9933a] transition text-sm">
                  <input type="radio" name="savedAddr" className="accent-[#c9933a]"
                    onChange={()=>setDelivery(d=>({...d,adresse:a.split(',')[0]?.trim()||a}))}/>
                  <span>📍 {a}</span>
                </label>
              ))}
              <p className="text-xs text-gray-400 text-center my-2">— ou saisissez une nouvelle adresse —</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <InputF label="Prénom *" name="prenom" value={delivery.prenom} onChange={handleD} required/>
            <InputF label="Nom *"    name="nom"    value={delivery.nom}    onChange={handleD} required/>
          </div>
          <InputF label="Téléphone *" name="telephone" type="tel" value={delivery.telephone} onChange={handleD}
            placeholder="+225 07 00 00 00 00" hint="Requis pour la livraison" required/>
          <InputF label="Adresse *"   name="adresse" value={delivery.adresse} onChange={handleD} required/>
          <div className="grid grid-cols-2 gap-4">
            <InputF label="Code postal *" name="codePostal" value={delivery.codePostal} onChange={handleD} required/>
            <InputF label="Ville *"       name="ville"      value={delivery.ville}      onChange={handleD} required/>
          </div>
          <InputF label="Pays" name="pays" value={delivery.pays} onChange={handleD}/>

          <DeliveryZoneSelector orderTotal={cartTotal} onSelect={setSelectedZone} selectedId={selectedZone?.id}/>

          <button onClick={()=>{ if(validateDelivery()) setStep(2); }}
            className="w-full mt-2 bg-[#0f1923] text-white py-3.5 rounded-xl hover:bg-[#c9933a] transition font-bold">
            Choisir le paiement →
          </button>
        </div>
      )}

      {/* Étape 2 */}
      {step===2 && (
        <MobilePaymentStep total={totalFinal} onValidated={handlePaymentValidated} onBack={()=>setStep(1)}/>
      )}

      {/* Étape 3 */}
      {step===3 && (
        <div className="bg-white border border-[#e8e0d4] rounded-2xl p-7 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>✅ Vérification finale</h2>

          <div className="bg-[#faf7f2] rounded-xl p-4 text-sm space-y-1">
            <p className="font-bold text-[#0f1923]">{delivery.prenom} {delivery.nom}</p>
            <p className="text-gray-600">{delivery.adresse}, {delivery.codePostal} {delivery.ville}</p>
            {delivery.telephone && <p className="text-gray-600">📞 {delivery.telephone}</p>}
            {selectedZone && <p className="text-gray-600">📍 {selectedZone.nom}</p>}
          </div>

          {paymentMethod && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm">
              <span className="text-green-600 font-bold">✅</span>
              <span className="text-green-800 font-semibold">Paiement validé via {paymentMethod}</span>
            </div>
          )}

          {/* Coupon */}
          <CouponInput orderTotal={cartTotal} onApply={setAppliedCoupon} appliedCoupon={appliedCoupon}/>

          {/* Points fidélité */}
          <LoyaltyPoints
            onUsePoints={(pts, remise) => { setUsedPoints(pts); setRemisePoints(remise); }}
            usedPoints={usedPoints}
          />

          {/* Récap articles */}
          <div className="border border-[#e8e0d4] rounded-xl overflow-hidden">
            <div className="bg-[#faf7f2] px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Articles</div>
            <div className="divide-y divide-[#e8e0d4]">
              {cart.map(item => {
                const fp = item.final_price ?? parseFloat(item.book?.prix??0);
                const lt = item.line_total ?? fp*item.quantite;
                return (
                  <div key={item.id} className="flex justify-between items-center px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{item.book?.image || item.fourniture?.image || '📦'}</span>
                      <div>
                        <p className="font-semibold text-[#0f1923]">{item.product_nom || item.book?.titre || item.fourniture?.nom}</p>
                        <p className="text-gray-400 text-xs">{item.book?.auteur || item.fourniture?.categorie}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">×{item.quantite}</p>
                      <p className="font-bold">{formatCFA(lt)}</p>
                    </div>
=======
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Commander</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          Finaliser ma commande
        </h1>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {[
          { n:1, label:'Mode de réception' },
          { n:2, label:'Vos coordonnées' },
          { n:3, label:'Paiement' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step > n ? 'bg-green-500 text-white' :
              step === n ? 'bg-[#0f1923] text-white' :
              'bg-gray-200 text-gray-400'
            }`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step === n ? 'text-[#0f1923]' : 'text-gray-400'}`}>{label}</span>
            {i < 2 && <div className="w-6 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">

          {/* ══ ÉTAPE 1 : Mode de réception ════════════════════════════════ */}
          <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${step >= 1 ? 'border-[#e8e0d4]' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8e0d4]">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${step > 1 ? 'bg-green-500 text-white' : 'bg-[#0f1923] text-white'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <h2 className="font-black text-[#0f1923]">Comment souhaitez-vous recevoir votre commande ?</h2>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-[#c9933a] hover:underline font-medium">Modifier</button>
              )}
            </div>

            {step === 1 && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Option : Retrait en boutique */}
                  <button
                    onClick={() => { setDeliveryMode('pickup'); setStep(2); }}
                    className={`group relative text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98] ${
                      deliveryMode === 'pickup'
                        ? 'border-[#0f1923] bg-[#0f1923] text-white'
                        : 'border-[#e8e0d4] hover:border-[#0f1923] bg-white'
                    }`}>
                    <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">Gratuit</span>
                    <div className="text-4xl mb-3">🏪</div>
                    <p className="font-black text-lg mb-1">Retrait en boutique</p>
                    <p className={`text-sm mb-3 ${deliveryMode === 'pickup' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Venez récupérer votre commande directement chez nous.
                    </p>
                    <div className={`text-xs space-y-1 ${deliveryMode === 'pickup' ? 'text-gray-300' : 'text-gray-400'}`}>
                      <p>📍 {STORE_ADDRESS}</p>
                      <p>📞 {STORE_PHONE}</p>
                      <p>🕐 {STORE_HOURS}</p>
                    </div>
                    <div className={`mt-3 text-sm font-bold ${deliveryMode === 'pickup' ? 'text-green-300' : 'text-green-600'}`}>
                      ✓ Frais de livraison : 0 FCFA
                    </div>
                  </button>

                  {/* Option : Livraison à domicile */}
                  <button
                    onClick={() => { setDeliveryMode('delivery'); setStep(2); }}
                    className={`group relative text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98] ${
                      deliveryMode === 'delivery'
                        ? 'border-[#c9933a] bg-[#c9933a] text-white'
                        : 'border-[#e8e0d4] hover:border-[#c9933a] bg-white'
                    }`}>
                    <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-[#0f1923] text-white">Selon zone</span>
                    <div className="text-4xl mb-3">🚚</div>
                    <p className="font-black text-lg mb-1">Livraison à domicile</p>
                    <p className={`text-sm mb-3 ${deliveryMode === 'delivery' ? 'text-orange-100' : 'text-gray-500'}`}>
                      Recevez votre commande directement à votre adresse.
                    </p>
                    <div className={`text-xs space-y-1 ${deliveryMode === 'delivery' ? 'text-orange-100' : 'text-gray-400'}`}>
                      <p>🏙️ Abidjan : 24–48h</p>
                      <p>🌍 Autres villes : 3–5 jours</p>
                    </div>
                    <div className={`mt-3 text-sm font-bold ${deliveryMode === 'delivery' ? 'text-yellow-200' : 'text-[#c9933a]'}`}>
                      Frais calculés selon votre zone
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Résumé du mode choisi */}
            {step > 1 && deliveryMode && (
              <div className={`px-6 py-3 text-sm flex items-center gap-3 ${
                deliveryMode === 'pickup' ? 'bg-gray-50' : 'bg-amber-50'
              }`}>
                <span className="text-xl">{deliveryMode === 'pickup' ? '🏪' : '🚚'}</span>
                <div>
                  <p className="font-bold text-[#0f1923]">
                    {deliveryMode === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {deliveryMode === 'pickup' ? `${STORE_ADDRESS} · ${STORE_HOURS}` : 'Adresse renseignée ci-dessous'}
                  </p>
                </div>
                {deliveryMode === 'pickup' && (
                  <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Gratuit</span>
                )}
              </div>
            )}
          </div>

          {/* ══ ÉTAPE 2 : Coordonnées ══════════════════════════════════════ */}
          {step >= 2 && (
            <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8e0d4]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${step > 2 ? 'bg-green-500 text-white' : 'bg-[#0f1923] text-white'}`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <h2 className="font-black text-[#0f1923]">
                  {deliveryMode === 'pickup' ? '👤 Vos coordonnées' : '📍 Adresse de livraison'}
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="ml-auto text-xs text-[#c9933a] hover:underline">Modifier</button>
                )}
              </div>

              {step === 2 && (
                <div className="p-6 space-y-4">
                  {/* Adresses sauvegardées (seulement si livraison) */}
                  {deliveryMode === 'delivery' && user?.adresses?.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {user.adresses.map((a, i) => (
                        <label key={i} className="flex items-center gap-3 border border-[#e8e0d4] rounded-xl p-3 cursor-pointer hover:border-[#c9933a] transition text-sm">
                          <input type="radio" name="savedAddr" className="accent-[#c9933a]"
                            onChange={() => setDelivery(d => ({ ...d, adresse: a.split(',')[0]?.trim() || a }))} />
                          <span>📍 {a}</span>
                        </label>
                      ))}
                      <p className="text-xs text-gray-400 text-center my-1">— ou entrez une autre adresse —</p>
                    </div>
                  )}

                  {/* Champs communs */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputF label="Prénom *" name="prenom" value={delivery.prenom} onChange={handleD} required />
                    <InputF label="Nom *"    name="nom"    value={delivery.nom}    onChange={handleD} required />
                  </div>
                  <InputF label="Téléphone *" name="telephone" type="tel" value={delivery.telephone}
                    onChange={handleD} placeholder="+225 07 00 00 00 00"
                    hint={deliveryMode === 'pickup' ? "Requis pour confirmer votre retrait" : "Requis pour la livraison"} required />

                  {/* Champs adresse uniquement si livraison */}
                  {deliveryMode === 'delivery' && (
                    <>
                      <InputF label="Adresse *" name="adresse" value={delivery.adresse} onChange={handleD} required />
                      <div className="grid grid-cols-2 gap-4">
                        <InputF label="Ville *" name="ville" value={delivery.ville} onChange={handleD} required />
                        <InputF label="Pays"    name="pays"  value={delivery.pays}  onChange={handleD} />
                      </div>
                      <DeliveryZoneSelector orderTotal={cartTotal} onSelect={setSelectedZone} selectedId={selectedZone?.id} />
                    </>
                  )}

                  {/* Retrait en boutique : rappel adresse */}
                  {deliveryMode === 'pickup' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-2xl mt-0.5">🏪</span>
                      <div>
                        <p className="font-bold text-blue-800 text-sm">Lieu de retrait</p>
                        <p className="text-xs text-blue-600 mt-0.5">{STORE_ADDRESS}</p>
                        <p className="text-xs text-blue-600 mt-0.5">📞 {STORE_PHONE}</p>
                        <p className="text-xs text-blue-500 mt-1">🕐 {STORE_HOURS}</p>
                      </div>
                    </div>
                  )}

                  <CouponInput orderTotal={cartTotal} onApply={setAppliedCoupon} appliedCoupon={appliedCoupon} />
                  <LoyaltyPoints onUsePoints={(pts, remise) => { setUsedPoints(pts); setRemisePoints(remise); }} usedPoints={usedPoints} />

                  <button onClick={() => { if (validateInfos()) setStep(3); }}
                    className="w-full mt-2 bg-[#0f1923] text-white py-4 rounded-xl hover:bg-[#c9933a] transition font-bold text-lg active:scale-[0.98]">
                    Continuer → Paiement
                  </button>
                </div>
              )}

              {step > 2 && (
                <div className="px-6 py-3 text-sm text-gray-600 bg-[#faf7f2]">
                  <p><strong>{delivery.prenom} {delivery.nom}</strong> · {delivery.telephone}</p>
                  {deliveryMode === 'delivery' && <p className="text-gray-400">{delivery.adresse}, {delivery.ville}</p>}
                  {deliveryMode === 'pickup'   && <p className="text-gray-400">Retrait : {STORE_ADDRESS}</p>}
                </div>
              )}
            </div>
          )}

          {/* ══ ÉTAPE 3 : Paiement ═════════════════════════════════════════ */}
          {step >= 3 && (
            <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8e0d4]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-[#0f1923] text-white">3</div>
                <h2 className="font-black text-[#0f1923]">💳 Paiement sécurisé</h2>
              </div>

              <div className="p-6">
                {/* Sélection opérateur paiement */}
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                  Choisissez votre méthode de paiement <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {OPERATORS.map(op => {
                    const isSelected = selectedOperator === op.id;
                    return (
                      <button key={op.id} type="button"
                        onClick={() => setSelectedOperator(op.id)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                          isSelected
                            ? 'border-[#c9933a] shadow-md bg-amber-50'
                            : 'border-[#e8e0d4] hover:border-[#c9933a]/50 bg-white hover:bg-amber-50/30'
                        }`}>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#c9933a] rounded-full text-white text-xs flex items-center justify-center font-black">✓</span>
                        )}
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                          <img src={op.logo} alt={op.name}
                            className="w-9 h-9 object-contain"
                            onError={e => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = `<span style="font-size:1.4rem">${
                                op.id === 'orange' ? '🟠' :
                                op.id === 'mtn'    ? '🟡' :
                                op.id === 'wave'   ? '🔵' :
                                op.id === 'moov'   ? '💙' : '💳'
                              }</span>`;
                            }}
                          />
                        </div>
                        <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-[#c9933a]' : 'text-gray-700'}`}>
                          {op.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!selectedOperator && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
                    <span className="text-lg">👆</span>
                    <p className="text-sm text-amber-700 font-medium">Sélectionnez votre méthode de paiement ci-dessus</p>
                  </div>
                )}

                {selectedOperator && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-4 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <p className="text-sm text-green-700 font-medium">
                      {OPERATORS.find(o => o.id === selectedOperator)?.name} sélectionné
                    </p>
                  </div>
                )}

                {/* Badge sécurité */}
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-bold text-green-800">Paiement 100% sécurisé via CinetPay</p>
                    <p className="text-green-600 text-xs">Vos données sont chiffrées · Certifié PCI DSS</p>
                  </div>
                </div>

                {/* Récap montant */}
                <div className="bg-[#0f1923] rounded-2xl p-5 mb-5 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm">Montant total</p>
                      <p className="text-3xl font-black mt-1">{formatCFA(total)}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400 space-y-0.5">
                      <p>Articles : {formatCFA(cartTotal)}</p>
                      {deliveryMode === 'pickup' && (
                        <p className="text-green-400 font-semibold">🏪 Retrait : Gratuit</p>
                      )}
                      {deliveryMode === 'delivery' && fraisLivraison > 0 && (
                        <p>🚚 Livraison : +{formatCFA(fraisLivraison)}</p>
                      )}
                      {deliveryMode === 'delivery' && fraisLivraison === 0 && selectedZone && (
                        <p className="text-green-400">🚚 Livraison : Gratuite</p>
                      )}
                      {couponDiscount > 0 && <p>Coupon : -{formatCFA(couponDiscount)}</p>}
                      {remisePoints  > 0 && <p>Points : -{formatCFA(remisePoints)}</p>}
                    </div>
                  </div>
                </div>

                {/* CTA payer */}
                <button onClick={handlePay} disabled={loading || !selectedOperator}
                  className="w-full bg-[#c9933a] text-white py-4 rounded-2xl font-black text-xl hover:bg-[#b8832d] transition-all active:scale-[0.97] disabled:opacity-60 shadow-lg shadow-[#c9933a]/30 flex items-center justify-center gap-3">
                  {loading
                    ? <><span className="animate-spin text-2xl">⏳</span> Connexion à CinetPay…</>
                    : <><span className="text-2xl">💳</span> Payer {formatCFA(total)} →</>
                  }
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Vous serez redirigé vers la page de paiement sécurisée CinetPay
                </p>
                <button onClick={() => setStep(2)} className="w-full mt-3 text-sm text-gray-400 hover:text-[#0f1923] transition">
                  ← Modifier mes informations
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar récap commande ─────────────────────────────────────── */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm sticky top-24">
            <div className="px-5 py-4 border-b border-[#e8e0d4]">
              <h3 className="font-black text-[#0f1923]">Votre panier ({cart.length})</h3>
            </div>
            <div className="divide-y divide-[#e8e0d4] max-h-72 overflow-y-auto">
              {cart.map(item => {
                const fp = item.final_price ?? parseFloat(item.book?.prix ?? 0);
                const lt = item.line_total ?? fp * item.quantite;
                const name = item.product_nom || item.book?.titre || item.fourniture?.nom || '—';
                const icon = item.book?.image || item.fourniture?.image || '📦';
                return (
                  <div key={item.id} className="flex gap-3 px-5 py-3 items-center">
                    <span className="text-xl flex-shrink-0">{icon.startsWith('http') || icon.startsWith('/') ? '' : icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0f1923] truncate">{name}</p>
                      <p className="text-xs text-gray-400">×{item.quantite}</p>
                    </div>
                    <p className="font-bold text-sm flex-shrink-0">{formatCFA(lt)}</p>
>>>>>>> 294c6dc (Initial commit)
                  </div>
                );
              })}
            </div>
<<<<<<< HEAD

            {/* Détail totaux */}
            <div className="px-4 py-3 bg-[#faf7f2] space-y-1.5 border-t border-[#e8e0d4] text-sm">
              {cartSavings > 10 && (
                <div className="flex justify-between text-[#2d7a4f] font-semibold">
                  <span>🎉 Promotions</span><span>-{formatCFA(cartSavings)}</span>
                </div>
              )}
              {fraisLivraison > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>🚚 Livraison</span><span>+{formatCFA(fraisLivraison)}</span>
                </div>
              )}
              {fraisLivraison === 0 && selectedZone && (
                <div className="flex justify-between text-[#2d7a4f] font-semibold">
                  <span>🚚 Livraison</span><span>Gratuite</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#d44040] font-semibold">
                  <span>🏷 Coupon {appliedCoupon.coupon.code}</span><span>-{formatCFA(couponDiscount)}</span>
                </div>
              )}
              {remisePoints > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>⭐ Points fidélité</span><span>-{formatCFA(remisePoints)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-lg text-[#0f1923] border-t border-[#e8e0d4] pt-2 mt-1">
                <span>Total payé</span><span className="text-[#2d7a4f]">{formatCFA(totalFinal)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={()=>setStep(2)} className="flex-1 bg-[#faf7f2] border border-[#e8e0d4] text-gray-700 py-3 rounded-xl hover:bg-[#ede5d4] transition font-semibold">← Retour</button>
            <button onClick={handleSubmitOrder} disabled={loading}
              className="flex-1 bg-[#2d7a4f] text-white py-3 rounded-xl hover:bg-[#256040] transition font-bold disabled:opacity-60 active:scale-[0.98]">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span>Traitement…</span> : '✅ Confirmer ma commande'}
            </button>
          </div>
        </div>
      )}
=======
            <div className="px-5 py-4 bg-[#faf7f2] rounded-b-2xl space-y-2 text-sm">
              {cartSavings > 10 && <div className="flex justify-between text-[#2d7a4f] font-semibold"><span>🎉 Promotions</span><span>-{formatCFA(cartSavings)}</span></div>}
              {/* Mode livraison */}
              {deliveryMode === 'pickup' && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-600"><span>🏪</span> Retrait boutique</span>
                  <span className="text-green-600 font-bold">Gratuit</span>
                </div>
              )}
              {deliveryMode === 'delivery' && fraisLivraison > 0 && (
                <div className="flex justify-between text-gray-600"><span>🚚 Livraison</span><span>+{formatCFA(fraisLivraison)}</span></div>
              )}
              {deliveryMode === 'delivery' && fraisLivraison === 0 && selectedZone && (
                <div className="flex justify-between text-[#2d7a4f] font-semibold"><span>🚚 Livraison</span><span>Gratuite</span></div>
              )}
              {couponDiscount > 0 && <div className="flex justify-between text-[#d44040] font-semibold"><span>🏷 Coupon</span><span>-{formatCFA(couponDiscount)}</span></div>}
              {remisePoints  > 0 && <div className="flex justify-between text-amber-700 font-semibold"><span>⭐ Points</span><span>-{formatCFA(remisePoints)}</span></div>}
              <div className="flex justify-between font-black text-lg text-[#0f1923] border-t border-[#e8e0d4] pt-3 mt-1">
                <span>Total</span>
                <span className="text-[#2d7a4f]">{formatCFA(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
>>>>>>> 294c6dc (Initial commit)
    </div>
  );
}
