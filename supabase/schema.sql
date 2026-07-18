-- Drop existing tables and triggers to avoid duplicate errors (reverse dependency order)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS shipping_countries CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BRANDS TABLE
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    ingredients TEXT,
    how_to_use TEXT,
    benefits TEXT,
    price_xof DECIMAL(12, 2) NOT NULL, -- Base price in West African CFA Franc
    price_usd DECIMAL(12, 2) NOT NULL, -- USD fallback
    discount_percent INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    stock INT DEFAULT 0,
    skin_type VARCHAR(100) DEFAULT 'All', -- Oily, Dry, Sensitive, Combination, All
    skin_concern VARCHAR(100) DEFAULT 'General', -- Acne, Anti-Aging, Hydration, Brightening, General
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    images TEXT[] NOT NULL, -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DELIVERY ZONES TABLE
CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    cost_xof DECIMAL(12, 2) NOT NULL,
    shipping_type VARCHAR(50) DEFAULT 'Standard', -- Standard, Express, Pickup
    min_days INT DEFAULT 2,
    max_days INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. COUPONS TABLE
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent INT NOT NULL,
    min_order_value_xof DECIMAL(12, 2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CUSTOMERS TABLE (Extends Supabase Auth)
CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    loyalty_points INT DEFAULT 0,
    role VARCHAR(50) DEFAULT 'customer'
);

-- Create trigger function to automatically copy new auth users to customers (supports Google, Facebook & Email metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.customers (id, first_name, last_name, email, phone, loyalty_points, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1), 'Client'),
    coalesce(new.raw_user_meta_data->>'last_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 2), 'Eureka'),
    new.email,
    coalesce(new.phone, ''),
    50, -- 50 loyalty points signup bonus
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on every auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ADDRESSES TABLE
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address_line TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address_line TEXT NOT NULL,
    delivery_instructions TEXT,
    shipping_cost_xof DECIMAL(12, 2) NOT NULL,
    subtotal_xof DECIMAL(12, 2) NOT NULL,
    discount_xof DECIMAL(12, 2) DEFAULT 0,
    total_xof DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XOF',
    payment_method VARCHAR(50) NOT NULL, -- COD, Flutterwave, Paystack, Stripe, Mobile Money
    payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid, Failed, Refunded
    order_status VARCHAR(50) DEFAULT 'Confirmed', -- Confirmed, Packed, Shipped, Out for Delivery, Delivered, Cancelled
    estimated_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price_xof DECIMAL(12, 2) NOT NULL,
    total_price_xof DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. REVIEWS TABLE
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_buyer BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. WISHLISTS TABLE
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, product_id)
);

-- 12. BLOG POSTS TABLE
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Skin Care, Hair Care, Wellness, Lifestyle
    image_url TEXT,
    read_time VARCHAR(50) DEFAULT '5 min read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. TESTIMONIALS TABLE
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    rating INT DEFAULT 5,
    comment TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. STOCK MOVEMENTS TABLE
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- IN (Supplier Restock), OUT (Order Fulfilled), ADJUSTMENT (Manual Audit)
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. SHIPPING COUNTRIES TABLE
CREATE TABLE IF NOT EXISTS shipping_countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_name VARCHAR(100) UNIQUE NOT NULL,
    currency VARCHAR(10) NOT NULL,
    custom_shipping_cost DECIMAL(12, 2) NOT NULL,
    free_shipping_cities TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Supabase)
-- ==========================================

-- Enable RLS on core tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_countries ENABLE ROW LEVEL SECURITY;

-- Public/Anonymous Read & Write policies (allows client-side storefront and admin panel to interact directly)
CREATE POLICY "Public All Access Categories" ON categories FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Brands" ON brands FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Products" ON products FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Delivery Zones" ON delivery_zones FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Reviews" ON reviews FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Blog Posts" ON blog_posts FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Testimonials" ON testimonials FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Orders" ON orders FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Order Items" ON order_items FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Coupons" ON coupons FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Customers" ON customers FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Subscribers" ON newsletter_subscribers FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public All Access Shipping Countries" ON shipping_countries FOR ALL TO PUBLIC USING (true) WITH CHECK (true);


