import styles from './about.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'About Us | Lansdowne',
  description: 'Our story and brand mission',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>About Lansdowne</h1>
        <p className={styles.lead}>
          Crafted with passion, designed for everyday distinction.
        </p>

        <div className={styles.contentCard}>
          <h2 className={styles.sectionHeading}>Our Story</h2>
          <p className={styles.paragraph}>
            Brand story and heritage content will be placed here.
          </p>

          <h2 className={styles.sectionHeading}>Quality & Craftsmanship</h2>
          <p className={styles.paragraph}>
            Information on craftsmanship, material standards, and customer commitment.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
