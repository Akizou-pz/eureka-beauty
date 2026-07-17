'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'FR' | 'EN';
export type Currency = 'XOF' | 'XAF' | 'USD' | 'EUR';

interface TranslationDict {
  [key: string]: {
    FR: string;
    EN: string;
  };
}

const translations: TranslationDict = {
  // Navigation
  home: { FR: 'Accueil', EN: 'Home' },
  shop: { FR: 'Boutique', EN: 'Shop' },
  blog: { FR: 'Conseils', EN: 'Blog' },
  trackOrder: { FR: 'Suivi de commande', EN: 'Track Order' },
  admin: { FR: 'Admin', EN: 'Admin' },
  searchPlaceholder: { FR: 'Rechercher un produit, une marque, un ingrédient...', EN: 'Search products, brands, ingredients...' },
  
  // Shopping & Cart
  addToCart: { FR: 'Ajouter au panier', EN: 'Add to Cart' },
  buyNow: { FR: 'Acheter maintenant', EN: 'Buy Now' },
  wishlist: { FR: 'Liste d\'envies', EN: 'Wishlist' },
  cart: { FR: 'Panier', EN: 'Cart' },
  checkout: { FR: 'Commander', EN: 'Checkout' },
  outOfStock: { FR: 'Rupture de stock', EN: 'Out of stock' },
  inStock: { FR: 'En stock', EN: 'In stock' },
  onlyLeft: { FR: 'Plus que {count} articles en stock', EN: 'Only {count} items left in stock' },
  quantity: { FR: 'Quantité', EN: 'Quantity' },
  subtotal: { FR: 'Sous-total', EN: 'Subtotal' },
  shipping: { FR: 'Livraison', EN: 'Shipping' },
  discount: { FR: 'Remise', EN: 'Discount' },
  total: { FR: 'Total', EN: 'Total' },
  applyCoupon: { FR: 'Appliquer', EN: 'Apply' },
  couponPlaceholder: { FR: 'Code promo', EN: 'Promo code' },
  emptyCart: { FR: 'Votre panier est vide', EN: 'Your cart is empty' },
  continueShopping: { FR: 'Continuer vos achats', EN: 'Continue Shopping' },
  frequentlyBought: { FR: 'Fréquemment achetés ensemble', EN: 'Frequently bought together' },
  addBundle: { FR: 'Ajouter le lot au panier', EN: 'Add bundle to cart' },

  // Product Page Tabs
  ingredients: { FR: 'Ingrédients', EN: 'Ingredients' },
  howToUse: { FR: 'Conseils d\'utilisation', EN: 'How to Use' },
  benefits: { FR: 'Bénéfices', EN: 'Benefits' },
  reviews: { FR: 'Avis Clients', EN: 'Reviews' },
  shippingDelivery: { FR: 'Livraison & Retours', EN: 'Shipping & Delivery' },

  // Checkout Form
  billingDetails: { FR: 'Informations de livraison', EN: 'Shipping Details' },
  firstName: { FR: 'Prénom', EN: 'First Name' },
  lastName: { FR: 'Nom', EN: 'Last Name' },
  phone: { FR: 'Téléphone', EN: 'Phone' },
  whatsapp: { FR: 'Numéro WhatsApp (pour le suivi)', EN: 'WhatsApp Number (for updates)' },
  email: { FR: 'E-mail', EN: 'Email' },
  country: { FR: 'Pays', EN: 'Country' },
  city: { FR: 'Ville', EN: 'City' },
  address: { FR: 'Adresse complète', EN: 'Full Address' },
  deliveryNotes: { FR: 'Instructions pour le livreur (ex: étage, point de repère)', EN: 'Delivery notes (e.g. floor, landmark)' },
  paymentMethod: { FR: 'Moyen de paiement', EN: 'Payment Method' },
  cod: { FR: 'Paiement à la livraison (COD) - Par défaut', EN: 'Cash on Delivery (COD) - Default' },
  mobileMoney: { FR: 'Mobile Money (Wave, Orange, MTN, Moov)', EN: 'Mobile Money (Wave, Orange, MTN, Moov)' },
  card: { FR: 'Carte Bancaire (Stripe, Paystack, Flutterwave)', EN: 'Credit Card (Stripe, Paystack, Flutterwave)' },
  placeOrder: { FR: 'Confirmer ma commande', EN: 'Place Order' },

  // Customer Panel & Reviews
  loyaltyPoints: { FR: 'Points de fidélité', EN: 'Loyalty Points' },
  verifiedBuyer: { FR: 'Acheteur vérifié', EN: 'Verified Buyer' },
  writeReview: { FR: 'Rédiger un avis', EN: 'Write a Review' },
  reviewName: { FR: 'Votre nom', EN: 'Your Name' },
  reviewComment: { FR: 'Votre commentaire', EN: 'Your Comment' },
  reviewRating: { FR: 'Note', EN: 'Rating' },
  submitReview: { FR: 'Soumettre l\'avis', EN: 'Submit Review' },
  
  // Footer & trust
  guaranteeTitle: { FR: '100% Authentique', EN: '100% Authentic' },
  guaranteeDesc: { FR: 'Tous nos cosmétiques proviennent directement des marques officielles.', EN: 'All cosmetics sourced directly from official brands.' },
  supportTitle: { FR: 'Service Client 7j/7', EN: 'Customer Service 7d/7' },
  supportDesc: { FR: 'Conseils beauté personnalisés et commandes par WhatsApp.', EN: 'Personalized beauty advice and orders via WhatsApp.' },
  codTitle: { FR: 'Paiement Sécurisé', EN: 'Secure Payment' },
  codDesc: { FR: 'Payez en espèces à la livraison ou par Mobile Money.', EN: 'Pay cash on delivery or via Mobile Money.' },
};

