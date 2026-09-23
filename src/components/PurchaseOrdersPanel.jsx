import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { showToast } from './Toast';
import { formatCFA } from '../utils/currency';
import { downloadBusinessDocument } from '../utils/pdfDocuments';

const INPUT = 'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';
const EMPTY_LINE = { label: '', quantity: 1, unit_price: '' };
const EMPTY = {
  customer_name: '', customer_org: '', customer_email: '', customer_phone: '', customer_address: '',
  lines: [{ ...EMPTY_LINE }], discount: '', notes: '', valid_until: '',
};

const STATUS = {
  brouillon: { label: 'Brouillon', style: 'bg-gray-100 text-gray-600' },
  envoye:    { label: 'Envoyé',    style: 'bg-blue-50 text-blue-700' },
  accepte:   { label: 'Accepté',   style: 'bg-green-50 text-green-700' },
  refuse:    { label: 'Refusé',    style: 'bg-red-50 text-red-600' },
  facture:   { label: 'Facturé',   style: 'bg-[#c9933a]/10 text-[#8a6424]' },
};

/**
 * Bons de commande pour les clients professionnels (écoles, entreprises).
 * Plan Premium : création, envoi en PDF, puis conversion en facture numérotée.
 */
export default function PurchaseOrdersPanel({ allowed }) {
  const [orders, setOrders] = useState([]);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [open, setOpen]     = useState(false);

  const load = useCallback(() => {
    api.get('/admin/purchase-orders')
      .then(r => setOrders(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  if (!allowed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm border border-dashed rounded-xl border-[#c9933a]/50 bg-[#c9933a]/5 text-[#8a6424]">
        <span>🔒 Les bons de commande pour vos clients professionnels sont inclus dans le plan Premium.</span>
        <a href="/entreprise" className="font-semibold underline hover:text-[#c9933a]">Voir les plans →</a>
      </div>
    );
  }

  const setLine = (i, k, v) => setForm(f => ({ ...f, lines: f.lines.map((l, j) => j === i ? { ...l, [k]: v } : l) }));
  const addLine    = () => setForm(f => ({ ...f, lines: [...f.lines, { ...EMPTY_LINE }] }));
  const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, j) => j !== i) }));

  const total = form.lines.reduce((t, l) => t + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0) - (Number(form.discount) || 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/purchase-orders', {
        ...form,
        discount: form.discount === '' ? 0 : Number(form.discount),
        valid_until: form.valid_until || null,
        lines: form.lines.map(l => ({ label: l.label, quantity: Number(l.quantity), unit_price: Number(l.unit_price) })),
      });
      showToast('Bon de commande créé ✓', 'success');
      setForm(EMPTY); setOpen(false); load();
    } catch (err) {
      const errors = err.response?.data?.errors;
      showToast(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Erreur'), 'error');
    } finally { setSaving(false); }
  };

  const openPdf = async (po) => {
    try {
      const { data } = await api.get(`/admin/purchase-orders/${po.id}/document`);
      await downloadBusinessDocument(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Document indisponible', 'error');
    }
  };

  const toInvoice = async (po) => {
    if (!confirm(`Convertir le bon ${po.number} en facture ?`)) return;
    try {
      const { data } = await api.post(`/admin/purchase-orders/${po.id}/invoice`);
      await downloadBusinessDocument(data.invoice ?? data);
      showToast('Facture émise ✓', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const remove = async (po) => {
    if (!confirm(`Supprimer le bon ${po.number} ?`)) return;
    try { await api.delete(`/admin/purchase-orders/${po.id}`); load(); }
    catch (err) { showToast(err.response?.data?.message || 'Erreur', 'error'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold">📋 Bons de commande</h2>
          <p className="text-xs text-gray-500">Pour vos clients professionnels : écoles, entreprises, administrations.</p>
        </div>
        <button type="button" onClick={() => setOpen(o => !o)}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          {open ? 'Fermer' : '➕ Nouveau bon de commande'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="p-6 mb-8 bg-white border shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input required className={INPUT} placeholder="Nom du contact *" value={form.customer_name}
              onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
            <input className={INPUT} placeholder="Organisation (école, entreprise…)" value={form.customer_org}
              onChange={e => setForm(f => ({ ...f, customer_org: e.target.value }))} />
            <input className={INPUT} type="email" placeholder="Email" value={form.customer_email}
              onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} />
            <input className={INPUT} placeholder="Téléphone" value={form.customer_phone}
              onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
            <input className={`${INPUT} md:col-span-2`} placeholder="Adresse" value={form.customer_address}
              onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))} />
          </div>

          <h3 className="mt-6 mb-2 text-sm font-semibold">Articles</h3>
          {form.lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2">
              <input className={`${INPUT} col-span-6`} placeholder="Désignation" value={l.label}
                onChange={e => setLine(i, 'label', e.target.value)} />
              <input className={`${INPUT} col-span-2`} type="number" min="1" placeholder="Qté" value={l.quantity}
                onChange={e => setLine(i, 'quantity', e.target.value)} />
              <input className={`${INPUT} col-span-3`} type="number" min="0" placeholder="Prix unitaire" value={l.unit_price}
                onChange={e => setLine(i, 'unit_price', e.target.value)} />
              <button type="button" onClick={() => removeLine(i)} disabled={form.lines.length === 1}
                className="col-span-1 text-sm text-red-400 hover:text-red-600 disabled:opacity-30">✕</button>
            </div>
          ))}
          <button type="button" onClick={addLine} className="text-xs font-semibold text-blue-600 hover:underline">+ Ajouter une ligne</button>

          <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
            <input className={INPUT} type="number" min="0" placeholder="Remise (FCFA)" value={form.discount}
              onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
            <input className={INPUT} type="date" value={form.valid_until}
              onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
            <input className={INPUT} placeholder="Notes (conditions de règlement…)" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm font-semibold">Total : {formatCFA(Math.max(0, total))}</p>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Création…' : 'Créer le bon de commande'}
            </button>
          </div>
        </form>
      )}

      {orders.length === 0 ? (
        <p className="py-6 text-sm text-center text-gray-400">Aucun bon de commande.</p>
      ) : (
        <div className="overflow-x-auto bg-white border shadow-sm rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-left text-gray-500 border-b">
                <th className="p-3">Numéro</th><th>Client</th><th>Total</th><th>Validité</th><th>Statut</th><th />
              </tr>
            </thead>
            <tbody>
              {orders.map(po => {
                const st = STATUS[po.status] ?? STATUS.brouillon;
                const montant = (po.lines || []).reduce((t, l) => t + (l.quantity || 0) * (l.unit_price || 0), 0) - (po.discount || 0);
                return (
                  <tr key={po.id} className="border-b last:border-0">
                    <td className="p-3 font-mono font-semibold">{po.number}</td>
                    <td>{po.customer_org || po.customer_name}</td>
                    <td>{formatCFA(Math.max(0, montant))}</td>
                    <td>{po.valid_until ? new Date(po.valid_until).toLocaleDateString('fr-FR') : '—'}</td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.style}`}>{st.label}</span></td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => openPdf(po)} className="mr-3 text-xs text-blue-600 hover:underline">📄 PDF</button>
                      {po.status !== 'facture' && (
                        <button type="button" onClick={() => toInvoice(po)} className="mr-3 text-xs text-green-700 hover:underline">🧾 Facturer</button>
                      )}
                      <button type="button" onClick={() => remove(po)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                    </td>
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
