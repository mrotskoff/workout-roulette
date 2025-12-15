# Debugging "Failed to download remote update" Error

This error occurs when Expo Go can't connect to your development server. Follow these steps to fix it:

## Step 1: Verify Network Connection

1. **Check both devices are on the same Wi-Fi network:**

   - Your computer: Check IP address (should be `192.168.0.117`)
   - Your Android phone: Go to Settings → Wi-Fi → Check connected network
   - They must be on the **same network**

2. **Test connectivity from your phone:**
   - Open a browser on your phone
   - Try accessing: `http://192.168.0.117:8081` (Expo's default port)
   - If it doesn't load, there's a network/firewall issue

## Step 2: Check Windows Firewall

Windows Firewall might be blocking Expo's port (8081). To fix:

1. **Open Windows Defender Firewall:**

   - Press `Win + R`, type `wf.msc`, press Enter

2. **Add an inbound rule:**

   - Click "Inbound Rules" → "New Rule"
   - Select "Port" → Next
   - Select "TCP" and enter port `8081` → Next
   - Select "Allow the connection" → Next
   - Check all profiles (Domain, Private, Public) → Next
   - Name it "Expo Metro Bundler" → Finish

3. **Repeat for port 19000** (Expo's alternative port)

Or use PowerShell (run as Administrator):

```powershell
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
New-NetFirewallRule -DisplayName "Expo Metro Bundler Alt" -Direction Inbound -Protocol TCP -LocalPort 19000 -Action Allow
```

## Step 3: Use Tunnel Mode (Recommended)

If network issues persist, use tunnel mode which routes through Expo's servers:

```bash
cd mobile
npx expo start --tunnel
```

This works even if devices are on different networks, but is slower.

## Step 4: Clear Cache and Restart

1. **Stop the Expo server** (Ctrl+C)

2. **Clear cache and restart:**

   ```bash
   cd mobile
   npx expo start --clear
   ```

3. **Try scanning the QR code again**

## Step 5: Check Expo Server Status

When you run `npm start`, you should see:

- A QR code in the terminal
- A URL like `exp://192.168.0.117:8081` or `exp://xxx-xxx.tunnel.exp.direct:80`

If you see errors, check:

- Is port 8081 already in use?
- Are there any error messages in the terminal?

## Step 6: Manual Connection

Instead of scanning QR code, try:

1. **Get the connection URL from terminal** (looks like `exp://192.168.0.117:8081`)

2. **In Expo Go app:**
   - Tap "Enter URL manually"
   - Type the URL exactly as shown

## Step 7: Verify Updates Setting

We've disabled OTA updates in `app.json`. If the error persists, try temporarily removing that setting:

```json
// Remove this temporarily to test:
"updates": {
  "enabled": false
}
```

Then restart the server.

## Step 8: Check Antivirus Software

Some antivirus software blocks local network connections. Temporarily disable it to test, or add Expo to exceptions.

## Quick Fix Checklist

- [ ] Both devices on same Wi-Fi network
- [ ] Windows Firewall allows port 8081
- [ ] Expo server is running (`npm start`)
- [ ] Try tunnel mode (`npx expo start --tunnel`)
- [ ] Clear cache (`npx expo start --clear`)
- [ ] Check antivirus isn't blocking
- [ ] Try manual URL entry in Expo Go

## Still Not Working?

1. **Check Expo Go version:**

   - Update Expo Go from Play Store
   - Make sure it's the latest version

2. **Try a different network:**

   - Use mobile hotspot
   - Or try a different Wi-Fi network

3. **Check Expo logs:**

   - Look at the terminal output when scanning
   - Any error messages will help diagnose

4. **Restart everything:**
   - Restart your computer
   - Restart your phone
   - Restart your router
