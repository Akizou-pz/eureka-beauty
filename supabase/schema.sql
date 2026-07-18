-- EUREKA BEAUTY - SUPABASE DATABASE SCHEMA
-- Production-Ready Database Schema with RLS and Seeds

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
    referred_by UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- Anonymous/Public READ access policies
CREATE POLICY "Public Read Categories" ON categories FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public Read Brands" ON brands FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public Read Delivery Zones" ON delivery_zones FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public Read Blog Posts" ON blog_posts FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT TO PUBLIC USING (true);

-- Customer access policies (Require auth)
CREATE POLICY "Customers view own profile" ON customers FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Customers update own profile" ON customers FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Customers manage own addresses" ON addresses FOR ALL TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Customers view own orders" ON orders FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create own orders" ON orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

CREATE POLICY "Customers view own order items" ON order_items FOR SELECT TO authenticated USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);

CREATE POLICY "Customers manage own wishlist" ON wishlists FOR ALL TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Customers insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

-- Newsletter signups (Public insert, admin view)
CREATE POLICY "Public Insert Subscribers" ON newsletter_subscribers FOR INSERT TO PUBLIC WITH CHECK (true);

-- Admin access policies
CREATE POLICY "Admin All Access Categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Brands" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Order Items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Blog" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Subscribers" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);


-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Skincare', 'skincare', 'Luxurious treatments for clean, glowing skin.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600'),
('Cosmetics', 'cosmetics', 'Rich palettes and finishes tailored to enhance African skin tones.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600'),
('Wellness', 'wellness', 'Nourishing oils, supplements and body treatments.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600'),
('Accessories', 'accessories', 'Premium beauty applicators and luxury storage items.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600');

-- Seed Brands
INSERT INTO brands (name, slug, description, logo_url) VALUES
('Eureka Lab', 'eureka-lab', 'In-house luxury formulations powered by African botanicals.', NULL),
('Fenty Beauty', 'fenty-beauty', 'Premium inclusive cosmetics for all skin shades.', NULL),
('Dior Beauty', 'dior-beauty', 'High-end French cosmetics and luxury treatments.', NULL),
('Aura Wellness', 'aura-wellness', 'Holistic beauty from the inside out.', NULL);

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

-- Seed Blog Posts
INSERT INTO blog_posts (title, slug, summary, content, category, image_url, read_time) VALUES
('5 Skincare Secrets for Glowing African Skin', '5-skincare-secrets-glowing-african-skin', 'Discover the power of natural botanicals and simple routines for radiant skin.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sourcing locally-harvested organic Shea Butter and Baobab oils is key to locking in moisture under hot tropical climates. Always apply sunscreen, even on dark skin tones, to protect against hyperpigmentation and ultraviolet damage.', 'Skin Care', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600', '4 min read'),
('How to Match Foundation for Rich Melanin Tones', 'how-to-match-foundation-rich-melanin-tones', 'A comprehensive guide to identifying your undertones and finding your true match.', 'Finding the perfect foundation shade can be challenging. We break down the differences between warm, cool, and neutral undertones, showcasing how premium brands like Fenty Beauty offer beautiful, non-ashy options for dark and golden skin.', 'Cosmetics', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', '6 min read');

-- 14. SHIPPING COUNTRIES TABLE
CREATE TABLE IF NOT EXISTS shipping_countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_name VARCHAR(100) UNIQUE NOT NULL,
    currency VARCHAR(10) NOT NULL,
    custom_shipping_cost DECIMAL(12, 2) NOT NULL,
    free_shipping_cities TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
