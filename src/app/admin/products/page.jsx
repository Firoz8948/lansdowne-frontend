import styles from './products.module.css';

export default function AdminProductsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Products Management</h1>
      <div className={styles.card}>
        Product catalog table and creation forms will be placed here.
      </div>
    </div>
  );
}
