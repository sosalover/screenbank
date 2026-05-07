# Screen Time Integration — Dev Notes

## Current Status (May 2026)

All core components are working end to end:
- FamilyControls authorization: WORKING
- FamilyActivityPicker (app selection): WORKING
- startMonitoring (DeviceActivity): WORKING — 120 events registered (1/min up to budget)
- eventDidReachThreshold: WORKING — fires after 1 min of usage, writes screenTimeUsedMinutes
- screenTimeUsedMinutes: WORKING — extension writes it, JS reads it on foreground
- End-of-day spark earning: IMPLEMENTED (intervalDidEnd: awards budget - used sparks)

**Root cause of previous failure:** `Info.plist` `NSExtensionPrincipalClass` was `DeviceActivityMonitorExtension` but the Swift class is `ScreenTimeMonitorExtension`. iOS couldn't find the class so the extension never loaded. Fixed by updating Info.plist to `$(PRODUCT_MODULE_NAME).ScreenTimeMonitorExtension`.

**Known quirk:** Calling `startMonitoring` when monitoring is already active triggers `intervalDidStart` on the extension (not just at midnight). This resets counters mid-day. Low priority for now but worth revisiting.

**Not yet verified:** End-of-day `intervalDidEnd` spark awarding — requires testing at midnight or with a short test schedule.

---

## Architecture

### How it works

1. **Main app** (`ScreenTimeModule.swift`) — RCT_EXTERN_MODULE native module
   - `requestAuthorization()` — FamilyControls auth dialog
   - `presentAppPicker()` — FamilyActivityPicker sheet, saves `familyActivitySelection` to App Group UserDefaults
   - `startMonitoring(budgetMinutes)` — sets up DeviceActivity schedule + threshold events (every N min up to budget)
   - `getStoredData()` — reads from App Group UserDefaults (screenTimeUsedMinutes, budgetExceeded, pendingEarnedMinutes)

2. **DeviceActivity extension** (`ScreenTimeMonitor` target) — runs in background
   - `eventDidReachThreshold` fires when a threshold is crossed — writes `screenTimeUsedMinutes` to App Group
   - `intervalDidEnd` (midnight) — awards sparks = budget - used, resets counters
   - `intervalDidStart` (midnight) — resets counters for new day

3. **App Group** `group.com.tmoh.screenbank` — shared UserDefaults between main app and extension

4. **JS layer**
   - `modules/screen-time/src/index.ts` — wraps `NativeModules.ScreenTime`
   - `hooks/useScreenTime.ts` — on launch: checks auth, calls startMonitoring; on foreground: syncs data
   - Dispatches `SET_SCREEN_TIME_USED` to game store → HUD shows minutes left

### Key files

| File | Purpose |
|------|---------|
| `ios/ScreenTimeModule.swift` | **COMPILED BY XCODE** — main native module (edit this one) |
| `ios/ScreenTimeBridge.m` | **COMPILED BY XCODE** — ObjC bridge declarations (edit this one) |
| `modules/screen-time/ios/ScreenTimeModule.swift` | Mirror/reference copy (NOT in Xcode target) |
| `modules/screen-time/ios/ScreenTimeBridge.m` | Mirror/reference copy (NOT in Xcode target) |
| `modules/screen-time/ios/ScreenTimeMonitorExtension.swift` | DeviceActivity extension (in ScreenTimeMonitor target) |
| `modules/screen-time/src/index.ts` | JS interface |
| `hooks/useScreenTime.ts` | React hook — lifecycle management |

> IMPORTANT: The Xcode project references `ios/ScreenTimeModule.swift` and `ios/ScreenTimeBridge.m`.
> The copies in `modules/screen-time/ios/` are NOT compiled. Always edit the `ios/` versions.

---

## Dev Setup

### Running the app

Two processes needed simultaneously:

**1. Metro bundler (JS)**
```bash
cd apps/mobile && npm start
```

