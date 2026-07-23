// EUREKA BEAUTY - LOCAL MOCK DATABASE SYSTEM WITH SUPABASE SYNC
import { supabase } from './supabaseClient';

const HAS_SUPABASE_CREDS = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  benefits: string;
  price_xof: number;
  price_usd: number;
  discount_percent: number;
  sku: string;
  stock: number;
  skin_type: string; // Oily, Dry, Sensitive, Combination, All
  skin_concern: string; // Acne, Anti-Aging, Hydration, Brightening, General
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  images: string[];
  video_url?: string;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  country: string;
  city: string;
  zone_name: string;
  cost_xof: number;
  shipping_type: string; // Standard, Express, Pickup
  min_days: number;
  max_days: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  min_order_value_xof: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  loyalty_points: number;
  role: 'customer' | 'admin' | 'delivery';
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price_xof: number;
  total_price_xof: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  city: string;
  address_line: string;
  delivery_instructions: string;
  shipping_cost_xof: number;
  subtotal_xof: number;
  discount_xof: number;
  total_xof: number;
  currency: string;
  payment_method: string;
  payment_status: 'Pending' | 'Paid' | 'Cancelled' | 'Refunded';
  order_status: 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  estimated_delivery: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  cancel_reason?: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified_buyer: boolean;
  helpful_votes: number;
  created_at: string;
}

export interface ShippingCountry {
  id: string;
  country_name: string;
  currency: string;
  custom_shipping_cost: number;
  free_shipping_cities: string[];}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar_url: string;
}

// -----------------------------------------------------------------------------
// SEED INITIAL DATA
// -----------------------------------------------------------------------------

const seedCategories: Category[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Skincare',
    slug: 'skincare',
    description: 'Luxurious treatments for clean, glowing skin.',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Cosmetics',
    slug: 'cosmetics',
    description: 'Rich palettes and finishes tailored to enhance African skin tones.',
    image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Wellness',
    slug: 'wellness',
    description: 'Nourishing oils, supplements and body treatments.',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Premium beauty applicators and luxury storage items.',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
  },
];

const seedBrands: Brand[] = [
  {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Eureka Lab',
    slug: 'eureka-lab',
    description: 'In-house luxury formulations powered by African botanicals.',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Fenty Beauty',
    slug: 'fenty-beauty',
    description: 'Premium inclusive cosmetics for all skin shades.',
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Dior Beauty',
    slug: 'dior-beauty',
    description: 'High-end French cosmetics and luxury treatments.',
  },
  {
    id: '00000000-0000-0000-0000-000000000014',
    name: 'Aura Wellness',
    slug: 'aura-wellness',
    description: 'Holistic beauty from the inside out.',
  },
];

