import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import CalendarScreen from './src/CalendarScreen';
import DayScreen from './src/DayScreen';
import { ensurePhotoPermission, Photo } from './src/photos';

type OpenDay = { day: string; photos: Photo[]; suggestions: string[]; name?: string };

export default function App() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [open, setOpen] = useState<OpenDay | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    ensurePhotoPermission().then(setGranted);
  }, []);

  if (granted === null) return <SafeAreaView style={styles.center} />;

  if (!granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.heading}>Ninaivu needs your photos</Text>
        <Text style={styles.body}>
          Photos stay on your phone. Ninaivu only reads them to show each one on the day it was taken.
        </Text>
        <Pressable style={styles.button} onPress={() => ensurePhotoPermission().then(setGranted)}>
          <Text style={styles.buttonText}>Allow photo access</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fill}>
      <StatusBar style="dark" />
      {open ? (
        <DayScreen
          {...open}
          onClose={(changed) => {
            setOpen(null);
            if (changed) setRefreshToken((t) => t + 1);
          }}
        />
      ) : (
        <ScrollView>
          <CalendarScreen
            refreshToken={refreshToken}
            onOpenDay={(day, photos, suggestions, name) => setOpen({ day, photos, suggestions, name })}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  body: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#2f6fed', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
