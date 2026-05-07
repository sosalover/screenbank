// ScreenTimeMonitorExtension.swift
// TARGET: ScreenTimeMonitor (DeviceActivity Monitor Extension)
//
// XCODE STEPS to create this target:
//   File → New → Target → DeviceActivity Monitor Extension
//   Product Name: ScreenTimeMonitor
//   Then add App Groups capability (group.com.tmoh.screenbank) to this target.
//   Replace the generated DeviceActivityMonitorExtension.swift with this file.

import DeviceActivity
import Foundation

let APP_GROUP = "group.com.tmoh.screenbank"

class ScreenTimeMonitorExtension: DeviceActivityMonitor {

  // Called when the user crosses a usage threshold during the day.
  // Event name encodes the minute value: "t1", "t2", etc.
  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    guard activity == .daily else { return }
    let defaults = UserDefaults(suiteName: APP_GROUP)
    let budget = defaults?.integer(forKey: "budgetMinutes") ?? 180

    if let minutes = Int(event.rawValue.dropFirst()) {
      defaults?.set(minutes, forKey: "screenTimeUsedMinutes")
      if minutes >= budget {
        defaults?.set(true, forKey: "budgetExceeded")
      }
      let ts = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
      defaults?.set("eventDidReachThreshold:\(event.rawValue) @ \(ts)", forKey: "debugExtensionLog")
    }
  }

  // Called at midnight (end of the daily schedule).
  // Awards sparks = budget - used (minutes saved), then resets for next day.
  override func intervalDidEnd(for activity: DeviceActivityName) {
    guard activity == .daily else { return }
    let defaults = UserDefaults(suiteName: APP_GROUP)
    let exceeded = defaults?.bool(forKey: "budgetExceeded") ?? false
    if !exceeded {
      let budget = defaults?.integer(forKey: "budgetMinutes") ?? 180
      let used = defaults?.integer(forKey: "screenTimeUsedMinutes") ?? 0
      let earned = max(0, budget - used)
      let current = defaults?.integer(forKey: "pendingEarnedMinutes") ?? 0
      defaults?.set(current + earned, forKey: "pendingEarnedMinutes")
    }
    defaults?.set(false, forKey: "budgetExceeded")
    defaults?.set(0, forKey: "screenTimeUsedMinutes")
    let ts = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
    defaults?.set("intervalDidEnd @ \(ts)", forKey: "debugExtensionLog")
  }

  // Called at midnight (start of new daily schedule). Resets counters.
  override func intervalDidStart(for activity: DeviceActivityName) {
    guard activity == .daily else { return }
    let defaults = UserDefaults(suiteName: APP_GROUP)
    defaults?.set(false, forKey: "budgetExceeded")
    defaults?.set(0, forKey: "screenTimeUsedMinutes")
    let ts = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
    defaults?.set("intervalDidStart @ \(ts)", forKey: "debugExtensionLog")
  }
}

extension DeviceActivityName {
  static let daily = Self("screenbankDaily")
}
