'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import productService from '@/lib/services/products';
import ShopNowButton from '@/components/ShopNowButton';
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

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

  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      // Swiped left: 1st goes left, 2nd comes right to left, etc.
      setActiveSlide((prev) => (prev + 1) % categories.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped right: goes previous
      setActiveSlide((prev) => (prev - 1 + categories.length) % categories.length);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % categories.length);
  };

  return (
    <section className={`${styles.section} ${styles.categorySection}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>CURATED COLLECTIONS</h2>
        <div className={styles.sectionTitleRow}>
          <p className={styles.sectionSubtitle}>Shop by category</p>
          <Link href="/shop" className={styles.sectionLink}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div
        className={styles.categoryContainer}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={styles.categoryGrid}
          style={{ '--active-slide': activeSlide }}
        >
          {loading ? (
            // Skeleton loaders while fetching from db
            [1, 2, 3].map((n) => (
              <div key={n} className={styles.categorySlide}>
                <div
                  className={`${styles.categoryCard} ${styles.categorySkeleton}`}
                />
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((cat, idx) => {
              const resolvedImg = resolveImageUrl(cat.image_url);

              return (
                <div
                  key={cat.id}
                  className={`${styles.categorySlide} ${activeSlide === idx ? styles.activeSlide : ''}`}
                >
                  <Link
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

                    <div className={styles.categoryCardTopContent}>
                      <div className={styles.categoryTopLabel}>
                        <span className={styles.categoryTopLabelLine} />
                        <span className={styles.categoryTopLabelText}>Premium</span>
                      </div>
                      <h3 className={styles.categoryName}>{cat.name}</h3>
                      {cat.description && (
                        <p className={styles.categoryDesc}>{cat.description}</p>
                      )}
                    </div>

                    <div className={styles.categoryActionWrapper}>
                      <ShopNowButton as="span" size="sm" />
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <div className={styles.categoryEmpty}>
              <p>No categories published yet. Add categories from the Admin Portal.</p>
            </div>
          )}
        </div>
      </div>

      {!loading && categories.length > 1 && (
        <div className={styles.categoryPagination}>
          <button
            type="button"
            className={styles.paginationArrowBtn}
            onClick={handlePrev}
            aria-label="Previous Category"
          >
            <ChevronLeft size={18} />
          </button>

          <div className={styles.categoryCarouselDots}>
            {categories.map((cat, idx) => (
              <button
                key={cat.id || idx}
                type="button"
                className={`${styles.categoryCarouselDot} ${activeSlide === idx ? styles.activeDot : ''}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to category ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.paginationArrowBtn}
            onClick={handleNext}
            aria-label="Next Category"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
