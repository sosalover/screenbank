# ScreenBank Backlog

---

## Notifications
> `expo-notifications` installed (v0.32.17)

- [x] **Build completed** — push when `build.completesAt` passes; copy: "Grover finished planting your tree! Check your grove."; tap → grove screen
- [x] **Daily Sparks earned** — 8am push reporting yesterday's earnings if > 0; copy: "You earned 45 Sparks yesterday. Keep it up!"; tap → grove HUD
- [x] **New cause affordable** — fires once when Spark balance crosses a cause threshold; copy: "You now have enough Sparks to fund ocean cleanup!"; tap → causes tab; deduplicated (only fires once per cause unlock)
- [x] New file: `apps/mobile/lib/notifications.ts` — scheduling helpers
- [x] New file: `apps/mobile/components/NotificationSync.tsx` — wires game state → notifications, handles tap navigation

---

## Payment / RevenueCat

Tiers: **Free** (no donation) / **Planter** ($5/mo) / **Grower** ($10/mo) / **Guardian** ($20/mo)

### Setup checklist (do once)
- [ ] App Store Connect → My Apps → + → New App → bundle ID `com.tmoh.screenbank`
- [ ] Monetization → In-App Purchases → create 3 Auto-Renewable Subscriptions in one Subscription Group ("ScreenBank"):
  - `screenbank_planter_monthly` — Planter Monthly — $4.99
  - `screenbank_grower_monthly` — Grower Monthly — $9.99
  - `screenbank_guardian_monthly` — Guardian Monthly — $19.99
- [ ] RevenueCat → Products: add the 3 product IDs (linked to iOS app)
- [ ] RevenueCat → Entitlements: create `planter`, `grower`, `guardian`, attach matching product to each
- [ ] RevenueCat → Offerings: create default offering with a package for each product
- [ ] Grab RevenueCat public SDK key

### Code
- [ ] Install `react-native-purchases`
- [ ] New file: `apps/mobile/lib/purchases.ts` — init, fetch offerings, purchase, restore
- [ ] On purchase success → update `user_profiles.subscription_tier` in Supabase + local state
- [ ] On app launch → restore purchases and sync tier to local state

---

## Tier Upgrade Prompts

- [ ] **Causes screen** — "Complete 2× faster with Plus ↑" shown below each cause for base tier users
- [ ] **Donation cap hit** — banner: "You've maxed out this month's donations. Upgrade to Plus to do more good."
- [ ] **Grove HUD** — subtle "Earn 2× Sparks" chip next to balance for base tier users
- [ ] **Post-build completion** — "You planted a tree! Upgrade to plant one every 6 days instead of 12."
- [ ] **Unfunded build indicator** — subtle UI difference on builds that didn't trigger a real donation (low priority)

---

## Onboarding / Welcome Screen Updates

- [ ] **Match current app UI** — welcome, sign-up, sign-in, and setup screens should use the same theme system (`AppTheme`), fonts, colors, border radius, and card styles as the main app (grove/causes/account screens)
- [ ] Replace any "minutes" currency language with **Sparks** throughout auth screens
- [ ] Add tier selection screen between sign-up and budget setup
  - $5 / $10 / $20 cards with cause completion time comparison
  - Highlight Plus as recommended
  - "Start Free" option skips payment
- [ ] Update setup screen tagline: "Stay under this limit to earn Sparks each day"

---

## Spark Education Touchpoints

- [ ] **Tutorial step 1** — "Every minute you spend under your daily budget earns you 1 Spark. Sparks power Grover's builds."
- [ ] **Setup screen** — subtitle under budget picker: "Stay under this limit to earn Sparks each day"
- [ ] **HUD tooltip** — long-press on Spark balance shows popover: "Sparks earned = minutes under your daily budget. Earn up to 180 Sparks/day."
- [ ] **First earn toast** — on first `EARN_SPARKS` dispatch: "You earned 45 Sparks by staying under your budget today!"

---

## Screen Time API ⚠️ Blocks real Spark earning

- [ ] Wire real iOS Screen Time data into `useScreenTime.ts` (native module exists at `modules/screen-time/`)
- [ ] Replace mock `screenTimeUsedMinutes` with live data
- [ ] Verify `EARN_SPARKS` dispatch fires correctly from real daily savings
- [ ] `spark_earnings` Supabase table (migration already designed) — record daily earnings once real data flows

---

## Auth / Account

- [ ] Email confirmation UX — custom URL scheme (`grove://`), "Check your email" screen, deep link back into app
- [ ] Sign in with Apple
- [ ] Username/display name — set during signup, stored in Supabase, required for social

---

## Social

- [ ] Friends list
- [ ] Activity feed ("Maya completed a coral rescue · 2h ago")
- [ ] Leaderboard (most Sparks earned this week)
- [ ] Friends' grove thumbnail view

---

## UI / Story Polish

- [ ] Grover idle animations (reading, napping, wandering) when no active build
- [ ] Build completion celebration animation
- [ ] Algorithm raid: Grover visibly reacts (cowers, looks up); post-raid dismissal feels like recovery
- [ ] Cause icon legibility — custom illustrated icons or emoji-based glyphs
- [ ] Onboarding tone — language should feel like Grover guiding the user, not app UI
