import styles from './about.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';
import { Shield, Gem, Leaf, Heart } from 'lucide-react';

export const metadata = {
  title: 'About Us | Lansdowne',
  description:
    'Discover the story behind Lansdowne — a premium Indian brand committed to quality craftsmanship, timeless design, and everyday distinction.',
};

const values = [
  {
    icon: Gem,
    title: 'Uncompromising Quality',
    desc: 'Every Lansdowne product undergoes rigorous quality checks. We source the finest materials and partner with skilled artisans to deliver products that exceed expectations.',
  },
  {
    icon: Shield,
    title: 'Heritage & Trust',
    desc: 'Rooted in the tradition of Indian craftsmanship, we blend heritage techniques with modern aesthetics — building a brand you can trust for years to come.',
  },
  {
    icon: Leaf,
    title: 'Responsible Sourcing',
    desc: 'We are committed to ethical sourcing and sustainable practices. Our supply chain prioritises fair wages, minimal waste, and eco-conscious packaging.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    desc: 'From curated collections to responsive support, everything we do is designed around you. Your satisfaction is the measure of our success.',
  },
];

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="About Lansdowne"
        subtitle="Crafted with passion, designed for everyday distinction."
      />

      <main className={styles.main}>
        {/* ── Our Story ── */}
        <section className={styles.storySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>OUR STORY</h2>
            <p className={styles.sectionSubtitle}>The Story Behind Our Craft</p>
          </div>
          <div className={styles.storyContent}>
            <p className={styles.paragraph}>
              Lansdowne was born from a simple belief: premium quality should not come at a premium price. Founded with the vision of making elegant, well-crafted products accessible to the discerning Indian consumer, we set out to bridge the gap between luxury and everyday living.
            </p>
            <p className={styles.paragraph}>
              What started as a small, passionate endeavour has grown into a curated destination for those who appreciate the finer details — the weight of a well-made product, the precision of its stitching, the richness of its finish. Every item in our collection is handpicked to meet exacting standards of material quality, durability, and design sophistication.
            </p>
            <p className={styles.paragraph}>
              Our name draws inspiration from the serene hill station of Lansdowne in Uttarakhand — a place known for its timeless charm, understated beauty, and enduring character. Like the town itself, our brand stands for quiet confidence, lasting appeal, and an unwavering commitment to excellence.
            </p>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section className={styles.valuesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>OUR VALUES</h2>
            <p className={styles.sectionSubtitle}>What We Stand For</p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <div key={idx} className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <IconComp size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Why Lansdowne ── */}
        <section className={styles.whySection}>
          <div className={styles.whyCard}>
            <div className={styles.sectionHeader}>
              <h2 className={`${styles.sectionTitle} ${styles.sectionTitleOnDark}`}>WHY LANSDOWNE</h2>
              <p className={`${styles.sectionSubtitle} ${styles.sectionSubtitleOnDark}`}>What Sets Us Apart</p>
            </div>
            <div className={styles.whyGrid}>
              <div className={styles.whyItem}>
                <span className={styles.whyNumber}>01</span>
                <div>
                  <h4 className={styles.whyItemTitle}>Curated, Not Mass-Produced</h4>
                  <p className={styles.whyItemDesc}>
                    Every product is carefully selected and tested before it earns a place in our collection. We believe in quality over quantity.
                  </p>
                </div>
              </div>
              <div className={styles.whyItem}>
                <span className={styles.whyNumber}>02</span>
                <div>
                  <h4 className={styles.whyItemTitle}>Direct-to-Consumer Pricing</h4>
                  <p className={styles.whyItemDesc}>
                    By selling directly to you, we eliminate middlemen and pass on the savings — delivering premium quality at honest prices.
                  </p>
                </div>
              </div>
              <div className={styles.whyItem}>
                <span className={styles.whyNumber}>03</span>
                <div>
                  <h4 className={styles.whyItemTitle}>Hassle-Free Experience</h4>
                  <p className={styles.whyItemDesc}>
                    From seamless checkout to swift delivery and easy returns — we have designed every touchpoint to respect your time and trust.
                  </p>
                </div>
              </div>
              <div className={styles.whyItem}>
                <span className={styles.whyNumber}>04</span>
                <div>
                  <h4 className={styles.whyItemTitle}>Built for the Indian Consumer</h4>
                  <p className={styles.whyItemDesc}>
                    Our products are designed for Indian tastes, climates, and lifestyles — with secure Indian payment options and nationwide delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
