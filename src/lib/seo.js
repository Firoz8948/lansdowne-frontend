import { ASSETS } from '@/lib/assets';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lansdowneleather.com').replace(
  /\/+$/,
  ''
);
export const BRAND = 'Lansdowne Leather';
export const SOCIAL_LINKS = ['https://www.instagram.com/leather_by_jbs/'];
export const HOME_TITLE = 'Genuine Leather Wallets, Bags & Belts for Men & Women | Lansdowne';
export const HOME_DESCRIPTION =
  'Shop 100% genuine leather wallets, handbags, sling bags, laptop bags and belts for men and women. Secure checkout and cash on delivery across India.';
export const SITE_KEYWORDS = [
  'genuine leather',
  'leather wallet for men',
  'leather wallet for women',
  'leather bags for women',
  'leather bags for men',
  'leather handbag for women',
  'leather sling bag',
  'leather laptop bag',
  'leather belt for men',
  'leather card holder',
  'Lansdowne Leather',
];

export const DEFAULT_OG_IMAGE = {
  url: ASSETS.ogImage,
  width: 1734,
  height: 907,
  type: 'image/webp',
  alt: BRAND,
};

const TITLE_MAX = 65;
const DESCRIPTION_MAX = 160;

const API_BASE = (
  process.env.API_INTERNAL_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://localhost:8000/api/v1'
).replace(/\/+$/, '');

/**
 * Server-side JSON fetch that never throws; `status` is 0 on network failure.
 * Pass `revalidate: 0` for data that can disappear (products): Next only caches
 * 200 responses, so a cached copy would otherwise outlive a 404 indefinitely.
 */
