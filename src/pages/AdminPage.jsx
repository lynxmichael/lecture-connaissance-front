import { CATEGORIES } from '../utils/fournitures';
<<<<<<< HEAD
import { formatCFA } from '../utils/currency';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
=======
import { useAuth } from '../contexts/AuthContext';
import { formatCFA } from '../utils/currency';
import { useEffect, useState, useCallback, useRef } from 'react';
>>>>>>> 294c6dc (Initial commit)
import api from '../api/client';
import { showToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import OrderDevis from '../components/OrderDevis';
<<<<<<< HEAD

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
=======
import PayoutsPanel from '../components/PayoutsPanel';

const STATUTS  = ['En cours','Validée','Expédiée','Annulée'];
const RAYONS   = ['Informatique','Sciences','Littérature','Histoire','Arts','Philosophie'];
const EMPTY    = { titre:'',auteur:'',isbn:'',editeur:'',prix:'',quantite:'',rayon:'',annee:'',description:'',image:'' };
const EMPTY_F  = { nom:'',categorie:'',sous_categorie:'',marque:'',reference:'',description:'',prix:'',quantite:'',image:'',promotion:0 };
const EMPTY_PROMO = { book_id:'',name:'',type:'percentage',value:'',start_at:'',end_at:'',is_active:true,conditions:{min_stock:'',max_stock:'',min_sales:''} };
const API_URL  = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api','');

/* ── Galerie multi-photos ──────────────────────────────────────────────────── */
function MultiImageUploader({ itemType, itemId, existingImages=[], pendingFiles=[], onFilesAdd, onDeleteExisting, onSetMain, uploading }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const validateAndAdd = (files) => {
    const valid = [];
    for (const f of files) {
      if (!f.type.startsWith('image/'))        { showToast(`${f.name} : format invalide`, 'error'); continue; }
      if (f.size > 5 * 1024 * 1024)            { showToast(`${f.name} : trop lourde (max 5 Mo)`, 'error'); continue; }
      valid.push(f);
    }
    if (valid.length) onFilesAdd(valid);
  };

  const imgSrc = (url) => url.startsWith('/storage') ? BASE_URL + url : url;

  return (
    <div className="md:col-span-2">
      <label className="block text-xs text-gray-500 mb-2 font-medium">
        📷 Photos du produit
        <span className="ml-2 text-gray-400 font-normal">({existingImages.length + pendingFiles.length} photo{existingImages.length + pendingFiles.length !== 1 ? 's' : ''} · première = couverture)</span>
      </label>

      {/* Grille des photos existantes + en attente */}
      {(existingImages.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
          {/* Photos déjà enregistrées */}
          {existingImages.map((img, i) => (
            <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 ${img.is_main ? 'border-[#c9933a] shadow-md' : 'border-gray-200'}`}>
              <img src={imgSrc(img.url)} alt={`Photo ${i+1}`} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {!img.is_main && (
                  <button onClick={() => onSetMain(img.id)} title="Définir comme couverture"
                    className="bg-[#c9933a] text-white text-[10px] font-bold px-2 py-1 rounded-full hover:bg-[#b8832d] transition">
                    ⭐ Couverture
                  </button>
                )}
                <button onClick={() => onDeleteExisting(img.id)} title="Supprimer"
                  className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-600 transition">
                  🗑 Supprimer
                </button>
              </div>
              {img.is_main && (
                <span className="absolute top-1 left-1 bg-[#c9933a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  ★ Couverture
                </span>
              )}
            </div>
          ))}

          {/* Fichiers en attente d'upload */}
          {pendingFiles.map((f, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-24 object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onClick={() => onFilesAdd(pendingFiles.filter((_,j)=>j!==i), true)}
                  className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  ✕ Retirer
                </button>
              </div>
              {existingImages.length === 0 && i === 0 && (
                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  ★ Couverture
                </span>
              )}
              <span className="absolute bottom-0 inset-x-0 bg-blue-600/80 text-white text-[9px] text-center py-0.5 font-medium">
                ⏳ À uploader
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Zone drag & drop */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); validateAndAdd([...e.dataTransfer.files]); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
          ${dragOver ? 'border-[#c9933a] bg-amber-50 scale-[1.01]' : 'border-gray-200 hover:border-[#c9933a] hover:bg-amber-50/20'}`}
        style={{ minHeight: '80px' }}
      >
        <div className="flex flex-col items-center justify-center py-5 text-gray-400">
          {uploading ? (
            <>
              <div className="w-7 h-7 border-3 border-[#c9933a] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-medium text-[#c9933a]">Upload en cours…</p>
            </>
          ) : (
            <>
              <span className="text-2xl mb-1">📁</span>
              <p className="text-xs font-medium text-gray-600">Glisser des photos ici ou <span className="text-[#c9933a] underline">parcourir</span></p>
              <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, WEBP · max 5 Mo · plusieurs fichiers acceptés</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
          multiple className="hidden"
          onChange={e => { validateAndAdd([...e.target.files]); e.target.value=''; }}
        />
      </div>
    </div>
  );
}

/* ── Mini bar chart ─────────────────────────────────────────────────────────── */
function MiniBar({ label, value, max, color='bg-blue-500' }) {
>>>>>>> 294c6dc (Initial commit)
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 truncate text-gray-600 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
<<<<<<< HEAD
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
=======
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
>>>>>>> 294c6dc (Initial commit)
      </div>
      <span className="w-12 text-right font-semibold text-gray-700 flex-shrink-0">{value}</span>
    </div>
  );
}

<<<<<<< HEAD
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
=======
/* ── Sparkline CA 7 jours ───────────────────────────────────────────────────── */
function Sparkline({ data }) {
  if (!data?.length) return <p className="text-gray-400 text-sm">Pas encore de données</p>;
  const max = Math.max(...data.map(d => d.ca), 1);
  const W=280, H=60, pad=6;
  const pts = data.map((d,i) => {
    const x = pad + (i / Math.max(data.length-1,1)) * (W-pad*2);
    const y = H - pad - ((d.ca/max) * (H-pad*2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round"/>
        {data.map((d,i) => {
          const x = pad+(i/Math.max(data.length-1,1))*(W-pad*2);
          const y = H-pad-((d.ca/max)*(H-pad*2));
          return <g key={i}><circle cx={x} cy={y} r="3" fill="#3b82f6"/><title>{d.date} — {formatCFA(d.ca)}</title></g>;
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{data[0]?.date}</span><span>{data[data.length-1]?.date}</span>
>>>>>>> 294c6dc (Initial commit)
      </div>
    </div>
  );
}

<<<<<<< HEAD
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
=======
/* ════════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [tab,         setTab]        = useState('dashboard');
  const [books,       setBooks]      = useState([]);
  const [orders,      setOrders]     = useState([]);
  const [stats,       setStats]      = useState(null);
  const [promos,      setPromos]     = useState([]);
  const [fournitures, setFournitures]= useState([]);

  /* Livres */
  const [form,         setForm]      = useState(EMPTY);
  const [editId,       setEditId]    = useState(null);
  const [saving,       setSaving]    = useState(false);
  const [bookFiles,    setBookFiles]  = useState([]);
  const [uploadingBook,setUploadingBook]=useState(false);
  const [searchBook,   setSearchBook]= useState('');

  /* Fournitures */
  const [fForm,        setFForm]     = useState(EMPTY_F);
  const [editFId,      setEditFId]   = useState(null);
  const [savingF,      setSavingF]   = useState(false);
  const [fournFiles,   setFournFiles] = useState([]);
  const [uploadingF,   setUploadingF]= useState(false);
  const [searchFourn,  setSearchFourn]=useState('');

  /* Promotions */
  const [promoForm,    setPromoForm]  = useState(EMPTY_PROMO);
  const [editPromoId,  setEditPromoId]= useState(null);
  const [savingPromo,  setSavingPromo]= useState(false);

  /* Commandes */
  const [searchOrder,  setSearchOrder]= useState('');
  const [expandOrder,  setExpandOrder]= useState({});
  const [devisOrderId, setDevisOrderId]=useState(null);

  const load = useCallback(() => {
    // /admin/* : uniquement les produits du libraire connecté (le catalogue
    // public /books et /fournitures contient ceux de toutes les librairies)
    api.get('/admin/books').then(r=>setBooks(r.data)).catch(()=>{});
    api.get('/orders').then(r=>setOrders(r.data)).catch(()=>{});
    api.get('/admin/stats').then(r=>setStats(r.data)).catch(()=>{});
    api.get('/promotions').then(r=>setPromos(r.data)).catch(()=>{});
    api.get('/admin/fournitures').then(r=>setFournitures(r.data)).catch(()=>{});
>>>>>>> 294c6dc (Initial commit)
  }, []);

  useEffect(() => { load(); }, [load]);

<<<<<<< HEAD
  /* ── LIVRES ─────────────────────────────────────────────────────────────── */
  const handleBookSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await api.put(`/books/${editId}`, form); showToast('Livre modifié ✅','success'); }
      else        { await api.post('/books', form);           showToast('Livre ajouté ✅','success'); }
      load(); resetForm();
    } catch (err) {
      const msg = Object.values(err.response?.data?.errors ?? {}).flat().join(' ') || err.response?.data?.message || 'Erreur';
=======
  // Export CSV authentifié (le lien direct n'envoyait pas le jeton → erreur 401)
  const downloadExport = async (type) => {
    try {
      const res = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type === 'orders' ? 'commandes' : 'produits'}-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Impossible de générer l'export", 'error');
    }
  };

  /* ── Helpers images ─────────────────────────────────────────────────────── */
  const uploadImages = async (files, itemType, itemId, setUploading) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images[]', f));
      fd.append('item_type', itemType);
      fd.append('item_id',   itemId);
      await api.post('/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(`📷 ${files.length} photo(s) uploadée(s) ✅`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const deleteProductImage = async (imageId, isBook) => {
    try {
      await api.delete(`/product-images/${imageId}`);
      showToast('Photo supprimée', 'info');
      if (isBook) setBooks(bs => bs.map(b => b.id === editId ? { ...b, images: b.images.filter(i => i.id !== imageId) } : b));
      else setFournitures(fs => fs.map(f => f.id === editFId ? { ...f, images: f.images.filter(i => i.id !== imageId) } : f));
      load();
    } catch { showToast('Erreur suppression photo', 'error'); }
  };

  const setMainImage = async (imageId, isBook) => {
    try {
      await api.patch(`/product-images/${imageId}/main`);
      showToast('Photo de couverture mise à jour ✅', 'success');
      load();
    } catch { showToast('Erreur', 'error'); }
  };

  /* ── LIVRES ──────────────────────────────────────────────────────────────── */
  const handleBookSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      let savedBook;
      if (editId) {
        const r = await api.put(`/books/${editId}`, form);
        savedBook = r.data;
        showToast('Livre modifié ✅','success');
      } else {
        const r = await api.post('/books', form);
        savedBook = r.data;
        showToast('Livre ajouté ✅','success');
      }
      if (bookFiles.length) {
        await uploadImages(bookFiles, 'book', savedBook.id ?? editId, setUploadingBook);
      }
      load(); resetBookForm();
    } catch (err) {
      const msg = Object.values(err.response?.data?.errors??{}).flat().join(' ') || err.response?.data?.message || 'Erreur';
>>>>>>> 294c6dc (Initial commit)
      showToast(msg,'error');
    } finally { setSaving(false); }
  };

<<<<<<< HEAD
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
=======
  const handleBookDelete = async id => {
    if (!confirm('Supprimer définitivement ce livre ?')) return;
    try { await api.delete(`/books/${id}`); setBooks(b=>b.filter(x=>x.id!==id)); showToast('Livre supprimé','info'); }
    catch { showToast('Impossible de supprimer','error'); }
  };

  const handleBookEdit = book => {
    setEditId(book.id);
    setBookFiles([]);
    setForm({ titre:book.titre,auteur:book.auteur,isbn:book.isbn,editeur:book.editeur,
              prix:book.prix,quantite:book.quantite,rayon:book.rayon,annee:book.annee??'',
              description:book.description??'',image:book.image??'' });
    setTab('livres'); window.scrollTo({ top:0, behavior:'smooth' });
  };

  const resetBookForm = () => { setEditId(null); setForm(EMPTY); setBookFiles([]); };

  /* ── FOURNITURES ─────────────────────────────────────────────────────────── */
  const handleFournSubmit = async () => {
    setSavingF(true);
    try {
      let saved;
      if (editFId) {
        const r = await api.put(`/fournitures/${editFId}`, fForm);
        saved = r.data;
        showToast('Fourniture modifiée ✅','success');
      } else {
        const r = await api.post('/fournitures', fForm);
        saved = r.data;
        showToast('Fourniture ajoutée ✅','success');
      }
      if (fournFiles.length) {
        await uploadImages(fournFiles, 'fourniture', saved.id ?? editFId, setUploadingF);
      }
      load(); resetFournForm();
    } catch(err) {
      showToast(Object.values(err.response?.data?.errors??{}).flat().join(' ')||'Erreur','error');
    } finally { setSavingF(false); }
  };

  const handleFournDelete = async id => {
    if (!confirm('Supprimer ?')) return;
    try { await api.delete(`/fournitures/${id}`); setFournitures(x=>x.filter(i=>i.id!==id)); showToast('Supprimé','info'); }
    catch { showToast('Erreur','error'); }
  };

  const handleFournEdit = f => {
    setEditFId(f.id);
    setFournFiles([]);
    setFForm({ nom:f.nom,categorie:f.categorie,sous_categorie:f.sous_categorie||'',marque:f.marque||'',
               reference:f.reference||'',description:f.description||'',prix:f.prix,
               quantite:f.quantite,image:f.image||'',promotion:f.promotion||0 });
    setTab('fournitures'); window.scrollTo({ top:0, behavior:'smooth' });
  };

  const resetFournForm = () => { setEditFId(null); setFForm(EMPTY_F); setFournFiles([]); };

  /* ── PROMOTIONS ──────────────────────────────────────────────────────────── */
  const handlePromoSubmit = async e => {
    e.preventDefault(); setSavingPromo(true);
    const payload = { ...promoForm, conditions: Object.fromEntries(Object.entries(promoForm.conditions).filter(([,v])=>v!=='')) };
    try {
      if (editPromoId) { await api.put(`/promotions/${editPromoId}`, payload); showToast('Promotion mise à jour ✅','success'); }
      else              { await api.post('/promotions', payload);               showToast('Promotion créée ✅','success'); }
      load(); resetPromoForm();
    } catch(err) {
      showToast(Object.values(err.response?.data?.errors??{}).flat().join(' ')||err.response?.data?.message||'Erreur','error');
    } finally { setSavingPromo(false); }
  };

  const handleEditPromo = p => {
    setEditPromoId(p.id);
    setPromoForm({ book_id:p.promotable_type==='App\\Models\\Book'?p.promotable_id:'',name:p.name,type:p.type,value:p.value,
      start_at:p.start_at?p.start_at.slice(0,16):'',end_at:p.end_at?p.end_at.slice(0,16):'',is_active:p.is_active,
      conditions:{min_stock:p.conditions?.min_stock??'',max_stock:p.conditions?.max_stock??'',min_sales:p.conditions?.min_sales??''} });
>>>>>>> 294c6dc (Initial commit)
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDeletePromo = async id => {
    if (!confirm('Supprimer cette promotion ?')) return;
<<<<<<< HEAD
    try { await api.delete(`/promotions/${id}`); setPromos(p => p.filter(x => x.id !== id)); showToast('Promotion supprimée','info'); }
=======
    try { await api.delete(`/promotions/${id}`); setPromos(p=>p.filter(x=>x.id!==id)); showToast('Promotion supprimée','info'); }
>>>>>>> 294c6dc (Initial commit)
    catch { showToast('Erreur suppression','error'); }
  };

  const handleTogglePromo = async id => {
    try {
      const res = await api.patch(`/promotions/${id}/toggle`);
<<<<<<< HEAD
      setPromos(p => p.map(x => x.id === id ? {...x, is_active: res.data.is_active, is_currently_active: res.data.is_currently_active} : x));
=======
      setPromos(p=>p.map(x=>x.id===id?{...x,is_active:res.data.is_active,is_currently_active:res.data.is_currently_active}:x));
>>>>>>> 294c6dc (Initial commit)
    } catch { showToast('Erreur','error'); }
  };

  const resetPromoForm = () => { setEditPromoId(null); setPromoForm(EMPTY_PROMO); };

<<<<<<< HEAD
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
=======
  /* ── Helpers affichage ───────────────────────────────────────────────────── */
  const getImageSrc = (item) => {
    if (!item) return null;
    const url = item.image_url;
    if (!url) return null;
    return url.startsWith('/storage') ? BASE_URL + url : url;
  };

  const filteredBooks  = books.filter(b=>b.titre?.toLowerCase().includes(searchBook.toLowerCase())||b.auteur?.toLowerCase().includes(searchBook.toLowerCase()));
  const filteredOrders = orders.filter(o=>String(o.id).includes(searchOrder)||(o.client_nom||'').toLowerCase().includes(searchOrder.toLowerCase()));
  const filteredFourn  = fournitures.filter(f=>f.nom?.toLowerCase().includes(searchFourn.toLowerCase()));

  /* ── Onglet nav ──────────────────────────────────────────────────────────── */
  const Tab = ({id,icon,label,badge}) => (
    <button onClick={()=>setTab(id)}
      className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
        ${tab===id?'border-blue-600 text-blue-600':'border-transparent text-gray-600 hover:text-blue-500'}`}>
      {icon} {label}
      {badge!=null&&badge>0&&<span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>}
    </button>
  );

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">🛠️ Administration</h1>
        {currentUser && (
          <div className="flex items-center gap-3 bg-white border border-[#e8e0d4] rounded-xl px-4 py-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#0f1923] flex items-center justify-center text-[#c9933a] font-black text-sm flex-shrink-0">
              {currentUser.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Mon espace</p>
              <p className="text-sm font-bold text-[#0f1923]">{currentUser.prenom} {currentUser.name}</p>
            </div>
            <span className="ml-2 text-xs bg-[#c9933a]/10 text-[#c9933a] font-bold px-2 py-0.5 rounded-full border border-[#c9933a]/20">
              {currentUser.is_super_admin ? '👑 Super Admin' : '🏪 Libraire'}
            </span>
          </div>
        )}
      </div>

      <div className="flex border-b mb-8 overflow-x-auto gap-1">
        <Tab id="dashboard"   icon="📊" label="Tableau de bord" />
        <Tab id="analytics"   icon="📈" label="Analytics" />
        <Tab id="livres"      icon="📚" label="Catalogue" badge={stats?.lowStock} />
        <Tab id="promos"      icon="🏷️" label="Promotions" badge={promos.filter(p=>p.is_currently_active).length} />
        <Tab id="commandes"   icon="📦" label="Commandes" badge={orders.filter(o=>o.statut==='En cours').length} />
        <Tab id="fournitures" icon="✏️" label="Fournitures" badge={fournitures.filter(f=>f.quantite<5).length||null} />
        <Tab id="versements"  icon="💸" label="Versements" />
      </div>

      {/* ══════ VERSEMENTS (part de chaque libraire sur les paiements clients) ══════ */}
      {tab==='versements' && <PayoutsPanel isSuperAdmin={!!currentUser?.is_super_admin} />}

      {/* ══════ DASHBOARD ══════ */}
      {tab==='dashboard' && (
        <div>
          {!stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[...Array(5)].map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
>>>>>>> 294c6dc (Initial commit)
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {[
<<<<<<< HEAD
                  { label:'Livres',           value:stats.nbBooks,              bg:'bg-blue-50',   border:'border-blue-200',   icon:'📚', color:'text-blue-700' },
                  { label:'Fournitures',       value:stats.nbFournitures??0,     bg:'bg-indigo-50', border:'border-indigo-200', icon:'✏️', color:'text-indigo-700' },
                  { label:'Commandes',         value:stats.nbOrders,             bg:'bg-green-50',  border:'border-green-200',  icon:'📦', color:'text-green-700' },
                  { label:'Clients',           value:stats.nbClients,            bg:'bg-purple-50', border:'border-purple-200', icon:'👥', color:'text-purple-700' },
                  { label:'Chiffre d\'affaires',value:formatCFA(stats.totalCA), bg:'bg-yellow-50', border:'border-yellow-200', icon:'💶', color:'text-yellow-700' },
                  { label:'Stocks faibles',   value:stats.lowStock,             bg:'bg-red-50',    border:'border-red-200',    icon:'⚠️', color:'text-red-700' },
                ].map(({ label, value, bg, border, icon, color }) => (
=======
                  {label:'Livres',             value:stats.nbBooks,            bg:'bg-blue-50',   border:'border-blue-200',   icon:'📚',color:'text-blue-700'},
                  {label:'Fournitures',         value:stats.nbFournitures??0,   bg:'bg-indigo-50', border:'border-indigo-200', icon:'✏️',color:'text-indigo-700'},
                  {label:'Commandes',           value:stats.nbOrders,           bg:'bg-green-50',  border:'border-green-200',  icon:'📦',color:'text-green-700'},
                  {label:'Clients',             value:stats.nbClients,          bg:'bg-purple-50', border:'border-purple-200', icon:'👥',color:'text-purple-700'},
                  {label:"Chiffre d'affaires",  value:formatCFA(stats.totalCA), bg:'bg-yellow-50', border:'border-yellow-200', icon:'💶',color:'text-yellow-700'},
                  {label:'Stocks faibles',      value:stats.lowStock,           bg:'bg-red-50',    border:'border-red-200',    icon:'⚠️',color:'text-red-700'},
                ].map(({label,value,bg,border,icon,color})=>(
>>>>>>> 294c6dc (Initial commit)
                  <div key={label} className={`${bg} border ${border} rounded-xl p-4 text-center`}>
                    <div className="text-3xl mb-1">{icon}</div>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
<<<<<<< HEAD

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
=======
              <div className="flex gap-3 mb-6 flex-wrap">
                <button type="button" onClick={()=>downloadExport('orders')} className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">📥 Exporter commandes (CSV)</button>
                <button type="button" onClick={()=>downloadExport('products')} className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">📊 Exporter catalogue (CSV)</button>
>>>>>>> 294c6dc (Initial commit)
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Commandes par statut</h3>
                  <div className="space-y-3">
                    {STATUTS.map(s => {
<<<<<<< HEAD
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

=======
                      const count=stats.statsByStatus?.[s]??0;
                      const pct=stats.nbOrders>0?(count/stats.nbOrders*100):0;
                      const colors={'En cours':'bg-yellow-400','Validée':'bg-blue-400','Expédiée':'bg-green-400','Annulée':'bg-red-400'};
                      return (<div key={s}><div className="flex justify-between text-sm mb-1"><span>{s}</span><span className="font-semibold">{count}</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${colors[s]} rounded-full`} style={{width:`${pct}%`}}/></div></div>);
                    })}
                  </div>
                </div>
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-4">📈 CA 7 derniers jours</h3>
                  <Sparkline data={stats.caLastDays}/>
                  {stats.caLastDays?.length>0&&<p className="text-sm text-gray-500 mt-2">Total : <strong>{formatCFA(stats.caLastDays.reduce((s,d)=>s+d.ca,0))}</strong></p>}
                </div>
              </div>
>>>>>>> 294c6dc (Initial commit)
              <div className="border rounded-xl p-5 mt-6">
                <h3 className="font-semibold mb-4">📦 Dernières commandes</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
<<<<<<< HEAD
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
=======
                    <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 pr-4">#</th><th className="pb-2 pr-4">Client</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Total</th><th className="pb-2">Statut</th></tr></thead>
                    <tbody>{orders.slice(0,5).map(o=>(<tr key={o.id} className="border-b hover:bg-gray-50"><td className="py-2 pr-4 font-mono text-gray-400">#{o.id}</td><td className="py-2 pr-4">{o.client_nom||'—'}</td><td className="py-2 pr-4 text-gray-500">{o.date_commande}</td><td className="py-2 pr-4 font-semibold">{formatCFA(parseFloat(o.total))}</td><td className="py-2"><StatusBadge statut={o.statut}/></td></tr>))}</tbody>
                  </table>
                  {orders.length>5&&<button onClick={()=>setTab('commandes')} className="text-blue-600 text-sm mt-2 hover:underline">Voir toutes les commandes →</button>}
>>>>>>> 294c6dc (Initial commit)
                </div>
              </div>
            </>
          )}
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* ══════ ANALYTICS ══════ */}
      {tab==='analytics' && (
        <div className="space-y-6">
          {!stats ? (
            <div className="grid md:grid-cols-2 gap-6">{[...Array(4)].map((_,i)=><div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : (
            <>
              <div className="flex gap-3 mb-6 flex-wrap">
                <button type="button" onClick={()=>downloadExport('orders')} className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">📥 Exporter commandes (CSV)</button>
                <button type="button" onClick={()=>downloadExport('products')} className="flex items-center gap-2 bg-white border-2 border-[#e8e0d4] text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#c9933a] hover:text-[#c9933a] transition">📊 Exporter catalogue (CSV)</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">🏆 Top 10 ventes</h3>
                  <p className="text-xs text-gray-400 mb-4">Livres les plus vendus (unités)</p>
                  {!stats.topSelling?.length ? <p className="text-gray-400 text-sm">Aucune vente</p> : (
                    <div className="space-y-2">
                      {stats.topSelling.map((b,i)=>(
                        <div key={b.book_id} className="flex items-center gap-3 text-sm">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?'bg-yellow-400 text-white':i===1?'bg-gray-300 text-gray-700':i===2?'bg-orange-300 text-white':'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                          <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                            {b.image_url ? <img src={BASE_URL+b.image_url} alt="" className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-sm">{b.image||'📖'}</span>}
                          </div>
                          <div className="flex-1 min-w-0"><p className="font-medium truncate">{b.titre}</p><p className="text-xs text-gray-400">{b.auteur}</p></div>
                          <div className="text-right flex-shrink-0"><p className="font-bold text-blue-600">{b.total_sold} ex.</p><p className="text-xs text-gray-400">{formatCFA(b.revenue)}</p></div>
>>>>>>> 294c6dc (Initial commit)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
<<<<<<< HEAD

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
=======
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">💰 CA par rayon</h3>
                  <p className="text-xs text-gray-400 mb-4">Chiffre d'affaires par catégorie</p>
                  {!stats.revenueByRayon?.length ? <p className="text-gray-400 text-sm">Pas encore de données</p> : (
                    <div className="space-y-2">{stats.revenueByRayon.map(r=><MiniBar key={r.rayon} label={r.rayon} value={formatCFA(r.revenue)} max={stats.revenueByRayon[0]?.revenue||1} color="bg-green-500"/>)}</div>
                  )}
                </div>
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">👁 Top consultations</h3>
                  <p className="text-xs text-gray-400 mb-4">Pages produit les plus visitées</p>
                  {!stats.topViewed?.filter(b=>b.view_count>0).length ? <p className="text-gray-400 text-sm">Aucune vue enregistrée</p> : (
                    <div className="space-y-2">{stats.topViewed.filter(b=>b.view_count>0).map(b=><MiniBar key={b.id} label={b.titre} value={b.view_count} max={stats.topViewed.filter(x=>x.view_count>0)[0]?.view_count||1} color="bg-purple-500"/>)}</div>
                  )}
                </div>
                <div className="border rounded-xl p-5">
                  <h3 className="font-semibold mb-1">🛒 Ajouts au panier</h3>
                  <p className="text-xs text-gray-400 mb-4">Livres le plus souvent ajoutés</p>
                  {!stats.topCart?.filter(b=>b.add_to_cart_count>0).length ? <p className="text-gray-400 text-sm">Pas encore de données</p> : (
                    <div className="space-y-2">{stats.topCart.filter(b=>b.add_to_cart_count>0).map(b=><MiniBar key={b.id} label={b.titre} value={b.add_to_cart_count} max={stats.topCart.filter(x=>x.add_to_cart_count>0)[0]?.add_to_cart_count||1} color="bg-orange-400"/>)}</div>
>>>>>>> 294c6dc (Initial commit)
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* ══════ CATALOGUE LIVRES ══════ */}
      {tab==='livres' && (
        <div>
          <form onSubmit={handleBookSubmit} className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editId?'✏️ Modifier le livre':'➕ Ajouter un livre'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Galerie multi-photos */}
              <MultiImageUploader
                itemType="book"
                itemId={editId}
                existingImages={editId ? (books.find(b=>b.id===editId)?.images ?? []) : []}
                pendingFiles={bookFiles}
                onFilesAdd={(files, replace=false) => setBookFiles(prev => replace ? files : [...prev, ...files])}
                onDeleteExisting={(imgId) => deleteProductImage(imgId, true)}
                onSetMain={(imgId) => setMainImage(imgId, true)}
                uploading={uploadingBook}
              />

              {[
                {key:'titre',   label:'Titre *',      type:'text'},
                {key:'auteur',  label:'Auteur *',     type:'text'},
                {key:'isbn',    label:'ISBN *',        type:'text'},
                {key:'editeur', label:'Éditeur *',    type:'text'},
                {key:'prix',    label:'Prix (FCFA) *',type:'number',step:'0.01',min:'0'},
                {key:'quantite',label:'Stock *',      type:'number',min:'0'},
                {key:'annee',   label:'Année',        type:'number',min:'1000'},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]} step={f.step} min={f.min}
                    onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))}
                    required={f.label.includes('*')}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                </div>
              ))}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Rayon *</label>
                <select value={form.rayon} onChange={e=>setForm(x=>({...x,rayon:e.target.value}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                  <option value="">Choisir…</option>
                  {RAYONS.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Icône / Emoji (optionnel)</label>
                <input type="text" value={form.image}
                  onChange={e=>setForm(x=>({...x,image:e.target.value}))}
                  placeholder="📚 ou laisser vide"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">Description *</label>
              <textarea value={form.description} onChange={e=>setForm(x=>({...x,description:e.target.value}))}
                required rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            </div>



            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving||uploadingBook}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition font-medium">
                {saving||uploadingBook ? '⏳ Enregistrement…' : editId ? '✏️ Modifier' : '➕ Ajouter'}
              </button>
              {editId&&<button type="button" onClick={resetBookForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Annuler</button>}
>>>>>>> 294c6dc (Initial commit)
            </div>
          </form>

          <div className="flex gap-3 mb-4">
<<<<<<< HEAD
            <input type="text" value={searchBook} onChange={e => setSearchBook(e.target.value)}
              placeholder="Rechercher un livre…"
=======
            <input type="text" value={searchBook} onChange={e=>setSearchBook(e.target.value)} placeholder="Rechercher un livre…"
>>>>>>> 294c6dc (Initial commit)
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            <span className="self-center text-sm text-gray-400">{filteredBooks.length} livre(s)</span>
          </div>

          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
<<<<<<< HEAD
                <tr>{['Titre','Auteur','Rayon','Prix','Promo','Stock','Actions'].map(h => (
=======
                <tr>{['Photo','Titre','Auteur','Rayon','Prix','Stock','Actions'].map(h=>(
>>>>>>> 294c6dc (Initial commit)
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
<<<<<<< HEAD
                {filteredBooks.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-400">Aucun livre trouvé</td></tr>
                )}
                {filteredBooks.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{b.titre}</td>
=======
                {filteredBooks.length===0&&<tr><td colSpan={7} className="p-6 text-center text-gray-400">Aucun livre trouvé</td></tr>}
                {filteredBooks.map(b=>(
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getImageSrc(b)
                          ? <img src={getImageSrc(b)} alt={b.titre} className="w-full h-full object-cover"/>
                          : <span className="text-xl">{b.image||'📖'}</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[160px] truncate">{b.titre}</td>
>>>>>>> 294c6dc (Initial commit)
                    <td className="px-4 py-3 text-gray-600">{b.auteur}</td>
                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{b.rayon}</span></td>
                    <td className="px-4 py-3 font-semibold">{formatCFA(parseFloat(b.prix))}</td>
                    <td className="px-4 py-3">
<<<<<<< HEAD
                      {b.active_promotion_data ? (
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                          -{b.active_promotion_data.type === 'percentage'
                            ? `${b.active_promotion_data.value}%`
                            : `${parseFloat(b.active_promotion_data.value).toFixed(2)}€`}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
=======
>>>>>>> 294c6dc (Initial commit)
                      <span className={`font-bold ${b.quantite===0?'text-red-600':b.quantite<5?'text-orange-500':'text-green-600'}`}>
                        {b.quantite}{b.quantite===0&&' ⚠️'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
<<<<<<< HEAD
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(b)} className="text-blue-600 hover:underline text-xs">✏️ Modifier</button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline text-xs">🗑️ Supprimer</button>
                        <button onClick={() => { setPromoForm({...EMPTY_PROMO, book_id: b.id}); setTab('promos'); }}
                          className="text-orange-500 hover:underline text-xs">🏷 Promo</button>
=======
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={()=>handleBookEdit(b)} className="text-blue-600 hover:underline text-xs">✏️ Modifier</button>
                        <button onClick={()=>handleBookDelete(b.id)} className="text-red-500 hover:underline text-xs">🗑️ Suppr.</button>
                        <button onClick={()=>{setPromoForm({...EMPTY_PROMO,book_id:b.id});setTab('promos');}} className="text-orange-500 hover:underline text-xs">🏷 Promo</button>
>>>>>>> 294c6dc (Initial commit)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* ══════ PROMOTIONS ══════ */}
      {tab==='promos' && (
        <div>
          <form onSubmit={handlePromoSubmit} className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editPromoId?'✏️ Modifier la promotion':'➕ Créer une promotion'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Livre *</label>
                <select value={promoForm.book_id} onChange={e=>setPromoForm(x=>({...x,book_id:e.target.value}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                  <option value="">Sélectionner un livre…</option>
                  {books.map(b=><option key={b.id} value={b.id}>{b.titre} — {formatCFA(parseFloat(b.prix))}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom de la promotion *</label>
                <input type="text" value={promoForm.name} onChange={e=>setPromoForm(x=>({...x,name:e.target.value}))} required
                  placeholder="Ex: Promo rentrée…"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Type *</label>
                  <select value={promoForm.type} onChange={e=>setPromoForm(x=>({...x,type:e.target.value}))} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
>>>>>>> 294c6dc (Initial commit)
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (FCFA)</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-500 mb-1">Valeur *</label>
                  <input type="number" min="0" step="0.01" value={promoForm.value}
<<<<<<< HEAD
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
=======
                    onChange={e=>setPromoForm(x=>({...x,value:e.target.value}))} required
                    placeholder={promoForm.type==='percentage'?'20':'5000'}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">🗓 Date de début</label>
                <input type="datetime-local" value={promoForm.start_at} onChange={e=>setPromoForm(x=>({...x,start_at:e.target.value}))}
>>>>>>> 294c6dc (Initial commit)
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">🗓 Date de fin</label>
<<<<<<< HEAD
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
=======
                <input type="datetime-local" value={promoForm.end_at} onChange={e=>setPromoForm(x=>({...x,end_at:e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={promoForm.is_active} onChange={e=>setPromoForm(x=>({...x,is_active:e.target.checked}))} className="sr-only peer"/>
>>>>>>> 294c6dc (Initial commit)
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"/>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform"/>
                </label>
                <span className="text-sm text-gray-700">Promotion active</span>
              </div>
            </div>
<<<<<<< HEAD

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
=======
            <div className="mt-5 border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">🎯 Conditions (optionnel)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{key:'min_stock',label:'Stock minimum',hint:'Actif si stock ≥'},{key:'max_stock',label:'Stock maximum',hint:'Actif si stock ≤'},{key:'min_sales',label:'Ventes minimum',hint:'Actif après N ventes'}].map(c=>(
                  <div key={c.key}>
                    <label className="block text-xs text-gray-500 mb-1">{c.label}</label>
                    <input type="number" min="0" value={promoForm.conditions[c.key]}
                      onChange={e=>setPromoForm(x=>({...x,conditions:{...x.conditions,[c.key]:e.target.value}}))}
>>>>>>> 294c6dc (Initial commit)
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                    <p className="text-xs text-gray-400 mt-0.5">{c.hint}</p>
                  </div>
                ))}
              </div>
            </div>
<<<<<<< HEAD

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
=======
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={savingPromo}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-60 transition font-medium">
                {savingPromo?'⏳…':editPromoId?'✏️ Modifier':'🏷 Créer'}
              </button>
              {editPromoId&&<button type="button" onClick={resetPromoForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Annuler</button>}
            </div>
          </form>
          <div className="space-y-3">
            {promos.length===0&&<p className="text-center text-gray-400 py-10">Aucune promotion créée</p>}
            {promos.map(p=>{
              const book=books.find(b=>b.id===p.promotable_id);
              return (
                <div key={p.id} className={`border rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-start gap-4 ${p.is_currently_active?'border-green-200':'border-gray-200 opacity-75'}`}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button onClick={()=>handleTogglePromo(p.id)}
                      className={`relative inline-flex items-center cursor-pointer w-10 h-6 rounded-full transition-colors ${p.is_active?'bg-green-500':'bg-gray-300'}`}>
                      <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${p.is_active?'translate-x-5':'translate-x-1'}`}/>
                    </button>
                    <span className={`text-xs font-medium ${p.is_currently_active?'text-green-600':'text-gray-400'}`}>{p.is_currently_active?'● Actif':'○ Inactif'}</span>
                  </div>
>>>>>>> 294c6dc (Initial commit)
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{p.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.type==='percentage'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>
<<<<<<< HEAD
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
=======
                        {p.type==='percentage'?`-${p.value}%`:`-${formatCFA(p.value)}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">📚 {p.book_titre||book?.titre||`Livre #${p.promotable_id}`}</p>
                    <div className="flex gap-4 text-xs text-gray-400 mt-1 flex-wrap">
                      {p.start_at&&<span>Du {new Date(p.start_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})}</span>}
                      {p.end_at&&<span>Au {new Date(p.end_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})}</span>}
                      {!p.start_at&&!p.end_at&&<span>Aucune limite de dates</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={()=>handleEditPromo(p)} className="text-xs text-blue-600 hover:underline">✏️ Modifier</button>
                    <button onClick={()=>handleDeletePromo(p.id)} className="text-xs text-red-500 hover:underline">🗑️ Supprimer</button>
>>>>>>> 294c6dc (Initial commit)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* ══════ COMMANDES ══════ */}
      {tab==='commandes' && (
        <div>
          <div className="flex gap-3 mb-5">
            <input type="text" value={searchOrder} onChange={e=>setSearchOrder(e.target.value)} placeholder="Rechercher par ID ou nom client…"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            <span className="self-center text-sm text-gray-400">{filteredOrders.length} commande(s)</span>
          </div>
          <div className="space-y-3">
            {filteredOrders.length===0&&<p className="text-center text-gray-400 py-10">Aucune commande</p>}
            {filteredOrders.map(order=>(
              <div key={order.id} className="border rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="flex flex-wrap justify-between items-center px-5 py-4 cursor-pointer hover:bg-gray-50 transition gap-3"
                  onClick={()=>setExpandOrder(e=>({...e,[order.id]:!e[order.id]}))}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-400 text-sm">#{order.id}</span>
                    <span className="font-semibold">{order.client_nom||order.user?.name||'—'}</span>
>>>>>>> 294c6dc (Initial commit)
                    <span className="text-gray-400 text-sm hidden sm:inline">{order.date_commande}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold">{formatCFA(parseFloat(order.total))}</span>
                    <StatusBadge statut={order.statut}/>
<<<<<<< HEAD
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
=======
                    <select value={order.statut} onClick={e=>e.stopPropagation()}
                      onChange={e=>{try{api.put(`/orders/${order.id}/status`,{statut:e.target.value});setOrders(o=>o.map(x=>x.id===order.id?{...x,statut:e.target.value}:x));showToast('Statut mis à jour','success');}catch{showToast('Erreur','error');}}}
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none">
                      {STATUTS.map(s=><option key={s}>{s}</option>)}
                    </select>
                    {(order.client_telephone||order.telephone)&&(
                      <a href={`tel:${order.client_telephone||order.telephone}`} onClick={e=>e.stopPropagation()}
                        className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-green-200 transition">
                        📞 {order.client_telephone||order.telephone}
                      </a>
                    )}
                    <span className="text-gray-300 text-sm">{expandOrder[order.id]?'▲':'▼'}</span>
                  </div>
                </div>
                {expandOrder[order.id]&&(
                  <div className="border-t px-5 py-4 bg-gray-50 text-sm">
                    <p className="text-gray-500 mb-4">📍 {order.adresse}</p>
                    <div className="space-y-2">
                      {order.items?.map(item=>(
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                              {getImageSrc(item.book)?<img src={getImageSrc(item.book)} alt="" className="w-full h-full object-cover"/>:<span>{item.book?.image||'📖'}</span>}
                            </div>
                            <div><p className="font-medium">{item.book?.titre}</p><p className="text-gray-400 text-xs">{item.book?.auteur}</p></div>
                          </div>
                          <div className="text-right"><p>×{item.quantite}</p><p className="font-semibold">{formatCFA(item.prix_unitaire*item.quantite)}</p></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <button onClick={()=>setDevisOrderId(devisOrderId===order.id?null:order.id)}
                        className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                        📄 {devisOrderId===order.id?'Fermer':'Voir le devis'}
                      </button>
                    </div>
                    {devisOrderId===order.id&&<div className="mt-4"><OrderDevis order={{...order,client_telephone:order.client_telephone||order.telephone}} isAdmin={true}/></div>}
>>>>>>> 294c6dc (Initial commit)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* ════════════ FOURNITURES ════════════ */}
      {tab === 'fournitures' && (
        <div>
          {/* Formulaire */}
          <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editFId ? '✏️ Modifier la fourniture' : '➕ Ajouter une fourniture'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
=======
      {/* ══════ FOURNITURES ══════ */}
      {tab==='fournitures' && (
        <div>
          <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{editFId?'✏️ Modifier la fourniture':'➕ Ajouter une fourniture'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Galerie multi-photos */}
              <MultiImageUploader
                itemType="fourniture"
                itemId={editFId}
                existingImages={editFId ? (fournitures.find(f=>f.id===editFId)?.images ?? []) : []}
                pendingFiles={fournFiles}
                onFilesAdd={(files, replace=false) => setFournFiles(prev => replace ? files : [...prev, ...files])}
                onDeleteExisting={(imgId) => deleteProductImage(imgId, false)}
                onSetMain={(imgId) => setMainImage(imgId, false)}
                uploading={uploadingF}
              />

>>>>>>> 294c6dc (Initial commit)
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Nom *</label>
                <input type="text" value={fForm.nom} onChange={e=>setFForm(x=>({...x,nom:e.target.value}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
              </div>
<<<<<<< HEAD
=======

>>>>>>> 294c6dc (Initial commit)
              <div>
                <label className="block text-xs text-gray-500 mb-1">Catégorie *</label>
                <select value={fForm.categorie} onChange={e=>setFForm(x=>({...x,categorie:e.target.value,sous_categorie:''}))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 bg-white">
                  <option value="">Choisir…</option>
                  {Object.keys(CATEGORIES).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
<<<<<<< HEAD
=======

>>>>>>> 294c6dc (Initial commit)
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sous-catégorie</label>
                <select value={fForm.sous_categorie} onChange={e=>setFForm(x=>({...x,sous_categorie:e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30 bg-white">
                  <option value="">Aucune</option>
                  {(CATEGORIES[fForm.categorie]?.items||[]).map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
<<<<<<< HEAD
              {[
                {key:'marque',    label:'Marque',         type:'text'},
                {key:'reference', label:'Référence',      type:'text'},
                {key:'prix',      label:'Prix (FCFA) *',  type:'number', min:'0'},
                {key:'quantite',  label:'Stock *',        type:'number', min:'0'},
                {key:'promotion', label:'Promo (%)',       type:'number', min:'0',max:'100'},
                {key:'image',     label:'Emoji couverture',type:'text'},
=======

              {[
                {key:'marque',    label:'Marque',        type:'text'},
                {key:'reference', label:'Référence',     type:'text'},
                {key:'prix',      label:'Prix (FCFA) *', type:'number',min:'0'},
                {key:'quantite',  label:'Stock *',       type:'number',min:'0'},
                {key:'promotion', label:'Promo (%)',      type:'number',min:'0',max:'100'},
                {key:'image',     label:'Icône emoji',   type:'text'},
>>>>>>> 294c6dc (Initial commit)
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} min={f.min} max={f.max} value={fForm[f.key]}
                    onChange={e=>setFForm(x=>({...x,[f.key]:e.target.value}))}
<<<<<<< HEAD
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
                </div>
              ))}
=======
                    placeholder={f.key==='image'?'✏️ (optionnel)':''}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
                </div>
              ))}

>>>>>>> 294c6dc (Initial commit)
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea value={fForm.description} onChange={e=>setFForm(x=>({...x,description:e.target.value}))}
                  rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
              </div>
            </div>
<<<<<<< HEAD
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
=======



            <div className="flex gap-3 mt-4">
              <button onClick={handleFournSubmit} disabled={savingF||uploadingF}
                className="bg-[#c9933a] text-white px-6 py-2 rounded-lg hover:bg-[#b8832d] disabled:opacity-60 transition font-medium">
                {savingF||uploadingF?'⏳ Enregistrement…':editFId?'✏️ Modifier':'➕ Ajouter'}
              </button>
              {editFId&&<button onClick={resetFournForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Annuler</button>}
            </div>
          </div>

          <div className="flex gap-3 mb-4 flex-wrap">
            <input type="text" value={searchFourn} onChange={e=>setSearchFourn(e.target.value)} placeholder="Rechercher une fourniture…"
              className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9933a]/30"/>
            <span className="self-center text-sm text-gray-400">{filteredFourn.length} article(s)</span>
          </div>

          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>{['Photo','Nom','Catégorie','Marque','Prix','Promo','Stock','Actions'].map(h=>(
>>>>>>> 294c6dc (Initial commit)
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
<<<<<<< HEAD
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
=======
                {filteredFourn.length===0&&<tr><td colSpan={8} className="p-6 text-center text-gray-400">Aucune fourniture</td></tr>}
                {filteredFourn.map(f=>(
                  <tr key={f.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getImageSrc(f)
                          ? <img src={getImageSrc(f)} alt={f.nom} className="w-full h-full object-cover"/>
                          : <span className="text-lg">{f.image||'📦'}</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[140px] truncate">{f.nom}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{f.categorie}</td>
>>>>>>> 294c6dc (Initial commit)
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
<<<<<<< HEAD
                        <button onClick={()=>{setEditFId(f.id);setFForm({nom:f.nom,categorie:f.categorie,sous_categorie:f.sous_categorie||'',marque:f.marque||'',reference:f.reference||'',description:f.description||'',prix:f.prix,quantite:f.quantite,image:f.image||'',promotion:f.promotion||0});window.scrollTo({top:0,behavior:'smooth'});}}
                          className="text-blue-600 hover:underline text-xs">✏️ Modifier</button>
                        <button onClick={async()=>{if(!confirm('Supprimer ?'))return;try{await api.delete(`/fournitures/${f.id}`);setFournitures(x=>x.filter(i=>i.id!==f.id));showToast('Supprimé','info');}catch{showToast('Erreur','error');}}}
                          className="text-red-500 hover:underline text-xs">🗑️ Suppr.</button>
=======
                        <button onClick={()=>handleFournEdit(f)} className="text-blue-600 hover:underline text-xs">✏️ Modifier</button>
                        <button onClick={()=>handleFournDelete(f.id)} className="text-red-500 hover:underline text-xs">🗑️ Suppr.</button>
>>>>>>> 294c6dc (Initial commit)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 294c6dc (Initial commit)
