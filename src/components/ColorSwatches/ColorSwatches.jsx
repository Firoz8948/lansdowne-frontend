'use client';

import styles from './ColorSwatches.module.css';

function swatchBackground(colors) {
  const list = Array.isArray(colors) ? colors.filter((c) => c?.hex) : [];
  if (list.length === 0) return '#cbd5e1';
  if (list.length === 1) return list[0].hex;
  if (list.length === 2) {
    return `linear-gradient(135deg, ${list[0].hex} 50%, ${list[1].hex} 50%)`;
  }
  const step = 100 / list.length;
  const stops = list
    .map((c, i) => `${c.hex} ${i * step}% ${(i + 1) * step}%`)
    .join(', ');
  return `conic-gradient(from 180deg, ${stops})`;
}

function labelFor(colors) {
  const list = Array.isArray(colors) ? colors : [];
  if (!list.length) return 'Color';
  return list.map((c) => c.name || c.hex).filter(Boolean).join(' / ');
}

/**
 * Radio-style color swatches for product cards / PDP.
 * items: [{ id, slug, colors, is_current, name }]
 * onSelect(item) — typically navigate to sibling PDP
 */
export default function ColorSwatches({
  items = [],
  size = 'md',
  onSelect,
  className = '',
  align = 'left',
  stopPropagation = false,
}) {
  if (!items?.length) return null;

  return (
    <div
      className={`${styles.row} ${styles[size] || ''} ${
        align === 'right' ? styles.rowRight : ''
      } ${className}`.trim()}
      role="radiogroup"
      aria-label="Color"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {items.map((item) => {
        const selected = Boolean(item.is_current);
        const label = item.name || labelFor(item.colors);
        return (
          <button
            key={item.id || item.slug || label}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            className={`${styles.swatch} ${selected ? styles.swatchActive : ''}`}
            style={{ background: swatchBackground(item.colors) }}
            onClick={(e) => {
              if (stopPropagation) e.stopPropagation();
              e.preventDefault();
              if (!selected) onSelect?.(item);
            }}
          />
        );
      })}
    </div>
  );
}

function optionToColors(option) {
  if (!option) return [];
  const optName = (option.name || '').trim();
  if (Array.isArray(option.colors) && option.colors.length) {
    return option.colors
      .filter((c) => c?.hex)
      .map((c, i) => ({
        hex: c.hex,
        // Prefer option name for the primary swatch so stale nested names
        // (e.g. leftover "Black") never override "Orange"
        name: (i === 0 ? optName || c.name : c.name || optName) || c.hex,
      }));
  }
  if (option.hex) {
    return [{ name: optName || option.hex, hex: option.hex }];
  }
  return [];
}

/** Color / Colour variant options → one radio per option */
export function colorVariantOptions(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const colorVariant = variants.find((v) => /colou?r/i.test(v?.name || ''));
  return Array.isArray(colorVariant?.options) ? colorVariant.options : [];
}

/** PDP link for a swatch item (sibling slug or same product + ?color=) */
export function productColorHref(item) {
  if (!item?.slug) return null;
  const base = `/products/${encodeURIComponent(item.slug)}`;
  if (item.option_id != null && item.option_id !== '') {
    return `${base}?color=${encodeURIComponent(item.option_id)}`;
  }
  if (item.name && String(item.id || '').includes('-color-')) {
    return `${base}?color=${encodeURIComponent(item.name)}`;
  }
  return base;
}

export function optionGalleryUrls(option) {
  if (!option) return [];
  if (Array.isArray(option.images) && option.images.length) {
    return option.images.filter(Boolean);
  }
  if (option.image_url) return [option.image_url];
  return [];
}

export function matchColorOption(options, colorParam) {
  if (!colorParam || !options?.length) return null;
  const raw = decodeURIComponent(String(colorParam)).trim();
  if (!raw) return null;
  const byId = options.find((o) => String(o.id) === raw);
  if (byId) return byId;
  const lower = raw.toLowerCase();
  return (
    options.find((o) => String(o.name || '').toLowerCase() === lower) || null
  );
}

export function buildColorSwatchItems(product) {
  if (!product) return [];

  // Linked sibling products (separate PDPs) take priority
  const siblings = Array.isArray(product.color_siblings) ? product.color_siblings : [];
  if (siblings.length > 1) {
    return siblings.map((s) => ({
      ...s,
      is_current: Boolean(s.is_current) || String(s.id) === String(product.id),
    }));
  }

  // Color variant on this product → one radio per option (e.g. Red + Blue)
  const options = colorVariantOptions(product);
  if (options.length > 0) {
    return options.map((opt, index) => {
      const colors = optionToColors(opt);
      return {
        id: opt.id ?? `${product.id}-color-${index}`,
        slug: product.slug,
        name: opt.name,
        colors: colors.length ? colors : [{ name: opt.name || 'Color', hex: '#cbd5e1' }],
        is_current: index === 0,
        option_id: opt.id,
      };
    });
  }

  // Single sibling entry or product-level colors → one swatch (may be multicolor)
  if (siblings.length === 1) {
    const s = siblings[0];
    return [
      {
        ...s,
        is_current: true,
      },
    ];
  }

  const colors = Array.isArray(product.colors) ? product.colors : [];
  if (!colors.length) return [];
  return [
    {
      id: product.id,
      slug: product.slug,
      name: product.name,
      colors,
      is_current: true,
    },
  ];
}
