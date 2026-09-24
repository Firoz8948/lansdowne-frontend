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

/** Human-readable variant text for cart or order line items */
export function formatVariantLabel(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (source.variantLabel) return source.variantLabel;
  const vi = source.variant_info && typeof source.variant_info === 'object'
    ? source.variant_info
    : source;
  if (vi?.label) return vi.label;
  const sels = source.selections || vi?.selections;
  if (Array.isArray(sels) && sels.length) {
    return sels
      .map((s) => [s.variant, s.option].filter(Boolean).join(': '))
      .filter(Boolean)
      .join(' · ');
  }
  return [source.variantName || vi?.variant, source.optionName || vi?.option]
    .filter(Boolean)
    .join(' · ');
}

function buildSelectionsLabel(selections) {
  if (!Array.isArray(selections) || !selections.length) return null;
  return selections
    .map((s) => [s.variant, s.option].filter(Boolean).join(': '))
    .filter(Boolean)
    .join(' · ');
}

export function buildCartItem(
  product,
  { quantity = 1, option = null, variantName = null, selections = null } = {}
) {
  const sels = Array.isArray(selections)
    ? selections
        .filter((s) => s && (s.option || s.option_id))
        .map((s) => ({
          variant: s.variant || s.variantName || null,
          option: s.option || s.optionName || null,
          variant_id: s.variant_id ?? s.variantId ?? null,
          option_id: s.option_id ?? s.optionId ?? null,
          weight_grams:
            s.weight_grams != null
              ? Number(s.weight_grams)
              : s.weight != null
                ? Number(s.weight)
                : null,
          hex: s.hex || null,
        }))
    : [];

  const primaryFromSels = sels.find((s) => /colou?r/i.test(s.variant || '')) || sels[0];
  const resolvedOption = option || null;
  const optionId =
    sels.length > 0
      ? sels.map((s) => s.option_id ?? s.option ?? 'x').join('_')
      : resolvedOption?.id ?? resolvedOption?.name ?? 'default';

  const price = resolvedOption?.price ?? product.price;
  const mrp = resolvedOption?.mrp ?? product.mrp;
  const optionImages = Array.isArray(resolvedOption?.images)
    ? resolvedOption.images.filter(Boolean)
    : [];
  const image = resolveImageUrl(
    optionImages[0] ||
      resolvedOption?.image_url ||
      product.images?.[0] ||
      product.image ||
      null
  );

  const variantLabel =
    buildSelectionsLabel(sels) ||
    [variantName, resolvedOption?.name].filter(Boolean).join(' · ') ||
    null;

  const weightFromSels = sels.find((s) => s.weight_grams != null)?.weight_grams;
  const weight_grams =
    weightFromSels != null
      ? weightFromSels
      : resolvedOption?.weight != null
        ? Number(resolvedOption.weight)
        : null;

  return {
    id: `${product.id}-${optionId}`,
    productId: String(product.id),
    slug: product.slug,
    name: product.name,
    price: Number(price) || 0,
    mrp: mrp != null ? Number(mrp) : null,
    image,
    quantity: Math.max(1, Number(quantity) || 1),
    variantName: variantName || primaryFromSels?.variant || null,
    optionName: resolvedOption?.name || primaryFromSels?.option || null,
    selections: sels,
    variantLabel,
    weight_grams,
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
