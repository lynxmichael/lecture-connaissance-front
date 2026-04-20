import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { showToast } from '../components/Toast';
import OrderDevis from '../components/OrderDevis';
import CouponInput from '../components/CouponInput';
import DeliveryZoneSelector from '../components/DeliveryZoneSelector';
import LoyaltyPoints from '../components/LoyaltyPoints';
import { useNotifications } from '../contexts/NotificationContext';
import { formatCFA } from '../utils/currency';

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

const InputF = ({ label, hint, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props}
      className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition bg-white"/>
    {hint && <p className="text-xs text-[#c9933a] mt-1">{hint}</p>}
  </div>
);

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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [usedPoints,    setUsedPoints]    = useState(0);
  const [remisePoints,  setRemisePoints]  = useState(0);

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
      </div>
    </div>
  );

  if (cart.length===0) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 mb-4">Votre panier est vide.</p>
      <Link to="/catalog" className="text-[#c9933a] hover:underline font-medium">← Retour au catalogue</Link>
    </div>
  );

  return (
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
                  </div>
                );
              })}
            </div>

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
    </div>
  );
}
