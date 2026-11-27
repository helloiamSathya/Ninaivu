import { getColors } from 'react-native-image-colors';
import { getPhotoColors, setPhotoColor } from './db';
import { Photo } from './photos';

type RGB = [number, number, number];

const hexToRgb = (hex: string): RGB => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};
const rgbToHex = ([r, g, b]: RGB) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** Soft pastel version of any colour: keep the hue, force a light, gentle look. */
export function pastelize(hex: string): string {
  const [h, s] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb(h, Math.min(0.55, Math.max(0.3, s)), 0.86));
}

/** Plain average of several hex colours. */
export function averageHex(hexes: string[]): string | null {
  if (!hexes.length) return null;
  const sum = hexes.map(hexToRgb).reduce<RGB>((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]);
  return rgbToHex([sum[0] / hexes.length, sum[1] / hexes.length, sum[2] / hexes.length]);
}

const SAMPLE_PER_DAY = 4;

/** Dominant/average colour of one photo; android gives `average`, iOS the closest equivalent. */
async function photoColor(p: Photo): Promise<string | null> {
  try {
    const r = await getColors(p.uri, { fallback: '#cccccc', cache: true, key: p.id, quality: 'low' });
    return r.platform === 'android' ? r.average : r.platform === 'ios' ? r.background : null;
  } catch {
    return null;
  }
}

/**
 * Pastel colour per day, from up to a few photos of that day.
 * Per-photo colours are cached in SQLite so each photo is analysed once.
 */
export async function dayPastels(byDay: Record<string, Photo[]>): Promise<Record<string, string>> {
  const ids = Object.values(byDay).flatMap((ps) => ps.slice(0, SAMPLE_PER_DAY).map((p) => p.id));
  const cached = await getPhotoColors(ids);
  const out: Record<string, string> = {};
  for (const [day, photos] of Object.entries(byDay)) {
    const colors: string[] = [];
    for (const p of photos.slice(0, SAMPLE_PER_DAY)) {
      let c: string | null | undefined = cached[p.id];
      if (!c) {
        c = await photoColor(p);
        if (c) await setPhotoColor(p.id, c);
      }
      if (c) colors.push(c);
    }
    const avg = averageHex(colors);
    if (avg) out[day] = pastelize(avg);
  }
  return out;
}
