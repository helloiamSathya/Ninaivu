import { FONT } from './theme';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MONTH_NAMES, WEEKDAYS, dayKey, monthGrid } from './dates';
import { getDayNames } from './db';
import { suggestionsForMonth } from './occasions';
import { loadMonthPhotos, Photo } from './photos';

type Props = { onOpenDay: (day: string, photos: Photo[], suggestions: string[], name?: string) => void; refreshToken: number };

export default function CalendarScreen({ onOpenDay, refreshToken }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const [p, n, s] = await Promise.all([
      loadMonthPhotos(year, month),
      getDayNames(prefix),
      suggestionsForMonth(year, month),
    ]);
    setPhotos(p);
    setNames(n);
    setSuggestions(s);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const todayKey = dayKey(now);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => shift(-1)} hitSlop={12} accessibilityLabel="Previous month">
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.title}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <Pressable onPress={() => shift(1)} hitSlop={12} accessibilityLabel="Next month">
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {monthGrid(year, month).map((week, i) => (
        <View key={i} style={styles.row}>
          {week.map((date, j) => {
            if (!date) return <View key={j} style={styles.cell} />;
            const key = dayKey(date);
            const dayPhotos = photos[key] ?? [];
            const name = names[key] ?? suggestions[key]?.[0];
            return (
              <Pressable
                key={j}
                style={[styles.cell, key === todayKey && styles.today]}
                onPress={() => onOpenDay(key, dayPhotos, suggestions[key] ?? [], names[key])}
              >
                {dayPhotos[0] && <Image source={{ uri: dayPhotos[0].uri }} style={StyleSheet.absoluteFill} />}
                <Text style={[styles.dayNum, dayPhotos[0] && styles.onPhoto]}>{date.getDate()}</Text>
                {dayPhotos.length > 1 && <Text style={styles.count}>{dayPhotos.length}</Text>}
                {name && (
                  <Text numberOfLines={1} style={[styles.label, !names[key] && styles.suggested]}>
                    {name}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8 },
  title: { fontFamily: FONT, fontSize: 20, fontWeight: '600' },
  arrow: { fontFamily: FONT, fontSize: 32, paddingHorizontal: 12 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: '#666', paddingVertical: 4 },
  cell: { flex: 1, aspectRatio: 0.7, margin: 1, backgroundColor: '#f2f2f2', borderRadius: 6, overflow: 'hidden', padding: 3 },
  today: { borderWidth: 2, borderColor: '#2f6fed' },
  dayNum: { fontFamily: FONT, fontSize: 12, fontWeight: '600' },
  onPhoto: { color: '#fff', textShadowColor: '#000', textShadowRadius: 3 },
  count: { position: 'absolute', top: 2, right: 4, fontFamily: FONT, fontSize: 10, color: '#fff', textShadowColor: '#000', textShadowRadius: 3 },
  label: { position: 'absolute', bottom: 0, left: 0, right: 0, fontFamily: FONT, fontSize: 9, backgroundColor: 'rgba(47,111,237,0.85)', color: '#fff', paddingHorizontal: 2 },
  suggested: { backgroundColor: 'rgba(0,0,0,0.45)', fontStyle: 'italic' },
});
