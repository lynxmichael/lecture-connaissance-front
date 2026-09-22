import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { id: 'all',         label: 'Tous',          icon: '🌐' },
  { id: 'general',     label: 'Général',       icon: '💬' },
  { id: 'livres',      label: 'Livres',         icon: '📚' },
  { id: 'fournitures', label: 'Fournitures',    icon: '🖊️' },
  { id: 'entraide',    label: 'Entraide',       icon: '🤝' },
  { id: 'annonces',    label: 'Annonces',       icon: '📢' },
];

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `il y a ${Math.floor(diff / 86400)}j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

function Avatar({ user, size = 'sm' }) {
  const s = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-sm';
  const initial = (user?.prenom?.[0] || user?.name?.[0] || '?').toUpperCase();
  return (
    <div className={`${s} rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0`}>
      {initial}
    </div>
  );
}

function PostCard({ post, onLike, onSelect }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer p-5"
      onClick={() => onSelect(post)}
    >
      <div className="flex gap-3">
        <Avatar user={post.user} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {post.is_pinned && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-2 font-medium">
                  📌 Épinglé
                </span>
              )}
              {post.status === 'closed' && (
                <span className="inline-flex items-center text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mr-2 font-medium">
                  🔒 Fermé
                </span>
              )}
              <span className="inline-flex items-center text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {CATEGORIES.find(c => c.id === post.category)?.icon} {CATEGORIES.find(c => c.id === post.category)?.label}
              </span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(post.created_at)}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mt-1 text-sm leading-snug line-clamp-2">{post.title}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="font-medium text-gray-600">{post.user?.prenom} {post.user?.name}</span>
            {post.user?.account_type === 'company' && (
              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">🏢 Entreprise</span>
            )}
            <span>👁 {post.views || 0}</span>
            <span>💬 {post.replies_count || 0}</span>
            <button
              className={`flex items-center gap-1 transition-colors ${post.liked_by_me ? 'text-red-500' : 'hover:text-red-400'}`}
              onClick={e => { e.stopPropagation(); onLike(post); }}
            >
              {post.liked_by_me ? '❤️' : '🤍'} {post.likes || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostDetail({ post, onClose, onLike, user, onPostUpdated, onPostDeleted }) {
  const [replies, setReplies] = useState(post.replies || []);
  const [moderating, setModerating] = useState(false);

  // Modération réservée au super admin ; chacun peut supprimer son propre sujet
  const isSuperAdmin = !!user && (user.is_super_admin || user.role === 'super_admin');
  const isAuthor     = !!user && user.id === post.user?.id;

  const moderate = async (action) => {
    setModerating(true);
    try {
      if (action === 'delete') {
        if (!confirm(isAuthor ? 'Supprimer votre sujet ?' : 'Supprimer ce sujet (modération) ?')) return;
        await api.delete(`/community/posts/${post.id}`);
        onPostDeleted?.(post.id);
      } else if (action === 'pin') {
        const res = await api.patch(`/community/posts/${post.id}/pin`);
        onPostUpdated?.(post.id, { is_pinned: res.data.is_pinned });
      } else if (action === 'status') {
        const res = await api.patch(`/community/posts/${post.id}/status`);
        onPostUpdated?.(post.id, { status: res.data.status });
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Action impossible.');
    } finally {
      setModerating(false);
    }
  };
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleSendReply = async () => {
    if (!newReply.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/community/posts/${post.id}/replies`, { content: newReply });
      setReplies(prev => [res.data, ...prev]);
      setNewReply('');
    } catch {
      alert('Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Supprimer cette réponse ?')) return;
    try {
      await api.delete(`/community/replies/${replyId}`);
      setReplies(prev => prev.filter(r => r.id !== replyId));
    } catch (e) {
      alert(e.response?.data?.message || 'Suppression impossible.');
    }
  };

  const handleSaveEdit = async (replyId) => {
    await api.put(`/community/replies/${replyId}`, { content: editContent });
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, content: editContent } : r));
    setEditingReplyId(null);
  };

  const handleLikeReply = async (reply) => {
    try {
      const res = await api.post(`/community/replies/${reply.id}/like`);
      setReplies(prev => prev.map(r => r.id === reply.id
        ? { ...r, likes: res.data.likes, liked_by_me: res.data.liked }
        : r
      ));
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Avatar user={post.user} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">{post.user?.prenom} {post.user?.name}</span>
                  {post.user?.account_type === 'company' && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">🏢 Entreprise</span>
                  )}
                  <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    {CATEGORIES.find(c => c.id === post.category)?.icon} {CATEGORIES.find(c => c.id === post.category)?.label}
                  </span>
                  {post.is_pinned && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">📌 Épinglé</span>}
                  {post.status === 'closed' && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">🔒 Fermé</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-4">{post.title}</h2>
          <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
            <span>👁 {post.views} vues</span>
            <button
              className={`flex items-center gap-1 transition-colors ${post.liked_by_me ? 'text-red-500' : 'hover:text-red-400'}`}
              onClick={() => onLike(post)}
            >
              {post.liked_by_me ? '❤️' : '🤍'} {post.likes || 0} j'aime
            </button>
          </div>

          {(isSuperAdmin || isAuthor) && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-4 border-t border-gray-100">
              {isSuperAdmin && (
                <>
                  <span className="mr-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">Modération</span>
                  <button type="button" disabled={moderating} onClick={() => moderate('pin')}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                    {post.is_pinned ? '📌 Désépingler' : '📌 Épingler'}
                  </button>
                  <button type="button" disabled={moderating} onClick={() => moderate('status')}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                    {post.status === 'closed' ? '🔓 Rouvrir' : '🔒 Fermer'}
                  </button>
                </>
              )}
              <button type="button" disabled={moderating} onClick={() => moderate('delete')}
                className="px-3 py-1 text-xs font-medium text-red-600 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50">
                🗑 Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="p-6 max-h-80 overflow-y-auto space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm">{replies.length} réponse(s)</h3>
          {replies.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Soyez le premier à répondre !</p>
          )}
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <Avatar user={reply.user} />
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-700">{reply.user?.prenom} {reply.user?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                    <button
                      className={`text-xs ${reply.liked_by_me ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      onClick={() => user && handleLikeReply(reply)}
                    >
                      {reply.liked_by_me ? '❤️' : '🤍'} {reply.likes || 0}
                    </button>
                    {/* Modifier : auteur uniquement — Supprimer : auteur ou super admin */}
                    {user && user.id === reply.user?.id && (
                      <button className="text-xs text-blue-400 hover:text-blue-600" onClick={() => { setEditingReplyId(reply.id); setEditContent(reply.content); }}>✏️</button>
                    )}
                    {user && (user.id === reply.user?.id || isSuperAdmin) && (
                      <button className="text-xs text-red-400 hover:text-red-600" onClick={() => handleDeleteReply(reply.id)}>🗑</button>
                    )}
                  </div>
                </div>
                {editingReplyId === reply.id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
                      rows={3}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2 mt-1">
                      <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700" onClick={() => handleSaveEdit(reply.id)}>Sauvegarder</button>
                      <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setEditingReplyId(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{reply.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply form */}
        {user ? (
          post.status !== 'closed' ? (
            <div className="p-6 border-t border-gray-100">
              <div className="flex gap-3">
                <Avatar user={user} />
                <div className="flex-1">
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
                    rows={3}
                    placeholder="Écrire une réponse..."
                    value={newReply}
                    onChange={e => setNewReply(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      disabled={sending || !newReply.trim()}
                      onClick={handleSendReply}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {sending ? 'Envoi...' : 'Répondre'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400 border-t border-gray-100">
              Ce sujet est fermé — aucune nouvelle réponse n'est acceptée.
            </div>
          )
        ) : (
          <div className="p-4 text-center border-t border-gray-100">
            <Link to="/login" className="text-indigo-600 font-medium hover:underline text-sm">
              Connectez-vous pour répondre →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function NewPostModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 5) errs.title = 'Le titre doit faire au moins 5 caractères.';
    if (!form.content.trim() || form.content.length < 10) errs.content = 'Le contenu doit faire au moins 10 caractères.';
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const res = await api.post('/community/posts', form);
      onCreated(res.data);
      onClose();
    } catch (e) {
      const data = e.response?.data?.errors;
      if (data) setErrors(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Nouveau sujet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              placeholder="De quoi voulez-vous parler ?"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
              rows={6}
              placeholder="Décrivez votre sujet en détail..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (category !== 'all') params.category = category;
      if (search.trim()) params.search = search;
      const res = await api.get('/community/posts', { params });
      setPosts(res.data.data || []);
      setMeta(res.data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (post) => {
    if (!user) return;
    try {
      const res = await api.post(`/community/posts/${post.id}/like`);
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, likes: res.data.likes, liked_by_me: res.data.liked } : p
      ));
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => ({ ...prev, likes: res.data.likes, liked_by_me: res.data.liked }));
      }
    } catch {}
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleSelectPost = async (post) => {
    try {
      const res = await api.get(`/community/posts/${post.id}`);
      setSelectedPost(res.data);
    } catch {
      setSelectedPost(post);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl font-extrabold mb-2">Communauté LectureConnaissance</h1>
          <p className="text-indigo-100 text-lg">
            Échangez, partagez et apprenez avec d'autres lecteurs et amateurs de fournitures scolaires.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-indigo-200">
            <span>💬 Discussions libres</span>
            <span>📚 Recommandations de livres</span>
            <span>🤝 Entraide communautaire</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher dans la communauté..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-300 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {user ? (
            <button
              onClick={() => setShowNewPost(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shrink-0 flex items-center gap-2"
            >
              ✏️ Nouveau sujet
            </button>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shrink-0">
              Se connecter
            </Link>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-100'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="font-semibold text-gray-700 mb-1">Aucun sujet trouvé</h3>
            <p className="text-gray-400 text-sm">Soyez le premier à lancer la discussion !</p>
            {user && (
              <button
                onClick={() => setShowNewPost(true)}
                className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                ✏️ Créer le premier sujet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onSelect={handleSelectPost}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Précédent
            </button>
            <span className="text-sm text-gray-500">Page {meta.current_page} / {meta.last_page}</span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}

        {/* Community stats */}
        {!user && (
          <div className="mt-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">Rejoignez notre communauté !</p>
            <p className="text-gray-500 text-sm mb-4">Créez un compte gratuit pour participer aux discussions.</p>
            <div className="flex justify-center gap-3">
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Créer un compte gratuit
              </Link>
              <Link to="/login" className="border border-indigo-200 text-indigo-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onPostUpdated={(id, changes) => {
            setPosts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
            setSelectedPost(prev => (prev && prev.id === id ? { ...prev, ...changes } : prev));
          }}
          onPostDeleted={(id) => {
            setPosts(prev => prev.filter(p => p.id !== id));
            setSelectedPost(null);
          }}
          user={user}
        />
      )}
      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
