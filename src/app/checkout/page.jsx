import styles from './checkout.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Checkout | Lansdowne',
};

export default function CheckoutPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.heading}>Secure Checkout</h1>
        <div className={styles.card}>
          Shipping address form, order summary, and payment gateway widgets will be placed here.
        </div>
      </main>
      <Footer />
    </div>
  );
}
