package com.dacsanviet.app;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import vn.zalopay.sdk.ZaloPaySDK;
import vn.zalopay.sdk.ZaloPayError;
import vn.zalopay.sdk.listeners.PayOrderListener;

public class PayZaloBridge extends ReactContextBaseJavaModule implements ActivityEventListener {

    public PayZaloBridge(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "PayZaloBridge";
    }

    @ReactMethod
    public void payOrder(String zpTransToken) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) return;

        ZaloPaySDK.getInstance().payOrder(currentActivity, zpTransToken, "dacsanviet://zalopay", new PayOrderListener() {
            @Override
            public void onPaymentCanceled(String zpTransToken, String appTransID) {
                sendEvent("EventPayZalo", 4, "User Canceled");
            }

            @Override
            public void onPaymentError(ZaloPayError zaloPayError, String zpTransToken, String appTransID) {
                int code = zaloPayError != null ? zaloPayError.value : -1;
                sendEvent("EventPayZalo", code, "Payment Error");
            }

            @Override
            public void onPaymentSucceeded(String transactionId, String transToken, String appTransID) {
                sendEvent("EventPayZalo", 1, transactionId);
            }
        });
    }

    private void sendEvent(String eventName, int returnCode, String transactionId) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, new com.facebook.react.bridge.WritableNativeMap() {{
                putInt("returnCode", returnCode);
                putString("transactionId", transactionId);
            }});
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        ZaloPaySDK.getInstance().onResult(data);
    }

    @Override
    public void onNewIntent(Intent intent) {
        ZaloPaySDK.getInstance().onResult(intent);
    }
}
