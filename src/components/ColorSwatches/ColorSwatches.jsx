'use client';

import styles from './ColorSwatches.module.css';

function looksLikeProductTitle(name, productName = '') {
  const n = String(name || '').trim();
  if (!n) return true;
  if (n.includes('|')) return true;
  if (productName && n.toLowerCase() === String(productName).trim().toLowerCase()) {
    return true;
  }
  // Product titles are usually long / many words; color names are short
  if (n.length > 40) return true;
  if (n.split(/\s+/).filter(Boolean).length >= 5) return true;
  return false;
}

function labelFor(colors, productName = '') {
  const list = Array.isArray(colors) ? colors : [];
  if (!list.length) return '';
  return list
    .map((c) => {
      const n = (c?.name || '').trim();
      if (!n || n.startsWith('#')) return '';
      if (looksLikeProductTitle(n, productName)) return '';
      return n;
    })
    .filter(Boolean)
    .join(' ');
}

/** Display label for a swatch / PDP "Color: …" — never a product title */
export function getSwatchColorLabel(item, product = null) {
  if (!item) return '';
  const productName = product?.name || item.product_name || '';
  const fromColors = labelFor(item.colors, productName);
  if (fromColors) return fromColors;

  const n = (item.name || '').trim();
  if (n && !looksLikeProductTitle(n, productName)) return n;

  // Last resort: option_id items should already have short option names
  if (item.option_id != null && n && n.length <= 40) return n;
  return '';
}

function swatchLabel(item) {
  return getSwatchColorLabel(item) || 'Color';
}

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

/**
 * Radio-style color swatches for product cards / PDP.
 * items: [{ id, slug, colors, is_current, name, images }]
 * onSelect(item) — typically navigate to sibling PDP
 * onPreview(item) — optional hover/focus preview (e.g. swap card image)
 */
export default function ColorSwatches({
  items = [],
  size = 'md',
  onSelect,
  onPreview,
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
        const label = swatchLabel(item);
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
            onMouseEnter={() => onPreview?.(item)}
            onFocus={() => onPreview?.(item)}
            onClick={(e) => {
              if (stopPropagation) e.stopPropagation();
              e.preventDefault();
              onPreview?.(item);
              // Always fire select on click (hover may already mark it selected)
              onSelect?.(item);
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
    const multi = option.colors.length > 1;
    return option.colors
      .filter((c) => c?.hex)
      .map((c) => ({
        hex: c.hex,
        // Single-color: option label wins. Multicolor: keep each swatch's own name.
        name: (multi ? c.name || optName : optName || c.name) || c.hex,
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

function siblingColorLabel(sibling, productName = '') {
  const fromColors = labelFor(sibling?.colors, productName);
  if (fromColors) return fromColors;
  // Never use the sibling product title as the color name
  return '';
}

export function buildColorSwatchItems(product) {
  if (!product) return [];
  const productName = product.name || '';

  // Linked sibling products (separate PDPs) take priority
  const siblings = Array.isArray(product.color_siblings) ? product.color_siblings : [];
  if (siblings.length > 1) {
    return siblings.map((s) => {
      const colors = Array.isArray(s.colors) ? s.colors : [];
      const colorLabel = siblingColorLabel(s, s.name || productName);
      return {
        ...s,
        // Keep product title in product_name; display name is color only
        product_name: s.name,
        name: colorLabel || 'Color',
        colors,
        images: s.image ? [s.image] : [],
        is_current: Boolean(s.is_current) || String(s.id) === String(product.id),
      };
    });
  }

  // Color variant on this product → one radio per option (e.g. Red + Blue)
  const options = colorVariantOptions(product);
  if (options.length > 0) {
    return options.map((opt, index) => {
      const colors = optionToColors(opt);
      const images = optionGalleryUrls(opt);
      const optName = (opt.name || '').trim();
      return {
        id: opt.id ?? `${product.id}-color-${index}`,
        slug: product.slug,
        name: optName || 'Color',
        colors: colors.length
          ? colors
          : [{ name: optName || 'Color', hex: '#cbd5e1' }],
        images,
        is_current: index === 0,
        option_id: opt.id,
      };
    });
  }

  // Single sibling entry or product-level colors → one swatch (may be multicolor)
  if (siblings.length === 1) {
    const s = siblings[0];
    const colors = Array.isArray(s.colors) ? s.colors : [];
    const colorLabel = siblingColorLabel(s, s.name || productName);
    return [
      {
        ...s,
        product_name: s.name,
        name: colorLabel || 'Color',
        colors,
        images: s.image ? [s.image] : [],
        is_current: true,
      },
    ];
  }

  const colors = Array.isArray(product.colors) ? product.colors : [];
  if (!colors.length) return [];
  const colorLabel = labelFor(colors, productName);
  return [
    {
      id: product.id,
      slug: product.slug,
      name: colorLabel || 'Multicolor',
      colors,
      images: [],
      is_current: true,
    },
  ];
}

/** Gallery URLs for a product card given optional active swatch (variant images win). */
export function resolveCardImages(product, activeSwatch = null) {
  if (!product) return [];
  const swatches = buildColorSwatchItems(product);
  const active =
    activeSwatch ||
    swatches.find((s) => s.is_current) ||
    swatches[0] ||
    null;

  if (active) {
    if (Array.isArray(active.images) && active.images.length) {
      return active.images.filter(Boolean);
    }
    if (active.image) return [active.image];
    if (active.option_id != null || active.name) {
      const opt = colorVariantOptions(product).find(
        (o) =>
          (active.option_id != null && o.id === active.option_id) ||
          o.name === active.name
      );
      const fromOpt = optionGalleryUrls(opt);
      if (fromOpt.length) return fromOpt;
    }
  }

  return Array.isArray(product.images) ? product.images.filter(Boolean) : [];
}
