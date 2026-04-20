import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart,        setCart]        = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { setCart([]); setSummary(null); return; }
    setLoadingCart(true);
    try {
      const [cartRes, summaryRes] = await Promise.all([
        api.get('/cart'),
        api.get('/cart/summary'),
      ]);
      setCart(Array.isArray(cartRes.data) ? cartRes.data : []);
      setSummary(summaryRes.data);
    } catch {
      setCart([]); setSummary(null);
    } finally {
      setLoadingCart(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // type = 'book' | 'fourniture'
  const addToCart = async (productId, qty = 1, type = 'book') => {
    const payload = type === 'fourniture'
      ? { item_type:'fourniture', fourniture_id: productId, quantite: qty }
      : { item_type:'book',       book_id: productId,        quantite: qty };
    const res = await api.post('/cart', payload);
    await fetchCart();
    return res.data;
  };

  const updateQty = async (cartItemId, quantite) => {
    await api.put(`/cart/${cartItemId}`, { quantite });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = async () => { await fetchCart(); };

  const cartTotal    = summary?.total_final    ?? cart.reduce((s,i) => s+(i.final_price??0)*i.quantite,0);
  const cartOriginal = summary?.total_original ?? cartTotal;
  const cartSavings  = summary?.total_savings  ?? 0;
  const cartCount    = summary?.item_count     ?? cart.reduce((s,i) => s+i.quantite,0);

  return (
    <CartContext.Provider value={{
      cart, summary, cartTotal, cartOriginal, cartSavings, cartCount,
      loadingCart, addToCart, updateQty, removeFromCart, refresh: fetchCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