const seedProducts: Product[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    category_id: '00000000-0000-0000-0000-000000000001',
    brand_id: '00000000-0000-0000-0000-000000000011',
    name: 'Shea Glow Face Serum',
    slug: 'shea-glow-face-serum',
    description: 'A luxurious, fast-absorbing serum that combines organic Shea extract with Niacinamide and Hyaluronic Acid to intensely hydrate, soothe, and correct hyperpigmentation. Perfect for locking in moisture in warm climates.',
    ingredients: 'Water, Organic Shea Butter extract, Niacinamide (5%), Hyaluronic Acid, Aloe Vera Extract, Centella Asiatica, Vitamin E, Phenoxyethanol.',
    how_to_use: 'Apply 3-4 drops to clean, damp face and neck morning and night. Follow with moisturizer and sun protection.',
    benefits: 'Reduces dark spots, provides deep hydration, repairs skin barrier, and leaves a gorgeous non-greasy glow.',
    price_xof: 15000,
    price_usd: 25,
    discount_percent: 10,
    sku: 'EB-SK-SHG-01',
    stock: 45,
    skin_type: 'All',
    skin_concern: 'Hydration',
    rating: 4.8,
    review_count: 24,
    is_featured: true,
    is_flash_sale: false,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    category_id: '00000000-0000-0000-0000-000000000001',
    brand_id: '00000000-0000-0000-0000-000000000011',
    name: 'Baobab Radiance Face Oil',
    slug: 'baobab-radiance-face-oil',
    description: 'Pure, cold-pressed Baobab seed oil infused with Vitamin C and Jojoba. Packed with antioxidants, it combats aging, boosts elasticity, and restores a healthy, radiant bounce to dull or tired skin.',
    ingredients: '100% Pure Cold-Pressed Adansonia Digitata (Baobab) Seed Oil, Tetrahexyldecyl Ascorbate (Vitamin C), Simmondsia Chinensis (Jojoba) Seed Oil, Natural Fragrance.',
    how_to_use: 'Warm 2-3 drops between your palms and gently press onto your face as the final step of your nighttime routine.',
    benefits: 'Boosts collagen production, minimizes fine lines, and offers powerful antioxidant defense against daily pollution.',
    price_xof: 18000,
    price_usd: 30,
    discount_percent: 0,
    sku: 'EB-SK-BBO-02',
    stock: 20,
    skin_type: 'Dry',
    skin_concern: 'Anti-Aging',
    rating: 4.9,
    review_count: 18,
    is_featured: true,
    is_flash_sale: true,
    images: [
      'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    category_id: '00000000-0000-0000-0000-000000000002',
    brand_id: '00000000-0000-0000-0000-000000000012',
    name: 'Pro Filt\'r Soft Matte Foundation',
    slug: 'pro-filtr-soft-matte-foundation',
    description: 'The award-winning boundary-breaking foundation. Gives skin an instantly smooth, pore-diffused, shine-free finish that easily builds to medium to full coverage, tailored to withstand heat and humidity.',
    ingredients: 'Water, Dimethicone, Talc, Peg-10 Dimethicone, Trimethylsiloxysilicate, Polypropylene, Isododecane, Cetyl Peg/Ppg-10/1 Dimethicone, Nylon-12.',
    how_to_use: 'Be sure to moisturize skin before foundation application. Always shake before use to activate. Pump 1-2 drops and blend with brush or sponge.',
    benefits: 'Climate-adaptive technology resists sweat, 50 inclusive shades, oil-free matte formula does not clog pores.',
    price_xof: 28000,
    price_usd: 47,
    discount_percent: 0,
    sku: 'EB-CO-FTF-03',
    stock: 30,
    skin_type: 'Oily',
    skin_concern: 'General',
    rating: 4.7,
    review_count: 42,
    is_featured: true,
    is_flash_sale: false,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    category_id: '00000000-0000-0000-0000-000000000001',
    brand_id: '00000000-0000-0000-0000-000000000014',
    name: 'Hibiscus Refining Toner',
    slug: 'hibiscus-refining-toner',
    description: 'An alcohol-free exfoliating toner containing natural AHA from Hibiscus petals and Salicylic Acid (BHA). Gently dissolves dead skin cells, tightens pores, and evens out skin tone without irritation.',
    ingredients: 'Water, Hibiscus Sabdariffa Flower Extract, Glycerin, Salicylic Acid (0.5%), Witch Hazel, Panthenol, Allantoin.',
    how_to_use: 'Saturate a cotton pad and sweep gently over clean face and neck, avoiding the eye area. Use 3-4 times a week at night.',
    benefits: 'Clears clogged pores, reduces acne breakouts, refines skin texture, and brightens dull areas.',
    price_xof: 12000,
    price_usd: 20,
    discount_percent: 15,
    sku: 'EB-SK-HBT-04',
    stock: 50,
    skin_type: 'Combination',
    skin_concern: 'Acne',
    rating: 4.6,
    review_count: 15,
    is_featured: false,
    is_flash_sale: false,
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    category_id: '00000000-0000-0000-0000-000000000002',
    brand_id: '00000000-0000-0000-0000-000000000013',
    name: 'Rouge Dior Luxury Lipstick',
    slug: 'rouge-dior-luxury-lipstick',
    description: 'The iconic Dior lipstick that offers 16 hours of comfort and radiant color, available in highly pigmented satin, matte, metallic, and velvet finishes.',
    ingredients: 'Polyglyceryl-2 Triisostearate, Hydrogenated Polyisobutene, Synthetic Wax, Shea Butter, Red Hibiscus extract, Pomegranate flower extract.',
    how_to_use: 'Apply directly from the bullet to the lips, starting from the center and blending outwards. For maximum precision, line lips first.',
    benefits: 'High color payoff, intense lip hydration, enriched with floral care, long-wearing premium finish.',
    price_xof: 32000,
    price_usd: 54,
    discount_percent: 5,
    sku: 'EB-CO-DRL-05',
    stock: 15,
    skin_type: 'All',
    skin_concern: 'General',
    rating: 4.9,
    review_count: 31,
    is_featured: true,
    is_flash_sale: false,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000106',
    category_id: '00000000-0000-0000-0000-000000000003',
    brand_id: '00000000-0000-0000-0000-000000000014',
    name: 'Cocoa Butter Body Soufflé',
    slug: 'cocoa-butter-body-souffle',
    description: 'A whipped, feather-light body butter made with organic cocoa butter, coconut oil, and argan oil. It melts instantly into the skin to provide 48-hour deep hydration and a sweet cocoa aroma.',
    ingredients: 'Organic Cocoa Butter, Coconut Oil, Whipped Shea Butter, Argan Oil, Sweet Almond Oil, Natural Vanilla Extract.',
    how_to_use: 'Massage generously onto clean skin daily, focusing on dry areas like elbows, knees, and heels.',
    benefits: 'Improves skin elasticity, helps fade stretch marks, softens dry skin, and smells absolutely heavenly.',
    price_xof: 14500,
    price_usd: 24,
    discount_percent: 0,
    sku: 'EB-WL-CBS-06',
    stock: 25,
    skin_type: 'Dry',
    skin_concern: 'Hydration',
    rating: 4.8,
    review_count: 14,
    is_featured: false,
    is_flash_sale: true,
    images: [
      'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000107',
    category_id: '00000000-0000-0000-0000-000000000004',
    brand_id: '00000000-0000-0000-0000-000000000011',
    name: 'Satin Silk Eye Mask',
    slug: 'satin-silk-eye-mask',
    description: 'A premium, hypoallergenic satin silk sleeping mask. Designed to protect the delicate skin around your eyes from friction, retaining moisture and preventing fine lines while you sleep.',
    ingredients: '100% High-grade Hypoallergenic Satin Silk fabric, Elastic comfort band.',
    how_to_use: 'Slip over your eyes before sleep. Hand wash with mild soap and dry flat.',
    benefits: 'Blocks out light completely, prevents sleep wrinkles, maintains eye cream absorption, and avoids eyelash friction.',
    price_xof: 8000,
    price_usd: 13,
    discount_percent: 0,
    sku: 'EB-AC-SEM-07',
    stock: 60,
    skin_type: 'All',
    skin_concern: 'Anti-Aging',
    rating: 4.5,
    review_count: 9,
    is_featured: false,
    is_flash_sale: false,
    images: [
      'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=600',
    ],
    created_at: new Date().toISOString(),
  },
];

const seedDeliveryZones: DeliveryZone[] = [
  { id: 'zone-ci-abidjan-1', country: 'Côte d\'Ivoire', city: 'Abidjan', zone_name: 'Zone 1 (Cocody, Plateau, Marcory)', cost_xof: 1500, shipping_type: 'Standard', min_days: 1, max_days: 2 },
  { id: 'zone-ci-abidjan-2', country: 'Côte d\'Ivoire', city: 'Abidjan', zone_name: 'Zone 2 (Yopougon, Abobo, Adjame)', cost_xof: 2500, shipping_type: 'Standard', min_days: 1, max_days: 3 },
  { id: 'zone-ci-yakro', country: 'Côte d\'Ivoire', city: 'Yamoussoukro', zone_name: 'Central Yamoussoukro', cost_xof: 3500, shipping_type: 'Standard', min_days: 2, max_days: 4 },
  { id: 'zone-sn-dakar-1', country: 'Senegal', city: 'Dakar', zone_name: 'Dakar Center (Almadies, Plateau)', cost_xof: 2000, shipping_type: 'Standard', min_days: 1, max_days: 2 },
  { id: 'zone-sn-dakar-2', country: 'Senegal', city: 'Dakar', zone_name: 'Dakar Suburbs', cost_xof: 3000, shipping_type: 'Standard', min_days: 2, max_days: 3 },
  { id: 'zone-cm-douala', country: 'Cameroon', city: 'Douala', zone_name: 'Douala Center', cost_xof: 2500, shipping_type: 'Standard', min_days: 2, max_days: 4 },
  { id: 'zone-bj-cotonou', country: 'Benin', city: 'Cotonou', zone_name: 'Cotonou Town', cost_xof: 2000, shipping_type: 'Standard', min_days: 2, max_days: 3 },
  { id: 'zone-tg-lome', country: 'Togo', city: 'Lomé', zone_name: 'Lomé Center', cost_xof: 1500, shipping_type: 'Standard', min_days: 2, max_days: 3 },
];

const seedShippingCountries: ShippingCountry[] = [
  { id: 'ship-ci', country_name: "Côte d'Ivoire", currency: "XOF", custom_shipping_cost: 3000, free_shipping_cities: ["Abidjan", "Yamoussoukro"] },
  { id: 'ship-sn', country_name: "Senegal", currency: "XOF", custom_shipping_cost: 3500, free_shipping_cities: ["Dakar"] },
  { id: 'ship-bj', country_name: "Benin", currency: "XOF", custom_shipping_cost: 2500, free_shipping_cities: ["Cotonou"] },
  { id: 'ship-tg', country_name: "Togo", currency: "XOF", custom_shipping_cost: 2000, free_shipping_cities: ["Lomé"] },
  { id: 'ship-cm', country_name: "Cameroon", currency: "XAF", custom_shipping_cost: 4000, free_shipping_cities: ["Douala", "Yaoundé"] },
  { id: 'ship-ml', country_name: "Mali", currency: "XOF", custom_shipping_cost: 3500, free_shipping_cities: ["Bamako"] },
  { id: 'ship-bf', country_name: "Burkina Faso", currency: "XOF", custom_shipping_cost: 3500, free_shipping_cities: ["Ouagadougou"] }
];

const seedCoupons: Coupon[] = [
  { id: 'cp-glow', code: 'EUREKAGLOW', discount_percent: 15, min_order_value_xof: 10000, is_active: true },
  { id: 'cp-welcome', code: 'WELCOME10', discount_percent: 10, min_order_value_xof: 0, is_active: true },
  { id: 'cp-luxe', code: 'LUXE20', discount_percent: 20, min_order_value_xof: 25000, is_active: true },
];

const seedTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Fatou Diallo',
    role: 'Dakar, Senegal',
    rating: 5,
    comment: 'Eureka Beauty has completely changed my skincare routine. The Shea Glow Serum is pure magic for my hyperpigmentation!',
    avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
  },
  {
    id: 'test-2',
    name: 'Amina Koné',
    role: 'Abidjan, Côte d\'Ivoire',
    rating: 5,
    comment: 'Authentic products and lightning fast delivery in Abidjan. I ordered using Cash on Delivery and it arrived within 24 hours.',
    avatar_url: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150',
  },
  {
    id: 'test-3',
    name: 'Koffi Mensah',
    role: 'Lomé, Togo',
    rating: 5,
    comment: 'Superb customer service on WhatsApp. They recommended the perfect skincare routine for my dry skin.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

const seedBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: '5 Skincare Secrets for Glowing African Skin',
    slug: '5-skincare-secrets-glowing-african-skin',
    summary: 'Discover the power of natural botanicals and simple routines for radiant skin.',
    content: 'Sourcing locally-harvested organic Shea Butter and Baobab oils is key to locking in moisture under hot tropical climates. Always apply sunscreen, even on dark skin tones, to protect against hyperpigmentation and ultraviolet damage.',
    category: 'Skin Care',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    read_time: '4 min read',
    created_at: new Date().toISOString(),
  },
  {
    id: 'blog-2',
    title: 'How to Match Foundation for Rich Melanin Tones',
    slug: 'how-to-match-foundation-rich-melanin-tones',
    summary: 'A comprehensive guide to identifying your undertones and finding your true match.',
    content: 'Finding the perfect foundation shade can be challenging. We break down the differences between warm, cool, and neutral undertones, showcasing how premium brands like Fenty Beauty offer beautiful, non-ashy options for dark and golden skin.',
    category: 'Cosmetics',
    image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600',
    read_time: '6 min read',
    created_at: new Date().toISOString(),
  },
];

