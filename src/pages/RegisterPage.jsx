import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';

const InputField = ({ name, label, type='text', placeholder, value, onChange, error, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-white/10 border text-white placeholder-gray-500 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition text-sm ${
        error
          ? 'border-red-400/70 focus:ring-red-400/20'
          : 'border-white/15 focus:border-[#c9933a]/70 focus:ring-[#c9933a]/20'
      }`}
      required={!hint?.includes('optionnel')}
    />
    {hint  && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    {error && <p className="text-red-400 text-xs mt-1">⚠ {error}</p>}
  </div>
);

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:'', prenom:'', email:'', telephone:'',
    password:'', password_confirmation:''
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Les mots de passe ne correspondent pas' }); return;
    }
    if (form.password.length < 6) {
      setErrors({ password: 'Au moins 6 caractères' }); return;
    }
    setLoading(true);
    try {
      await register(form);
      showToast('Inscription réussie ! Bienvenue 🎉', 'success');
      navigate('/');
    } catch (err) {
      const errs = err.response?.data?.errors || {};
      if (Object.keys(errs).length > 0) {
        const flat = {};
        Object.entries(errs).forEach(([k,v]) => { flat[k] = v[0]; });
        setErrors(flat);
      } else {
        showToast(err.response?.data?.message || 'Erreur lors de l\'inscription', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f1923] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{background:'radial-gradient(ellipse 60% 50% at 50% 30%, #c9933a, transparent)'}} />

      <div className="relative w-full max-w-lg fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <span className="w-12 h-12 bg-[#c9933a] rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition">📚</span>
          </Link>
          <h1 className="text-white text-3xl font-black" style={{fontFamily:'Playfair Display,serif'}}>
            Créer un compte
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Rejoignez Lecture & Connaissance</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField name="prenom" label="Prénom *" placeholder="Marie"
                value={form.prenom} onChange={handleChange} error={errors.prenom} />
              <InputField name="name"   label="Nom *"    placeholder="Koné"
                value={form.name}   onChange={handleChange} error={errors.name} />
            </div>

            <InputField name="email" label="Email *" type="email"
              placeholder="marie@example.com"
              value={form.email} onChange={handleChange} error={errors.email} />

            <InputField name="telephone" label="Téléphone"
              type="tel" placeholder="+225 07 00 00 00 00"
              hint="(optionnel) — requis pour le suivi de commande"
              value={form.telephone} onChange={handleChange} error={errors.telephone} />

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="6 caractères minimum"
                  className={`w-full bg-white/10 border text-white placeholder-gray-500 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition text-sm pr-12 ${
                    errors.password ? 'border-red-400/70 focus:ring-red-400/20' : 'border-white/15 focus:border-[#c9933a]/70 focus:ring-[#c9933a]/20'
                  }`}
                  required
                />
                <button type="button" onClick={() => setShowPwd(v=>!v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm transition">
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">⚠ {errors.password}</p>}
            </div>

            <InputField name="password_confirmation" label="Confirmer le mot de passe *"
              type={showPwd ? 'text' : 'password'} placeholder="••••••••"
              value={form.password_confirmation} onChange={handleChange}
              error={errors.password_confirmation} />

            <button type="submit" disabled={loading}
              className="w-full bg-[#c9933a] text-white py-3.5 rounded-xl font-bold hover:bg-[#b8832d] active:scale-[0.98] transition-all disabled:opacity-60 mt-2 shadow-lg shadow-[#c9933a]/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Création…
                </span>
              ) : 'Créer mon compte →'}
            </button>
          </form>

          <div className="border-t border-white/10 mt-6 pt-5 text-center">
            <p className="text-gray-400 text-sm">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-[#c9933a] font-semibold hover:text-[#f0d49a] transition">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
