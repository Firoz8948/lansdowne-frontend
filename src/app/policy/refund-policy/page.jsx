import styles from './refund.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Refund & Return Policy | Lansdowne',
};

export default function RefundPolicyPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Refund & Return Policy</h1>
        <div className={styles.lastUpdated}>Last updated: January 2026</div>

        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Return Window</h2>
          <p className={styles.paragraph}>
            We offer returns and replacements within 7 days of delivery for damaged, defective, or incorrect products.
          </p>

          <h2 className={styles.sectionHeading}>2. Refund Processing</h2>
          <p className={styles.paragraph}>
            Once the returned item is inspected at our fulfillment facility, eligible refunds will be initiated to your original payment method within 5-7 business days.
          </p>

          <h2 className={styles.sectionHeading}>3. Return Shipping</h2>
          <p className={styles.paragraph}>
            Our courier partner will arrange pickup from your original delivery address upon approval of the return request.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
