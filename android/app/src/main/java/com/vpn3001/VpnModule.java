package com.vpn3001;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class VpnModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public VpnModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "VpnModule";
    }

    @ReactMethod
    public void startVpn() {
        Intent intent = new Intent(reactContext, MyVpnService.class);
        reactContext.startService(intent);
    }
    @ReactMethod
public void addListener(String eventName) {
  // Required for RN built-in EventEmitter calls.
}

@ReactMethod
public void removeListeners(Integer count) {
  // Required for RN built-in EventEmitter calls.
}

}
