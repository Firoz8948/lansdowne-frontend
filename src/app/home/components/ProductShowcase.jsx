'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import productService from '@/lib/services/products';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from '../home.module.css';

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

  const handleAddToBag = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, { quantity: 1 });
    toast.success(`${product.name} added to bag`);
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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              styles={styles}
              formatPrice={formatPrice}
              onAddToBag={handleAddToBag}
            />
          ))}
        </div>
      )}
    </section>
  );
}
