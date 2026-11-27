import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSources, listSourceAlbums } from './sources';
import { COLORS, FONT, PASTEL } from './theme';

type Props = { onOpenSources: () => void; refreshToken: number };

export default function SettingsScreen({ onOpenSources, refreshToken }: Props) {
  const [sourcesSummary, setSummary] = useState('Camera only');

  useEffect(() => {
    Promise.all([getSources(), listSourceAlbums()]).then(([s, albums]) => {
      const extra = albums.filter((a) => s.extraAlbums.includes(a.id)).length;
      const parts = ['Camera' + (extra ? ` + ${extra} folder${extra > 1 ? 's' : ''}` : ' only')];
      parts.push(s.screenshots ? 'screenshots on' : 'screenshots off');
      setSummary(parts.join(' · '));
    });
  }, [refreshToken]);

  const Row = ({ icon, title, sub, onPress, tint }: { icon: string; title: string; sub: string; onPress?: () => void; tint?: string }) => (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[styles.icon, tint ? { backgroundColor: tint } : null]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{title}</Text>
        <Text style={styles.meta}>{sub}</Text>
      </View>
      {onPress && <Text style={styles.chev}>›</Text>}
    </Pressable>
  );

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      <Text style={styles.title}>Settings</Text>
      <Row icon="📁" title="Photo sources" sub={sourcesSummary} onPress={onOpenSources} tint={PASTEL.sky} />
      <Row icon="📷" title="Photo access" sub="Change in your phone settings" onPress={() => Linking.openSettings()} />
      <Row icon="🔒" title="Privacy" sub="Photos never leave this phone" />
      <View style={styles.prem}>
        <Text style={styles.premTitle}>Ninaivu Premium</Text>
        <Text style={styles.premText}>
          Back up your photos to the cloud with smart compression, with no visible quality loss. Deleted photos stay on your calendar.
        </Text>
        <View style={styles.soon}>
          <Text style={styles.soonText}>Coming soon</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontFamily: FONT, fontSize: 26, fontWeight: '600', color: COLORS.ink, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surface, borderRadius: 20, padding: 14, marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: FONT, fontSize: 15, fontWeight: '600', color: COLORS.ink },
  meta: { fontFamily: FONT, fontSize: 12, color: COLORS.muted, marginTop: 2 },
  chev: { fontSize: 22, color: COLORS.muted },
  prem: { marginTop: 8, borderRadius: 26, padding: 20, backgroundColor: PASTEL.pink },
  premTitle: { fontFamily: FONT, fontSize: 16, fontWeight: '600', color: COLORS.ink },
  premText: { fontFamily: FONT, fontSize: 13, lineHeight: 19, color: COLORS.ink, marginTop: 6 },
  soon: { marginTop: 14, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: 0.6 },
  soonText: { fontFamily: FONT, fontSize: 14, fontWeight: '600', color: COLORS.onPrimary },
});
