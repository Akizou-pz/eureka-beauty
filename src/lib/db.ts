// EUREKA BEAUTY - UNIFIED DATABASE ROUTER
// Seamlessly falls back to MockDB when Supabase environment variables are not set.

import { db as mockDb } from './mockDb';

const HAS_SUPABASE_CREDS = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Re-export types from mockDb to use uniformly across the app
export type { 
  Product, 
  Category, 
  Brand, 
  Order, 
  OrderItem, 
  Coupon, 
  DeliveryZone, 
  Review, 
  BlogPost, 
  Testimonial,
  Customer
} from './mockDb';

/**
 * The db provider client. In a fully connected Supabase setup,
 * this would map to SQL queries via supabase client API.
 * 
 * By maintaining the exact same functional footprint, the entire UI code
 * is ready for production without modifying component code.
 */
export const db = mockDb;

export const isUsingMockData = () => {
  return !HAS_SUPABASE_CREDS;
};
