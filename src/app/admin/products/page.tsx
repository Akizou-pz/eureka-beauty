'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, Product, Category } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const { formatPrice } = useLangCurr();

  // Baseline states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Status feedback
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Brand creation modal states
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');

  const loadData = () => {
    const prods = db.getProducts().map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'])
    }));
    setProducts(prods);
    setCategories(db.getCategories());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  const handleDelete = (id: string, prodName: string) => {
    const confirm = window.confirm(`Voulez-vous vraiment supprimer le produit "${prodName}" ?`);
    if (confirm) {
      db.deleteProduct(id);
      loadData();
      showFeedback('Produit supprimé du catalogue avec succès', 'success');
      
      // Notify other components
      window.dispatchEvent(new Event('supabase_sync_complete'));
    }
  };

  const showFeedback = (text: string, type: string) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    try {
      const brandSlug = newBrandName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      db.createBrand({
        name: newBrandName.trim(),
        slug: brandSlug,
        description: newBrandDesc.trim(),
      });

      showFeedback('Marque créée avec succès !', 'success');
      setNewBrandName('');
      setNewBrandDesc('');
      setIsBrandModalOpen(false);
      
      // Notify other components
      window.dispatchEvent(new Event('supabase_sync_complete'));
    } catch (err) {
      showFeedback('Erreur lors de la création de la marque', 'error');
    }
  };

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Catalogue Produits</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Ajouter, modifier ou supprimer des articles de votre boutique.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/5 text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus size={16} /> Ajouter Marque
          </button>
          <Link
            href="/admin/products/form"
            className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus size={16} /> Ajouter Produit
          </Link>
        </div>
      </div>

      {feedback.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${feedback.type === 'success' ? 'bg-success/15 text-success border border-success/20' : 'bg-error/15 text-error border border-error/20'}`}>
          {feedback.text}
        </div>
      )}

      {/* Catalog Grid Table */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden luxury-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-white/40 uppercase tracking-widest text-[9px] bg-white/5">
                <th className="p-4">Visuel</th>
                <th className="p-4">Nom / SKU</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40 italic">Aucun produit dans le catalogue.</td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-lg bg-[#222] border border-white/10"
                      />
                    </td>
                    <td className="p-4 space-y-1">
                      <p className="font-bold text-white text-sm">{prod.name}</p>
                      <span className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">{prod.sku}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-white/5 px-2.5 py-1 rounded text-[10px]">
                        {categories.find(c => c.id === prod.category_id)?.name || 'Skincare'}
                      </span>
                    </td>
                    <td className="p-4 font-serif-display font-semibold text-gold">
                      {formatPrice(prod.price_xof)}
                      {prod.discount_percent > 0 && (
                        <span className="text-[9px] text-accent block mt-0.5">-{prod.discount_percent}% remise</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={`w-2 h-2 rounded-full ${prod.stock === 0 ? 'bg-error' : prod.stock <= 5 ? 'bg-accent' : 'bg-success'}`} />
                        <span>{prod.stock} unités</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/products/form?id=${prod.id}`}
                          className="w-8 h-8 rounded bg-white/5 hover:bg-gold hover:text-white transition flex items-center justify-center text-white/60"
                          title="Modifier"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="w-8 h-8 rounded bg-white/5 hover:bg-error hover:text-white transition flex items-center justify-center text-white/60"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brand Creation Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-serif-display text-lg text-white font-semibold">Ajouter une nouvelle Marque</h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-white/60 hover:text-white text-xs">✕</button>
            </div>
            
            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Nom de la Marque</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cerave, Fenty Beauty..."
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white outline-none focus:border-gold/50 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Description (Optionnelle)</label>
                <textarea
                  rows={2}
                  placeholder="Présentez brièvement la marque..."
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white outline-none focus:border-gold/50 transition resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-hover text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg transition"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