-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
('00000000-0000-0000-0000-000000000001', 'Skincare', 'skincare', 'Luxurious treatments for clean, glowing skin.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600'),
('00000000-0000-0000-0000-000000000002', 'Cosmetics', 'cosmetics', 'Rich palettes and finishes tailored to enhance African skin tones.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600'),
('00000000-0000-0000-0000-000000000003', 'Wellness', 'wellness', 'Nourishing oils, supplements and body treatments.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600'),
('00000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', 'Premium beauty applicators and luxury storage items.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600')
ON CONFLICT (id) DO NOTHING;

-- Seed Brands
INSERT INTO brands (id, name, slug, description, logo_url) VALUES
('00000000-0000-0000-0000-000000000011', 'Eureka Lab', 'eureka-lab', 'In-house luxury formulations powered by African botanicals.', NULL),
('00000000-0000-0000-0000-000000000012', 'Fenty Beauty', 'fenty-beauty', 'Premium inclusive cosmetics for all skin shades.', NULL),
('00000000-0000-0000-0000-000000000013', 'Dior Beauty', 'dior-beauty', 'High-end French cosmetics and luxury treatments.', NULL),
('00000000-0000-0000-0000-000000000014', 'Aura Wellness', 'aura-wellness', 'Holistic beauty from the inside out.', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, category_id, brand_id, name, slug, description, ingredients, how_to_use, benefits, price_xof, price_usd, discount_percent, sku, stock, skin_type, skin_concern, rating, review_count, is_featured, is_flash_sale, images) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Shea Glow Face Serum', 'shea-glow-face-serum', 'A luxurious, fast-absorbing serum that combines organic Shea extract with Niacinamide and Hyaluronic Acid to intensely hydrate, soothe, and correct hyperpigmentation. Perfect for locking in moisture in warm climates.', 'Water, Organic Shea Butter extract, Niacinamide (5%), Hyaluronic Acid, Aloe Vera Extract, Centella Asiatica, Vitamin E, Phenoxyethanol.', 'Apply 3-4 drops to clean, damp face and neck morning and night. Follow with moisturizer and sun protection.', 'Reduces dark spots, provides deep hydration, repairs skin barrier, and leaves a gorgeous non-greasy glow.', 15000.00, 25.00, 10, 'EB-SK-SHG-01', 45, 'All', 'Hydration', 4.8, 24, TRUE, FALSE, ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600']),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Baobab Radiance Face Oil', 'baobab-radiance-face-oil', 'Pure, cold-pressed Baobab seed oil infused with Vitamin C and Jojoba. Packed with antioxidants, it combats aging, boosts elasticity, and restores a healthy, radiant bounce to dull or tired skin.', '100% Pure Cold-Pressed Adansonia Digitata (Baobab) Seed Oil, Tetrahexyldecyl Ascorbate (Vitamin C), Simmondsia Chinensis (Jojoba) Seed Oil, Natural Fragrance.', 'Warm 2-3 drops between your palms and gently press onto your face as the final step of your nighttime routine.', 'Boosts collagen production, minimizes fine lines, and offers powerful antioxidant defense against daily pollution.', 18000.00, 30.00, 0, 'EB-SK-BBO-02', 20, 'Dry', 'Anti-Aging', 4.9, 18, TRUE, TRUE, ARRAY['https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&q=80&w=600']),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'Pro Filt''r Soft Matte Foundation', 'pro-filtr-soft-matte-foundation', 'The award-winning boundary-breaking foundation. Gives skin an instantly smooth, pore-diffused, shine-free finish that easily builds to medium to full coverage, tailored to withstand heat and humidity.', 'Water, Dimethicone, Talc, Peg-10 Dimethicone, Trimethylsiloxysilicate, Polypropylene, Isododecane, Cetyl Peg/Ppg-10/1 Dimethicone, Nylon-12.', 'Be sure to moisturize skin before foundation application. Always shake before use to activate. Pump 1-2 drops and blend with brush or sponge.', 'Climate-adaptive technology resists sweat, 50 inclusive shades, oil-free matte formula does not clog pores.', 28000.00, 47.00, 0, 'EB-CO-FTF-03', 30, 'Oily', 'General', 4.7, 42, TRUE, FALSE, ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600']),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000014', 'Hibiscus Refining Toner', 'hibiscus-refining-toner', 'An alcohol-free exfoliating toner containing natural AHA from Hibiscus petals and Salicylic Acid (BHA). Gently dissolves dead skin cells, tightens pores, and evens out skin tone without irritation.', 'Water, Hibiscus Sabdariffa Flower Extract, Glycerin, Salicylic Acid (0.5%), Witch Hazel, Panthenol, Allantoin.', 'Saturate a cotton pad and sweep gently over clean face and neck, avoiding the eye area. Use 3-4 times a week at night.', 'Clears clogged pores, reduces acne breakouts, refines skin texture, and brightens dull areas.', 12000.00, 20.00, 15, 'EB-SK-HBT-04', 50, 'Combination', 'Acne', 4.6, 15, FALSE, FALSE, ARRAY['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600']),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'Rouge Dior Luxury Lipstick', 'rouge-dior-luxury-lipstick', 'The iconic Dior lipstick that offers 16 hours of comfort and radiant color, available in highly pigmented satin, matte, metallic, and velvet finishes.', 'Polyglyceryl-2 Triisostearate, Hydrogenated Polyisobutene, Synthetic Wax, Shea Butter, Red Hibiscus extract, Pomegranate flower extract.', 'Apply directly from the bullet to the lips, starting from the center and blending outwards. For maximum precision, line lips first.', 'High color payoff, intense lip hydration, enriched with floral care, long-wearing premium finish.', 32000.00, 54.00, 5, 'EB-CO-DRL-05', 15, 'All', 'General', 4.9, 31, TRUE, FALSE, ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600']),
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000014', 'Cocoa Butter Body Soufflé', 'cocoa-butter-body-souffle', 'A whipped, feather-light body butter made with organic cocoa butter, coconut oil, and argan oil. It melts instantly into the skin to provide 48-hour deep hydration and a sweet cocoa aroma.', 'Organic Cocoa Butter, Coconut Oil, Whipped Shea Butter, Argan Oil, Sweet Almond Oil, Natural Vanilla Extract.', 'Massage generously onto clean skin daily, focusing on dry areas like elbows, knees, and heels.', 'Improves skin elasticity, helps fade stretch marks, softens dry skin, and smells absolutely heavenly.', 14500.00, 24.00, 0, 'EB-WL-CBS-06', 25, 'Dry', 'Hydration', 4.8, 14, FALSE, TRUE, ARRAY['https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600']),
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011', 'Satin Silk Eye Mask', 'satin-silk-eye-mask', 'A premium, hypoallergenic satin silk sleeping mask. Designed to protect the delicate skin around your eyes from friction, retaining moisture and preventing fine lines while you sleep.', '100% High-grade Hypoallergenic Satin Silk fabric, Elastic comfort band.', 'Slip over your eyes before sleep. Hand wash with mild soap and dry flat.', 'Blocks out light completely, prevents sleep wrinkles, maintains eye cream absorption, and avoids eyelash friction.', 8000.00, 13.00, 0, 'EB-AC-SEM-07', 60, 'All', 'Anti-Aging', 4.5, 9, FALSE, FALSE, ARRAY['https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=600'])
ON CONFLICT (id) DO NOTHING;

