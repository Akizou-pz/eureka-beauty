'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db, Product, Category, Brand } from '@/lib/db';
import { ArrowLeft, CheckCircle, Package } from 'lucide-react';

export default function ProductFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id') || '';
  const isEditMode = !!productId;

  // Baseline lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [benefits, setBenefits] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [priceXof, setPriceXof] = useState(15000);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [stock, setStock] = useState(25);
  const [sku, setSku] = useState('');
  const [skinType, setSkinType] = useState('All');
  const [skinConcern, setSkinConcern] = useState('General');
  const [imageUrl, setImageUrl] = useState('');

  // Status feedback
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Load baseline parameters
  useEffect(() => {
    const cats = db.getCategories();
    const brs = db.getBrands();
    setCategories(cats);
    setBrands(brs);

    if (isEditMode) {
      const prod = db.getProductById(productId);
      if (prod) {
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
      } else {
        setFeedback({ text: 'Produit introuvable', type: 'error' });
      }
    } else {
      // Default initializations for new product
      setCategoryId(cats[0]?.id || '');
      setBrandId(brs[0]?.id || '');
      setSku(`EB-SK-${Math.floor(100 + Math.random() * 900)}`);
      setImageUrl('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600');
    }
  }, [productId, isEditMode]);

  // Auto URL slug generation from product name when not in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [name, isEditMode]);

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
      price_usd: Math.round(Number(priceXof) / 600), // static peg conversion
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
      if (isEditMode) {
        db.updateProduct(productId, productPayload);
        setFeedback({ text: 'Le produit a été modifié avec succès !', type: 'success' });
      } else {
        db.createProduct(productPayload);
        setFeedback({ text: 'Nouveau produit ajouté avec succès !', type: 'success' });
      }
      
      // Notify components to refresh databases
      window.dispatchEvent(new Event('supabase_sync_complete'));

      // Redirect back after 1.5 seconds
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err) {
      setFeedback({ text: 'Erreur lors de la validation du produit', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 fade-in text-white max-w-4xl mx-auto pb-16">
      
      {/* Top navigation shortcut */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/products" 
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition font-medium"
        >
          <ArrowLeft size={14} /> Retour au Catalogue
        </Link>
      </div>

      {/* Header banner */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-5">
        <div className="p-2.5 bg-gold/10 text-gold rounded-xl border border-gold/10">
          <Package size={22} />
        </div>
        <div>
          <h1 className="font-serif-display text-2xl font-semibold tracking-wide">
            {isEditMode ? 'Modifier la Fiche Produit' : 'Ajouter un Nouveau Produit'}
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            {isEditMode 
              ? 'Mettre à jour les informations, les tarifs et la quantité en stock de votre article.' 
              : 'Créer une nouvelle fiche avec visuels, descriptifs et tarification dans votre catalogue.'
            }
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {feedback.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-success/10 text-success border border-success/15' 
            : 'bg-error/10 text-error border border-error/15'
        }`}>
          {feedback.type === 'success' && <CheckCircle size={14} />}
          <span>{feedback.text}</span>
          {feedback.type === 'success' && <span className="text-[10px] text-white/40 ml-auto font-light">Redirection en cours...</span>}
        </div>
      )}

      {/* Main product creation form */}
      <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 luxury-shadow">
        
        {/* Row 1: Name and Auto Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Nom du Produit</label>
            <input
              type="text"
              required
              placeholder="Ex: Savon éclaircissant au curcuma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Slug URL (Généré Automatiquement)</label>
            <input
              type="text"
              required
              disabled
              value={slug}
              className="w-full text-xs bg-white/[0.02] rounded-lg px-3.5 py-3 border border-white/5 text-white/40 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Row 2: Category and Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3 py-3 border border-white/10 text-white font-medium outline-none focus:border-gold/50 transition"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#141414] text-white">{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Marque</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3 py-3 border border-white/10 text-white font-medium outline-none focus:border-gold/50 transition"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#141414] text-white">{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Pricing and SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Prix de base (XOF)</label>
            <input
              type="number"
              required
              min="0"
              value={priceXof}
              onChange={(e) => setPriceXof(Number(e.target.value))}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Remise (%)</label>
            <input
              type="number"
              min="0"
              max="95"
              placeholder="0"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Code SKU Unique</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white uppercase outline-none focus:border-gold/50 transition"
            />
          </div>
        </div>

        {/* Row 4: Stock, Skin Type, Skin Concern */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Stock (Quantité)</label>
            <input
              type="number"
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Type de Peau conseillé</label>
            <select
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            >
              <option value="All" className="bg-[#141414]">All (Tout type de peau)</option>
              <option value="Oily" className="bg-[#141414]">Oily (Peaux grasses)</option>
              <option value="Dry" className="bg-[#141414]">Dry (Peaux sèches)</option>
              <option value="Sensitive" className="bg-[#141414]">Sensitive (Peaux sensibles)</option>
              <option value="Combination" className="bg-[#141414]">Combination (Peaux mixtes)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Préoccupation Ciblée</label>
            <select
              value={skinConcern}
              onChange={(e) => setSkinConcern(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            >
              <option value="General" className="bg-[#141414]">General (Entretien quotidien)</option>
              <option value="Hydration" className="bg-[#141414]">Hydration (Déshydratation)</option>
              <option value="Anti-Aging" className="bg-[#141414]">Anti-Aging (Rides & Fermeté)</option>
              <option value="Acne" className="bg-[#141414]">Acne (Acné & Imperfections)</option>
              <option value="Brightening" className="bg-[#141414]">Brightening (Taches / Éclat)</option>
            </select>
          </div>
        </div>

        {/* Row 5: Product Image URL */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">URL de l'image descriptive</label>
          <input
            type="text"
            required
            placeholder="Ex: https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
          />
        </div>

        {/* Row 6: Description */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Description Détaillée</label>
          <textarea
            required
            rows={4}
            placeholder="Présentez les vertus, caractéristiques et résultats attendus du produit..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white resize-none outline-none focus:border-gold/50 transition"
          />
        </div>

        {/* Row 7: Ingredients and Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Bénéfices (Séparés par des virgules)</label>
            <input
              type="text"
              placeholder="Ex: Teint radieux, Nettoie en profondeur, Anti-taches"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">Ingrédients Clés</label>
            <input
              type="text"
              placeholder="Ex: Curcuma, Acide salicylique, Beurre de karité"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full text-xs bg-white/5 rounded-lg px-3.5 py-3 border border-white/10 text-white outline-none focus:border-gold/50 transition"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/5 flex gap-4">
          <Link
            href="/admin/products"
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl transition text-center text-xs flex items-center justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="flex-1 bg-gold hover:bg-gold-hover text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-md transition text-xs"
          >
            {isEditMode ? 'Sauvegarder les modifications' : 'Créer le produit'}
          </button>
        </div>

      </form>
    </div>
  );
}
