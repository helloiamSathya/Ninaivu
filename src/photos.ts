import * as MediaLibrary from 'expo-media-library/legacy';
import { Platform } from 'react-native';
import { dayKey } from './dates';
import { cameraAlbumIds, getSources, listSourceAlbums, screenshotAlbumIds } from './sources';

export type Photo = { id: string; uri: string; takenAt: number };

export async function ensurePhotoPermission(): Promise<boolean> {
  const current = await MediaLibrary.getPermissionsAsync(false, ['photo']);
  if (current.granted) return true;
  const asked = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  return asked.granted;
}

type Range = { createdAfter: number; createdBefore: number };

async function readAll(range: Range, album?: string): Promise<MediaLibrary.Asset[]> {
  const out: MediaLibrary.Asset[] = [];
  let after: string | undefined;
  for (;;) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
      ...range,
      album,
      first: 500,
      after,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    out.push(...page.assets);
    if (!page.hasNextPage) break;
    after = page.endCursor;
  }
  return out;
}

/**
 * Reads photos taken in one month straight from the phone gallery and groups
 * them by local day. Nothing is copied: deleted photos simply stop appearing.
 *
 * Only the folders chosen in Settings > Photo sources are read:
 * - Android: the camera folder, plus any extra folders and Screenshots if switched on.
 * - iOS: the library has no camera-only folder, so we read everything and drop
 *   screenshots and photos that sit in folders the user has not switched on
 *   (for example WhatsApp), unless they are switched on.
 */
export async function loadMonthPhotos(year: number, month: number): Promise<Record<string, Photo[]>> {
  const range = {
    createdAfter: new Date(year, month, 1).getTime(),
    createdBefore: new Date(year, month + 1, 1).getTime(),
  };
  const sources = await getSources();
  let assets: MediaLibrary.Asset[] = [];

  if (Platform.OS === 'android') {
    const ids = new Set([...(await cameraAlbumIds()), ...sources.extraAlbums]);
    if (sources.screenshots) (await screenshotAlbumIds()).forEach((id) => ids.add(id));
    if (ids.size === 0) assets = await readAll(range); // no camera folder found: fall back to everything
    else for (const id of ids) assets.push(...(await readAll(range, id)));
  } else {
    assets = await readAll(range);
    if (!sources.screenshots) assets = assets.filter((a) => !a.mediaSubtypes?.includes('screenshot'));
    const on = new Set(sources.extraAlbums);
    const hidden = (await listSourceAlbums()).filter((a) => a.kind === 'other' && !on.has(a.id));
    const drop = new Set<string>();
    for (const a of hidden) (await readAll(range, a.id)).forEach((x) => drop.add(x.id));
    assets = assets.filter((a) => !drop.has(a.id));
  }

  const byDay: Record<string, Photo[]> = {};
  const seen = new Set<string>();
  for (const a of assets.sort((x, y) => y.creationTime - x.creationTime)) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    const key = dayKey(new Date(a.creationTime));
    (byDay[key] ||= []).push({ id: a.id, uri: a.uri, takenAt: a.creationTime });
  }
  return byDay;
}
