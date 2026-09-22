'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ShopNowButton from '@/components/ShopNowButton';
import productService from '@/lib/services/products';
import styles from './watch-and-shop.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function WatchAndShopPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    productService
      .getVideoProducts()
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load videos');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>WATCH & SHOP</h1>
          <p className={styles.subtitle}>See the craft in motion, then shop the piece.</p>
        </div>

        {loading ? (
          <div className={styles.placeholderCard}>Loading videos…</div>
        ) : error ? (
          <div className={styles.placeholderCard}>{error}</div>
        ) : items.length === 0 ? (
          <div className={styles.placeholderCard}>
            No shoppable videos yet. Check back soon.
          </div>
        ) : (
          <div className={styles.feedGrid}>
            {items.map((item) => {
              const videoSrc = resolveUrl(item.video_url);
              const poster = resolveUrl(item.images?.[0]);
              const href =
                item.attached && item.slug
                  ? `/products/${item.slug}`
                  : item.product_id
                    ? `/shop`
                    : '/shop';

              return (
                <article key={item.id} className={styles.feedCard}>
                  <div className={styles.videoWrap}>
                    {videoSrc ? (
                      <video
                        className={styles.video}
                        src={videoSrc}
                        poster={poster || undefined}
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className={styles.videoFallback}>No video</div>
                    )}
                  </div>
                  <div className={styles.feedBody}>
                    <h2 className={styles.feedTitle}>{item.name}</h2>
                    <p className={styles.feedPrice}>{formatPrice(item.price)}</p>
                    {item.description && (
                      <p className={styles.feedDesc}>{item.description}</p>
                    )}
                    <ShopNowButton
                      href={href}
                      variant="onLight"
                      text="Shop this"
                      size="md"
                    />
                    {item.attached && (
                      <Link href={href} className={styles.productLink}>
                        View product details
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
