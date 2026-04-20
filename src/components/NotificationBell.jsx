import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const TYPE_ICONS = { success:'✅', error:'❌', info:'📢', warning:'⚠️', order:'📦', promo:'🏷️' };
const TYPE_COLORS = {
  success:'text-green-700 bg-green-50 border-green-200',
  error:  'text-red-700 bg-red-50 border-red-200',
  info:   'text-blue-700 bg-blue-50 border-blue-200',
  warning:'text-amber-700 bg-amber-50 border-amber-200',
  order:  'text-indigo-700 bg-indigo-50 border-indigo-200',
  promo:  'text-[#c9933a] bg-amber-50 border-amber-200',
};

export default function NotificationBell() {
  const { notifications, unread, markAllRead, remove, clear } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && unread > 0) setTimeout(markAllRead, 1500);
  };

  const relTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60)  return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#d44040] text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-0.5 animate-bounce">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#e8e0d4] rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e0d4] bg-[#faf7f2]">
            <p className="font-bold text-sm text-[#0f1923]">
              Notifications
              {unread > 0 && <span className="ml-2 bg-[#d44040] text-white text-[10px] px-1.5 py-0.5 rounded-full">{unread}</span>}
            </p>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button onClick={clear} className="text-xs text-gray-400 hover:text-[#d44040] transition">
                  Tout effacer
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#e8e0d4]/50 transition ${
                    n.read ? 'opacity-60' : 'bg-white'
                  }`}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0f1923] leading-snug">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{relTime(n.time)}</p>
                  </div>
                  <button onClick={() => remove(n.id)}
                    className="text-gray-300 hover:text-[#d44040] text-xs flex-shrink-0 mt-0.5 transition">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
