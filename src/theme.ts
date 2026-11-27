export const FONT = 'Geist';

/** The five brand colours supplied by the owner. */
export const PALETTE = {
  indigo: '#151E3F', // Space Indigo: primary / ink
  prussian: '#030027', // Prussian Blue: splash, nav, dark screens
  beige: '#F2F3D9', // Beige: background
  bronze: '#DC9E82', // Light Bronze: accent
  rose: '#C16E70', // Dusty Rose: secondary accent, today
} as const;

/** Soft Pastel Shades supplied by the owner (Coolors). Used for backgrounds, cards, chips and cool accents. */
export const PASTEL = {
  sand: '#EDDCD2',
  cream: '#FFF1E6',
  blush: '#FDE2E4',
  pink: '#FAD2E1',
  mist: '#C5DEDD',
  sage: '#DBE7E4',
  stone: '#F0EFEB',
  fog: '#D6E2E9',
  sky: '#BCD4E6',
  blue: '#99C1DE',
} as const;

/** Semantic tokens, mirroring the "Theme" variables in the Figma board. */
export const COLORS = {
  bg: PASTEL.cream,
  surface: PASTEL.stone,
  ink: PALETTE.indigo,
  muted: '#6D737D',
  line: PASTEL.sand,
  chip: PASTEL.pink,
  cool: PASTEL.sky,
  primary: PALETTE.indigo,
  onPrimary: PALETTE.beige,
  accent: PALETTE.bronze,
  accent2: PALETTE.rose,
  deep: PALETTE.prussian,
  deepSurface: PALETTE.indigo,
  onDeep: PALETTE.beige,
  onDeepMuted: '#9E9E9B',
} as const;
