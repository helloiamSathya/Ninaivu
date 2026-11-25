# Ninaivu: Foundations Spec (Step 1)

## Product
A photo calendar for everyone, on iOS and Android. Each day shows the photos taken that day, and each day can carry a name or occasion (e.g. "Pongal", "Amma's birthday").

## Version 1 (local only)
- Reads photos and "date taken" directly from the phone gallery. Photos are never copied or uploaded.
- If a photo is deleted from the phone, it disappears from the calendar.
- The app stores only small metadata on the device: day names, occasions, user-added birthdays/anniversaries.
- Screens: permission screen -> month calendar with a thumbnail on days that have photos -> day screen (photo grid + name/occasion editor).
- Occasion suggestions: built-in festival/holiday list (India-first, selectable by region/religion), plus user-added birthdays and anniversaries.

## Tech choices
- React Native + Expo (TypeScript): one codebase for iOS and Android.
- Gallery access: expo-media-library (reads creationTime per asset).
- Local storage: SQLite (expo-sqlite) for names/occasions.
- Calendar UI: custom month grid (full control over thumbnails per day).
- Performance: index photo dates once, then update incrementally; load thumbnails lazily.

## Version 2: Premium cloud backup (not in V1)
- Account sign-in, subscription (App Store / Google Play billing, e.g. via RevenueCat).
- Backend: object storage + database (Supabase or Firebase are candidates).
- Compression that preserves quality: HEIC/AVIF at high quality, or original-quality storage with dedup. Decide after V1 using real photo samples.
- Backed-up photos keep showing in the calendar even if deleted from the phone.

## Open items for the owner
1. App look: pick colors/style, or accept a proposed one.
2. Apple Developer account (~$99/yr) and Google Play developer account ($25 one-time) before release.
3. Real iPhone and Android phone for testing.
4. Languages: English only at first, or Tamil as well?
5. Confirm app name "Ninaivu" is final (Tamil for "memory").
