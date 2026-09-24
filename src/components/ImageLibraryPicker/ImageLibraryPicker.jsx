'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import adminService from '@/lib/services/admin';
import styles from './ImageLibraryPicker.module.css';

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';

export default function ImageLibraryPicker({
  productId = null,
  open,
  onClose,
  onSelect,
  multi = true,
  title = 'Choose photos',
  allowUpload = true,
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sameProduct, setSameProduct] = useState([]);
  const [others, setOthers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const refreshLibrary = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProductMediaLibrary({
        product_id: productId || undefined,
        limit: 200,
      });
      setSameProduct(data?.same_product || []);
      setOthers(data?.others || []);
    } catch {
      setSameProduct([]);
      setOthers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    let mounted = true;
    setSelected([]);
    setUploadError('');
    setLoading(true);
    adminService
      .getProductMediaLibrary({ product_id: productId || undefined, limit: 200 })
      .then((data) => {
        if (!mounted) return;
        setSameProduct(data?.same_product || []);
        setOthers(data?.others || []);
      })
      .catch(() => {
        if (!mounted) return;
        setSameProduct([]);
        setOthers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, productId]);

  if (!open) return null;

  const toggle = (url) => {
    setSelected((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (!multi) return [url];
      return [...prev, url];
    });
  };

  const handleLocalUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!files.length) return;

    const valid = files.filter((f) => ACCEPT.split(',').some((t) => f.type === t));
    if (!valid.length) {
      setUploadError('Please upload PNG, JPG, WEBP, or GIF images');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      let newUrls = [];

      if (productId) {
        const before = new Set([
          ...sameProduct.map((i) => i.url),
          ...others.map((i) => i.url),
        ]);
        const updated = await adminService.uploadProductImages(productId, valid);
        const all = Array.isArray(updated?.images) ? updated.images : [];
        newUrls = all.filter((u) => u && !before.has(u));
        await refreshLibrary();
      } else {
        const loose = await adminService.uploadLooseImages(valid);
        newUrls = loose?.urls || [];
        setSameProduct((prev) => {
          const have = new Set(prev.map((p) => p.url));
          const extra = newUrls
            .filter((u) => !have.has(u))
            .map((url) => ({ url, product_name: 'Just uploaded' }));
          return [...extra, ...prev];
        });
      }

      if (!newUrls.length) {
        setUploadError('Upload finished but no image URLs were returned');
        return;
      }

      setSelected((prev) => {
        if (!multi) return [newUrls[0]];
        const next = [...prev];
        newUrls.forEach((u) => {
          if (!next.includes(u)) next.push(u);
        });
        return next;
      });
    } catch (err) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const renderGrid = (items, emptyText) => {
    if (!items.length) {
      return <p className={styles.empty}>{emptyText}</p>;
    }
    return (
      <div className={styles.grid}>
        {items.map((item) => {
          const active = selected.includes(item.url);
          return (
            <button
              key={item.url}
              type="button"
              className={`${styles.thumb} ${active ? styles.thumbActive : ''}`}
              onClick={() => toggle(item.url)}
              title={item.product_name || ''}
            >
              <img src={item.url} alt="" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
        <div className={styles.body}>
          {loading ? (
            <p className={styles.empty}>Loading CDN library…</p>
          ) : (
            <>
              <h4 className={styles.sectionLabel}>From CDN library</h4>
              <h4 className={styles.sectionSubLabel}>This product</h4>
              {renderGrid(sameProduct, 'No images for this product yet.')}
              <h4 className={styles.sectionSubLabel}>All products</h4>
              {renderGrid(others, 'No other product images found.')}
            </>
          )}

          {allowUpload && (
            <div className={styles.uploadSection}>
              <h4 className={styles.sectionLabel}>Or upload from computer</h4>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple={multi}
                className={styles.hiddenInput}
                onChange={handleLocalUpload}
              />
              <button
                type="button"
                className={styles.uploadZone}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                <span>
                  {uploading
                    ? 'Uploading to CDN…'
                    : 'Choose files to upload (PNG, JPG, WEBP, GIF)'}
                </span>
              </button>
              {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
              <p className={styles.uploadHint}>
                Uploaded files go to Bunny CDN (when configured) and are selected
                automatically below.
              </p>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!selected.length || uploading}
            onClick={() => {
              onSelect?.(selected);
              onClose?.();
            }}
          >
            Add selected ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
