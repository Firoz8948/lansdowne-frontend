import styles from './home.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import {
  Hero,
  TrustBar,
  CategoryShowcase,
  WhyChooseUs,
  Newsletter,
} from './components';

export default function HomeScreen() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Hero />
        <CategoryShowcase />
        <WhyChooseUs />
        <Newsletter />
        <TrustBar />
      </main>
      <Footer />
    </div>
  );
}
