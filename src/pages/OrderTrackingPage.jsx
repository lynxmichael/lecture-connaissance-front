import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatCFA } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';
import OrderDevis from '../components/OrderDevis';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';

const TIMELINE = [
  { statut:'Validée',  icon:'✅', label:'Commande confirmée',   desc:'Votre paiement a été reçu.' },
  { statut:'En cours', icon:'⚙️', label:'En préparation',       desc:'Votre colis est en cours de préparation.' },
  { statut:'Expédiée', icon:'🚚', label:'Expédiée',             desc:'Votre colis est en route.' },
];

function Timeline({ statut }) {
  const steps = TIMELINE;
  const currentIdx = statut === 'Annulée' ? -1 : steps.findIndex(s => s.statut === statut);
  const doneIdx    = statut === 'Expédiée' ? 2 : currentIdx;

  if (statut === 'Annulée') return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
      <span className="text-2xl">❌</span>
      <div>
        <p className="font-bold text-[#d44040]">Commande annulée</p>
        <p className="text-gray-500 text-sm">Cette commande a été annulée.</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const done    = i <= doneIdx;
        const current = i === doneIdx;
        return (
          <div key={step.statut} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              {i > 0 && <div className={`flex-1 h-1 ${done ? 'bg-[#2d7a4f]' : 'bg-[#e8e0d4]'} transition-all`}/>}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all flex-shrink-0 ${
                done
                  ? current ? 'bg-[#2d7a4f] text-white ring-4 ring-[#2d7a4f]/20 scale-110' : 'bg-[#2d7a4f] text-white'
                  : 'bg-[#e8e0d4] text-gray-400'
              }`}>
                {step.icon}
              </div>
              {i < steps.length-1 && <div className={`flex-1 h-1 ${i < doneIdx ? 'bg-[#2d7a4f]' : 'bg-[#e8e0d4]'}`}/>}
            </div>
            <div className={`mt-2 text-center px-1 ${current ? 'text-[#0f1923]' : done ? 'text-[#2d7a4f]' : 'text-gray-400'}`}>
              <p className={`text-xs font-bold ${current ? '' : ''}`}>{step.label}</p>
              {current && <p className="text-[10px] mt-0.5 text-gray-500 leading-tight">{step.desc}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { user }   = useAuth();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [devisId,  setDevisId]  = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then(r => { setOrders(r.data); if (r.data.length > 0 && !selected) setSelected(r.data[0]); })
      .catch(() => showToast('Erreur de chargement', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      showToast('Commande annulée', 'success');
      fetchOrders();
    } catch (err) { showToast(err.response?.data?.error || 'Erreur', 'error'); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-400">
      <div className="text-4xl animate-spin mb-3">⟳</div><p>Chargement…</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Mon espace</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>Suivi de commandes</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e8e0d4] rounded-2xl">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 mb-5">Vous n'avez pas encore passé de commande.</p>
          <Link to="/catalog" className="bg-[#0f1923] text-white px-6 py-2.5 rounded-xl hover:bg-[#c9933a] transition font-bold">Découvrir le catalogue</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Liste commandes */}
          <div className="lg:w-80 flex-shrink-0 space-y-3">
            {orders.map(order => (
              <button key={order.id} onClick={() => setSelected(order)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  selected?.id === order.id
                    ? 'border-[#c9933a] bg-amber-50/50 shadow-md'
                    : 'border-[#e8e0d4] bg-white hover:border-[#c9933a]/50 hover:bg-[#faf7f2]'
                }`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-black text-xs text-[#0f1923]">{order.numero_commande || `#${order.id}`}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.statut==='Expédiée' ? 'bg-green-100 text-green-700'
                    : order.statut==='Annulée' ? 'bg-red-100 text-red-600'
                    : order.statut==='Validée' ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>{order.statut}</span>
                </div>
                <p className="text-xs text-gray-500">{order.date_commande}</p>
                <p className="font-bold text-[#0f1923] mt-1">{formatCFA(order.total)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{order.items?.length || 0} article{(order.items?.length||0)>1?'s':''}</p>
              </button>
            ))}
          </div>

          {/* Détail commande */}
          {selected && (
            <div className="flex-1 space-y-5">
              {/* Timeline */}
              <div className="bg-white border border-[#e8e0d4] rounded-2xl p-6 shadow-sm">
                <h2 className="font-black text-[#0f1923] mb-1" style={{fontFamily:'Playfair Display,serif'}}>
                  {selected.numero_commande || `Commande #${selected.id}`}
                </h2>
                <p className="text-gray-400 text-xs mb-5">Passée le {selected.date_commande}</p>
                <Timeline statut={selected.statut} />
              </div>

              {/* Articles */}
              <div className="bg-white border border-[#e8e0d4] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-[#faf7f2] border-b border-[#e8e0d4]">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Articles commandés</p>
                </div>
                <div className="divide-y divide-[#e8e0d4]">
                  {selected.items?.map(item => {
                    const isFourn = item.item_type === 'fourniture';
                    const nom     = item.nom_produit || (isFourn ? item.fourniture?.nom : item.book?.titre);
                    const emoji   = isFourn ? getEmoji(item.fourniture ?? {}) : (item.book?.image || '📖');
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <Link to={isFourn ? `/fourniture/${item.fourniture_id}` : `/book/${item.book_id}`}
                          className="text-2xl hover:scale-110 transition-transform">{emoji}</Link>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#0f1923] text-sm line-clamp-1">{nom}</p>
                          <p className="text-gray-400 text-xs">
                            {isFourn ? item.fourniture?.categorie : item.book?.auteur}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-gray-500 text-xs">×{item.quantite}</p>
                          <p className="font-bold text-[#0f1923] text-sm">{formatCFA(item.prix_unitaire * item.quantite)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-3 bg-[#faf7f2] border-t border-[#e8e0d4] flex justify-between font-black text-[#0f1923]">
                  <span>Total</span><span>{formatCFA(selected.total)}</span>
                </div>
              </div>

              {/* Adresse */}
              <div className="bg-white border border-[#e8e0d4] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Livraison</p>
                <p className="font-semibold text-[#0f1923]">{selected.client_nom}</p>
                <p className="text-gray-600 text-sm mt-1">📍 {selected.adresse}</p>
                {selected.telephone && <p className="text-gray-600 text-sm mt-1">📞 {selected.telephone}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setDevisId(devisId===selected.id ? null : selected.id)}
                  className="flex items-center gap-2 bg-[#0f1923] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#c9933a] transition text-sm">
                  📄 {devisId===selected.id ? 'Fermer le devis' : 'Bon de commande'}
                </button>
                {selected.statut !== 'Expédiée' && selected.statut !== 'Annulée' && (
                  <button onClick={() => handleCancel(selected.id)}
                    className="px-5 py-2.5 text-[#d44040] border-2 border-red-200 rounded-xl font-semibold hover:bg-red-50 transition text-sm">
                    ✕ Annuler
                  </button>
                )}
              </div>

              {devisId === selected.id && (
                <OrderDevis order={{
                  ...selected,
                  client_telephone: selected.telephone,
                  client_email:     user?.email,
                }} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
