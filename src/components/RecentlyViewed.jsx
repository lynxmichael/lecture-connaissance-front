import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import { formatCFA } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';

export default function RecentlyViewed({ excludeId, excludeType }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const history = getRecentlyViewed()
      .filter(h => !(h.id === excludeId && h.type === excludeType))
      .slice(0, 8);
    setItems(history);
  }, [excludeId, excludeType]);

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-black text-[#0f1923] mb-4" style={{fontFamily:'Playfair Display,serif'}}>
        🕐 Récemment consultés
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4">
        {items.map(item => {
          const emoji = item.type === 'fourniture' ? getEmoji(item) : (item.image || '📖');
          const path  = item.type === 'fourniture' ? `/fourniture/${item.id}` : `/book/${item.id}`;
          return (
            <Link key={`${item.type}-${item.id}`} to={path}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 w-28 bg-white border border-[#e8e0d4] rounded-2xl hover:border-[#c9933a] hover:-translate-y-0.5 transition-all text-center group shadow-sm">
              <span className="text-3xl group-hover:scale-110 transition-transform">{emoji}</span>
              <p className="text-xs font-semibold text-[#0f1923] line-clamp-2 leading-tight" style={{fontFamily:'Playfair Display,serif'}}>
                {item.nom}
              </p>
              <p className="text-xs font-bold text-[#2d7a4f]">{formatCFA(item.prix)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
