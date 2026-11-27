import { COLORS, FONT } from './src/theme';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Splash from './src/Splash';
import CalendarScreen from './src/CalendarScreen';
import DayScreen from './src/DayScreen';
import SourcesScreen from './src/SourcesScreen';
import BottomNav, { Tab } from './src/BottomNav';
import OccasionsScreen from './src/OccasionsScreen';
import SettingsScreen from './src/SettingsScreen';
import { ensurePhotoPermission, Photo } from './src/photos';

type OpenDay = { day: string; photos: Photo[]; suggestions: string[]; name?: string };

export default function App() {
  const [fontsLoaded] = useFonts({ [FONT]: require('./assets/fonts/Geist-VariableFont_wght.ttf') });
  const [splashDone, setSplashDone] = useState(false);
  const [granted, setGranted] = useState<boolean | null>(null);
  const [open, setOpen] = useState<OpenDay | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [sources, setSources] = useState(false);
  const [tab, setTab] = useState<Tab>('memories');
  const bump = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    ensurePhotoPermission().then(setGranted);
  }, []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: COLORS.deep }} />;
  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />;
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
      {sources ? (
        <SourcesScreen
          onClose={(changed) => {
            setSources(false);
            if (changed) setRefreshToken((t) => t + 1);
          }}
        />
      ) : open ? (
        <DayScreen
          {...open}
          onClose={(changed) => {
            setOpen(null);
            if (changed) setRefreshToken((t) => t + 1);
          }}
        />
      ) : (
        <View style={styles.fill}>
          {tab === 'memories' && (
            <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
              <CalendarScreen
                refreshToken={refreshToken}
                onOpenDay={(day, photos, suggestions, name) => setOpen({ day, photos, suggestions, name })}
              />
            </ScrollView>
          )}
          {tab === 'occasions' && <OccasionsScreen onChanged={bump} />}
          {tab === 'settings' && <SettingsScreen refreshToken={refreshToken} onOpenSources={() => setSources(true)} />}
          <BottomNav tab={tab} onChange={setTab} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { fontFamily: FONT, fontSize: 22, fontWeight: '600', marginBottom: 12 },
  body: { fontFamily: FONT, fontSize: 16, color: COLORS.muted, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: COLORS.onPrimary, fontFamily: FONT, fontSize: 16, fontWeight: '600' },
});
