/**
 * Map common color option names → hex for swatches.
 * Used when admin types a name without picking a custom hex.
 */

const NAMED_COLORS = {
  black: '#1A1A1A',
  white: '#F5F5F5',
  ivory: '#FFFFF0',
  cream: '#FFFDD0',
  beige: '#F5F0E6',
  grey: '#808080',
  gray: '#808080',
  silver: '#C0C0C0',
  charcoal: '#36454F',
  brown: '#8B5A2B',
  tan: '#D2B48C',
  cognac: '#9A463D',
  caramel: '#C68E4E',
  chocolate: '#3D1C02',
  coffee: '#4B3621',
  espresso: '#3C2415',
  mahogany: '#C04000',
  orange: '#E67E22',
  rust: '#B7410E',
  terracotta: '#E2725B',
  red: '#C0392B',
  maroon: '#800000',
  burgundy: '#800020',
  pink: '#FF69B4',
  rose: '#FF007F',
  purple: '#7B2D8E',
  violet: '#8F00FF',
  blue: '#2980B9',
  navy: '#1B2A4A',
  teal: '#008080',
  green: '#27AE60',
  olive: '#808000',
  yellow: '#F1C40F',
  gold: '#D4AF37',
  mustard: '#E1AD01',
};

/** Brand default previously used as emptyOption hex — treat as "unset" for named colors */
export const DEFAULT_OPTION_HEX = '#5c3d2e';

function normalizeColorKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve a color name to a hex string, or null if unknown.
 * Tries exact match, then last/first word (e.g. "burnt orange" → orange).
 */
export function hexFromColorName(name) {
  const key = normalizeColorKey(name);
  if (!key) return null;
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];

  const words = key.split(/[\s-]+/).filter(Boolean);
  // Prefer more specific trailing words: "dark orange" → orange
  for (let i = words.length - 1; i >= 0; i -= 1) {
    if (NAMED_COLORS[words[i]]) return NAMED_COLORS[words[i]];
  }
  // Multi-word keys already covered; try joined without spaces
  const compact = words.join('');
  if (NAMED_COLORS[compact]) return NAMED_COLORS[compact];
  return null;
}

/**
 * Hex to use for a color option: explicit hex if set & not brand-default when name maps,
 * otherwise name lookup, otherwise fallback.
 */
export function resolveOptionHex(option, { fallback = '#cbd5e1' } = {}) {
  if (!option) return fallback;
  const fromName = hexFromColorName(option.name);
  const explicit =
    option.hex ||
    (Array.isArray(option.colors) && option.colors[0]?.hex) ||
    null;

  if (explicit) {
    const normalized = String(explicit).trim().toLowerCase();
    const isBrandDefault = normalized === DEFAULT_OPTION_HEX.toLowerCase();
    // If still on brand default but name is a known color, prefer the name
    if (isBrandDefault && fromName) return fromName;
    return explicit;
  }

  return fromName || fallback;
}
