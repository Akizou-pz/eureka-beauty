'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Product, Coupon, DeliveryZone } from '@/lib/db';

export interface CartItem {
  id: string; // unique cart item id
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  price_xof: number;
  discount_percent: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  shippingZone: DeliveryZone | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  setShippingZone: (zone: DeliveryZone | null) => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingZone, setShippingZoneState] = useState<DeliveryZone | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('eb_cart');
      const storedCoupon = localStorage.getItem('eb_applied_coupon');
      const storedZone = localStorage.getItem('eb_shipping_zone');

      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));
      if (storedZone) setShippingZoneState(JSON.parse(storedZone));
    }
  }, []);

  // Save cart to localStorage on change
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('eb_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.product_id === product.id);
    const newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        id: 'cart-item-' + Math.random().toString(36).substr(2, 9),
        product_id: product.id,
        name: product.name,
        sku: product.sku || '',
        quantity,
        price_xof: product.price_xof,
        discount_percent: product.discount_percent,
        image: product.images[0] || '',
      });
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.product_id !== productId);
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
    setShippingZone(null);
  };

  const applyCouponCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const coupon = db.getCouponByCode(code);
      if (!coupon) {
        resolve({ success: false, error: 'Code promo invalide ou expiré.' });
        return;
      }
      
      const subtotal = getCartSubtotal();
      if (subtotal < coupon.min_order_value_xof) {
        resolve({
          success: false,
          error: `Le montant minimum pour ce code est de ${coupon.min_order_value_xof} FCFA.`,
        });
        return;
      }

      setAppliedCoupon(coupon);
      localStorage.setItem('eb_applied_coupon', JSON.stringify(coupon));
      resolve({ success: true });
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('eb_applied_coupon');
  };

  const setShippingZone = (zone: DeliveryZone | null) => {
    setShippingZoneState(zone);
    if (zone) {
      localStorage.setItem('eb_shipping_zone', JSON.stringify(zone));
    } else {
      localStorage.removeItem('eb_shipping_zone');
    }
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      // Calculate discounted price per item
      const itemPrice = item.price_xof * (1 - item.discount_percent / 100);
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const getCartDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartSubtotal();
    return subtotal * (appliedCoupon.discount_percent / 100);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const shipping = shippingZone ? shippingZone.cost_xof : 0;
    return Math.max(0, subtotal - discount + shipping);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        appliedCoupon,
        shippingZone,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        setShippingZone,
        getCartSubtotal,
        getCartDiscount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
