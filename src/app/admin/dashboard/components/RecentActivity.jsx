import styles from '../dashboard.module.css';

export default function RecentActivity() {
  return (
    <div className={styles.activityCard}>
      <h2 className={styles.activityTitle}>Recent Activity</h2>
      <div className={styles.emptyState}>
        No recent orders or events yet. Ready to receive brand data.
      </div>
    </div>
  );
}
