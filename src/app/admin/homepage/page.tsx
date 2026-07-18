'use client';

import React, { useState, useEffect } from 'react';
import { db, HomepageSettings } from '@/lib/db';
import { Image as ImageIcon, Save } from 'lucide-react';

export default function AdminHomepageConfigPage() {
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setHomepageSettings(db.getHomepageSettings());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

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
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Personnalisation d'Accueil</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Personnaliser les visuels, les textes du carrousel, les images Avant/Après et la galerie Instagram.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

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

    </div>
  );
}
