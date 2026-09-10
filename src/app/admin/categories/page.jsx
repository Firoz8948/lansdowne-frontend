'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Folder,
  Image as ImageIcon,
  X,
  Upload,
  CheckCircle,
  XCircle,
  Layers,
} from 'lucide-react';
import adminService from '@/lib/services/admin';
import styles from './categories.module.css';

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const fileInputRef = useRef(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.slug && cat.slug.toLowerCase().includes(query)) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setPosition(categories.length);
    setIsActive(true);
    setSeoTitle('');
    setSeoDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setImageFile(null);
    setImagePreview(resolveImageUrl(cat.image_url) || '');
    setPosition(cat.position ?? 0);
    setIsActive(cat.is_active ?? true);
    setSeoTitle(cat.seo_title || '');
    setSeoDescription(cat.seo_description || '');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        position: Number(position) || 0,
        is_active: Boolean(isActive),
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
      };

      let savedCat;
      if (editingCategory) {
        savedCat = await adminService.updateCategory(editingCategory.id, payload);
        toast.success(`Category "${name}" updated!`);
      } else {
        savedCat = await adminService.createCategory(payload);
        toast.success(`Category "${name}" created!`);
      }

      // If an image file was selected, upload it
      if (imageFile && savedCat?.id) {
        try {
          await adminService.uploadCategoryImage(savedCat.id, imageFile);
          toast.success('Category image uploaded!');
        } catch (uploadErr) {
          toast.error(`Image upload failed: ${uploadErr.message}`);
        }
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const newStatus = !cat.is_active;
      await adminService.updateCategory(cat.id, { is_active: newStatus });
      toast.success(`Category "${cat.name}" is now ${newStatus ? 'active' : 'inactive'}`);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: newStatus } : c))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const openDeleteModal = (cat) => {
    if (cat.is_reels) {
      toast.error('The default Reels category cannot be deleted.');
      return;
    }
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" deleted.`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>
            Organize and manage your product categories displayed on the storefront and home page.
          </p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* ── Toolbar: Search & Quick Stats ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.toolbarStats}>
          <span className={styles.statPill}>Total: {categories.length}</span>
          <span className={styles.statPill}>
            Active: {categories.filter((c) => c.is_active).length}
          </span>
        </div>
      </div>

      {/* ── Categories Table ── */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrapper}>Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className={styles.emptyState}>
            <Folder size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {searchQuery ? 'No matching categories' : 'No categories found'}
            </h3>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Get started by creating your first product category.'}
            </p>
            {!searchQuery && (
              <button className={styles.addBtn} onClick={openAddModal}>
                <Plus size={18} />
                <span>Create Category</span>
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th}>Products</th>
                  <th className={styles.th}>Position</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const resolvedImg = resolveImageUrl(cat.image_url);
                  return (
                    <tr key={cat.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.categoryCell}>
                          <div className={styles.categoryThumb}>
                            {resolvedImg ? (
                              <img
                                src={resolvedImg}
                                alt={cat.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                          </div>
                          <div className={styles.categoryInfo}>
                            <span className={styles.categoryName}>{cat.name}</span>
                            <span className={styles.categorySlug}>/{cat.slug}</span>
                          </div>
                          {cat.is_reels && (
                            <span className={`${styles.badge} ${styles.badgeReels}`}>Reels</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {cat.description
                            ? cat.description.length > 50
                              ? `${cat.description.substring(0, 50)}...`
                              : cat.description
                            : '—'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 600 }}>{cat.product_count ?? 0}</span>
                      </td>
                      <td className={styles.td}>{cat.position ?? 0}</td>
                      <td className={styles.td}>
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          title="Click to toggle status"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <span
                            className={`${styles.badge} ${
                              cat.is_active ? styles.badgeActive : styles.badgeInactive
                            }`}
                          >
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          {!cat.is_reels && (
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              onClick={() => openDeleteModal(cat)}
                              title="Delete Category"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
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

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Category Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leather Wallets, Signature Bags"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    placeholder="Short description for storefront showcases and SEO..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category Image</label>
                  <div
                    className={styles.imagePicker}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={22} style={{ color: '#64748b', marginBottom: 4 }} />
                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                      Click to upload category image
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      PNG, JPG, WEBP up to 5MB
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {imagePreview && (
                    <div className={styles.previewContainer}>
                      <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={handleRemoveImage}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>
                      Or enter image URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (!imageFile) setImagePreview(e.target.value);
                      }}
                      className={styles.formInput}
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Display Position / Order</label>
                    <input
                      type="number"
                      min="0"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                    <label className={styles.toggleLabel} style={{ marginTop: 22 }}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className={styles.toggleCheckbox}
                      />
                      <span>Active on storefront</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>SEO Title</label>
                    <input
                      type="text"
                      placeholder="Custom page title"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>SEO Description</label>
                    <input
                      type="text"
                      placeholder="Meta description"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.btnSubmit}>
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && categoryToDelete && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModalOpen(false)}>
          <div
            className={styles.modal}
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete Category</h2>
              <button className={styles.modalCloseBtn} onClick={() => setDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteConfirmText}>
                Are you sure you want to delete <strong>"{categoryToDelete.name}"</strong>?
                {categoryToDelete.product_count > 0 && (
                  <span style={{ display: 'block', marginTop: 8, color: '#b91c1c' }}>
                    Note: {categoryToDelete.product_count} product(s) currently belong to this
                    category. Their category assignment will be unlinked.
                  </span>
                )}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                className={styles.btnDeleteConfirm}
                onClick={handleDeleteConfirm}
              >
                {deleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
