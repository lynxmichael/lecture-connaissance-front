import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { formatCFA } from '../utils/currency';

export default function LoyaltyPoints({ onUsePoints, usedPoints }) {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [using, setUsing] = useState(false);
  const [inputPts, setInputPts] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/loyalty').then(r => setLoyalty(r.data)).catch(()=>{});
  }, [user]);

  if (!user || !loyalty || loyalty.points < 100) return null;

  const maxPoints     = loyalty.points;
  const valeurMax     = maxPoints * 10;

  const handleApply = () => {
    const pts = Math.min(parseInt(inputPts) || 0, maxPoints);
    if (pts > 0) onUsePoints(pts, pts * 10);
    setUsing(false);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <div>
            <p className="font-bold text-[#0f1923] text-sm">Points de fidélité</p>
            <p className="text-xs text-gray-500">{loyalty.points} pts disponibles = {formatCFA(valeurMax)}</p>
          </div>
        </div>
        {!usedPoints && !using && (
          <button onClick={() => setUsing(true)}
            className="text-xs bg-[#c9933a] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#b8832d] transition">
            Utiliser
          </button>
        )}
      </div>

      {using && !usedPoints && (
        <div className="flex gap-2 mt-2">
          <input type="number" min="100" max={maxPoints} step="100"
            value={inputPts} onChange={e => setInputPts(e.target.value)}
            placeholder={`Max ${maxPoints} pts`}
            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"/>
          <button onClick={handleApply}
            className="px-3 py-2 bg-[#c9933a] text-white rounded-lg text-sm font-bold hover:bg-[#b8832d] transition">
            ✓ OK
          </button>
          <button onClick={() => setUsing(false)}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
            ✕
          </button>
        </div>
      )}

      {usedPoints > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-[#2d7a4f] font-semibold">✅ {usedPoints} pts utilisés = -{formatCFA(usedPoints*10)}</span>
          <button onClick={() => onUsePoints(0, 0)} className="text-xs text-[#d44040] hover:underline">Annuler</button>
        </div>
      )}
    </div>
  );
}
