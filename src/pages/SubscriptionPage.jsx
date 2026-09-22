import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { formatCFA } from '../utils/currency';
import useSubscriptionPayment from '../hooks/useSubscriptionPayment';

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = [
  { bg:'from-emerald-50 to-teal-50',   border:'border-emerald-200', accent:'bg-emerald-500', btn:'bg-emerald-600 hover:bg-emerald-700', ring:'ring-emerald-400', text:'text-emerald-700', badge:'bg-emerald-100 text-emerald-700', icon:'🌱' },
  { bg:'from-indigo-50 to-violet-50',  border:'border-indigo-200',  accent:'bg-indigo-500',  btn:'bg-indigo-600 hover:bg-indigo-700',   ring:'ring-indigo-400',  text:'text-indigo-700',  badge:'bg-indigo-100 text-indigo-700',  icon:'🚀' },
  { bg:'from-amber-50 to-orange-50',   border:'border-amber-200',   accent:'bg-amber-500',   btn:'bg-amber-600 hover:bg-amber-700',     ring:'ring-amber-400',   text:'text-amber-700',   badge:'bg-amber-100 text-amber-700',    icon:'🏆' },
  { bg:'from-rose-50 to-pink-50',      border:'border-rose-200',    accent:'bg-rose-500',    btn:'bg-rose-600 hover:bg-rose-700',       ring:'ring-rose-400',    text:'text-rose-700',    badge:'bg-rose-100 text-rose-700',      icon:'💎' },
  { bg:'from-cyan-50 to-sky-50',       border:'border-cyan-200',    accent:'bg-cyan-500',    btn:'bg-cyan-600 hover:bg-cyan-700',       ring:'ring-cyan-400',    text:'text-cyan-700',    badge:'bg-cyan-100 text-cyan-700',      icon:'⚡' },
  { bg:'from-purple-50 to-fuchsia-50', border:'border-purple-200',  accent:'bg-purple-500',  btn:'bg-purple-600 hover:bg-purple-700',   ring:'ring-purple-400',  text:'text-purple-700',  badge:'bg-purple-100 text-purple-700',  icon:'✨' },
];
const getPalette = (slug = '') => {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const STATUS_CFG = {
  active:    { label:'✓ Actif',          cls:'bg-green-100 text-green-700 border-green-200' },
  trial:     { label:'🕐 Essai gratuit', cls:'bg-blue-100 text-blue-700 border-blue-200' },
  suspended: { label:'🔒 Suspendu',      cls:'bg-red-100 text-red-600 border-red-200' },
  cancelled: { label:'✗ Annulé',         cls:'bg-gray-100 text-gray-500 border-gray-200' },
};


// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function ExpiryCountdown({ endDate }) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    const run = () => {
      const ms = new Date(endDate) - Date.now();
      if (ms <= 0) return setInfo({ expired: true });
      setInfo({ days: Math.floor(ms / 86_400_000), hours: Math.floor((ms % 86_400_000) / 3_600_000), expired: false });
    };
    run();
    const id = setInterval(run, 60_000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!info) return null;
  if (info.expired) return <span className="text-xs font-bold text-red-500 animate-pulse">⚠ Expiré</span>;
  if (info.days > 7) return (
    <span className="text-xs text-gray-400">
      Expire le {new Date(endDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
    </span>
  );
  return (
    <span className={`font-bold text-xs ${info.days <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`}>
      ⏳ {info.days > 0 ? `${info.days}j ` : ''}{info.hours}h restantes
    </span>
  );
}

function Feature({ label, ok = true }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className={`mt-0.5 shrink-0 font-bold ${ok ? 'text-green-500' : 'text-gray-300'}`}>{ok ? '✓' : '✕'}</span>
      <span className="leading-snug text-gray-700">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOUTONS DE PAIEMENT INDÉPENDANTS
// Chaque bouton (mensuel / annuel) possède son propre état complet.
// L'un peut être en attente de paiement pendant que l'autre est disponible.
// ─────────────────────────────────────────────────────────────────────────────
function PaymentButtons({ plan, payStates, payUrls = {}, onPay, title }) {
  const monthlyState = payStates.monthly; // idle | loading | waiting | paid | failed
  const yearlyState  = payStates.yearly;

  // Un cycle est "bloqué" si l'autre est en train de traiter
  const monthlyBusy = monthlyState === 'loading' || monthlyState === 'waiting';
  const yearlyBusy  = yearlyState  === 'loading' || yearlyState  === 'waiting';

  return (
    <div className="space-y-3">
      {title && <p className="text-xs font-semibold tracking-wide text-center text-gray-500 uppercase">{title}</p>}

      <div className="grid grid-cols-2 gap-3">
        {/* ── MENSUEL ── */}
        <PayCycleCard
          cycle="monthly"
          label="Mensuel"
          icon="📅"
          price={plan ? formatCFA(plan.price_monthly) : '…'}
          priceSuffix="/mois"
          badge={null}
          state={monthlyState}
          disabled={yearlyBusy}
          onPay={onPay}
        />

        {/* ── ANNUEL ── */}
        <PayCycleCard
          cycle="yearly"
          label="Annuel"
          icon="📆"
          price={plan ? formatCFA(plan.price_yearly) : '…'}
          priceSuffix="/an"
          badge="−17%"
          state={yearlyState}
          disabled={monthlyBusy}
          onPay={onPay}
        />
      </div>

      {/* Fenêtre de paiement bloquée par le navigateur : lien de secours */}
      {['monthly', 'yearly'].filter(c => payUrls[c]).map(c => (
        <a key={c} href={payUrls[c]} target="_blank" rel="noopener noreferrer"
          className="block px-3 py-2 text-xs font-semibold text-center text-blue-700 underline border border-blue-100 bg-blue-50 rounded-xl">
          Votre navigateur a bloqué la fenêtre : ouvrir la page de paiement ({c === 'yearly' ? 'annuel' : 'mensuel'}) →
        </a>
      ))}
    </div>
  );
}

/**
 * Carte bouton pour un cycle de paiement (mensuel ou annuel).
 * États visuels distincts : idle → loading → waiting → paid / failed
 */
function PayCycleCard({ cycle, label, icon, price, priceSuffix, badge, state, disabled, onPay }) {
  const isLoading = state === 'loading';
  const isWaiting = state === 'waiting';
  const isPaid    = state === 'paid';
  const isFailed  = state === 'failed';
  const isBusy    = isLoading || isWaiting;

  const colorMap = {
    monthly: {
      idle:    'bg-amber-600 hover:bg-amber-700 border-amber-700',
      waiting: 'bg-amber-400 border-amber-500',
      paid:    'bg-green-600 border-green-700',
      failed:  'bg-red-600 hover:bg-red-700 border-red-700',
    },
    yearly: {
      idle:    'bg-slate-800 hover:bg-slate-900 border-slate-900',
      waiting: 'bg-slate-500 border-slate-600',
      paid:    'bg-green-600 border-green-700',
      failed:  'bg-red-600 hover:bg-red-700 border-red-700',
    },
  };

  const baseColor = colorMap[cycle][
    isPaid ? 'paid' : isFailed ? 'failed' : isBusy ? 'waiting' : 'idle'
  ];

  return (
    <div className={`flex flex-col rounded-xl border-2 overflow-hidden transition-all
      ${isBusy ? 'ring-2 ring-offset-1 ring-blue-300' : ''}
      ${disabled && !isBusy ? 'opacity-50' : ''}
    `}>

      {/* En-tête coloré */}
      <div className={`${baseColor} text-white px-3 py-2.5 flex items-center justify-between`}>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-bold">{label}</span>
        </div>
        {badge && !isBusy && !isPaid && (
          <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
        {isBusy && <span className="text-xs animate-pulse opacity-80">●</span>}
      </div>

      {/* Prix */}
      <div className="px-3 py-2 text-center bg-white border-b border-gray-100">
        <span className="text-base font-extrabold text-gray-900">{price}</span>
        <span className="text-xs text-gray-400">{priceSuffix}</span>
      </div>

      {/* Bouton action */}
      <button
        onClick={() => !isBusy && !isPaid && !disabled && onPay(cycle)}
        disabled={isBusy || isPaid || disabled}
        className={`w-full py-2.5 text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed
          ${isPaid    ? 'bg-green-50 text-green-600' :
            isFailed  ? 'bg-red-50 text-red-600 hover:bg-red-100' :
            isBusy    ? 'bg-gray-50 text-gray-400' :
            disabled  ? 'bg-gray-50 text-gray-400' :
                        'bg-gray-50 hover:bg-gray-100 text-gray-700'}
        `}
      >
        {isLoading ? <span className="flex items-center justify-center gap-1"><span className="animate-spin">⏳</span> Init…</span> :
         isWaiting ? <span className="flex items-center justify-center gap-1 animate-pulse"><span>📱</span> Validez sur mobile</span> :
         isPaid    ? <span className="flex items-center justify-center gap-1"><span>✅</span> Confirmé</span> :
         isFailed  ? <span className="flex items-center justify-center gap-1"><span>↩</span> Réessayer</span> :
                     <span>💳 Payer maintenant</span>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BANNIÈRE SUSPENSION
// ─────────────────────────────────────────────────────────────────────────────
function SuspendedBanner({ subscription, payStates, payUrls, onPay }) {
  const isTrialExpired = subscription.suspension_reason === 'trial_expired';
  const isCancelled    = subscription.status === 'cancelled';
  const renewalUrl     = subscription.metadata?.renewal_url;
  const renewalAmount  = subscription.metadata?.renewal_amount;

  return (
    <div className="overflow-hidden border-2 border-red-200 rounded-2xl">
      <div className="flex items-center gap-3 px-5 py-4 text-white bg-red-600">
        <span className="text-3xl shrink-0">🔒</span>
        <div>
          <p className="font-bold">
            {isCancelled ? 'Abonnement annulé' : isTrialExpired ? "Période d'essai terminée" : 'Abonnement expiré'}
          </p>
          <p className="text-red-200 text-sm mt-0.5">
            L'accès à votre espace entreprise est suspendu.
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 bg-red-50">
        {/* Lien de renouvellement auto (généré par AutoRenewSubscriptions) */}
        {renewalUrl && (
          <div className="flex items-center gap-3 p-3 border bg-amber-50 border-amber-200 rounded-xl">
            <span className="text-2xl shrink-0">🔗</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">Lien de renouvellement prêt</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Montant : {renewalAmount ? formatCFA(renewalAmount) : '…'} · Après paiement, rechargez cette page
              </p>
            </div>
            <a
              href={renewalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold text-white transition-colors rounded-lg bg-amber-600 hover:bg-amber-700 whitespace-nowrap"
            >
              Payer →
            </a>
          </div>
        )}

        <p className="text-sm font-medium text-gray-700">
          Choisissez votre cycle de facturation pour réactiver <strong>{subscription.company_name}</strong> :
        </p>

        {subscription.plan ? (
          <PaymentButtons
            plan={subscription.plan}
            payStates={payStates}
            payUrls={payUrls}
            onPay={onPay}
          />
        ) : (
          <p className="text-sm text-red-700">Cette formule n'existe plus : choisissez-en une autre dans l'onglet « Plans ».</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARTE PLAN
// ─────────────────────────────────────────────────────────────────────────────
function PlanCard({ plan, billing, onSubscribe, currentPlanSlug, hasSubscription, isPopular }) {
  const c        = getPalette(plan.slug);
  const perMonth = billing === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
  const isCurrent = currentPlanSlug === plan.slug;

  return (
    <div className={`relative flex flex-col rounded-2xl border-2 bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${c.bg} ${c.border} ${isCurrent ? `ring-2 ring-offset-2 ${c.ring}` : ''}`}>
      <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full ${c.accent}`} />
      {(isPopular || isCurrent) && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow ${isCurrent ? 'bg-green-500' : 'bg-indigo-600'}`}>
            {isCurrent ? '✓ Plan actuel' : '⭐ Populaire'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 mb-1">
        <span className="text-2xl">{c.icon}</span>
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      </div>
      {plan.description && <p className="mb-4 text-sm leading-relaxed text-gray-500">{plan.description}</p>}
      <div className="mb-1">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-extrabold ${c.text}`}>{formatCFA(perMonth)}</span>
          <span className="text-sm text-gray-400">/mois</span>
        </div>
        <div className="h-5 mt-1">
          {billing === 'yearly' && <p className="text-xs font-semibold text-green-600">📦 {formatCFA(plan.price_yearly)}/an · 2 mois offerts</p>}
        </div>
      </div>
      <div className="h-px my-4 bg-gray-200" />
      <div className="flex-1 mb-6 space-y-2">
        <Feature label={!plan.max_products || plan.max_products >= 999 ? 'Produits illimités' : `Jusqu'à ${plan.max_products} produits`} />
        <Feature label={`Commission : ${plan.commission_rate ?? 5}%`} />
        <Feature label={!plan.max_users || plan.max_users >= 999 ? 'Utilisateurs illimités' : `${plan.max_users} compte${plan.max_users > 1 ? 's' : ''} admin`} />
        {plan.priority_support  && <Feature label="Support prioritaire" />}
        {plan.dedicated_account && <Feature label="Gestionnaire dédié" />}
        {(plan.features || []).map((f, i) => <Feature key={i} label={f} />)}
      </div>
      <button
        onClick={() => onSubscribe(plan)}
        disabled={isCurrent}
        className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${isCurrent ? 'bg-gray-300 cursor-not-allowed text-gray-500' : `${c.btn} hover:shadow-md shadow-sm`}`}
      >
        {isCurrent ? '✓ Plan actuel' : hasSubscription ? 'Choisir ce plan' : "Démarrer l'essai gratuit"}
      </button>
      <p className="mt-2 text-xs text-center text-gray-400">
        {hasSubscription ? 'Le nouveau tarif s\u2019applique au prochain paiement' : '14 jours gratuits · sans engagement'}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALE SOUSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────
function SubscribeModal({ plan, billing, onClose, onSuccess }) {
  const c = getPalette(plan.slug);
  const [cycle,   setCycle]   = useState(billing);
  const [form,    setForm]    = useState({ company_name:'', company_email:'', company_phone:'', company_address:'' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.company_name.trim()) return setErrors({ company_name:'Le nom est requis.' });
    setLoading(true);
    try {
      const res = await api.post('/subscriptions', { plan_slug: plan.slug, billing_cycle: cycle, ...form });
      onSuccess(res.data);
    } catch (e) {
      setErrors(e.response?.data?.errors ?? { general: e.response?.data?.message || 'Erreur.' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl">
        <div className={`bg-gradient-to-br ${c.bg} border-b ${c.border} px-6 py-5`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{c.icon} Plan {plan.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">14 jours gratuits · Annulable à tout moment</p>
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 text-xl text-gray-500 rounded-full hover:bg-black/10">×</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ value:'monthly', label:'📅 Mensuel', price:`${formatCFA(plan.price_monthly)}/mois` },
              { value:'yearly',  label:'📆 Annuel',  price:`${formatCFA(plan.price_yearly)}/an · −17%` }]
            .map(opt => (
              <button key={opt.value} onClick={() => setCycle(opt.value)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${cycle === opt.value ? `${c.border} ${c.badge} border-2` : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}>
                <span>{opt.label}</span>
                <span className={`text-xs font-bold mt-0.5 ${cycle === opt.value ? c.text : 'text-gray-400'}`}>{opt.price}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {errors.general && <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">{errors.general}</div>}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Nom de l'entreprise <span className="text-red-500">*</span></label>
            <input autoFocus className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ex : Groupe Scolaire Alpha" value={form.company_name}
              onChange={e => set('company_name', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            {errors.company_name && <p className="mt-1 text-xs text-red-500">{errors.company_name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="contact@entreprise.com" value={form.company_email} onChange={e => set('company_email', e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Téléphone</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="+225 07 00 00 00" value={form.company_phone} onChange={e => set('company_phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Adresse</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Cocody, Abidjan" value={form.company_address} onChange={e => set('company_address', e.target.value)} />
          </div>
          <div className={`bg-gradient-to-r ${c.bg} border ${c.border} rounded-xl p-3 flex justify-between items-center`}>
            <div>
              <p className="text-sm font-semibold text-gray-800">Plan {plan.name} · {cycle === 'yearly' ? 'Annuel' : 'Mensuel'}</p>
              <p className="text-xs text-green-600 mt-0.5">✓ 14 jours gratuits, sans engagement</p>
            </div>
            <span className={`text-lg font-extrabold ${c.text}`}>
              {cycle === 'yearly' ? `${formatCFA(plan.price_yearly)}/an` : `${formatCFA(plan.price_monthly)}/mois`}
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={handleSubmit} disabled={loading}
              className={`flex-1 ${c.btn} text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2`}>
              {loading ? <><span className="animate-spin">⏳</span> Création…</> : "Démarrer l'essai →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTIONNAIRE MEMBRES
// ─────────────────────────────────────────────────────────────────────────────
function MemberManager({ subscription, onUpdate }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const members  = subscription.members || [];
  const maxUsers = subscription.plan?.max_users;
  const unlimited = !maxUsers || maxUsers >= 999;
  const full     = !unlimited && members.length >= maxUsers;
  const pct      = unlimited ? 0 : Math.min(100, (members.length / maxUsers) * 100);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post(`/subscriptions/${subscription.id}/members`, { email: email.trim() });
      setSuccess(`${email.trim()} ajouté avec succès !`);
      setEmail('');
      onUpdate();
    } catch (e) { setError(e.response?.data?.message || 'Erreur.'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id) => {
    if (!confirm('Retirer ce membre ?')) return;
    try { await api.delete(`/subscriptions/${subscription.id}/members/${id}`); onUpdate(); }
    catch (e) { alert(e.response?.data?.message || 'Erreur.'); }
  };

  return (
    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">👥 Membres de l'équipe</h3>
        <span className="px-3 py-1 text-sm font-semibold text-indigo-700 border border-indigo-100 rounded-full bg-indigo-50">
          {members.length} / {unlimited ? '∞' : maxUsers}
        </span>
      </div>
      {!unlimited && (
        <div className="mb-4">
          <div className="h-2 overflow-hidden bg-gray-100 rounded-full">
            <div className={`h-full rounded-full transition-all ${full ? 'bg-red-400' : 'bg-indigo-400'}`} style={{ width: `${pct}%` }} />
          </div>
          {full && <p className="text-xs text-red-500 mt-1.5 font-medium">Limite atteinte — passez à un plan supérieur.</p>}
        </div>
      )}
      {!full && (
        <div className="flex gap-2 mb-4">
          <input type="email" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="email@employe.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd} disabled={loading || !email.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? '…' : 'Ajouter'}
          </button>
        </div>
      )}
      {error   && <p className="p-2 mb-3 text-xs text-red-500 rounded-lg bg-red-50">❌ {error}</p>}
      {success && <p className="p-2 mb-3 text-xs text-green-600 rounded-lg bg-green-50">✓ {success}</p>}
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="py-8 text-center"><p className="mb-2 text-3xl">👤</p><p className="text-sm text-gray-400">Aucun membre pour l'instant.</p></div>
        ) : members.map(m => {
          const u = m.user;
          const init = (u?.prenom?.[0] || u?.name?.[0] || '?').toUpperCase();
          return (
            <div key={m.id} className="flex items-center justify-between p-3 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center text-sm font-bold text-indigo-700 bg-indigo-100 rounded-full w-9 h-9 shrink-0">{init}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{u?.prenom} {u?.name}</p>
                  <p className="text-xs text-gray-400">{u?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${m.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.role === 'admin' ? '👑 Admin' : 'Membre'}
                </span>
                <button onClick={() => handleRemove(m.id)}
                  className="flex items-center justify-center font-bold text-red-400 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50 w-7 h-7">×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE MENSUEL/ANNUEL
// ─────────────────────────────────────────────────────────────────────────────
function BillingToggle({ value, onChange }) {
  return (
    <div className="flex justify-center mb-10">
      <div className="relative flex p-1 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="absolute transition-all duration-300 bg-indigo-600 shadow top-1 bottom-1 rounded-xl"
          style={{ width:'calc(50% - 4px)', left: value === 'monthly' ? '4px' : 'calc(50%)' }} />
        {[{ v:'monthly', label:'Mensuel' }, { v:'yearly', label:<>Annuel <span className="ml-1 text-xs font-bold text-green-400">−17%</span></> }].map(opt => (
          <button key={opt.v} onClick={() => onChange(opt.v)}
            className={`relative z-10 px-7 py-2.5 rounded-xl text-sm font-semibold transition-colors ${value === opt.v ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {[1,2,3].map(i => (
        <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl animate-pulse">
          <div className="w-1/2 h-4 mb-3 bg-gray-200 rounded"/><div className="w-3/4 h-8 mb-6 bg-gray-200 rounded"/>
          {[1,2,3,4].map(j => <div key={j} className="w-full h-3 mb-2 bg-gray-100 rounded"/>)}
          <div className="mt-4 bg-gray-200 h-11 rounded-xl"/>
        </div>
      ))}
    </div>
  );
}

const FAQ = [
  { q:'Les particuliers doivent-ils payer ?', a:"Non. L'accès est 100% gratuit pour les individus. Les abonnements sont réservés aux entreprises gérant une librairie." },
  { q:"Comment fonctionne l'essai gratuit ?", a:'14 jours complets sans engagement ni carte bancaire. Toutes les fonctionnalités du plan incluses.' },
  { q:"Que se passe-t-il à la fin de l'essai ?", a:"Le compte est suspendu. Vos données sont conservées. Réactivez à tout moment en choisissant un cycle." },
  { q:'Comment annuler ?', a:"Depuis votre dashboard, à tout moment. Vous conservez l'accès jusqu'à la fin de la période payée." },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [plans,          setPlans]          = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [billing,        setBilling]        = useState('monthly');
  const [tab,            setTab]            = useState('plans');
  const [selectedPlan,   setSelectedPlan]   = useState(null);
  const [cancelling,     setCancelling]     = useState(false);
  const [changingPlan,   setChangingPlan]   = useState(null);
  const [notice,         setNotice]         = useState(null); // { type: 'success'|'error'|'info', text }

  // ── Chargement ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const reqs = [api.get('/subscription-plans')];
      if (user) reqs.push(api.get('/subscriptions/my'));
      const [plansRes, subRes] = await Promise.all(reqs);
      setPlans(plansRes.data || []);
      if (subRes) {
        const sub = subRes.data?.subscription ?? null;
        setMySubscription(sub);
        if (sub) setTab('dashboard');
      }
    } catch { setPlans([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Paiement (mensuel / annuel indépendants) ───────────────────────────────
  const { states: payStates, payUrls, error: payError, pay: handlePay } = useSubscriptionPayment(mySubscription?.id, {
    onPaid: () => {
      setNotice({ type: 'success', text: '✅ Paiement confirmé : votre abonnement est actif.' });
      // Recharge l'abonnement ET l'utilisateur (débloque l'app si elle était bloquée)
      setTimeout(() => { fetchData(); refreshUser(); }, 1500);
    },
  });

  // ── Choix d'un plan : essai (1re fois) ou changement de plan ───────────────
  const handleChoosePlan = async (plan) => {
    if (!user) return navigate('/login');
    if (!mySubscription) return setSelectedPlan(plan);

    setChangingPlan(plan.slug);
    setNotice(null);
    try {
      const res = await api.put(`/subscriptions/${mySubscription.id}/change-plan`, { plan_slug: plan.slug, billing_cycle: billing });
      setNotice({ type: 'success', text: res.data?.message || 'Plan mis à jour.' });
      await fetchData();
      setTab('dashboard');
    } catch (e) {
      setNotice({ type: 'error', text: e.response?.data?.message || 'Impossible de changer de plan.' });
    } finally {
      setChangingPlan(null);
    }
  };

  // ── Annulation ─────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    const keepsAccess = mySubscription.status === 'active';
    const msg = keepsAccess
      ? "Annuler votre abonnement ?\nVous conserverez l'accès jusqu'à la fin de la période payée."
      : "Annuler votre abonnement ?\nL'accès à votre espace entreprise sera coupé immédiatement.";
    if (!confirm(msg)) return;

    setCancelling(true);
    try {
      const res = await api.post(`/subscriptions/${mySubscription.id}/cancel`);
      setNotice({ type: 'info', text: res.data?.message || 'Abonnement annulé.' });
      await fetchData();
      refreshUser();
    } catch (e) {
      setNotice({ type: 'error', text: e.response?.data?.message || 'Erreur lors de l\u2019annulation.' });
    } finally { setCancelling(false); }
  };

  const popularIdx = plans.length > 1 ? Math.floor((plans.length - 1) / 1.5) : -1;

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8f3]">

      {/* ── HERO ── */}
      <div className="relative px-4 py-16 overflow-hidden text-white bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage:'radial-gradient(circle at 15% 60%, #c9933a 0%, transparent 50%), radial-gradient(circle at 85% 20%, #6366f1 0%, transparent 50%)' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-4 text-5xl">🏢</div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight" style={{ fontFamily:'Playfair Display, Georgia, serif' }}>
            Solutions Entreprise
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-300">
            Gérez votre librairie, bénéficiez de réductions exclusives et d'un support dédié.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mt-7 text-slate-300">
            {['14 jours gratuits','Sans engagement','Particuliers toujours gratuits'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><span className="text-green-400">✅</span> {t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl px-4 py-10 mx-auto">

        {/* ── MESSAGES ── */}
        {(notice || payError) && (
          <div className={`mb-6 p-4 rounded-2xl border text-sm flex items-start justify-between gap-3
            ${payError || notice?.type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
              : notice?.type === 'success' ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <span>{payError || notice?.text}</span>
            {notice && !payError && (
              <button type="button" onClick={() => setNotice(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
            )}
          </div>
        )}

        {/* ── TABS ── */}
        {mySubscription && (
          <div className="flex gap-2 mb-8">
            {[{ id:'plans', label:'📋 Plans' }, { id:'dashboard', label:'⚙️ Mon abonnement' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── BANNER VISITEUR ── */}
        {!user && (
          <div className="flex items-start gap-4 p-5 mb-8 border bg-emerald-50 border-emerald-200 rounded-2xl">
            <span className="text-3xl shrink-0">🎁</span>
            <div>
              <p className="font-bold text-emerald-800">Utilisateurs individuels — Accès 100% gratuit</p>
              <p className="mt-1 text-sm text-emerald-700">
                Les abonnements sont réservés aux entreprises.{' '}
                <Link to="/register" className="font-bold underline">Créer un compte →</Link>
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════ DASHBOARD ══════════════════ */}
        {tab === 'dashboard' && mySubscription && (() => {
          const c           = getPalette(mySubscription.plan?.slug);
          const isSuspended = ['suspended', 'cancelled'].includes(mySubscription.status);
          const isTrial     = mySubscription.status === 'trial';
          const isActive    = mySubscription.status === 'active';
          const endsAt      = mySubscription.current_period_end ? new Date(mySubscription.current_period_end) : null;
          const daysLeft    = endsAt ? Math.ceil((endsAt - Date.now()) / 86_400_000) : null;
          const cancelPlanned = isActive && !!mySubscription.cancelled_at;
          const canRenewEarly = isActive && (cancelPlanned || (daysLeft !== null && daysLeft <= 7));

          return (
            <div className="space-y-6">

              {/* Suspension */}
              {isSuspended && (
                <SuspendedBanner
                  subscription={mySubscription}
                  payStates={payStates}
                  payUrls={payUrls}
                  onPay={handlePay}
                />
              )}

              {/* Carte principale */}
              <div className={`rounded-2xl border-2 bg-gradient-to-br ${c.bg} ${c.border} p-6 shadow-sm`}>
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-2xl">{c.icon}</span>
                      <h2 className="text-xl font-bold text-gray-900 truncate">{mySubscription.company_name}</h2>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${(STATUS_CFG[mySubscription.status] || STATUS_CFG.cancelled).cls}`}>
                        {(STATUS_CFG[mySubscription.status] || STATUS_CFG.cancelled).label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Plan : <strong className="text-gray-900">{mySubscription.plan?.name}</strong>
                      {' · '}<span className="capitalize">{mySubscription.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}</span>
                    </p>
                    <div className="mt-2">
                      {isTrial      && mySubscription.trial_ends_at        && <ExpiryCountdown endDate={mySubscription.trial_ends_at} />}
                      {isActive && mySubscription.current_period_end && <ExpiryCountdown endDate={mySubscription.current_period_end} />}
                    </div>
                    {cancelPlanned && endsAt && (
                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        Annulation programmée : accès conservé jusqu'au {endsAt.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}.
                        Un nouveau paiement annule la résiliation.
                      </p>
                    )}
                  </div>

                  {/* Actions droite */}
                  <div className="flex flex-col w-full gap-2 sm:w-56 shrink-0">
                    {/* Boutons de paiement sur l'essai (INDÉPENDANTS) */}
                    {(isTrial || canRenewEarly) && mySubscription.plan && (
                      <PaymentButtons
                        plan={mySubscription.plan}
                        payStates={payStates}
                        payUrls={payUrls}
                        onPay={handlePay}
                        title={isTrial ? 'Activer maintenant' : 'Renouveler maintenant'}
                      />
                    )}

                    <button onClick={() => setTab('plans')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      Changer de plan
                    </button>

                    {(isTrial || (isActive && !cancelPlanned)) && (
                      <button onClick={handleCancel} disabled={cancelling}
                        className="w-full border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                        {cancelling ? '⏳ Annulation…' : "Annuler l'abonnement"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-5 mt-6 border-t sm:grid-cols-5 border-black/5">
                  {[
                    { icon:'📦', label:'Produits',    value: !mySubscription.plan?.max_products || mySubscription.plan?.max_products >= 999 ? 'Illimité' : `${mySubscription.plan?.max_products} max` },
                    { icon:'💳', label:'Commission',  value: `${mySubscription.plan?.commission_rate ?? 5}%` },
                    { icon:'👥', label:'Comptes',     value: !mySubscription.plan?.max_users || mySubscription.plan?.max_users >= 999 ? 'Illimité' : `${mySubscription.members?.length ?? 0}/${mySubscription.plan?.max_users}` },
                    { icon:'🗓', label:'Facturation', value: mySubscription.billing_cycle === 'yearly' ? 'Annuelle' : 'Mensuelle' },
                    { icon:'📞', label:'Support',     value: mySubscription.plan?.priority_support ? 'Prioritaire' : 'Standard' },
                  ].map(s => (
                    <div key={s.label} className="p-3 text-center bg-white/60 rounded-xl">
                      <div className="mb-1 text-xl">{s.icon}</div>
                      <div className="text-xs font-bold text-gray-800 truncate">{s.value}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Membres */}
              {!isSuspended
                ? <MemberManager subscription={mySubscription} onUpdate={fetchData} />
                : <div className="p-8 text-center border border-gray-200 bg-gray-50 rounded-2xl opacity-60">
                    <p className="mb-2 text-3xl">🔒</p>
                    <p className="text-sm text-gray-500">Gestion des membres désactivée pendant la suspension.</p>
                  </div>
              }
            </div>
          );
        })()}

        {/* ══════════════════ PLANS ══════════════════ */}
        {tab === 'plans' && (
          <>
            <BillingToggle value={billing} onChange={setBilling} />
            {loading ? <PlanSkeleton /> :
             plans.length === 0 ? (
              <div className="py-24 text-center">
                <p className="mb-4 text-5xl">📭</p>
                <p className="text-lg font-semibold text-gray-500">Aucun plan disponible pour le moment.</p>
                <p className="mt-2 text-sm text-gray-400">Revenez bientôt ou contactez-nous.</p>
              </div>
             ) : (
              <div className={`grid grid-cols-1 gap-6 ${plans.length === 1 ? 'max-w-xs mx-auto' : plans.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' : 'sm:grid-cols-3'}`}>
                {plans.map((plan, i) => (
                  <PlanCard key={plan.id} plan={plan} billing={billing}
                    isPopular={i === popularIdx && plans.length > 1}
                    currentPlanSlug={changingPlan ? null : mySubscription?.plan?.slug}
                    hasSubscription={!!mySubscription}
                    onSubscribe={handleChoosePlan} />
                ))}
              </div>
             )}

            {!loading && plans.length > 0 && (
              <div className="mt-14">
                <h2 className="mb-6 text-xl font-bold text-center text-gray-800">Questions fréquentes</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {FAQ.map((item, i) => (
                    <div key={i} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
                      <h4 className="mb-2 text-sm font-semibold text-gray-800">❓ {item.q}</h4>
                      <p className="text-sm leading-relaxed text-gray-500">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODALE ── */}
      {selectedPlan && (
        <SubscribeModal plan={selectedPlan} billing={billing} onClose={() => setSelectedPlan(null)}
          onSuccess={data => {
            setMySubscription(data.subscription);
            setSelectedPlan(null);
            setTab('dashboard');
            setNotice({ type: data.requires_payment ? 'info' : 'success', text: data.message });
            refreshUser(); // account_type / accès mis à jour
          }} />
      )}
    </div>
  );
}