interface LanguageCurrencyContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  formatPrice: (amountInXof: number) => string;
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextType | undefined>(undefined);

// Conversion rates relative to XOF (Base)
const CONVERSION_RATES = {
  XOF: 1,
  XAF: 1, // pegged 1:1
  USD: 1 / 600, // 1 USD = 600 XOF
  EUR: 1 / 655.95, // 1 EUR = 655.95 XOF
};

const CURRENCY_SYMBOLS = {
  XOF: 'FCFA',
  XAF: 'FCFA',
  USD: '$',
  EUR: '€',
};

export const LanguageCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('FR');
  const [currency, setCurrency] = useState<Currency>('XOF');

  // Automatically detect user language/currency from country timezone on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('eb_lang') as Language;
      const savedCurr = localStorage.getItem('eb_curr') as Currency;
      if (savedLang) setLanguage(savedLang);
      if (savedCurr) setCurrency(savedCurr);

      // Guess currency based on timezone
      if (!savedCurr) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz.includes('Europe')) {
            setCurrency('EUR');
          } else if (tz.includes('Central') || tz.includes('Douala') || tz.includes('Brazzaville') || tz.includes('Libreville')) {
            setCurrency('XAF');
          } else if (tz.includes('Abidjan') || tz.includes('Dakar') || tz.includes('Lome') || tz.includes('Cotonou')) {
            setCurrency('XOF');
          } else {
            setCurrency('USD');
          }
        } catch {
          // Fallback to XOF
        }
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('eb_lang', lang);
  };

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('eb_curr', curr);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const textObj = translations[key];
    if (!textObj) return key;
    let val = textObj[language] || textObj['FR'] || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };

  const formatPrice = (amountInXof: number): string => {
    const converted = amountInXof * CONVERSION_RATES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];

    if (currency === 'XOF' || currency === 'XAF') {
      // Format 15000 -> "15 000 FCFA"
      return new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
      }).format(converted) + ' ' + symbol;
    } else if (currency === 'EUR') {
      // Format 23 -> "23,00 €"
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(converted);
    } else {
      // USD format 25 -> "$25.00"
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(converted);
    }
  };

  return (
    <LanguageCurrencyContext.Provider
      value={{
        language,
        currency,
        setLanguage: handleSetLanguage,
        setCurrency: handleSetCurrency,
        t,
        formatPrice,
      }}
    >
      {children}
    </LanguageCurrencyContext.Provider>
  );
};

export const useLangCurr = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) throw new Error('useLangCurr must be used within LanguageCurrencyProvider');
  return context;
};
