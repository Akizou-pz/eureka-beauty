'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, BlogPost } from '@/lib/db';

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

  // Header & General storefront
  freeShippingPromo: { FR: "LIVRAISON GRATUITE CENTRE VILLE | EXPEDITION POSSIBLE PARTOUT A L'INTERIEUR", EN: "FREE CITY CENTER SHIPPING | NATIONWIDE DELIVERY AVAILABLE" },
  track: { FR: 'Suivi', EN: 'Track' },
  whatsappOrders: { FR: 'WhatsApp Commandes', EN: 'WhatsApp Orders' },
  suggestions: { FR: 'Suggestions', EN: 'Suggestions' },
  noProductFound: { FR: 'Aucun produit trouvé', EN: 'No products found' },
  popularSearches: { FR: 'Recherches Populaires', EN: 'Popular Searches' },
  discountOff: { FR: '-{percent}% remise', EN: '-{percent}% off' },
  remove: { FR: 'Retirer', EN: 'Remove' },
  promoApplied: { FR: 'Code appliqué: {code} (-{percent}%)', EN: 'Promo applied: {code} (-{percent}%)' },
  totalExclShipping: { FR: 'Total (hors livraison)', EN: 'Total (excl. shipping)' },
  langCurrency: { FR: 'LANGUE & DEVISE', EN: 'LANGUAGE & CURRENCY' },

  // Catalog / Shop Page
  allCategories: { FR: 'Toutes les catégories', EN: 'All Categories' },
  allBrands: { FR: 'Toutes les marques', EN: 'All Brands' },
  skinType: { FR: 'Type de Peau', EN: 'Skin Type' },
  allSkinTypes: { FR: 'Tous les types de peau', EN: 'All Skin Types' },
  skinTypeOily: { FR: 'Peaux grasses', EN: 'Oily Skin' },
  skinTypeDry: { FR: 'Peaux sèches', EN: 'Dry Skin' },
  skinTypeSensitive: { FR: 'Peaux sensibles', EN: 'Sensitive Skin' },
  skinTypeCombination: { FR: 'Peaux mixtes', EN: 'Combination Skin' },
  skinConcern: { FR: 'Préoccupation', EN: 'Skin Concern' },
  allConcerns: { FR: 'Toutes les préoccupations', EN: 'All Concerns' },
  concernHydration: { FR: 'Hydratation', EN: 'Hydration' },
  concernAntiAging: { FR: 'Anti-Âge', EN: 'Anti-Aging' },
  concernAcne: { FR: 'Acné & Pores', EN: 'Acne & Pores' },
  concernBrightening: { FR: 'Teint Terne & Taches', EN: 'Dull Skin & Dark Spots' },
  maxPrice: { FR: 'Prix Maximum', EN: 'Max Price' },
  minRating: { FR: 'Note Minimale', EN: 'Min Rating' },
  sortBy: { FR: 'Trier:', EN: 'Sort By:' },
  sortByPopularity: { FR: 'Popularité', EN: 'Popularity' },
  sortByPriceLow: { FR: 'Prix : croissant', EN: 'Price: Low to High' },
  sortByPriceHigh: { FR: 'Prix : décroissant', EN: 'Price: High to Low' },
  sortByRating: { FR: 'Mieux notés', EN: 'Top Rated' },
  filter: { FR: 'Filtrer', EN: 'Filter' },
  clear: { FR: 'Effacer', EN: 'Clear' },
  productsFoundCount: { FR: '{count} produit(s) trouvé(s)', EN: '{count} product(s) found' },
  laBoutique: { FR: 'La Boutique Eureka', EN: 'The Eureka Shop' },
  all: { FR: 'Toutes', EN: 'All' },
  apply: { FR: 'Appliquer', EN: 'Apply' },
  noMatchingProducts: { FR: 'Aucun produit ne correspond', EN: 'No matching products' },
  adjustFiltersDesc: { FR: "Essayez d'ajuster vos filtres de recherche ou de réinitialiser la sélection pour afficher tout notre catalogue.", EN: 'Try adjusting your search filters or resetting selection to show our entire catalog.' },
  resetFilters: { FR: 'Réinitialiser les filtres', EN: 'Reset Filters' },
  
  // Product Details Extra
  video: { FR: 'Vidéo', EN: 'Video' },
  reviewsCount: { FR: '({count} avis)', EN: '({count} reviews)' },
  skinTypeLabel: { FR: 'Type de peau', EN: 'Skin type' },
  skinConcernLabel: { FR: 'Préoccupation', EN: 'Concern' },
  allSkinTypesLabel: { FR: 'Tous les types', EN: 'All skin types' },
  itemAddedAlert: { FR: '{quantity} article(s) ajouté(s) au panier !', EN: '{quantity} item(s) added to cart!' },
  singleAddedAlert: { FR: '{name} ajouté !', EN: '{name} added!' },
  buyWhatsApp: { FR: 'Acheter par WhatsApp', EN: 'Buy via WhatsApp' },
  freeCod: { FR: 'COD Gratuit', EN: 'Free COD' },
  returnDays: { FR: 'Retours 7 jours', EN: '7 Days Return' },
  bundleOffer: { FR: "Achetez ces trois articles ensemble et bénéficiez d'une remise spéciale de 10% sur le lot complet.", EN: "Buy these three items together and get a special 10% discount on the entire bundle." },
  bundleAdded: { FR: '✓ Lot Ajouté', EN: '✓ Bundle Added' },
  productDetails: { FR: 'Détails du Produit', EN: 'Product Details' },
  authenticFormula: { FR: 'Formule authentique :', EN: 'Authentic formula:' },
  ingredientsNotAvailable: { FR: 'Liste non disponible. Formulée sans parabènes, sulfates ni phtalates.', EN: 'List not available. Formulated without parabens, sulfates, or phthalates.' },
  beautyTips: { FR: "Conseils d'utilisation beauté :", EN: 'Beauty directions for use:' },
  defaultHowToUse: { FR: 'Appliquez délicatement matin et soir sur le visage propre en mouvements circulaires.', EN: 'Apply gently morning and night to clean face in circular motions.' },
  shippingCoverage: { FR: "Nous livrons dans toute l'Afrique de l'Ouest et du Centre (Côte d'Ivoire, Sénégal, Cameroun, Bénin, Togo, etc.).", EN: "We deliver all over West and Central Africa (Ivory Coast, Senegal, Cameroon, Benin, Togo, etc.)." },
  expressDeliveryInfo: { FR: 'Livraison express locale en moins de 24 heures (1000 FCFA / Gratuite).', EN: 'Local express delivery in less than 24 hours (1000 FCFA / Free).' },
  otherRegions: { FR: 'Autres Régions & Pays', EN: 'Other Regions & Countries' },
  standardDeliveryInfo: { FR: 'Livraison standard en 2 à 4 jours ouvrés (2500 FCFA - 3500 FCFA).', EN: 'Standard delivery in 2 to 4 business days (2500 FCFA - 3500 FCFA).' },
  leaveReview: { FR: 'Laisser un avis sur le produit', EN: 'Leave a Review' },
  reviewSubmittedSuccess: { FR: '✓ Merci ! Votre avis a été enregistré et publié avec succès.', EN: '✓ Thank you! Your review has been saved and published.' },
  noReviewsYet: { FR: 'Aucun avis rédigé pour le moment.', EN: 'No reviews written yet.' },
  toCompleteRoutine: { FR: 'Pour compléter votre routine', EN: 'To complete your routine' },
  recommendedProducts: { FR: 'Produits Recommandés', EN: 'Recommended Products' },
  
  // Order Tracking
  trackingTitle: { FR: 'Logistique & Suivi', EN: 'Logistics & Tracking' },
  trackingHeader: { FR: 'Suivi de Commande', EN: 'Order Tracking' },
  trackingDesc: { FR: 'Suivez l\'état de votre livraison Eureka Beauty en temps réel en saisissant vos identifiants ci-dessous.', EN: 'Track your Eureka Beauty delivery status in real time by entering your details below.' },
  orderNumberLabel: { FR: 'Numéro de Commande', EN: 'Order Number' },
  searchBtn: { FR: 'Rechercher', EN: 'Search' },
  noOrderFound: { FR: 'Aucune commande correspondante trouvée. Veuillez vérifier les informations saisies.', EN: 'No matching order found. Please check your inputs.' },
  statusConfirmed: { FR: 'Commande Confirmée', EN: 'Order Confirmed' },
  statusConfirmedDesc: { FR: 'Votre commande a bien été reçue par notre équipe.', EN: 'Your order was successfully received by our team.' },
  statusPacked: { FR: 'Préparation et Emballage', EN: 'Packing & Preparing' },
  statusPackedDesc: { FR: 'Vos produits sont soigneusement emballés dans nos coffrets de luxe.', EN: 'Your products are carefully packed in our luxury gift sets.' },
  statusShipped: { FR: 'Expédiée', EN: 'Shipped' },
  statusShippedDesc: { FR: 'Le colis a été remis à notre transporteur partenaire.', EN: 'The package was handed to our shipping partner.' },
  statusOutForDelivery: { FR: 'En cours de livraison', EN: 'Out for Delivery' },
  statusOutForDeliveryDesc: { FR: 'Le livreur est en route vers votre domicile.', EN: 'The delivery agent is on the way to your address.' },
  statusDelivered: { FR: 'Livrée avec Succès', EN: 'Delivered Successfully' },
  statusDeliveredDesc: { FR: 'Le colis vous a été remis en mains propres.', EN: 'The package has been delivered to you in person.' },
  missingTrackFields: { FR: 'Veuillez renseigner le numéro de commande et votre numéro de téléphone.', EN: 'Please enter both the order number and your phone number.' },
  purchaseDate: { FR: "Date d'achat", EN: 'Purchase Date' },
  estimatedDelivery: { FR: 'Livraison Estimée', EN: 'Estimated Delivery' },
  orderCancelledMsg: { FR: 'Commande Annulée (Veuillez contacter le service client par WhatsApp pour plus de détails).', EN: 'Order Cancelled (Please contact customer service via WhatsApp for details).' },
  orderedItems: { FR: 'Articles Commandés', EN: 'Ordered Items' },
  shippingQuestion: { FR: "Une question concernant l'expédition de votre colis ? Contactez notre logistique.", EN: 'Any questions regarding the shipping of your package? Contact our logistics support.' },
  whatsappAssistance: { FR: 'WhatsApp Assistance', EN: 'WhatsApp Assistance' },
  searching: { FR: 'Recherche en cours...', EN: 'Searching...' },
  trackBtn: { FR: 'Suivre le colis', EN: 'Track package' },
};

