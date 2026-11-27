import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { DEFAULT_SOURCES, getSources, listSourceAlbums, saveSources, SourceAlbum, SourceSettings } from './sources';
import { COLORS, FONT } from './theme';

/** Settings > Photo sources: choose which gallery folders appear on the calendar. */
export default function SourcesScreen({ onClose }: { onClose: (changed: boolean) => void }) {
  const [albums, setAlbums] = useState<SourceAlbum[]>([]);
  const [s, setS] = useState<SourceSettings>(DEFAULT_SOURCES);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    Promise.all([listSourceAlbums(), getSources()]).then(([a, cur]) => {
      setAlbums(a);
      setS(cur);
    });
  }, []);

  const update = (next: SourceSettings) => {
    setS(next);
    setChanged(true);
    saveSources(next);
  };
  const toggleAlbum = (id: string, on: boolean) =>
    update({ ...s, extraAlbums: on ? [...s.extraAlbums, id] : s.extraAlbums.filter((x) => x !== id) });

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => onClose(changed)} hitSlop={12} accessibilityLabel="Back">
        <Text style={styles.back}>‹ Settings</Text>
      </Pressable>
      <Text style={styles.title}>Photo sources</Text>
      <Text style={styles.sub}>Choose which folders show on your calendar. Camera photos are always on.</Text>

      {albums.map((a) => {
        const camera = a.kind === 'camera';
        const value = camera || (a.kind === 'screenshots' ? s.screenshots : s.extraAlbums.includes(a.id));
        return (
          <View key={a.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{a.title}</Text>
              <Text style={styles.count}>{a.count} photos</Text>
            </View>
            <Switch
              value={value}
              disabled={camera}
              trackColor={{ true: COLORS.primary, false: COLORS.line }}
              onValueChange={(on) => (a.kind === 'screenshots' ? update({ ...s, screenshots: on }) : toggleAlbum(a.id, on))}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  back: { fontFamily: FONT, fontSize: 16, color: COLORS.ink, marginBottom: 12 },
  title: { fontFamily: FONT, fontSize: 28, fontWeight: '600', color: COLORS.ink },
  sub: { fontFamily: FONT, fontSize: 14, color: COLORS.muted, marginTop: 6, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 18, padding: 14, marginBottom: 8 },
  name: { fontFamily: FONT, fontSize: 15, fontWeight: '600', color: COLORS.ink },
  count: { fontFamily: FONT, fontSize: 12, color: COLORS.muted, marginTop: 2 },
});
