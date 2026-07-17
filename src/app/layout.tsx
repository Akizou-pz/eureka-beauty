import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import './globals.css';
import { LanguageCurrencyProvider } from '@/context/LanguageCurrencyContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Eureka Beauty | Cosmétiques de Luxe Authentiques en Afrique',
  description: 'Découvrez Eureka Beauty, la référence du luxe pour soins de la peau, cosmétiques et bien-être en Afrique. Livraison rapide en Côte d\'Ivoire, Sénégal, Togo, Cameroun, Bénin. Paiement à la livraison.',
  keywords: 'beauty, cosmetics, skincare, luxury cosmetics, African skin, shea butter, foundation, Fenty Beauty, Dior, Côte d\'Ivoire, Senegal, Cameroon, Cash on Delivery, Mobile money',
  openGraph: {
    title: 'Eureka Beauty | Authentic Luxury Cosmetics',
    description: 'Reveal your natural beauty with premium cosmetics, skincare and wellness treatments curated for African skin tones.',
    url: 'https://eurekabeauty.com',
    siteName: 'Eureka Beauty',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg-cream text-dark antialiased">
        <LanguageCurrencyProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </LanguageCurrencyProvider>
      </body>
    </html>
  );
}
