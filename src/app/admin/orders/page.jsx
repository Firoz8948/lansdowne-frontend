import styles from './orders.module.css';

export default function AdminOrdersPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Orders Management</h1>
      <div className={styles.card}>
        Customer orders, shipping statuses, and fulfillment actions will be placed here.
      </div>
    </div>
  );
}
