export const FONT = 'Geist';

/** The five brand colours supplied by the owner. */
export const PALETTE = {
  indigo: '#151E3F', // Space Indigo: primary / ink
  prussian: '#030027', // Prussian Blue: splash, nav, dark screens
  beige: '#F2F3D9', // Beige: background
  bronze: '#DC9E82', // Light Bronze: accent
  rose: '#C16E70', // Dusty Rose: secondary accent, today
} as const;

/** Semantic tokens, mirroring the "Theme" variables in the Figma board. */
export const COLORS = {
  bg: PALETTE.beige,
  surface: '#FAFBEC',
  ink: PALETTE.indigo,
  muted: '#6D737D',
  line: '#DCDDC2',
  primary: PALETTE.indigo,
  onPrimary: PALETTE.beige,
  accent: PALETTE.bronze,
  accent2: PALETTE.rose,
  deep: PALETTE.prussian,
  deepSurface: PALETTE.indigo,
  onDeep: PALETTE.beige,
  onDeepMuted: '#9E9E9B',
} as const;