**2. Native build + install (when Swift/ObjC changes)**
```bash
cd apps/mobile/ios

# Build
xcodebuild \
  -workspace ScreenBank.xcworkspace \
  -scheme ScreenBank \
  -configuration Debug \
  -destination "id=00008140-000979A23E2A801C" \
  -allowProvisioningUpdates \
  build

# Install
xcrun devicectl device install app \
  --device 00008140-000979A23E2A801C \
  /Users/thomasmoh/Library/Developer/Xcode/DerivedData/ScreenBank-cygwezdbkqakmpakpamadwbetqlq/Build/Products/Debug-iphoneos/ScreenBank.app
```

**Device UDID:** `00008140-000979A23E2A801C` (iPhone)

**JS-only changes** (hooks, components, stores): Metro hot-reloads automatically, no rebuild needed.
**Swift/ObjC changes**: Must rebuild + reinstall via xcodebuild.

### Xcode notes

- Open `ios/ScreenBank.xcworkspace` (NOT `.xcodeproj`)
- Xcode 26 (beta) has a bug where the ScreenBank scheme doesn't appear in the UI
- Use `xcodebuild` from terminal instead — the scheme exists and works fine
- CocoaPods constants.rb was patched for Xcode 26 object version 70:
  `/opt/homebrew/Cellar/cocoapods/1.16.2_2/libexec/gems/xcodeproj-1.27.0/lib/xcodeproj/constants.rb`
  Added `70 => 'Xcode 26.0'` and `80 => 'Xcode 26.0'` to `COMPATIBILITY_VERSION_BY_OBJECT_VERSION`

### Xcode targets

- **ScreenBank** — main app target. Contains `ScreenTimeModule.swift`, `ScreenTimeBridge.m`
- **ScreenTimeMonitor** — DeviceActivity Monitor extension. Contains `ScreenTimeMonitorExtension.swift`
  - Must have App Groups capability: `group.com.tmoh.screenbank`
  - Must have DeviceActivity Monitor extension entitlement

---

## Why we switched from Expo Modules to RCT_EXTERN_MODULE

Expo Modules autolinking doesn't support local `file:` packages. The `ExpoModulesProvider.swift` is
regenerated each build by a build phase script, which excluded the local screen-time module. Switching
to `RCT_EXTERN_MODULE` (old bridge) bypassed autolinking entirely and works correctly.

---

## Current threshold config

`THRESHOLD_INTERVAL = 1` (set to 1 minute for testing, change back to 5 for production)

Located in `ios/ScreenTimeModule.swift` line ~8.

---

## Debugging tips

Extension `print()` is invisible without Xcode open. Instead, write debug strings to App Group UserDefaults and read them back via `getStoredData()` — they appear in Metro logs automatically.

Currently wired up:
- `debugMainLog` — set by `startMonitoring` (success or error message)
- `debugExtensionLog` — set by extension on every callback (eventDidReachThreshold, intervalDidStart, intervalDidEnd)

To see selection state on launch, check for `[ScreenTime] selection loaded — apps:N` in Metro. If you see `WARNING: no saved selection`, the picker was never completed.

---

## App Group UserDefaults keys

| Key | Type | Set by |
|-----|------|--------|
| `budgetMinutes` | Int | `startMonitoring` |
| `budgetExceeded` | Bool | Extension `eventDidReachThreshold` |
| `pendingEarnedMinutes` | Int | Extension `intervalDidEnd` |
| `screenTimeUsedMinutes` | Int | Extension `eventDidReachThreshold` |
| `familyActivitySelection` | Data (JSON) | `presentAppPicker` |

---

## Game store integration

- `SET_SCREEN_TIME_USED` — updates `state.screenTimeUsedMinutes` → HUD shows minutes left
- `ALGORITHM_RAID` — triggered when `budgetExceeded` is true
- `EARN_SPARKS` — triggered when `pendingEarnedMinutes > 0` (cleared after claiming)
