import styles from './products.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Products | Lansdowne',
};

export default function ProductsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className={styles.container} style={{ flex: 1 }}>
        <h1 className={styles.heading}>Products Catalog</h1>
        <div className={styles.emptyState}>
          Product catalog showcase and filter views will be placed here.
        </div>
      </main>
      <Footer />
    </div>
  );
}