const seedReviews: Review[] = [
  { id: '00000000-0000-0000-0000-000000000901', product_id: '00000000-0000-0000-0000-000000000101', customer_name: 'Khady Diop', rating: 5, comment: 'C\'est magnifique! Mes taches sombres disparaissent après deux semaines.', is_verified_buyer: true, helpful_votes: 12, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000902', product_id: '00000000-0000-0000-0000-000000000101', customer_name: 'Marie N\'goran', rating: 4, comment: 'Très hydratant et agréable sur le visage. Je recommande.', is_verified_buyer: true, helpful_votes: 5, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000903', product_id: '00000000-0000-0000-0000-000000000102', customer_name: 'Fanta Touré', rating: 5, comment: 'L\'huile de Baobab est incroyable, elle redonne vie à ma peau sèche.', is_verified_buyer: true, helpful_votes: 8, created_at: new Date().toISOString() },
];

// -----------------------------------------------------------------------------
// STORAGE MANAGER & METHODS
// -----------------------------------------------------------------------------

class MockDB {
  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // Clear out outdated mock data from browser localStorage if it contains old text-based IDs (prod-)
      const oldProducts = localStorage.getItem('eb_products');
      if (oldProducts && oldProducts.includes('"id":"prod-')) {
        localStorage.removeItem('eb_categories');
        localStorage.removeItem('eb_brands');
        localStorage.removeItem('eb_products');
        localStorage.removeItem('eb_reviews');
        localStorage.removeItem('eb_delivery_zones');
        localStorage.removeItem('eb_coupons');
        localStorage.removeItem('eb_testimonials');
        localStorage.removeItem('eb_blog_posts');
        localStorage.removeItem('eb_orders');
        localStorage.removeItem('eb_subscribers');
        localStorage.removeItem('eb_wishlist');
        localStorage.removeItem('eb_shipping_countries');
      }

