import styles from '../dashboard.module.css';

export default function StatsCard({ label, value }) {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsLabel}>{label}</div>
      <div className={styles.statsValue}>{value}</div>
    </div>
  );
}