-- Seed Delivery Zones (French-speaking Africa)
INSERT INTO delivery_zones (country, city, zone_name, cost_xof, shipping_type, min_days, max_days) VALUES
('Côte d''Ivoire', 'Abidjan', 'Zone 1 (Cocody, Plateau, Marcory)', 1500.00, 'Standard', 1, 2),
('Côte d''Ivoire', 'Abidjan', 'Zone 2 (Yopougon, Abobo)', 2500.00, 'Standard', 1, 3),
('Côte d''Ivoire', 'Yamoussoukro', 'Central Yamoussoukro', 3500.00, 'Standard', 2, 4),
('Senegal', 'Dakar', 'Dakar Center (Plateau, Almadies)', 2000.00, 'Standard', 1, 2),
('Senegal', 'Dakar', 'Dakar Suburbs', 3000.00, 'Standard', 2, 3),
('Cameroon', 'Douala', 'Douala Center', 2500.00, 'Standard', 2, 4),
('Benin', 'Cotonou', 'Cotonou Town', 2000.00, 'Standard', 2, 3),
('Togo', 'Lomé', 'Lomé Center', 1500.00, 'Standard', 2, 3);

-- Seed Coupons
INSERT INTO coupons (code, discount_percent, min_order_value_xof, valid_from, valid_to, is_active, usage_limit) VALUES
('EUREKAGLOW', 15, 10000.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', TRUE, 500),
('WELCOME10', 10, 0.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', TRUE, 1000),
('LUXE20', 20, 25000.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days', TRUE, 100);

-- Seed Testimonials
INSERT INTO testimonials (name, role, rating, comment, avatar_url) VALUES
('Fatou Diallo', 'Dakar, Senegal', 5, 'Eureka Beauty has completely changed my skincare routine. The Shea Glow Serum is pure magic for my hyperpigmentation!', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150'),
('Amina Koné', 'Abidjan, Côte d''Ivoire', 5, 'Authentic products and lightning fast delivery in Abidjan. I ordered using Cash on Delivery and it arrived within 24 hours.', 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150'),
('Koffi Mensah', 'Lomé, Togo', 5, 'Superb customer service on WhatsApp. They recommended the perfect skincare routine for my dry skin.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

-- Seed Reviews
INSERT INTO reviews (id, product_id, customer_name, rating, comment, is_verified_buyer, helpful_votes) VALUES
('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000101', 'Khady Diop', 5, 'C''est magnifique! Mes taches sombres disparaissent après deux semaines.', TRUE, 12),
('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000101', 'Marie N''goran', 4, 'Très hydratant et agréable sur le visage. Je recommande.', TRUE, 5),
('00000000-0000-0000-0000-000000000903', '00000000-0000-0000-0000-000000000102', 'Fanta Touré', 5, 'L''huile de Baobab est incroyable, elle redonne vie à ma peau sèche.', TRUE, 8)
ON CONFLICT (id) DO NOTHING;

-- Seed Blog Posts
INSERT INTO blog_posts (title, slug, summary, content, category, image_url, read_time) VALUES
('5 Skincare Secrets for Glowing African Skin', '5-skincare-secrets-glowing-african-skin', 'Discover the power of natural botanicals and simple routines for radiant skin.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sourcing locally-harvested organic Shea Butter and Baobab oils is key to locking in moisture under hot tropical climates. Always apply sunscreen, even on dark skin tones, to protect against hyperpigmentation and ultraviolet damage.', 'Skin Care', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600', '4 min read'),
('How to Match Foundation for Rich Melanin Tones', 'how-to-match-foundation-rich-melanin-tones', 'A comprehensive guide to identifying your undertones and finding your true match.', 'Finding the perfect foundation shade can be challenging. We break down the differences between warm, cool, and neutral undertones, showcasing how premium brands like Fenty Beauty offer beautiful, non-ashy options for dark and golden skin.', 'Cosmetics', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', '6 min read');



-- Seed Shipping Countries
INSERT INTO shipping_countries (id, country_name, currency, custom_shipping_cost, free_shipping_cities) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Côte d''Ivoire', 'XOF', 3000.00, ARRAY['Abidjan', 'Yamoussoukro']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Senegal', 'XOF', 3500.00, ARRAY['Dakar']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Benin', 'XOF', 2500.00, ARRAY['Cotonou']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Togo', 'XOF', 2000.00, ARRAY['Lomé']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Cameroon', 'XAF', 4000.00, ARRAY['Douala', 'Yaoundé']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Mali', 'XOF', 3500.00, ARRAY['Bamako']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Burkina Faso', 'XOF', 3500.00, ARRAY['Ouagadougou'])
ON CONFLICT (country_name) DO NOTHING;
