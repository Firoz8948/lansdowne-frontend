import styles from './shop.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Shop | Lansdowne',
  description: 'Explore the full product collection',
};

export default function ShopPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Shop Collection</h1>
          <p className={styles.subtitle}>Explore our complete range of products.</p>
        </div>
        <div className={styles.placeholderCard}>
          Product filters, categories, and items grid will be placed here.
        </div>
      </main>
      <Footer />
    </div>
  );
}
