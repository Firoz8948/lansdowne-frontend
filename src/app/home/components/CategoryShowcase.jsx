'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import productService from '@/lib/services/products';
import styles from '../home.module.css';

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        if (isMounted && Array.isArray(data)) {
          // Filter active categories and exclude internal reels category
          const curated = data.filter((cat) => cat.is_active && !cat.is_reels);
          setCategories(curated);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <span className={styles.sectionTag}>Explore Categories</span>
          <h2 className={styles.sectionTitle}>Curated Collections</h2>
        </div>
        <Link href="/shop" className={styles.sectionLink}>
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.categoryGrid}>
        {loading ? (
          // Skeleton loaders while fetching from db
          [1, 2, 3].map((n) => (
            <div
              key={n}
              className={`${styles.categoryCard} ${styles.categorySkeleton}`}
              style={{ minHeight: 280 }}
            />
          ))
        ) : categories.length > 0 ? (
          categories.map((cat) => {
            const resolvedImg = resolveImageUrl(cat.image_url);
            const badgeLabel =
              cat.product_count > 0
                ? `${cat.product_count} ${cat.product_count === 1 ? 'Piece' : 'Pieces'}`
                : 'Collection';

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className={styles.categoryCard}
              >
                {resolvedImg && (
                  <>
                    <img
                      src={resolvedImg}
                      alt={cat.name}
                      className={styles.categoryCardImg}
                    />
                    <div className={styles.categoryCardOverlay} />
                  </>
                )}

                <span className={styles.categoryBadge}>{badgeLabel}</span>

                <div className={styles.categoryCardContent}>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <span className={styles.categoryAction}>
                    Shop Now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className={styles.categoryEmpty}>
            <p>No categories published yet. Add categories from the Admin Portal.</p>
          </div>
        )}
      </div>
    </section>
  );
}
