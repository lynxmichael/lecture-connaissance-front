import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatCFA } from '../utils/currency';
import { showToast } from './Toast';

const STATUS = {
  pending:    { label: 'À envoyer',   cls: 'bg-gray-100 text-gray-700' },
  processing: { label: 'En cours',    cls: 'bg-blue-100 text-blue-700' },
  sent:       { label: 'Versé',       cls: 'bg-green-100 text-green-700' },
  failed:     { label: 'Échec',       cls: 'bg-red-100 text-red-700' },
  on_hold:    { label: 'En attente',  cls: 'bg-amber-100 text-amber-800' },
  cancelled:  { label: 'Annulé',      cls: 'bg-gray-100 text-gray-400 line-through' },
};

const OPERATOR = { orange_money: 'Orange', mtn_money: 'MTN', moov_money: 'Moov', wave: 'Wave', manuel: 'Manuel' };

const mask = (phone) => (phone ? `${phone.slice(0, 2)} •• •• ${phone.slice(-4, -2)} ${phone.slice(-2)}` : '—');

/**
 * Versements reçus par le libraire pour ses ventes payées en ligne.
 * Super admin : tous les versements + relance / règlement manuel.
 */
export default function PayoutsPanel({ isSuperAdmin }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId,  setBusyId]  = useState(null);
  const [filter,  setFilter]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/payouts', { params: filter ? { status: filter } : {} });
      setData(r.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (payout, action) => {
    if (action === 'mark-paid' && !confirm(`Confirmer que ${formatCFA(payout.net_amount)} ont été réglés hors CinetPay ?`)) return;
    setBusyId(payout.id);
    try {
      const r = await api.post(`/super-admin/payouts/${payout.id}/${action}`);
      showToast(r.data?.message || 'OK', 'success');
      load();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !data) return <p className="py-10 text-center text-gray-400 animate-pulse">Chargement des versements…</p>;
  if (!data) return <p className="py-10 text-center text-red-500">Impossible de charger les versements.</p>;

  const { payouts, summary, payout_phone_configured } = data;

  return (
    <div className="space-y-6">
      {!isSuperAdmin && !payout_phone_configured && (
        <div className="flex items-start gap-3 p-4 border bg-amber-50 border-amber-200 rounded-xl">
          <span className="text-2xl">⚠️</span>
          <div className="text-sm">
            <p className="font-bold text-amber-800">Aucun numéro Mobile Money enregistré</p>
            <p className="text-amber-700">
              Vos ventes sont bien comptabilisées, mais l'argent reste en attente tant que vous n'avez pas indiqué
              de numéro. Il sera versé automatiquement dès que vous l'aurez ajouté.
            </p>
            <Link to="/profile" className="inline-block mt-2 font-semibold underline text-amber-900">Ajouter mon numéro →</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ['💸', 'Versé', summary.sent, 'text-green-700'],
          ['⏳', 'En cours', summary.in_progress, 'text-blue-700'],
          ['⚠️', 'En attente / échec', summary.on_hold, 'text-amber-700'],
          ['🏦', 'Commissions plateforme', summary.commission, 'text-gray-700'],
        ].map(([icon, label, value, cls]) => (
          <div key={label} className="p-4 bg-white border rounded-xl">
            <p className="text-xs text-gray-500">{icon} {label}</p>
            <p className={`text-xl font-bold ${cls}`}>{formatCFA(value)}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Pour chaque paiement client, vous recevez le montant de <strong>vos</strong> produits, diminué de votre part
        des remises globales (codes promo, points fidélité) et de la commission de votre formule. Les frais de livraison
        restent à la plateforme. Le virement part sur votre numéro Mobile Money, de préférence chez le même opérateur
        que le client.
      </p>

      <div className="flex flex-wrap gap-2">
        {[['', 'Tous'], ['sent', 'Versés'], ['processing', 'En cours'], ['on_hold', 'En attente'], ['failed', 'Échecs'], ['cancelled', 'Annulés']].map(([v, l]) => (
          <button key={v} type="button" onClick={() => setFilter(v)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${filter === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:border-blue-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {payouts.length === 0 ? (
        <p className="py-10 text-center text-gray-400">Aucun versement pour le moment.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-xs text-left text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Commande</th>
                {isSuperAdmin && <th className="px-3 py-2">Libraire</th>}
                <th className="px-3 py-2 text-right">Ventes</th>
                <th className="px-3 py-2 text-right">Remises</th>
                <th className="px-3 py-2 text-right">Commission</th>
                <th className="px-3 py-2 text-right">Net versé</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Destination</th>
                {isSuperAdmin && <th className="px-3 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => {
                const st = STATUS[p.status] || STATUS.pending;
                const canAct = ['failed', 'on_hold', 'pending'].includes(p.status);
                return (
                  <tr key={p.id} className="align-top border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{p.order?.numero_commande || `#${p.order_id ?? '—'}`}</td>
                    {isSuperAdmin && <td className="px-3 py-2">{p.owner ? `${p.owner.prenom} ${p.owner.name}` : '—'}</td>}
                    <td className="px-3 py-2 text-right">{formatCFA(p.gross_amount)}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{p.discount_share ? `−${formatCFA(p.discount_share)}` : '—'}</td>
                    <td className="px-3 py-2 text-right text-gray-500">−{formatCFA(p.commission_amount)} <span className="text-xs">({Number(p.commission_rate)}%)</span></td>
                    <td className="px-3 py-2 font-bold text-right">{formatCFA(p.net_amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                      {p.last_error && p.status !== 'sent' && <p className="mt-1 text-xs text-gray-500 max-w-[220px]">{p.last_error}</p>}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {p.operator ? `${OPERATOR[p.operator] || p.operator} · ${mask(p.phone)}` : '—'}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-3 py-2 whitespace-nowrap">
                        {canAct && (
                          <div className="flex gap-2">
                            <button type="button" disabled={busyId === p.id} onClick={() => act(p, 'retry')}
                              className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-40">Relancer</button>
                            <button type="button" disabled={busyId === p.id} onClick={() => act(p, 'mark-paid')}
                              className="text-xs text-gray-500 hover:underline disabled:opacity-40">Réglé à la main</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
