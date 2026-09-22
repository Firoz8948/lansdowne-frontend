import { Suspense } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ShopScreen from './components/ShopScreen';
import styles from './shop.module.css';

export const metadata = {
  title: 'Shop | Lansdowne',
  description: 'Explore the full product collection',
};

export default function ShopPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Suspense
          fallback={
            <div className={styles.shopContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Shop</h1>
                <p className={styles.pageSubtitle}>Loading collection…</p>
              </div>
            </div>
          }
        >
          <ShopScreen />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
