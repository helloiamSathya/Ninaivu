import * as MediaLibrary from 'expo-media-library/legacy';
import { dayKey } from './dates';

export type Photo = { id: string; uri: string; takenAt: number };

export async function ensurePhotoPermission(): Promise<boolean> {
  const current = await MediaLibrary.getPermissionsAsync(false, ['photo']);
  if (current.granted) return true;
  const asked = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  return asked.granted;
}

/**
 * Reads photos taken in one month straight from the phone gallery and groups
 * them by local day. Nothing is copied: deleted photos simply stop appearing.
 */
export async function loadMonthPhotos(
  year: number,
  month: number,
): Promise<Record<string, Photo[]>> {
  const createdAfter = new Date(year, month, 1).getTime();
  const createdBefore = new Date(year, month + 1, 1).getTime();
  const byDay: Record<string, Photo[]> = {};
  let after: string | undefined;
  for (;;) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
      createdAfter,
      createdBefore,
      first: 500,
      after,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    for (const a of page.assets) {
      const key = dayKey(new Date(a.creationTime));
      (byDay[key] ||= []).push({ id: a.id, uri: a.uri, takenAt: a.creationTime });
    }
    if (!page.hasNextPage) break;
    after = page.endCursor;
  }
  return byDay;
}
