import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { showToast } from '../components/Toast';
import { formatCFA } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';

export default function WishlistPage() {
  const { wishlist, toggle } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (item) => {
    const id   = item.item_type === 'fourniture' ? item.fourniture_id : item.book_id;
    const type = item.item_type;
    await toggle(id, type);
    showToast('Retiré des favoris', 'info');
  };

  const handleAddToCart = async (item) => {
    const id   = item.item_type === 'fourniture' ? item.fourniture_id : item.book_id;
    const type = item.item_type;
    try {
      await addToCart(id, 1, type);
      showToast('✅ Ajouté au panier', 'success');
    } catch { showToast('Connectez-vous pour ajouter au panier', 'error'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Mon espace</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          ❤️ Mes favoris
          {wishlist.length > 0 && <span className="text-gray-400 font-normal text-xl ml-3">({wishlist.length})</span>}
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e8e0d4] rounded-2xl">
          <p className="text-6xl mb-4">❤️</p>
          <h2 className="text-xl font-bold text-[#0f1923] mb-2">Aucun favori pour l'instant</h2>
          <p className="text-gray-500 text-sm mb-6">Ajoutez des livres et fournitures à vos favoris pour les retrouver facilement.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/catalog" className="bg-[#0f1923] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#c9933a] transition">
              📚 Catalogue
            </Link>
            <Link to="/fournitures" className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:border-[#c9933a] transition">
              ✏️ Fournitures
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map(item => {
            const product  = item.product;
            const isFourn  = item.item_type === 'fourniture';
            const nom      = isFourn ? product?.nom : product?.titre;
            const sousTitre= isFourn ? (product?.marque || product?.categorie) : product?.auteur;
            const categorie= isFourn ? product?.categorie : product?.rayon;
            const emoji    = isFourn ? getEmoji(product ?? {}) : (product?.image || '📖');
            const prix     = parseFloat(product?.prix || 0);
            const finalPrice = parseFloat(product?.final_price ?? product?.prix ?? 0);
            const hasPromo = finalPrice < prix - 1;
            const path     = isFourn ? `/fourniture/${item.fourniture_id}` : `/book/${item.book_id}`;

            return (
              <div key={item.id} className="bg-white border border-[#e8e0d4] rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
                <Link to={path} className="text-4xl flex-shrink-0 hover:scale-110 transition-transform">{emoji}</Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#c9933a] uppercase tracking-widest">{categorie}</p>
                  <Link to={path} className="font-bold text-[#0f1923] hover:text-[#c9933a] line-clamp-1 transition" style={{fontFamily:'Playfair Display,serif'}}>
                    {nom}
                  </Link>
                  {sousTitre && <p className="text-gray-500 text-xs truncate">{sousTitre}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {hasPromo ? (
                      <>
                        <span className="text-[#d44040] font-bold text-sm">{formatCFA(finalPrice)}</span>
                        <span className="text-gray-400 text-xs line-through">{formatCFA(prix)}</span>
                      </>
                    ) : (
                      <span className="text-[#2d7a4f] font-bold text-sm">{formatCFA(prix)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleAddToCart(item)}
                    disabled={product?.quantite === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      product?.quantite === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0f1923] text-white hover:bg-[#c9933a]'
                    }`}>
                    {product?.quantite === 0 ? 'Rupture' : '🛒 Panier'}
                  </button>
                  <button onClick={() => handleRemove(item)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#d44040] hover:bg-red-50 transition border border-red-200">
                    ✕ Retirer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
