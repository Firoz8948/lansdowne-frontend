import styles from './dashboard.module.css';
import { StatsCard, RecentActivity } from './components';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Overview</h1>
      
      <div className={styles.statsGrid}>
        <StatsCard label="Total Orders" value="0" />
        <StatsCard label="Total Revenue" value="₹0" />
        <StatsCard label="Active Products" value="0" />
        <StatsCard label="Customers" value="0" />
      </div>

      <RecentActivity />
    </div>
  );
}
