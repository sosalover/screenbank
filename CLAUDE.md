# ScreenBank

## Vision

ScreenBank helps people reclaim their time by budgeting daily screen time. When users stay under their budget, they earn tokens they can spend to support real-world causes — planting trees, sponsoring a rescue animal, cleaning up ocean plastic, etc. The core loop is: **set a budget → use less → earn tokens → fund something real**.

The app is gamified and social: users can see friends' streaks, compete on leaderboards, and celebrate each other's milestones.

## Repo Structure

Monorepo managed with Turborepo.

```
screenbank/
├── apps/
│   ├── mobile/          # Expo (React Native) iOS/Android app
│   └── backend/         # (future) API server — likely Node + Supabase
├── packages/
│   └── shared/          # (future) shared TypeScript types and utilities
├── CLAUDE.md
├── turbo.json
└── package.json
```

## Tech Stack

### Mobile (`apps/mobile`)

- **Expo SDK 54** with New Architecture enabled
- **Expo Router v3** — file-based routing
- **React Native 0.81** with TypeScript (strict mode)
- **NativeWind v4** — Tailwind CSS for React Native styling
- Path alias: `@/*` → root of `apps/mobile`

### Backend (future)

- **Supabase** — managed Postgres, auth, realtime, edge functions
- **Node.js / TypeScript** for any custom API logic

## Key Concepts

- **Screen Budget**: daily time limit set by the user, pulled from iOS Screen Time API (future)
- **Tokens**: currency earned by staying under budget; 1 token per 1 minute under budget
- **Causes**: real-world impact campaigns (trees, puppies, ocean cleanup, etc.) users can spend tokens on
- **Streaks**: consecutive days under budget
- **Social**: friends list, activity feed, leaderboard

## Navigation Structure

```
(tabs)/
├── index       — Home: daily budget progress, token balance, streak
├── bank        — Bank: token history, spending, causes marketplace
├── social      — Social: friends activity, leaderboards
└── profile     — Profile: settings, history, account
```

## Development

### Running the app

```bash
# From repo root
npm run mobile

# Or directly
cd apps/mobile && npm start
```

Then scan the QR code with **Expo Go** on your iPhone. The `EXPO_ROUTER_APP_ROOT` env var is set in the npm scripts — always use `npm start` rather than `npx expo start` directly.

> Note: iOS simulator requires full Xcode (not currently installed). Use physical device via Expo Go.

### Adding packages (always use expo install for native packages)

```bash
cd apps/mobile
npx expo install <package-name>
```

### Testing

Testing is done via the **iOS Simulator** (Xcode is now installed). Run `npm run mobile` from the repo root, then press `i` to open in simulator.

## Backlog

**ALWAYS read `/Users/thomasmoh/Documents/Github/screenbank/BACKLOG.md` at the very start of every work session before doing anything else.** It is the source of truth for what's planned, prioritized, and in progress.

## Current Status

Core app is built and running (auth, grove scene, causes, Sparks economy, Supabase DB). Screen Time API integration is in progress.

### Screen Time API status

- Apple Developer account purchased, **pending activation** (24–48h)
- Native module (`modules/screen-time/`) is written and the Xcode project has the entitlements (`com.apple.developer.family-controls`, App Group `group.com.tmoh.screenbank`)
- Authorization + daily monitoring schedule + budget-exceeded → Algorithm Raid + end-of-day Spark earning are all wired up in JS
- **Still needs Xcode setup:** DeviceActivity Monitor Extension target (`ScreenTimeMonitor`) must be added manually in Xcode once the developer account is active
- **Next step after account activates:** implement 10-minute threshold events to track `screenTimeUsedMinutes` in real time (DeviceActivity only exposes threshold crossings, not raw usage — plan is to set thresholds every 10 min up to the budget and use `lastCrossedMinutes` as an approximation). Test on device before finalizing.

## Solo Developer Notes

- Keep it simple. Avoid premature abstraction.
- Supabase handles auth + DB — don't build custom auth.
- Start mobile-only (iOS); Android comes later with the same codebase.
- The cause/reward system (trees vs puppies vs etc.) should be data-driven so new causes can be added without code changes.