interface LanguageCurrencyContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  formatPrice: (amountInXof: number) => string;
  translateProduct: (product: Product) => Product;
  translateBlogPost: (post: BlogPost) => BlogPost;
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

const productTranslations: Record<string, Record<string, Partial<Product>>> = {
  '00000000-0000-0000-0000-000000000101': {
    FR: {
      name: "Sérum Visage Shea Glow",
      description: "Un sérum luxueux à absorption rapide qui combine l'extrait de karité biologique avec la niacinamide et l'acide hyaluronique pour hydrater intensément, apaiser et corriger l'hyperpigmentation. Parfait pour sceller l'hydratation sous les climats chauds.",
      ingredients: "Eau, extrait de beurre de karité biologique, niacinamide (5%), acide hyaluronique, extrait d'aloe vera, centella asiatica, vitamine E, phénoxyéthanol.",
      how_to_use: "Appliquez 3 à 4 gouttes sur le visage et le cou propres et humides matin et soir. Poursuivez avec une crème hydratante et une protection solaire.",
      benefits: "Réduit les taches brunes, procure une hydratation en profondeur, répare la barrière cutanée et laisse un éclat magnifique et non gras."
    }
  },
  '00000000-0000-0000-0000-000000000102': {
    FR: {
      name: "Huile Visage Baobab Radiance",
      description: "Huile de graines de baobab pure et pressée à froid, infusée de vitamine C et de jojoba. Gorgée d'antioxydants, elle combat le vieillissement, stimule l'élasticité et redonne un éclat sain aux peaux ternes ou fatiguées.",
      ingredients: "Huile de graines d'Adansonia Digitata (baobab) pressée à froid 100% pure, ascorbate de tétrahexyldécyle (vitamine C), huile de graines de Simmondsia Chinensis (jojoba), parfum naturel.",
      how_to_use: "Réchauffez 2 à 3 gouttes entre vos paumes et pressez délicatement sur votre visage comme dernière étape de votre routine nocturne.",
      benefits: "Stimule la production de collagène, atténue les ridules et offre une puissante défense antioxydante contre la pollution quotidienne."
    }
  },
  '00000000-0000-0000-0000-000000000103': {
    FR: {
      name: "Fond de Teint Pro Filt'r Soft Matte",
      description: "Le fond de teint primé qui brise les frontières. Donne à la peau un fini mat instantané, lisse, sans pores et sans brillance, avec une couvrance moyenne à totale, formulé pour résister à la chaleur et à l'humidité.",
      ingredients: "Eau, diméthicone, talc, peg-10 diméthicone, triméthylsiloxysilicate, polypropylène, isododécane, cétyl peg/ppg-10/1 diméthicone, nylon-12.",
      how_to_use: "Assurez-vous d'hydrater la peau avant d'appliquer le fond de teint. Agitez toujours avant l'emploi pour activer. Prélevez 1 à 2 pressions et estompez au pinceau ou à l'éponge.",
      benefits: "La technologie s'adaptant au climat résiste à la transpiration, 50 teintes inclusives, formule sans huile qui n'obstrue pas les pores."
    }
  },
  '00000000-0000-0000-0000-000000000104': {
    FR: {
      name: "Tonique Affinant à l'Hibiscus",
      description: "Un tonique exfoliant sans alcool contenant des AHA naturels de pétales d'hibiscus et de l'acide salicylique (BHA). Élimine en douceur les cellules mortes, resserre les pores et unifie le teint sans irritation.",
      ingredients: "Eau, extrait de fleur d'Hibiscus Sabdariffa, glycérine, acide salicylique (0,5%), hamamélis, panthénol, allantoïne.",
      how_to_use: "Imbibez un coton et passez-le délicatement sur le visage et le cou propres, en évitant le contour des yeux. Utilisez 3 à 4 fois par semaine le soir.",
      benefits: "Libère les pores obstrués, réduit les imperfections d'acné, affine le grain de peau et illumine les zones ternes."
    }
  },
  '00000000-0000-0000-0000-000000000105': {
    FR: {
      name: "Rouge à Lèvres de Luxe Rouge Dior",
      description: "Le rouge à lèvres emblématique de Dior qui offre 16 heures de confort et une couleur éclatante, disponible dans des finis satinés, mats, métallisés et velours hautement pigmentés.",
      ingredients: "Triisostéarate de polyglycéryle-2, polyisobutène hydrogéné, cire synthétique, beurre de karité, extrait d'hibiscus rouge, extrait de fleur de grenade.",
      how_to_use: "Appliquez directement sur les lèvres, en partant du centre et en étirant vers l'extérieur. Pour une précision maximale, dessinez d'abord le contour des lèvres.",
      benefits: "Couleur intense, hydratation profonde des lèvres, enrichi de soin floral, fini de qualité supérieure longue tenue."
    }
  },
  '00000000-0000-0000-0000-000000000106': {
    FR: {
      name: "Soufflé Corporel au Beurre de Cacao",
      description: "Un beurre corporel fouetté et léger à base de beurre de cacao biologique, d'huile de coco et d'huile d'argan. Il fond instantanément sur la peau pour offrir une hydratation profonde pendant 48 heures et un doux parfum de cacao.",
      ingredients: "Beurre de cacao biologique, huile de coco, beurre de karité fouetté, huile d'argan, huile d'amande douce, extrait naturel de vanille.",
      how_to_use: "Massez généreusement sur la peau propre tous les jours, en insistant sur les zones sèches comme les coudes, les genoux et les talons.",
      benefits: "Améliore l'élasticité de la peau, aide à atténuer les vergetures, adoucit la peau sèche et laisse une odeur absolument divine."
    }
  },
  '00000000-0000-0000-0000-000000000107': {
    FR: {
      name: "Masque de Sommeil en Soie Satinée",
      description: "Un masque de sommeil en soie de qualité supérieure, hypoallergénique. Conçu pour protéger la peau délicate du contour de vos yeux des frottements, retenir l'humidité et prévenir les ridules pendant votre sommeil.",
      ingredients: "Tissu 100% soie satinée hypoallergénique de haute qualité, bande de confort élastique.",
      how_to_use: "Glissez sur vos yeux avant de dormir. Laver à la main avec un savon doux et sécher à plat.",
      benefits: "Bloque complètement la lumière, prévient les rides de sommeil, maintient l'absorption de la crème contour des yeux et évite les frottements des cils."
    }
  }
};

