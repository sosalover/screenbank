import Foundation
import UIKit
import SwiftUI
import FamilyControls
import DeviceActivity

let APP_GROUP = "group.com.tmoh.screenbank"
private let MAX_THRESHOLD_EVENTS = 20

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

  @objc func presentAppPicker(
    _ resolve: @escaping (Any?) -> Void,
    rejecter reject: @escaping (String?, String?, Error?) -> Void
  ) {
    guard #available(iOS 16.0, *) else { resolve(false); return }
    DispatchQueue.main.async {
      let picker = AppPickerHostView(
        onConfirm: { selection in
          if let data = try? JSONEncoder().encode(selection) {
            UserDefaults(suiteName: APP_GROUP)?.set(data, forKey: "familyActivitySelection")
          }
          resolve(true)
        },
        onCancel: { resolve(false) }
      )
      let hostingVC = UIHostingController(rootView: picker)
      hostingVC.modalPresentationStyle = .formSheet

      guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let root = windowScene.windows.first?.rootViewController else {
        reject("NO_VC", "Could not find root view controller", nil)
        return
      }
      var top = root
      while let presented = top.presentedViewController { top = presented }
      top.present(hostingVC, animated: true)
    }
  }

  @objc func startMonitoring(
    _ budgetMinutes: Int,
    resolver resolve: @escaping (Any?) -> Void,
    rejecter reject: @escaping (String?, String?, Error?) -> Void
  ) {
    let defaults = UserDefaults(suiteName: APP_GROUP)
    defaults?.set(budgetMinutes, forKey: "budgetMinutes")

    guard #available(iOS 16.0, *) else { resolve(true); return }

    var selection = FamilyActivitySelection()
    if let data = defaults?.data(forKey: "familyActivitySelection"),
       let stored = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
      selection = stored
      print("[ScreenTime] selection loaded — apps:\(stored.applicationTokens.count) categories:\(stored.categoryTokens.count) domains:\(stored.webDomainTokens.count)")
    } else {
      print("[ScreenTime] WARNING: no saved selection — monitoring nothing")
    }

    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0),
      intervalEnd:   DateComponents(hour: 23, minute: 59),
      repeats: true
    )

    let thresholdInterval = max(1, Int(ceil(Double(budgetMinutes) / Double(MAX_THRESHOLD_EVENTS))))
    var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
    var minute = thresholdInterval
    while minute <= budgetMinutes {
      let name = DeviceActivityEvent.Name("t\(minute)")
      events[name] = DeviceActivityEvent(
        applications: selection.applicationTokens,
        categories: selection.categoryTokens,
        webDomains: selection.webDomainTokens,
        threshold: DateComponents(minute: minute)
      )
      minute += thresholdInterval
    }
    print("[ScreenTime] thresholdInterval:\(thresholdInterval) events:\(events.count)")

    let center = DeviceActivityCenter()
    do {
      try center.startMonitoring(.daily, during: schedule, events: events)
      print("[ScreenTime] startMonitoring OK — \(events.count) events, interval:\(thresholdInterval)min")
      defaults?.set("startMonitoring OK — \(events.count) events, interval:\(thresholdInterval)min", forKey: "debugMainLog")
    } catch {
      print("[ScreenTime] startMonitoring ERROR: \(error)")
      defaults?.set("startMonitoring ERROR: \(error)", forKey: "debugMainLog")
    }
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
      "budgetMinutes":         defaults?.integer(forKey: "budgetMinutes") ?? 180,
      "budgetExceeded":        defaults?.bool(forKey: "budgetExceeded") ?? false,
      "pendingEarnedMinutes":  defaults?.integer(forKey: "pendingEarnedMinutes") ?? 0,
      "screenTimeUsedMinutes": defaults?.integer(forKey: "screenTimeUsedMinutes") ?? 0,
      "debugMainLog":          defaults?.string(forKey: "debugMainLog") ?? "",
      "debugExtensionLog":     defaults?.string(forKey: "debugExtensionLog") ?? "",
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

@available(iOS 16.0, *)
struct AppPickerHostView: View {
  @State private var selection = FamilyActivitySelection()
  let onConfirm: (FamilyActivitySelection) -> Void
  let onCancel: () -> Void
  @Environment(\.dismiss) private var dismiss

  var body: some View {
    NavigationView {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Choose Apps to Limit")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .navigationBarLeading) {
            Button("Cancel") { dismiss(); onCancel() }
          }
          ToolbarItem(placement: .navigationBarTrailing) {
            Button("Done") { dismiss(); onConfirm(selection) }
              .bold()
          }
        }
    }
  }
}

@available(iOS 15.0, *)
extension DeviceActivityName {
  static let daily = Self("screenbankDaily")
}
