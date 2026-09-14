import Image from 'next/image';
import styles from '../home.module.css';
import ShopNowButton from '@/components/ShopNowButton';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      {/* ================= TOP (MOBILE) / LEFT (DESKTOP): Branded Copy ================= */}
      <div className={styles.heroHalfLeft}>
        <Image
          src="/images/banners/hero_left.webp"
          alt="Branded Leather Texture"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={styles.heroBgImg}
        />
        <div className={styles.heroOverlayLeft}>
          <span className={styles.heroCollectionLabel}>NEW COLLECTION 2026</span>
          <h1 className={styles.heroTitle}>
            BRANDED LEATHER
            <br />
            <em className={styles.heroTitleItalic}>Essentials</em>
          </h1>

          <p className={styles.heroSubtitle}>
            Handcrafted with precision from authentic leather.
            Timeless distinction, effortless sophistication.
          </p>
        </div>
      </div>

      {/* ================= BOTTOM (MOBILE) / RIGHT (DESKTOP): Model & CTA ================= */}
      <div className={styles.heroHalfRight}>
        <Image
          src="/images/banners/hero_right.webp"
          alt="Lansdowne Premium Leather Collection"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={styles.heroBgImg}
        />
        <div className={styles.heroOverlayRight}>
          <ShopNowButton href="/shop" />
        </div>
      </div>
    </section>
  );
}