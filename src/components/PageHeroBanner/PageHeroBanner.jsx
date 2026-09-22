import Link from 'next/link';
import styles from './pagehero.module.css';

export default function PageHeroBanner({ title, subtitle, backLabel, backHref }) {
  return (
    <section className={styles.heroBanner}>
      <div className={styles.heroBg} aria-hidden="true" />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroInner}>
        {backLabel && backHref && (
          <Link href={backHref} className={styles.backLink}>
            ← {backLabel}
          </Link>
        )}
        <div className={styles.accentLine} />
        <h1 className={styles.heroTitle}>{title}</h1>
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
      </div>
    </section>
  );
}
