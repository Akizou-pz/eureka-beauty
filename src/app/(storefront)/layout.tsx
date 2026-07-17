import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketingFeatures from '@/components/MarketingFeatures';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-cream">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <MarketingFeatures />
    </div>
  );
}
