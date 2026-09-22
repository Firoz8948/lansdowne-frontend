'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Video, Edit2 } from 'lucide-react';
import adminService from '@/lib/services/admin';
import productStyles from '../products/products.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

const emptyForm = {
  name: '',
  product_id: '',
  position: '0',
  is_active: true,
};

export default function FeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[String(p.id)] = p;
    });
    return map;
  }, [products]);

  const load = async () => {
    try {
      setLoading(true);
      const [feedData, productData] = await Promise.all([
        adminService.getVideoProducts(),
        adminService.getAdminProducts({ limit: 200 }),
      ]);
      setFeeds(Array.isArray(feedData) ? feedData : []);
      const list = Array.isArray(productData?.products)
        ? productData.products
        : Array.isArray(productData)
          ? productData
          : [];
      setProducts(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load catalog feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onProductChange = (productId) => {
    const product = productMap[String(productId)];
    setForm((prev) => ({
      ...prev,
      product_id: productId,
      name: product?.name || prev.name,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setVideoFile(null);
    setEditing(null);
  };

  const startEdit = (feed) => {
    setEditing(feed);
    setForm({
      name: feed.name || '',
      product_id: feed.product_id ? String(feed.product_id) : '',
      position: String(feed.position ?? 0),
      is_active: Boolean(feed.is_active),
    });
    setVideoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildFormData = () => {
    const selected = productMap[String(form.product_id)];
    if (!form.name.trim()) throw new Error('Title is required');
    if (!editing && !videoFile) throw new Error('Please upload a video');
    if (!selected) throw new Error('Please attach a product');

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('price', String(selected.price ?? 0));
    fd.append('mrp', String(selected.mrp ?? selected.price ?? 0));
    fd.append(
      'category',
      selected.category_name || selected.category || selected.categories?.[0]?.name || 'General'
    );
    fd.append('description', selected.description || '');
    fd.append('stock', String(selected.stock ?? 0));
    fd.append('unit', selected.unit || 'piece');
    fd.append('position', String(Number(form.position) || 0));
    fd.append('is_active', String(Boolean(form.is_active)));
    fd.append('product_id', String(selected.id));
    if (videoFile) fd.append('video', videoFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const fd = buildFormData();
      if (editing) {
        await adminService.updateVideoProduct(editing.id, fd);
        toast.success('Feed updated');
      } else {
        await adminService.createVideoProduct(fd);
        toast.success('Feed added to Watch & Shop');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save feed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (feed) => {
    try {
      const fd = new FormData();
      fd.append('is_active', String(!feed.is_active));
      await adminService.updateVideoProduct(feed.id, fd);
      toast.success(feed.is_active ? 'Hidden from Watch & Shop' : 'Visible on Watch & Shop');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update feed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteVideoProduct(deleteTarget.id);
      toast.success('Feed deleted');
      if (editing?.id === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete feed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={productStyles.container}>
      <div className={productStyles.header}>
        <div>
          <h1 className={productStyles.title}>Catalog Feeds</h1>
          <p className={productStyles.subtitle}>
            Upload videos, attach a product, and they appear on Watch & Shop.
          </p>
        </div>
      </div>

      <form className={productStyles.formSection} onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <h2 className={productStyles.sectionTitle}>
          {editing ? `Edit feed — ${editing.name}` : 'Add feed'}
        </h2>

        <div className={productStyles.formRow}>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>Title</label>
            <input
              className={productStyles.formInput}
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Video title"
              required
            />
          </div>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>Attach product</label>
            <select
              className={productStyles.formInput}
              value={form.product_id}
              onChange={(e) => onProductChange(e.target.value)}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={productStyles.formRow}>
          <div className={productStyles.formGroup}>
            <label className={productStyles.formLabel}>
              Video {editing ? '(optional — leave empty to keep current)' : ''}
            </label>
            <input
              className={productStyles.formInput}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateForm('is_active', e.target.checked)}
            />
            Show on Watch & Shop
          </label>
          <button type="submit" className={productStyles.addBtn} disabled={submitting}>
            <Plus size={18} />
            {submitting ? 'Saving…' : editing ? 'Update Feed' : 'Add Feed'}
          </button>
          {editing && (
            <button type="button" className={productStyles.cancelBtn} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={productStyles.tableCard}>
        {loading ? (
          <div className={productStyles.loadingState}>Loading feeds…</div>
        ) : feeds.length === 0 ? (
          <div className={productStyles.emptyState}>
            <Video size={40} className={productStyles.emptyIcon} />
            <h3 className={productStyles.emptyTitle}>No feeds yet</h3>
            <p className={productStyles.emptyDesc}>
              Add a video and attach a product to show it on Watch & Shop.
            </p>
          </div>
        ) : (
          <div className={productStyles.tableWrapper}>
            <table className={productStyles.table}>
              <thead>
                <tr>
                  <th className={productStyles.th}>Feed</th>
                  <th className={productStyles.th}>Attached product</th>
                  <th className={productStyles.th}>Order</th>
                  <th className={productStyles.th}>Status</th>
                  <th className={productStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeds.map((feed) => {
                  const attached = productMap[String(feed.product_id)];
                  return (
                    <tr key={feed.id} className={productStyles.tr}>
                      <td className={productStyles.td}>
                        <strong>{feed.name}</strong>
                        {feed.video_url && (
                          <div style={{ marginTop: 6 }}>
                            <a
                              href={resolveUrl(feed.video_url)}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.8rem', color: '#64748b' }}
                            >
                              View video
                            </a>
                          </div>
                        )}
                      </td>
                      <td className={productStyles.td}>
                        {attached?.name || (feed.product_id ? `Product #${feed.product_id}` : '—')}
                      </td>
                      <td className={productStyles.td}>{feed.position ?? 0}</td>
                      <td className={productStyles.td}>
                        <button
                          type="button"
                          className={`${productStyles.badge} ${
                            feed.is_active
                              ? productStyles.badgeActive
                              : productStyles.badgeInactive
                          }`}
                          onClick={() => toggleActive(feed)}
                        >
                          {feed.is_active ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className={productStyles.td}>
                        <div className={productStyles.actionsCell}>
                          <button
                            type="button"
                            className={productStyles.actionBtn}
                            onClick={() => startEdit(feed)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${productStyles.actionBtn} ${productStyles.actionBtnDelete}`}
                            onClick={() => setDeleteTarget(feed)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <h2 className={productStyles.modalTitle}>Delete feed?</h2>
              <button
                type="button"
                className={productStyles.modalCloseBtn}
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={productStyles.modalBody}>
              Delete <strong>{deleteTarget.name}</strong> from Watch & Shop?
            </div>
            <div className={productStyles.modalFooter}>
              <button
                type="button"
                className={productStyles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
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
