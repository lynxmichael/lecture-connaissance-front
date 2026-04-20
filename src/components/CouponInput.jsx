import { useState } from 'react';
import api from '../api/client';
import { formatCFA } from '../utils/currency';

export default function CouponInput({ orderTotal, onApply, appliedCoupon }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await api.post('/coupons/validate', { code: code.trim(), order_total: orderTotal });
      onApply(res.data);
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
      onApply(null);
    } finally { setLoading(false); }
  };

  if (appliedCoupon) return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <span className="text-green-600 font-bold text-sm flex-1">
        ✅ Code <strong>{appliedCoupon.coupon.code}</strong> appliqué — -{formatCFA(appliedCoupon.discount)}
      </span>
      <button onClick={() => onApply(null)} className="text-gray-400 hover:text-[#d44040] text-sm transition">✕</button>
    </div>
  );

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        Code promo
      </label>
      <div className="flex gap-2">
        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key==='Enter' && handleApply()}
          placeholder="Ex : RENTREE25"
          className={`flex-1 px-4 py-2.5 border rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition ${error ? 'border-red-300' : 'border-[#e8e0d4]'}`}
        />
        <button onClick={handleApply} disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-[#c9933a] text-white rounded-xl font-bold text-sm hover:bg-[#b8832d] transition disabled:opacity-50">
          {loading ? '⏳' : 'Appliquer'}
        </button>
      </div>
      {error && <p className="text-[#d44040] text-xs mt-1">⚠ {error}</p>}
    </div>
  );
}
