import { FONT } from './theme';
import { useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { setDayName } from './db';
import { Photo } from './photos';

type Props = {
  day: string;
  photos: Photo[];
  suggestions: string[];
  name?: string;
  onClose: (changed: boolean) => void;
};

const SIZE = Dimensions.get('window').width / 3;

export default function DayScreen({ day, photos, suggestions, name, onClose }: Props) {
  const [text, setText] = useState(name ?? '');

  const save = async (value: string) => {
    await setDayName(day, value);
    onClose(true);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Pressable onPress={() => onClose(false)} hitSlop={12}>
          <Text style={styles.link}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>{day}</Text>
        <Pressable onPress={() => save(text)} hitSlop={12}>
          <Text style={styles.link}>Save</Text>
        </Pressable>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Name this day (e.g. Pongal)"
        style={styles.input}
        maxLength={60}
      />
      {suggestions.length > 0 && (
        <View style={styles.chips}>
          {suggestions.map((s) => (
            <Pressable key={s} style={styles.chip} onPress={() => setText(s)}>
              <Text>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<Text style={styles.empty}>No photos taken on this day.</Text>}
        renderItem={({ item }) => <Image source={{ uri: item.uri }} style={{ width: SIZE, height: SIZE }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontFamily: FONT, fontSize: 18, fontWeight: '600' },
  link: { color: '#2f6fed', fontFamily: FONT, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, margin: 12, padding: 10, fontFamily: FONT, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  chip: { backgroundColor: '#e8efff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
});
