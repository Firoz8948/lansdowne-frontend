import styles from './home.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import {
  Hero,
  CategoryShowcase,
  ProductShowcase,
  WhyChooseUs,
  ReviewsShowcase,
  Newsletter,
} from './components';

export default function HomeScreen() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Hero />
        <CategoryShowcase />
        <ProductShowcase />
        <WhyChooseUs />
        <ReviewsShowcase />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
