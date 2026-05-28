# Mobile UI Kit — THREE by 363™

Pixel-faithful recreation of the React Native / Expo app. Two iPhone frames sit side-by-side: the **left** device is fully interactive (tap the bottom tabs to switch screens, type in the Today input, submit to see the morph animation, browse the calendar); the **right** device is locked to the **Today → submitted** state so you can compare both halves of the write flow without filling the form.

## Files

| File | What it is |
|---|---|
| `index.html`         | The page — wires React + Babel, loads each JSX, mounts two `<IOSDevice>` phones |
| `ios-frame.jsx`      | iOS 26 device shell (starter component, dark mode) |
| `Icons.jsx`          | Inline Lucide subset — `<Icon name="…" />` |
| `TabBar.jsx`         | 5-tab bottom nav + `<AppHeader>` |
| `TodayScreen.jsx`    | Writing flow: input, counter, animated pill→circle button, confirmation sheet, submitted EntryCard |
| `HistoryScreen.jsx`  | Calendar with seeded entries, month nav, "Rest day" empty state, 363 philosophy footer |
| `InsightsScreen.jsx` | Streak counter + progress to 363, daily prompt card, AI reflection CTA, weekly bar chart, philosophy cards |
| `SocialScreen.jsx`   | Friends list / Requests tabs, search bar, suggested friends, friend-request actions |
| `SettingsScreen.jsx` | Profile card, grouped settings sections with toggles |

## What's faithful, what's simplified

**Faithful:**
- The submit button's `pill → 56px circle → checkmark` morph (300ms brand-spring).
- Sentence counter color logic — gray below 3, white at 3, red over 3.
- Confirmation sheet copy and *Presence over perfection.* highlight.
- Calendar grid with `dot = entry`, `ring = today`, dimmed past-empty days.
- Streak card layout exactly matches `StreakCounter.tsx`.
- Weekly bar uses filled-tall vs empty-short bars and a today-ring outline.
- Lucide icon set at 1.5/2 stroke widths.
- The "PROJECT 363 / 363 DAYS TO BETTER" eyebrow on History.

**Simplified:**
- No real persistence — submitted entries reset on reload.
- No Supabase / no auth / no friend search backend.
- No real `react-native-reanimated` springs; CSS transitions stand in.
- No haptics (Web doesn't have them).
- Calendar is May 2026 only.

## Adding screens

Each screen lives in its own JSX file, attaches itself to `window`, and is composed in `index.html`'s `<App>` via a tab switch. Add a new screen by:

1. Creating `MyScreen.jsx` with `Object.assign(window, { MyScreen });`
2. Adding `<script type="text/babel" src="MyScreen.jsx"></script>` to `index.html`
3. Adding a `{tab === 'my' && <MyScreen />}` line in `<App>`

## Known component name collisions

All style objects use literal inline `style={{ … }}` props rather than a shared `styles` object — this avoids cross-file globals colliding when multiple babel files mount. If you split a screen into helpers, **keep `style={{}}` inline** or namespace any new constant (e.g. `historyStyles`, never `styles`).
