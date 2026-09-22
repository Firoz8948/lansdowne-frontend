'use client';

import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ShopNowButton from '@/components/ShopNowButton';
import { useCart } from '@/context/CartContext';
import { CheckCircle2 } from 'lucide-react';
import styles from './orders.module.css';

function OrdersContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order');
  const payment = searchParams.get('payment');

  const isSuccess = payment === 'success' || payment === 'cod';

  useEffect(() => {
    if (isSuccess) clearCart();
  }, [isSuccess, clearCart]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.card}>
            {isSuccess ? (
              <>
                <CheckCircle2 size={48} strokeWidth={1.5} className={styles.successIcon} />
                <h1 className={styles.title}>
                  {payment === 'cod' ? 'Order placed' : 'Payment successful'}
                </h1>
                <p className={styles.subtitle}>
                  Thank you for shopping with Lansdowne.
                  {orderId ? ` Your order ID is ${orderId}.` : ''}
                  {payment === 'cod'
                    ? ' Please keep the payment ready at delivery.'
                    : ' A confirmation will be sent shortly.'}
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Your orders</h1>
                <p className={styles.subtitle}>
                  Order history will appear here once you place an order.
                </p>
              </>
            )}

            <div className={styles.actions}>
              <ShopNowButton href="/shop" variant="onLight" text="Continue Shopping" />
              <Link href="/" className={styles.homeLink}>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <Header />
          <main className={styles.main}>
            <div className={styles.inner}>
              <p className={styles.loading}>Loading…</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