const blogPostTranslations: Record<string, Record<string, Partial<BlogPost>>> = {
  'blog-1': {
    FR: {
      title: "5 Secrets de Soins pour une Peau Africaine Éclatante",
      summary: "Découvrez le pouvoir des plantes naturelles et des routines simples pour une peau éclatante.",
      content: "L'utilisation de beurre de karité biologique et d'huiles de baobab récoltées localement est essentielle pour retenir l'hydratation sous les climats tropicaux chauds. Appliquez toujours de la crème solaire, même sur les peaux foncées, pour vous protéger contre l'hyperpigmentation et les dommages causés par les rayons ultraviolets."
    }
  },
  'blog-2': {
    FR: {
      title: "Comment Assortir son Fond de Teint aux Peaux Mélanines Riches",
      summary: "Un guide complet pour identifier vos sous-tons et trouver votre teinte idéale.",
      content: "Trouver la teinte de fond de teint parfaite peut être un défi. Nous décrivons les différences entre les sous-tons chauds, froids et neutres, en montrant comment des marques de premier plan comme Fenty Beauty proposent de magnifiques options non ternes pour les peaux foncées et dorées."
    }
  }
};

export const LanguageCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('FR');
  const [currency, setCurrency] = useState<Currency>('XOF');

  const translateProduct = (product: Product): Product => {
    if (language === 'EN') return product;
    const trans = productTranslations[product.id];
    if (!trans || !trans['FR']) return product;
    return {
      ...product,
      name: trans['FR'].name || product.name,
      description: trans['FR'].description || product.description,
      ingredients: trans['FR'].ingredients || product.ingredients,
      how_to_use: trans['FR'].how_to_use || product.how_to_use,
      benefits: trans['FR'].benefits || product.benefits
    };
  };

  const translateBlogPost = (post: BlogPost): BlogPost => {
    if (language === 'EN') return post;
    const trans = blogPostTranslations[post.id];
    if (!trans || !trans['FR']) return post;
    return {
      ...post,
      title: trans['FR'].title || post.title,
      summary: trans['FR'].summary || post.summary,
      content: trans['FR'].content || post.content
    };
  };

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
        translateProduct,
        translateBlogPost,
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
