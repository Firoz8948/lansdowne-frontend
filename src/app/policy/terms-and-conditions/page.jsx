import styles from './terms.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Terms & Conditions | Lansdowne',
};

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        <div className={styles.lastUpdated}>Last updated: January 2026</div>

        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
          <p className={styles.paragraph}>
            By accessing or purchasing from Lansdowne, you agree to be bound by these Terms and Conditions.
          </p>

          <h2 className={styles.sectionHeading}>2. Products and Pricing</h2>
          <p className={styles.paragraph}>
            All product specifications and prices are subject to change without prior notice. We reserve the right to modify or discontinue products.
          </p>

          <h2 className={styles.sectionHeading}>3. Governing Law</h2>
          <p className={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with applicable laws.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
