'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Layers } from 'lucide-react';
import adminService from '@/lib/services/admin';
import styles from '../products/products.module.css';

export default function MetafieldsPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const data = await adminService.getMetafieldDefinitions();
      setFields(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load metafields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Field name is required');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.createMetafieldDefinition(name.trim());
      toast.success('Metafield created');
      setName('');
      fetchFields();
    } catch (err) {
      toast.error(err.message || 'Failed to create metafield');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (field) => {
    try {
      await adminService.updateMetafieldDefinition(field.id, {
        is_active: !field.is_active,
      });
      toast.success(field.is_active ? 'Metafield deactivated' : 'Metafield activated');
      fetchFields();
    } catch (err) {
      toast.error(err.message || 'Failed to update metafield');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteMetafieldDefinition(deleteTarget.id);
      toast.success('Metafield deleted');
      setDeleteTarget(null);
      fetchFields();
    } catch (err) {
      toast.error(err.message || 'Failed to delete metafield');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Metafields</h1>
          <p className={styles.subtitle}>
            Define product page sections. Active fields appear on every product form.
          </p>
        </div>
      </div>

      <form className={styles.formSection} onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <h2 className={styles.sectionTitle}>Add metafield</h2>
        <p className={styles.sectionHint}>
          Examples: How To Use, How To Clean, Care Tips, FAQ, Product Details
        </p>
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.formLabel}>Field name</label>
            <input
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. How To Use"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.addBtn} disabled={submitting}>
              <Plus size={18} />
              {submitting ? 'Adding…' : 'Add Field'}
            </button>
          </div>
        </div>
      </form>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Loading metafields…</div>
        ) : fields.length === 0 ? (
          <div className={styles.emptyState}>
            <Layers size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No metafields yet</h3>
            <p className={styles.emptyDesc}>
              Create fields above — they will show up on all product create/edit forms.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Key</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{field.name}</strong>
                    </td>
                    <td className={styles.td}>
                      <code style={{ fontSize: '0.8rem', color: '#64748b' }}>{field.key}</code>
                    </td>
                    <td className={styles.td}>
                      <button
                        type="button"
                        className={`${styles.badge} ${
                          field.is_active ? styles.badgeActive : styles.badgeInactive
                        }`}
                        onClick={() => toggleActive(field)}
                        style={{ cursor: 'pointer', border: undefined }}
                      >
                        {field.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => setDeleteTarget(field)}
                          aria-label={`Delete ${field.name}`}
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
              <h2 className={styles.modalTitle}>Delete metafield</h2>
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
              Delete <strong>{deleteTarget.name}</strong>? Existing product values for this field
              will remain in the database but the field will no longer appear on forms.
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
