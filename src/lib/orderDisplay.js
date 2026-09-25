/** Shared helpers for customer + admin order displays */

export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Prefer color option from variant_info; fall back to full variant label */
export function getOrderItemColor(item) {
  if (!item) return '';
  const vi =
    item.variant_info && typeof item.variant_info === 'object' ? item.variant_info : null;
  if (!vi) return '';

  const sels = Array.isArray(vi.selections) ? vi.selections : [];
  const colorSel =
    sels.find((s) => s && /colou?r/i.test(String(s.variant || s.variantName || ''))) || null;
  if (colorSel?.option) return String(colorSel.option);

  if (/colou?r/i.test(String(vi.variant || '')) && vi.option) {
    return String(vi.option);
  }

  if (vi.option && !vi.variant) return String(vi.option);

  if (vi.label) {
    // "Color: Orange" or "Color: Orange · Size: M"
    const colorPart = String(vi.label)
      .split('·')
      .map((p) => p.trim())
      .find((p) => /colou?r/i.test(p));
    if (colorPart) {
      return colorPart.replace(/^colou?r\s*:\s*/i, '').trim() || colorPart;
    }
  }

  return '';
}

export function getOrderItemVariantLabel(item) {
  const color = getOrderItemColor(item);
  if (color) return color;
  const vi = item?.variant_info;
  if (vi?.label) return String(vi.label);
  if (vi?.option) return String(vi.option);
  return '';
}

export function getOrderItemHref(item) {
  const slug = item?.slug;
  if (slug) return `/products/${encodeURIComponent(slug)}`;
  return null;
}

export const ORDER_STATUS_META = {
  pending: { label: 'Pending', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  confirmed: { label: 'Confirmed', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  processing: { label: 'Processing', bg: '#e0f2fe', color: '#075985', border: '#7dd3fc' },
  shipped: { label: 'Shipped', bg: '#ccfbf1', color: '#0f766e', border: '#5eead4' },
  delivered: { label: 'Delivered', bg: '#dcfce7', color: '#166534', border: '#86efac' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

export function getOrderStatusMeta(status) {
  const key = String(status || '').toLowerCase();
  return (
    ORDER_STATUS_META[key] || {
      label: status ? String(status).replace(/_/g, ' ') : '—',
      bg: '#f1f5f9',
      color: '#475569',
      border: '#e2e8f0',
    }
  );
}
