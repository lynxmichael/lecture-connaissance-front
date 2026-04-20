import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      showToast('Connexion réussie ✓', 'success');
      navigate(from || (res?.role === 'libraire' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || 'Email ou mot de passe incorrect';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f1923] flex items-center justify-center px-4 py-12">
      {/* Lumière de fond */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{background:'radial-gradient(ellipse 60% 50% at 50% 40%, #c9933a, transparent)'}} />

      <div className="relative w-full max-w-md fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <span className="w-12 h-12 bg-[#c9933a] rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition">📚</span>
          </Link>
          <h1 className="text-white text-3xl font-black" style={{fontFamily:'Playfair Display,serif'}}>
            Bon retour
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Connectez-vous à votre compte</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#c9933a]/70 focus:ring-2 focus:ring-[#c9933a]/20 transition text-sm"
                placeholder="votre@email.com"
                required autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#c9933a]/70 focus:ring-2 focus:ring-[#c9933a]/20 transition text-sm pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm transition">
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9933a] text-white py-3.5 rounded-xl font-bold hover:bg-[#b8832d] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#c9933a]/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Connexion…
                </span>
              ) : 'Se connecter →'}
            </button>
          </form>

          <div className="border-t border-white/10 mt-6 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-[#c9933a] font-semibold hover:text-[#f0d49a] transition">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Demo */}
          <div className="mt-5 bg-white/5 rounded-xl p-3 text-xs text-gray-500 text-center">
            <p className="font-semibold text-gray-400 mb-1">Comptes démo</p>
            <p>admin@lectureconnaissance.com · Admin@2024!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
