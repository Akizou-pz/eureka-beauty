'use client';

import React, { useState, useEffect } from 'react';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { db, BlogPost } from '@/lib/db';
import { Calendar, Clock, ChevronRight, BookOpen, Sparkles, X, MessageCircle } from 'lucide-react';

export default function BlogPage() {
  const { language } = useLangCurr();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected post to read in detail
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setPosts(db.getBlogPosts());
  }, []);

  const categories = ['All', 'Skin Care', 'Cosmetics', 'Wellness', 'Lifestyle'];

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Blog Hero Title */}
      <div className="text-center max-w-md mx-auto space-y-2">
        <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Eureka Conseils</span>
        <h1 className="font-serif-display text-3xl font-medium tracking-wider text-dark">Le Magazine Beauté</h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
        <p className="text-xs text-dark-muted font-light leading-relaxed">
          Découvrez nos conseils d'experts pour prendre soin de votre mélanine, structurer vos routines et sublimer votre éclat.
        </p>
      </div>

      {/* Category selector */}
      <div className="flex overflow-x-auto justify-center gap-2 border-b border-gold/10 pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-2 rounded-full transition whitespace-nowrap font-medium ${selectedCategory === cat ? 'bg-gold text-white font-semibold' : 'bg-white text-dark hover:bg-bg-cream border border-gold/15'}`}
          >
            {cat === 'All' ? 'Tous les articles' : cat}
          </button>
        ))}
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl overflow-hidden border border-gold/10 luxury-shadow-sm hover:luxury-shadow transition duration-300 flex flex-col justify-between h-[450px]"
          >
            <div className="h-56 overflow-hidden relative">
              <span className="absolute top-4 left-4 bg-dark text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded z-10">
                {post.category}
              </span>
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-[10px] text-dark-muted font-light">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time}</span>
                </div>
                <h3 className="font-serif-display font-semibold text-lg text-dark leading-snug line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-dark-muted font-light leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>

              <button
                onClick={() => setActivePost(post)}
                className="text-xs text-gold uppercase tracking-widest font-bold flex items-center gap-1 hover:text-gold-hover transition self-start"
              >
                <span>Lire l'article</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* ==========================================
          FULL BLOG POST DETAIL MODAL
         ========================================== */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden luxury-shadow luxury-border border-gold/20 max-h-[90vh] flex flex-col">

            {/* Modal Header bar */}
            <div className="px-6 py-4 border-b border-gold/10 flex justify-between items-center bg-bg-cream/40">
              <span className="text-[10px] bg-gold/15 text-gold font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {activePost.category}
              </span>
              <button
                onClick={() => setActivePost(null)}
                className="text-dark hover:text-gold transition p-1 bg-white rounded-full shadow"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar flex-1">
              <img
                src={activePost.image_url}
                alt={activePost.title}
                className="w-full h-64 object-cover rounded-xl luxury-border"
              />

              <div className="flex items-center gap-4 text-[10px] text-dark-muted">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(activePost.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {activePost.read_time}</span>
              </div>

              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-dark leading-tight">
                {activePost.title}
              </h2>

              <div className="w-16 h-0.5 bg-gold" />

              <div className="text-xs sm:text-sm text-dark-muted leading-relaxed font-light space-y-4">
                <p className="font-semibold text-dark text-xs sm:text-sm">{activePost.summary}</p>
                <p className="whitespace-pre-line">{activePost.content}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam volutpat purus pretium diam imperdiet dictum. Integer molestie convallis metus quis semper. Suspendisse eu mi lectus. Nam interdum facilisis urna at luctus.
                </p>
                <p className="border-l-4 border-gold pl-4 italic text-gold font-bold">
                  Sourcing local, efficacité prouvée, formule experte : l'engagement Eureka Beauty pour la santé de votre épiderme.
                </p>
                <p>
                  Donec scelerisque ante id orci lacinia, id bibendum sem dictum. Phasellus condimentum ex in sem pulvinar lobortis. Cras vel magna eleifend, sollicitudin mi vel, tincidunt eros.
                </p>
              </div>
            </div>

            {/* Modal Footer (WhatsApp Callout) */}
            <div className="px-6 py-4 border-t border-gold/10 bg-bg-cream/40 flex justify-between items-center text-xs">
              <span className="text-dark-muted flex items-center gap-1"><BookOpen size={14} className="text-gold" /> Eureka Magazine</span>
              <a
                href={`https://wa.me/22893866752?text=Bonjour%20Eureka%20Beauty%2C%20j'ai%20lu%20l'article%20"${activePost.title}"%20et%20je%20souhaite%20des%20conseils...`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                <MessageCircle size={14} /> WhatsApp Conseils
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
