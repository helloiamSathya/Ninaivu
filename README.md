# Ninaivu

A photo calendar: see the photos from your phone gallery on the day they were taken, and name each day after its occasion. See [docs/v1-spec.md](docs/v1-spec.md).

## Run (Version 1)
```
npm install
npx expo start        # then open on a phone with a development build
```
Gallery access needs a development build (`npx expo run:android` / `run:ios`), because Expo Go limits photo-library permissions.

## Version 1 scope
- Reads photos from the gallery (never copies them); deleted photos disappear from the calendar.
- Month calendar with a thumbnail on each day that has photos; tap a day to see its photos and name it.
- Occasion suggestions from a built-in list plus personal birthdays/anniversaries (stored in on-device SQLite).

## Folders
- `src/`: app code (screens, database, photo reading, occasions, theme)
- `assets/fonts/`: Geist variable font used across the app
- `docs/`: specs; `PROJECT.md`: decisions, status and open questions
- `design/`: reference UI image and mockups; `assets/brand/`: logo; `scripts/`: logo outline generator
