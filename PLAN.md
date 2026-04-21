# Grove — Product Plan

## Vision

The Algorithm is stealing your time. Every minute you spend scrolling, it grows stronger. Grove lets you take that time back — and spend it on something real.

You are in charge of managing your Grove, a virtual homeland. You earn minutes by staying under your daily screen time budget. Like a builder in Clash of Clans, these things take actual time to complete. When they finish, they appear in your grove — a living record of the attention you reclaimed. When you complete the construction of an item, say a tree, this actually completes in the real world. A tree will be planted somewhere, the ocean will be cleaned up, etc. Via charities.

When you slip over screen time budget, The Algorithm interferes. Not by stealing your minutes — but by delaying your builds. Because in Grove, time is everything.

---

## The Core Loop

```
Set a screen time budget
       ↓
Stay under → earn minutes
       ↓
Queue a real-world cause (costs minutes, takes real time to complete)
       ↓
Grove grows as builds complete
       ↓
Go over budget → The Algorithm delays your active builds
       ↓
Get back on track → builds resume
```

---

## Currency: Minutes

- **Earned:** 1 minute under budget = 1 minute of currency
- **Spent:** queuing charitable actions
- **No invented token name** — the currency is literally time
- The emotional core: _"I spent 20 minutes I took back from my phone to plant a tree"_

Mock starting balance: **46 minutes** (matching mock screen time remaining today)

---

## The Builder Mechanic

Inspired by Clash of Clans' builder system:

- Each charitable action has a **minute cost** (resources to start) and a **real-world duration** (how long it takes to complete in real time — hours or days)
- You can have **multiple builds running in parallel** (unlocking more builder slots is a future progression mechanic)
- Builds show as **"in progress"** in the grove with a timer
- When a build completes, it **fully appears** in the grove and you get a notification
- The minute cost reflects real volunteer/labor time for the charity action

### Cause Items

| Action                | Minute Cost | Real-world Duration | Grove Item | Charity                      |
| --------------------- | ----------- | ------------------: | ---------- | ---------------------------- |
| Plant a Sapling       | 5 min       |              3 days | 🌱 → 🌳    | One Tree Planted             |
| Shelter a Puppy       | 15 min      |               1 day | 🐾 → 🐕    | ASPCA                        |
| Collect Ocean Plastic | 8 min       |              2 days | 🌊 → 🐬    | Ocean Conservancy            |
| Sow Bee Habitat       | 5 min       |              4 days | 🌸 → 🐝    | Xerces Society               |
| Feed a Family         | 10 min      |               1 day | 🥗 → 👨‍👩‍👧    | Feeding America              |
| Rescue a Coral        | 20 min      |              7 days | 🪸 → 🐠    | Coral Restoration Foundation |

Items have two visual states in the grove: **in-progress** (small/faded, timer badge) and **complete** (full size, animated in).

---

## The Algorithm

The villain. An AI born from billions of hours of scrolling, it feeds on human attention and does not want your grove to grow.

### Narrative

> _The world's warmth was fading. People stopped looking up. Then a flicker — someone put down their phone. A Grove pushed through the concrete. The Algorithm noticed. It's been trying to snuff it out ever since._

### Mechanics

- **Trigger:** going over your daily screen time budget
- **Effect:** active builds are **paused/delayed** proportional to how far over you went:
  - 0–15 min over → builds delayed 2 hours
  - 15–60 min over → builds delayed 6 hours
  - 1h+ over → builds delayed 24 hours
- **Visual:** dark static creeps over in-progress items in the grove
- **Recovery:** getting back under budget the next day resumes all builds
- **No permanent loss** — The Algorithm delays, it doesn't destroy. The grove is always recoverable.

### Visual Identity

- Formless, dark, made of scrolling text/static
- Appears as a shadow descending on the grove during a raid
- Eyes made of notification badges
- Message when it raids: _"You fed me today."_

---

## Screens

### Home — The Grove

Full-screen nature scene.

```
┌─────────────────────────────┐
│  HUD: 46 min saved today    │
│  🌱 2 builds in progress    │
├─────────────────────────────┤
│                             │
│   Sky, clouds, sun          │
│                             │
│   [grove items — complete   │
│    and in-progress]         │
│                             │
│   Green ground strip        │
└─────────────────────────────┘
```

- In-progress items: semi-transparent with a small timer badge
- Completed items: full opacity, entrance animation on completion
- Algorithm raid state: dark overlay, static effect, raid message

### Causes (replaces Shop)

- List/grid of charitable actions
- Each card: cause name, charity partner, minute cost, real-world duration, impact description
- "Queue" button: active if enough minutes, shows time-to-complete
- Active builds shown at top of screen
- Current minute balance prominently displayed

### Account

