import styles from './shipping.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Shipping Policy | Lansdowne',
};

export default function ShippingPolicyPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Shipping Policy</h1>
        <div className={styles.lastUpdated}>Last updated: January 2026</div>

        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Order Dispatch Timeline</h2>
          <p className={styles.paragraph}>
            Orders are typically verified and dispatched within 24-48 business hours from our central warehouse.
          </p>

          <h2 className={styles.sectionHeading}>2. Estimated Delivery Time</h2>
          <p className={styles.paragraph}>
            Standard delivery across major metro cities takes 3-5 business days. Rest of India delivery takes 4-7 business days.
          </p>

          <h2 className={styles.sectionHeading}>3. Tracking Orders</h2>
          <p className={styles.paragraph}>
            You will receive live tracking links via SMS and email as soon as your parcel is handed over to our courier partner.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
