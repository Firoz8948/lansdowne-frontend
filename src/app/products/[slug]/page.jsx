'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import productService from '@/lib/services/products';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Minus, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ColorSwatches, {
  buildColorSwatchItems,
  colorVariantOptions,
  matchColorOption,
  optionGalleryUrls,
  productColorHref,
} from '@/components/ColorSwatches/ColorSwatches';
import styles from './pdp.module.css';
import cardStyles from '@/app/home/home.module.css';

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

const stripHtml = (raw) =>
  String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const DEFAULT_FAQS = [
  {
    q: 'What is the quality of Lansdowne products?',
    a: 'Every piece is made with carefully selected materials and finished for everyday durability. We check stitching, hardware, and surface quality before anything ships.',
  },
  {
    q: 'How should I care for this product?',
    a: 'Wipe with a soft dry cloth after use. Keep away from prolonged moisture and direct heat. For leather pieces, use a mild leather conditioner occasionally.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are usually processed within 1–2 business days. Delivery across India typically takes 3–7 business days depending on your location.',
  },
  {
    q: 'Can I return or exchange this?',
    a: 'Yes — unused products in original condition can be returned as per our Returns & Refunds policy. Start a return from your order confirmation or contact support.',
  },
];

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <Header />
          <main className={styles.main}>
            <div className={styles.inner}>
              <div className={styles.loadingState}>Loading product…</div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ProductDetailPageInner />
    </Suspense>
  );
}

function ProductDetailPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug;
  const colorParam = searchParams?.get('color');
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [metafieldDefs, setMetafieldDefs] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(null);
  const pauseAutoplayUntil = useRef(0);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [productData, defs] = await Promise.all([
          productService.getProduct(slug),
          productService.getMetafieldDefinitions().catch(() => []),
        ]);
        if (!mounted) return;
        setProduct(productData);
        setMetafieldDefs(Array.isArray(defs) ? defs : []);

        const initial = {};
        (productData.variants || []).forEach((variant) => {
          if (variant.options?.length) {
            initial[variant.id ?? variant.name] = variant.options[0];
          }
        });

        const colorVariant = (productData.variants || []).find((v) =>
          /colou?r/i.test(v?.name || '')
        );
        // Prefer URL ?color= so card deep-links open the right variant
        const param =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('color')
            : colorParam;
        if (colorVariant?.options?.length && param) {
          const matched = matchColorOption(colorVariant.options, param);
          if (matched) {
            initial[colorVariant.id ?? colorVariant.name] = matched;
          }
        }

        setSelectedOptions(initial);
        setActiveImage(0);
        setQty(1);
        setOpenFaq(0);

        try {
          const relatedParams = {
            page: 1,
            page_size: 8,
            ...(productData.category_slug
              ? { category_slug: productData.category_slug }
              : productData.category
                ? { category: productData.category }
                : {}),
          };
          const relatedData = await productService.getProducts(relatedParams);
          const list = Array.isArray(relatedData?.items)
            ? relatedData.items
            : Array.isArray(relatedData?.products)
              ? relatedData.products
              : Array.isArray(relatedData)
                ? relatedData
                : [];
          if (mounted) {
            setRelatedProducts(
              list
                .filter((p) => String(p.id) !== String(productData.id) && p.slug !== productData.slug)
                .slice(0, 4)
            );
          }
        } catch {
          if (mounted) setRelatedProducts([]);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Product not found');
          setProduct(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Keep selection in sync when landing with / changing ?color=
  useEffect(() => {
    if (!product || !colorParam) return;
    const colorVariant = (product.variants || []).find((v) =>
      /colou?r/i.test(v?.name || '')
    );
    if (!colorVariant?.options?.length) return;
    const matched = matchColorOption(colorVariant.options, colorParam);
    if (!matched) return;
    const key = colorVariant.id ?? colorVariant.name;
    setSelectedOptions((prev) => {
      const current = prev[key];
      if (
        current &&
        ((current.id != null && current.id === matched.id) ||
          current.name === matched.name)
      ) {
        return prev;
      }
      return { ...prev, [key]: matched };
    });
    setActiveImage(0);
  }, [product, colorParam]);

  const activeOption = useMemo(() => {
    if (!product) return null;
    const colorVariant = (product.variants || []).find((v) =>
      /colou?r/i.test(v?.name || '')
    );
    if (colorVariant) {
      const key = colorVariant.id ?? colorVariant.name;
      if (selectedOptions[key]) return selectedOptions[key];
    }
    const options = Object.values(selectedOptions);
    return options.length ? options[options.length - 1] : null;
  }, [product, selectedOptions]);

  const displayPrice = activeOption?.price ?? product?.price;
  const displayMrp = activeOption?.mrp ?? product?.mrp;
  const displayStock = activeOption?.stock ?? product?.stock ?? 0;
  const inStock = Number(displayStock) > 0;
  const hasDiscount =
    displayMrp != null && Number(displayMrp) > Number(displayPrice);

  const images = useMemo(() => {
    const productImgs = (product?.images || []).map(resolveImageUrl).filter(Boolean);
    const variants = product?.variants || [];
    const colorVariant = variants.find((v) => /colou?r/i.test(v?.name || ''));
    if (colorVariant) {
      const key = colorVariant.id ?? colorVariant.name;
      const gallery = optionGalleryUrls(selectedOptions[key])
        .map(resolveImageUrl)
        .filter(Boolean);
      if (gallery.length) return gallery;
    }
    for (const opt of Object.values(selectedOptions || {})) {
      const gallery = optionGalleryUrls(opt).map(resolveImageUrl).filter(Boolean);
      if (gallery.length) return gallery;
    }
    return productImgs.length ? productImgs : [null];
  }, [product, selectedOptions]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isMobile || images.length < 2 || !images[0]) return undefined;
    const timer = setInterval(() => {
      if (Date.now() < pauseAutoplayUntil.current) return;
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isMobile, images]);

  useEffect(() => {
    if (!isMobile) {
      setHighlightsOpen(false);
      return;
    }
    // Auto-open on 3rd image; auto-close when leaving it (4th, 1st, etc.)
    setHighlightsOpen(activeImage === 2);
  }, [activeImage, isMobile]);

  const metafieldSections = useMemo(() => {
    if (!product?.metafields) return [];
    const values = product.metafields;

    const hasContent = (raw) => {
      if (raw == null) return false;
      const text = String(raw)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return Boolean(text);
    };

    const fromDefs = (metafieldDefs || [])
      .filter((d) => d.is_active !== false)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((d) => ({
        key: d.key,
        title: d.name,
        value: values[d.key],
      }))
      .filter((s) => hasContent(s.value));

    if (fromDefs.length) return fromDefs;

    return Object.entries(values)
      .filter(([, v]) => hasContent(v))
      .map(([key, value]) => ({
        key,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
      }));
  }, [product, metafieldDefs]);

  const detailSections = useMemo(
    () =>
      metafieldSections.filter(
        (s) => !/faq/i.test(s.key) && !/faq/i.test(s.title || '')
      ),
    [metafieldSections]
  );

  const faqItems = useMemo(() => {
    const faqSection = metafieldSections.find(
      (s) => /faq/i.test(s.key) || /faq/i.test(s.title || '')
    );
    if (faqSection?.value) {
      const text = String(faqSection.value)
        .replace(/<[^>]+>/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const parsed = [];
      for (let i = 0; i < text.length; i += 1) {
        const line = text[i];
        if (line.endsWith('?') || /^q[:.\s]/i.test(line)) {
          parsed.push({
            q: line.replace(/^q[:.\s]+/i, ''),
            a: text[i + 1] || '',
          });
          i += 1;
        }
      }
      if (parsed.length) return parsed;
    }
    return DEFAULT_FAQS;
  }, [metafieldSections]);

  const selectOption = (variantKey, option) => {
    setSelectedOptions((prev) => ({ ...prev, [variantKey]: option }));
    setQty(1);
    setActiveImage(0);
  };

  const getSelectedVariantMeta = () => {
    const variants = product?.variants || [];
    if (!variants.length) {
      return { option: null, variantName: null, selections: [] };
    }

    const selections = [];
    variants.forEach((variant) => {
      const key = variant.id ?? variant.name;
      const option = selectedOptions[key] || variant.options?.[0] || null;
      if (!option) return;
      selections.push({
        variant: variant.name || null,
        option: option.name || null,
        variant_id: variant.id ?? null,
        option_id: option.id ?? null,
        weight_grams: option.weight != null ? Number(option.weight) : null,
        hex: option.hex || null,
      });
    });

    const colorVariant = variants.find((v) => /colou?r/i.test(v?.name || ''));
    const primary = colorVariant || variants[0];
    const variantKey = primary.id ?? primary.name;
    const option = selectedOptions[variantKey] || primary.options?.[0] || null;
    return {
      option,
      variantName: primary.name || null,
      selections,
    };
  };

  const handleAddToBag = () => {
    if (!inStock) {
      toast.error('This product is out of stock');
      return;
    }
    const { option, variantName, selections } = getSelectedVariantMeta();
    addItem(product, { quantity: qty, option, variantName, selections });
    toast.success(`${product.name} added to bag`);
    router.push('/cart');
  };

  const handleRelatedAddToBag = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, { quantity: 1 });
    toast.success(`${item.name} added to bag`);
    router.push('/cart');
  };

  const goToImage = (index) => {
    pauseAutoplayUntil.current = Date.now() + 5000;
    setActiveImage(index);
  };

  const onGalleryTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };

  const onGalleryTouchEnd = (e) => {
    if (touchStartX.current == null || images.length < 2) return;
    const endX = e.changedTouches?.[0]?.clientX;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    pauseAutoplayUntil.current = Date.now() + 5000;
    if (delta < 0) {
      setActiveImage((prev) => (prev + 1) % images.length);
    } else {
      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.inner}>
          <Link href="/shop" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to shop
          </Link>

          {loading ? (
            <div className={styles.loadingState}>Loading product…</div>
          ) : error || !product ? (
            <div className={styles.errorState}>
              <h1>Product not found</h1>
              <p>{error || 'This product may be unavailable.'}</p>
              <Link href="/" className={styles.primaryBtn}>
                Go home
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.layout}>
                <section className={styles.gallery}>
                  <div
                    className={styles.mainImageFrame}
                    onTouchStart={onGalleryTouchStart}
                    onTouchEnd={onGalleryTouchEnd}
                  >
                    {images[activeImage] ? (
                      <img
                        src={images[activeImage]}
                        alt={product.name}
                        className={styles.mainImage}
                      />
                    ) : (
                      <div className={styles.imageFallback}>No image</div>
                    )}
                    {hasDiscount && (
                      <span className={styles.saleBadge}>Sale</span>
                    )}

                    {detailSections.length > 0 && (
                      <div
                        className={`${styles.highlightsPanel} ${
                          highlightsOpen ? styles.highlightsPanelOpen : ''
                        }`}
                      >
                        <div
                          className={styles.highlightsBody}
                          aria-hidden={!highlightsOpen}
                        >
                          <p className={styles.highlightsTitle}>Key Highlights</p>
                          <ul className={styles.highlightsList}>
                            {detailSections.slice(0, 6).map((section) => (
                              <li key={section.key} className={styles.highlightsItem}>
                                <span className={styles.highlightsLabel}>
                                  {section.title}
                                </span>
                                <span className={styles.highlightsValue}>
                                  {stripHtml(section.value)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          className={styles.highlightsToggle}
                          onClick={() => {
                            pauseAutoplayUntil.current = Date.now() + 8000;
                            setHighlightsOpen((open) => !open);
                          }}
                          aria-label={
                            highlightsOpen
                              ? 'Hide key highlights'
                              : 'Show key highlights'
                          }
                          aria-expanded={highlightsOpen}
                        >
                          {highlightsOpen ? (
                            <ChevronLeft size={16} strokeWidth={2.25} />
                          ) : (
                            <ChevronRight size={16} strokeWidth={2.25} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {images.length > 1 && images[0] && (
                    <div className={styles.thumbRow}>
                      {images.map((src, index) => (
                        <button
                          key={`${src}-${index}`}
                          type="button"
                          className={`${styles.thumb} ${
                            activeImage === index ? styles.thumbActive : ''
                          }`}
                          onClick={() => goToImage(index)}
                        >
                          <img src={src} alt={`${product.name} ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <section className={styles.info}>
                  {product.category && (
                    <p className={styles.categoryLabel}>{product.category}</p>
                  )}
                  <h1 className={styles.title}>{product.name}</h1>

                  <div className={styles.priceRow}>
                    <div className={styles.priceGroup}>
                      <span className={styles.price}>{formatPrice(displayPrice)}</span>
                      {hasDiscount && (
                        <span className={styles.mrp}>{formatPrice(displayMrp)}</span>
                      )}
                    </div>
                    <p className={`${styles.stock} ${inStock ? styles.inStock : styles.outStock}`}>
                      {inStock ? `${displayStock} in stock` : 'Out of stock'}
                    </p>
                  </div>

                  {(() => {
                    const swatchItems = buildColorSwatchItems(product);
                    if (!swatchItems.length) return null;

                    const colorOpts = colorVariantOptions(product);
                    const colorVariant = (product.variants || []).find((v) =>
                      /colou?r/i.test(v?.name || '')
                    );
                    const colorKey = colorVariant
                      ? colorVariant.id ?? colorVariant.name
                      : null;
                    const selectedColor = colorKey ? selectedOptions[colorKey] : null;

                    const itemsWithSelection = swatchItems.map((item, index) => {
                      if (colorOpts.length && item.option_id != null && selectedColor) {
                        return {
                          ...item,
                          is_current:
                            selectedColor.id != null
                              ? selectedColor.id === item.option_id
                              : selectedColor.name === item.name,
                        };
                      }
                      if (colorOpts.length && !selectedColor) {
                        return { ...item, is_current: index === 0 };
                      }
                      return item;
                    });

                    const current = itemsWithSelection.find((s) => s.is_current);
                    const label =
                      current?.name ||
                      (current?.colors || [])
                        .map((c) => c.name || c.hex)
                        .filter(Boolean)
                        .join(' / ');

                    return (
                      <div className={styles.variantBlock}>
                        <div className={styles.variantLabel}>
                          Color{label ? `: ${label}` : ''}
                        </div>
                        <ColorSwatches
                          items={itemsWithSelection}
                          size="lg"
                          onSelect={(item) => {
                            if (item?.slug && item.slug !== product.slug) {
                              router.push(productColorHref(item) || `/products/${item.slug}`);
                              return;
                            }
                            if (colorKey && colorOpts.length) {
                              const opt = colorOpts.find(
                                (o) =>
                                  (item.option_id != null && o.id === item.option_id) ||
                                  o.name === item.name
                              );
                              if (opt) {
                                selectOption(colorKey, opt);
                                const href = productColorHref({
                                  slug: product.slug,
                                  option_id: opt.id,
                                  name: opt.name,
                                  id: opt.id ?? `${product.id}-color`,
                                });
                                if (href) {
                                  router.replace(href, { scroll: false });
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    );
                  })()}

                  {(product.variants || []).map((variant) => {
                    // Color radios are rendered above via ColorSwatches
                    if (/colou?r/i.test(variant.name || '')) return null;

                    const variantKey = variant.id ?? variant.name;
                    const selected = selectedOptions[variantKey];
                    return (
                      <div key={variantKey} className={styles.variantBlock}>
                        <div className={styles.variantLabel}>
                          {variant.name}
                          {selected?.name ? `: ${selected.name}` : ''}
                        </div>
                        <div className={styles.optionRow}>
                          {(variant.options || []).map((option) => {
                            const isSelected = selected?.id
                              ? selected.id === option.id
                              : selected?.name === option.name;
                            return (
                              <button
                                key={option.id ?? option.name}
                                type="button"
                                className={`${styles.optionChip} ${
                                  isSelected ? styles.optionChipActive : ''
                                }`}
                                onClick={() => selectOption(variantKey, option)}
                              >
                                {option.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className={styles.qtyRow}>
                    <span className={styles.variantLabel}>Quantity</span>
                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.qtyValue}>{qty}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() =>
                          setQty((q) => Math.min(Math.max(displayStock, 1), q + 1))
                        }
                        aria-label="Increase quantity"
                        disabled={!inStock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.addToBagBtn}
                      onClick={handleAddToBag}
                      disabled={!inStock}
                    >
                      {inStock ? 'Add to Bag' : 'Out of Stock'}
                    </button>
                  </div>

                  <div className={styles.trustIcons}>
                    {[
                      { src: '/images/authentic_quality.png', label: 'Authentic Quality' },
                      {
                        src: '/images/made_with_care.png',
                        label: (
                          <>
                            Made with
                            <br className={styles.trustLabelBreak} />
                            <span className={styles.trustLabelDesktopJoin}> </span>
                            Care
                          </>
                        ),
                      },
                      { src: '/images/secure_shopping.png', label: 'Secure Shopping' },
                      { src: '/images/express_delivery.png', label: 'Express Delivery' },
                    ].map((item) => (
                      <div key={item.src} className={styles.trustIconItem}>
                        <img
                          src={item.src}
                          alt={typeof item.label === 'string' ? item.label : 'Made with Care'}
                          className={styles.trustIconImg}
                        />
                        <span className={styles.trustIconLabel}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {product.description && (
                    <div className={styles.descriptionBlock}>
                      <h2 className={styles.descriptionTitle}>Description</h2>
                      <div
                        className={styles.descriptionHtml}
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </div>
                  )}

                  {detailSections.length > 0 && (
                    <div className={styles.metafieldBlock}>
                      <h2 className={styles.descriptionTitle}>Details</h2>
                      <div className={styles.metafieldList}>
                        {detailSections.map((section) => (
                          <article key={section.key} className={styles.metafieldCard}>
                            <h3 className={styles.metafieldTitle}>{section.title}</h3>
                            <div
                              className={styles.metafieldBody}
                              dangerouslySetInnerHTML={{ __html: section.value }}
                            />
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>FAQS</h2>
                  <p className={styles.sectionSubtitle}>Common questions</p>
                </div>
                <div className={styles.faqList}>
                  {faqItems.map((item, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={`${item.q}-${idx}`} className={styles.faqItem}>
                        <button
                          type="button"
                          className={styles.faqQuestion}
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          aria-expanded={isOpen}
                        >
                          <span>{item.q}</span>
                          <ChevronDown
                            size={18}
                            className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
                          />
                        </button>
                        {isOpen && <div className={styles.faqAnswer}>{item.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>

              {relatedProducts.length > 0 && (
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>RELATED PRODUCTS</h2>
                    <p className={styles.sectionSubtitle}>You may also like</p>
                  </div>
                  <div className={cardStyles.productGrid}>
                    {relatedProducts.map((item) => {
                      const primaryImage = resolveImageUrl(item.images?.[0]);
                      const hoverImage = resolveImageUrl(item.images?.[1]);
                      const href = item.slug ? `/products/${item.slug}` : '/shop';
                      const hasDiscount =
                        item.mrp != null && Number(item.mrp) > Number(item.price);
                      const hasHoverImage = Boolean(hoverImage);

                      return (
                        <article
                          key={item.id}
                          className={`${cardStyles.productCard} ${
                            hasHoverImage ? cardStyles.productCardHasHoverImg : ''
                          }`}
                        >
                          <div className={cardStyles.productImageWrap}>
                            <Link href={href} className={cardStyles.productImageLink}>
                              {primaryImage ? (
                                <>
                                  <img
                                    src={primaryImage}
                                    alt={item.name}
                                    className={`${cardStyles.productImage} ${cardStyles.productImagePrimary}`}
                                    loading="lazy"
                                  />
                                  {hasHoverImage && (
                                    <img
                                      src={hoverImage}
                                      alt=""
                                      aria-hidden="true"
                                      className={`${cardStyles.productImage} ${cardStyles.productImageSecondary}`}
                                      loading="lazy"
                                    />
                                  )}
                                </>
                              ) : (
                                <div className={cardStyles.productImagePlaceholder}>
                                  No image
                                </div>
                              )}
                            </Link>
                          </div>

                          <div className={cardStyles.productBody}>
                            <Link href={href} className={cardStyles.productInfoLink}>
                              {item.category && (
                                <span className={cardStyles.productCategory}>
                                  {item.category}
                                </span>
                              )}
                              <h3 className={cardStyles.productName}>{item.name}</h3>
                              <div className={cardStyles.productPricing}>
                                <span className={cardStyles.productPrice}>
                                  {formatPrice(item.price)}
                                </span>
                                {hasDiscount && (
                                  <span className={cardStyles.productMrp}>
                                    {formatPrice(item.mrp)}
                                  </span>
                                )}
                                <ColorSwatches
                                  items={buildColorSwatchItems(item)}
                                  size="sm"
                                  align="right"
                                  stopPropagation
                                  onSelect={(sib) => {
                                    const href = productColorHref(sib);
                                    if (href) router.push(href);
                                  }}
                                />
                              </div>
                            </Link>

                            <div className={cardStyles.productCardActions}>
                              <button
                                type="button"
                                className={cardStyles.productBuyNowBtn}
                                onClick={(e) => handleRelatedAddToBag(e, item)}
                              >
                                Add to Bag
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
