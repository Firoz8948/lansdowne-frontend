export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
}

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Human-readable variant text for cart / order line items */
export function formatVariantLabel(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (source.variantLabel) return source.variantLabel;
  const vi =
    source.variant_info && typeof source.variant_info === 'object'
      ? source.variant_info
      : source;
  if (vi?.label) return vi.label;
  const sels = source.selections || vi?.selections;
  if (Array.isArray(sels) && sels.length) {
    return sels
      .map((s) => [s.variant, s.option].filter(Boolean).join(': '))
      .filter(Boolean)
      .join(' · ');
  }
  return [source.variantName || vi?.variant, source.optionName || vi?.option]
    .filter(Boolean)
    .join(' · ');
}

export function buildCheckoutItems(cartItems) {
  return cartItems.map((item) => {
    const selections = Array.isArray(item.selections) ? item.selections : [];
    const label = formatVariantLabel(item) || null;
    const weight =
      item.weight_grams != null
        ? Number(item.weight_grams)
        : selections.find((s) => s.weight_grams != null)?.weight_grams;

    let variant_info = null;
    if (selections.length || item.variantName || item.optionName || label) {
      variant_info = {
        variant: item.variantName || selections[0]?.variant || null,
        option: item.optionName || selections[0]?.option || null,
        label,
        selections: selections.length ? selections : undefined,
        weight_grams: weight != null ? Number(weight) : undefined,
      };
      // Drop undefined keys for a clean payload
      Object.keys(variant_info).forEach((k) => {
        if (variant_info[k] === undefined) delete variant_info[k];
      });
    }

    return {
      product_id: String(item.productId || item.id),
      name: item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || null,
      variant_info,
    };
  });
}

export function submitPayuForm(paymentUrl, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.style.display = 'none';

  Object.entries(fields || {}).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}
