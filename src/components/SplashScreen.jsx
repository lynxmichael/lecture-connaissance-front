import { useEffect, useState } from 'react';

/* ── Données des livres flottants ──────────────────────────────────────────
   Chaque livre a une position, une taille, une vitesse et une couleur uniques.
   Les animations CSS pures assurent 60fps sans librairie externe.
   ─────────────────────────────────────────────────────────────────────────── */
const BOOKS = [
  /* grande rangée de fond */
  { id:1,  x:3,   y:70, s:2.2, dur:18, del:0,    rot:-12, color:'#c9933a', opacity:0.18 },
  { id:2,  x:12,  y:20, s:1.6, dur:22, del:2,    rot:8,   color:'#4a8fa8', opacity:0.15 },
  { id:3,  x:25,  y:85, s:2.8, dur:16, del:1,    rot:-6,  color:'#8a6a9a', opacity:0.20 },
  { id:4,  x:38,  y:15, s:1.9, dur:20, del:3.5,  rot:15,  color:'#c9933a', opacity:0.16 },
  { id:5,  x:52,  y:75, s:2.4, dur:24, del:0.5,  rot:-20, color:'#4a8fa8', opacity:0.14 },
  { id:6,  x:67,  y:30, s:1.5, dur:17, del:2.5,  rot:10,  color:'#d4663a', opacity:0.18 },
  { id:7,  x:79,  y:88, s:3.0, dur:21, del:1.5,  rot:-8,  color:'#c9933a', opacity:0.22 },
  { id:8,  x:88,  y:10, s:2.0, dur:19, del:4,    rot:18,  color:'#5a9a6a', opacity:0.16 },
  { id:9,  x:95,  y:55, s:1.7, dur:23, del:0.8,  rot:-14, color:'#8a6a9a', opacity:0.15 },
  /* rangée intermédiaire */
  { id:10, x:7,   y:45, s:1.2, dur:25, del:1.2,  rot:22,  color:'#c9933a', opacity:0.25 },
  { id:11, x:20,  y:60, s:1.4, dur:20, del:3,    rot:-16, color:'#4a8fa8', opacity:0.22 },
  { id:12, x:33,  y:35, s:1.0, dur:28, del:0.3,  rot:5,   color:'#d4663a', opacity:0.20 },
  { id:13, x:46,  y:50, s:1.6, dur:22, del:2.2,  rot:-25, color:'#8a6a9a', opacity:0.24 },
  { id:14, x:60,  y:22, s:1.1, dur:26, del:1.8,  rot:12,  color:'#5a9a6a', opacity:0.21 },
  { id:15, x:73,  y:65, s:1.3, dur:19, del:3.8,  rot:-9,  color:'#c9933a', opacity:0.23 },
  { id:16, x:85,  y:42, s:1.8, dur:24, del:0.6,  rot:28,  color:'#4a8fa8', opacity:0.26 },
  /* petits livres au premier plan */
  { id:17, x:15,  y:92, s:0.8, dur:15, del:2.8,  rot:-30, color:'#c9933a', opacity:0.35 },
  { id:18, x:42,  y:8,  s:0.9, dur:13, del:1.6,  rot:20,  color:'#d4663a', opacity:0.30 },
  { id:19, x:68,  y:95, s:0.7, dur:16, del:3.2,  rot:-18, color:'#8a6a9a', opacity:0.32 },
  { id:20, x:91,  y:78, s:1.0, dur:14, del:0.4,  rot:35,  color:'#5a9a6a', opacity:0.28 },
];

/* ── SVG Livre animé ───────────────────────────────────────────────────────── */
function BookSVG({ size, color }) {
  const w = size * 24;
  const h = size * 32;
  return (
    <svg width={w} height={h} viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tranche */}
      <rect x="2" y="0" width="20" height="32" rx="2" fill={color} />
      {/* Pages */}
      <rect x="3" y="1" width="18" height="30" rx="1.5" fill="white" opacity="0.92"/>
      {/* Couverture avant */}
      <rect x="3" y="1" width="4" height="30" rx="1" fill={color} opacity="0.7"/>
      {/* Lignes de texte */}
      <rect x="9"  y="6"  width="10" height="1.5" rx="1" fill={color} opacity="0.5"/>
      <rect x="9"  y="10" width="8"  height="1.5" rx="1" fill={color} opacity="0.4"/>
      <rect x="9"  y="14" width="10" height="1.5" rx="1" fill={color} opacity="0.5"/>
      <rect x="9"  y="18" width="6"  height="1.5" rx="1" fill={color} opacity="0.3"/>
      <rect x="9"  y="22" width="9"  height="1.5" rx="1" fill={color} opacity="0.4"/>
      <rect x="9"  y="26" width="7"  height="1.5" rx="1" fill={color} opacity="0.3"/>
      {/* Titre sur couverture */}
      <rect x="4.5" y="10" width="1.5" height="12" rx="0.5" fill="white" opacity="0.8"/>
    </svg>
  );
}

