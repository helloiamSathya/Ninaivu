import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT } from './theme';

export type Tab = 'memories' | 'occasions' | 'settings';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'memories', label: 'Memories', icon: '▦' },
  { id: 'occasions', label: 'Occasions', icon: '★' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

/** Floating pill navigation: the active tab shows its name, the others an icon. */
export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {TABS.map((t) => {
        const on = t.id === tab;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={[styles.item, on && styles.on]}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
          >
            <Text style={[styles.text, on && styles.onText]}>{on ? t.label : t.icon}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', bottom: 24, alignSelf: 'center', flexDirection: 'row', gap: 8,
    padding: 8, borderRadius: 40, backgroundColor: COLORS.chip,
  },
  item: { minWidth: 56, height: 46, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  on: { backgroundColor: COLORS.primary, minWidth: 104 },
  text: { fontFamily: FONT, fontSize: 18, color: COLORS.ink },
  onText: { fontSize: 13, color: COLORS.onPrimary, fontWeight: '600' },
});
