import Foundation
import FamilyControls
import DeviceActivity

let APP_GROUP = "group.com.tmoh.screenbank"

@objc(ScreenTime)
class ScreenTimeModule: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func requestAuthorization(
    _ resolve: @escaping (Any?) -> Void,
    rejecter reject: @escaping (String?, String?, Error?) -> Void
  ) {
    guard #available(iOS 16.0, *) else { resolve("notDetermined"); return }
    Task { @MainActor in
      do {
        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
        resolve("approved")
      } catch {
        reject("AUTH_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc func getAuthorizationStatus(
    _ resolve: (Any?) -> Void,
    rejecter reject: (String?, String?, Error?) -> Void
  ) {
    guard #available(iOS 16.0, *) else { resolve("notDetermined"); return }
    switch AuthorizationCenter.shared.authorizationStatus {
    case .approved:       resolve("approved")
    case .denied:         resolve("denied")
    case .notDetermined:  resolve("notDetermined")
    @unknown default:     resolve("unknown")
    }
  }

  @objc func startMonitoring(
    _ budgetMinutes: Int,
    resolver resolve: @escaping (Any?) -> Void,
    rejecter reject: @escaping (String?, String?, Error?) -> Void
  ) {
    let defaults = UserDefaults(suiteName: APP_GROUP)
    defaults?.set(budgetMinutes, forKey: "budgetMinutes")
    defaults?.set(false, forKey: "budgetExceeded")
    defaults?.set(0, forKey: "pendingEarnedMinutes")

    guard #available(iOS 15.0, *) else { resolve(true); return }

    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0),
      intervalEnd:   DateComponents(hour: 23, minute: 59),
      repeats: true
    )
    let events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [
      .budgetReached: DeviceActivityEvent(
        applications: [], categories: [], webDomains: [],
        threshold: DateComponents(minute: budgetMinutes)
      )
    ]
    do {
      try DeviceActivityCenter().startMonitoring(.daily, during: schedule, events: events)
    } catch {}
    resolve(true)
  }

  @objc func stopMonitoring() {
    guard #available(iOS 15.0, *) else { return }
    DeviceActivityCenter().stopMonitoring()
  }

  @objc func getStoredData(
    _ resolve: (Any?) -> Void,
    rejecter reject: (String?, String?, Error?) -> Void
  ) {
    let defaults = UserDefaults(suiteName: APP_GROUP)
    resolve([
      "budgetMinutes":        defaults?.integer(forKey: "budgetMinutes") ?? 180,
      "budgetExceeded":       defaults?.bool(forKey: "budgetExceeded") ?? false,
      "pendingEarnedMinutes": defaults?.integer(forKey: "pendingEarnedMinutes") ?? 0,
    ])
  }

  @objc func clearPendingEarnings() {
    UserDefaults(suiteName: APP_GROUP)?.set(0, forKey: "pendingEarnedMinutes")
  }

  @objc func setBudgetMinutes(
    _ minutes: Int,
    resolver resolve: (Any?) -> Void,
    rejecter reject: (String?, String?, Error?) -> Void
  ) {
    UserDefaults(suiteName: APP_GROUP)?.set(minutes, forKey: "budgetMinutes")
    resolve(true)
  }
}

@available(iOS 15.0, *)
extension DeviceActivityEvent.Name {
  static let budgetReached = Self("budgetReached")
}

@available(iOS 15.0, *)
extension DeviceActivityName {
  static let daily = Self("screenbankDaily")
}
