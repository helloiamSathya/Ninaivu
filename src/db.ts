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
