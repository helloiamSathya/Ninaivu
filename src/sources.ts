import * as MediaLibrary from 'expo-media-library/legacy';
import { Platform } from 'react-native';
import { getSetting, setSetting } from './db';

/**
 * Which gallery folders feed the calendar.
 * Default: camera photos only. Screenshots and chat-app folders (WhatsApp, Telegram…)
 * stay out unless the user turns them on in Settings > Photo sources.
 */
export type SourceSettings = {
  screenshots: boolean;
  /** Album ids the user has switched on, beyond the camera. */
  extraAlbums: string[];
};

const KEY = 'photo_sources';
export const DEFAULT_SOURCES: SourceSettings = { screenshots: false, extraAlbums: [] };

export const getSources = () => getSetting<SourceSettings>(KEY, DEFAULT_SOURCES);
export const saveSources = (s: SourceSettings) => setSetting(KEY, s);

export type SourceAlbum = { id: string; title: string; count: number; kind: 'camera' | 'screenshots' | 'other' };

const isCamera = (t: string) => /^(camera|camera roll|dcim|recents|all photos)$/i.test(t.trim());
const isScreenshots = (t: string) => /screenshot/i.test(t);

/** Folders on this phone, sorted with the camera first, for the settings list. */
export async function listSourceAlbums(): Promise<SourceAlbum[]> {
  const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: Platform.OS === 'ios' });
  const rows: SourceAlbum[] = albums
    .filter((a) => a.assetCount > 0)
    .map((a) => ({
      id: a.id,
      title: a.title,
      count: a.assetCount,
      kind: isCamera(a.title) ? 'camera' : isScreenshots(a.title) ? 'screenshots' : 'other',
    }));
  // iOS smart albums other than Screenshots (Favourites, Selfies, Live Photos…) overlap the camera roll.
  const useful = Platform.OS === 'ios' ? rows.filter((r) => r.kind !== 'other' || !isSmartOverlap(r.title)) : rows;
  const order = { camera: 0, screenshots: 1, other: 2 } as const;
  return useful.sort((a, b) => order[a.kind] - order[b.kind] || b.count - a.count);
}

function isSmartOverlap(t: string) {
  return /^(favou?rites|selfies|live photos|portrait|panoramas|bursts|recently added|recently saved|videos|slo-mo|time-lapse|hidden|recently deleted|long exposure|raw|spatial|animated|cinematic|duplicates|imports)$/i.test(
    t.trim(),
  );
}

/** Ids of camera albums on Android (DCIM/Camera). Empty on iOS, where the whole library is the camera roll. */
export async function cameraAlbumIds(): Promise<string[]> {
  if (Platform.OS !== 'android') return [];
  const albums = await MediaLibrary.getAlbumsAsync();
  return albums.filter((a) => isCamera(a.title)).map((a) => a.id);
}

export async function screenshotAlbumIds(): Promise<string[]> {
  const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: Platform.OS === 'ios' });
  return albums.filter((a) => isScreenshots(a.title)).map((a) => a.id);
}
