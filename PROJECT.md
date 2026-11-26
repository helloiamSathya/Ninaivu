# Ninaivu: project details

Last updated: 2026-11-26. Owner: Sathya Narayanan S (GitHub: helloiamSathya).

## What it is
A photo calendar for iOS and Android. It shows each photo on the day it was taken and lets you name a day after its occasion (e.g. "Pongal", "Amma's birthday"). Meant for everyone. Tamil "Ninaivu" means "memory".

## Decisions made
| Topic | Decision |
|---|---|
| Platforms | iOS and Android, one codebase |
| Version 1 | Local only: reads photos from the phone gallery, never copies them; deleted photos disappear from the calendar |
| Day names | Manual naming plus suggestions from occasions (festivals, holidays, saved birthdays/anniversaries) |
| Version 2 (Premium) | Cloud backup with high-quality compression, so backed-up photos stay in the calendar even if deleted from the phone |
| Language | English only for Version 1 (confirmed "Yes") |
| App name | Ninaivu (confirmed) |
| Look | Rounded pill buttons, large rounded cards, dark pill bottom nav, week strip (layout style from the reference image) |
| Colours | Owner's 5 colours: Space Indigo #151E3F, Prussian Blue #030027, Beige #F2F3D9, Light Bronze #DC9E82, Dusty Rose #C16E70 |
| Logo | Wordmark "Ninaivu" in Gotti VF (design/brand/ninaivu-logo-gotti.svg); opening line-draw animation, then the app starts |
| Font | Geist (variable font supplied by owner) |

## Tech
- React Native + Expo (TypeScript), expo-media-library (legacy API, per-month queries), expo-sqlite for day names and personal events.
- Bundle IDs: `app.ninaivu.calendar` (iOS and Android).

## Code
- Repo: https://github.com/helloiamSathya/Ninaivu
- Figma UI board: https://www.figma.com/design/ZFE2V9x9FcrpHvJvjpy21i (pages: Foundations, Screens with 16 wired screens, Flow map)
- PR #1 (open): month calendar, day screen, SQLite names, occasion suggestions. https://github.com/helloiamSathya/Ninaivu/pull/1

## Status
- [x] Foundations spec
- [x] Repo connected
- [x] Version 1 first slice (PR #1, not yet tested on a real phone)
- [x] UI mockups in the reference style, with Geist
- [x] Figma UI board with navigation (16 screens, prototype wired)
- [x] Palette and Splash line-draw animation in the app (stand-in outlines, see below)
- [ ] Rebuild app screens to match the Figma board (bottom nav, header, occasions, settings, premium)
- [ ] Lunar festival dates table (Pongal, Diwali)
- [ ] Screen to add birthdays/anniversaries
- [ ] Device testing and beta builds (TestFlight, Google Play internal testing)
- [ ] Version 2: Premium cloud backup design (backend, sign-in, subscriptions, compression)

## What the owner needs to provide
- Apple Developer account (about $99/year) and Google Play developer account ($25 one-time).
- A real iPhone and Android phone for testing (gallery access needs a development build).

## Open questions
- Logo font: Gotti VF is not installed anywhere I can use. Please send the Gotti VF .ttf (or the logo converted to outlines) so the splash animation and Figma use the real wordmark. Until then a stand-in serif is used; regenerate with `python3 scripts/outline-logo.py <font.ttf> Ninaivu`.
- Keep the Occasions tab shown in the mockups?
- Backend choice for Version 2 (Supabase or Firebase are candidates).

## Folder map (this shared folder, /mnt/project-files/ninaivu)
- `PROJECT.md`: this file
- `docs/`: written specs (`v1-spec.md`)
- `design/reference/`: the reference UI image from the owner
- `design/fonts/`: Geist-VariableFont_wght.ttf
- `design/mockups/`: early PNG mockups (lilac, superseded by the Figma board)
- `design/brand/`: logo SVG from the owner
- `design/figma/`: exported previews of the Figma board
