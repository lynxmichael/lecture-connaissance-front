import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import useSubscriptionPayment from '../hooks/useSubscriptionPayment';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n ?? 0) + ' XOF';

const REASONS = {
  trial_expired:    { title: "Votre essai gratuit est terminé",  text: "Choisissez un cycle de paiement pour continuer à utiliser votre espace." },
  payment_overdue:  { title: 'Votre abonnement a expiré',        text: 'Renouvelez-le pour retrouver immédiatement votre accès.' },
  awaiting_payment: { title: 'Paiement en attente',              text: "L'essai gratuit a déjà été utilisé : réglez le premier paiement pour activer votre abonnement." },
  admin:            { title: 'Accès suspendu',                   text: "Votre compte a été suspendu par l'administrateur. Vous pouvez régler votre abonnement ou contacter le support." },
  cancelled:        { title: 'Abonnement annulé',                text: 'Réactivez-le à tout moment en choisissant un cycle de paiement.' },
  none:             { title: 'Aucun abonnement',                 text: "Choisissez une formule pour activer votre espace libraire." },
};

function CycleBtn({ cycle, icon, label, price, badge, state: s, busyCycle, payUrl, onPay }) {
  const isBusy   = s === 'loading' || s === 'waiting';
  const isPaid   = s === 'paid';
  const disabled = isPaid || (busyCycle && busyCycle !== cycle) || isBusy;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${isBusy ? 'border-blue-400 ring-2 ring-blue-200' : isPaid ? 'border-green-400' : 'border-gray-200'} ${busyCycle && busyCycle !== cycle ? 'opacity-40' : ''}`}>
      <div className={`px-4 py-3 flex items-center justify-between text-white font-bold
        ${isPaid ? 'bg-green-500' : isBusy ? 'bg-blue-500' : cycle === 'monthly' ? 'bg-amber-600' : 'bg-slate-800'}`}>
        <span>{icon} {label}</span>
        {badge && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{badge}</span>}
        {isBusy && <span className="text-xs animate-pulse">●</span>}
      </div>
      <div className="px-4 py-2 text-center bg-gray-50">
        <span className="text-lg font-extrabold text-gray-900">{price}</span>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onPay(cycle)}
        disabled={disabled}
        className={`w-full py-3 text-sm font-bold transition-all disabled:cursor-not-allowed
          ${isPaid ? 'bg-green-50 text-green-600' :
            isBusy ? 'bg-blue-50 text-blue-500 animate-pulse' :
            s === 'failed' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                     'bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 active:scale-95'}`}
      >
        {isPaid          ? '✅ Paiement confirmé ! Déblocage…' :
         s === 'loading' ? '⏳ Initialisation…' :
         s === 'waiting' ? '📱 Validez le paiement…' :
         s === 'failed'  ? '↩ Réessayer' :
                           '💳 Payer maintenant'}
      </button>
      {payUrl && (
        <a href={payUrl} target="_blank" rel="noopener noreferrer"
          className="block px-3 py-2 text-xs font-semibold text-center text-blue-700 underline border-t border-blue-100 bg-blue-50">
          Votre navigateur a bloqué la fenêtre : ouvrir la page de paiement →
        </a>
      )}
    </div>
  );
}

/**
 * Écran plein écran affiché à un libraire dont l'abonnement n'est plus actif.
 * Seules actions possibles : payer / changer de formule / se déconnecter.
 *
 * Avant : si l'abonnement n'était pas trouvé (annulé, plan supprimé…),
 * l'écran renvoyait vers /entreprise… qui réaffichait ce même écran
 * → aucune sortie possible. /entreprise est désormais accessible (App.jsx).
 */
export default function SuspendedScreen({ user, onRenewed }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [loadingSub,   setLoadingSub]   = useState(true);
  const [loadError,    setLoadError]    = useState(false);

  const load = useCallback(async () => {
    setLoadingSub(true);
    setLoadError(false);
    try {
      const r = await api.get('/subscriptions/my');
      setSubscription(r.data?.subscription ?? null);
    } catch {
      setLoadError(true);
    } finally {
      setLoadingSub(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { states, payUrls, error, pay } = useSubscriptionPayment(subscription?.id, {
    // Paiement confirmé → on recharge l'utilisateur, l'app se débloque
    onPaid: () => setTimeout(() => onRenewed?.(), 1500),
  });

  const reasonKey = !subscription
    ? 'none'
    : subscription.status === 'cancelled'
      ? 'cancelled'
      : (REASONS[subscription.suspension_reason] ? subscription.suspension_reason : 'payment_overdue');
  const reason = REASONS[reasonKey];
  const plan   = subscription?.plan;
  const busyCycle = Object.keys(states).find(c => states[c] === 'loading' || states[c] === 'waiting');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    // Plein écran — aucune interaction avec l'app dessous
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #ef4444, transparent 60%), radial-gradient(circle at 70% 30%, #6366f1, transparent 60%)' }} />

      <div className="relative w-full max-w-md my-auto">
        <div className="overflow-hidden bg-white shadow-2xl rounded-3xl">

          <div className="px-6 py-8 text-center text-white bg-gradient-to-br from-red-500 to-red-700">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <span className="text-4xl">🔒</span>
            </div>
            <h1 className="text-xl font-extrabold">{reason.title}</h1>
            <p className="mt-2 text-sm text-red-100">
              Bonjour <strong className="text-white">{user?.prenom} {user?.name}</strong>, {reason.text.charAt(0).toLowerCase() + reason.text.slice(1)}
            </p>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div className="p-4 border bg-amber-50 border-amber-200 rounded-2xl">
              <p className="mb-1 text-sm font-semibold text-amber-800">✅ Vos données sont en sécurité</p>
              <p className="text-xs leading-relaxed text-amber-700">
                Produits, commandes, stocks et historique sont conservés.
                L'accès complet est rétabli dès la confirmation du paiement.
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">{error}</div>
            )}

            {loadingSub ? (
              <div className="py-6 text-sm text-center text-gray-400 animate-pulse">Chargement…</div>
            ) : loadError ? (
              <div className="py-4 space-y-3 text-center">
                <p className="text-sm text-gray-500">Impossible de charger votre abonnement.</p>
                <button type="button" onClick={load} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
                  Réessayer
                </button>
              </div>
            ) : subscription && plan ? (
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                  {subscription.company_name} · formule {plan.name}
                </p>
                <CycleBtn cycle="monthly" icon="📅" label="Mensuel" price={`${fmt(plan.price_monthly)}/mois`}
                  state={states.monthly} busyCycle={busyCycle} payUrl={payUrls.monthly} onPay={pay} />
                <CycleBtn cycle="yearly" icon="📆" label="Annuel" price={`${fmt(plan.price_yearly)}/an`} badge="−17%"
                  state={states.yearly} busyCycle={busyCycle} payUrl={payUrls.yearly} onPay={pay} />
                <button type="button" onClick={() => navigate('/entreprise')} disabled={!!busyCycle}
                  className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40">
                  Changer de formule →
                </button>
              </div>
            ) : (
              <div className="py-2 space-y-3 text-center">
                <p className="text-sm text-gray-500">
                  {subscription ? "La formule de votre abonnement n'est plus disponible." : 'Aucun abonnement associé à ce compte.'}
                </p>
                <button type="button" onClick={() => navigate('/entreprise')}
                  className="w-full py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
                  Choisir une formule →
                </button>
              </div>
            )}

            <div className="h-px bg-gray-100" />

            <button type="button" onClick={handleLogout}
              className="w-full py-2 text-sm text-gray-400 transition-colors hover:text-gray-600">
              Se déconnecter
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-center text-slate-400">
          Lecture & Connaissance · Support : contact@lecture-connaissance.ci
        </p>
      </div>
    </div>
  );
}
