import styles from './cart.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Shopping Cart | Lansdowne',
};

export default function CartPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.heading}>Your Shopping Cart</h1>
        <div className={styles.card}>
          Cart items, quantity selectors, and checkout actions will be placed here.
        </div>
      </main>
      <Footer />
    </div>
  );
}
