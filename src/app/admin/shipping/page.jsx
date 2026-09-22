'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Truck, Edit2 } from 'lucide-react';
import adminService from '@/lib/services/admin';
import { INDIAN_STATES } from '@/app/checkout/checkoutUtils';
import productStyles from '../products/products.module.css';
import styles from './shipping.module.css';

const emptyForm = {
  name: '',
  is_all_india: false,
  states: [],
  prepaid_rate: '49',
  cod_rate: '59',
  free_shipping_threshold: '',
  is_active: true,
  position: '0',
};

function formatInr(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function ShippingPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await adminService.getShippingZones();
      setZones(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load shipping zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleState = (state) => {
    setForm((prev) => {
      const exists = prev.states.includes(state);
      return {
        ...prev,
        states: exists
          ? prev.states.filter((s) => s !== state)
          : [...prev.states, state],
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingZone(null);
  };

  const startEdit = (zone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name || '',
      is_all_india: Boolean(zone.is_all_india),
      states: Array.isArray(zone.states) ? [...zone.states] : [],
      prepaid_rate: String(zone.prepaid_rate ?? zone.rate ?? 49),
      cod_rate: String(zone.cod_rate ?? zone.prepaid_rate ?? zone.rate ?? 49),
      free_shipping_threshold:
        zone.free_shipping_threshold != null ? String(zone.free_shipping_threshold) : '',
      is_active: Boolean(zone.is_active),
      position: String(zone.position ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPayload = () => {
    const prepaid = Number(form.prepaid_rate);
    const cod = Number(form.cod_rate);
    if (!form.name.trim()) {
      throw new Error('Zone name is required');
    }
    if (Number.isNaN(prepaid) || prepaid < 0) {
      throw new Error('Enter a valid prepaid rate');
    }
    if (Number.isNaN(cod) || cod < 0) {
      throw new Error('Enter a valid COD rate');
    }
    if (!form.is_all_india && form.states.length === 0) {
      throw new Error('Select at least one state, or enable All over India');
    }

    return {
      name: form.name.trim(),
      is_all_india: Boolean(form.is_all_india),
      states: form.is_all_india ? [] : form.states,
      prepaid_rate: prepaid,
      cod_rate: cod,
      rate: prepaid,
      free_shipping_threshold: form.free_shipping_threshold
        ? Number(form.free_shipping_threshold)
        : null,
      is_active: Boolean(form.is_active),
      position: Number(form.position) || 0,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = buildPayload();
      if (editingZone) {
        await adminService.updateShippingZone(editingZone.id, payload);
        toast.success('Shipping zone updated');
      } else {
        await adminService.createShippingZone(payload);
        toast.success('Shipping zone created');
      }
      resetForm();
      fetchZones();
    } catch (err) {
      toast.error(err.message || 'Failed to save shipping zone');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (zone) => {
    try {
      await adminService.updateShippingZone(zone.id, { is_active: !zone.is_active });
      toast.success(zone.is_active ? 'Zone deactivated' : 'Zone activated');
      fetchZones();
    } catch (err) {
      toast.error(err.message || 'Failed to update zone');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteShippingZone(deleteTarget.id);
      toast.success('Shipping zone deleted');
      if (editingZone?.id === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      fetchZones();
    } catch (err) {
      toast.error(err.message || 'Failed to delete zone');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={productStyles.container}>
      <div className={productStyles.header}>
        <div>
          <h1 className={productStyles.title}>Shipping</h1>
          <p className={productStyles.subtitle}>
            Manage delivery zones with separate prepaid and COD rates per region.
          </p>
        </div>
      </div>

      <form className={productStyles.formSection} onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <h2 className={productStyles.sectionTitle}>
          {editingZone ? `Edit zone — ${editingZone.name}` : 'Add shipping zone'}
        </h2>
        <p className={styles.formHint}>
          Zones match by state at checkout. Use &quot;All over India&quot; as a fallback when no
          state-specific zone matches.
        </p>

        <div className={productStyles.formRow}>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>Zone name</label>
            <input
              className={productStyles.formInput}
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="e.g. North India, Metro cities"
              required
            />
          </div>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>Sort order</label>
            <input
              className={productStyles.formInput}
              type="number"
              min="0"
              value={form.position}
              onChange={(e) => updateForm('position', e.target.value)}
            />
          </div>
        </div>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.is_all_india}
            onChange={(e) => updateForm('is_all_india', e.target.checked)}
          />
          All over India (fallback zone)
        </label>

        {!form.is_all_india && (
          <>
            <label className={productStyles.formLabel}>States in this zone</label>
            <div className={styles.stateGrid}>
              {INDIAN_STATES.map((state) => (
                <label key={state} className={styles.stateOption}>
                  <input
                    type="checkbox"
                    checked={form.states.includes(state)}
                    onChange={() => toggleState(state)}
                  />
                  <span>{state}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <div className={productStyles.formRow} style={{ marginTop: 16 }}>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>Prepaid rate (₹)</label>
            <input
              className={productStyles.formInput}
              type="number"
              min="0"
              step="1"
              value={form.prepaid_rate}
              onChange={(e) => updateForm('prepaid_rate', e.target.value)}
              required
            />
          </div>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>COD rate (₹)</label>
            <input
              className={productStyles.formInput}
              type="number"
              min="0"
              step="1"
              value={form.cod_rate}
              onChange={(e) => updateForm('cod_rate', e.target.value)}
              required
            />
          </div>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>Free shipping above (₹)</label>
            <input
              className={productStyles.formInput}
              type="number"
              min="0"
              step="1"
              value={form.free_shipping_threshold}
              onChange={(e) => updateForm('free_shipping_threshold', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          <label className={styles.checkboxRow} style={{ marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateForm('is_active', e.target.checked)}
            />
            Active
          </label>
          <button type="submit" className={productStyles.addBtn} disabled={submitting}>
            <Plus size={18} />
            {submitting
              ? 'Saving…'
              : editingZone
                ? 'Update Zone'
                : 'Add Zone'}
          </button>
          {editingZone && (
            <button
              type="button"
              className={productStyles.cancelBtn}
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className={productStyles.tableCard}>
        {loading ? (
          <div className={productStyles.loadingState}>Loading shipping zones…</div>
        ) : zones.length === 0 ? (
          <div className={productStyles.emptyState}>
            <Truck size={40} className={productStyles.emptyIcon} />
            <h3 className={productStyles.emptyTitle}>No shipping zones yet</h3>
            <p className={productStyles.emptyDesc}>
              Add a zone above with prepaid and COD rates for each region.
            </p>
          </div>
        ) : (
          <div className={productStyles.tableWrapper}>
            <table className={productStyles.table}>
              <thead>
                <tr>
                  <th className={productStyles.th}>Zone</th>
                  <th className={productStyles.th}>Coverage</th>
                  <th className={productStyles.th}>Prepaid</th>
                  <th className={productStyles.th}>COD</th>
                  <th className={productStyles.th}>Free above</th>
                  <th className={productStyles.th}>Status</th>
                  <th className={productStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id} className={productStyles.tr}>
                    <td className={productStyles.td}>
                      <strong>{zone.name}</strong>
                    </td>
                    <td className={productStyles.td}>
                      <div className={styles.zoneStates}>
                        {zone.is_all_india
                          ? 'All over India'
                          : (zone.states || []).join(', ') || '—'}
                      </div>
                    </td>
                    <td className={`${productStyles.td} ${styles.rateCell}`}>
                      {formatInr(zone.prepaid_rate ?? zone.rate)}
                    </td>
                    <td className={`${productStyles.td} ${styles.rateCell}`}>
                      {formatInr(zone.cod_rate ?? zone.prepaid_rate ?? zone.rate)}
                    </td>
                    <td className={productStyles.td}>
                      {zone.free_shipping_threshold != null
                        ? formatInr(zone.free_shipping_threshold)
                        : '—'}
                    </td>
                    <td className={productStyles.td}>
                      <button
                        type="button"
                        className={`${productStyles.badge} ${
                          zone.is_active ? productStyles.badgeActive : productStyles.badgeInactive
                        }`}
                        onClick={() => toggleActive(zone)}
                      >
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className={productStyles.td}>
                      <div className={productStyles.actionsCell}>
                        <button
                          type="button"
                          className={productStyles.actionBtn}
                          onClick={() => startEdit(zone)}
                          aria-label={`Edit ${zone.name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className={`${productStyles.actionBtn} ${productStyles.actionBtnDelete}`}
                          onClick={() => setDeleteTarget(zone)}
                          aria-label={`Delete ${zone.name}`}
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
        <div
          className={productStyles.modalOverlay}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className={productStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={productStyles.modalHeader}>
              <h2 className={productStyles.modalTitle}>Delete shipping zone?</h2>
              <button
                type="button"
                className={productStyles.modalCloseBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>
            <div className={productStyles.modalBody}>
              Delete <strong>{deleteTarget.name}</strong>? Checkout will use other zones or the
              default rate.
            </div>
            <div className={productStyles.modalFooter}>
              <button
                type="button"
                className={productStyles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={productStyles.deleteConfirmBtn}
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
