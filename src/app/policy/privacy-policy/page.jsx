import styles from './privacy.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Privacy Policy | Lansdowne',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <div className={styles.lastUpdated}>Last updated: January 2026</div>

        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Information We Collect</h2>
          <p className={styles.paragraph}>
            We collect personal information such as name, phone number, shipping address, and email when you place an order or contact customer support.
          </p>

          <h2 className={styles.sectionHeading}>2. How We Use Information</h2>
          <p className={styles.paragraph}>
            Information collected is strictly used to fulfill customer orders, send tracking notifications, and improve store services.
          </p>

          <h2 className={styles.sectionHeading}>3. Data Security</h2>
          <p className={styles.paragraph}>
            We implement industry-standard encryption and security protocols to safeguard customer data.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
