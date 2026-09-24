'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ColorSwatches, {
  buildColorSwatchItems,
  productColorHref,
  resolveCardImages,
} from '@/components/ColorSwatches/ColorSwatches';

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Storefront product card — gallery prefers active color variant images.
 */
export default function ProductCard({
  product,
  styles,
  formatPrice,
  onAddToBag,
  className = '',
}) {
  const router = useRouter();
  const swatches = useMemo(() => buildColorSwatchItems(product), [product]);
  const defaultSwatch = swatches.find((s) => s.is_current) || swatches[0] || null;
  const [activeSwatch, setActiveSwatch] = useState(defaultSwatch);

  const gallery = useMemo(() => {
    const urls = resolveCardImages(product, activeSwatch || defaultSwatch);
    return urls.map(resolveImageUrl).filter(Boolean);
  }, [product, activeSwatch, defaultSwatch]);

  const primaryImage = gallery[0] || null;
  const hoverImage = gallery[1] || null;
  const href = (() => {
    const base = product.slug ? `/products/${product.slug}` : '/shop';
    if (activeSwatch?.option_id != null) {
      return productColorHref(activeSwatch) || base;
    }
    if (activeSwatch?.slug && activeSwatch.slug !== product.slug) {
      return productColorHref(activeSwatch) || base;
    }
    return base;
  })();
  const hasDiscount =
    product.mrp != null && Number(product.mrp) > Number(product.price);
  const hasHoverImage = Boolean(hoverImage);

  const itemsWithSelection = swatches.map((s) => ({
    ...s,
    is_current:
      activeSwatch != null
        ? String(s.id) === String(activeSwatch.id) ||
          (s.option_id != null &&
            activeSwatch.option_id != null &&
            s.option_id === activeSwatch.option_id)
        : s.is_current,
  }));

  const goToSwatch = (item) => {
    setActiveSwatch(item);
    const next = productColorHref(item);
    if (next) router.push(next);
  };

  return (
    <article
      className={`${styles.productCard} ${hasHoverImage ? styles.productCardHasHoverImg : ''} ${className}`.trim()}
    >
      <div className={styles.productImageWrap}>
        <Link href={href} className={styles.productImageLink}>
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                className={`${styles.productImage} ${styles.productImagePrimary}`}
                loading="lazy"
              />
              {hasHoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  aria-hidden="true"
                  className={`${styles.productImage} ${styles.productImageSecondary}`}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className={styles.productImagePlaceholder}>No image</div>
          )}
        </Link>
      </div>

      <div className={styles.productBody}>
        <Link href={href} className={styles.productInfoLink}>
          {product.category && (
            <span className={styles.productCategory}>{product.category}</span>
          )}
          <h3 className={styles.productName}>{product.name}</h3>
          <div className={styles.productPricing}>
            <span className={styles.productPrice}>{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className={styles.productMrp}>{formatPrice(product.mrp)}</span>
            )}
          </div>
        </Link>

        {itemsWithSelection.length > 0 ? (
          <div
            className={styles.productSwatchRow}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ColorSwatches
              items={itemsWithSelection}
              size="sm"
              align="right"
              stopPropagation
              onPreview={(item) => setActiveSwatch(item)}
              onSelect={goToSwatch}
            />
          </div>
        ) : null}

        {onAddToBag ? (
          <div className={styles.productCardActions}>
            <button
              type="button"
              className={styles.productBuyNowBtn}
              onClick={(e) => onAddToBag(e, product, activeSwatch)}
            >
              Add to Bag
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
