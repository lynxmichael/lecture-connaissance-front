import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from './Toast';
import { Link } from 'react-router-dom';

const Stars = ({ note, interactive=false, onChange }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button"
        onClick={() => interactive && onChange?.(n)}
        className={`text-xl transition-transform ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} ${n<=note ? 'text-[#c9933a]' : 'text-gray-200'}`}>
        ★
      </button>
    ))}
  </div>
);

export default function FournitureReviews({ fournitureId, comments, onNewComment }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ contenu:'', note:5 });
  const [submitting, setSubmitting] = useState(false);

  const avgNote = comments?.length
    ? (comments.reduce((s,c)=>s+c.note,0)/comments.length).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contenu.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/fournitures/${fournitureId}/comment`, form);
      onNewComment?.(res.data);
      setForm({ contenu:'', note:5 });
      showToast('Avis publié !','success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Vous avez peut-être déjà laissé un avis','error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-10 border-t border-[#e8e0d4] pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          Avis clients
          {comments?.length>0 && <span className="text-gray-400 text-base font-normal ml-2">({comments.length})</span>}
        </h2>
        {avgNote && (
          <div className="flex items-center gap-2 bg-[#faf7f2] px-4 py-2 rounded-xl border border-[#e8e0d4]">
            <span className="text-[#c9933a] text-xl">★</span>
            <span className="font-black text-[#0f1923] text-lg">{avgNote}</span>
            <span className="text-gray-400 text-sm">/5</span>
          </div>
        )}
      </div>

      {/* Distribution des notes */}
      {comments?.length > 0 && (
        <div className="bg-[#faf7f2] rounded-2xl p-4 mb-6 border border-[#e8e0d4]">
          {[5,4,3,2,1].map(n => {
            const count = comments.filter(c=>c.note===n).length;
            const pct   = comments.length > 0 ? (count/comments.length)*100 : 0;
            return (
              <div key={n} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-bold text-gray-600 w-3">{n}</span>
                <span className="text-[#c9933a] text-xs">★</span>
                <div className="flex-1 h-2 bg-[#e8e0d4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c9933a] rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulaire */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white border border-[#e8e0d4] rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-[#0f1923] mb-4">Laisser un avis</h3>
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Note</label>
            <Stars note={form.note} interactive onChange={n=>setForm(f=>({...f,note:n}))} />
          </div>
          <textarea value={form.contenu} onChange={e=>setForm(f=>({...f,contenu:e.target.value}))}
            placeholder="Partagez votre expérience avec ce produit…"
            className="w-full px-4 py-3 border border-[#e8e0d4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 focus:border-[#c9933a] transition mb-4" rows={3} required />
          <button type="submit" disabled={submitting || !form.contenu.trim()}
            className="bg-[#0f1923] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c9933a] transition disabled:opacity-50">
            {submitting ? '⏳ Publication…' : '✍️ Publier mon avis'}
          </button>
        </form>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-sm text-amber-800">
          <Link to="/login" className="font-bold underline">Connectez-vous</Link> pour laisser un avis.
        </div>
      )}

      {/* Liste des avis */}
      {!comments?.length ? (
        <p className="text-gray-400 text-center py-8 text-sm">Aucun avis pour le moment. Soyez le premier !</p>
      ) : (
        <div className="space-y-4">
          {[...comments].reverse().map(c => (
            <div key={c.id} className="bg-white border border-[#e8e0d4] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center text-sm font-black text-[#c9933a]">
                  {c.user?.name?.[0]?.toUpperCase()||'?'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0f1923]">{c.user?.prenom||''} {c.user?.name||'Anonyme'}</p>
                  <p className="text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="ml-auto"><Stars note={c.note}/></div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{c.contenu}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
