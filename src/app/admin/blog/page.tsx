'use client';

import React, { useState, useEffect } from 'react';
import { db, BlogPost } from '@/lib/db';
import { Plus, X, Edit2, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Skin Care');
  const [readTime, setReadTime] = useState('5 min read');
  const [imageUrl, setImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setPosts(db.getBlogPosts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setTitle('');
    setCategory('Skin Care');
    setReadTime('5 min read');
    setImageUrl('');
    setSummary('');
    setContent('');
    setIsOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setReadTime(post.read_time);
    setImageUrl(post.image_url);
    setSummary(post.summary);
    setContent(post.content);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      db.deleteBlogPost(id);
      setSuccessMsg('Article supprimé avec succès !');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content) return;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const postData = {
      title,
      slug,
      summary,
      content,
      category,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
      read_time: readTime,
    };

    if (editingPost) {
      db.updateBlogPost(editingPost.id, postData);
      setSuccessMsg('Article mis à jour avec succès !');
    } else {
      db.createBlogPost(postData);
      setSuccessMsg('Article créé et publié avec succès !');
    }

    setTimeout(() => setSuccessMsg(''), 4000);
    loadData();
    setIsOpen(false);
  };

  const blogCategories = ['Skin Care', 'Cosmetics', 'Wellness', 'Lifestyle'];

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Conseils & Articles de Blog</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Gérer et publier des articles conseils pour vos clients.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Nouvel Article
        </button>
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

      {/* Articles table list */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden luxury-shadow">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
            <BookOpen size={16} className="text-gold" /> Articles Publiés
          </h3>
          <span className="text-[10px] text-white/40 font-bold">{posts.length} Article(s)</span>
        </div>

        <div className="overflow-x-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-white/40 text-xs italic">
              Aucun article publié pour le moment.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40 bg-white/[0.02]">
                  <th className="py-4 px-6 font-bold">Aperçu</th>
                  <th className="py-4 px-6 font-bold">Titre / Catégorie</th>
                  <th className="py-4 px-6 font-bold">Lecture</th>
                  <th className="py-4 px-6 font-bold">Publié le</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.01] transition">
                    <td className="py-4 px-6">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-12 h-12 object-cover rounded-lg bg-white/5 border border-white/10"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-md">
                        <p className="font-bold text-white truncate">{post.title}</p>
                        <span className="inline-block bg-gold/15 text-gold font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">
                          {post.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white/60">
                      <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time}</span>
                    </td>
                    <td className="py-4 px-6 text-white/60">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-gold transition"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-error transition"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden luxury-shadow text-xs text-white max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white">
                {editingPost ? "Modifier l'article" : "Rédiger un article"}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition p-1 hover:bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1.5">Titre de l'article</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5 Conseils pour hydrater sa peau"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-gold/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1.5">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2.5 text-white outline-none focus:border-gold/50"
                  >
                    {blogCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#141414] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1.5">Temps de lecture estimé</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5 min read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-gold/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1.5">Lien de l'image (URL)</label>
                <input
                  type="url"
                  placeholder="Ex: https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1.5">Résumé / Description Courte</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Une brève introduction qui s'affiche sur la grille du blog..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-gold/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1.5">Contenu de l'article</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Rédigez l'intégralité de l'article conseil ici..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-gold/50"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-hover text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition shadow"
                >
                  {editingPost ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
