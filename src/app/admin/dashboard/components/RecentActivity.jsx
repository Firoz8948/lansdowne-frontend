import styles from '../dashboard.module.css';

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export default function RecentActivity({ orders = [], loading = false }) {
  return (
    <div className={styles.activityCard}>
      <h2 className={styles.activityTitle}>Recent Activity</h2>
      {loading ? (
        <div className={styles.emptyState}>Loading recent orders…</div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          No recent orders or events yet. Ready to receive brand data.
        </div>
      ) : (
        <div className={styles.activityList}>
          {orders.map((order) => (
            <div key={order.id || order.order_id} className={styles.activityItem}>
              <div>
                <strong>{order.order_id}</strong>
                <div className={styles.activityMeta}>
                  {order.customer?.name || 'Customer'} · {order.order_status} ·{' '}
                  {order.payment_status}
                </div>
              </div>
              <div className={styles.activityRight}>
                <div>{formatPrice(order.total)}</div>
                <div className={styles.activityMeta}>{formatDate(order.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
