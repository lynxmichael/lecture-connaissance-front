import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { showToast } from '../components/Toast';
import { MapPicker } from '../components/LeafletMap';
import { OPERATORS, OperatorCard, MobileMoneyDisplay } from '../components/MobileMoneyLogos';

/* ── Champ texte réutilisable ───────────────────────────────────────────── */
function Field({ name, label, type = 'text', placeholder, value, onChange, error, disabled }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type} name={name} value={value ?? ''} onChange={onChange}
        placeholder={placeholder} disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
          ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' :
            error ? 'border-red-300 focus:ring-red-200 bg-white' :
            'border-[#e8e0d4] focus:border-[#c9933a] focus:ring-[#c9933a]/20 bg-white'}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  /* hooks TOUJOURS en haut, dans le même ordre */
  const { user, setUser }   = useAuth();
  const [searchParams]      = useSearchParams();

  const isAdmin = user?.role === 'libraire' ||
                  user?.role === 'super_admin' ||
                  !!user?.is_super_admin;

  /* onglet actif : lu depuis l'URL (?tab=localisation) */
  const validTabs = ['infos', 'adresses', ...(isAdmin ? ['paiement', 'localisation'] : [])];
  const urlTab    = searchParams.get('tab');
  const [tab, setTab] = useState(validTabs.includes(urlTab) ? urlTab : 'infos');

  /* formulaire principal */
  const [form, setForm] = useState({
    name:             user?.name             || '',
    prenom:           user?.prenom           || '',
    email:            user?.email            || '',
    telephone:        user?.telephone        || '',
    mobile_money_numbers: user?.mobile_money_numbers || {},
  });

  /* localisation */
  const [loc, setLoc] = useState({
    latitude:     null,
    longitude:    null,
    map_label:    '',
    address_full: '',
    show_on_map:  true,
  });

  /* adresses livraison */
  const [adresses,   setAdresses]   = useState(Array.isArray(user?.adresses) ? user.adresses : []);
  const [newAdresse, setNewAdresse] = useState('');

  /* états d'envoi */
  const [saving,    setSaving]    = useState(false);
  const [savingLoc, setSavingLoc] = useState(false);
  const [errors,    setErrors]    = useState({});

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: null }));
  };

  /* ── Enregistrer infos générales ────────────────────────────────────── */
  const handleSaveInfos = async e => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const res = await api.put('/user', {
        name: form.name, prenom: form.prenom,
        email: form.email, telephone: form.telephone,
      });
      setUser(res.data);
      showToast('Profil mis à jour ✓', 'success');
    } catch (err) {
      const errs = err.response?.data?.errors || {};
      if (Object.keys(errs).length) {
        setErrors(Object.fromEntries(Object.entries(errs).map(([k,v]) => [k, v[0]])));
      } else {
        showToast(err.response?.data?.message || 'Erreur', 'error');
      }
    } finally { setSaving(false); }
  };

  /* ── Enregistrer numéro de paiement ─────────────────────────────────── */
  const handleSavePaiement = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/user', {
        mobile_money_numbers: form.mobile_money_numbers,
      });
      setUser(res.data);
      setForm(f => ({ ...f, mobile_money_numbers: res.data.mobile_money_numbers || {} }));
      showToast('Numéros Mobile Money mis à jour ✓', 'success');
    } catch (err) {
      // Message précis (ex. « Numéro invalide : 10 chiffres attendus »)
      const errors = err.response?.data?.errors;
      showToast(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Erreur'), 'error');
    }
    finally { setSaving(false); }
  };

  /* ── Enregistrer localisation ────────────────────────────────────────── */
  const handleSaveLoc = async () => {
    if (!loc.latitude) { showToast('Placez votre librairie sur la carte', 'error'); return; }
    setSavingLoc(true);
    try {
      await api.put('/my-location', loc);
      showToast('📍 Localisation enregistrée ✓', 'success');
    } catch (err) {
      // Parenthèses : avant, « message || errors ? … : null » affichait un texte vide
      const msg = err.response?.data?.message
        || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null)
        || 'Erreur lors de la sauvegarde';
      showToast(msg || 'Erreur lors de la sauvegarde', 'error');
      console.error('Location save error:', err.response?.data);
    }
    finally { setSavingLoc(false); }
  };

  /* ── Adresses ────────────────────────────────────────────────────────── */
  const handleAddAdresse = async () => {
    const t = newAdresse.trim();
    if (!t) return;
    const updated = [...adresses, t];
    setSaving(true);
    try {
      const res = await api.put('/user', { adresses: updated });
      setUser(res.data); setAdresses(updated); setNewAdresse('');
      showToast('Adresse ajoutée', 'success');
    } catch { showToast('Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleRemoveAdresse = async idx => {
    const updated = adresses.filter((_, i) => i !== idx);
    setSaving(true);
    try {
      const res = await api.put('/user', { adresses: updated });
      setUser(res.data); setAdresses(updated);
      showToast('Adresse supprimée', 'info');
    } catch { showToast('Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const initials = (user?.prenom?.[0] || user?.name?.[0] || '?').toUpperCase();

  const TABS = [
    { id: 'infos',       label: '📋 Informations' },
    { id: 'adresses',    label: '📍 Adresses'      },
    ...(isAdmin ? [
      { id: 'paiement',      label: '💳 Paiement'     },
      { id: 'localisation',  label: '🗺️ Ma librairie' },
    ] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-2xl bg-[#0f1923] flex items-center justify-center
                        text-3xl font-black text-[#c9933a] shadow-lg flex-shrink-0"
          style={{ fontFamily: 'Playfair Display,serif' }}>
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#0f1923]"
            style={{ fontFamily: 'Playfair Display,serif' }}>
            {user?.prenom} {user?.name}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.telephone && <p className="text-gray-500 text-sm">📞 {user.telephone}</p>}
          <span className={`inline-block mt-1.5 text-xs font-bold px-3 py-0.5 rounded-full ${
            isAdmin ? 'bg-[#0f1923] text-[#c9933a]' : 'bg-[#c9933a]/10 text-[#c9933a]'
          }`}>
            {user?.is_super_admin ? '👑 Super Admin' : isAdmin ? '⚙️ Libraire' : '👤 Client'}
          </span>
        </div>
      </div>

      {/* Navigation onglets */}
      <div className="flex gap-1 mb-8 bg-[#f0ebe0] p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              tab === t.id
                ? 'bg-white text-[#0f1923] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ Onglet : Informations ══════════════════════════════════════════ */}
      {tab === 'infos' && (
        <form onSubmit={handleSaveInfos}
          className="bg-white border border-[#e8e0d4] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field name="prenom" label="Prénom" value={form.prenom} onChange={handleChange} error={errors.prenom} />
            <Field name="name"   label="Nom"    value={form.name}   onChange={handleChange} error={errors.name} />
          </div>
          <Field name="email"     label="Email"            type="email" value={form.email}
            onChange={handleChange} error={errors.email} />
          <Field name="telephone" label="Téléphone"        type="tel"   value={form.telephone}
            placeholder="+225 07 00 00 00 00" onChange={handleChange} error={errors.telephone} />
          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="bg-[#0f1923] text-white px-7 py-2.5 rounded-xl font-semibold
                         hover:bg-[#162232] transition disabled:opacity-60">
              {saving ? '⏳ Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}

      {/* ══ Onglet : Adresses livraison ════════════════════════════════════ */}
      {tab === 'adresses' && (
        <div className="space-y-4">
          {adresses.length === 0 && (
            <div className="text-center py-10 bg-white border border-[#e8e0d4] rounded-2xl text-gray-400">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-sm">Aucune adresse enregistrée.</p>
            </div>
          )}
          {adresses.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-[#e8e0d4]
                                    rounded-xl px-4 py-3 shadow-sm">
              <span className="text-lg flex-shrink-0">📍</span>
              <span className="flex-1 text-sm text-gray-700">{a}</span>
              <button onClick={() => handleRemoveAdresse(i)} disabled={saving}
                className="w-7 h-7 flex items-center justify-center text-gray-400
                           hover:text-red-500 hover:bg-red-50 rounded-lg transition text-sm">
                ✕
              </button>
            </div>
          ))}
          <div className="bg-white border border-[#e8e0d4] rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Ajouter une adresse
            </p>
            <div className="flex gap-2">
              <input type="text" value={newAdresse}
                onChange={e => setNewAdresse(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAdresse())}
                placeholder="Ex : Rue des Jardins, Cocody, Abidjan"
                className="flex-1 px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30
                           focus:border-[#c9933a] transition" />
              <button onClick={handleAddAdresse} disabled={!newAdresse.trim() || saving}
                className="bg-[#c9933a] text-white px-4 py-2.5 rounded-xl font-semibold
                           text-sm hover:bg-[#b8832d] transition disabled:opacity-50">
                + Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Onglet : Paiement (admin seulement) ════════════════════════════ */}
      {tab === 'paiement' && isAdmin && (
        <form onSubmit={handleSavePaiement}
          className="bg-white border border-[#e8e0d4] rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-lg text-[#0f1923] mb-1"
              style={{ fontFamily: 'Playfair Display,serif' }}>
              💳 Mes numéros Mobile Money
            </h2>
            <p className="text-sm text-gray-400">
              Ajoutez un numéro par opérateur. Les virements seront envoyés sur le numéro
              correspondant à l'opérateur utilisé par le client.
            </p>
          </div>

          {/* Une carte par opérateur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OPERATORS.map(op => (
              <OperatorCard
                key={op.id}
                op={op}
                number={form.mobile_money_numbers?.[op.id] || ''}
                selected={!!(form.mobile_money_numbers?.[op.id])}
                onSelect={() => {}}
                onChange={val => setForm(f => ({
                  ...f,
                  mobile_money_numbers: {
                    ...f.mobile_money_numbers,
                    [op.id]: val,
                  },
                }))}
              />
            ))}
          </div>

          {/* Récapitulatif */}
          {Object.values(form.mobile_money_numbers || {}).some(Boolean) && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-3">
                ✅ Numéros configurés
              </p>
              <MobileMoneyDisplay numbers={form.mobile_money_numbers} />
            </div>
          )}

          {!Object.values(form.mobile_money_numbers || {}).some(Boolean) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3
                            flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Aucun numéro configuré</p>
                <p className="text-xs text-amber-600">
                  Ajoutez au moins un numéro pour recevoir vos virements.
                </p>
              </div>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="bg-[#c9933a] text-white px-6 py-2.5 rounded-xl font-bold
                       hover:bg-[#b8832d] transition disabled:opacity-60">
            {saving ? '⏳ Enregistrement…' : '💾 Enregistrer tous les numéros'}
          </button>
        </form>
      )}

      {/* ══ Onglet : Localisation (admin seulement) ════════════════════════ */}
      {tab === 'localisation' && isAdmin && (
        <div className="bg-white border border-[#e8e0d4] rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-lg text-[#0f1923] mb-1"
              style={{ fontFamily: 'Playfair Display,serif' }}>
              🗺️ Localisation de votre librairie
            </h2>
            <p className="text-sm text-gray-400">
              Placez précisément votre librairie. Les clients la verront sur la carte de la plateforme.
            </p>
          </div>

          {/* Nom affiché */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Nom affiché sur la carte
            </label>
            <input type="text" value={loc.map_label}
              onChange={e => setLoc(l => ({ ...l, map_label: e.target.value }))}
              placeholder="Ex: Librairie Koné — Yopougon"
              className="w-full px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30
                         focus:border-[#c9933a] transition" />
          </div>

          {/* Carte interactive */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Position sur la carte <span className="text-red-500">*</span>
            </label>
            <MapPicker
              defaultLat={loc.latitude  || 5.3595}
              defaultLng={loc.longitude || -3.9981}
              onSelect={(lat, lng, addr) =>
                setLoc(l => ({ ...l, latitude: lat, longitude: lng, address_full: addr }))
              }
            />
          </div>

          {/* Visible / masqué */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer"
                checked={loc.show_on_map}
                onChange={e => setLoc(l => ({ ...l, show_on_map: e.target.checked }))} />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer
                              peer-checked:bg-[#c9933a] transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow
                              peer-checked:translate-x-4 transition-transform" />
            </label>
            <div>
              <p className="text-sm font-semibold text-[#0f1923]">Visible par les clients</p>
              <p className="text-xs text-gray-400">
                Désactivez pour masquer votre librairie de la carte publique
              </p>
            </div>
          </div>

          {/* Confirmation position */}
          {loc.latitude && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5
                            flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✅</span>
              <div>
                <p className="text-xs font-bold text-green-800">Position sélectionnée</p>
                <p className="text-xs text-green-600 mt-0.5 line-clamp-2">{loc.address_full}</p>
                <p className="text-[10px] text-green-400 font-mono mt-0.5">
                  {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          <button onClick={handleSaveLoc} disabled={savingLoc || !loc.latitude}
            className="bg-[#c9933a] text-white px-6 py-2.5 rounded-xl font-bold
                       hover:bg-[#b8832d] transition disabled:opacity-50">
            {savingLoc ? '⏳ Enregistrement…' : '📍 Enregistrer la position'}
          </button>
        </div>
      )}
    </div>
  );
}
