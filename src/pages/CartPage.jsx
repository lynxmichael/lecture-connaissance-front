import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { formatCFA } from '../utils/currency';

export default function CartPage() {
  const {
    cart, summary, cartTotal, cartOriginal, cartSavings,
    cartCount, updateQty, removeFromCart, loadingCart,
  } = useCart();
  const navigate = useNavigate();

  const handleUpdateQty = async (item, delta) => {
    const newQty = item.quantite + delta;
    if (newQty < 1) {
      await removeFromCart(item.id);
      showToast('Article retiré du panier', 'info');
    } else {
      await updateQty(item.id, newQty);
    }
  };

  const handleRemove = async (item) => {
    await removeFromCart(item.id);
    showToast(`"${item.product_nom || item.book?.titre || item.fourniture?.nom}" retiré`, 'info');
  };

  if (loadingCart) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-400">
      <div className="text-4xl animate-spin mb-3">⟳</div>
      <p>Chargement du panier…</p>
    </div>
  );

  if (cart.length === 0) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-5">🛒</div>
      <h2 className="text-2xl font-black text-[#0f1923] mb-2" style={{fontFamily:'Playfair Display,serif'}}>
        Votre panier est vide
      </h2>
      <p className="text-gray-500 mb-8 text-sm">Parcourez notre catalogue pour trouver votre prochain livre !</p>
      <Link to="/catalog"
        className="bg-[#0f1923] text-white px-8 py-3 rounded-xl hover:bg-[#c9933a] transition font-semibold">
        Voir le catalogue
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Mon espace</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          Mon panier
          <span className="text-gray-400 font-normal text-xl ml-3">({cartCount} article{cartCount>1?'s':''})</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Articles */}
        <div className="flex-1 space-y-3">
          {cart.map(item => {
            const originalPrice = item.original_price ?? parseFloat(item.book?.prix??0);
            const finalPrice    = item.final_price    ?? originalPrice;
            const hasPromo      = finalPrice < originalPrice - 1;
            const lineTotal     = item.line_total     ?? finalPrice * item.quantite;
            const promo         = item.active_promo;

            return (
              <div key={item.id}
                className="flex items-center gap-4 bg-white border border-[#e8e0d4] rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                <Link to={item.item_type==="fourniture" ? `/fourniture/${item.fourniture_id}` : `/book/${item.book_id}`}
                  className="text-4xl flex-shrink-0 hover:scale-110 transition-transform select-none">
                  {item.book?.image || item.fourniture?.image||'📖'}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={item.item_type==="fourniture" ? `/fourniture/${item.fourniture_id}` : `/book/${item.book_id}`}
                    className="font-bold text-[#0f1923] hover:text-[#c9933a] line-clamp-1 transition">
                    {item.product_nom || item.book?.titre || item.fourniture?.nom}
                  </Link>
                  <p className="text-gray-500 text-sm">{item.book?.auteur || item.fourniture?.categorie || ""}</p>
                  {hasPromo && promo?.name && (
                    <span className="inline-block text-xs bg-red-50 text-[#d44040] border border-red-100 px-2 py-0.5 rounded-full mt-1 font-medium">
                      🏷 {promo.name}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {hasPromo ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">{formatCFA(originalPrice)}</span>
                        <span className="text-sm font-bold text-[#d44040]">{formatCFA(finalPrice)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-[#2d7a4f]">{formatCFA(finalPrice)}</span>
                    )}
                    <span className="text-gray-400 text-xs">/ unité</span>
                  </div>
                </div>

                {/* Quantité */}
                <div className="flex items-center border-2 border-[#e8e0d4] rounded-xl overflow-hidden flex-shrink-0">
                  <button onClick={() => handleUpdateQty(item,-1)}
                    className="w-9 h-9 bg-[#faf7f2] hover:bg-red-50 hover:text-[#d44040] text-xl font-bold transition flex items-center justify-center">
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#0f1923]">{item.quantite}</span>
                  <button onClick={() => handleUpdateQty(item,1)}
                    className="w-9 h-9 bg-[#faf7f2] hover:bg-green-50 hover:text-[#2d7a4f] text-xl font-bold transition flex items-center justify-center">
                    +
                  </button>
                </div>

                {/* Sous-total */}
                <div className="w-28 text-right flex-shrink-0">
                  <p className="font-black text-[#0f1923] text-sm">{formatCFA(lineTotal)}</p>
                  {hasPromo && (
                    <p className="text-xs text-[#2d7a4f] font-medium">
                      -{formatCFA(originalPrice*item.quantite - lineTotal)}
                    </p>
                  )}
                </div>

                <button onClick={()=>handleRemove(item)}
                  className="text-gray-300 hover:text-[#d44040] transition text-xl flex-shrink-0" title="Retirer">
                  🗑️
                </button>
              </div>
            );
          })}

          <Link to="/catalog" className="inline-flex items-center gap-1 text-[#c9933a] hover:underline text-sm mt-2 font-medium">
            ← Continuer mes achats
          </Link>
        </div>

        {/* Récap sticky */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-[#e8e0d4] rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-[#0f1923] mb-5" style={{fontFamily:'Playfair Display,serif'}}>
              Récapitulatif
            </h2>

            <div className="space-y-2 text-sm mb-5">
              {cart.map(item => {
                const fp = item.final_price ?? parseFloat(item.book?.prix??0);
                const lt = item.line_total  ?? fp*item.quantite;
                return (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate mr-2">
                      {item.product_nom || item.book?.titre || item.fourniture?.nom} <span className="text-gray-400">×{item.quantite}</span>
                    </span>
                    <span className="flex-shrink-0 font-medium">{formatCFA(lt)}</span>
                  </div>
                );
              })}
            </div>

            {cartSavings > 10 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 flex justify-between items-center">
                <span className="text-[#2d7a4f] text-sm font-semibold">🎉 Économies</span>
                <span className="text-[#2d7a4f] font-bold text-sm">-{formatCFA(cartSavings)}</span>
              </div>
            )}

            {cartSavings > 10 && (
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Sous-total</span>
                <span className="line-through">{formatCFA(cartOriginal)}</span>
              </div>
            )}

            <div className="border-t border-[#e8e0d4] pt-3 flex justify-between font-black text-lg mb-6 text-[#0f1923]">
              <span>Total</span>
              <span className="text-[#2d7a4f]">{formatCFA(cartTotal)}</span>
            </div>

            <button onClick={() => navigate('/checkout')}
              className="w-full bg-[#0f1923] text-white py-3.5 rounded-xl hover:bg-[#c9933a] transition font-bold text-base active:scale-[0.98]">
              Passer commande →
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">🔒 Commande sécurisée</p>
          </div>
        </div>
      </div>
    </div>
  );
}
