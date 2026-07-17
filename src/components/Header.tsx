'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLangCurr, Language, Currency } from '@/context/LanguageCurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { db, Product } from '@/lib/db';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart, 
  Trash2, 
  Plus, 
  Minus, 
  Globe, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, currency, setLanguage, setCurrency, t, formatPrice } = useLangCurr();
  const { user, logout } = useAuth();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartSubtotal, 
    appliedCoupon, 
    applyCouponCode, 
    removeCoupon 
  } = useCart();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });

  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (currRef.current && !currRef.current.contains(event.target as Node)) {
        setCurrDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync route changes to close mobile menu
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Autocomplete live search search logic
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      const allProds = db.getProducts();
      const filtered = allProds.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skin_type.toLowerCase().includes(q) ||
          p.skin_concern.toLowerCase().includes(q)
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = await applyCouponCode(couponCode);
    if (res.success) {
      setCouponMsg({ text: 'Code promo appliqué avec succès !', type: 'success' });
      setCouponCode('');
    } else {
      setCouponMsg({ text: res.error || 'Code invalide', type: 'error' });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Top Promotion bar */}
      <div className="bg-dark text-white text-center py-2 px-4 text-xs font-light tracking-widest border-b border-gold/15 flex items-center justify-between md:justify-center gap-4">
        <span>LIVRAISON GRATUITE DÈS 20 000 FCFA | SHIPPING WORLDWIDE</span>
        <div className="flex gap-4 text-[10px] hidden md:flex">
          <Link href="/track" className="hover:text-gold transition">Suivi</Link>
          <span>|</span>
          <a href="https://wa.me/22507070707" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition flex items-center gap-1">
            WhatsApp Commandes
          </a>
        </div>
      </div>

      {/* Main Glassmorphism Header */}
      <header className="sticky top-0 z-40 w-full luxury-glass border-b border-gold/10 luxury-shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-dark hover:text-gold transition p-2"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
            
            <Link href="/" className="flex flex-col">
              <span className="font-serif-display text-2xl font-semibold tracking-wider text-dark hover:opacity-90 transition">
                EUREKA <span className="text-gold font-normal">BEAUTY</span>
              </span>
              <span className="text-[8px] tracking-[0.25em] uppercase text-gold font-light hidden sm:block">
                Reveal Your Natural Beauty
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest">
            <Link 
              href="/" 
              className={`hover:text-gold transition ${pathname === '/' ? 'text-gold border-b border-gold/40' : 'text-dark'}`}
            >
              {t('home')}
            </Link>
            <Link 
              href="/shop" 
              className={`hover:text-gold transition ${pathname.startsWith('/shop') ? 'text-gold border-b border-gold/40' : 'text-dark'}`}
            >
              {t('shop')}
            </Link>
            <Link 
              href="/blog" 
              className={`hover:text-gold transition ${pathname.startsWith('/blog') ? 'text-gold border-b border-gold/40' : 'text-dark'}`}
            >
              {t('blog')}
            </Link>
            <Link 
              href="/track" 
              className={`hover:text-gold transition ${pathname.startsWith('/track') ? 'text-gold border-b border-gold/40' : 'text-dark'}`}
            >
              {t('trackOrder')}
            </Link>
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="text-gold hover:text-gold-hover transition flex items-center gap-1 font-bold"
              >
                <LayoutDashboard size={14} />
                {t('admin')}
              </Link>
            )}
          </nav>

          {/* Action icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Live Search Trigger & Box */}
            <div ref={searchRef} className="relative">
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="text-dark hover:text-gold transition p-2"
                aria-label="Recherche"
              >
                <Search size={20} />
              </button>
              
              {searchOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl luxury-shadow luxury-border p-4 z-50 fade-in">
                  <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-sm bg-bg-cream rounded-lg px-3 py-2 border border-gold/15 text-dark"
                      autoFocus
                    />
                    <button type="submit" className="bg-gold hover:bg-gold-hover text-white rounded-lg px-4 py-2 transition text-xs uppercase tracking-widest font-semibold">
                      OK
                    </button>
                  </form>
                  
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
                        <TrendingUp size={12} /> Suggestions
                      </div>
                      {searchResults.map((product) => (
                        <Link 
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 p-2 hover:bg-bg-cream rounded-lg transition"
                        >
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded" 
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-semibold text-dark truncate">{product.name}</p>
                            <p className="text-gold mt-0.5">{formatPrice(product.price_xof)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <p className="text-xs text-dark-muted py-2 text-center">Aucun produit trouvé</p>
                  ) : (
                    <div className="text-xs text-dark-muted py-1">
                      <p className="font-semibold uppercase tracking-wider text-[10px] text-gold mb-1">Recherches Populaires</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Shea', 'Glow', 'Foundation', 'Baobab', 'Rouge'].map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setSearchQuery(term);
                            }}
                            className="bg-bg-cream px-2 py-1 rounded text-[10px] hover:text-gold hover:border-gold border border-transparent transition"
                          >
                            #{term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div ref={langRef} className="relative hidden md:block">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="text-dark hover:text-gold transition p-2 flex items-center gap-1 text-xs font-semibold tracking-wider"
              >
                <Globe size={16} />
                <span>{language}</span>
              </button>
              
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg luxury-shadow luxury-border p-1 z-50">
                  <button 
                    onClick={() => { setLanguage('FR'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-bg-cream transition flex justify-between items-center ${language === 'FR' ? 'text-gold font-bold' : 'text-dark'}`}
                  >
                    <span>Français</span>
                    <span className="text-[10px] opacity-40">FR</span>
                  </button>
                  <button 
                    onClick={() => { setLanguage('EN'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-bg-cream transition flex justify-between items-center ${language === 'EN' ? 'text-gold font-bold' : 'text-dark'}`}
                  >
                    <span>English</span>
                    <span className="text-[10px] opacity-40">EN</span>
                  </button>
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div ref={currRef} className="relative">
              <button 
                onClick={() => setCurrDropdownOpen(!currDropdownOpen)}
                className="text-dark hover:text-gold transition p-2 flex items-center gap-1 text-xs font-semibold tracking-wider"
              >
                <span>{currency}</span>
              </button>
              
              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg luxury-shadow luxury-border p-1 z-50">
                  {['XOF', 'XAF', 'USD', 'EUR'].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => { setCurrency(curr as any); setCurrDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-bg-cream transition flex justify-between items-center ${currency === curr ? 'text-gold font-bold' : 'text-dark'}`}
                    >
                      <span>{curr === 'XOF' ? 'CFA Ouest' : curr === 'XAF' ? 'CFA Centre' : curr}</span>
                      <span className="text-[10px] opacity-40">{curr}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Icon */}
            <Link 
              href={user ? "/dashboard" : "/dashboard?auth=login"} 
              className="text-dark hover:text-gold transition p-2 flex items-center gap-1"
              aria-label="Compte Client"
            >
              <User size={20} />
              {user && (
                <span className="text-[10px] font-bold tracking-wider hidden lg:inline max-w-[80px] truncate text-gold">
                  {user.first_name}
                </span>
              )}
            </Link>

            {/* Cart Bag Icon with trigger */}
            <button 
              onClick={() => setCartDrawerOpen(true)}
              className="text-dark hover:text-gold transition p-2 relative"
              aria-label="Panier"
            >
              <ShoppingBag size={20} />
              {totalCartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Slide-out Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity"
            onClick={() => setCartDrawerOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white luxury-shadow flex flex-col h-full fade-in">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gold/10 flex items-center justify-between">
                <h2 className="text-lg font-serif-display font-bold tracking-wider text-dark flex items-center gap-2">
                  <ShoppingBag size={20} className="text-gold" />
                  {t('cart')} ({totalCartCount})
                </h2>
                <button 
                  onClick={() => setCartDrawerOpen(false)}
                  className="text-dark hover:text-gold transition p-1"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 py-6 overflow-y-auto px-6 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-bg-cream rounded-full flex items-center justify-center text-gold mb-4 luxury-border">
                      <ShoppingBag size={24} />
                    </div>
                    <p className="text-sm font-medium text-dark-muted mb-6">{t('emptyCart')}</p>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        router.push('/shop');
                      }}
                      className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-lg transition"
                    >
                      {t('continueShopping')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex gap-4 border-b border-gold/5 pb-6">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-lg bg-bg-cream luxury-border flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-dark">
                              <h3 className="truncate max-w-[180px]">{item.name}</h3>
                              <p className="text-gold font-bold">
                                {formatPrice(item.price_xof * (1 - item.discount_percent / 100) * item.quantity)}
                              </p>
                            </div>
                            {item.discount_percent > 0 && (
                              <p className="text-[10px] text-accent mt-0.5 font-bold">
                                -{item.discount_percent}% remise
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px] mt-2">
                            {/* Quantity Adjuster */}
                            <div className="flex items-center border border-gold/15 rounded-md bg-bg-cream overflow-hidden">
                              <button 
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                className="p-1 hover:text-gold transition"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-2 font-bold text-dark">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                className="p-1 hover:text-gold transition"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            
                            {/* Remove button */}
                            <button 
                              onClick={() => removeFromCart(item.product_id)}
                              className="text-dark-muted hover:text-error transition flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              <span>Retirer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gold/10 px-6 py-6 bg-bg-cream space-y-4">
                  {/* Coupon Application */}
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('couponPlaceholder')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 text-xs bg-white rounded-lg px-3 py-2 border border-gold/15 text-dark"
                    />
                    <button type="submit" className="bg-dark hover:bg-gold hover:text-white text-white border border-transparent rounded-lg px-4 py-2 transition text-xs uppercase tracking-widest font-semibold">
                      {t('applyCoupon')}
                    </button>
                  </form>
                  {couponMsg.text && (
                    <p className={`text-[10px] font-bold ${couponMsg.type === 'success' ? 'text-success' : 'text-error'}`}>
                      {couponMsg.text}
                    </p>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gold/15 text-xs text-gold">
                      <span>Code appliqué: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discount_percent}%)</span>
                      <button onClick={removeCoupon} className="text-[10px] text-error font-bold uppercase hover:underline">Retirer</button>
                    </div>
                  )}

                  {/* Pricing Summary */}
                  <div className="space-y-2 text-xs text-dark-muted">
                    <div className="flex justify-between">
                      <span>{t('subtotal')}</span>
                      <span className="font-semibold text-dark">{formatPrice(getCartSubtotal())}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-gold font-bold">
                        <span>{t('discount')} ({appliedCoupon.discount_percent}%)</span>
                        <span>-{formatPrice(getCartSubtotal() * (appliedCoupon.discount_percent / 100))}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gold/10 pt-3 text-sm text-dark font-bold">
                      <span>Total (hors livraison)</span>
                      <span className="text-gold font-serif-display font-semibold text-base">
                        {formatPrice(getCartSubtotal() - (appliedCoupon ? getCartSubtotal() * (appliedCoupon.discount_percent / 100) : 0))}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        router.push('/checkout');
                      }}
                      className="w-full bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest py-4 rounded-lg transition flex items-center justify-center gap-2 group shadow-md hover:shadow-lg"
                    >
                      <span>{t('checkout')}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 bg-white luxury-shadow flex flex-col h-full z-50 animate-in fade-in slide-in-from-left duration-200">
            <div className="px-6 py-6 border-b border-gold/10 flex justify-between items-center">
              <span className="font-serif-display text-xl font-semibold tracking-wider text-dark">
                EUREKA <span className="text-gold">BEAUTY</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-dark hover:text-gold transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 py-6 px-6 space-y-6 text-sm font-semibold uppercase tracking-widest">
              <Link href="/" className="block hover:text-gold transition py-2 border-b border-gold/5">{t('home')}</Link>
              <Link href="/shop" className="block hover:text-gold transition py-2 border-b border-gold/5">{t('shop')}</Link>
              <Link href="/blog" className="block hover:text-gold transition py-2 border-b border-gold/5">{t('blog')}</Link>
              <Link href="/track" className="block hover:text-gold transition py-2 border-b border-gold/5">{t('trackOrder')}</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="block text-gold hover:text-gold-hover transition py-2 border-b border-gold/5">{t('admin')}</Link>
              )}
            </div>

            <div className="p-6 bg-bg-cream border-t border-gold/10 text-xs">
              <p className="font-semibold text-dark-muted mb-3">LANGUE & DEVISE</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-white px-2 py-2 rounded border border-gold/15 text-dark font-medium"
                >
                  <option value="FR">Français (FR)</option>
                  <option value="EN">English (EN)</option>
                </select>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-white px-2 py-2 rounded border border-gold/15 text-dark font-medium"
                >
                  <option value="XOF">XOF (CFA)</option>
                  <option value="XAF">XAF (CFA)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
