import { useState, useEffect, useCallback } from 'react';

// Construit le BASE_URL proprement (supporte /api, /api/, http://host:port/api)
const _raw = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const BASE_URL = _raw.replace(/\/api\/?$/, '').replace(/\/$/, '');

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Évite les doubles slashes
  return BASE_URL + (url.startsWith('/') ? url : '/' + url);
}

export default function ImageGallery({ mainUrl, images = [], alt = '', fallback = '📦', hasBadge = null }) {
  // Construire la liste complète des photos
  const buildSlides = () => {
    const slides = [];
    if (mainUrl) slides.push({ url: resolveUrl(mainUrl), label: 'Photo principale' });
    images
      .slice()
      .sort((a, b) => a.ordre - b.ordre)
      .forEach((img, i) => {
        const resolved = resolveUrl(img.url);
        if (resolved && resolved !== slides[0]?.url) {
          slides.push({ url: resolved, label: `Photo ${i + 2}` });
        }
      });
    return slides;
  };

  const slides = buildSlides();
  const [active, setActive]   = useState(0);
  const [zoomed, setZoomed]   = useState(false);
  const [loaded, setLoaded]   = useState({});
  const [errors, setErrors]   = useState({});

  const prev = useCallback(() => setActive(i => (i - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setActive(i => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (!zoomed) return;
    const handler = (e) => {
      if (e.key === 'Escape') setZoomed(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomed, prev, next]);

  // Aucune photo disponible → afficher l'emoji/fallback
  if (slides.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-[#faf7f2] to-[#ede5d4] rounded-3xl flex items-center justify-center"
        style={{ minHeight: 280 }}>
        {hasBadge && (
          <span className="absolute top-4 left-4 bg-[#d44040] text-white text-sm font-bold px-3 py-1 rounded-full shadow z-10">
            {hasBadge}
          </span>
        )}
        <span className="text-8xl select-none">{fallback}</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Image principale ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#f5f0ea] border border-[#e8e0d4] shadow-sm group"
        style={{ minHeight: 280 }}>

        {hasBadge && (
          <span className="absolute top-4 left-4 bg-[#d44040] text-white text-sm font-bold px-3 py-1 rounded-full shadow z-10">
            {hasBadge}
          </span>
        )}

        {/* compteur */}
        {slides.length > 1 && (
          <span className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
            {active + 1} / {slides.length}
          </span>
        )}

        {/* image */}
        <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
          {!loaded[active] && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-3xl" />
          )}
          {errors[active] ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-3 cursor-pointer"
              onClick={() => window.open(slides[active].url, '_blank')}>
              <span className="text-5xl">{fallback}</span>
              <p className="text-xs text-gray-400">Image non disponible</p>
              <p className="text-[10px] text-gray-300 font-mono break-all px-4 text-center max-w-xs">{slides[active].url}</p>
            </div>
          ) : (
            <img
              key={active}
              src={slides[active].url}
              alt={`${alt} — ${slides[active].label}`}
              onLoad={() => setLoaded(l => ({ ...l, [active]: true }))}
              onError={() => { setErrors(e => ({ ...e, [active]: true })); setLoaded(l => ({ ...l, [active]: true })); }}
              onClick={() => setZoomed(true)}
              className={`max-h-72 w-full object-contain cursor-zoom-in transition-opacity duration-300 ${loaded[active] ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>

        {/* Flèches de navigation */}
        {slides.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-all z-10">
              ‹
            </button>
            <button onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-all z-10">
              ›
            </button>
          </>
        )}

        {/* Icône zoom */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
          <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-lg">🔍 Agrandir</span>
        </div>
      </div>

      {/* ── Miniatures ──────────────────────────────────────────────── */}
      {slides.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {slides.map((slide, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150
                ${i === active ? 'border-[#c9933a] ring-2 ring-[#c9933a]/30 scale-105' : 'border-[#e8e0d4] hover:border-[#c9933a]/50'}`}>
              <img src={slide.url} alt={slide.label}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:1.25rem;display:flex;align-items:center;justify-content:center;height:100%">📷</span>'; }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox plein écran ──────────────────────────────────── */}
      {zoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setZoomed(false)}>
          {/* header */}
          <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-10">
            <span className="text-white/70 text-sm">{slides[active].label} — {active + 1}/{slides.length}</span>
            <button onClick={() => setZoomed(false)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl font-bold transition">
              ×
            </button>
          </div>

          {/* image grande */}
          <img
            src={slides[active].url}
            alt={alt}
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          />

          {/* nav flèches */}
          {slides.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-2xl transition">
                ‹
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-2xl transition">
                ›
              </button>
            </>
          )}

          {/* miniatures dans lightbox */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {slides.map((slide, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all
                    ${i === active ? 'border-[#c9933a] scale-110' : 'border-white/20 hover:border-white/50'}`}>
                  <img src={slide.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
