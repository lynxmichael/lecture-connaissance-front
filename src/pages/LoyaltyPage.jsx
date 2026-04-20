import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { formatCFA } from '../utils/currency';

const LEVELS = [
  { name:'Débutant', min:0,    max:299,  color:'bg-gray-100 border-gray-300', textColor:'text-gray-600', icon:'🌱', discount:0 },
  { name:'Bronze',   min:300,  max:1499, color:'bg-orange-50 border-orange-300', textColor:'text-orange-700', icon:'🥉', discount:2 },
  { name:'Argent',   min:1500, max:4999, color:'bg-gray-50 border-gray-400',  textColor:'text-gray-600',   icon:'🥈', discount:5 },
  { name:'Or',       min:5000, max:Infinity, color:'bg-yellow-50 border-yellow-400', textColor:'text-yellow-700', icon:'🥇', discount:10 },
];

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/loyalty')
      .then(r => setLoyalty(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentLevel  = LEVELS.find(l => l.name === loyalty?.level) ?? LEVELS[0];
  const nextLevel     = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressPct   = nextLevel
    ? Math.min(100, ((loyalty?.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Mon espace</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          🏆 Programme de fidélité
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl animate-spin mb-3">⟳</div></div>
      ) : (
        <div className="space-y-6">

          {/* Carte statut */}
          <div className={`border-2 rounded-3xl p-6 ${currentLevel.color}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Votre niveau</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{currentLevel.icon}</span>
                  <span className={`text-2xl font-black ${currentLevel.textColor}`}>{currentLevel.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Vos points</p>
                <p className="text-4xl font-black text-[#0f1923]">{loyalty?.points ?? 0}</p>
              </div>
            </div>

            {/* Barre progression */}
            {nextLevel && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{currentLevel.name} ({currentLevel.min} pts)</span>
                  <span>{nextLevel.name} ({nextLevel.min} pts)</span>
                </div>
                <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c9933a] rounded-full transition-all duration-1000"
                    style={{width:`${progressPct}%`}}/>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 text-center">
                  {loyalty?.points_next_lvl} points pour atteindre le niveau <strong>{nextLevel.name}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Avantages actuels */}
          <div className="bg-white border border-[#e8e0d4] rounded-2xl p-5 shadow-sm">
            <h2 className="font-black text-[#0f1923] mb-4" style={{fontFamily:'Playfair Display,serif'}}>
              Vos avantages actuels
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon:'💰', label:'Valeur en FCFA', value:formatCFA(loyalty?.valeur_fcfa ?? 0) },
                { icon:'🎁', label:'Remise fidélité', value:loyalty?.discount ? `-${loyalty.discount}%` : 'Aucune' },
                { icon:'📦', label:'Niveau', value:currentLevel.name },
                { icon:'⭐', label:'1 point = ', value:'10 FCFA' },
              ].map(a => (
                <div key={a.label} className="bg-[#faf7f2] rounded-xl p-3 text-center border border-[#e8e0d4]">
                  <p className="text-2xl mb-1">{a.icon}</p>
                  <p className="text-lg font-black text-[#0f1923]">{a.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Niveaux du programme */}
          <div className="bg-white border border-[#e8e0d4] rounded-2xl p-5 shadow-sm">
            <h2 className="font-black text-[#0f1923] mb-4" style={{fontFamily:'Playfair Display,serif'}}>
              Les niveaux du programme
            </h2>
            <div className="space-y-3">
              {LEVELS.map(l => (
                <div key={l.name} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  l.name === currentLevel.name ? `${l.color} shadow-md` : 'border-[#e8e0d4] bg-[#faf7f2]'
                }`}>
                  <span className="text-2xl flex-shrink-0">{l.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#0f1923]">{l.name}</p>
                      {l.name === currentLevel.name && (
                        <span className="text-[10px] font-bold bg-[#c9933a] text-white px-2 py-0.5 rounded-full">Votre niveau</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {l.max === Infinity ? `${l.min}+ points` : `${l.min} – ${l.max} points`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#2d7a4f]">{l.discount > 0 ? `-${l.discount}%` : '—'}</p>
                    <p className="text-xs text-gray-400">sur vos achats</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment gagner des points */}
          <div className="bg-[#0f1923] rounded-2xl p-5 text-white">
            <h2 className="font-black mb-4" style={{fontFamily:'Playfair Display,serif'}}>
              Comment gagner des points ?
            </h2>
            <div className="space-y-2 text-sm text-gray-300">
              {[
                ['🛒','Chaque achat','1 point par 500 FCFA dépensés'],
                ['💳','Utiliser vos points','100 pts = 1 000 FCFA de réduction'],
                ['⭐','Progresser','Débloquez des remises permanentes plus élevées'],
              ].map(([icon,title,desc])=>(
                <div key={title} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/catalog" className="bg-[#0f1923] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c9933a] transition">
              📚 Gagner des points
            </Link>
            <Link to="/profile" className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-[#c9933a] transition">
              Mon profil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