export async function fetchApi(path, { revalidate = 60 } = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      ...(revalidate === 0 ? { cache: 'no-store' } : { next: { revalidate } }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, status: res.status, data: null };
    return { ok: true, status: res.status, data: await res.json() };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export const absoluteUrl = (path = '/') => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const stripHtml = (raw) =>
  String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

export const truncate = (text, max) => {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const atWord = cut.slice(0, Math.max(cut.lastIndexOf(' '), Math.floor(max * 0.6)));
  return `${atWord.replace(/[\s,.;:–—-]+$/, '')}…`;
};

/** Drops the "| LANSDOWNE LEATHER" style suffix admins add to product names. */
export const cleanProductName = (name) =>
  String(name || '')
    .replace(/\s*[|–—-]\s*lansdown(e)?\s+leather\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const PRODUCT_TYPES = [
  { key: 'card holder', label: 'card holder', plural: 'card holders', re: /card\s*holder/i },
  { key: 'laptop bag', label: 'laptop bag', plural: 'laptop bags', re: /laptop|office\s+bag|briefcase/i },
  { key: 'sling bag', label: 'sling bag', plural: 'sling bags', re: /sling/i },
  { key: 'crossbody bag', label: 'crossbody bag', plural: 'crossbody bags', re: /cross\s*body/i },
  { key: 'tote bag', label: 'tote bag', plural: 'tote bags', re: /\btote/i },
  { key: 'handbag', label: 'handbag', plural: 'handbags', re: /hand\s*bag|purse/i },
  { key: 'wallet', label: 'wallet', plural: 'wallets', re: /wallet/i },
  { key: 'belt', label: 'belt', plural: 'belts', re: /\bbelt/i },
  { key: 'bag', label: 'bag', plural: 'bags', re: /\bbag/i },
];

const TYPE_WORD_RE =
  /\b(card\s*holder|laptop\s+bag|sling\s+bag|crossbody\s+bag|tote(\s+sling)?\s+bag|tote|hand\s*bag|wallet|belt|bag)\b/i;

export function detectProductType(product) {
  const metaType = product?.metafields?.product_type;
  const sources = [product?.name, metaType, product?.category];
  for (const source of sources) {
    if (!source) continue;
    const found = PRODUCT_TYPES.find((t) => t.re.test(String(source)));
    if (found) return found;
  }
  return null;
}

export function detectGender(product) {
  const text = `${product?.name || ''} ${stripHtml(product?.description || '').slice(0, 300)}`;
  if (/\bunisex\b|men\s*(&|and)\s*women|women\s*(&|and)\s*men/i.test(text)) return 'unisex';
  if (/\b(for\s+women|women'?s|ladies|female)\b/i.test(text)) return 'women';
  if (/\b(for\s+men|men'?s|gents|male)\b/i.test(text)) return 'men';
  return null;
}

const genderPhrase = (gender) =>
  gender === 'men' ? 'for Men' : gender === 'women' ? 'for Women' : gender === 'unisex' ? 'for Men & Women' : '';

const metaValue = (product, key) => stripHtml(product?.metafields?.[key] || '');

/** Title-cased label/value pairs in the same order the PDP renders Key Highlights. */
export function getHighlights(product, defs = []) {
  const values = product?.metafields || {};
  const ordered = (Array.isArray(defs) ? defs : [])
    .filter((d) => d?.is_active !== false)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((d) => ({ key: d.key, name: d.name, value: stripHtml(values[d.key]) }));
  const list = ordered.length
    ? ordered
    : Object.entries(values).map(([key, value]) => ({
        key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: stripHtml(value),
      }));
  return list.filter((h) => h.value && !/faq/i.test(h.key) && h.value.length <= 80);
}

function withLeatherKeyword(name, { genuine }) {
  const prefix = genuine ? 'Genuine Leather' : 'Leather';
  if (/genuine\s+leather/i.test(name)) return name;
  if (/\bleather\b/i.test(name)) {
    return genuine ? name.replace(/\bleather\b/i, (m) => `Genuine ${m}`) : name;
  }
  if (TYPE_WORD_RE.test(name)) return name.replace(TYPE_WORD_RE, (m) => `${prefix} ${m}`);
  return `${name} – ${prefix}`;
}

export function buildProductTitle(product) {
  const override = String(product?.seo_title || '').trim();
  if (override) return override;

  const name = cleanProductName(product?.name) || 'Leather Product';
  const genuine = withLeatherKeyword(name, { genuine: true });
  const leather = withLeatherKeyword(name, { genuine: false });
  const candidates = [
    `${genuine} | ${BRAND}`,
    `${leather} | ${BRAND}`,
    `${genuine} | Lansdowne`,
    `${leather} | Lansdowne`,
    `${name} | ${BRAND}`,
    genuine,
    leather,
  ];
  return candidates.find((c) => c.length <= TITLE_MAX) || truncate(name, TITLE_MAX);
}

const formatInr = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export function getPriceRange(product) {
  const optionPrices = (product?.variants || [])
    .flatMap((v) => v?.options || [])
    .map((o) => Number(o?.price))
    .filter((p) => Number.isFinite(p) && p > 0);
  const prices = optionPrices.length ? optionPrices : [Number(product?.price)].filter((p) => p > 0);
  if (!prices.length) return { low: null, high: null };
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

export function getTotalStock(product) {
  const optionStocks = (product?.variants || [])
    .flatMap((v) => v?.options || [])
    .map((o) => Number(o?.stock) || 0);
  if (optionStocks.length) return optionStocks.reduce((a, b) => a + b, 0);
  return Number(product?.stock) || 0;
}

function firstSentence(text) {
  const clean = stripHtml(text);
  if (!clean) return '';
  const match = clean.match(/^.+?[.!?](\s|$)/);
  return (match ? match[0] : clean).trim();
}

export function buildProductDescription(product, defs = []) {
  const override = String(product?.seo_description || '').trim();
  if (override) return truncate(override, DESCRIPTION_MAX);

  const name = cleanProductName(product?.name) || 'this leather product';
  const { low } = getPriceRange(product);
  const price = formatInr(low);
  const lead = `Buy ${name} online${price ? ` at ${price}` : ''} – 100% genuine leather by ${BRAND}.`;

  const highlightKeys = ['color', 'design', 'finish', 'size', 'card_capacity', 'weight'];
  const highlightValues = highlightKeys
    .map((key) => metaValue(product, key))
    .filter((v) => v && v.length <= 30);
  if (!highlightValues.length) {
    getHighlights(product, defs)
      .filter((h) => !/product_type|material/i.test(h.key))
      .slice(0, 4)
      .forEach((h) => highlightValues.push(h.value));
  }
  const highlights = highlightValues.length ? `${[...new Set(highlightValues)].join(', ')}.` : '';

  const parts = [lead, highlights, firstSentence(product?.description), 'Cash on delivery available.'];
  let result = '';
  for (const part of parts) {
    if (!part) continue;
    const next = result ? `${result} ${part}` : part;
    if (next.length <= DESCRIPTION_MAX) result = next;
  }
  return result || truncate(lead, DESCRIPTION_MAX);
}

export function buildProductKeywords(product) {
  const name = cleanProductName(product?.name);
  const type = detectProductType(product);
  const gender = detectGender(product);
  const color = metaValue(product, 'color');
  const words = [name];
  if (type) {
    words.push(`leather ${type.label}`, `genuine leather ${type.label}`);
    if (gender === 'unisex') {
      words.push(`leather ${type.label} for men`, `leather ${type.label} for women`);
    } else if (gender) {
      words.push(`leather ${type.label} for ${gender}`, `${type.label} for ${gender}`);
    }
    if (color) words.push(`${color.toLowerCase()} leather ${type.label}`);
  }
  if (product?.category) words.push(product.category);
  words.push('genuine leather', BRAND);
  return [...new Set(words.filter(Boolean))];
}

const productImages = (product) =>
  (product?.images || [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean)
    .map((url) => absoluteUrl(url));

export function buildProductMetadata(product, defs = []) {
  const title = buildProductTitle(product);
  const description = buildProductDescription(product, defs);
  const path = `/products/${product.slug}`;
  const images = productImages(product).slice(0, 4);
  const { low } = getPriceRange(product);
  const inStock = getTotalStock(product) > 0;

  return {
    title: { absolute: title },
    description,
    keywords: buildProductKeywords(product),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: BRAND,
      locale: 'en_IN',
      url: path,
      title,
      description,
      images: images.length
        ? images.map((url) => ({ url, alt: cleanProductName(product.name) }))
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length ? [images[0]] : [DEFAULT_OG_IMAGE.url],
    },
    other: {
      ...(low ? { 'product:price:amount': String(low), 'product:price:currency': 'INR' } : {}),
      'product:availability': inStock ? 'in stock' : 'out of stock',
      'product:brand': BRAND,
      'product:condition': 'new',
    },
  };
}

const GENDER_SCHEMA = { men: 'male', women: 'female', unisex: 'unisex' };

// Must stay in sync with /policy/shipping-policy and /policy/refund-policy.
const OFFER_SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 10, unitCode: 'DAY' },
  },
};

const MERCHANT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'IN',
  returnPolicyCountry: 'IN',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
  refundType: 'https://schema.org/FullRefund',
  merchantReturnLink: `${SITE_URL}/policy/refund-policy`,
};

export function buildProductJsonLd(product, defs = []) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const { low, high } = getPriceRange(product);
  const availability =
    getTotalStock(product) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const gender = detectGender(product);
  const material = metaValue(product, 'material');
  const color = metaValue(product, 'color');
  const offerCount = (product?.variants || []).flatMap((v) => v?.options || []).length;

  const offers =
    low != null && high != null && high > low
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: low,
          highPrice: high,
          offerCount: offerCount || 1,
          availability,
          url,
          shippingDetails: OFFER_SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
        }
      : low != null
        ? {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: low,
            availability,
            itemCondition: 'https://schema.org/NewCondition',
            url,
            seller: { '@type': 'Organization', name: BRAND },
            shippingDetails: OFFER_SHIPPING_DETAILS,
            hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
          }
        : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: cleanProductName(product.name),
    description: truncate(stripHtml(product.description) || buildProductDescription(product, defs), 5000),
    url,
    image: productImages(product),
    sku: String(product.id),
    brand: { '@type': 'Brand', name: BRAND },
    category: product.category || undefined,
    material: material ? (/leather/i.test(material) ? 'Genuine Leather' : material) : 'Genuine Leather',
    color: color || undefined,
    audience: gender
      ? { '@type': 'PeopleAudience', suggestedGender: GENDER_SCHEMA[gender] }
      : undefined,
    additionalProperty: getHighlights(product, defs).map((h) => ({
      '@type': 'PropertyValue',
      name: h.name,
      value: h.value,
    })),
    offers,
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND,
    legalName: 'JBS and Co',
    url: SITE_URL,
    telephone: '+91-89795-43500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sadar Bazaar',
      addressLocality: 'Lansdowne',
      addressRegion: 'Uttarakhand',
      postalCode: '246155',
      addressCountry: 'IN',
    },
    logo: absoluteUrl('/icon.png'),
    image: ASSETS.ogImage,
    sameAs: SOCIAL_LINKS,
    email: 'lansdowneleather1@gmail.com',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+91-89795-43500',
      email: 'lansdowneleather1@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: BRAND,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-IN',
  };
}