- User avatar + name
- **Impact summary:** "3 trees planted · 1 puppy sheltered · 2kg ocean plastic removed"
- **Active builds:** in-progress items with time remaining
- **Completed builds:** full history with completion dates
- **Streak:** consecutive days under budget
- **Algorithm stat:** "The Algorithm delayed your builds X times"

### Social

- Friends' groves (thumbnail view)
- Activity feed: "Maya completed a coral rescue · 2h ago"
- Leaderboard: most minutes saved this week

---

## State Shape

```typescript
type CauseItem = {
  id: string;
  name: string;
  emoji: string;
  completedEmoji: string;
  minuteCost: number;
  realDurationMs: number; // how long until complete in real time
  impact: string;
  charity: string;
};

type Build = {
  id: string;
  cause: CauseItem;
  startedAt: Date;
  completesAt: Date;
  delayedMs: number; // accumulated Algorithm delay
  status: "in_progress" | "delayed" | "complete";
  position: { x: number; y: number };
};

type State = {
  minuteBalance: number;
  activeBuilds: Build[];
  completedBuilds: Build[];
  streak: number;
  algorithmRaids: number;
};
```

Actions: `QUEUE_BUILD`, `COMPLETE_BUILD`, `ALGORITHM_RAID`

---

## Mock Screen Time Data

```typescript
export const MOCK_SCREEN_TIME = {
  todayUsed: "2h 14m",
  budget: "3h 0m",
  remaining: "46m",
  minutesEarned: 46,
  avgScreenTime: "3h 42m",
  streak: 4,
};
```

---

## Onboarding (future)

3-screen intro on first launch:

1. _"The Algorithm has been stealing your time."_ — dark, scrolling feed visual
2. _"Every minute you take back is a minute you can spend on something real."_ — grove Grove appears
3. _"Set your budget. Tend your grove. Don't feed The Algorithm."_ — CTA to set screen time budget

---

## What's Already Built

- Expo Router scaffold, NativeWind styling
- GameScene, HUD, GameStore (using tokens — needs migration to minutes + build system)
- Shop screen (needs rewrite to Causes + builder queue)
- Account screen (needs rewrite to impact + build history)
- Tab navigation: Home, Shop, Social, Account

---

## Next Build Steps

### Phase 1 — Core mechanic (current focus)

- [ ] Migrate store: `tokenBalance` → `minuteBalance`, `ShopItem`/`BUY_ITEM` → `CauseItem`/`QUEUE_BUILD`/`COMPLETE_BUILD`
- [ ] Causes screen with build queue UI
- [ ] In-progress state in GameScene (faded items + timer badge)
- [ ] Build completion countdown + completion animation
- [ ] Algorithm raid mechanic (triggered by mock "over budget" toggle for now)

### Phase 2 — Polish

- [ ] Algorithm visual (dark overlay, raid animation)
- [ ] Grove item entrance animations on completion
- [ ] Onboarding screens
- [ ] Streak tracking

### Phase 3 — Real data

- [ ] iOS Screen Time API integration
- [ ] Supabase: persist builds, user profile, streak
- [ ] Push notifications for build completion + Algorithm raids
- [ ] Real charity partner links

---

## Decided

- **Builder slots:** 1 to start. Forces prioritization, makes each choice feel meaningful.
- **Countdown:** Real-time countdown displayed in grove and on build cards.
- **Monetization:** Freemium (Option C)
  - Free tier: grove is symbolic/virtual only
  - Paid tier ($1–2/mo): completed builds trigger real donations to charity partners
  - Long-term: approach charities as paid sponsors once engagement numbers exist
- **Build durations:** Calibrated so there's always a sub-24h option for daily payoff

### Revised Cause Durations

| Action                | Minute Cost | Duration | Grove Item | Charity                      |
| --------------------- | ----------- | -------- | ---------- | ---------------------------- |
| Shelter a Puppy       | 15 min      | 6 hours  | 🐾 → 🐕    | ASPCA                        |
| Feed a Family         | 10 min      | 12 hours | 🥗 → 👨‍👩‍👧    | Feeding America              |
| Sow Bee Habitat       | 5 min       | 18 hours | 🌸 → 🐝    | Xerces Society               |
| Collect Ocean Plastic | 8 min       | 1 day    | 🌊 → 🐬    | Ocean Conservancy            |
| Plant a Sapling       | 5 min       | 2 days   | 🌱 → 🌳    | One Tree Planted             |
| Rescue a Coral        | 20 min      | 5 days   | 🪸 → 🐠    | Coral Restoration Foundation |

### Open Questions

- Should The Algorithm have a name/personality beyond "The Algorithm"?
- Daily check-in reward mechanic for visiting during active builds — what does it look like?
- Upgrade prompt moment — when does the app ask free users to go paid?
