package com.vpn3001;

import android.net.VpnService;
import android.content.Intent;
import android.os.ParcelFileDescriptor;
import java.io.IOException;

public class MyVpnService extends VpnService implements Runnable {

    private Thread thread;
    private ParcelFileDescriptor vpnInterface;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (thread != null) {
            return START_STICKY;
        }
        thread = new Thread(this, "MyVpnThread"); 
        thread.start();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (thread != null) {
            thread.interrupt();
        }
        try {
            if (vpnInterface != null) vpnInterface.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        super.onDestroy();
    }

    @Override
    public void run() {
        Builder builder = new Builder();
        builder.setSession("VultureVPN") // shows up in settings
                .addAddress("10.0.0.2", 24) // fake local VPN address
                .addDnsServer("8.8.8.8");

        vpnInterface = builder.establish();

        if (vpnInterface != null) {
            // VPN is now active → Android shows the key icon 🔑
            try {
                Thread.sleep(Long.MAX_VALUE);
            } catch (InterruptedException e) {
                // stop VPN
            }
        }
    }
}
