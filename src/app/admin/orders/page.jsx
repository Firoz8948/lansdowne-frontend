'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Package, X } from 'lucide-react';
import adminService from '@/lib/services/admin';
import { formatVariantLabel } from '@/app/checkout/checkoutUtils';
import productStyles from '../products/products.module.css';
import styles from './orders.module.css';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminOrders({
        page: 1,
        limit: 50,
        status: statusFilter || undefined,
      });
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      setUpdating(true);
      const updated = await adminService.updateOrderStatus(orderId, nextStatus);
      toast.success(`Order marked ${nextStatus}`);
      setSelected(updated);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={productStyles.container}>
      <div className={productStyles.header}>
        <div>
          <h1 className={productStyles.title}>Orders</h1>
          <p className={productStyles.subtitle}>
            {total} order{total === 1 ? '' : 's'} placed. Click a row to view details and update status.
          </p>
        </div>
        <select
          className={productStyles.formInput}
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className={productStyles.tableCard}>
        {loading ? (
          <div className={productStyles.loadingState}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className={productStyles.emptyState}>
            <Package size={40} className={productStyles.emptyIcon} />
            <h3 className={productStyles.emptyTitle}>No orders yet</h3>
            <p className={productStyles.emptyDesc}>
              Orders will appear here when customers complete checkout.
            </p>
          </div>
        ) : (
          <div className={productStyles.tableWrapper}>
            <table className={productStyles.table}>
              <thead>
                <tr>
                  <th className={productStyles.th}>Order</th>
                  <th className={productStyles.th}>Customer</th>
                  <th className={productStyles.th}>Total</th>
                  <th className={productStyles.th}>Payment</th>
                  <th className={productStyles.th}>Status</th>
                  <th className={productStyles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id || order.order_id}
                    className={`${productStyles.tr} ${styles.clickableRow}`}
                    onClick={() => setSelected(order)}
                  >
                    <td className={productStyles.td}>
                      <strong>{order.order_id}</strong>
                    </td>
                    <td className={productStyles.td}>
                      <div>{order.customer?.name || '—'}</div>
                      <div className={styles.muted}>{order.customer?.phone || ''}</div>
                    </td>
                    <td className={productStyles.td}>{formatPrice(order.total)}</td>
                    <td className={productStyles.td}>
                      <div>{order.payment_method || '—'}</div>
                      <div className={styles.muted}>{order.payment_status || ''}</div>
                    </td>
                    <td className={productStyles.td}>
                      <span className={`${productStyles.badge} ${productStyles.badgeActive}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className={productStyles.td}>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className={productStyles.modalOverlay} onClick={() => setSelected(null)}>
          <div
            className={`${productStyles.modal} ${styles.detailModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={productStyles.modalHeader}>
              <h2 className={productStyles.modalTitle}>Order {selected.order_id}</h2>
              <button
                type="button"
                className={productStyles.modalCloseBtn}
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={productStyles.modalBody}>
              <div className={styles.detailGrid}>
                <div>
                  <h4 className={styles.detailLabel}>Customer</h4>
                  <p>{selected.customer?.name || '—'}</p>
                  <p className={styles.muted}>{selected.customer?.phone || ''}</p>
                  <p className={styles.muted}>{selected.customer?.email || ''}</p>
                </div>
                <div>
                  <h4 className={styles.detailLabel}>Shipping address</h4>
                  <p>{selected.address?.line1}</p>
                  {selected.address?.line2 && <p>{selected.address.line2}</p>}
                  <p>
                    {selected.address?.city}, {selected.address?.state} —{' '}
                    {selected.address?.pincode}
                  </p>
                </div>
                <div>
                  <h4 className={styles.detailLabel}>Payment</h4>
                  <p>
                    {selected.payment_method} · {selected.payment_status}
                  </p>
                  <p>Subtotal: {formatPrice(selected.subtotal)}</p>
                  <p>Shipping: {formatPrice(selected.shipping_charge)}</p>
                  {selected.discount_amount > 0 && (
                    <p>Discount: -{formatPrice(selected.discount_amount)}</p>
                  )}
                  <p>
                    <strong>Total: {formatPrice(selected.total)}</strong>
                  </p>
                </div>
                <div>
                  <h4 className={styles.detailLabel}>Update status</h4>
                  <select
                    className={productStyles.formInput}
                    value={selected.order_status || ''}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(selected.order_id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className={styles.detailLabel} style={{ marginTop: 20 }}>
                Items
              </h4>
              <div className={styles.itemsList}>
                {(selected.items || []).map((item, idx) => {
                  const variantText = formatVariantLabel(item);
                  return (
                    <div key={idx} className={styles.itemRow}>
                      <span>
                        {item.name} × {item.quantity}
                        {variantText ? (
                          <span className={styles.itemVariant}> — {variantText}</span>
                        ) : null}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
