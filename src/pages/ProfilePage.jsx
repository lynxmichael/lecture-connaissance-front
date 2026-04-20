import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { showToast } from '../components/Toast';

const InputField = ({ name, label, type='text', placeholder, value, onChange, error }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white ${
        error ? 'border-red-300 focus:ring-red-200' : 'border-[#e8e0d4] focus:border-[#c9933a] focus:ring-[#c9933a]/20'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
  </div>
);

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [tab,      setTab]      = useState('infos');
  const [updating, setUpdating] = useState(false);
  const [errors,   setErrors]   = useState({});

  const [formData, setFormData] = useState({
    name:      user?.name      || '',
    prenom:    user?.prenom    || '',
    email:     user?.email     || '',
    telephone: user?.telephone || '',
  });

  const [adresses,   setAdresses]   = useState(Array.isArray(user?.adresses) ? user.adresses : []);
  const [newAdresse, setNewAdresse] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleUpdateInfos = async (e) => {
    e.preventDefault();
    setUpdating(true); setErrors({});
    try {
      const res = await api.put('/user', formData);
      setUser(res.data);
      showToast('Profil mis à jour ✓', 'success');
    } catch (err) {
      const errs = err.response?.data?.errors || {};
      if (Object.keys(errs).length > 0) {
        const flat = {};
        Object.entries(errs).forEach(([k,v]) => { flat[k] = v[0]; });
        setErrors(flat);
      } else {
        showToast(err.response?.data?.message || 'Erreur', 'error');
      }
    } finally { setUpdating(false); }
  };

  const handleAddAdresse = async () => {
    const t = newAdresse.trim();
    if (!t) return;
    const updated = [...adresses, t];
    setUpdating(true);
    try {
      const res = await api.put('/user', { adresses: updated });
      setUser(res.data); setAdresses(updated); setNewAdresse('');
      showToast('Adresse ajoutée', 'success');
    } catch { showToast('Erreur', 'error'); }
    finally { setUpdating(false); }
  };

  const handleRemoveAdresse = async (idx) => {
    const updated = adresses.filter((_, i) => i !== idx);
    setUpdating(true);
    try {
      const res = await api.put('/user', { adresses: updated });
      setUser(res.data); setAdresses(updated);
      showToast('Adresse supprimée', 'info');
    } catch { showToast('Erreur', 'error'); }
    finally { setUpdating(false); }
  };

  const initials = (user?.prenom?.[0] || user?.name?.[0] || '?').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Avatar + nom */}
      <div className="flex items-center gap-5 mb-10 fade-up">
        <div className="w-20 h-20 rounded-2xl bg-[#0f1923] flex items-center justify-center text-3xl font-black text-[#c9933a] shadow-lg flex-shrink-0"
          style={{fontFamily:'Playfair Display,serif'}}>
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
            {user?.prenom} {user?.name}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.telephone && <p className="text-gray-500 text-sm">📞 {user.telephone}</p>}
          <span className={`inline-block mt-1.5 text-xs font-bold px-3 py-0.5 rounded-full ${
            user?.role === 'libraire'
              ? 'bg-[#0f1923] text-[#c9933a]'
              : 'bg-[#c9933a]/10 text-[#c9933a]'
          }`}>
            {user?.role === 'libraire' ? '⚙️ Libraire' : '👤 Client'}
          </span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-8 bg-[#f0ebe0] p-1 rounded-xl">
        {[
          { id:'infos',    label:'📋 Informations' },
          { id:'adresses', label:'📍 Adresses' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              tab === id
                ? 'bg-white text-[#0f1923] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Infos ── */}
      {tab === 'infos' && (
        <form onSubmit={handleUpdateInfos} className="bg-white border border-[#e8e0d4] rounded-2xl p-6 shadow-sm space-y-4 fade-up">
          <div className="grid grid-cols-2 gap-4">
            <InputField name="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} error={errors.prenom} />
            <InputField name="name"   label="Nom"    value={formData.name}   onChange={handleChange} error={errors.name} />
          </div>
          <InputField name="email"     label="Email"     type="email" value={formData.email}     onChange={handleChange} error={errors.email} />
          <InputField name="telephone" label="Téléphone" type="tel"   value={formData.telephone}
            placeholder="+225 07 00 00 00 00"
            onChange={handleChange} error={errors.telephone} />

          <div className="pt-2">
            <button type="submit" disabled={updating}
              className="bg-[#0f1923] text-white px-7 py-2.5 rounded-xl font-semibold hover:bg-[#162232] transition disabled:opacity-60">
              {updating ? '⏳ Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}

      {/* ── Adresses ── */}
      {tab === 'adresses' && (
        <div className="space-y-4 fade-up">
          {adresses.length === 0 && (
            <div className="text-center py-10 bg-white border border-[#e8e0d4] rounded-2xl text-gray-400">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-sm">Aucune adresse enregistrée.</p>
            </div>
          )}
          {adresses.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-[#e8e0d4] rounded-xl px-4 py-3 shadow-sm">
              <span className="text-lg flex-shrink-0">📍</span>
              <span className="flex-1 text-sm text-gray-700">{a}</span>
              <button onClick={() => handleRemoveAdresse(i)} disabled={updating}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition text-sm">
                ✕
              </button>
            </div>
          ))}

          <div className="bg-white border border-[#e8e0d4] rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ajouter une adresse</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAdresse}
                onChange={e => setNewAdresse(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAdresse())}
                placeholder="Ex : Rue des Jardins, Cocody, Abidjan"
                className="flex-1 px-4 py-2.5 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition"
              />
              <button onClick={handleAddAdresse} disabled={!newAdresse.trim() || updating}
                className="bg-[#c9933a] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#b8832d] transition disabled:opacity-50">
                + Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
