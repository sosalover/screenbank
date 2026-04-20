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
- **Expo SDK 55** with New Architecture enabled
- **Expo Router v4** — file-based routing
- **React Native 0.81** with TypeScript (strict mode)
- **NativeWind v4** — Tailwind CSS for React Native styling
- Path alias: `@/*` → root of `apps/mobile`

### Backend (future)
- **Supabase** — managed Postgres, auth, realtime, edge functions
- **Node.js / TypeScript** for any custom API logic

## Key Concepts

- **Screen Budget**: daily time limit set by the user, pulled from iOS Screen Time API (future)
- **Tokens**: currency earned by staying under budget; 1 token per X minutes under budget (TBD)
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
cd apps/mobile && npx expo start
```

Then scan the QR code with **Expo Go** on your iPhone, or press `i` for iOS simulator (requires full Xcode).

### Adding packages (always use expo install for native packages)

```bash
cd apps/mobile
npx expo install <package-name>
```

### No Xcode installed

Testing is done via **Expo Go** on a physical iPhone. Install Expo Go from the App Store, then scan the QR code from `npx expo start`.

## Current Status

Scaffold only — placeholder screens in place. No real screen time integration yet.

## Solo Developer Notes

- Keep it simple. Avoid premature abstraction.
- Supabase handles auth + DB — don't build custom auth.
- Start mobile-only (iOS); Android comes later with the same codebase.
- The cause/reward system (trees vs puppies vs etc.) should be data-driven so new causes can be added without code changes.