/* ── Particle de poussière/étoile ──────────────────────────────────────────── */
function Sparkle({ x, y, delay, size = 4 }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#c9933a',
      opacity: 0,
      animation: `sparkle 3s ease-in-out ${delay}s infinite`,
    }} />
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter'); // enter → visible → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(() => onFinish?.(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const sparkles = [
    {x:20,y:30,d:0.4},{x:75,y:20,d:1.2},{x:40,y:75,d:0.8},
    {x:85,y:60,d:1.8},{x:55,y:10,d:0.2},{x:10,y:50,d:2.1},
    {x:65,y:85,d:0.6},{x:30,y:15,d:1.5},{x:90,y:35,d:0.9},
  ];

  return (
    <>
      {/* ── CSS keyframes injectés directement ─────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

        @keyframes floatBook {
          0%   { transform: translateY(0px) rotate(var(--rot)); }
          33%  { transform: translateY(-18px) rotate(calc(var(--rot) + 4deg)); }
          66%  { transform: translateY(8px) rotate(calc(var(--rot) - 3deg)); }
          100% { transform: translateY(0px) rotate(var(--rot)); }
        }

        @keyframes driftX {
          0%   { margin-left: 0; }
          50%  { margin-left: 12px; }
          100% { margin-left: 0; }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50%       { opacity: 0.8; transform: scale(1.4); }
        }

        @keyframes lineGrow {
          0%   { width: 0; }
          100% { width: 120px; }
        }

        @keyframes fadeSlideUp {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeSlideDown {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        @keyframes progressBar {
          0%   { width: 0%; }
          60%  { width: 85%; }
          100% { width: 100%; }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(201,147,58,0.3); }
          50%       { box-shadow: 0 0 50px rgba(201,147,58,0.7), 0 0 80px rgba(201,147,58,0.3); }
        }

        @keyframes rotateHalo {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }

        .splash-enter  { animation: fadeSlideUp   0.5s ease forwards; }
        .splash-exit   { animation: fadeSlideDown 0.5s ease forwards; }
      `}</style>

      {/* ── Conteneur principal ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(ellipse at 30% 40%, #1a2d3d 0%, #0f1923 50%, #060d13 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}>

        {/* ── Grain texture overlay ──────────────────────────────────────── */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents:'none',
        }} />

        {/* ── Halos lumineux ────────────────────────────────────────────── */}
        <div style={{
          position:'absolute', left:'50%', top:'50%',
          width:'600px', height:'600px',
          background:'radial-gradient(circle, rgba(201,147,58,0.08) 0%, transparent 70%)',
          transform:'translate(-50%,-50%)',
          animation:'pulseGlow 3s ease-in-out infinite',
        }} />
        <div style={{
          position:'absolute', left:'20%', top:'30%',
          width:'300px', height:'300px',
          background:'radial-gradient(circle, rgba(74,143,168,0.06) 0%, transparent 70%)',
          borderRadius:'50%',
        }} />

        {/* ── Livres flottants ──────────────────────────────────────────── */}
        {BOOKS.map(book => (
          <div key={book.id} style={{
            position: 'absolute',
            left: `${book.x}%`,
            top: `${book.y}%`,
            opacity: book.opacity,
            '--rot': `${book.rot}deg`,
            animation: `floatBook ${book.dur}s ease-in-out ${book.del}s infinite, driftX ${book.dur * 1.3}s ease-in-out ${book.del * 0.5}s infinite`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
          }}>
            <BookSVG size={book.s} color={book.color} />
          </div>
        ))}

        {/* ── Sparkles ──────────────────────────────────────────────────── */}
        {sparkles.map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} delay={s.d} size={3 + (i % 3)} />
        ))}

        {/* ── Contenu central ───────────────────────────────────────────── */}
        <div className={phase !== 'enter' ? 'splash-enter' : ''}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            opacity: phase === 'enter' ? 0 : 1,
          }}>

          {/* Logo icône */}
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #c9933a, #e8b55a)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.4rem',
            boxShadow: '0 8px 32px rgba(201,147,58,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}>
            📚
          </div>

          {/* Titre */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textShadow: '0 2px 20px rgba(201,147,58,0.3)',
              animationDelay: '0.15s',
            }}>
              Lecture
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#c9933a',
              letterSpacing: '-0.01em',
              textShadow: '0 2px 20px rgba(201,147,58,0.5)',
            }}>
              & Connaissance
            </div>
          </div>

          {/* Ligne décorative animée */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #c9933a, transparent)',
            animation: 'lineGrow 1s ease-out 0.4s forwards',
            width: 0,
            borderRadius: '1px',
          }} />

          {/* Sous-titre */}
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}>
            Librairie · Papeterie · Abidjan
          </p>

          {/* Barre de progression */}
          <div style={{
            width: '180px',
            height: '3px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '8px',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #c9933a, #e8b55a)',
              borderRadius: '2px',
              animation: 'progressBar 2.4s cubic-bezier(0.4,0,0.2,1) 0.3s forwards',
              width: 0,
              boxShadow: '0 0 8px rgba(201,147,58,0.6)',
            }} />
          </div>

        </div>

        {/* ── Ligne de livres défilant en bas ─────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: 0,
          right: 0,
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.25,
          overflow: 'hidden',
        }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              animation: `driftX ${8 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              flexShrink: 0,
            }}>
              <BookSVG
                size={0.7 + (i % 3) * 0.15}
                color={['#c9933a','#4a8fa8','#8a6a9a','#5a9a6a','#d4663a'][i % 5]}
              />
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
