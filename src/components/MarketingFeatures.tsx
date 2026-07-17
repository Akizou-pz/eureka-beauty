'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { X, MessageCircle, Gift, Sparkles, Send } from 'lucide-react';
import { db } from '@/lib/db';

export default function MarketingFeatures() {
  const pathname = usePathname();
  const { applyCouponCode } = useCart();

  // Exit intent popup state
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentDismissed, setExitIntentDismissed] = useState(false);

  // Time-delayed newsletter popup
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState(false);

  // 1. Exit Intent Detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load local storage states to avoid repeating popups
    const exitDismissed = localStorage.getItem('eb_exit_dismissed') === 'true';
    setExitIntentDismissed(exitDismissed);

    const newsDismissed = localStorage.getItem('eb_news_dismissed') === 'true';

    // Show news popup on homepage after 8 seconds if not dismissed
    if (pathname === '/' && !newsDismissed) {
      const timer = setTimeout(() => {
        setShowNewsPopup(true);
      }, 8000);
      return () => clearTimeout(timer);
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // clientY < 10 represents moving mouse to top address bar
      if (e.clientY < 10 && !showExitIntent && !exitIntentDismissed) {
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [pathname, showExitIntent, exitIntentDismissed]);

  const dismissExitIntent = () => {
    setShowExitIntent(false);
    setExitIntentDismissed(true);
    localStorage.setItem('eb_exit_dismissed', 'true');
  };

  const claimExitPromo = async () => {
    await applyCouponCode('EUREKAGLOW');
    alert('Code EUREKAGLOW (-15%) copié et appliqué à votre panier !');
    dismissExitIntent();
  };

  const dismissNewsPopup = () => {
    setShowNewsPopup(false);
    localStorage.setItem('eb_news_dismissed', 'true');
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    const added = db.addSubscriber(newsEmail);
    if (added) {
      setNewsSuccess(true);
      setTimeout(() => {
        dismissNewsPopup();
      }, 2000);
    } else {
      alert('Cet e-mail est déjà abonné.');
    }
  };

  return (
    <>
      {/* A. FLOATING WHATSAPP BUTTON (Optimized for African Customer Support) */}
      <a
        href="https://wa.me/22893866752?text=Bonjour%20Eureka%20Beauty%2C%20je%20souhaite%20avoir%20des%20conseils%20sur..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition duration-300 flex items-center gap-2 group"
        aria-label="Commander par WhatsApp"
      >
        <MessageCircle size={24} className="animate-bounce" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-bold text-xs uppercase tracking-wider whitespace-nowrap">
          Assistance WhatsApp
        </span>
      </a>

      {/* B. EXIT INTENT POPUP (CRO - 15% discount offer) */}
      {showExitIntent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-md w-full bg-white rounded-2xl luxury-shadow overflow-hidden text-center luxury-border p-8 border-gold/30">
            <button
              onClick={dismissExitIntent}
              className="absolute top-4 right-4 text-dark-muted hover:text-gold transition p-1"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-6">
              <Gift size={32} />
            </div>

            <h3 className="font-serif-display text-2xl font-semibold tracking-wider text-dark mb-2">
              Attendez ! Ne partez pas...
            </h3>
            <p className="text-xs text-dark-muted leading-relaxed mb-6 px-4">
              Révélez votre éclat avec notre offre spéciale. Bénéficiez de <strong>15% de réduction immédiate</strong> sur votre premier achat.
            </p>

            <div className="bg-bg-cream border border-dashed border-gold rounded-lg py-4 mb-6">
              <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Code Promo</span>
              <p className="text-xl font-bold tracking-widest text-dark mt-1">EUREKAGLOW</p>
            </div>

            <button
              onClick={claimExitPromo}
              className="w-full bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-lg transition shadow-md hover:shadow-lg"
            >
              Appliquer la réduction
            </button>

            <button
              onClick={dismissExitIntent}
              className="text-xs text-dark-muted underline mt-4 hover:text-dark transition block mx-auto"
            >
              Non merci, je préfère payer plein tarif
            </button>
          </div>
        </div>
      )}

      {/* C. TIME-DELAYED NEWSLETTER POPUP (CRO - Lead Capture) */}
      {showNewsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full bg-white rounded-2xl luxury-shadow overflow-hidden flex flex-col md:flex-row luxury-border border-gold/20">
            <button
              onClick={dismissNewsPopup}
              className="absolute top-4 right-4 text-dark-muted hover:text-gold transition p-1 z-10 bg-white/80 rounded-full"
            >
              <X size={20} />
            </button>

            {/* Left Image Column */}
            <div className="w-full md:w-1/2 h-48 md:h-auto relative">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80"
                alt="Glowing Skin Care"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent md:hidden" />
            </div>

            {/* Right Form Column */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center text-center md:text-left bg-bg-cream/40">
              <div className="flex items-center gap-1 justify-center md:justify-start text-gold font-semibold uppercase tracking-wider text-[10px] mb-2">
                <Sparkles size={12} />
                <span>Offre de bienvenue</span>
              </div>

              <h3 className="font-serif-display text-xl font-semibold tracking-wider text-dark mb-2">
                Rejoignez le Club Eureka
              </h3>
              <p className="text-[11px] text-dark-muted leading-relaxed mb-6">
                Inscrivez-vous pour recevoir nos secrets de routine mélanine et profitez de <strong>10% offerts</strong> sur votre commande.
              </p>

              {newsSuccess ? (
                <div className="text-center py-4 bg-success/10 rounded-lg text-success text-xs font-semibold">
                  Bienvenue ! Code de 10% envoyé.
                </div>
              ) : (
                <form onSubmit={handleNewsSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Votre adresse email"
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    className="w-full text-xs bg-white rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                  />
                  <button
                    type="submit"
                    className="w-full bg-dark hover:bg-gold text-white hover:text-white rounded-lg py-2.5 transition text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
                  >
                    <span>S\'inscrire</span>
                    <Send size={12} />
                  </button>
                </form>
              )}

              <button
                onClick={dismissNewsPopup}
                className="text-[10px] text-dark-muted underline mt-4 hover:text-dark transition block text-center md:text-left"
              >
                Passer cette offre
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
