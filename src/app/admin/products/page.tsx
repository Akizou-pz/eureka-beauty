'use client';

import React, { useState, useEffect } from 'react';
import { db, Product, Category, Brand } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { Plus, Edit2, Trash2, X, PlusCircle, CheckCircle, Package } from 'lucide-react';

export default function AdminProductsPage() {
  const { formatPrice } = useLangCurr();

  // Baseline states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [benefits, setBenefits] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [priceXof, setPriceXof] = useState(10000);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [stock, setStock] = useState(20);
  const [sku, setSku] = useState('');
  const [skinType, setSkinType] = useState('All');
  const [skinConcern, setSkinConcern] = useState('General');
  const [imageUrl, setImageUrl] = useState('');

  // Status feedback
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Load all baseline data
  const loadData = () => {
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setBrands(db.getBrands());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  // Sync Slug generation when Name changes
  useEffect(() => {
    if (!editMode) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [name, editMode]);

  const openAddModal = () => {
    setEditMode(false);
    setEditingId('');
    setName('');
    setSlug('');
    setDescription('');
    setIngredients('');
    setHowToUse('');
    setBenefits('');
    setCategoryId(categories[0]?.id || '');
    setBrandId(brands[0]?.id || '');
    setPriceXof(15000);
    setDiscountPercent(0);
    setStock(25);
    setSku(`EB-SK-${Math.floor(100 + Math.random() * 900)}`);
    setSkinType('All');
    setSkinConcern('General');
    setImageUrl('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600');
    
    setIsOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditMode(true);
    setEditingId(prod.id);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description);
    setIngredients(prod.ingredients || '');
    setHowToUse(prod.how_to_use || '');
    setBenefits(prod.benefits || '');
    setCategoryId(prod.category_id);
    setBrandId(prod.brand_id);
    setPriceXof(Number(prod.price_xof));
    setDiscountPercent(prod.discount_percent);
    setStock(prod.stock);
    setSku(prod.sku);
    setSkinType(prod.skin_type);
    setSkinConcern(prod.skin_concern);
    setImageUrl(prod.images[0] || '');
    
    setIsOpen(true);
  };

  const handleDelete = (id: string, prodName: string) => {
    const confirm = window.confirm(`Voulez-vous vraiment supprimer le produit "${prodName}" ?`);
    if (confirm) {
      db.deleteProduct(id);
      loadData();
      showFeedback('Produit supprimé du catalogue avec succès', 'success');
    }
  };

  const showFeedback = (text: string, type: string) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      category_id: categoryId,
      brand_id: brandId,
      name,
      slug,
      description,
      ingredients,
      how_to_use: howToUse,
      benefits,
      price_xof: Number(priceXof),
      price_usd: Math.round(Number(priceXof) / 600), // auto USD peg
      discount_percent: Number(discountPercent),
      sku,
      stock: Number(stock),
      skin_type: skinType,
      skin_concern: skinConcern,
      is_featured: true,
      is_flash_sale: false,
      images: [imageUrl],
    };

    try {
      if (editMode) {
        db.updateProduct(editingId, productPayload);
        showFeedback('Le produit a été modifié avec succès !', 'success');
      } else {
        db.createProduct(productPayload);
        showFeedback('Nouveau produit ajouté au catalogue !', 'success');
      }
      loadData();
      setIsOpen(false);
    } catch (err) {
      showFeedback('Erreur lors de la validation du produit', 'error');
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

        <button
          onClick={openAddModal}
          className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Ajouter Produit
        </button>
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
                        <button
                          onClick={() => openEditModal(prod)}
                          className="w-8 h-8 rounded bg-white/5 hover:bg-gold hover:text-white transition flex items-center justify-center text-white/60"
                          title="Modifier"
                        >
                          <Edit2 size={12} />
                        </button>
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


      {/* ==========================================
          ADD/EDIT DYNAMIC PRODUCT FORM MODAL
         ========================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="my-4 sm:my-auto bg-[#141414] border border-white/10 w-full max-w-2xl rounded-2xl p-4 sm:p-8 space-y-6 luxury-shadow">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif-display font-semibold text-lg text-white tracking-wider">
                {editMode ? 'Modifier le Produit' : 'Créer un Nouveau Produit'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition p-1 bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Nom du Produit</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Slug URL (Auto)</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={slug}
                    className="w-full text-xs bg-white/[0.02] rounded-lg px-3 py-2.5 border border-white/5 text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Catégorie</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-2.5 py-2.5 border border-white/10 text-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#141414] text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Marque</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-2.5 py-2.5 border border-white/10 text-white font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#141414] text-white">{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Prix de base (XOF)</label>
                  <input
                    type="number"
                    required
                    value={priceXof}
                    onChange={(e) => setPriceXof(Number(e.target.value))}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Remise (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">SKU Unique</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Stock (Quantité)</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Skin Type</label>
                  <select
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-2.5 py-2.5 border border-white/10 text-white"
                  >
                    <option value="All" className="bg-[#141414]">All (Tout type)</option>
                    <option value="Oily" className="bg-[#141414]">Oily (Peau grasse)</option>
                    <option value="Dry" className="bg-[#141414]">Dry (Peau sèche)</option>
                    <option value="Sensitive" className="bg-[#141414]">Sensitive (Sensible)</option>
                    <option value="Combination" className="bg-[#141414]">Combination (Peau mixte)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Skin Concern</label>
                  <select
                    value={skinConcern}
                    onChange={(e) => setSkinConcern(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-2.5 py-2.5 border border-white/10 text-white"
                  >
                    <option value="General" className="bg-[#141414]">General (Général)</option>
                    <option value="Hydration" className="bg-[#141414]">Hydration (Hydratant)</option>
                    <option value="Anti-Aging" className="bg-[#141414]">Anti-Aging (Anti-âge)</option>
                    <option value="Acne" className="bg-[#141414]">Acne (Acné & Pores)</option>
                    <option value="Brightening" className="bg-[#141414]">Brightening (Taches / Éclat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Image URL (Unsplash ou CDN)</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Bénéfices</label>
                  <input
                    type="text"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Ingrédients clés</label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold uppercase tracking-widest py-3 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-hover text-white font-bold uppercase tracking-widest py-3 rounded-lg shadow transition"
                >
                  {editMode ? 'Sauvegarder' : 'Créer Produit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
