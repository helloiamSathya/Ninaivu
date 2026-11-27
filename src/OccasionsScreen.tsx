import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MONTH_NAMES } from './dates';
import { addPersonalEvent, deletePersonalEvent, getPersonalEvents, PersonalEvent } from './db';
import { FIXED_OCCASIONS } from './occasions';
import { COLORS, FONT, PASTEL } from './theme';

const KINDS = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'other', label: 'Other' },
] as const;
const TINTS = [PASTEL.pink, PASTEL.sky, PASTEL.mist, PASTEL.blush, PASTEL.fog, PASTEL.sage];
const short = (m: number, d: number) => `${d} ${MONTH_NAMES[m - 1].slice(0, 3)}`;

/** Occasions: the user's own dates plus the built-in festival list. They become name suggestions on the calendar. */
export default function OccasionsScreen({ onChanged }: { onChanged: () => void }) {
  const [mine, setMine] = useState<PersonalEvent[]>([]);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<string>('birthday');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // "DD/MM"

  const load = useCallback(() => getPersonalEvents().then(setMine), []);
  useEffect(() => {
    load();
  }, [load]);

  const parsed = (() => {
    const m = date.match(/^(\d{1,2})\s*[/.-]\s*(\d{1,2})$/);
    if (!m) return null;
    const d = +m[1], mo = +m[2];
    return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? { day: d, month: mo } : null;
  })();

  const save = async () => {
    if (!title.trim() || !parsed) return;
    await addPersonalEvent({ kind, title: title.trim(), ...parsed });
    setTitle(''); setDate(''); setAdding(false);
    await load();
    onChanged();
  };

  const remove = async (id: number) => {
    await deletePersonalEvent(id);
    await load();
    onChanged();
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      <View style={styles.hd}>
        <View>
          <Text style={styles.title}>Occasions</Text>
          <Text style={styles.sub}>Suggested names for your days</Text>
        </View>
        <Pressable style={styles.plus} onPress={() => setAdding((a) => !a)} accessibilityLabel="Add occasion">
          <Text style={styles.plusText}>{adding ? '×' : '＋'}</Text>
        </Pressable>
      </View>

      {adding && (
        <View style={styles.form}>
          <View style={styles.kinds}>
            {KINDS.map((k) => (
              <Pressable key={k.id} onPress={() => setKind(k.id)} style={[styles.chip, kind === k.id && styles.chipOn]}>
                <Text style={[styles.chipText, kind === k.id && styles.chipTextOn]}>{k.label}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput style={styles.input} placeholder={kind === 'birthday' ? 'Whose birthday? e.g. Amma' : 'Name, e.g. Wedding anniversary'} value={title} onChangeText={setTitle} placeholderTextColor={COLORS.muted} />
          <TextInput style={styles.input} placeholder="Date as DD/MM, e.g. 12/12" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" placeholderTextColor={COLORS.muted} />
          <Pressable style={[styles.btn, !(title.trim() && parsed) && { opacity: 0.4 }]} onPress={save}>
            <Text style={styles.btnText}>Save occasion</Text>
          </Pressable>
        </View>
      )}

      {mine.length > 0 && <Text style={styles.section}>Yours</Text>}
      {mine.map((e, i) => (
        <View key={e.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: TINTS[i % TINTS.length] }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{e.kind === 'birthday' ? `${e.title}'s birthday` : e.title}</Text>
            <Text style={styles.meta}>{short(e.month, e.day)} · {KINDS.find((k) => k.id === e.kind)?.label ?? 'Personal'}</Text>
          </View>
          <Pressable onPress={() => remove(e.id)} hitSlop={10} accessibilityLabel={`Remove ${e.title}`}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.section}>Festivals and days</Text>
      {FIXED_OCCASIONS.map((o, i) => (
        <View key={o.name} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: TINTS[(i + 2) % TINTS.length] }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{o.name}</Text>
            <Text style={styles.meta}>{short(o.month, o.day)} · Every year</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  hd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontFamily: FONT, fontSize: 26, fontWeight: '600', color: COLORS.ink },
  sub: { fontFamily: FONT, fontSize: 12, color: COLORS.muted, marginTop: 2 },
  plus: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  plusText: { fontSize: 20, color: COLORS.ink },
  form: { backgroundColor: COLORS.surface, borderRadius: 22, padding: 14, marginBottom: 12, gap: 10 },
  kinds: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.chip },
  chipOn: { backgroundColor: COLORS.primary },
  chipText: { fontFamily: FONT, fontSize: 12, color: COLORS.ink },
  chipTextOn: { color: COLORS.onPrimary },
  input: { fontFamily: FONT, fontSize: 15, backgroundColor: COLORS.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.ink },
  btn: { backgroundColor: COLORS.primary, borderRadius: 24, height: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: FONT, fontSize: 15, fontWeight: '600', color: COLORS.onPrimary },
  section: { fontFamily: FONT, fontSize: 13, fontWeight: '600', color: COLORS.muted, marginTop: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surface, borderRadius: 20, padding: 14, marginBottom: 8 },
  dot: { width: 40, height: 40, borderRadius: 13 },
  name: { fontFamily: FONT, fontSize: 15, fontWeight: '600', color: COLORS.ink },
  meta: { fontFamily: FONT, fontSize: 12, color: COLORS.muted, marginTop: 2 },
  remove: { fontFamily: FONT, fontSize: 12, color: COLORS.accent2 },
});
