import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatCFA } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';

export default function SearchBar({ placeholder = "Rechercher livres, fournitures…", fullPage = false }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const ref     = useRef(null);
  const timer   = useRef(null);
  const navigate = useNavigate();

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}&limit=6`);
      setResults(res.data);
      setOpen(true);
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      navigate(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const goTo = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalResults = (results?.books?.length || 0) + (results?.fournitures?.length || 0);

  return (
    <div ref={ref} className={`relative ${fullPage ? 'w-full' : 'w-full max-w-lg'}`}>
      <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${
        fullPage
          ? 'bg-white border-2 border-[#e8e0d4] rounded-2xl px-5 py-3 focus-within:border-[#c9933a] transition'
          : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 focus-within:bg-white/15 transition'
      }`}>
        <span className={`text-lg flex-shrink-0 ${loading ? 'animate-spin' : ''}`}>
          {loading ? '⏳' : '🔍'}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results && setOpen(true)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-sm ${
            fullPage ? 'text-[#0f1923] placeholder-gray-400' : 'text-white placeholder-gray-400'
          }`}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0">✕</button>
        )}
      </form>

      {/* Dropdown résultats */}
      {open && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8e0d4] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
          {totalResults === 0 ? (
            <p className="px-5 py-4 text-gray-400 text-sm text-center">Aucun résultat pour «{query}»</p>
          ) : (
            <>
              {/* Livres */}
              {results.books?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#faf7f2] border-b border-[#e8e0d4]">
                    📚 Livres ({results.books.length})
                  </p>
                  {results.books.map(book => (
                    <button key={book.id} onClick={() => goTo(`/book/${book.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf7f2] transition text-left border-b border-[#e8e0d4]/50">
                      <span className="text-2xl flex-shrink-0">{book.image || '📖'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0f1923] text-sm truncate">{book.titre}</p>
                        <p className="text-gray-500 text-xs">{book.auteur} · {book.rayon}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[#2d7a4f] text-sm">{formatCFA(book.final_price ?? book.prix)}</p>
                        {book.final_price < book.prix && (
                          <p className="text-[10px] text-gray-400 line-through">{formatCFA(book.prix)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {/* Fournitures */}
              {results.fournitures?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#faf7f2] border-b border-[#e8e0d4]">
                    ✏️ Fournitures ({results.fournitures.length})
                  </p>
                  {results.fournitures.map(f => (
                    <button key={f.id} onClick={() => goTo(`/fourniture/${f.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf7f2] transition text-left border-b border-[#e8e0d4]/50">
                      <span className="text-2xl flex-shrink-0">{getEmoji(f)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0f1923] text-sm truncate">{f.nom}</p>
                        <p className="text-gray-500 text-xs">{f.categorie}{f.marque ? ` · ${f.marque}` : ''}</p>
                      </div>
                      <p className="font-bold text-[#2d7a4f] text-sm flex-shrink-0">{formatCFA(f.final_price ?? f.prix)}</p>
                    </button>
                  ))}
                </div>
              )}
              {/* Voir tous */}
              <button onClick={() => { setOpen(false); navigate(`/recherche?q=${encodeURIComponent(query)}`); }}
                className="w-full px-4 py-3 text-[#c9933a] font-semibold text-sm hover:bg-amber-50 transition text-center">
                Voir tous les résultats pour «{query}» →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
