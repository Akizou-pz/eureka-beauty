import React, { Suspense } from 'react';
import ProductFormClient from './ProductFormClient';

export default async function ProductFormPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px] bg-[#1c1c1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <ProductFormClient />
    </Suspense>
  );
}
