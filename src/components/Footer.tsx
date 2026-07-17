'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { db } from '@/lib/db';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones
} from 'lucide-react';

export default function Footer() {
  const { language, t } = useLangCurr();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const success = db.addSubscriber(email);
    if (success) {
      setSubscribed(true);
      setEmail('');
    } else {
      alert('Cet email est déjà inscrit !');
    }
  };

  return (
    <footer className="bg-dark text-white border-t border-gold/15 pt-16 mt-auto">

      {/* 1. Trust Badges Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gold border border-gold/10 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-serif-display font-semibold text-sm tracking-wider text-white">100% Authentique</h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">Produits sourcés directement auprès des labos et distributeurs officiels.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gold border border-gold/10 flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="font-serif-display font-semibold text-sm tracking-wider text-white">Livraison Locale Rapide</h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">24h à Abidjan et Dakar, 2 à 4 jours dans toute l\'Afrique de l\'Ouest.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gold border border-gold/10 flex-shrink-0">
              <Headphones size={22} />
            </div>
            <div>
              <h4 className="font-serif-display font-semibold text-sm tracking-wider text-white">WhatsApp & Assistance</h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">Une équipe beauté dédiée pour vous conseiller au quotidien par chat.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gold border border-gold/10 flex-shrink-0">
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 className="font-serif-display font-semibold text-sm tracking-wider text-white">Paiement à la Livraison</h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">Achetez en toute sérénité, payez en espèces ou mobile money à la livraison.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* Brand Info & Newsletter */}
          <div className="space-y-6">
            <h3 className="font-serif-display text-xl font-semibold tracking-wider text-white">
              EUREKA <span className="text-gold">BEAUTY</span>
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Votre destination beauté de luxe en Afrique francophone. Révélez votre éclat naturel avec des soins de qualité, sélectionnés avec soin.
            </p>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Abonnez-vous à notre Newsletter</p>
              {subscribed ? (
                <p className="text-xs text-gold font-bold">Merci pour votre inscription ! Bienvenue dans l\'univers Eureka.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm rounded-lg overflow-hidden border border-white/10 focus-within:border-gold/60 transition">
                  <input
                    type="email"
                    required
                    placeholder="Votre e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/5 text-xs text-white px-3 py-3 outline-none"
                  />
                  <button type="submit" className="bg-gold hover:bg-gold-hover px-4 text-xs font-bold uppercase tracking-widest text-white transition">
                    OK
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Categories links */}
          <div>
            <h4 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white mb-6">Nos Catégories</h4>
            <ul className="space-y-3 text-xs text-white/60 font-light">
              <li><Link href="/shop?category=skincare" className="hover:text-gold transition">Soins Visage & Skincare</Link></li>
              <li><Link href="/shop?category=cosmetics" className="hover:text-gold transition">Maquillage & Cosmetics</Link></li>
              <li><Link href="/shop?category=wellness" className="hover:text-gold transition">Bien-être & Huiles Essentielles</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-gold transition">Accessoires de Beauté</Link></li>
            </ul>
          </div>

          {/* Corporate links */}
          <div>
            <h4 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white mb-6">Informations</h4>
            <ul className="space-y-3 text-xs text-white/60 font-light">
              <li><Link href="/track" className="hover:text-gold transition">Suivre ma commande</Link></li>
              <li><Link href="/blog" className="hover:text-gold transition">Le Blog Beauté</Link></li>
              <li><Link href="/shop" className="hover:text-gold transition">Trouver un produit</Link></li>
              <li><Link href="/dashboard" className="hover:text-gold transition">Mon compte client</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white mb-6">Service Client</h4>
            <ul className="space-y-4 text-xs text-white/60 font-light">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-gold flex-shrink-0" />
                <span>Lome,Togo</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold flex-shrink-0" />
                <span>+228 93 86 67 52 / +228 98 04 43 75</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold flex-shrink-0" />
                <span>eurekasupplytg@gmail.com</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-white text-white/60 transition" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-white text-white/60 transition" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://wa.me/22507070707" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-white text-white/60 transition" aria-label="WhatsApp Chat">
                <MessageSquare size={16} />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copy Section */}
      <div className="bg-black/40 py-6 text-center text-[10px] text-white/40 tracking-widest uppercase border-t border-white/5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Eureka Beauty. Tous droits réservés.</p>
          <div className="flex gap-4 items-center">
            <span>PAIEMENTS EXPRESS:</span>
            <div className="flex gap-2">
              <span className="bg-white/5 px-2 py-1 rounded text-[8px] border border-white/5">COD (CASH)</span>
              <span className="bg-white/5 px-2 py-1 rounded text-[8px] border border-white/5">WAVE / ORANGE MONEY</span>
              <span className="bg-white/5 px-2 py-1 rounded text-[8px] border border-white/5">STRIPE / PAYSTACK</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
