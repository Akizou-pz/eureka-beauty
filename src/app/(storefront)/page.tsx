'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { useCart } from '@/context/CartContext';
import { db, Product, HomepageSettings } from '@/lib/db';
import {
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Star,
  ShieldCheck,
  Truck,
  MessageCircle
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { formatPrice, t, translateProduct, language } = useLangCurr();
  const { addToCart } = useCart();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);

  // Ticking countdown state for Flash Sale (target midnight tonight)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // FAQ active indexes
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Before/After slide state
  const [comparePosition, setComparePosition] = useState(50);

  // Active Hero Banner Slide
  const [heroSlide, setHeroSlide] = useState(0);

  const loadHomepage = () => {
    setHomepageSettings(db.getHomepageSettings());
  };

  const currentSettings = homepageSettings || {
    hero_slides: [
      {
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
        tag: 'EUREKA LAB EXCLUSIF',
        tag_en: 'EXCLUSIVE EUREKA LAB',
        title: 'Des Soins Authentiques Révélant Votre Confiance',
        title_en: 'Authentic Skincare Revealing Your Confidence',
        desc: 'Formulés à base de plantes précieuses africaines pour hydrater, unifier et sublimer les peaux riches en mélanine.',
        desc_en: 'Formulated with precious African botanicals to hydrate, even out and enhance melanin-rich skin.'
      },
      {
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&auto=format&fit=crop&q=80',
        tag: 'PARTENAIRE FENTY BEAUTY',
        tag_en: 'FENTY BEAUTY PARTNER',
        title: 'Sublimez Vos Teints Dorés et Métissés',
        title_en: 'Enhance Your Golden and Mixed Skin Tones',
        desc: 'Retrouvez nos sélections exclusives et adaptées au climat tropical. Sans effet masque, résistant à la chaleur.',
        desc_en: 'Find our exclusive selections adapted to tropical climate. Lightweight, sweat-resistant.'
      }
    ],
    before_after: {
      before_image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=80',
      after_image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    },
    instagram_images: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400'
    ]
  };

  const heroSlides = currentSettings.hero_slides.map(slide => ({
    image: slide.image,
    tag: language === 'EN' ? (slide.tag_en || slide.tag) : slide.tag,
    title: language === 'EN' ? (slide.title_en || slide.title) : slide.title,
    desc: language === 'EN' ? (slide.desc_en || slide.desc) : slide.desc,
  }));

  const loadProducts = () => {
    const prods = db.getProducts().map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'])
    }));
    setProducts(prods);
    setBestSellers(prods.filter(p => p.is_featured));
    setFlashSales(prods.filter(p => p.is_flash_sale));
  };

  const displayBestSellers = bestSellers.map(p => translateProduct(p));
  const displayFlashSales = flashSales.map(p => translateProduct(p));

  // Load products & calculate countdown
  useEffect(() => {
    loadProducts();
    loadHomepage();
    window.addEventListener('supabase_sync_complete', loadProducts);
    window.addEventListener('supabase_sync_complete', loadHomepage);

    // Timer calculation (Midnight target)
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(24, 0, 0, 0); // next midnight

      const diff = target.getTime() - now.getTime();
      let h = Math.floor(diff / (1000 * 60 * 60));
      let m = Math.floor((diff / 1000 / 60) % 60);
      let s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    // Hero carousel auto-play
    const heroTimer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearInterval(heroTimer);
      window.removeEventListener('supabase_sync_complete', loadProducts);
      window.removeEventListener('supabase_sync_complete', loadHomepage);
    };
  }, []);

  const faqs = [
    {
      q: 'Vos cosmétiques sont-ils authentiques ?',
      a: 'Absolument. Eureka Beauty garantit que 100% de ses produits sont authentiques. Nous importons directement des marques officielles ou de leurs laboratoires agrées. Chaque lot est scrupuleusement audité avant envoi.'
    },
    {
      q: 'Comment fonctionne le paiement à la livraison (COD) ?',
      a: 'Il vous suffit de sélectionner "Paiement à la livraison" lors de votre checkout. Vous passez commande gratuitement sur notre site, puis vous réglez le livreur en espèces ou en Mobile Money (Wave, Orange, MTN, Moov) au moment où il vous remet votre colis.'
    },
    {
      q: 'Quels sont les délais et tarifs de livraison ?',
      a: 'Pour Lomé et le Togo, nous livrons en moins de 24h ouvrées. Pour les autres capitales de la sous-région (Abidjan, Cotonou, Dakar, Douala), les colis arrivent en 2 à 4 jours. Les tarifs varient entre 1000 FCFA et 3500 FCFA selon la zone.'
    },
    {
      q: 'Puis-je commander par WhatsApp ?',
      a: 'Oui, bien sûr ! Cliquez sur le bouton vert WhatsApp flottant en bas à droite. Envoyez-nous simplement les captures d\'écran ou les noms des produits souhaités, et notre service client créera la commande pour vous.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">

      {/* 1. LUXURY HERO BANNER */}
      <section className="relative h-[650px] overflow-hidden bg-dark">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${heroSlide === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt="Hero image"
              className="w-full h-full object-cover scale-105 transition-transform duration-[6000ms]"
            />

            {/* Hero Text Content */}
            <div className="absolute inset-0 flex flex-col justify-center z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl text-white space-y-6">
                <span className="text-[10px] tracking-[0.3em] font-semibold text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full uppercase inline-block">
                  {slide.tag}
                </span>
                <h1 className="font-serif-display text-4xl sm:text-6xl font-medium tracking-wide leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base font-light text-white/80 leading-relaxed max-w-lg">
                  {slide.desc}
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-lg transition shadow-lg flex items-center gap-2 group"
                  >
                    <span>Acheter Maintenant</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                  </Link>
                  <a
                    href="https://wa.me/22893866752"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-lg transition flex items-center gap-2"
                  >
                    <MessageCircle size={14} className="text-[#25D366]" />
                    <span>Commander via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition ${heroSlide === idx ? 'bg-gold w-6' : 'bg-white/40'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>


      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-md mx-auto space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Collections</span>
          <h2 className="font-serif-display text-3xl font-medium tracking-wider text-dark">Nos Univers Beauté</h2>
          <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {db.getCategories().map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-72 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 luxury-border"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent z-10 transition-opacity group-hover:opacity-95" />
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 space-y-1">
                <h3 className="font-serif-display text-lg text-white font-semibold tracking-wider">{cat.name}</h3>
                <p className="text-[10px] text-gold uppercase tracking-widest font-light flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300">
                  Découvrir <ChevronRight size={10} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* 3. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-gold/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Sélection Premium</span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-medium tracking-wider text-dark">Nos Meilleures Ventes</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest font-bold text-gold hover:text-gold-hover transition flex items-center gap-1">
            Voir Tout <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {displayBestSellers.map((prod) => (
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
                    {db.getBrands().find(b => b.id === prod.brand_id)?.name || 'EUREKA BEAUTY'}
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
      </section>


      {/* 4. FLASH SALE WITH COUNTDOWN TIMER */}
      {flashSales.length > 0 && (
        <section className="bg-gradient-to-br from-[#222] to-[#111] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">

            {/* Left Promo text & timer */}
            <div className="space-y-6 max-w-md text-center lg:text-left">
              <span className="text-[10px] bg-accent/20 border border-accent/40 text-accent font-semibold px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
                <Clock size={12} className="animate-spin" /> Offre Flash Limitée
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-wide">
                Ventes Flash de la Semaine
              </h2>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Profitez de réductions exclusives sur une sélection de nos huiles et crèmes botaniques. Dépêchez-vous, le stock est extrêmement limité !
              </p>

              {/* Countdown Ticker */}
              <div className="flex justify-center lg:justify-start gap-4">
                {[
                  { label: 'Heures', val: timeLeft.hours },
                  { label: 'Minutes', val: timeLeft.minutes },
                  { label: 'Secondes', val: timeLeft.seconds }
                ].map((tUnit, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[70px] text-center">
                    <span className="font-serif-display text-2xl font-bold text-gold block leading-none">
                      {String(tUnit.val).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mt-1 block">
                      {tUnit.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:max-w-2xl">
              {displayFlashSales.slice(0, 2).map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl p-4 flex gap-4 text-dark items-center shadow-lg border border-gold/10">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-24 h-24 object-cover rounded-lg bg-bg-cream flex-shrink-0"
                  />
                  <div className="flex-grow space-y-1 text-xs">
                    <p className="text-[8px] uppercase tracking-widest text-gold font-bold">OFFRE FLASH</p>
                    <h3 className="font-serif-display font-semibold truncate text-sm">{prod.name}</h3>
                    <div className="flex gap-2 items-center">
                      <span className="line-through text-dark-muted text-[10px]">{formatPrice(prod.price_xof)}</span>
                      <span className="text-gold font-bold text-xs">{formatPrice(prod.price_xof * 0.85)}</span>
                    </div>
                    {/* Stock meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-dark-muted">
                        <span>Restants: {prod.stock}</span>
                        <span>-15%</span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-cream rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(prod.stock / 60) * 100}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(prod, 1);
                        alert(`${prod.name} ajouté au panier !`);
                      }}
                      className="w-full mt-2 bg-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-widest py-2 rounded transition"
                    >
                      En profiter
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}


      {/* 5. BEFORE / AFTER COMPARISON GALLERY (High CRO Trust Builder) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Résultats Cliniques</span>
          <h2 className="font-serif-display text-3xl font-medium tracking-wider text-dark">Une Efficacité Révolutionnaire</h2>
          <p className="text-xs text-dark-muted max-w-sm mx-auto leading-relaxed mt-2 font-light">
            Découvrez la transformation de nos clientes après 14 jours d\'application du sérum Shea Glow.
          </p>
        </div>

        <div className="relative h-[400px] rounded-2xl overflow-hidden luxury-shadow luxury-border bg-bg-cream">
          {/* After Image */}
          <div className="absolute inset-0 select-none">
            <img
              src={currentSettings.before_after.after_image}
              alt="After treatment skin"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-4 right-4 bg-gold/90 text-white font-semibold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg backdrop-blur-sm shadow z-20">
              Après 14 jours
            </span>
          </div>

          {/* Before Image (overlay width controlled by slider) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden select-none border-r border-gold z-10"
            style={{ width: `${comparePosition}%` }}
          >
            <img
              src={currentSettings.before_after.before_image}
              alt="Before treatment skin"
              className="absolute inset-0 w-full h-[400px] object-cover max-w-none"
              style={{ width: '100%' }} // locks sizing
            />
            <span className="absolute bottom-4 left-4 bg-dark/80 text-white font-semibold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg backdrop-blur-sm shadow">
              Avant Traitement
            </span>
          </div>

          {/* Range Slider Handle overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={comparePosition}
            onChange={(e) => setComparePosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          {/* Centered slider indicator bar */}
          <div
            className="absolute inset-y-0 pointer-events-none z-20 flex flex-col justify-center items-center"
            style={{ left: `calc(${comparePosition}% - 12px)` }}
          >
            <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white border-2 border-white shadow-xl">
              ↔
            </div>
          </div>
        </div>
      </section>


      {/* 6. INSTAGRAM SOCIAL FEED & REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">#EurekaGlow</span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-medium tracking-wider text-dark">Inspirations Instagram</h2>
          <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentSettings.instagram_images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden luxury-border">
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 z-10 flex items-center justify-center text-white text-xs tracking-widest font-semibold gap-1">
                <Sparkles size={14} className="text-gold" /> VOIR LE LOOK
              </div>
              <img
                src={url}
                alt="Instagram Look"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>


      {/* 7. FAQ ACCORDION SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Des Questions ?</span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-medium tracking-wider text-dark">Foire Aux Questions</h2>
          <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gold/10 luxury-shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex justify-between items-center text-left text-xs sm:text-sm font-semibold text-dark hover:text-gold transition gap-4"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-gold flex-shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gold-hover transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>

              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-xs text-dark-muted leading-relaxed font-light border-t border-gold/5 bg-bg-cream/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
