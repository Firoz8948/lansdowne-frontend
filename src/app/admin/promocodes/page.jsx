'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, TicketPercent } from 'lucide-react';
import adminService from '@/lib/services/admin';
import styles from '../products/products.module.css';

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  code: '',
  action_type: 'percent_off',
  percent_value: '10',
  valid_from: todayISO(),
  valid_to: todayISO(),
  audience: 'all',
  max_uses: '',
  is_active: true,
};

export default function PromoCodesPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPromoCodes();
      setPromos(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (code.length < 2) {
      toast.error('Enter a promo code');
      return;
    }
    if (form.valid_to < form.valid_from) {
      toast.error('End date must be on or after start date');
      return;
    }
    if (form.action_type === 'percent_off') {
      const pct = Number(form.percent_value);
      if (!pct || pct < 1 || pct > 100) {
        toast.error('Percent off must be between 1 and 100');
        return;
      }
    }

    const payload = {
      code,
      action_type: form.action_type,
      percent_value:
        form.action_type === 'percent_off' ? Number(form.percent_value) : null,
      valid_from: form.valid_from,
      valid_to: form.valid_to,
      audience: form.audience,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: Boolean(form.is_active),
    };

    try {
      setSubmitting(true);
      await adminService.createPromoCode(payload);
      toast.success('Promo code created');
      setForm({ ...emptyForm, valid_from: todayISO(), valid_to: todayISO() });
      fetchPromos();
    } catch (err) {
      toast.error(err.message || 'Failed to create promo code');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (promo) => {
    try {
      await adminService.updatePromoCode(promo.id, { is_active: !promo.is_active });
      toast.success(promo.is_active ? 'Promo deactivated' : 'Promo activated');
      fetchPromos();
    } catch (err) {
      toast.error(err.message || 'Failed to update promo');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deletePromoCode(deleteTarget.id);
      toast.success('Promo code deleted');
      setDeleteTarget(null);
      fetchPromos();
    } catch (err) {
      toast.error(err.message || 'Failed to delete promo');
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = useMemo(
    () => promos.filter((p) => p.is_active).length,
    [promos]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Promo Codes</h1>
          <p className={styles.subtitle}>
            Create discount or free-shipping codes for checkout. {activeCount} active.
          </p>
        </div>
      </div>

      <form className={styles.formSection} onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <h2 className={styles.sectionTitle}>Create promo code</h2>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Code</label>
            <input
              className={styles.formInput}
              value={form.code}
              onChange={(e) => updateForm('code', e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Type</label>
            <select
              className={styles.formInput}
              value={form.action_type}
              onChange={(e) => updateForm('action_type', e.target.value)}
            >
              <option value="percent_off">Percent off</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </div>
          {form.action_type === 'percent_off' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Percent (%)</label>
              <input
                className={styles.formInput}
                type="number"
                min="1"
                max="100"
                value={form.percent_value}
                onChange={(e) => updateForm('percent_value', e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Valid from</label>
            <input
              className={styles.formInput}
              type="date"
              value={form.valid_from}
              onChange={(e) => updateForm('valid_from', e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Valid to</label>
            <input
              className={styles.formInput}
              type="date"
              value={form.valid_to}
              onChange={(e) => updateForm('valid_to', e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Audience</label>
            <select
              className={styles.formInput}
              value={form.audience}
              onChange={(e) => updateForm('audience', e.target.value)}
            >
              <option value="all">All customers</option>
              <option value="new_users">New customers only</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Max uses (optional)</label>
            <input
              className={styles.formInput}
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(e) => updateForm('max_uses', e.target.value)}
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateForm('is_active', e.target.checked)}
            />
            Active immediately
          </label>
          <button type="submit" className={styles.addBtn} disabled={submitting}>
            <Plus size={18} />
            {submitting ? 'Creating…' : 'Create Promo'}
          </button>
        </div>
      </form>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Loading promo codes…</div>
        ) : promos.length === 0 ? (
          <div className={styles.emptyState}>
            <TicketPercent size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No promo codes yet</h3>
            <p className={styles.emptyDesc}>
              Create a code above — customers can apply it at checkout.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Code</th>
                  <th className={styles.th}>Offer</th>
                  <th className={styles.th}>Validity</th>
                  <th className={styles.th}>Audience</th>
                  <th className={styles.th}>Usage</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{promo.code}</strong>
                    </td>
                    <td className={styles.td}>{promo.action_label}</td>
                    <td className={styles.td}>
                      {promo.valid_from} → {promo.valid_to}
                    </td>
                    <td className={styles.td}>
                      {promo.audience === 'new_users' ? 'New customers' : 'All'}
                    </td>
                    <td className={styles.td}>
                      {promo.uses_count || 0}
                      {promo.max_uses != null ? ` / ${promo.max_uses}` : ''}
                    </td>
                    <td className={styles.td}>
                      <button
                        type="button"
                        className={`${styles.badge} ${
                          promo.is_active ? styles.badgeActive : styles.badgeInactive
                        }`}
                        onClick={() => toggleActive(promo)}
                      >
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => setDeleteTarget(promo)}
                          aria-label={`Delete ${promo.code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => !deleting && setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete promo?</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              Delete <strong>{deleteTarget.code}</strong>? This cannot be undone.
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
