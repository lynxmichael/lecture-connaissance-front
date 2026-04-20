import { CATEGORIES } from '../utils/fournitures';
import { formatCFA } from '../utils/currency';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { showToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import OrderDevis from '../components/OrderDevis';

const STATUTS = ['En cours', 'Validée', 'Expédiée', 'Annulée'];
const RAYONS  = ['Informatique','Sciences','Littérature','Histoire','Arts','Philosophie'];
const EMPTY   = { titre:'',auteur:'',isbn:'',editeur:'',prix:'',quantite:'',rayon:'',annee:'',description:'' };
const EMPTY_PROMO = {
  book_id:'', name:'', type:'percentage', value:'',
  start_at:'', end_at:'', is_active:true,
  conditions:{ min_stock:'', max_stock:'', min_sales:'' }
};

/* ── Mini bar chart ──────────────────────────────────────────────────────── */
function MiniBar({ label, value, max, color = 'bg-blue-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 truncate text-gray-600 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right font-semibold text-gray-700 flex-shrink-0">{value}</span>
    </div>
  );
}

/* ── Sparkline CA 7 jours ────────────────────────────────────────────────── */
function Sparkline({ data }) {
  if (!data?.length) return <p className="text-gray-400 text-sm">Pas encore de données</p>;
  const max = Math.max(...data.map(d => d.ca), 1);
  const W = 280, H = 60, pad = 6;
  const pts = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.ca / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
          const y = H - pad - ((d.ca / max) * (H - pad * 2));
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="#3b82f6" />
              <title>{d.date} — {formatCFA(d.ca)}</title>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{data[0]?.date}</span>
        <span>{data[data.length-1]?.date}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [tab,        setTab]       = useState('dashboard');
  const [books,      setBooks]     = useState([]);
  const [orders,     setOrders]    = useState([]);
  const [stats,      setStats]     = useState(null);
  const [promos,     setPromos]    = useState([]);
  const [fournitures, setFournitures] = useState([]);
  const [fForm,       setFForm]       = useState({ nom:'',categorie:'',sous_categorie:'',marque:'',reference:'',description:'',prix:'',quantite:'',image:'',promotion:0 });
  const [editFId,     setEditFId]     = useState(null);
  const [savingF,     setSavingF]     = useState(false);
  const [searchFourn, setSearchFourn] = useState('');
  const [form,       setForm]      = useState(EMPTY);
  const [promoForm,  setPromoForm] = useState(EMPTY_PROMO);
  const [editId,     setEditId]    = useState(null);
  const [editPromoId,setEditPromoId]=useState(null);
  const [saving,     setSaving]    = useState(false);
  const [savingPromo,setSavingPromo]=useState(false);
  const [searchBook, setSearchBook]=useState('');
  const [searchOrder,setSearchOrder]=useState('');
  const [expandOrder,setExpandOrder]=useState({});
  const [devisOrderId,setDevisOrderId]=useState(null);

  const load = useCallback(() => {
    api.get('/books').then(r => setBooks(r.data)).catch(()=>{});
    api.get('/orders').then(r => setOrders(r.data)).catch(()=>{});
    api.get('/admin/stats').then(r => setStats(r.data)).catch(()=>{});
    api.get('/promotions').then(r => setPromos(r.data)).catch(()=>{});
    api.get('/fournitures').then(r => setFournitures(r.data)).catch(()=>{});
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── LIVRES ─────────────────────────────────────────────────────────────── */
  const handleBookSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await api.put(`/books/${editId}`, form); showToast('Livre modifié ✅','success'); }
      else        { await api.post('/books', form);           showToast('Livre ajouté ✅','success'); }
      load(); resetForm();
    } catch (err) {
      const msg = Object.values(err.response?.data?.errors ?? {}).flat().join(' ') || err.response?.data?.message || 'Erreur';
      showToast(msg,'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Supprimer définitivement ce livre ?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(b => b.filter(x => x.id !== id));
      showToast('Livre supprimé','info');
    } catch { showToast('Impossible de supprimer','error'); }
  };

  const handleEdit = book => {
    setEditId(book.id);
    setForm({ titre:book.titre,auteur:book.auteur,isbn:book.isbn,editeur:book.editeur,
              prix:book.prix,quantite:book.quantite,rayon:book.rayon,annee:book.annee??'',description:book.description??'' });
    setTab('livres'); window.scrollTo({ top:0, behavior:'smooth' });
  };

  const resetForm = () => { setEditId(null); setForm(EMPTY); };

  /* ── COMMANDES ──────────────────────────────────────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { statut: newStatus });
      setOrders(o => o.map(x => x.id === orderId ? {...x, statut: newStatus} : x));
      showToast('Statut mis à jour','success');
    } catch (err) { showToast(err.response?.data?.message || 'Erreur','error'); }
  };

  /* ── PROMOTIONS ─────────────────────────────────────────────────────────── */
  const handlePromoSubmit = async e => {
    e.preventDefault(); setSavingPromo(true);
    const payload = {
      ...promoForm,
      conditions: Object.fromEntries(
        Object.entries(promoForm.conditions).filter(([,v]) => v !== '')
      ),
    };
    try {
      if (editPromoId) {
        await api.put(`/promotions/${editPromoId}`, payload);
        showToast('Promotion mise à jour ✅','success');
      } else {
        await api.post('/promotions', payload);
        showToast('Promotion créée ✅','success');
      }
      load(); resetPromoForm();
    } catch (err) {
      const msg = Object.values(err.response?.data?.errors ?? {}).flat().join(' ') || err.response?.data?.message || 'Erreur';
      showToast(msg,'error');
    } finally { setSavingPromo(false); }
  };

  const handleEditPromo = promo => {
    setEditPromoId(promo.id);
    setPromoForm({
      book_id:   promo.promotable_type === 'App\\Models\\Book' ? promo.promotable_id : '',
      name:      promo.name,
      type:      promo.type,
      value:     promo.value,
      start_at:  promo.start_at ? promo.start_at.slice(0,16) : '',
      end_at:    promo.end_at   ? promo.end_at.slice(0,16)   : '',
      is_active: promo.is_active,
      conditions: {
        min_stock:  promo.conditions?.min_stock  ?? '',
        max_stock:  promo.conditions?.max_stock  ?? '',
        min_sales:  promo.conditions?.min_sales  ?? '',
      }
    });
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDeletePromo = async id => {
    if (!confirm('Supprimer cette promotion ?')) return;
    try { await api.delete(`/promotions/${id}`); setPromos(p => p.filter(x => x.id !== id)); showToast('Promotion supprimée','info'); }
    catch { showToast('Erreur suppression','error'); }
  };

  const handleTogglePromo = async id => {
    try {
      const res = await api.patch(`/promotions/${id}/toggle`);
      setPromos(p => p.map(x => x.id === id ? {...x, is_active: res.data.is_active, is_currently_active: res.data.is_currently_active} : x));
    } catch { showToast('Erreur','error'); }
  };

  const resetPromoForm = () => { setEditPromoId(null); setPromoForm(EMPTY_PROMO); };

  /* ── FILTRES ──────────────────────────────────────────────────────────── */
  const filteredBooks  = books.filter(b => b.titre?.toLowerCase().includes(searchBook.toLowerCase()) || b.auteur?.toLowerCase().includes(searchBook.toLowerCase()));
  const filteredOrders = orders.filter(o => String(o.id).includes(searchOrder) || (o.client_nom||'').toLowerCase().includes(searchOrder.toLowerCase()));

  /* ── ONGLET ──────────────────────────────────────────────────────────── */
  const Tab = ({ id, icon, label, badge }) => (
    <button onClick={() => setTab(id)}
      className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab===id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'}`}>
      {icon} {label}
      {badge != null && badge > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>}
    </button>
  );

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">🛠️ Administration</h1>

      <div className="flex border-b mb-8 overflow-x-auto gap-1">
        <Tab id="dashboard"  icon="📊" label="Tableau de bord" />
        <Tab id="analytics"  icon="📈" label="Analytics" />
        <Tab id="livres"     icon="📚" label="Catalogue" badge={stats?.lowStock} />
        <Tab id="promos"     icon="🏷️" label="Promotions" badge={promos.filter(p=>p.is_currently_active).length} />
        <Tab id="commandes"  icon="📦" label="Commandes" badge={orders.filter(o=>o.statut==='En cours').length} />
        <Tab id="fournitures" icon="✏️" label="Fournitures" badge={fournitures.filter(f=>f.quantite<5).length || null} />
      </div>

      {/* ════════════ DASHBOARD ════════════ */}
      {tab === 'dashboard' && (
        <div>
          {!stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {[
                  { label:'Livres',           value:stats.nbBooks,              bg:'bg-blue-50',   border:'border-blue-200',   icon:'📚', color:'text-blue-700' },
                  { label:'Fournitures',       value:stats.nbFournitures??0,     bg:'bg-indigo-50', border:'border-indigo-200', icon:'✏️', color:'text-indigo-700' },
                  { label:'Commandes',         value:stats.nbOrders,             bg:'bg-green-50',  border:'border-green-200',  icon:'📦', color:'text-green-700' },
                  { label:'Clients',           value:stats.nbClients,            bg:'bg-purple-50', border:'border-purple-200', icon:'👥', color:'text-purple-700' },
                  { label:'Chiffre d\'affaires',value:formatCFA(stats.totalCA), bg:'bg-yellow-50', border:'border-yellow-200', icon:'💶', color:'text-yellow-700' },
                  { label:'Stocks faibles',   value:stats.lowStock,             bg:'bg-red-50',    border:'border-red-200',    icon:'⚠️', color:'text-red-700' },
                ].map(({ label, value, bg, border, icon, color }) => (
                  <div key={label} className={`${bg} border ${border} rounded-xl p-4 text-center`}>
                    <div className="text-3xl mb-1">{icon}</div>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Export buttons */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/admin/export/orders`}
                  className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">
                  📥 Exporter commandes (CSV)
                </a>
                <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/admin/export/products`}
                  className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">
                  📊 Exporter catalogue (CSV)
                </a>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Commandes par statut</h3>
                  <div className="space-y-3">
                    {STATUTS.map(s => {
                      const count = stats.statsByStatus?.[s] ?? 0;
                      const pct   = stats.nbOrders > 0 ? (count / stats.nbOrders * 100) : 0;
                      const colors = { 'En cours':'bg-yellow-400','Validée':'bg-blue-400','Expédiée':'bg-green-400','Annulée':'bg-red-400' };
                      return (
                        <div key={s}>
                          <div className="flex justify-between text-sm mb-1"><span>{s}</span><span className="font-semibold">{count}</span></div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[s]} rounded-full`} style={{ width:`${pct}%` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-4">📈 CA 7 derniers jours</h3>
                  <Sparkline data={stats.caLastDays} />
                  {stats.caLastDays?.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Total : <strong>{formatCFA(stats.caLastDays.reduce((s,d)=>s+d.ca,0))}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="border rounded-xl p-5 mt-6">
                <h3 className="font-semibold mb-4">📦 Dernières commandes</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-4">#</th><th className="pb-2 pr-4">Client</th>
                      <th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Total</th>
                      <th className="pb-2">Statut</th>
                     </tr></thead>
                    <tbody>
                      {orders.slice(0,5).map(o => (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 font-mono text-gray-400">#{o.id}</td>
                          <td className="py-2 pr-4">{o.client_nom||'—'}</td>
                          <td className="py-2 pr-4 text-gray-500">{o.date_commande}</td>
                          <td className="py-2 pr-4 font-semibold">{formatCFA(parseFloat(o.total))}</td>
                          <td className="py-2"><StatusBadge statut={o.statut}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length > 5 && (
                    <button onClick={() => setTab('commandes')} className="text-blue-600 text-sm mt-2 hover:underline">
                      Voir toutes les commandes →
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════ ANALYTICS ════════════ */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {!stats ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_,i) => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : (
            <>
              {/* Export buttons */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/admin/export/orders`}
                  className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">
                  📥 Exporter commandes (CSV)
                </a>
                <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/admin/export/products`}
                  className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">
                  📊 Exporter catalogue (CSV)
                </a>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top ventes */}
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">🏆 Top 10 ventes</h3>
                  <p className="text-xs text-gray-400 mb-4">Livres les plus vendus (unités)</p>
                  {stats.topSelling?.length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucune vente pour l'instant</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.topSelling?.map((b, i) => (
                        <div key={b.book_id} className="flex items-center gap-3 text-sm">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?'bg-yellow-400 text-white':i===1?'bg-gray-300 text-gray-700':i===2?'bg-orange-300 text-white':'bg-gray-100 text-gray-500'}`}>
                            {i+1}
                          </span>
                          <span className="text-lg">{b.image||'📖'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{b.titre}</p>
                            <p className="text-xs text-gray-400">{b.auteur}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-blue-600">{b.total_sold} ex.</p>
                            <p className="text-xs text-gray-400">{formatCFA(b.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CA par rayon */}
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">💰 CA par rayon</h3>
                  <p className="text-xs text-gray-400 mb-4">Chiffre d'affaires par catégorie</p>
                  {stats.revenueByRayon?.length === 0 ? (
                    <p className="text-gray-400 text-sm">Pas encore de données</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.revenueByRayon?.map(r => (
                        <MiniBar
                          key={r.rayon}
                          label={r.rayon}
                          value={`${formatCFA(r.revenue)}`}
                          max={stats.revenueByRayon[0]?.revenue || 1}
                          color="bg-green-500"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Top vues */}
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">👁 Top consultations</h3>
                  <p className="text-xs text-gray-400 mb-4">Pages produit les plus visitées</p>
                  {stats.topViewed?.filter(b=>b.view_count>0).length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucune vue enregistrée</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.topViewed?.filter(b=>b.view_count>0).map(b => (
                        <MiniBar
                          key={b.id}
                          label={b.titre}
                          value={b.view_count}
                          max={stats.topViewed.filter(x=>x.view_count>0)[0]?.view_count || 1}
                          color="bg-purple-500"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Top panier */}
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">🛒 Ajouts au panier</h3>
                  <p className="text-xs text-gray-400 mb-4">Livres le plus souvent ajoutés</p>
                  {stats.topCart?.filter(b=>b.add_to_cart_count>0).length === 0 ? (
                    <p className="text-gray-400 text-sm">Pas encore de données</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.topCart?.filter(b=>b.add_to_cart_count>0).map(b => (
                        <MiniBar
                          key={b.id}
                          label={b.titre}
                          value={b.add_to_cart_count}
                          max={stats.topCart.filter(x=>x.add_to_cart_count>0)[0]?.add_to_cart_count || 1}
                          color="bg-orange-400"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════ CATALOGUE ════════════ */}
      {tab === 'livres' && (
        <div>
          <form onSubmit={handleBookSubmit} className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editId ? '✏️ Modifier le livre' : '➕ Ajouter un livre'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key:'titre',    label:'Titre *',    type:'text'   },
                { key:'auteur',   label:'Auteur *',   type:'text'   },
                { key:'isbn',     label:'ISBN *',     type:'text'   },
                { key:'editeur',  label:'Éditeur *',  type:'text'   },
                { key:'prix',     label:'Prix (FCFA) *', type:'number', step:'0.01', min:'0' },
                { key:'quantite', label:'Stock *',    type:'number', min:'0' },
                { key:'annee',    label:'Année',      type:'number', min:'1000' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]} step={f.step} min={f.min}
                    onChange={e => setForm(x => ({...x, [f.key]: e.target.value}))}
                    required={f.label.includes('*')}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rayon *</label>
                <select value={form.rayon} onChange={e => setForm(x => ({...x, rayon: e.target.value}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Choisir…</option>
                  {RAYONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(x => ({...x, description: e.target.value}))}
                required rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition font-medium">
                {saving ? '⏳ Enregistrement…' : editId ? '✏️ Modifier' : '➕ Ajouter'}
              </button>
              {editId && (
                <button type="button" onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-3 mb-4">
            <input type="text" value={searchBook} onChange={e => setSearchBook(e.target.value)}
              placeholder="Rechercher un livre…"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            <span className="self-center text-sm text-gray-400">{filteredBooks.length} livre(s)</span>
          </div>

          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>{['Titre','Auteur','Rayon','Prix','Promo','Stock','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {filteredBooks.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-400">Aucun livre trouvé</td></tr>
                )}
                {filteredBooks.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{b.titre}</td>
                    <td className="px-4 py-3 text-gray-600">{b.auteur}</td>
                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{b.rayon}</span></td>
                    <td className="px-4 py-3 font-semibold">{formatCFA(parseFloat(b.prix))}</td>
                    <td className="px-4 py-3">
                      {b.active_promotion_data ? (
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                          -{b.active_promotion_data.type === 'percentage'
                            ? `${b.active_promotion_data.value}%`
                            : `${parseFloat(b.active_promotion_data.value).toFixed(2)}€`}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${b.quantite===0?'text-red-600':b.quantite<5?'text-orange-500':'text-green-600'}`}>
                        {b.quantite}{b.quantite===0&&' ⚠️'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(b)} className="text-blue-600 hover:underline text-xs">✏️ Modifier</button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline text-xs">🗑️ Supprimer</button>
                        <button onClick={() => { setPromoForm({...EMPTY_PROMO, book_id: b.id}); setTab('promos'); }}
                          className="text-orange-500 hover:underline text-xs">🏷 Promo</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════ PROMOTIONS ════════════ */}
      {tab === 'promos' && (
        <div>
          {/* Formulaire */}
          <form onSubmit={handlePromoSubmit} className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editPromoId ? '✏️ Modifier la promotion' : '➕ Créer une promotion'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Livre */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Livre *</label>
                <select value={promoForm.book_id} onChange={e => setPromoForm(x => ({...x, book_id: e.target.value}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Sélectionner un livre…</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.titre} — {formatCFA(parseFloat(b.prix))}</option>)}
                </select>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom de la promotion *</label>
                <input type="text" value={promoForm.name} onChange={e => setPromoForm(x => ({...x, name: e.target.value}))} required
                  placeholder="Ex: Promo rentrée, Flash sale…"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>

              {/* Type + valeur */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Type *</label>
                  <select value={promoForm.type} onChange={e => setPromoForm(x => ({...x, type: e.target.value}))} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (FCFA)</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-500 mb-1">Valeur *</label>
                  <input type="number" min="0" step="0.01" value={promoForm.value}
                    onChange={e => setPromoForm(x => ({...x, value: e.target.value}))} required
                    placeholder={promoForm.type === 'percentage' ? '20' : '5.00'}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">🗓 Date de début</label>
                <input type="datetime-local" value={promoForm.start_at}
                  onChange={e => setPromoForm(x => ({...x, start_at: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">🗓 Date de fin</label>
                <input type="datetime-local" value={promoForm.end_at}
                  onChange={e => setPromoForm(x => ({...x, end_at: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3 pt-5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={promoForm.is_active}
                    onChange={e => setPromoForm(x => ({...x, is_active: e.target.checked}))}
                    className="sr-only peer"/>
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"/>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform"/>
                </label>
                <span className="text-sm text-gray-700">Promotion active</span>
              </div>
            </div>

            {/* Conditions */}
            <div className="mt-5 border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">🎯 Conditions d'activation (optionnel)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key:'min_stock',  label:'Stock minimum',  placeholder:'Ex: 10', hint:'Actif si stock ≥' },
                  { key:'max_stock',  label:'Stock maximum',  placeholder:'Ex: 50', hint:'Actif si stock ≤' },
                  { key:'min_sales',  label:'Ventes minimum', placeholder:'Ex: 5',  hint:'Actif après N ventes' },
                ].map(c => (
                  <div key={c.key}>
                    <label className="block text-xs text-gray-500 mb-1">{c.label}</label>
                    <input type="number" min="0" value={promoForm.conditions[c.key]}
                      onChange={e => setPromoForm(x => ({...x, conditions:{...x.conditions,[c.key]:e.target.value}}))}
                      placeholder={c.placeholder}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                    <p className="text-xs text-gray-400 mt-0.5">{c.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={savingPromo}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-60 transition font-medium">
                {savingPromo ? '⏳…' : editPromoId ? '✏️ Modifier' : '🏷 Créer'}
              </button>
              {editPromoId && (
                <button type="button" onClick={resetPromoForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
                  Annuler
                </button>
              )}
            </div>
          </form>

          {/* Liste */}
          <div className="space-y-3">
            {promos.length === 0 && <p className="text-center text-gray-400 py-10">Aucune promotion créée</p>}
            {promos.map(p => {
              const book = books.find(b => b.id === p.promotable_id);
              return (
                <div key={p.id} className={`border rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-start gap-4 ${p.is_currently_active ? 'border-green-200' : 'border-gray-200 opacity-75'}`}>
                  {/* Statut */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleTogglePromo(p.id)}
                      className={`relative inline-flex items-center cursor-pointer w-10 h-6 rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${p.is_active ? 'translate-x-5' : 'translate-x-1'}`}/>
                    </button>
                    <span className={`text-xs font-medium ${p.is_currently_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {p.is_currently_active ? '● Actif' : '○ Inactif'}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{p.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.type==='percentage'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>
                        {p.type==='percentage' ? `-${p.value}%` : `-${formatCFA(p.value)}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      📚 {p.book_titre || book?.titre || `Livre #${p.promotable_id}`}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-400 mt-1 flex-wrap">
                      {p.start_at && <span>Du {new Date(p.start_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})}</span>}
                      {p.end_at   && <span>Au {new Date(p.end_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})}</span>}
                      {!p.start_at && !p.end_at && <span>Aucune limite de dates</span>}
                    </div>
                    {p.conditions && Object.keys(p.conditions).length > 0 && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {p.conditions.min_stock !== undefined && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">Stock ≥ {p.conditions.min_stock}</span>
                        )}
                        {p.conditions.max_stock !== undefined && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">Stock ≤ {p.conditions.max_stock}</span>
                        )}
                        {p.conditions.min_sales !== undefined && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">Dès {p.conditions.min_sales} ventes</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEditPromo(p)} className="text-xs text-blue-600 hover:underline">✏️ Modifier</button>
                    <button onClick={() => handleDeletePromo(p.id)} className="text-xs text-red-500 hover:underline">🗑️ Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════ COMMANDES ════════════ */}
      {tab === 'commandes' && (
        <div>
          <div className="flex gap-3 mb-5">
            <input type="text" value={searchOrder} onChange={e => setSearchOrder(e.target.value)}
              placeholder="Rechercher par ID ou nom client…"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            <span className="self-center text-sm text-gray-400">{filteredOrders.length} commande(s)</span>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 && <p className="text-center text-gray-400 py-10">Aucune commande</p>}
            {filteredOrders.map(order => (
              <div key={order.id} className="border rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="flex flex-wrap justify-between items-center px-5 py-4 cursor-pointer hover:bg-gray-50 transition gap-3"
                  onClick={() => setExpandOrder(e => ({...e, [order.id]: !e[order.id]}))}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-400 text-sm">#{order.id}</span>
                    <span className="font-semibold">{order.client_nom || order.user?.name || '—'}</span>
                    <span className="text-gray-400 text-sm hidden sm:inline">{order.date_commande}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold">{formatCFA(parseFloat(order.total))}</span>
                    <StatusBadge statut={order.statut}/>
                    <select value={order.statut} onClick={e => e.stopPropagation()}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
                      {STATUTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    {(order.client_telephone || order.telephone) && (
                      <a href={`tel:${order.client_telephone || order.telephone}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-green-200 transition">
                        📞 {order.client_telephone || order.telephone}
                      </a>
                    )}
                    <span className="text-gray-300 text-sm">{expandOrder[order.id] ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expandOrder[order.id] && (
                  <div className="border-t px-5 py-4 bg-gray-50 text-sm">
                    <div className="flex flex-wrap gap-4 mb-4">
                      <p className="text-gray-500">📍 {order.adresse}</p>
                      {(order.client_telephone || order.telephone) && (
                        <a href={`tel:${order.client_telephone || order.telephone}`}
                          className="flex items-center gap-1.5 font-semibold text-green-700 hover:text-green-900 transition">
                          <span className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">📞</span>
                          {order.client_telephone || order.telephone}
                          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">Appeler</span>
                        </a>
                      )}
                      {order.client_email && (
                        <p className="text-gray-500 flex items-center gap-1">✉️ {order.client_email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>{item.book?.image||'📖'}</span>
                            <div>
                              <p className="font-medium">{item.book?.titre}</p>
                              <p className="text-gray-400 text-xs">{item.book?.auteur}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p>×{item.quantite}</p>
                            <p className="font-semibold">{formatCFA((item.prix_unitaire * item.quantite))}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Bouton devis admin */}
                    <div className="mt-4 pt-3 border-t flex gap-3">
                      <button
                        onClick={() => setDevisOrderId(devisOrderId === order.id ? null : order.id)}
                        className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                        📄 {devisOrderId === order.id ? 'Fermer' : 'Voir le devis'}
                      </button>
                    </div>
                    {devisOrderId === order.id && (
                      <div className="mt-4">
                        <OrderDevis order={{
                          ...order,
                          client_telephone: order.client_telephone || order.telephone,
                        }} isAdmin={true} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════ FOURNITURES ════════════ */}
      {tab === 'fournitures' && (
        <div>
          {/* Formulaire */}
          <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editFId ? '✏️ Modifier la fourniture' : '➕ Ajouter une fourniture'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Nom *</label>
                <input type="text" value={fForm.nom} onChange={e=>setFForm(x=>({...x,nom:e.target.value}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Catégorie *</label>
                <select value={fForm.categorie} onChange={e=>setFForm(x=>({...x,categorie:e.target.value,sous_categorie:''}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 bg-white">
                  <option value="">Choisir…</option>
                  {Object.keys(CATEGORIES).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sous-catégorie</label>
                <select value={fForm.sous_categorie} onChange={e=>setFForm(x=>({...x,sous_categorie:e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 bg-white">
                  <option value="">Aucune</option>
                  {(CATEGORIES[fForm.categorie]?.items||[]).map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              {[
                {key:'marque',    label:'Marque',         type:'text'},
                {key:'reference', label:'Référence',      type:'text'},
                {key:'prix',      label:'Prix (FCFA) *',  type:'number', min:'0'},
                {key:'quantite',  label:'Stock *',        type:'number', min:'0'},
                {key:'promotion', label:'Promo (%)',       type:'number', min:'0',max:'100'},
                {key:'image',     label:'Emoji couverture',type:'text'},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} min={f.min} max={f.max} value={fForm[f.key]}
                    onChange={e=>setFForm(x=>({...x,[f.key]:e.target.value}))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea value={fForm.description} onChange={e=>setFForm(x=>({...x,description:e.target.value}))}
                  rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                disabled={savingF}
                onClick={async()=>{
                  setSavingF(true);
                  try {
                    if(editFId){ await api.put(`/fournitures/${editFId}`,fForm); showToast('Modifié ✅','success'); }
                    else        { await api.post('/fournitures',fForm);          showToast('Ajouté ✅','success'); }
                    load(); setEditFId(null); setFForm({nom:'',categorie:'',sous_categorie:'',marque:'',reference:'',description:'',prix:'',quantite:'',image:'',promotion:0});
                  } catch(err){ showToast(Object.values(err.response?.data?.errors??{}).flat().join(' ')||'Erreur','error'); }
                  finally{ setSavingF(false); }
                }}
                className="bg-[#c9933a] text-white px-6 py-2 rounded-lg hover:bg-[#b8832d] disabled:opacity-60 transition font-medium">
                {savingF?'⏳…':editFId?'✏️ Modifier':'➕ Ajouter'}
              </button>
              {editFId&&<button onClick={()=>{setEditFId(null);setFForm({nom:'',categorie:'',sous_categorie:'',marque:'',reference:'',description:'',prix:'',quantite:'',image:'',promotion:0});}}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Annuler</button>}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <input type="text" value={searchFourn} onChange={e=>setSearchFourn(e.target.value)}
              placeholder="Rechercher une fourniture…"
              className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
            <span className="self-center text-sm text-gray-400">
              {fournitures.filter(f=>f.nom?.toLowerCase().includes(searchFourn.toLowerCase())).length} article(s)
            </span>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>{['Nom','Catégorie','Sous-cat.','Marque','Prix','Promo','Stock','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {fournitures.filter(f=>f.nom?.toLowerCase().includes(searchFourn.toLowerCase())).length===0&&(
                  <tr><td colSpan={8} className="p-6 text-center text-gray-400">Aucune fourniture</td></tr>
                )}
                {fournitures.filter(f=>f.nom?.toLowerCase().includes(searchFourn.toLowerCase())).map(f=>(
                  <tr key={f.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium max-w-[160px] truncate flex items-center gap-2">
                      <span>{f.image||'📦'}</span>{f.nom}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{f.categorie}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{f.sous_categorie||'—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{f.marque||'—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatCFA(f.prix)}</td>
                    <td className="px-4 py-3">
                      {f.active_promotion_data
                        ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">-{f.active_promotion_data.value}{f.active_promotion_data.type==='percentage'?'%':' FCFA'}</span>
                        : f.promotion>0
                          ? <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">-{f.promotion}%</span>
                          : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${f.quantite===0?'text-red-600':f.quantite<5?'text-orange-500':'text-green-600'}`}>
                        {f.quantite}{f.quantite===0&&' ⚠️'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditFId(f.id);setFForm({nom:f.nom,categorie:f.categorie,sous_categorie:f.sous_categorie||'',marque:f.marque||'',reference:f.reference||'',description:f.description||'',prix:f.prix,quantite:f.quantite,image:f.image||'',promotion:f.promotion||0});window.scrollTo({top:0,behavior:'smooth'});}}
                          className="text-blue-600 hover:underline text-xs">✏️ Modifier</button>
                        <button onClick={async()=>{if(!confirm('Supprimer ?'))return;try{await api.delete(`/fournitures/${f.id}`);setFournitures(x=>x.filter(i=>i.id!==f.id));showToast('Supprimé','info');}catch{showToast('Erreur','error');}}}
                          className="text-red-500 hover:underline text-xs">🗑️ Suppr.</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}