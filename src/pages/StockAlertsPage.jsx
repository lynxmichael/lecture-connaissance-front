import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatCFA } from '../utils/currency';
import { getEmoji } from '../utils/fournitures';
import { showToast } from '../components/Toast';

export default function StockAlertsPage() {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [restocking, setRestocking] = useState({});

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => showToast('Erreur de chargement', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleRestock = async (item) => {
    const qty = prompt(`Quantité à ajouter pour "${item.nom}" (stock actuel : ${item.quantite}) ?`);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) return;
    setRestocking(r => ({ ...r, [item.id+item.type]: true }));
    try {
      const endpoint = item.type === 'fourniture' ? `/fournitures/${item.id}` : `/books/${item.id}`;
      await api.put(endpoint, { quantite: item.quantite + parseInt(qty) });
      showToast(`✅ Stock mis à jour pour "${item.nom}"`, 'success');
      // Refresh
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch { showToast('Erreur lors de la mise à jour', 'error'); }
    finally { setRestocking(r => ({ ...r, [item.id+item.type]: false })); }
  };

  const lowItems = stats?.lowStockItems ?? [];
  const criticalItems = lowItems.filter(i => i.quantite === 0);
  const warningItems  = lowItems.filter(i => i.quantite > 0 && i.quantite < 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#c9933a] text-xs font-bold tracking-widest uppercase mb-1">Administration</p>
        <h1 className="text-3xl font-black text-[#0f1923]" style={{fontFamily:'Playfair Display,serif'}}>
          ⚠️ Alertes de stock
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl animate-spin mb-3">⟳</div>
          <p>Chargement…</p>
        </div>
      ) : lowItems.length === 0 ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">✅</p>
          <h2 className="text-xl font-bold text-[#2d7a4f] mb-2">Tous les stocks sont OK !</h2>
          <p className="text-gray-500 text-sm">Aucun article en rupture ou stock faible.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Total alertes', value:lowItems.length, bg:'bg-amber-50', border:'border-amber-200', color:'text-amber-700' },
              { label:'Rupture totale', value:criticalItems.length, bg:'bg-red-50', border:'border-red-200', color:'text-red-700' },
              { label:'Stock faible', value:warningItems.length, bg:'bg-orange-50', border:'border-orange-200', color:'text-orange-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Ruptures totales */}
          {criticalItems.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-[#d44040] mb-3" style={{fontFamily:'Playfair Display,serif'}}>
                <span className="w-3 h-3 bg-[#d44040] rounded-full inline-block animate-pulse"/> Rupture de stock
              </h2>
              <div className="space-y-2">
                {criticalItems.map(item => (
                  <StockRow key={item.id+item.type} item={item} onRestock={handleRestock} restocking={restocking} />
                ))}
              </div>
            </div>
          )}

          {/* Stock faible */}
          {warningItems.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-amber-600 mb-3" style={{fontFamily:'Playfair Display,serif'}}>
                <span className="w-3 h-3 bg-amber-400 rounded-full inline-block"/> Stock faible (moins de 5)
              </h2>
              <div className="space-y-2">
                {warningItems.map(item => (
                  <StockRow key={item.id+item.type} item={item} onRestock={handleRestock} restocking={restocking} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StockRow({ item, onRestock, restocking }) {
  const isFourn = item.type === 'fourniture';
  const emoji   = isFourn ? getEmoji(item) : (item.image || '📖');
  const path    = isFourn ? `/fourniture/${item.id}` : `/book/${item.id}`;

  return (
    <div className={`flex items-center gap-4 bg-white border-2 rounded-2xl px-5 py-4 shadow-sm ${
      item.quantite === 0 ? 'border-red-200' : 'border-orange-200'
    }`}>
      <Link to={path} className="text-3xl flex-shrink-0 hover:scale-110 transition">{emoji}</Link>
      <div className="flex-1 min-w-0">
        <Link to={path} className="font-bold text-[#0f1923] hover:text-[#c9933a] transition line-clamp-1"
          style={{fontFamily:'Playfair Display,serif'}}>
          {item.nom}
        </Link>
        <p className="text-xs text-gray-400">
          {isFourn ? 'Fourniture' : 'Livre'}
          {item.categorie && ` · ${item.categorie}`}
        </p>
      </div>

      {/* Stock badge */}
      <div className="text-center flex-shrink-0">
        <p className={`text-2xl font-black ${item.quantite === 0 ? 'text-[#d44040]' : 'text-amber-600'}`}>
          {item.quantite}
        </p>
        <p className="text-[10px] text-gray-400">en stock</p>
      </div>

      {/* Restock button */}
      <button
        onClick={() => onRestock(item)}
        disabled={restocking[item.id + item.type]}
        className="flex-shrink-0 flex items-center gap-2 bg-[#0f1923] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#c9933a] transition disabled:opacity-60"
      >
        {restocking[item.id + item.type]
          ? <span className="animate-spin">⏳</span>
          : '📦'}
        Réapprovisionner
      </button>
    </div>
  );
}
