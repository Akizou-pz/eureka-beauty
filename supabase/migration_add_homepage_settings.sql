-- Create homepage_settings table in Supabase
CREATE TABLE IF NOT EXISTS homepage_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and add public access policy
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public All Access Homepage Settings" ON homepage_settings;
CREATE POLICY "Public All Access Homepage Settings" ON homepage_settings FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Insert initial settings
INSERT INTO homepage_settings (id, settings) VALUES ('default', '{
  "hero_slides": [
    {
      "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
      "tag": "EUREKA LAB EXCLUSIF",
      "tag_en": "EXCLUSIVE EUREKA LAB",
      "title": "Des Soins Authentiques Révélant Votre Confiance",
      "title_en": "Authentic Skincare Revealing Your Confidence",
      "desc": "Formulés à base de plantes précieuses africaines pour hydrater, unifier et sublimer les peaux riches en mélanine.",
      "desc_en": "Formulated with precious African botanicals to hydrate, even out and enhance melanin-rich skin."
    },
    {
      "image": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&auto=format&fit=crop&q=80",
      "tag": "PARTENAIRE FENTY BEAUTY",
      "tag_en": "FENTY BEAUTY PARTNER",
      "title": "Sublimez Vos Teints Dorés et Métissés",
      "title_en": "Enhance Your Golden and Mixed Skin Tones",
      "desc": "Retrouvez nos sélections exclusives et adaptées au climat tropical. Sans effet masque, résistant à la chaleur.",
      "desc_en": "Find our exclusive selections adapted to tropical climate. Lightweight, sweat-resistant."
    }
  ],
  "before_after": {
    "before_image": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=80",
    "after_image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80"
  },
  "instagram_images": [
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400"
  ]
}') ON CONFLICT (id) DO NOTHING;
