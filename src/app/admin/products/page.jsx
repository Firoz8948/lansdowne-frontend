'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Package,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import adminService from '@/lib/services/admin';
import styles from './products.module.css';

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const data = await adminService.getAdminProducts({
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
      });
      setProducts(Array.isArray(data?.products) ? data.products : []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      fetchProducts(searchInput);
    }, searchInput === '' ? 0 : 350);
    return () => clearTimeout(timer);
  }, [searchInput, fetchProducts]);

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteProduct(productToDelete.id);
      toast.success('Product deleted');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts(searchQuery);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new" className={styles.addBtn}>
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className={styles.toolbarStats}>
          <span className={styles.statPill}>{total} products</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Loading products…</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {searchQuery ? 'No matching products' : 'No products yet'}
            </h3>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? 'Try a different search term.'
                : 'Create your first product listing to start selling.'}
            </p>
            {!searchQuery && (
              <Link href="/admin/products/new" className={styles.addBtn}>
                <Plus size={18} />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Stock</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const thumb = resolveImageUrl(product.images?.[0]);
                  return (
                    <tr key={product.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.productCell}>
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={product.name}
                              className={styles.productThumb}
                            />
                          ) : (
                            <div className={styles.productThumbPlaceholder}>
                              <ImageIcon size={18} />
                            </div>
                          )}
                          <div>
                            <div className={styles.productName}>{product.name}</div>
                            <div className={styles.productMeta}>
                              {product.slug || `ID ${product.id}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        {Array.isArray(product.categories) && product.categories.length
                          ? product.categories.map((c) => c.name).join(', ')
                          : product.category || '—'}
                      </td>
                      <td className={styles.td}>
                        <span className={styles.priceCell}>
                          {formatPrice(product.price)}
                          {product.mrp != null && Number(product.mrp) > Number(product.price) && (
                            <span className={styles.mrpMuted}>{formatPrice(product.mrp)}</span>
                          )}
                        </span>
                      </td>
                      <td className={styles.td}>{product.stock ?? 0}</td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${
                            product.is_active ? styles.badgeActive : styles.badgeInactive
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                            Featured
                          </span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionsCell}>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className={styles.actionBtn}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => openDeleteModal(product)}
                            aria-label={`Delete ${product.name}`}
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

      {deleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !deleting && setDeleteModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete product</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This
              cannot be undone.
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteModalOpen(false)}
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
