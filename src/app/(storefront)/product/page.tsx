import React, { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <ProductDetailClient />
    </Suspense>
  );
}
