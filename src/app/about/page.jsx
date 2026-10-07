import styles from './about.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';
import { Shield, Gem, Leaf, Heart } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About Us | Lansdowne Leather – Genuine Leather Goods from Uttarakhand',
  description:
    'Handpicked genuine leather wallets, bags and belts from the hills of Uttarakhand. Born in Lansdowne, inspired by mountains, crafted for everyday journeys.',
  path: '/about',
});

const values = [
  {
    icon: Gem,
    title: 'Uncompromising Quality',
    desc: 'Every wallet, bag and belt is made of genuine leather and is checked by hand at our store in Lansdowne before it is packed and dispatched.',
  },
  {
    icon: Shield,
    title: 'A Real Business You Can Reach',
    desc: 'Lansdowne Leather is run by JBS and Co from Sadar Bazaar, Lansdowne. Call us, email us or message us on WhatsApp, and a member of our team will answer.',
  },
  {
    icon: Leaf,
    title: 'Clear, Honest Policies',
    desc: 'Free shipping on prepaid orders, a flat ₹99 charge for Cash on Delivery, and 7-day returns on unused products. No hidden charges.',
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
              Handpicked leather goods from the hills of Uttarakhand.
            </p>
            <p className={styles.paragraph}>
              Born in Lansdowne, Uttarakhand. Inspired by mountains. Crafted for everyday journeys.
            </p>
            <p className={styles.paragraph}>
              Lansdowne Leather is the online store of JBS and Co, a leather goods business in Sadar
              Bazaar, Lansdowne. We sell genuine leather wallets, card holders, handbags, sling
              bags, laptop bags and belts for men and women, and ship them to customers across
              India.
            </p>
            <p className={styles.paragraph}>
              <strong>JBS and Co (Lansdowne Leather)</strong>
              <br />
              Sadar Bazaar, Lansdowne, Uttarakhand 246155, India
              <br />
              GSTIN: 05AUDPK1669E1ZU
              <br />
              Phone / WhatsApp: <a href="tel:+918979543500">+91 89795 43500</a>
              <br />
              Email: <a href="mailto:lansdowneleather1@gmail.com">lansdowneleather1@gmail.com</a>
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
                  <h4 className={styles.whyItemTitle}>Carefully Selected</h4>
                  <p className={styles.whyItemDesc}>
                    Every product is chosen and checked by us before it earns a place in our collection. We believe in quality over quantity.
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
