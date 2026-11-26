import * as SQLite from 'expo-sqlite';

export type DayName = { day: string; name: string };

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  dbPromise ||= (async () => {
    const db = await SQLite.openDatabaseAsync('ninaivu.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS day_names (day TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS personal_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL,            -- 'birthday' | 'anniversary'
        title TEXT NOT NULL,
        month INTEGER NOT NULL,        -- 1-12
        day INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS photo_colors (photo_id TEXT PRIMARY KEY NOT NULL, color TEXT NOT NULL);
    `);
    return db;
  })();
  return dbPromise;
}

export async function getDayNames(prefix: string): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.getAllAsync<DayName>(
    'SELECT day, name FROM day_names WHERE day LIKE ?',
    `${prefix}%`,
  );
  return Object.fromEntries(rows.map((r) => [r.day, r.name]));
}

export async function setDayName(day: string, name: string) {
  const db = await getDb();
  if (name.trim() === '') await db.runAsync('DELETE FROM day_names WHERE day = ?', day);
  else
    await db.runAsync(
      'INSERT INTO day_names (day, name) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET name = excluded.name',
      day,
      name.trim(),
    );
}

export type PersonalEvent = { id: number; kind: string; title: string; month: number; day: number };

export async function getPersonalEvents(): Promise<PersonalEvent[]> {
  const db = await getDb();
  return db.getAllAsync<PersonalEvent>('SELECT * FROM personal_events');
}

export async function addPersonalEvent(e: Omit<PersonalEvent, 'id'>) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO personal_events (kind, title, month, day) VALUES (?, ?, ?, ?)',
    e.kind,
    e.title,
    e.month,
    e.day,
  );
}

export async function getPhotoColors(ids: string[]): Promise<Record<string, string>> {
  if (!ids.length) return {};
  const db = await getDb();
  const out: Record<string, string> = {};
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const rows = await db.getAllAsync<{ photo_id: string; color: string }>(
      `SELECT photo_id, color FROM photo_colors WHERE photo_id IN (${chunk.map(() => '?').join(',')})`,
      ...chunk,
    );
    for (const r of rows) out[r.photo_id] = r.color;
  }
  return out;
}

export async function setPhotoColor(id: string, color: string) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO photo_colors (photo_id, color) VALUES (?, ?)', id, color);
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row ? (JSON.parse(row.value) as T) : fallback;
}

export async function setSetting(key: string, value: unknown) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, JSON.stringify(value));
}

export async function deletePersonalEvent(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM personal_events WHERE id = ?', id);
}
