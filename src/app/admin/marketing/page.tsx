'use client';

import React, { useState, useEffect } from 'react';
import { db, Coupon, HomepageSettings } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { Ticket, Mail, Plus, X, Award, CheckCircle, Save, Image as ImageIcon } from 'lucide-react';

export default function AdminMarketingPage() {
  const { formatPrice } = useLangCurr();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'promo' | 'homepage'>('promo');

  // Baseline states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [minValue, setMinValue] = useState(10000);

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setCoupons(db.getCoupons());
    setSubscribers(db.getSubscribers());
    setHomepageSettings(db.getHomepageSettings());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  const openModal = () => {
    setCode('');
    setDiscountPercent(15);
    setMinValue(10000);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    db.createCoupon({
      code: code.toUpperCase().trim(),
      discount_percent: Number(discountPercent),
      min_order_value_xof: Number(minValue),
      is_active: true,
    });

    setSuccessMsg(`Coupon ${code.toUpperCase()} créé avec succès !`);
    setTimeout(() => setSuccessMsg(''), 4000);
    
    loadData();
    setIsOpen(false);
  };

  const handleSaveHomepage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepageSettings) return;

    db.updateHomepageSettings(homepageSettings);
    setSuccessMsg("Configuration visuelle de la page d'accueil enregistrée avec succès !");
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Marketing & Configuration</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Gérer les promotions et personnaliser les visuels de la page d'accueil.</p>
        </div>

        {activeTab === 'promo' && (
          <button
            onClick={openModal}
            className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus size={16} /> Nouveau Code
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex gap-6 border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveTab('promo')}
          className={`text-xs font-semibold uppercase tracking-widest pb-3 border-b-2 transition-all ${
            activeTab === 'promo' 
              ? 'border-gold text-gold font-bold' 
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Promotions & Abonnés
        </button>
        <button
          onClick={() => setActiveTab('homepage')}
          className={`text-xs font-semibold uppercase tracking-widest pb-3 border-b-2 transition-all ${
            activeTab === 'homepage' 
              ? 'border-gold text-gold font-bold' 
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Personnalisation d'Accueil
        </button>
      </div>

      {activeTab === 'promo' ? (
        /* Split grid layout for Coupons & Newsletter */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Coupons Panel */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6 luxury-shadow">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Ticket size={16} className="text-gold" /> Codes Promotionnels
              </h3>
              <span className="text-[10px] text-white/40 font-bold">{coupons.length} Actifs</span>
            </div>

            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.id} 
                  className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl text-xs"
                >
                  <div className="space-y-1">
                    <span className="bg-gold/15 text-gold font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {coupon.code}
                    </span>
                    <p className="text-[10px] text-white/50 mt-1">Minimum d'achat : {formatPrice(coupon.min_order_value_xof)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">-{coupon.discount_percent}%</span>
                    <span className="text-[8px] bg-success/15 text-success font-semibold px-2 py-0.5 rounded-full mt-1.5 block uppercase">ACTIF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Subscribers Panel */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6 luxury-shadow">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Mail size={16} className="text-gold" /> Abonnés Newsletter
              </h3>
              <span className="text-[10px] text-white/40 font-bold">{subscribers.length} Emails</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
              {subscribers.length === 0 ? (
                <p className="text-xs text-white/40 italic py-10 text-center">Aucun inscrit à la newsletter pour le moment.</p>
              ) : (
                subscribers.map((email, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-light text-white/70"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                      {idx + 1}
                    </div>
                    <span>{email}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        /* HOMEPAGE SETTINGS VISUAL MANAGER */
        <form onSubmit={handleSaveHomepage} className="space-y-8">
          
          {/* Section 1: Hero Carousel */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6 luxury-shadow">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <ImageIcon size={18} className="text-gold" />
              <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white">
                Diapositives du Carrousel (Hero Banner Slides)
              </h3>
            </div>

            <div className="space-y-6 divide-y divide-white/5">
              {homepageSettings?.hero_slides.map((slide, idx) => (
                <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-6' : ''}`}>
                  <h4 className="font-bold text-xs text-gold uppercase tracking-wider">
                    Slide #{idx + 1}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2">
                      <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Image URL</label>
                      <input
                        type="text"
                        required
                        value={slide.image}
                        onChange={(e) => {
                          if (homepageSettings) {
                            const updated = [...homepageSettings.hero_slides];
                            updated[idx].image = e.target.value;
                            setHomepageSettings({ ...homepageSettings, hero_slides: updated });
                          }
                        }}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Tag (FR)</label>
                      <input
                        type="text"
                        required
                        value={slide.tag}
                        onChange={(e) => {
                          if (homepageSettings) {
                            const updated = [...homepageSettings.hero_slides];
                            updated[idx].tag = e.target.value;
                            setHomepageSettings({ ...homepageSettings, hero_slides: updated });
                          }
                        }}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Titre (FR)</label>
                      <input
                        type="text"
                        required
                        value={slide.title}
                        onChange={(e) => {
                          if (homepageSettings) {
                            const updated = [...homepageSettings.hero_slides];
                            updated[idx].title = e.target.value;
                            setHomepageSettings({ ...homepageSettings, hero_slides: updated });
                          }
                        }}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Titre (EN)</label>
                      <input
                        type="text"
                        required
                        value={slide.title_en}
                        onChange={(e) => {
                          if (homepageSettings) {
                            const updated = [...homepageSettings.hero_slides];
                            updated[idx].title_en = e.target.value;
                            setHomepageSettings({ ...homepageSettings, hero_slides: updated });
                          }
                        }}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Description (FR)</label>
                      <textarea
                        required
                        value={slide.desc}
                        onChange={(e) => {
                          if (homepageSettings) {
                            const updated = [...homepageSettings.hero_slides];
                            updated[idx].desc = e.target.value;
                            setHomepageSettings({ ...homepageSettings, hero_slides: updated });
                          }
                        }}
                        rows={2}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Description (EN)</label>
                      <textarea
                        required
                        value={slide.desc_en}
                        onChange={(e) => {
                          if (homepageSettings) {
                            const updated = [...homepageSettings.hero_slides];
                            updated[idx].desc_en = e.target.value;
                            setHomepageSettings({ ...homepageSettings, hero_slides: updated });
                          }
                        }}
                        rows={2}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Before/After */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-4 luxury-shadow">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <ImageIcon size={18} className="text-gold" />
              <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white">
                Galerie Comparaison Avant / Après
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Image Avant (Before Image URL)</label>
                <input
                  type="text"
                  required
                  value={homepageSettings?.before_after.before_image || ''}
                  onChange={(e) => {
                    if (homepageSettings) {
                      setHomepageSettings({
                        ...homepageSettings,
                        before_after: {
                          ...homepageSettings.before_after,
                          before_image: e.target.value
                        }
                      });
                    }
                  }}
                  className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Image Après (After Image URL)</label>
                <input
                  type="text"
                  required
                  value={homepageSettings?.before_after.after_image || ''}
                  onChange={(e) => {
                    if (homepageSettings) {
                      setHomepageSettings({
                        ...homepageSettings,
                        before_after: {
                          ...homepageSettings.before_after,
                          after_image: e.target.value
                        }
                      });
                    }
                  }}
                  className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Instagram Grid */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-4 luxury-shadow">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <ImageIcon size={18} className="text-gold" />
              <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white">
                Inspirations Instagram (4 Images)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {homepageSettings?.instagram_images.map((url, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1">Image #{idx + 1}</label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => {
                      if (homepageSettings) {
                        const updated = [...homepageSettings.instagram_images];
                        updated[idx] = e.target.value;
                        setHomepageSettings({ ...homepageSettings, instagram_images: updated });
                      }
                    }}
                    className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-white outline-none focus:border-gold transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-lg transition shadow-lg flex items-center gap-2"
            >
              <Save size={16} /> Enregistrer la Configuration
            </button>
          </div>

        </form>
      )}

      {/* ==========================================
          ADD COUPON MODAL FORM
         ========================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="my-4 sm:my-auto bg-[#141414] border border-white/10 w-full max-w-md rounded-2xl p-4 sm:p-8 space-y-6 luxury-shadow">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif-display font-semibold text-sm text-white uppercase tracking-wider">
                Nouveau Code Promo
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition p-1 bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Code Promo (Lettres & Chiffres)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GLOW25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Pourcentage Remise (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Achat Min. (XOF)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minValue}
                    onChange={(e) => setMinValue(Number(e.target.value))}
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
                  Créer le code
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
