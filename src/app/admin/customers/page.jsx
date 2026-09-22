'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import adminService from '@/lib/services/admin';
import productStyles from '../products/products.module.css';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminCustomers({ page: 1, limit: 100 });
      setCustomers(Array.isArray(data?.users) ? data.users : []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={productStyles.container}>
      <div className={productStyles.header}>
        <div>
          <h1 className={productStyles.title}>Customers</h1>
          <p className={productStyles.subtitle}>
            {total} signed-up customer{total === 1 ? '' : 's'} from OTP login.
          </p>
        </div>
      </div>

      <div className={productStyles.tableCard}>
        {loading ? (
          <div className={productStyles.loadingState}>Loading customers…</div>
        ) : customers.length === 0 ? (
          <div className={productStyles.emptyState}>
            <Users size={40} className={productStyles.emptyIcon} />
            <h3 className={productStyles.emptyTitle}>No customers yet</h3>
            <p className={productStyles.emptyDesc}>
              Customers appear here after they sign in with mobile OTP.
            </p>
          </div>
        ) : (
          <div className={productStyles.tableWrapper}>
            <table className={productStyles.table}>
              <thead>
                <tr>
                  <th className={productStyles.th}>Name</th>
                  <th className={productStyles.th}>Phone</th>
                  <th className={productStyles.th}>Email</th>
                  <th className={productStyles.th}>Address</th>
                  <th className={productStyles.th}>Signed up</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((user) => (
                  <tr key={user.id} className={productStyles.tr}>
                    <td className={productStyles.td}>
                      <strong>{user.name || '—'}</strong>
                    </td>
                    <td className={productStyles.td}>{user.phone || '—'}</td>
                    <td className={productStyles.td}>
                      {user.email?.includes('@mobile.') ? '—' : user.email || '—'}
                    </td>
                    <td className={productStyles.td} style={{ maxWidth: 260 }}>
                      {user.address || '—'}
                    </td>
                    <td className={productStyles.td}>{formatDate(user.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
