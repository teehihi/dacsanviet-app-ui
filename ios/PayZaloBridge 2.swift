import Foundation
import React
import zpdk

@objc(PayZaloBridge)
class PayZaloBridge: RCTEventEmitter, ZPPaymentDelegate {
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return ["EventPayZalo"]
  }
  
  @objc func payOrder(_ zpTransToken: String) {
    DispatchQueue.main.async {
      ZaloPaySDK.sharedInstance()?.paymentDelegate = self
      ZaloPaySDK.sharedInstance()?.payOrder(zpTransToken)
    }
  }
  
  // MARK: - ZPPaymentDelegate
  
  func paymentDidSucceeded(_ transactionId: String!, zpTranstoken: String!, appTransId: String!) {
    sendEvent(withName: "EventPayZalo", body: [
      "returnCode": 1,
      "transactionId": transactionId ?? "",
      "zpTransToken": zpTranstoken ?? "",
      "appTransId": appTransId ?? ""
    ])
  }
  
  func paymentDidCanceled(_ zpTranstoken: String!, appTransId: String!) {
    sendEvent(withName: "EventPayZalo", body: [
      "returnCode": 4,
      "zpTransToken": zpTranstoken ?? "",
      "appTransId": appTransId ?? ""
    ])
  }
  
  func paymentDidError(_ errorCode: ZPPaymentErrorCode, zpTranstoken: String!, appTransId: String!) {
    sendEvent(withName: "EventPayZalo", body: [
      "returnCode": Int(errorCode.rawValue),
      "zpTransToken": zpTranstoken ?? "",
      "appTransId": appTransId ?? ""
    ])
  }
}
