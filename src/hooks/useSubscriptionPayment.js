import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/client';

const POLL_EVERY_MS = 4000;
const POLL_MAX_MS   = 15 * 60 * 1000; // 15 minutes pour valider sur le téléphone

/**
 * Paiement / renouvellement d'un abonnement (mensuel ou annuel).
 *
 * Corrige les problèmes de l'ancienne version :
 *  - la fenêtre CinetPay était ouverte APRÈS un `await` → bloquée par le
 *    navigateur, l'écran restait sur « Validez sur mobile… » sans rien ouvrir.
 *    Elle est maintenant ouverte directement dans le clic, avec un lien de
 *    secours si le navigateur la bloque quand même ;
 *  - les intervalles de polling n'étaient jamais nettoyés (fuite + appels
 *    en double) ;
 *  - les erreurs étaient affichées via alert().
 *
 * @param {number|null} subscriptionId
 * @param {{ onPaid?: () => void }} options
 */
export default function useSubscriptionPayment(subscriptionId, { onPaid } = {}) {
  const [states,  setStates]  = useState({ monthly: 'idle', yearly: 'idle' }); // idle | loading | waiting | paid | failed
  const [payUrls, setPayUrls] = useState({ monthly: null, yearly: null });     // lien de secours si popup bloquée
  const [error,   setError]   = useState(null);

  const timers  = useRef({});
  const popups  = useRef({});
  const onPaidRef = useRef(onPaid);

  useEffect(() => { onPaidRef.current = onPaid; }, [onPaid]);

  // Nettoyage au démontage
  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  const setState = (cycle, value) => setStates(prev => ({ ...prev, [cycle]: value }));
  const setUrl   = (cycle, value) => setPayUrls(prev => ({ ...prev, [cycle]: value }));

  const closePopup = (cycle) => {
    try { popups.current[cycle]?.close(); } catch { /* fenêtre déjà fermée */ }
    popups.current[cycle] = null;
  };

  const poll = useCallback((cycle, transactionId) => {
    const startedAt = Date.now();

    const tick = async () => {
      try {
        const { data } = await api.get(`/subscription/payment-status/${transactionId}`);

        if (data.status === 'paid') {
          closePopup(cycle);
          setUrl(cycle, null);
          setState(cycle, 'paid');
          onPaidRef.current?.();
          return;
        }
        if (data.status === 'failed') {
          closePopup(cycle);
          setUrl(cycle, null);
          setState(cycle, 'failed');
          setError('Le paiement a été refusé ou annulé. Vous pouvez réessayer.');
          return;
        }
      } catch {
        // Erreur réseau passagère : on continue d'interroger
      }

      if (Date.now() - startedAt > POLL_MAX_MS) {
        setState(cycle, 'failed');
        setError("Aucune confirmation reçue. Si vous avez été débité, rechargez la page dans quelques minutes.");
        return;
      }
      timers.current[cycle] = setTimeout(tick, POLL_EVERY_MS);
    };

    timers.current[cycle] = setTimeout(tick, POLL_EVERY_MS);
  }, []);

  const pay = useCallback(async (cycle) => {
    if (!subscriptionId) return;
    const busy = Object.values(states).some(s => s === 'loading' || s === 'waiting');
    if (busy) return;

    setError(null);
    setUrl(cycle, null);
    clearTimeout(timers.current[cycle]);

    // Ouvrir la fenêtre MAINTENANT (pendant le clic) pour éviter le bloqueur de popups
    let popup = null;
    try {
      popup = window.open('', `CinetPay_${cycle}`, 'width=520,height=720,scrollbars=yes');
      popup?.document.write('<p style="font-family:sans-serif;padding:24px;color:#475569">Chargement du paiement sécurisé…</p>');
    } catch { popup = null; }

    setState(cycle, 'loading');

    try {
      const { data } = await api.post(`/subscription/${subscriptionId}/pay`, { billing_cycle: cycle });

      if (data.simulated || !data.payment_url) {
        // Mode simulation (tests en local) : pas de page CinetPay
        try { popup?.close(); } catch { /* ignore */ }
      } else if (popup && !popup.closed) {
        popup.location.href = data.payment_url;
        popups.current[cycle] = popup;
      } else {
        // Popup bloquée : on affiche un lien cliquable
        setUrl(cycle, data.payment_url);
      }

      setState(cycle, 'waiting');
      poll(cycle, data.transaction_id);
    } catch (e) {
      try { popup?.close(); } catch { /* ignore */ }
      setState(cycle, 'failed');
      setError(
        e.response?.data?.message
        || "Impossible de lancer le paiement. Vérifiez votre connexion et réessayez."
      );
    }
  }, [subscriptionId, states, poll]);

  return { states, payUrls, error, clearError: () => setError(null), pay };
}
