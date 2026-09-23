import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { showToast } from './Toast';
import { formatCFA } from '../utils/currency';

/* Encadré affiché quand le plan n'inclut pas la fonctionnalité */
function Lock({ children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm border border-dashed rounded-xl border-[#c9933a]/50 bg-[#c9933a]/5 text-[#8a6424]">
      <span>🔒 {children}</span>
      <a href="/entreprise" className="font-semibold underline hover:text-[#c9933a]">Voir les plans →</a>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block mb-1 text-xs text-gray-500">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const INPUT = 'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

/**
 * Onglet « Ma librairie » :
 *  - facturation personnalisée (plans Professionnel et Premium)
 *  - programme de fidélité (Premium)
 *  - clés d'API (Premium)
 */
export default function ShopFeaturesPanel({ caps = {} }) {
  const [settings, setSettings] = useState(null);
  const [loyaltyStats, setLoyaltyStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [newToken, setNewToken] = useState(null);
  const [tokenName, setTokenName] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await api.get('/admin/shop-settings');
      setSettings(r.data.settings);
      setLoyaltyStats(r.data.loyalty);
    } catch { /* affiché par le toast de l'appel */ }
    if (caps.api_access) {
      try { setTokens((await api.get('/admin/api-tokens')).data || []); } catch { /* ignore */ }
    }
  }, [caps.api_access]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const save = async (keys) => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(keys.map(k => [k, settings[k]]));
      const r = await api.put('/admin/shop-settings', payload);
      setSettings(r.data.settings ?? settings);
      showToast('Réglages enregistrés ✓', 'success');
    } catch (err) {
      const errors = err.response?.data?.errors;
      showToast(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Erreur'), 'error');
    } finally { setSaving(false); }
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const r = await api.post('/admin/shop-settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings(s => ({ ...s, logo_url: r.data.logo_url ?? r.data.url ?? s.logo_url }));
      showToast('Logo mis à jour ✓', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Logo refusé', 'error');
    }
  };

  const createToken = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/admin/api-tokens', { name: tokenName.trim() });
      setNewToken(r.data);
      setTokenName('');
      setTokens((await api.get('/admin/api-tokens')).data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const revokeToken = async (id) => {
    if (!confirm('Révoquer cette clé ? Les outils qui l\'utilisent cesseront de fonctionner.')) return;
    try {
      await api.delete(`/admin/api-tokens/${id}`);
      setTokens(list => list.filter(t => t.id !== id));
      showToast('Clé révoquée', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  if (!settings) return <p className="py-10 text-sm text-center text-gray-400">Chargement…</p>;

  return (
    <div className="space-y-8">
      {/* ── Facturation personnalisée ─────────────────────────────────────── */}
      <section className="p-6 bg-white border shadow-sm rounded-xl">
        <h2 className="mb-1 text-lg font-bold">🧾 Facturation personnalisée</h2>
        <p className="mb-4 text-xs text-gray-500">
          Vos factures portent votre nom, vos couleurs et vos mentions légales. Le client peut les télécharger depuis sa commande.
        </p>

        {!caps.custom_invoicing ? (
          <Lock>La facturation personnalisée est incluse à partir du plan Professionnel.</Lock>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Préfixe de numérotation" hint="Exemple : LAWA donne LAWA-2026-0001">
                <input className={INPUT} maxLength={10} value={settings.invoice_prefix ?? ''}
                  onChange={e => set('invoice_prefix', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Couleur du document">
                <div className="flex items-center gap-3">
                  <input type="color" className="w-12 h-10 border rounded cursor-pointer"
                    value={settings.invoice_color || '#1e3a5f'} onChange={e => set('invoice_color', e.target.value)} />
                  <span className="font-mono text-sm text-gray-500">{settings.invoice_color}</span>
                </div>
              </Field>
              <Field label="Mentions légales" hint="RCCM, compte contribuable, régime fiscal…">
                <textarea rows={2} maxLength={500} className={INPUT} value={settings.invoice_legal ?? ''}
                  onChange={e => set('invoice_legal', e.target.value)} />
              </Field>
              <Field label="Pied de page" hint="Conditions de règlement, remerciements…">
                <textarea rows={2} maxLength={500} className={INPUT} value={settings.invoice_footer ?? ''}
                  onChange={e => set('invoice_footer', e.target.value)} />
              </Field>
              <Field label="Logo (PNG ou JPG)">
                <div className="flex items-center gap-3">
                  {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="object-contain w-16 h-12 border rounded bg-gray-50" />}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="text-xs"
                    onChange={e => uploadLogo(e.target.files?.[0])} />
                </div>
              </Field>
            </div>
            <button type="button" disabled={saving}
              onClick={() => save(['invoice_prefix', 'invoice_color', 'invoice_legal', 'invoice_footer'])}
              className="px-4 py-2 mt-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Enregistrement…' : 'Enregistrer la facturation'}
            </button>
          </>
        )}
      </section>

      {/* ── Programme de fidélité ─────────────────────────────────────────── */}
      <section className="p-6 bg-white border shadow-sm rounded-xl">
        <h2 className="mb-1 text-lg font-bold">🎁 Programme de fidélité</h2>
        <p className="mb-4 text-xs text-gray-500">
          À chaque palier d'achats chez vous, le client reçoit automatiquement un code de réduction personnel, valable
          uniquement sur vos articles. La remise est déduite de votre versement.
        </p>

        {!caps.loyalty ? (
          <Lock>Le programme de fidélité de la librairie est inclus dans le plan Premium.</Lock>
        ) : (
          <>
            {loyaltyStats && (
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                {[['Clients fidèles', loyaltyStats.members], ['Récompenses émises', loyaltyStats.rewards_issued], ['Récompenses utilisées', loyaltyStats.rewards_used]]
                  .map(([label, value]) => (
                    <div key={label} className="p-3 border bg-gray-50 rounded-xl">
                      <p className="text-lg font-bold text-gray-800">{value ?? 0}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
              </div>
            )}
            <label className="flex items-center gap-2 mb-4 text-sm font-medium">
              <input type="checkbox" checked={!!settings.loyalty_enabled}
                onChange={e => set('loyalty_enabled', e.target.checked)} />
              Activer le programme
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Palier d'achats (FCFA)" hint={`Une récompense par tranche de ${formatCFA(settings.loyalty_threshold || 0)} dépensés chez vous`}>
                <input type="number" min={1000} step={1000} className={INPUT} value={settings.loyalty_threshold ?? 50000}
                  onChange={e => set('loyalty_threshold', Number(e.target.value))} />
              </Field>
              <Field label="Type de récompense">
                <select className={`${INPUT} bg-white`} value={settings.loyalty_reward_type || 'percentage'}
                  onChange={e => set('loyalty_reward_type', e.target.value)}>
                  <option value="percentage">Pourcentage de remise</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </Field>
              <Field label={settings.loyalty_reward_type === 'fixed' ? 'Remise (FCFA)' : 'Remise (%)'}>
                <input type="number" min={1} className={INPUT} value={settings.loyalty_reward_value ?? 10}
                  onChange={e => set('loyalty_reward_value', Number(e.target.value))} />
              </Field>
              <Field label="Validité de la récompense (jours)">
                <input type="number" min={1} max={365} className={INPUT} value={settings.loyalty_validity_days ?? 60}
                  onChange={e => set('loyalty_validity_days', Number(e.target.value))} />
              </Field>
            </div>
            <button type="button" disabled={saving}
              onClick={() => save(['loyalty_enabled', 'loyalty_threshold', 'loyalty_reward_type', 'loyalty_reward_value', 'loyalty_validity_days'])}
              className="px-4 py-2 mt-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Enregistrement…' : 'Enregistrer le programme'}
            </button>
          </>
        )}
      </section>

      {/* ── Clés d'API ────────────────────────────────────────────────────── */}
      <section className="p-6 bg-white border shadow-sm rounded-xl">
        <h2 className="mb-1 text-lg font-bold">🔌 Intégration API</h2>
        <p className="mb-4 text-xs text-gray-500">
          Branchez vos outils métier sur l'API. Une clé donne les mêmes droits que votre compte : vos produits,
          vos commandes et vos statistiques, rien d'autre.
        </p>

        {!caps.api_access ? (
          <Lock>L'intégration API est incluse dans le plan Premium.</Lock>
        ) : (
          <>
            {newToken && (
              <div className="p-4 mb-4 text-sm border border-green-200 bg-green-50 rounded-xl">
                <p className="mb-2 font-semibold text-green-800">Copiez cette clé maintenant : elle ne sera plus affichée.</p>
                <code className="block p-2 overflow-x-auto font-mono text-xs bg-white border rounded">{newToken.token}</code>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { navigator.clipboard?.writeText(newToken.token); showToast('Clé copiée', 'success'); }}
                    className="text-xs font-semibold text-green-700 underline">Copier</button>
                  <button type="button" onClick={() => setNewToken(null)} className="text-xs text-gray-500 underline">J'ai copié la clé</button>
                </div>
              </div>
            )}
            <form onSubmit={createToken} className="flex flex-wrap gap-3 mb-4">
              <input required value={tokenName} onChange={e => setTokenName(e.target.value)} maxLength={50}
                placeholder="Nom de la clé (ex. Mon logiciel de caisse)" className={`${INPUT} flex-1 min-w-[220px]`} />
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                ➕ Créer une clé
              </button>
            </form>
            {tokens.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune clé active.</p>
            ) : (
              <ul className="divide-y">
                {tokens.map(t => (
                  <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                    <span>
                      <strong>{t.name}</strong>
                      <span className="ml-2 text-xs text-gray-400">
                        {t.last_used_at ? `dernière utilisation ${new Date(t.last_used_at).toLocaleDateString('fr-FR')}` : 'jamais utilisée'}
                      </span>
                    </span>
                    <button type="button" onClick={() => revokeToken(t.id)} className="text-xs text-red-500 hover:underline">Révoquer</button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Utilisation : en-tête <code className="px-1 bg-gray-100 rounded">Authorization: Bearer VOTRE_CLÉ</code>.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
