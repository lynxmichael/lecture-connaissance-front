const KEY = 'lc_recently_viewed';
const MAX = 12;

export function addRecentlyViewed(item) {
  try {
    const history = getRecentlyViewed();
    const filtered = history.filter(h => !(h.id === item.id && h.type === item.type));
    const updated  = [item, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function clearRecentlyViewed() {
  try { localStorage.removeItem(KEY); } catch {}
}
