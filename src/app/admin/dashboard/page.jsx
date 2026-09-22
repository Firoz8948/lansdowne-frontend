'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/lib/services/admin';
import styles from './dashboard.module.css';
import { StatsCard, RecentActivity } from './components';

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Overview</h1>

      <div className={styles.statsGrid}>
        <StatsCard
          label="Total Orders"
          value={loading ? '…' : String(stats?.total_orders ?? 0)}
        />
        <StatsCard
          label="Total Revenue"
          value={loading ? '…' : formatPrice(stats?.total_revenue ?? 0)}
        />
        <StatsCard
          label="Active Products"
          value={loading ? '…' : String(stats?.active_products ?? stats?.total_products ?? 0)}
        />
        <StatsCard
          label="Customers"
          value={loading ? '…' : String(stats?.total_customers ?? 0)}
        />
      </div>

      <RecentActivity orders={stats?.recent_orders || []} loading={loading} />
    </div>
  );
}
