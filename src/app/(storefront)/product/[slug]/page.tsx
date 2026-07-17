import ProductDetailClient from './ProductDetailClient';
import { db } from '@/lib/db';

// This function generates the static paths for every seeded product during next build
export async function generateStaticParams() {
  const products = db.getProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductDetailClient params={params} />;
}
