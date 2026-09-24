'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ShopNowButton from '@/components/ShopNowButton';
import { useCart, formatVariantLabel } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import styles from './cart.module.css';

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart, hydrated } =
    useCart();

  if (!hydrated) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.inner}>
            <p className={styles.loadingText}>Loading cart…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.headerRow}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.sectionTitle}>YOUR CART</h1>
              <p className={styles.sectionSubtitle}>
                {totalItems === 0
                  ? 'Your bag is empty'
                  : `${totalItems} item${totalItems === 1 ? '' : 's'} in your bag`}
              </p>
            </div>
            {items.length > 0 && (
              <button type="button" className={styles.clearBtn} onClick={clearCart}>
                Clear cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={40} strokeWidth={1.25} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No items yet</h2>
              <p className={styles.emptyDesc}>
                Browse the collection and add pieces you love.
              </p>
              <ShopNowButton href="/shop" variant="onLight" text="Continue Shopping" />
            </div>
          ) : (
            <div className={styles.layout}>
              <section className={styles.itemsPanel}>
                {items.map((item) => (
                  <article key={item.id} className={styles.cartItem}>
                    <Link href={`/products/${item.slug}`} className={styles.itemImageLink}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                      ) : (
                        <div className={styles.itemImageFallback}>No image</div>
                      )}
                    </Link>

                    <div className={styles.itemInfo}>
                      <Link href={`/products/${item.slug}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      {formatVariantLabel(item) && (
                        <p className={styles.itemMeta}>{formatVariantLabel(item)}</p>
                      )}
                      <p className={styles.itemPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </p>

                      <div className={styles.itemActions}>
                        <div className={styles.qtyControl}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <aside className={styles.summaryPanel}>
                <h2 className={styles.summaryTitle}>Order summary</h2>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={styles.summaryMuted}>Calculated at checkout</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>

                <div className={styles.summaryActions}>
                  <ShopNowButton
                    as="button"
                    text="Checkout"
                    variant="onLight"
                    fullWidth
                    onClick={() => router.push('/checkout')}
                  />
                  <Link href="/shop" className={styles.continueLink}>
                    Continue shopping
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