      if (!localStorage.getItem('eb_categories')) this.set('eb_categories', seedCategories);
      if (!localStorage.getItem('eb_brands')) this.set('eb_brands', seedBrands);
      if (!localStorage.getItem('eb_products')) this.set('eb_products', seedProducts);
      if (!localStorage.getItem('eb_delivery_zones')) this.set('eb_delivery_zones', seedDeliveryZones);
      if (!localStorage.getItem('eb_coupons')) this.set('eb_coupons', seedCoupons);
      if (!localStorage.getItem('eb_testimonials')) this.set('eb_testimonials', seedTestimonials);
      if (!localStorage.getItem('eb_blog_posts')) this.set('eb_blog_posts', seedBlogPosts);
      if (!localStorage.getItem('eb_reviews')) this.set('eb_reviews', seedReviews);
      if (!localStorage.getItem('eb_orders')) this.set('eb_orders', []);
      if (!localStorage.getItem('eb_subscribers')) this.set('eb_subscribers', []);
      if (!localStorage.getItem('eb_wishlist')) this.set('eb_wishlist', []);
      if (!localStorage.getItem('eb_shipping_countries')) this.set('eb_shipping_countries', seedShippingCountries);

      this.syncFromSupabase();
    }
  }

  async syncFromSupabase() {
    if (!HAS_SUPABASE_CREDS) {
      console.log('🔌 Database Engine: Running in offline mock database mode (Supabase credentials missing).');
      return;
    }
    try {
      console.log('⚡ Database Engine: Connecting and syncing with live Supabase database...');
      
      const loadAllData = async () => {
        const { data: categories } = await supabase.from('categories').select('*');
        if (categories && categories.length > 0) this.set('eb_categories', categories);

        const { data: brands } = await supabase.from('brands').select('*');
        if (brands && brands.length > 0) this.set('eb_brands', brands);

        const { data: products } = await supabase.from('products').select('*');
        if (products && products.length > 0) this.set('eb_products', products);

        const { data: coupons } = await supabase.from('coupons').select('*');
        if (coupons && coupons.length > 0) this.set('eb_coupons', coupons);

        const { data: testimonials } = await supabase.from('testimonials').select('*');
        if (testimonials && testimonials.length > 0) this.set('eb_testimonials', testimonials);

        const { data: blogPosts } = await supabase.from('blog_posts').select('*');
        if (blogPosts && blogPosts.length > 0) this.set('eb_blog_posts', blogPosts);

        const { data: shippingCountries } = await supabase.from('shipping_countries').select('*');
        if (shippingCountries && shippingCountries.length > 0) this.set('eb_shipping_countries', shippingCountries);

        const { data: reviews } = await supabase.from('reviews').select('*');
        if (reviews && reviews.length > 0) this.set('eb_reviews', reviews);

        try {
          const { data: homeSettings } = await supabase.from('homepage_settings').select('*');
          if (homeSettings && homeSettings.length > 0 && homeSettings[0].settings) {
            this.set('eb_homepage_settings', homeSettings[0].settings);
          }
        } catch (e) {
          console.warn('Could not sync homepage settings:', e);
        }

        const { data: customers } = await supabase.from('customers').select('*');
        if (customers && customers.length > 0) {
          const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
          customers.forEach((c: any) => {
            registered[c.email] = {
              id: c.id,
              first_name: c.first_name,
              last_name: c.last_name,
              email: c.email,
              phone: c.phone || '',
              whatsapp: c.whatsapp || '',
              loyalty_points: c.loyalty_points || 0,
              role: c.role || 'customer',
              password: registered[c.email]?.password || 'password123'
            };
          });
          localStorage.setItem('eb_users_db', JSON.stringify(registered));
        }

        const { data: rawOrders } = await supabase.from('orders').select('*');
        if (rawOrders) {
          const { data: rawItems } = await supabase.from('order_items').select('*');
          const fullOrders = rawOrders.map((ord: any) => {
            const matchedItems = rawItems ? rawItems.filter((i: any) => i.order_id === ord.id) : [];
            return {
              ...ord,
              items: (ord.items && Array.isArray(ord.items) && ord.items.length > 0) ? ord.items : matchedItems,
            };
          });
          this.set('eb_orders', fullOrders);
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
        }
      };

      await loadAllData();

      // Subscribe to real-time changes on orders
      supabase
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          async (payload) => {
            console.log('🔔 Realtime Update received for orders:', payload);
            const { data: rawOrders } = await supabase.from('orders').select('*');
            if (rawOrders) {
              const { data: rawItems } = await supabase.from('order_items').select('*');
              const fullOrders = rawOrders.map((ord: any) => {
                const matchedItems = rawItems ? rawItems.filter((i: any) => i.order_id === ord.id) : [];
                return {
                  ...ord,
                  items: (ord.items && Array.isArray(ord.items) && ord.items.length > 0) ? ord.items : matchedItems,
                };
              });
              this.set('eb_orders', fullOrders);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
              }
            }
          }
        )
        .subscribe();

      // Subscribe to real-time changes on customers
      supabase
        .channel('public:customers')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customers' },
          async () => {
            console.log('🔔 Realtime Update received for customers');
            const { data: customers } = await supabase.from('customers').select('*');
            if (customers && customers.length > 0) {
              const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
              customers.forEach((c: any) => {
                registered[c.email] = {
                  id: c.id,
                  first_name: c.first_name,
                  last_name: c.last_name,
                  email: c.email,
                  phone: c.phone || '',
                  whatsapp: c.whatsapp || '',
                  loyalty_points: c.loyalty_points || 0,
                  role: c.role || 'customer',
                  password: registered[c.email]?.password || 'password123'
                };
              });
              localStorage.setItem('eb_users_db', JSON.stringify(registered));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
              }
            }
          }
        )
        .subscribe();

      // Subscribe to real-time changes on homepage_settings
      supabase
        .channel('public:homepage_settings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'homepage_settings' },
          async (payload: any) => {
            console.log('🔔 Realtime Update received for homepage settings:', payload);
            if (payload.new && payload.new.settings) {
              this.set('eb_homepage_settings', payload.new.settings);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
              }
            }
          }
        )
        .subscribe();

    } catch (err) {
      console.error('Supabase background read sync error:', err);
    }
  }

  // Categories
  getCategories(): Category[] {
    return this.get<Category[]>('eb_categories', seedCategories);
  }

  // Brands
  getBrands(): Brand[] {
    return this.get<Brand[]>('eb_brands', seedBrands);
  }

  createBrand(brand: Omit<Brand, 'id' | 'created_at'>): Brand {
    const brands = this.getBrands();
    const newBrand: Brand = {
      ...brand,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    brands.push(newBrand);
    this.set('eb_brands', brands);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('brands').insert([newBrand]).then(({ error }) => {
        if (error) console.error('Supabase brand insert error:', error);
      });
    }

    return newBrand;
  }

  // Products
  getProducts(): Product[] {
    return this.get<Product[]>('eb_products', seedProducts);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  }

  createProduct(product: Omit<Product, 'id' | 'created_at' | 'rating' | 'review_count'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: generateUUID(),
      rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };
    products.push(newProduct);
    this.set('eb_products', products);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('products').insert([newProduct]).then(({ error }) => {
        if (error) console.error('Supabase product insert error:', error);
      });
    }

    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    products[idx] = { ...products[idx], ...updates };
    this.set('eb_products', products);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('products').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase product update error:', error);
      });
    }

    return products[idx];
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    this.set('eb_products', filtered);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('products').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase product delete error:', error);
      });
    }

    return true;
  }

  // Coupons
  getCoupons(): Coupon[] {
    return this.get<Coupon[]>('eb_coupons', seedCoupons);
  }

  getCouponByCode(code: string): Coupon | undefined {
    return this.getCoupons().find((c) => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
  }

  createCoupon(coupon: Omit<Coupon, 'id'>): Coupon {
    const coupons = this.getCoupons();
    const newCoupon: Coupon = {
      ...coupon,
      id: generateUUID(),
    };
    coupons.push(newCoupon);
    this.set('eb_coupons', coupons);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('coupons').insert([newCoupon]).then(({ error }) => {
        if (error) console.error('Supabase coupon insert error:', error);
      });
    }

    return newCoupon;
  }

  updateCoupon(coupon: Coupon): Coupon {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex((c) => c.id === coupon.id);
    if (idx !== -1) {
      coupons[idx] = coupon;
      this.set('eb_coupons', coupons);

      if (HAS_SUPABASE_CREDS) {
        supabase.from('coupons').update(coupon).eq('id', coupon.id).then(({ error }) => {
          if (error) console.error('Supabase coupon update error:', error);
        });
      }
    }
    return coupon;
  }

  deleteCoupon(id: string): void {
    const coupons = this.getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    this.set('eb_coupons', filtered);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('coupons').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase coupon delete error:', error);
      });
    }
  }

  // Delivery Zones
  getDeliveryZones(): DeliveryZone[] {
    return this.get<DeliveryZone[]>('eb_delivery_zones', seedDeliveryZones);
  }

  getCustomShippingCost(countryName: string): number {
    const countries = this.getShippingCountries();
    const found = countries.find(c => c.country_name.toLowerCase() === countryName.toLowerCase());
    return found ? found.custom_shipping_cost : 2500;
  }

  // Shipping Countries CRUD
  getShippingCountries(): ShippingCountry[] {
    return this.get<ShippingCountry[]>('eb_shipping_countries', seedShippingCountries);
  }

  createShippingCountry(data: Omit<ShippingCountry, 'id'>): ShippingCountry {
    const countries = this.getShippingCountries();
    const newCountry: ShippingCountry = {
      ...data,
      id: generateUUID(),
    };
    countries.push(newCountry);
    this.set('eb_shipping_countries', countries);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('shipping_countries').insert([newCountry]).then(({ error }) => {
        if (error) console.error('Supabase shipping country insert error:', error);
      });
    }

    return newCountry;
  }

  updateShippingCountry(id: string, updates: Partial<ShippingCountry>): ShippingCountry {
    const countries = this.getShippingCountries();
    const idx = countries.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Country not found');
    countries[idx] = { ...countries[idx], ...updates };
    this.set('eb_shipping_countries', countries);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('shipping_countries').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase shipping country update error:', error);
      });
    }

    return countries[idx];
  }

  deleteShippingCountry(id: string): boolean {
    const countries = this.getShippingCountries();
    const filtered = countries.filter((c) => c.id !== id);
    if (filtered.length === countries.length) return false;
    this.set('eb_shipping_countries', filtered);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('shipping_countries').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase shipping country delete error:', error);
      });
    }

    return true;
  }

  // Testimonials
  getTestimonials(): Testimonial[] {
    return this.get<Testimonial[]>('eb_testimonials', seedTestimonials);
  }

  // Blog Posts
  getBlogPosts(): BlogPost[] {
    return this.get<BlogPost[]>('eb_blog_posts', seedBlogPosts);
  }

  createBlogPost(post: Omit<BlogPost, 'id' | 'created_at'>): BlogPost {
    const posts = this.getBlogPosts();
    const newPost: BlogPost = {
      ...post,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    posts.push(newPost);
    this.set('eb_blog_posts', posts);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('blog_posts').insert([newPost]).then(({ error }) => {
        if (error) console.error('Supabase blog post insert error:', error);
      });
    }

    return newPost;
  }

  updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost {
    const posts = this.getBlogPosts();
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Blog post not found');
    posts[idx] = { ...posts[idx], ...updates };
    this.set('eb_blog_posts', posts);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('blog_posts').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase blog post update error:', error);
      });
    }

    return posts[idx];
  }

  deleteBlogPost(id: string): boolean {
    const posts = this.getBlogPosts();
    const filtered = posts.filter((p) => p.id !== id);
    if (filtered.length === posts.length) return false;
    this.set('eb_blog_posts', filtered);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('blog_posts').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase blog post delete error:', error);
      });
    }

    return true;
  }

  // Reviews
  getReviews(productId?: string): Review[] {
    const reviews = this.get<Review[]>('eb_reviews', seedReviews);
    if (productId) {
      return reviews.filter((r) => r.product_id === productId);
    }
    return reviews;
  }

  addReview(productId: string, name: string, rating: number, comment: string): Review {
    const reviews = this.get<Review[]>('eb_reviews', seedReviews);
    const newReview: Review = {
      id: generateUUID(),
      product_id: productId,
      customer_name: name,
      rating,
      comment,
      is_verified_buyer: true,
      helpful_votes: 0,
      created_at: new Date().toISOString(),
    };
    reviews.push(newReview);
    this.set('eb_reviews', reviews);

    // Update Product average rating and count
    const prodReviews = reviews.filter((r) => r.product_id === productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    this.updateProduct(productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      review_count: prodReviews.length,
    });

    if (HAS_SUPABASE_CREDS) {
      supabase.from('reviews').insert([newReview]).then(({ error }) => {
        if (error) console.error('Supabase review insert error:', error);
      });
    }

    return newReview;
  }

  // Orders
  getOrders(): Order[] {
    return this.get<Order[]>('eb_orders', []);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  }

  getOrderByNumberAndPhone(orderNumber: string, phone: string): Order | undefined {
    const formattedPhone = phone.replace(/\s+/g, '');
    return this.getOrders().find(
      (o) =>
        o.order_number.toUpperCase() === orderNumber.toUpperCase() &&
        o.phone.replace(/\s+/g, '').endsWith(formattedPhone.slice(-8))
    );
  }

  createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'order_status' | 'payment_status' | 'estimated_delivery'>): Order {
    const orders = this.getOrders();
    
    // Generate order number like EB-2026-XXXX
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `EB-${new Date().getFullYear()}-${rand}`;

    // Estimated delivery date (3 days from now)
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    const newOrder: Order = {
      ...orderData,
      id: generateUUID(),
      order_number: orderNumber,
      order_status: 'Confirmed',
      payment_status: (orderData.payment_method === 'COD' || orderData.payment_method === 'WhatsApp') ? 'Pending' : 'Paid',
      estimated_delivery: estDate.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    orders.push(newOrder);
    this.set('eb_orders', orders);

    // Adjust product inventory
    newOrder.items.forEach((item) => {
      const prod = this.getProductById(item.product_id);
      if (prod) {
        this.updateProduct(prod.id, { stock: Math.max(0, prod.stock - item.quantity) });
      }
    });

    if (HAS_SUPABASE_CREDS) {
      const { items, ...orderFields } = newOrder;
      supabase.from('orders').insert([orderFields]).then(({ error }) => {
        if (error) {
          console.error('Supabase order insert error:', error);
        } else {
          const orderItemsToInsert = items.map(item => ({
            id: item.id,
            order_id: newOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            sku: item.sku,
            quantity: item.quantity,
            unit_price_xof: item.unit_price_xof,
            total_price_xof: item.total_price_xof
          }));
          supabase.from('order_items').insert(orderItemsToInsert).then(({ error: itemsErr }) => {
            if (itemsErr) console.error('Supabase order items insert error:', itemsErr);
          });
        }
      });
    }

    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['order_status'], paymentStatus?: Order['payment_status'], cancelReason?: string): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    
    orders[idx].order_status = status;
    
    if (paymentStatus !== undefined) {
      orders[idx].payment_status = paymentStatus;
    } else {
      if (status === 'Delivered') {
        orders[idx].payment_status = 'Paid';
      } else if (status === 'Cancelled') {
        orders[idx].payment_status = 'Cancelled';
        if (cancelReason) {
          orders[idx].cancel_reason = cancelReason;
        }
      } else {
        // Reset to Pending ONLY if it was not already manually confirmed as Paid or Refunded
        if (orders[idx].payment_status !== 'Paid' && orders[idx].payment_status !== 'Refunded') {
          if (orders[idx].payment_method === 'COD' || orders[idx].payment_method === 'WhatsApp') {
            orders[idx].payment_status = 'Pending';
          }
        }
      }
    }
    
    orders[idx].updated_at = new Date().toISOString();
    this.set('eb_orders', orders);

    if (HAS_SUPABASE_CREDS) {
      const updates: any = { order_status: status };
      if (paymentStatus !== undefined) {
        updates.payment_status = paymentStatus;
      } else {
        if (status === 'Delivered') {
          updates.payment_status = 'Paid';
        } else if (status === 'Cancelled') {
          updates.payment_status = 'Cancelled';
          if (cancelReason) updates.cancel_reason = cancelReason;
        } else {
          if (orders[idx].payment_status !== 'Paid' && orders[idx].payment_status !== 'Refunded') {
            if (orders[idx].payment_method === 'COD' || orders[idx].payment_method === 'WhatsApp') {
              updates.payment_status = 'Pending';
            }
          }
        }
      }
      supabase.from('orders').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase order update status error:', error);
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
    }

    return orders[idx];
  }

  // Wishlist
  getWishlist(customerId: string): string[] {
    const wishlists = this.get<Array<{ customerId: string; productIds: string[] }>>('eb_wishlist', []);
    const found = wishlists.find((w) => w.customerId === customerId);
    return found ? found.productIds : [];
  }

  toggleWishlist(customerId: string, productId: string): boolean {
    const wishlists = this.get<Array<{ customerId: string; productIds: string[] }>>('eb_wishlist', []);
    const idx = wishlists.findIndex((w) => w.customerId === customerId);
    
    let added = false;
    if (idx === -1) {
      wishlists.push({ customerId, productIds: [productId] });
      added = true;
    } else {
      const pIdx = wishlists[idx].productIds.indexOf(productId);
      if (pIdx === -1) {
        wishlists[idx].productIds.push(productId);
        added = true;
      } else {
        wishlists[idx].productIds.splice(pIdx, 1);
      }
    }
    
    this.set('eb_wishlist', wishlists);
    return added;
  }

  // Newsletter Subscribers
  getSubscribers(): string[] {
    return this.get<string[]>('eb_subscribers', []);
  }

  addSubscriber(email: string): boolean {
    const subs = this.getSubscribers();
    if (subs.includes(email.toLowerCase())) return false;
    subs.push(email.toLowerCase());
    this.set('eb_subscribers', subs);

    if (HAS_SUPABASE_CREDS) {
      supabase.from('newsletter_subscribers').insert([{ email: email.toLowerCase() }]).then(({ error }) => {
        if (error) console.error('Supabase subscriber insert error:', error);
      });
    }

    return true;
  }

  // Analytics Metrics (Mock data aggregate)
  getAnalytics() {
    const orders = this.getOrders();
    // Revenue calculated only from delivered and paid orders
    const deliveredAndPaidOrders = orders.filter((o) => o.order_status === 'Delivered' && o.payment_status === 'Paid');
    
    const totalSales = deliveredAndPaidOrders.reduce((sum, o) => sum + o.total_xof, 0);
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter((o) => o.order_status === 'Confirmed').length;
    const deliveredOrders = orders.filter((o) => o.order_status === 'Delivered').length;
    const pendingOrders = orders.filter((o) => o.order_status !== 'Delivered' && o.order_status !== 'Cancelled').length;
    const completedOrders = deliveredOrders;
    
    // Growth metrics (mock static base + dynamic orders)
    const baseVisitors = 3840;
    const visitors = baseVisitors + orders.length * 15;
    const conversionRate = visitors > 0 ? parseFloat(((totalOrders / visitors) * 100).toFixed(2)) : 0;

    // Chart Sales Over Time (Last 7 Days) - only delivered and paid
    const salesOverTime = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const dayOrders = orders.filter((o) => o.created_at.startsWith(dateStr) && o.order_status === 'Delivered' && o.payment_status === 'Paid');
      const revenue = dayOrders.reduce((sum, o) => sum + o.total_xof, 0);
      
      return {
        date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue,
        orders: dayOrders.length,
      };
    });

    return {
      totalSales,
      totalOrders,
      confirmedOrders,
      deliveredOrders,
      pendingOrders,
      completedOrders,
      visitors,
      conversionRate,
      salesOverTime,
    };
  }

  getHomepageSettings(): HomepageSettings {
    const defaultSettings: HomepageSettings = {
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

    return this.get<HomepageSettings>('eb_homepage_settings', defaultSettings);
  }

  updateHomepageSettings(settings: HomepageSettings): HomepageSettings {
    this.set('eb_homepage_settings', settings);
    
    if (HAS_SUPABASE_CREDS) {
      supabase.from('homepage_settings').upsert({ id: 'default', settings })
        .then(({ error }) => {
          if (error) console.error('Failed to sync homepage settings to Supabase:', error);
        });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
    }
    return settings;
  }

  async fetchUsersFromSupabase(): Promise<Customer[]> {
    if (HAS_SUPABASE_CREDS) {
      const { data: customers, error } = await supabase.from('customers').select('*');
      if (!error && customers && customers.length > 0) {
        if (typeof window !== 'undefined') {
          const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
          customers.forEach((c: any) => {
            registered[c.email] = {
              id: c.id,
              first_name: c.first_name,
              last_name: c.last_name,
              email: c.email,
              phone: c.phone || '',
              whatsapp: c.whatsapp || '',
              loyalty_points: c.loyalty_points || 0,
              role: c.role || 'customer',
              password: registered[c.email]?.password || 'password123'
            };
          });
          localStorage.setItem('eb_users_db', JSON.stringify(registered));
        }
      }
    }
    return this.getUsers();
  }

  getUsers(): Customer[] {
    let staticUsers: Customer[] = [
      {
        id: 'cust-admin-001',
        first_name: 'Directrice',
        last_name: 'Eureka',
        email: 'admin@eurekabeauty.com',
        phone: '+228 93866752',
        whatsapp: '+228 93866752',
        loyalty_points: 9999,
        role: 'admin'
      },
      {
        id: 'cust-customer-001',
        first_name: 'Fatou',
        last_name: 'Diallo',
        email: 'customer@eurekabeauty.com',
        phone: '+221 77 123 45 67',
        whatsapp: '+221 77 123 45 67',
        loyalty_points: 150,
        role: 'customer'
      }
    ];
    
    if (typeof window !== 'undefined') {
      const deletedStatic = JSON.parse(localStorage.getItem('eb_deleted_static_users') || '[]');
      staticUsers = staticUsers.filter(u => !deletedStatic.includes(u.id));

      const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
      const registeredList = Object.keys(registered).map(email => ({
        id: registered[email].id,
        first_name: registered[email].first_name,
        last_name: registered[email].last_name,
        email: email,
        phone: registered[email].phone || '',
        whatsapp: registered[email].whatsapp || '',
        loyalty_points: registered[email].loyalty_points || 0,
        role: registered[email].role || 'customer'
      }));

      const registeredIds = new Set(registeredList.map(u => u.id));
      staticUsers = staticUsers.filter(u => !registeredIds.has(u.id));

      return [...staticUsers, ...registeredList];
    }
    return staticUsers;
  }

  addUser(userData: Partial<Customer> & { password?: string }): Customer {
    const newId = `user-${Date.now()}`;
    const newUser: Customer = {
      id: newId,
      first_name: userData.first_name || 'Utilisateur',
      last_name: userData.last_name || '',
      email: userData.email || `user_${Date.now()}@eureka.com`,
      phone: userData.phone || '',
      whatsapp: userData.whatsapp || userData.phone || '',
      loyalty_points: Number(userData.loyalty_points || 0),
      role: userData.role || 'customer',
    };

    if (typeof window !== 'undefined') {
      const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
      registered[newUser.email] = {
        ...newUser,
        password: userData.password || 'password123',
      };
      localStorage.setItem('eb_users_db', JSON.stringify(registered));
    }

    if (HAS_SUPABASE_CREDS) {
      supabase.from('customers').insert([{
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        whatsapp: newUser.whatsapp,
        loyalty_points: newUser.loyalty_points,
        role: newUser.role
      }]).then(({ error }) => {
        if (error) console.error('Supabase addUser error:', error);
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
    }

    return newUser;
  }

  updateUser(userId: string, data: Partial<Customer>): Customer | null {
    let updatedUser: Customer | null = null;

    if (typeof window !== 'undefined') {
      const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
      const email = Object.keys(registered).find(k => registered[k].id === userId);
      
      if (email) {
        registered[email] = {
          ...registered[email],
          ...data
        };
        if (data.email && data.email !== email) {
          const oldData = registered[email];
          delete registered[email];
          registered[data.email] = oldData;
        }
        localStorage.setItem('eb_users_db', JSON.stringify(registered));
        updatedUser = registered[data.email || email];
      } else {
        const staticUsers = [
          {
            id: 'cust-admin-001',
            first_name: 'Directrice',
            last_name: 'Eureka',
            email: 'admin@eurekabeauty.com',
            phone: '+228 93866752',
            whatsapp: '+228 93866752',
            loyalty_points: 9999,
            role: 'admin' as const
          },
          {
            id: 'cust-customer-001',
            first_name: 'Fatou',
            last_name: 'Diallo',
            email: 'customer@eurekabeauty.com',
            phone: '+221 77 123 45 67',
            whatsapp: '+221 77 123 45 67',
            loyalty_points: 150,
            role: 'customer' as const
          }
        ];
        const staticUser = staticUsers.find(u => u.id === userId);
        if (staticUser) {
          const merged = { ...staticUser, ...data, password: 'admin123' };
          registered[merged.email] = merged;
          localStorage.setItem('eb_users_db', JSON.stringify(registered));
          updatedUser = merged;
        }
      }
    }

    if (HAS_SUPABASE_CREDS) {
      supabase.from('customers').update(data).eq('id', userId).then(({ error }) => {
        if (error) console.error('Supabase updateUser error:', error);
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
    }

    return updatedUser;
  }

  deleteUser(userId: string): boolean {
    if (typeof window !== 'undefined') {
      const registered = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
      const email = Object.keys(registered).find(k => registered[k].id === userId);
      if (email) {
        delete registered[email];
        localStorage.setItem('eb_users_db', JSON.stringify(registered));
      } else {
        const deletedStatic = JSON.parse(localStorage.getItem('eb_deleted_static_users') || '[]');
        deletedStatic.push(userId);
        localStorage.setItem('eb_deleted_static_users', JSON.stringify(deletedStatic));
      }
    }

    if (HAS_SUPABASE_CREDS) {
      supabase.from('customers').delete().eq('id', userId).then(({ error }) => {
        if (error) console.error('Supabase deleteUser error:', error);
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase_sync_complete'));
    }

    return true;
  }

  updateUserRole(userId: string, role: 'customer' | 'admin' | 'delivery') {
    this.updateUser(userId, { role });
  }
}

export interface HomepageSettings {
  hero_slides: {
    image: string;
    tag: string;
    tag_en: string;
    title: string;
    title_en: string;
    desc: string;
    desc_en: string;
  }[];
  before_after: {
    before_image: string;
    after_image: string;
  };
  instagram_images: string[];
}

export const db = new MockDB();
