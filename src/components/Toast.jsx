import { useState, useEffect, useCallback } from 'react';

let addToast = null;

export function showToast(message, type = 'info') {
  if (addToast) addToast(message, type);
}

const ICONS  = { success:'✓', error:'✕', info:'ℹ' };
const COLORS = {
  success: 'bg-[#2d7a4f] text-white',
  error:   'bg-[#d44040] text-white',
  info:    'bg-[#0f1923] text-white',
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold max-w-xs ${COLORS[t.type]||COLORS.info}`}
          style={{animation:'slideUp .3s ease both'}}>
          <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black flex-shrink-0">
            {ICONS[t.type]||'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(12px) scale(.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
