'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'lansdowne_cart_v1';

const CartContext = createContext(null);

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function buildCartItem(product, { quantity = 1, option = null, variantName = null } = {}) {
  const optionId = option?.id ?? option?.name ?? 'default';
  const price = option?.price ?? product.price;
  const mrp = option?.mrp ?? product.mrp;
  const image = resolveImageUrl(product.images?.[0] || product.image || null);

  return {
    id: `${product.id}-${optionId}`,
    productId: String(product.id),
    slug: product.slug,
    name: product.name,
    price: Number(price) || 0,
    mrp: mrp != null ? Number(mrp) : null,
    image,
    quantity: Math.max(1, Number(quantity) || 1),
    variantName: variantName || null,
    optionName: option?.name || null,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addItem = useCallback((product, options = {}) => {
    const incoming = buildCartItem(product, options);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === incoming.id);
      if (existing) {
        return prev.map((item) =>
          item.id === incoming.id
            ? { ...item, quantity: item.quantity + incoming.quantity }
            : item
        );
      }
      return [...prev, incoming];
    });
    return incoming;
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const nextQty = Math.max(1, Number(quantity) || 1);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: nextQty } : item))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      items,
      hydrated,
      totalItems,
      totalAmount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, hydrated, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
