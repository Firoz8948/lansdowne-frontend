'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import adminService from '@/lib/services/admin';
import productStyles from '../products/products.module.css';

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

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

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminPayments({ page: 1, limit: 50 });
      setPayments(Array.isArray(data?.payments) ? data.payments : []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load payments');
      setPayments([]);
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
          <h1 className={productStyles.title}>Payments</h1>
          <p className={productStyles.subtitle}>
            {total} payment record{total === 1 ? '' : 's'} from online checkout.
          </p>
        </div>
      </div>

      <div className={productStyles.tableCard}>
        {loading ? (
          <div className={productStyles.loadingState}>Loading payments…</div>
        ) : payments.length === 0 ? (
          <div className={productStyles.emptyState}>
            <CreditCard size={40} className={productStyles.emptyIcon} />
            <h3 className={productStyles.emptyTitle}>No payments yet</h3>
            <p className={productStyles.emptyDesc}>
              Online payments will show here after customers pay at checkout.
            </p>
          </div>
        ) : (
          <div className={productStyles.tableWrapper}>
            <table className={productStyles.table}>
              <thead>
                <tr>
                  <th className={productStyles.th}>Payment ID</th>
                  <th className={productStyles.th}>Gateway ref</th>
                  <th className={productStyles.th}>Amount</th>
                  <th className={productStyles.th}>Status</th>
                  <th className={productStyles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className={productStyles.tr}>
                    <td className={productStyles.td}>
                      <code style={{ fontSize: '0.8rem' }}>{payment.id}</code>
                    </td>
                    <td className={productStyles.td}>
                      <div>{payment.razorpay_payment_id || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {payment.razorpay_order_id || ''}
                      </div>
                    </td>
                    <td className={productStyles.td}>
                      {formatPrice(payment.amount)} {payment.currency || 'INR'}
                    </td>
                    <td className={productStyles.td}>
                      <span
                        className={`${productStyles.badge} ${
                          payment.status === 'captured' ||
                          payment.status === 'success' ||
                          payment.status === 'paid'
                            ? productStyles.badgeActive
                            : productStyles.badgeInactive
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className={productStyles.td}>{formatDate(payment.created_at)}</td>
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
