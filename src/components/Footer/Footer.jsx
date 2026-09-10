import Link from 'next/link';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <div className={styles.brandName}>Lansdowne</div>
          <p className={styles.brandDesc}>
            Curated premium products built for quality, elegance, and distinction.
          </p>
        </div>

        <div>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <div className={styles.linkList}>
            <Link href="/shop" className={styles.link}>
              Shop Collection
            </Link>
            <Link href="/watch-and-shop" className={styles.link}>
              Watch & Shop
            </Link>
            <Link href="/about" className={styles.link}>
              About Us
            </Link>
            <Link href="/contact-us" className={styles.link}>
              Contact Us
            </Link>
          </div>
        </div>

        <div>
          <h3 className={styles.colTitle}>Help & Support</h3>
          <div className={styles.linkList}>
            <Link href="/faqs" className={styles.link}>
              FAQs
            </Link>
            <Link href="/policy/shipping-policy" className={styles.link}>
              Shipping Info
            </Link>
            <Link href="/policy/refund-policy" className={styles.link}>
              Returns & Refunds
            </Link>
          </div>
        </div>

        <div>
          <h3 className={styles.colTitle}>Policies</h3>
          <div className={styles.linkList}>
            <Link href="/policy/privacy-policy" className={styles.link}>
              Privacy Policy
            </Link>
            <Link href="/policy/terms-and-conditions" className={styles.link}>
              Terms & Conditions
            </Link>
            <Link href="/policy" className={styles.link}>
              All Policies
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <span>© {new Date().getFullYear()} Lansdowne. All rights reserved.</span>
        <span>Secure Payments & Fast Delivery</span>
      </div>
    </footer>
  );
}
