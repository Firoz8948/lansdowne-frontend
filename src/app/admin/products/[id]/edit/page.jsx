'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import adminService from '@/lib/services/admin';
import ProductColorEditor from '@/components/ProductColorEditor/ProductColorEditor';
import ImageLibraryPicker from '@/components/ImageLibraryPicker/ImageLibraryPicker';
import styles from '../../products.module.css';

const emptyOption = () => ({
  name: '',
  price: '',
  mrp: '',
  stock: '0',
  weight: '',
  hex: '#5c3d2e',
  colors: [],
  image_url: '',
  images: [],
});

const emptyVariant = () => ({
  name: '',
  options: [emptyOption()],
});

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [metafieldDefs, setMetafieldDefs] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [stock, setStock] = useState('0');
  const [unit, setUnit] = useState('piece');
  const [weight, setWeight] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [breadthCm, setBreadthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [metafieldValues, setMetafieldValues] = useState({});
  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [colors, setColors] = useState([]);
  const [siblingIds, setSiblingIds] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [optionLibrary, setOptionLibrary] = useState(null); // { vIndex, oIndex }

  useEffect(() => {
    if (!productId) return;
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [cats, fields, product, productList] = await Promise.all([
          adminService.getCategories(),
          adminService.getMetafieldDefinitions(),
          adminService.getAdminProduct(productId),
          adminService.getAdminProducts({ limit: 100 }),
        ]);
        if (!mounted) return;

        const catList = Array.isArray(cats) ? cats.filter((c) => !c.is_reels) : [];
        setCategories(catList);
        setAllProducts(
          Array.isArray(productList?.products) ? productList.products : []
        );

        const defs = Array.isArray(fields)
          ? fields.filter((f) => f.is_active !== false)
          : [];
        setMetafieldDefs(defs);

        if (!product) {
          toast.error('Product not found');
          router.push('/admin/products');
          return;
        }

        setName(product.name || '');
        setDescription(product.description || '');
        setPrice(product.price != null ? String(product.price) : '');
        setMrp(product.mrp != null ? String(product.mrp) : '');
        const loadedIds = Array.isArray(product.category_ids) && product.category_ids.length
          ? product.category_ids.map(String)
          : product.category_id != null
            ? [String(product.category_id)]
            : [];
        setCategoryIds(loadedIds);
        setStock(product.stock != null ? String(product.stock) : '0');
        setUnit(product.unit || 'piece');
        setWeight(product.weight != null ? String(product.weight) : '');
        setLengthCm(product.length_cm != null ? String(product.length_cm) : '');
        setBreadthCm(product.breadth_cm != null ? String(product.breadth_cm) : '');
        setHeightCm(product.height_cm != null ? String(product.height_cm) : '');
        setIsActive(product.is_active !== false);
        setIsFeatured(Boolean(product.is_featured));
        setColors(
          Array.isArray(product.colors)
            ? product.colors.map((c) => ({
                name: c.name || '',
                hex: c.hex || '#5c3d2e',
              }))
            : []
        );
        setSiblingIds(
          Array.isArray(product.color_siblings)
            ? product.color_siblings
                .filter((s) => String(s.id) !== String(product.id))
                .map((s) => String(s.id))
            : []
        );

        const mf = {};
        defs.forEach((d) => {
          mf[d.key] = product.metafields?.[d.key] || '';
        });
        setMetafieldValues(mf);

        const loadedVariants = (product.variants || []).map((v) => ({
          name: v.name || '',
          options: (v.options || []).map((o) => ({
            name: o.name || '',
            price: o.price != null ? String(o.price) : '',
            mrp: o.mrp != null ? String(o.mrp) : '',
            stock: o.stock != null ? String(o.stock) : '0',
            weight: o.weight != null ? String(o.weight) : '',
            hex: o.hex || (o.colors?.[0]?.hex) || '#5c3d2e',
            colors: Array.isArray(o.colors)
              ? o.colors.map((c) => ({ name: c.name || '', hex: c.hex || '#5c3d2e' }))
              : o.hex
                ? [{ name: o.name || '', hex: o.hex }]
                : [],
            image_url: o.image_url || (Array.isArray(o.images) && o.images[0]) || '',
            images: Array.isArray(o.images) && o.images.length
              ? o.images.filter(Boolean)
              : o.image_url
                ? [o.image_url]
                : [],
          })),
        }));
        setVariants(loadedVariants);

        setExistingImages(
          (product.images || []).map((url) => ({
            url,
            preview: resolveImageUrl(url),
          }))
        );
      } catch (err) {
        toast.error(err.message || 'Failed to load product');
        router.push('/admin/products');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [productId, router]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const addFiles = (files) => {
    const incoming = Array.from(files || []).filter((f) =>
      /\.(jpe?g|png|webp|gif)$/i.test(f.name)
    );
    if (!incoming.length) {
      toast.error('Please upload PNG, JPG, WEBP, or GIF images');
      return;
    }
    setImageFiles((prev) => [...prev, ...incoming]);
    setImagePreviews((prev) => [
      ...prev,
      ...incoming.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
  };

  const removeExistingImage = async (index) => {
    const image = existingImages[index];
    if (!image) return;
    try {
      await adminService.removeProductImage(productId, image.url);
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      toast.success('Image removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove image');
    }
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const updateVariant = (index, patch) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (variantIndex) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, options: [...v.options, emptyOption()] }
          : v
      )
    );
  };

  const updateOption = (variantIndex, optionIndex, patch) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          options: v.options.map((opt, j) => {
            if (j !== optionIndex) return opt;
            const next = { ...opt, ...patch };
            // Keep nested colors[0].name aligned with Option label
            if (
              /colou?r/i.test(v.name || '') &&
              patch.name != null &&
              Array.isArray(next.colors) &&
              next.colors.length
            ) {
              next.colors = next.colors.map((c, ci) =>
                ci === 0 || next.colors.length === 1
                  ? { ...c, name: patch.name }
                  : c
              );
            }
            return next;
          }),
        };
      })
    );
  };

  const removeOption = (variantIndex, optionIndex) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        const options = v.options.filter((_, j) => j !== optionIndex);
        return { ...v, options: options.length ? options : [emptyOption()] };
      })
    );
  };

  const parseNumber = (value, fallback = null) => {
    if (value === '' || value == null) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const buildPayload = () => {
    const metafields = {};
    metafieldDefs.forEach((def) => {
      const val = (metafieldValues[def.key] || '').trim();
      if (val) metafields[def.key] = val;
    });

    const cleanedVariants = variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        name: v.name.trim(),
        options: v.options
          .filter((o) => o.name.trim())
          .map((o) => {
            const isColor = /colou?r/i.test(v.name || '');
            const optionColors =
              Array.isArray(o.colors) && o.colors.length
                ? o.colors
                    .filter((c) => c.hex)
                    .map((c, i) => ({
                      // Option label wins for single-color (avoids stale "Black")
                      name: (
                        (o.colors.length === 1 || i === 0
                          ? o.name
                          : c.name || o.name) || ''
                      ).trim(),
                      hex: c.hex,
                    }))
                : isColor && o.hex
                  ? [{ name: o.name.trim(), hex: o.hex }]
                  : [];
            return {
              name: o.name.trim(),
              price: parseNumber(o.price, 0) ?? 0,
              mrp: parseNumber(o.mrp, 0) ?? 0,
              stock: parseNumber(o.stock, 0) ?? 0,
              weight: parseNumber(o.weight, null),
              hex: isColor ? o.hex || optionColors[0]?.hex || null : null,
              colors: optionColors,
              image_url:
                (Array.isArray(o.images) && o.images[0]) || o.image_url || null,
              images: Array.isArray(o.images)
                ? o.images.filter(Boolean)
                : o.image_url
                  ? [o.image_url]
                  : [],
            };
          }),
      }))
      .filter((v) => v.options.length > 0);

    return {
      name: name.trim(),
      description: description.trim(),
      price: parseNumber(price, 0) ?? 0,
      mrp: parseNumber(mrp, 0) ?? 0,
      category_id: categoryIds[0] ? Number(categoryIds[0]) : null,
      category_ids: categoryIds.map((id) => Number(id)),
      stock: parseNumber(stock, 0) ?? 0,
      unit: unit.trim() || 'piece',
      weight: parseNumber(weight, null),
      length_cm: parseNumber(lengthCm, null),
      breadth_cm: parseNumber(breadthCm, null),
      height_cm: parseNumber(heightCm, null),
      is_featured: isFeatured,
      is_active: isActive,
      metafields,
      variants: cleanedVariants,
      colors: (colors || [])
        .filter((c) => c.hex)
        .map((c) => ({
          name: (c.name || '').trim() || c.hex,
          hex: c.hex,
        })),
      color_sibling_ids: siblingIds.map((id) => Number(id)),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (price === '' || Number(price) < 0) {
      toast.error('Selling price is required');
      return;
    }
    if (mrp === '' || Number(mrp) < 0) {
      toast.error('MRP is required');
      return;
    }
    if (!categoryIds.length) {
      toast.error('Please select at least one category');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.updateProduct(productId, buildPayload());

      if (imageFiles.length > 0) {
        try {
          await adminService.uploadProductImages(productId, imageFiles);
        } catch (imgErr) {
          toast.error(
            imgErr.message ||
              'Product updated, but new image upload failed.'
          );
          router.push('/admin/products');
          return;
        }
      }

      toast.success('Product updated');
      router.push('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading product…</div>
      </div>
    );
  }

  const allPreviews = [
    ...existingImages.map((img, index) => ({
      key: `existing-${img.url}`,
      src: img.preview,
      isMain: index === 0 && imagePreviews.length === 0,
      onRemove: () => removeExistingImage(index),
    })),
    ...imagePreviews.map((src, index) => ({
      key: `new-${src}-${index}`,
      src,
      isMain: existingImages.length === 0 && index === 0,
      onRemove: () => removeNewImage(index),
    })),
  ];

  return (
    <div className={styles.container}>
      <Link href="/admin/products" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className={styles.formPageHeader}>
        <h1 className={styles.formPageTitle}>Edit Product</h1>
        <p className={styles.formPageSubtitle}>Update product details</p>
      </div>

      <form className={styles.formLayout} onSubmit={handleSubmit}>
        <div className={styles.formMain}>
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <p className={styles.sectionHint}>Name and description shown on the storefront.</p>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Product Name <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <p className={styles.formHint}>
                Supports plain text or HTML. You can use HTML for bullet lists and images.
              </p>
              <div className={styles.codeExample}>{`<ul>
  <li>Stylist</li>
  <li>Elegance</li>
</ul>`}</div>
              <textarea
                className={`${styles.formTextarea} ${styles.formTextareaTall}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description…"
              />
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Product Images</h2>
            <p className={styles.sectionHint}>
              Square images recommended (1:1 ratio). First image = main image.
            </p>

            <div
              className={`${styles.imageDropzone} ${dragActive ? styles.imageDropzoneActive : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <Upload size={28} className={styles.imageDropIcon} />
              <div className={styles.imageDropTitle}>Click to upload or drag & drop</div>
              <div className={styles.imageDropHint}>PNG, JPG, WEBP · Square ratio preferred</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </div>

            {allPreviews.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {allPreviews.map((item, index) => (
                  <div key={item.key} className={styles.imagePreviewItem}>
                    <img src={item.src} alt={`Product preview ${index + 1}`} />
                    {(item.isMain || index === 0) && (
                      <span className={styles.imageMainBadge}>Main</span>
                    )}
                    <button
                      type="button"
                      className={styles.imageRemoveBtn}
                      onClick={item.onRemove}
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className={styles.libraryBtn}
              onClick={() => setLibraryOpen(true)}
            >
              Choose from library
            </button>
          </section>

          <section className={styles.formSection}>
            <div className={styles.variantHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Variants</h2>
                <p className={styles.sectionHint} style={{ marginBottom: 0 }}>
                  Add sizes, packs, or Color. Assign photos per option — PDP gallery
                  switches with the selected color.
                </p>
              </div>
              <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
                <Plus size={16} />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className={styles.variantEmpty}>
                <div className={styles.variantEmptyIcon}>🎛️</div>
                No variants added. Click &quot;Add Variant&quot; to create options like Size, Color.
              </div>
            ) : (
              variants.map((variant, vIndex) => (
                <div key={vIndex} className={styles.variantCard}>
                  <div className={styles.variantCardHeader}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Variant name</label>
                      <input
                        className={styles.formInput}
                        value={variant.name}
                        onChange={(e) => updateVariant(vIndex, { name: e.target.value })}
                        placeholder="e.g. Diameter, Size, Pack"
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.variantRemoveBtn}
                      onClick={() => removeVariant(vIndex)}
                      aria-label="Remove variant"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className={styles.optionsList}>
                    {variant.options.map((opt, oIndex) => (
                      <div key={oIndex} className={styles.optionRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Option</label>
                          <input
                            className={styles.formInput}
                            value={opt.name}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, { name: e.target.value })
                            }
                            placeholder="e.g. 12 inch"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Price</label>
                          <input
                            className={styles.formInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={opt.price}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, { price: e.target.value })
                            }
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>MRP</label>
                          <input
                            className={styles.formInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={opt.mrp}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, { mrp: e.target.value })
                            }
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Stock</label>
                          <input
                            className={styles.formInput}
                            type="number"
                            min="0"
                            value={opt.stock}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, { stock: e.target.value })
                            }
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Weight (g)</label>
                          <input
                            className={styles.formInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={opt.weight}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, { weight: e.target.value })
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className={styles.optionRemoveBtn}
                          onClick={() => removeOption(vIndex, oIndex)}
                          aria-label="Remove option"
                        >
                          <Trash2 size={14} />
                        </button>
                        {/colou?r/i.test(variant.name || '') && (
                          <div className={styles.optionColorRow}>
                            <input
                              type="color"
                              className={styles.colorCircle}
                              value={opt.hex || '#5c3d2e'}
                              onChange={(e) =>
                                updateOption(vIndex, oIndex, {
                                  hex: e.target.value,
                                  colors:
                                    Array.isArray(opt.colors) && opt.colors.length > 1
                                      ? [
                                          { ...opt.colors[0], hex: e.target.value },
                                          ...opt.colors.slice(1),
                                        ]
                                      : [
                                          {
                                            name: opt.name || 'Color',
                                            hex: e.target.value,
                                          },
                                        ],
                                })
                              }
                            />
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              onClick={() => {
                                const next = [
                                  ...(Array.isArray(opt.colors) && opt.colors.length
                                    ? opt.colors
                                    : [{ name: opt.name || '', hex: opt.hex || '#5c3d2e' }]),
                                  { name: '', hex: '#c45c26' },
                                ];
                                updateOption(vIndex, oIndex, {
                                  colors: next,
                                  hex: next[0]?.hex || opt.hex,
                                });
                              }}
                            >
                              Multicolor +
                            </button>
                            {(opt.colors || []).length > 1 &&
                              opt.colors.map((c, ci) => (
                                <input
                                  key={ci}
                                  type="color"
                                  className={styles.colorCircle}
                                  value={c.hex || '#5c3d2e'}
                                  onChange={(e) => {
                                    const next = opt.colors.map((x, i) =>
                                      i === ci ? { ...x, hex: e.target.value } : x
                                    );
                                    updateOption(vIndex, oIndex, {
                                      colors: next,
                                      hex: next[0]?.hex,
                                    });
                                  }}
                                />
                              ))}
                          </div>
                        )}
                        <div className={styles.optionImagesRow}>
                          <span className={styles.optionImagesLabel}>
                            Photos for this option
                          </span>
                          <div className={styles.optionImagesThumbs}>
                            {(opt.images || []).map((url, imgIndex) => (
                              <div key={`${url}-${imgIndex}`} className={styles.optionImageThumb}>
                                <img src={resolveImageUrl(url)} alt="" />
                                <button
                                  type="button"
                                  className={styles.optionImageRemove}
                                  aria-label="Remove photo"
                                  onClick={() => {
                                    const next = (opt.images || []).filter(
                                      (_, i) => i !== imgIndex
                                    );
                                    updateOption(vIndex, oIndex, {
                                      images: next,
                                      image_url: next[0] || '',
                                    });
                                  }}
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className={styles.optionImagesAssignBtn}
                              onClick={() => setOptionLibrary({ vIndex, oIndex })}
                            >
                              {(opt.images || []).length ? 'Add photos' : 'Assign photos'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.addOptionBtn}
                    onClick={() => addOption(vIndex)}
                  >
                    + Add option
                  </button>
                </div>
              ))
            )}
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Pricing</h2>
            <p className={styles.sectionHint}>Base selling price and MRP for the product.</p>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Selling Price (₹) <span className={styles.required}>*</span>
                </label>
                <div className={styles.priceInputWrap}>
                  <span className={styles.pricePrefix}>₹</span>
                  <input
                    className={styles.priceInput}
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  MRP (₹) <span className={styles.required}>*</span>
                </label>
                <div className={styles.priceInputWrap}>
                  <span className={styles.pricePrefix}>₹</span>
                  <input
                    className={styles.priceInput}
                    type="number"
                    min="0"
                    step="0.01"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Inventory & Shipping</h2>
            <p className={styles.sectionHint}>Stock and shipping dimensions.</p>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Stock Quantity</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Unit</label>
                <input
                  className={styles.formInput}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="piece"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Weight (grams) — for shipping</label>
              <input
                className={styles.formInput}
                type="number"
                min="0"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className={styles.formRow3}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Length (cm)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  step="0.01"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Breadth (cm)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  step="0.01"
                  value={breadthCm}
                  onChange={(e) => setBreadthCm(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Height (cm)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  step="0.01"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Metafields</h2>
            <p className={styles.sectionHint}>
              Add content for sections shown on the product page (manage field names in Metafields
              menu).
            </p>

            {metafieldDefs.length === 0 ? (
              <div className={styles.metafieldEmpty}>
                No metafields defined yet.{' '}
                <Link href="/admin/metafields">Create metafields</Link> to show extra sections on
                product pages.
              </div>
            ) : (
              metafieldDefs.map((def) => (
                <div key={def.id} className={styles.formGroup}>
                  <label className={styles.formLabel}>{def.name}</label>
                  <textarea
                    className={styles.formTextarea}
                    value={metafieldValues[def.key] || ''}
                    onChange={(e) =>
                      setMetafieldValues((prev) => ({
                        ...prev,
                        [def.key]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${def.name.toLowerCase()}…`}
                  />
                </div>
              ))
            )}
          </section>
        </div>

        <aside className={styles.formSidebar}>
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Categories</h2>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel}>
                Categories <span className={styles.required}>*</span>
              </label>
              <p className={styles.formHint}>
                Select one or more. The first selected is used as the primary category.
              </p>
              <div className={styles.categoryChecklist}>
                {categories.length === 0 ? (
                  <p className={styles.formHint}>No categories yet. Create one first.</p>
                ) : (
                  categories.map((cat) => {
                    const id = String(cat.id);
                    const checked = categoryIds.includes(id);
                    return (
                      <label key={cat.id} className={styles.categoryCheckItem}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setCategoryIds((prev) =>
                              checked
                                ? prev.filter((x) => x !== id)
                                : [...prev, id]
                            );
                          }}
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <ProductColorEditor
            colors={colors}
            onChangeColors={setColors}
            siblingIds={siblingIds}
            onChangeSiblingIds={setSiblingIds}
            allProducts={allProducts}
            currentProductId={productId}
          />

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Product Status</h2>

            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleInfoTitle}>Active</div>
                <div className={styles.toggleInfoDesc}>Visible on website</div>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleInfoTitle}>Featured</div>
                <div className={styles.toggleInfoDesc}>Show on home page</div>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </section>

          <div className={styles.formActions}>
            <Link href="/admin/products" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </aside>
      </form>

      <ImageLibraryPicker
        open={libraryOpen}
        productId={productId ? Number(productId) : null}
        onClose={() => setLibraryOpen(false)}
        onSelect={async (urls) => {
          try {
            await adminService.attachProductImageUrls(productId, urls);
            setExistingImages((prev) => {
              const have = new Set(prev.map((p) => p.url));
              const next = [...prev];
              urls.forEach((url) => {
                if (!have.has(url)) {
                  next.push({ url, preview: resolveImageUrl(url) });
                }
              });
              return next;
            });
            toast.success('Images added from library');
          } catch (err) {
            toast.error(err.message || 'Failed to attach images');
          }
        }}
      />

      <ImageLibraryPicker
        open={Boolean(optionLibrary)}
        productId={productId ? Number(productId) : null}
        title="Assign photos to option"
        onClose={() => setOptionLibrary(null)}
        onSelect={(urls) => {
          if (!optionLibrary) return;
          const { vIndex, oIndex } = optionLibrary;
          setVariants((prev) =>
            prev.map((v, i) => {
              if (i !== vIndex) return v;
              return {
                ...v,
                options: v.options.map((o, j) => {
                  if (j !== oIndex) return o;
                  const merged = [...(o.images || [])];
                  urls.forEach((url) => {
                    if (!merged.includes(url)) merged.push(url);
                  });
                  return {
                    ...o,
                    images: merged,
                    image_url: merged[0] || '',
                  };
                }),
              };
            })
          );
          toast.success('Photos assigned to option');
        }}
      />
    </div>
  );
}
