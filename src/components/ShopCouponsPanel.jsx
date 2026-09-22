import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { showToast } from './Toast';
import { formatCFA } from '../utils/currency';

const EMPTY = { code: '', description: '', type: 'percentage', value: '', min_order: '', usage_limit: '', expires_at: '' };

/**
 * Coupons de la librairie (plans Professionnel et Premium).
 * Un coupon ne s'applique qu'aux articles de la librairie, et la remise est
 * déduite de son versement. Pas de livraison gratuite (frais de la plateforme).
 */
export default function ShopCouponsPanel({ allowed, isSuperAdmin }) {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(() => {
    api.get('/admin/coupons').then(r => setCoupons(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        description: form.description || null,
        type: form.type,
        value: Number(form.value),
        min_order: form.min_order === '' ? null : Number(form.min_order),
        usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
        expires_at: form.expires_at || null,
      };
      await api.post('/admin/coupons', payload);
      showToast('Coupon créé ✓', 'success');
      setForm(EMPTY);
      load();
    } catch (err) {
      const errors = err.response?.data?.errors;
      showToast(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Erreur'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c) => {
    try {
      await api.put(`/admin/coupons/${c.id}`, { is_active: !c.is_active });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const remove = async (c) => {
    if (!confirm(`Supprimer le coupon ${c.code} ?`)) return;
    try {
      await api.delete(`/admin/coupons/${c.id}`);
      setCoupons(list => list.filter(x => x.id !== c.id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  return (
    <div className="p-6 mt-10 bg-white border shadow-sm rounded-xl">
      <h2 className="mb-1 text-lg font-bold">🏷️ Codes promo de la librairie</h2>
      <p className="mb-4 text-xs text-gray-500">
        {isSuperAdmin
          ? 'Les coupons créés ici par le super admin sont valables sur tout le panier (coupons plateforme).'
          : "Un code ne s'applique qu'à vos articles ; la remise est déduite de votre versement."}
      </p>

      {allowed && (
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-3">
          <input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="CODE (ex. RENTREE10)" maxLength={30}
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (FCFA)</option>
          </select>
          <input required type="number" min="0" max={form.type === 'percentage' ? 100 : undefined}
            value={form.value} onChange={e => set('value', e.target.value)}
            placeholder={form.type === 'percentage' ? 'Remise en %' : 'Remise en FCFA'}
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input type="number" min="0" value={form.min_order} onChange={e => set('min_order', e.target.value)}
            placeholder="Minimum d'achat chez vous (FCFA)"
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input type="number" min="1" value={form.usage_limit} onChange={e => set('usage_limit', e.target.value)}
            placeholder="Nombre d'utilisations max"
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Description (facultatif)" className="px-3 py-2 text-sm border rounded-lg md:col-span-2" />
          <button type="submit" disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Création…' : '➕ Créer le coupon'}
          </button>
        </form>
      )}

      {coupons.length === 0 ? (
        <p className="py-4 text-sm text-center text-gray-400">Aucun coupon.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-left text-gray-500 border-b">
                <th className="py-2">Code</th><th>Remise</th><th>Minimum</th><th>Utilisations</th><th>Expire</th><th>Statut</th><th />
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 font-mono font-semibold">{c.code}</td>
                  <td>{c.type === 'percentage' ? `${Number(c.value)} %` : c.type === 'fixed' ? formatCFA(c.value) : 'Livraison offerte'}</td>
                  <td>{Number(c.min_order) > 0 ? formatCFA(c.min_order) : '—'}</td>
                  <td>{c.usage_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                  <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <button type="button" onClick={() => toggle(c)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="text-right">
                    <button type="button" onClick={() => remove(c)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
