'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import productService from '@/lib/services/products';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import styles from '../home.module.css';

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function ProductShowcase() {
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        let items = [];
        try {
          const featured = await productService.getFeaturedProducts();
          if (Array.isArray(featured) && featured.length > 0) {
            items = featured;
          }
        } catch {
          // fall through to all products
        }

        if (items.length === 0) {
          const page = await productService.getProducts({ page: 1, page_size: 8 });
          items = Array.isArray(page?.items) ? page.items : [];
        }

        if (mounted) setProducts(items.slice(0, 8));
      } catch (err) {
        console.error('Failed to load products:', err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, { quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, { quantity: 1 });
    router.push('/cart');
  };

  return (
    <section className={`${styles.section} ${styles.productSection}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>TRENDING NOW</h2>
        <div className={styles.sectionTitleRow}>
          <p className={styles.sectionSubtitle}>Shop What’s In Demand</p>
          <Link href="/shop" className={styles.sectionLink}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className={styles.productGrid}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`${styles.productCard} ${styles.productSkeleton}`} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={styles.productEmpty}>
          <p>No products to show yet. Add products from the Admin Portal and mark them Featured.</p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => {
            const primaryImage = resolveImageUrl(product.images?.[0]);
            const hoverImage = resolveImageUrl(product.images?.[1]);
            const href = product.slug ? `/products/${product.slug}` : '/shop';
            const hasDiscount =
              product.mrp != null && Number(product.mrp) > Number(product.price);
            const hasHoverImage = Boolean(hoverImage);

            return (
              <article
                key={product.id}
                className={`${styles.productCard} ${hasHoverImage ? styles.productCardHasHoverImg : ''}`}
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

                  <div className={styles.productCardActions}>
                    <button
                      type="button"
                      className={styles.productBuyNowBtn}
                      onClick={(e) => handleBuyNow(e, product)}
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      className={styles.productCartBtn}
                      onClick={(e) => handleAddToCart(e, product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingCart size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
