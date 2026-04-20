import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import OrderDevis from '../components/OrderDevis';
import { showToast } from '../components/Toast';
import { formatCFA } from '../utils/currency';

export default function OrdersPage() {
  const { user }   = useAuth();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState({});
  const [devisId,  setDevisId]  = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => showToast('Erreur de chargement','error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      showToast('Commande annulée','success');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.error||'Erreur','error');
    }
  };

  const enrichOrder = (order) => ({
    ...order,
    client_telephone: order.telephone,
    client_email:     user?.email,
  });

  const statusColors = {
    'En cours': 'bg-amber-50 text-amber-700 border-amber-200',
    'Validée':  'bg-blue-50 text-blue-700 border-blue-200',
    'Expédiée': 'bg-green-50 text-green-700 border-green-200',
    'Annulée':  'bg-red-50 text-red-500 border-red-200',
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">
      <div className="text-4xl animate-spin mb-3">⟳</div>
      <p>Chargement de vos commandes…</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Mon espace</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          Mes commandes
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e8e0d4] rounded-2xl">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 mb-5">Vous n'avez pas encore passé de commande.</p>
          <Link to="/catalog"
            className="bg-[#0f1923] text-white px-6 py-2.5 rounded-xl hover:bg-[#c9933a] transition font-semibold">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
              {/* En-tête */}
              <div
                className="flex flex-wrap justify-between items-center px-5 py-4 cursor-pointer hover:bg-[#faf7f2] transition gap-3"
                onClick={() => setExpanded(e => ({...e,[order.id]:!e[order.id]}))}
              >
                <div>
                  <p className="font-black text-[#0f1923] text-sm" style={{fontFamily:'Playfair Display,serif'}}>
                    {order.numero_commande || `Commande #${order.id}`}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{order.date_commande}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[order.statut]||'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {order.statut}
                  </span>
                  <span className="font-black text-[#0f1923]">{formatCFA(order.total)}</span>
                  <span className="text-gray-300 text-sm">{expanded[order.id]?'▲':'▼'}</span>
                </div>
              </div>

              {/* Détail */}
              {expanded[order.id] && (
                <div className="border-t border-[#e8e0d4] px-5 py-5 bg-[#faf7f2]">
                  <div className="space-y-3 mb-4">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.book?.image||'📖'}</span>
                          <div>
                            <Link to={`/book/${item.book_id}`}
                              className="font-semibold text-[#0f1923] hover:text-[#c9933a] transition">
                              {item.book?.titre}
                            </Link>
                            <p className="text-gray-500 text-xs">{item.book?.auteur}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">×{item.quantite}</p>
                          <p className="font-bold text-[#0f1923]">{formatCFA(item.prix_unitaire*item.quantite)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-black text-[#0f1923] border-t border-[#e8e0d4] pt-3 mt-3">
                    <span>Total</span>
                    <span>{formatCFA(order.total)}</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">📍 {order.adresse}</p>
                  {order.telephone && (
                    <p className="text-xs text-gray-500 mt-1">📞 {order.telephone}</p>
                  )}

                  <div className="flex gap-3 mt-5 flex-wrap">
                    <button
                      onClick={() => setDevisId(devisId===order.id ? null : order.id)}
                      className="flex items-center gap-2 bg-[#0f1923] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#c9933a] transition font-semibold">
                      📄 {devisId===order.id ? 'Fermer le devis' : 'Mon bon de commande'}
                    </button>

                    {order.statut!=='Expédiée' && order.statut!=='Annulée' && (
                      <button onClick={() => handleCancel(order.id)}
                        className="text-[#d44040] text-sm hover:underline self-center">
                        Annuler
                      </button>
                    )}
                  </div>

                  {devisId===order.id && (
                    <div className="mt-6">
                      <OrderDevis order={enrichOrder(order)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
