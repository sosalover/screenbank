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

  // Called when the user crosses the budget threshold during the day.
  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    guard activity == .daily else { return }
    let defaults = UserDefaults(suiteName: APP_GROUP)
    defaults?.set(true, forKey: "budgetExceeded")
  }

  // Called at midnight (end of the daily schedule).
  // If budget was not exceeded → award the daily reward.
  override func intervalDidEnd(for activity: DeviceActivityName) {
    guard activity == .daily else { return }
    let defaults = UserDefaults(suiteName: APP_GROUP)
    let exceeded = defaults?.bool(forKey: "budgetExceeded") ?? false
    if !exceeded {
      // Award sparks equal to the user's budget. DeviceActivity doesn't expose actual
      // usage minutes in the extension, so we treat staying under budget as earning
      // the full budget amount. Revisit once DeviceActivityReport data is accessible.
      let budget = defaults?.integer(forKey: "budgetMinutes") ?? 180
      let current = defaults?.integer(forKey: "pendingEarnedMinutes") ?? 0
      defaults?.set(current + budget, forKey: "pendingEarnedMinutes")
    }
    // Reset for the next day
    defaults?.set(false, forKey: "budgetExceeded")
  }

  // Called at midnight (start of new daily schedule).
  override func intervalDidStart(for activity: DeviceActivityName) {
    guard activity == .daily else { return }
    let defaults = UserDefaults(suiteName: APP_GROUP)
    defaults?.set(false, forKey: "budgetExceeded")
  }
}

extension DeviceActivityName {
  static let daily = Self("screenbankDaily")
}
