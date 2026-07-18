'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { useCart } from '@/context/CartContext';
import { db, Product, Category, Brand } from '@/lib/db';
import { Filter, X, Star, ChevronDown, SlidersHorizontal } from 'lucide-react';

function Shop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useLangCurr();
  const { addToCart } = useCart();

  // Search parameters from URL
  const urlCategory = searchParams.get('category') || '';
  const urlBrand = searchParams.get('brand') || '';
  const urlSearch = searchParams.get('search') || '';

  // Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Selected Filter Values
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
  const [selectedSkinType, setSelectedSkinType] = useState('All');
  const [selectedConcern, setSelectedConcern] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // Mobile sidebar visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const loadData = () => {
    const prods = db.getProducts().map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'])
    }));
    setProducts(prods);
    setCategories(db.getCategories());
    setBrands(db.getBrands());
  };

  // Load baseline datasets
  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  // Synchronize changes in searchParams
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Handle filtering and sorting logic
  const getFilteredProducts = () => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.ingredients?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => {
        const cat = categories.find((c) => c.slug === selectedCategory);
        return cat ? p.category_id === cat.id : true;
      });
    }

    // Brand filter
    if (selectedBrand) {
      result = result.filter((p) => {
        const br = brands.find((b) => b.slug === selectedBrand);
        return br ? p.brand_id === br.id : true;
      });
    }

    // Skin Type filter
    if (selectedSkinType !== 'All') {
      result = result.filter(
        (p) => p.skin_type === 'All' || p.skin_type === selectedSkinType
      );
    }

    // Skin Concern filter
    if (selectedConcern !== 'All') {
      result = result.filter((p) => p.skin_concern === selectedConcern);
    }

    // Price filter (based on price_xof)
    result = result.filter((p) => {
      const actualPrice = p.price_xof * (1 - p.discount_percent / 100);
      return actualPrice <= maxPrice;
    });

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const pa = a.price_xof * (1 - a.discount_percent / 100);
        const pb = b.price_xof * (1 - b.discount_percent / 100);
        return pa - pb;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const pa = a.price_xof * (1 - a.discount_percent / 100);
        const pb = b.price_xof * (1 - b.discount_percent / 100);
        return pb - pa;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // default: popularity (number of reviews / features)
      result.sort((a, b) => b.review_count - a.review_count);
    }

    return result;
  };

  const filteredProducts = getFilteredProducts();

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedSkinType('All');
    setSelectedConcern('All');
    setMaxPrice(50000);
    setMinRating(0);
    setSearchQuery('');
    router.push('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Title & Mobile Filter Toggles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide text-dark">
            La Boutique Eureka
          </h1>
          <p className="text-xs text-dark-muted mt-1 font-light">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex gap-2 w-full md:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex-1 flex items-center justify-center gap-2 border border-gold/15 bg-white text-xs font-semibold uppercase tracking-wider py-3 rounded-lg text-dark"
          >
            <Filter size={14} /> Filtrer
          </button>

          {/* Sort Selector */}
          <div className="flex-1 md:flex-initial relative flex items-center bg-white border border-gold/15 rounded-lg overflow-hidden px-3 py-2 text-xs">
            <span className="text-dark-muted mr-1.5 uppercase font-bold tracking-wider">Trier:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-dark font-semibold outline-none border-none cursor-pointer"
            >
              <option value="popularity">Popularité</option>
              <option value="price-low">Prix : croissant</option>
              <option value="price-high">Prix : décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* ==========================================
            DESKTOP FILTER SIDEBAR
           ========================================== */}
        <aside className="hidden md:block w-64 bg-white border border-gold/10 rounded-xl p-6 space-y-6 luxury-shadow-sm sticky top-24">
          
          <div className="flex justify-between items-center border-b border-gold/10 pb-3">
            <h3 className="font-serif-display font-semibold text-sm tracking-wider text-dark uppercase flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-gold" /> Filtres
            </h3>
            <button onClick={resetFilters} className="text-[10px] text-error font-bold uppercase hover:underline">
              Effacer
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Catégories</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs py-1 px-2 rounded transition font-medium ${!selectedCategory ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
              >
                Toutes les catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left text-xs py-1 px-2 rounded transition font-medium ${selectedCategory === cat.slug ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 border-t border-gold/5 pt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Marques</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedBrand('')}
                className={`w-full text-left text-xs py-1 px-2 rounded transition font-medium ${!selectedBrand ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
              >
                Toutes les marques
              </button>
              {brands.map((br) => (
                <button
                  key={br.id}
                  onClick={() => setSelectedBrand(br.slug)}
                  className={`w-full text-left text-xs py-1 px-2 rounded transition font-medium ${selectedBrand === br.slug ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
                >
                  {br.name}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Type */}
          <div className="space-y-2 border-t border-gold/5 pt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Type de Peau</h4>
            <select
              value={selectedSkinType}
              onChange={(e) => setSelectedSkinType(e.target.value)}
              className="w-full text-xs bg-bg-cream border border-gold/15 rounded-lg px-2 py-2 text-dark font-medium"
            >
              <option value="All">Tous les types de peau</option>
              <option value="Oily">Grasse (Oily)</option>
              <option value="Dry">Sèche (Dry)</option>
              <option value="Sensitive">Sensible (Sensitive)</option>
              <option value="Combination">Mixte (Combination)</option>
            </select>
          </div>

          {/* Skin Concern */}
          <div className="space-y-2 border-t border-gold/5 pt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Préoccupation</h4>
            <select
              value={selectedConcern}
              onChange={(e) => setSelectedConcern(e.target.value)}
              className="w-full text-xs bg-bg-cream border border-gold/15 rounded-lg px-2 py-2 text-dark font-medium"
            >
              <option value="All">Toutes les préoccupations</option>
              <option value="Hydration">Hydratation</option>
              <option value="Anti-Aging">Anti-Âge</option>
              <option value="Acne">Acné & Pores</option>
              <option value="Brightening">Teint Terne & Taches</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 border-t border-gold/5 pt-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gold font-bold">
              <span>Prix Maximum</span>
              <span className="text-dark font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold cursor-pointer"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2 border-t border-gold/5 pt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Note Minimale</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((ratingVal) => (
                <button
                  key={ratingVal}
                  onClick={() => setMinRating(minRating === ratingVal ? 0 : ratingVal)}
                  className={`flex-1 py-1 rounded text-xs border transition ${minRating >= ratingVal ? 'border-gold bg-gold text-white font-bold' : 'border-gold/15 bg-white text-dark hover:bg-bg-cream'}`}
                >
                  {ratingVal}★
                </button>
              ))}
            </div>
          </div>

        </aside>


        {/* ==========================================
            PRODUCTS GRID
           ========================================== */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gold/10 rounded-xl luxury-shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-bg-cream flex items-center justify-center text-gold mx-auto border border-gold/10">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="font-serif-display text-lg font-semibold text-dark">Aucun produit ne correspond</h3>
              <p className="text-xs text-dark-muted max-w-xs mx-auto leading-relaxed">
                Essayez d\'ajuster vos filtres de recherche ou de réinitialiser la sélection pour afficher tout notre catalogue.
              </p>
              <button
                onClick={resetFilters}
                className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-lg transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="group bg-white rounded-xl overflow-hidden luxury-shadow-sm hover:luxury-shadow border border-gold/5 flex flex-col justify-between transition-all duration-300">
                  
                  <Link href={`/product/?slug=${prod.slug}`} className="relative block overflow-hidden aspect-square bg-bg-cream">
                    {prod.discount_percent > 0 && (
                      <span className="absolute top-3 left-3 bg-accent text-white text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded z-10 shadow-sm">
                        -{prod.discount_percent}% OFF
                      </span>
                    )}
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-gold font-bold">
                        {brands.find(b => b.id === prod.brand_id)?.name || 'EUREKA BEAUTY'}
                      </p>
                      <Link href={`/product/?slug=${prod.slug}`}>
                        <h3 className="font-serif-display text-sm font-semibold text-dark hover:text-gold transition truncate mt-0.5">{prod.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-1 text-gold">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold text-dark">{prod.rating}</span>
                        <span className="text-[9px] text-dark-muted">({prod.review_count})</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        {prod.discount_percent > 0 ? (
                          <>
                            <span className="text-xs text-dark-muted line-through font-light">
                              {formatPrice(prod.price_xof)}
                            </span>
                            <span className="text-sm font-bold text-gold">
                              {formatPrice(prod.price_xof * (1 - prod.discount_percent / 100))}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-dark">
                            {formatPrice(prod.price_xof)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          addToCart(prod, 1);
                          alert(`${prod.name} ajouté au panier !`);
                        }}
                        disabled={prod.stock <= 0}
                        className="bg-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition"
                      >
                        {prod.stock > 0 ? 'Ajouter' : 'Rupture'}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          MOBILE FILTER SIDEBAR OVERLAY
         ========================================== */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          
          <div className="relative w-80 bg-white h-full overflow-y-auto p-6 space-y-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex justify-between items-center border-b border-gold/10 pb-3 mb-6">
                <h3 className="font-serif-display font-semibold text-sm tracking-wider text-dark uppercase">Filtres</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-dark hover:text-gold transition">
                  <X size={18} />
                </button>
              </div>

              {/* Categories mobile */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Catégories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${!selectedCategory ? 'bg-gold text-white border-gold font-bold' : 'bg-bg-cream text-dark border-transparent'}`}
                  >
                    Toutes
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedCategory === cat.slug ? 'bg-gold text-white border-gold font-bold' : 'bg-bg-cream text-dark border-transparent'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands mobile */}
              <div className="space-y-2 border-t border-gold/5 pt-4 mt-4">
                <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Marques</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBrand('')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${!selectedBrand ? 'bg-gold text-white border-gold font-bold' : 'bg-bg-cream text-dark border-transparent'}`}
                  >
                    Toutes
                  </button>
                  {brands.map((br) => (
                    <button
                      key={br.id}
                      onClick={() => setSelectedBrand(br.slug)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedBrand === br.slug ? 'bg-gold text-white border-gold font-bold' : 'bg-bg-cream text-dark border-transparent'}`}
                    >
                      {br.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Type mobile */}
              <div className="space-y-2 border-t border-gold/5 pt-4 mt-4">
                <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Type de Peau</h4>
                <select
                  value={selectedSkinType}
                  onChange={(e) => setSelectedSkinType(e.target.value)}
                  className="w-full text-xs bg-bg-cream border border-gold/15 rounded-lg px-2 py-2 text-dark font-medium"
                >
                  <option value="All">Tous les types de peau</option>
                  <option value="Oily">Grasse (Oily)</option>
                  <option value="Dry">Sèche (Dry)</option>
                  <option value="Sensitive">Sensible (Sensitive)</option>
                  <option value="Combination">Mixte (Combination)</option>
                </select>
              </div>

              {/* Skin Concern mobile */}
              <div className="space-y-2 border-t border-gold/5 pt-4 mt-4">
                <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Préoccupation</h4>
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="w-full text-xs bg-bg-cream border border-gold/15 rounded-lg px-2 py-2 text-dark font-medium"
                >
                  <option value="All">Toutes les préoccupations</option>
                  <option value="Hydration">Hydratation</option>
                  <option value="Anti-Aging">Anti-Âge</option>
                  <option value="Acne">Acné & Pores</option>
                  <option value="Brightening">Teint Terne & Taches</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gold/10 flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 border border-gold/15 bg-white text-xs font-semibold uppercase tracking-wider py-3 rounded-lg text-dark"
              >
                Effacer
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-gold text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-lg shadow-sm"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <Shop />
    </Suspense>
  );
}
