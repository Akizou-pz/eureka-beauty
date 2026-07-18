'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { useCart } from '@/context/CartContext';
import { db, Product, Review } from '@/lib/db';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  MessageCircle,
  Play
} from 'lucide-react';

export default function ProductDetailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';

  const { formatPrice, t, translateProduct } = useLangCurr();
  const { addToCart, clearCart } = useCart();

  // Component states
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'how-to' | 'reviews' | 'delivery'>('details');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Bundle state
  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  const [bundleAdded, setBundleAdded] = useState(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const sanitizeProductData = (p: Product): Product => {
    const sanitizedImages = Array.isArray(p.images) 
      ? p.images 
      : (p.images ? [p.images] : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600']);
    return {
      ...p,
      images: sanitizedImages,
      discount_percent: Number(p.discount_percent || 0),
      price_xof: Number(p.price_xof || 0),
      stock: Number(p.stock || 0),
      rating: Number(p.rating || 5),
    };
  };

  const loadProductDetail = () => {
    const foundProduct = db.getProductBySlug(slug);
    if (!foundProduct) {
      router.push('/shop');
      return;
    }

    const sanitized = sanitizeProductData(foundProduct);
    setProduct(sanitized);
    setActiveImage(sanitized.images[0] || '');
    setIsVideoActive(false);
    
    // Fetch product reviews
    const prodReviews = db.getReviews(foundProduct.id);
    setReviews(prodReviews);

    // Fetch related products (same category)
    const related = db.getProducts().map(sanitizeProductData).filter(
      (p) => p.category_id === foundProduct.category_id && p.id !== foundProduct.id
    );
    setRelatedProducts(related.slice(0, 4));

    // Seed bundle recommendations (e.g. 2 other items)
    const bundleItems = db.getProducts().map(sanitizeProductData).filter((p) => p.id !== foundProduct.id);
    setBundleProducts(bundleItems.slice(0, 2));
  };

  useEffect(() => {
    loadProductDetail();
    setIsVideoActive(false);
    // Reset counts
    setQuantity(1);
    setReviewSubmitted(false);
    // Scroll window back to top when switching to a different product
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  useEffect(() => {
    window.addEventListener('supabase_sync_complete', loadProductDetail);
    return () => window.removeEventListener('supabase_sync_complete', loadProductDetail);
  }, [slug]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  const displayProduct = translateProduct(product);
  const displayRelated = relatedProducts.map(p => translateProduct(p));
  const displayBundle = bundleProducts.map(p => translateProduct(p));

  // Price calculations
  const discountedUnitPrice = displayProduct.price_xof * (1 - displayProduct.discount_percent / 100);
  const isLowStock = displayProduct.stock > 0 && displayProduct.stock <= 5;
  const isOutOfStock = displayProduct.stock === 0;

  // Bundle calculations
  const bundleSubtotal = discountedUnitPrice + displayBundle.reduce((sum, p) => sum + p.price_xof * (1 - p.discount_percent / 100), 0);
  const bundleDiscountedTotal = bundleSubtotal * 0.9; // 10% discount on bundle!

  const handleAddBundleToCart = () => {
    addToCart(product, 1);
    bundleProducts.forEach((p) => addToCart(p, 1));
    setBundleAdded(true);
    alert('Lot complet ajouté au panier avec 10% de réduction !');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    const newReview = {
      product_id: product.id,
      customer_name: reviewerName,
      rating: reviewRating,
      comment: reviewComment,
      is_verified_buyer: true,
      helpful_votes: 0,
    };

    const added = db.addReview(product.id, reviewerName, reviewRating, reviewComment);
    
    // Refresh reviews
    const updatedReviews = db.getReviews(product.id);
    setReviews(updatedReviews);

    // Refresh product (rating/review_count updates)
    const refreshedProd = db.getProductById(product.id);
    if (refreshedProd) {
      setProduct(sanitizeProductData(refreshedProd));
    }

    setReviewSubmitted(true);
    setReviewerName('');
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Main Product Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-2xl overflow-hidden luxury-border luxury-shadow-sm flex items-center justify-center relative">
            {displayProduct.discount_percent > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg shadow z-10">
                -{displayProduct.discount_percent}% OFF
              </span>
            )}
            {isVideoActive && displayProduct.video_url ? (
              (() => {
                const url = displayProduct.video_url;
                const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
                if (isYouTube) {
                  let videoId = '';
                  if (url.includes('youtube.com/watch?v=')) {
                    videoId = url.split('v=')[1]?.split('&')[0] || '';
                  } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
                  } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('embed/')[1]?.split('?')[0] || '';
                  }
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title={displayProduct?.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }

                return (
                  <video
                    src={url}
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover bg-black"
                  />
                );
              })()
            ) : (
              <img
                src={activeImage}
                alt={displayProduct.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Thumbnails */}
          {(displayProduct.images.length > 1 || displayProduct.video_url) && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {displayProduct.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImage(imgUrl);
                    setIsVideoActive(false);
                  }}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition ${!isVideoActive && activeImage === imgUrl ? 'border-gold' : 'border-gold/15'}`}
                >
                  <img src={imgUrl} alt={`${displayProduct.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {displayProduct.video_url && (
                <button
                  onClick={() => setIsVideoActive(true)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 flex flex-col items-center justify-center relative transition ${isVideoActive ? 'border-gold bg-gold/5' : 'border-gold/15 bg-white/40'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-dark mt-1 font-bold">{t('video')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Options */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              {db.getBrands().find(b => b.id === displayProduct.brand_id)?.name || 'EUREKA LAB'}
            </p>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-dark">
              {displayProduct.name}
            </h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center gap-2 text-gold">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(displayProduct.rating) ? 'currentColor' : 'none'}
                    className="text-gold"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-dark">{displayProduct.rating}</span>
              <span className="text-xs text-dark-muted font-light">{t('reviewsCount', { count: reviews.length })}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-bg-cream/40 p-4 rounded-xl luxury-border flex items-center justify-between">
            <div className="flex items-end gap-3">
              {displayProduct.discount_percent > 0 ? (
                <>
                  <span className="text-2xl font-bold text-gold font-serif-display">
                    {formatPrice(discountedUnitPrice)}
                  </span>
                  <span className="text-sm text-dark-muted line-through mb-1">
                    {formatPrice(displayProduct.price_xof)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-dark font-serif-display">
                  {formatPrice(displayProduct.price_xof)}
                </span>
              )}
            </div>
            
            {/* Stock indicator */}
            <div>
              {isOutOfStock ? (
                <span className="flex items-center gap-1 text-xs text-error font-bold bg-error/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  <AlertTriangle size={12} /> {t('outOfStock')}
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1 text-xs text-accent font-bold bg-accent/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  <AlertTriangle size={12} /> {t('onlyLeft', { count: displayProduct.stock })}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-success font-bold bg-success/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Check size={12} /> {t('inStock')}
                </span>
              )}
            </div>
          </div>

          {/* Skin metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-gold/10 p-3 rounded-lg bg-white/40">
              <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">{t('skinTypeLabel')}</span>
              <span className="font-semibold text-dark mt-0.5 block">{displayProduct.skin_type === 'All' ? t('allSkinTypesLabel') : displayProduct.skin_type}</span>
            </div>
            <div className="border border-gold/10 p-3 rounded-lg bg-white/40">
              <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">{t('skinConcernLabel')}</span>
              <span className="font-semibold text-dark mt-0.5 block">{displayProduct.skin_concern}</span>
            </div>
          </div>

          <p className="text-xs text-dark-muted leading-relaxed font-light">
            {displayProduct.description}
          </p>

          {/* Add to Cart Actions */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-gold/10">
              <div className="flex gap-4 items-center">
                {/* Quantity */}
                <div className="flex items-center border border-gold/15 rounded-lg bg-bg-cream overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-3 hover:text-gold transition font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-sm text-dark">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-3 hover:text-gold transition font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    alert(t('itemAddedAlert', { quantity }));
                  }}
                  className="flex-1 bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest py-4 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  <span>{t('addToCart')}</span>
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp Direct Order button */}
          <button
            onClick={() => {
              clearCart();
              addToCart(product, quantity);
              router.push('/checkout?from=whatsapp');
            }}
            className="w-full border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 mt-4"
          >
            <MessageCircle size={16} />
            <span>{t('buyWhatsApp')}</span>
          </button>

          {/* Quick trust flags */}
          <div className="grid grid-cols-3 gap-2 pt-6 text-[10px] text-dark-muted font-light uppercase tracking-wider border-t border-gold/5 text-center">
            <span className="flex flex-col items-center gap-1.5">
              <ShieldCheck size={14} className="text-gold" /> {t('guaranteeTitle')}
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <Truck size={14} className="text-gold" /> {t('freeCod')}
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <RotateCcw size={14} className="text-gold" /> {t('returnDays')}
            </span>
          </div>

        </div>
      </div>


      {/* 2. Frequently Bought Together Upsell */}
      {displayBundle.length >= 2 && (
        <section className="bg-bg-cream/40 border border-gold/15 rounded-2xl p-6 sm:p-8 space-y-6 luxury-shadow-sm">
          <h3 className="font-serif-display font-semibold text-lg text-dark tracking-wider flex items-center gap-2">
            <Sparkles size={18} className="text-gold animate-pulse" />
            {t('frequentlyBought')}
          </h3>
          
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            
            {/* Bundle Visual Flow */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Product 1 (This) */}
              <div className="text-center">
                <img src={displayProduct.images[0]} alt={displayProduct.name} className="w-16 h-16 object-cover rounded-lg bg-white luxury-border" />
                <span className="text-[10px] truncate max-w-[80px] block mt-1 text-dark-muted">{displayProduct.name}</span>
              </div>
              <span className="text-xl text-gold font-bold">+</span>
              
              {/* Bundle 1 */}
              <div className="text-center">
                <img src={displayBundle[0].images[0]} alt={displayBundle[0].name} className="w-16 h-16 object-cover rounded-lg bg-white luxury-border" />
                <span className="text-[10px] truncate max-w-[80px] block mt-1 text-dark-muted">{displayBundle[0].name}</span>
              </div>
              <span className="text-xl text-gold font-bold">+</span>

              {/* Bundle 2 */}
              <div className="text-center">
                <img src={displayBundle[1].images[0]} alt={displayBundle[1].name} className="w-16 h-16 object-cover rounded-lg bg-white luxury-border" />
                <span className="text-[10px] truncate max-w-[80px] block mt-1 text-dark-muted">{displayBundle[1].name}</span>
              </div>
            </div>

            {/* Bundle Price Details & CTA */}
            <div className="flex-1 text-center lg:text-left space-y-2">
              <p className="text-xs text-dark-muted">
                {t('bundleOffer')}
              </p>
              <div className="flex justify-center lg:justify-start items-baseline gap-3">
                <span className="text-lg font-bold text-gold font-serif-display">{formatPrice(bundleDiscountedTotal)}</span>
                <span className="text-xs text-dark-muted line-through">{formatPrice(bundleSubtotal)}</span>
              </div>
              
              <button
                onClick={handleAddBundleToCart}
                disabled={bundleAdded}
                className={`text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition ${bundleAdded ? 'bg-success text-white' : 'bg-dark hover:bg-gold text-white shadow'}`}
              >
                {bundleAdded ? t('bundleAdded') : t('addBundle')}
              </button>
            </div>

          </div>
        </section>
      )}


      {/* 3. Description Tabs */}
      <section className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 luxury-shadow-sm space-y-6">
        
        {/* Tabs Bar */}
        <div className="flex overflow-x-auto border-b border-gold/10 no-scrollbar gap-6">
          {[
            { id: 'details', label: t('productDetails') },
            { id: 'ingredients', label: t('ingredients') },
            { id: 'how-to', label: t('howToUse') },
            { id: 'reviews', label: `${t('reviews')} (${reviews.length})` },
            { id: 'delivery', label: t('shippingDelivery') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition whitespace-nowrap ${activeTab === tab.id ? 'text-gold border-b-2 border-gold font-bold' : 'text-dark-muted hover:text-gold'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content renders */}
        <div className="text-xs text-dark-muted leading-relaxed font-light min-h-[120px]">
          {activeTab === 'details' && (
            <div className="space-y-3 px-1">
              <p>{displayProduct.description}</p>
              <h4 className="font-semibold text-dark mt-4">{t('benefits')} :</h4>
              <p>{displayProduct.benefits || 'Améliore la barrière protectrice cutanée, unifie et lisse le grain de peau.'}</p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-2 px-1">
              <p className="font-semibold text-dark">{t('authenticFormula')}</p>
              <p className="italic">{displayProduct.ingredients || t('ingredientsNotAvailable')}</p>
            </div>
          )}

          {activeTab === 'how-to' && (
            <div className="space-y-2 px-1">
              <p className="font-semibold text-dark">{t('beautyTips')}</p>
              <p>{displayProduct.how_to_use || t('defaultHowToUse')}</p>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4 px-1">
              <p>{t('shippingCoverage')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gold/10 p-3 rounded-lg">
                  <h4 className="font-semibold text-dark">Lomé & Togo</h4>
                  <p className="mt-1 text-[11px]">{t('expressDeliveryInfo')}</p>
                </div>
                <div className="border border-gold/10 p-3 rounded-lg">
                  <h4 className="font-semibold text-dark">{t('otherRegions')}</h4>
                  <p className="mt-1 text-[11px]">{t('standardDeliveryInfo')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              
              {/* Form submit review */}
              <div className="bg-bg-cream/40 p-6 rounded-xl luxury-border space-y-4">
                <h4 className="font-serif-display font-semibold text-sm text-dark tracking-wider">{t('leaveReview')}</h4>
                
                {reviewSubmitted ? (
                  <p className="text-success text-xs font-semibold bg-success/10 px-3 py-2.5 rounded-lg">
                    {t('reviewSubmittedSuccess')}
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">{t('reviewName')}</label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="w-full bg-white rounded-lg px-3 py-2 border border-gold/15 text-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">{t('reviewRating')}</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full bg-white rounded-lg px-2 py-2 border border-gold/15 text-dark"
                        >
                          <option value="5">5 Étoiles (Excellent)</option>
                          <option value="4">4 Étoiles (Très bon)</option>
                          <option value="3">3 Étoiles (Moyen)</option>
                          <option value="2">2 Étoiles (Passable)</option>
                          <option value="1">1 Étoiles (Décevant)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">{t('reviewComment')}</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-white rounded-lg px-3 py-2 border border-gold/15 text-dark resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-dark hover:bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition"
                    >
                      {t('submitReview')}
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center py-4 italic text-dark-muted">{t('noReviewsYet')}</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gold/5 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-dark text-xs flex items-center gap-1.5">
                            {rev.customer_name}
                            {rev.is_verified_buyer && (
                              <span className="text-[9px] bg-success/15 text-success font-semibold px-2 py-0.5 rounded-full">
                                {t('verifiedBuyer')}
                              </span>
                            )}
                          </p>
                          <div className="flex text-gold mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                fill={i < rev.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-dark-muted font-light">{new Date(rev.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="mt-2 text-xs text-dark-muted font-light">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

      </section>


      {/* 4. Recommended Products Grid */}
      {displayRelated.length > 0 && (
        <section className="space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">{t('toCompleteRoutine')}</span>
            <h2 className="font-serif-display text-2xl font-medium tracking-wider text-dark">{t('recommendedProducts')}</h2>
            <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {displayRelated.map((prod) => (
              <div key={prod.id} className="group bg-white rounded-xl overflow-hidden luxury-shadow-sm hover:luxury-shadow border border-gold/5 flex flex-col justify-between transition-all duration-300">
                <Link href={`/product/?slug=${prod.slug}`} className="relative block overflow-hidden aspect-square bg-bg-cream">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                </Link>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-display text-sm font-semibold text-dark truncate">{prod.name}</h3>
                    <p className="text-gold font-bold text-xs mt-1">{formatPrice(prod.price_xof)}</p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(prod, 1);
                      alert(t('singleAddedAlert', { name: prod.name }));
                    }}
                    className="w-full bg-bg-cream hover:bg-gold text-dark hover:text-white border border-gold/15 text-[9px] font-bold uppercase py-2 rounded transition"
                  >
                    {t('addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