function categoryAudience(name) {
  if (/women|ladies/i.test(name)) return '';
  if (/\bmen\b|gents/i.test(name)) return '';
  if (/belt/i.test(name)) return 'for Men';
  return 'for Men & Women';
}

export function buildCategorySeo(category) {
  const name = String(category?.name || '').trim();
  const withLeather = /leather/i.test(name) ? name.replace(/\bleather\b/i, 'Genuine Leather') : `Genuine Leather ${name}`;
  const audience = categoryAudience(name);
  const autoTitle = [`${withLeather} ${audience}`.trim(), BRAND].join(' | ');
  const title =
    String(category?.seo_title || '').trim() ||
    (autoTitle.length <= TITLE_MAX ? autoTitle : `${withLeather} ${audience}`.trim());

  const intro = stripHtml(category?.description);
  const parts = [
    intro ? (/[.!?]$/.test(intro) ? intro : `${intro}.`) : '',
    `Shop 100% genuine ${/leather/i.test(name) ? '' : 'leather '}${name.toLowerCase()} ${audience.toLowerCase()} at ${BRAND}.`.replace(/\s+/g, ' '),
    'Secure checkout & cash on delivery.',
  ];
  let autoDescription = '';
  for (const part of parts) {
    if (!part) continue;
    const next = autoDescription ? `${autoDescription} ${part}` : part;
    if (next.length <= DESCRIPTION_MAX) autoDescription = next;
  }
  const description = truncate(
    String(category?.seo_description || '').trim() || autoDescription,
    DESCRIPTION_MAX
  );

  return { title, description };
}

/** Full metadata for a static page, keeping the default OG image when a page has none. */
export function pageMetadata({ title, description, path, noindex = false, images, keywords }) {
  const ogImages = images?.length ? images : [DEFAULT_OG_IMAGE];
  return {
    title: { absolute: title },
    description,
    ...(keywords ? { keywords } : {}),
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'website',
      siteName: BRAND,
      locale: 'en_IN',
      ...(path ? { url: path } : {}),
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((img) => (typeof img === 'string' ? img : img.url)),
    },
  };
}

export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
