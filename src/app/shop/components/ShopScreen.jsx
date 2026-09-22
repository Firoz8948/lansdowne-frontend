'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, SlidersHorizontal, ChevronDown } from 'lucide-react';
import productService from '@/lib/services/products';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import styles from '../shop.module.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

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

export default function ShopScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get('category') || ''
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get('category') || '';
    const sortFromUrl = searchParams.get('sort') || 'newest';
    setCategorySlug(fromUrl);
    setSort(sortFromUrl);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    productService
      .getCategories()
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data)
          ? data.filter((c) => c.is_active !== false && !c.is_reels)
          : [];
        setCategories(list);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const syncUrl = useCallback(
    (nextCategory, nextSort) => {
      const params = new URLSearchParams();
      if (nextCategory) params.set('category', nextCategory);
      if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
      const qs = params.toString();
      router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
    },
    [router]
  );

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        page: 1,
        page_size: 48,
        category_slug: categorySlug || undefined,
        sort: sort || 'newest',
      });
      let items = Array.isArray(data?.items) ? data.items : [];
      if (featuredOnly) {
        items = items.filter((p) => p.is_featured);
      }
      if (inStockOnly) {
        items = items.filter((p) => Number(p.stock) > 0);
      }
      setProducts(items);
      setTotal(featuredOnly || inStockOnly ? items.length : data?.total ?? items.length);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load products');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, sort, featuredOnly, inStockOnly]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const selectedCategoryName = useMemo(() => {
    if (!categorySlug) return 'All Products';
    return categories.find((c) => c.slug === categorySlug)?.name || 'Shop';
  }, [categories, categorySlug]);

  const handleCategoryChange = (slug) => {
    setCategorySlug(slug);
    syncUrl(slug, sort);
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (value) => {
    setSort(value);
    syncUrl(categorySlug, value);
  };

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

  const clearFilters = () => {
    setFeaturedOnly(false);
    setInStockOnly(false);
    setCategorySlug('');
    setSort('newest');
    syncUrl('', 'newest');
  };

  const renderProductCard = (product) => {
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
  };

  const filterPanel = (
    <>
      <div className={styles.filterBlock}>
        <h3 className={styles.filterTitle}>Category</h3>
        <div className={styles.categoryList}>
          <button
            type="button"
            className={`${styles.categoryItem} ${!categorySlug ? styles.categoryItemActive : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryItem} ${
                categorySlug === cat.slug ? styles.categoryItemActive : ''
              }`}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterBlock}>
        <h3 className={styles.filterTitle}>Sort by</h3>
        <div className={styles.sortList}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.sortItem} ${sort === opt.value ? styles.sortItemActive : ''}`}
              onClick={() => handleSortChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterBlock}>
        <h3 className={styles.filterTitle}>Filters</h3>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
          />
          <span>Featured only</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span>In stock only</span>
        </label>
      </div>

      <button type="button" className={styles.clearBtn} onClick={clearFilters}>
        Clear all
      </button>
    </>
  );

  return (
    <div className={styles.shopContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.sectionTitle}>SHOP</h1>
        <p className={styles.sectionSubtitle}>
          {selectedCategoryName}
          {!loading && (
            <span className={styles.resultCount}>
              {' '}
              · {total} item{total === 1 ? '' : 's'}
            </span>
          )}
        </p>
      </div>

      {/* Mobile category tabs */}
      <div className={styles.mobileTabs}>
        <button
          type="button"
          className={`${styles.mobileTab} ${!categorySlug ? styles.mobileTabActive : ''}`}
          onClick={() => handleCategoryChange('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.mobileTab} ${
              categorySlug === cat.slug ? styles.mobileTabActive : ''
            }`}
            onClick={() => handleCategoryChange(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Mobile filter / sort row */}
      <div className={styles.mobileToolbar}>
        <button
          type="button"
          className={styles.mobileToolBtn}
          onClick={() => setMobileFiltersOpen((o) => !o)}
        >
          <SlidersHorizontal size={16} />
          Filter
          <ChevronDown
            size={14}
            className={mobileFiltersOpen ? styles.chevronOpen : ''}
          />
        </button>
        <div className={styles.mobileSortWrap}>
          <select
            className={styles.mobileSortSelect}
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className={styles.mobileFilterPanel}>{filterPanel}</div>
      )}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>{filterPanel}</aside>

        <section className={styles.productsArea}>
          {loading ? (
            <div className={styles.productGrid}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={`${styles.productCard} ${styles.productSkeleton}`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No products found</h2>
              <p>Try another category or clear your filters.</p>
              <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map(renderProductCard)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
