import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data);
    } catch { setWishlist([]); }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggle = async (productId, type = 'book') => {
    const payload = type === 'fourniture'
      ? { item_type: 'fourniture', fourniture_id: productId }
      : { item_type: 'book',       book_id: productId };
    const res = await api.post('/wishlist/toggle', payload);
    await fetchWishlist();
    return res.data.in_wishlist;
  };

  const isInWishlist = (productId, type = 'book') =>
    wishlist.some(w =>
      w.item_type === type &&
      (type === 'fourniture' ? w.fourniture_id === productId : w.book_id === productId)
    );

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isInWishlist, refresh: fetchWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};
