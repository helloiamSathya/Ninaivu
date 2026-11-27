import { getPersonalEvents } from './db';

/**
 * Starter list of fixed-date occasions (month is 1-12). Lunar festivals such as
 * Diwali or Pongal move every year and need a yearly table; that comes next.
 */
export const FIXED_OCCASIONS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 1, day: 26, name: 'Republic Day' },
  { month: 2, day: 14, name: "Valentine's Day" },
  { month: 3, day: 8, name: "Women's Day" },
  { month: 4, day: 14, name: 'Tamil New Year' },
  { month: 5, day: 1, name: 'Labour Day' },
  { month: 8, day: 15, name: 'Independence Day' },
  { month: 10, day: 2, name: 'Gandhi Jayanti' },
  { month: 11, day: 14, name: "Children's Day" },
  { month: 12, day: 25, name: 'Christmas' },
  { month: 12, day: 31, name: "New Year's Eve" },
];

/** Suggested occasion names per day-key for one month (user events included). */
export async function suggestionsForMonth(year: number, month: number): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  const add = (m: number, d: number, name: string) => {
    if (m !== month + 1) return;
    const key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    (out[key] ||= []).push(name);
  };
  FIXED_OCCASIONS.forEach((o) => add(o.month, o.day, o.name));
  (await getPersonalEvents()).forEach((e) =>
    add(e.month, e.day, e.kind === 'birthday' ? `${e.title}'s birthday` : e.title),
  );
  return out;
}
