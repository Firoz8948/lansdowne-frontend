import styles from './watch-and-shop.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Watch & Shop | Lansdowne',
  description: 'Interactive shoppable video feed',
};

export default function WatchAndShopPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Watch & Shop</h1>
          <p className={styles.subtitle}>
            Discover products in action with our shoppable video showcase.
          </p>
        </div>
        <div className={styles.placeholderCard}>
          Shoppable video reels, product tags, and instant buy triggers will be placed here.
        </div>
      </main>
      <Footer />
    </div>
  );
}
