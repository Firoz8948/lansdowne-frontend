import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from '../home.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      {/* ================= LEFT HALF: Branded Leather Copy & Texture ================= */}
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
            Branded Leather
            <br />
            <em className={styles.heroTitleItalic}>Essentials</em>
          </h1>

          <p className={styles.heroSubtitle}>
            Handcrafted with precision from authentic leather. 
            Timeless distinction, effortless sophistication.
          </p>
        </div>
      </div>

      {/* ================= RIGHT HALF: Model Showcase & Shop Now CTA ================= */}
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
          <Link href="/shop" className={styles.shopNowBtn}>
            <span>Shop Now</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
