# Deployment Guide for Workout Roulette

This guide covers deploying the mobile app so your friends can use it.

## Overview

The Workout Roulette mobile app is **fully self-contained** and works completely offline. It uses a local SQLite database, so **no backend server is required**.

You only need to:

1. **Build the mobile app** using EAS Build or Expo
2. **Distribute it** to your friends

---

## Prerequisites

Before building, make sure you have:

1. **Audio file for ping sound** (optional but recommended):

   - Add `ping.mp3` to `mobile/assets/` folder
   - The app will use vibration as a fallback if the file is missing
   - Supported formats: `.mp3`, `.wav`, `.m4a`, `.aac`

2. **Expo account** (free):
   - Sign up at [expo.dev](https://expo.dev)

---

## Part 1: Deploy Mobile App

### Option A: EAS Build (Recommended - Standalone Apps)

**EAS Build** creates standalone apps that can be distributed to your friends without requiring Expo Go.

#### Setup:

1. **Install EAS CLI:**

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**

   ```bash
   eas login
   ```

3. **Navigate to mobile directory:**

   ```bash
   cd mobile
   ```

4. **Configure EAS:**

   ```bash
   eas build:configure
   ```

   This creates an `eas.json` file with build configurations.

5. **Build for Android (APK - Easy Distribution):**

   ```bash
   eas build --platform android --profile preview
   ```

   - This creates an APK file you can share directly
   - Download link will be provided via email and in the terminal
   - Friends can install by downloading the APK (may need to enable "Install from unknown sources" on Android)
   - **Build time:** ~10-20 minutes

6. **Build for iOS (Requires Apple Developer Account):**

   ```bash
   eas build --platform ios --profile preview
   ```

   - Requires Apple Developer account ($99/year)
   - Or use TestFlight for beta testing (free with developer account)
   - **Build time:** ~15-30 minutes

#### Distribution:

- **Android APK:** Share the download link directly with friends
- **iOS:** Use TestFlight or App Store (requires developer account)

#### Build Profiles:

You can customize build profiles in `eas.json`:

- **`preview`**: For testing and sharing with friends (no app store)
- **`production`**: For App Store/Play Store submission
- **`development`**: For development builds with debugging

### Option B: Expo Go (Quick Testing - Limited)

Your friends can use **Expo Go** app for quick testing (not recommended for final distribution):

1. **Publish your app:**

   ```bash
   cd mobile
   npx expo publish
   ```

2. **Share the link:**
   - Friends install "Expo Go" from App Store/Play Store
   - Scan QR code or use the published URL
   - **Limitation:** Requires Expo Go app, not a standalone app
   - **Limitation:** Some native features may not work in Expo Go

### Option C: Development Build (Advanced)

For more control and native features during development:

```bash
cd mobile
eas build --profile development --platform android
```

This creates a development build that can be installed on devices for testing.

---

## Quick Start Deployment Checklist

### Mobile App:

- [ ] Add `ping.mp3` to `mobile/assets/` folder (optional)
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Navigate to mobile: `cd mobile`
- [ ] Configure: `eas build:configure`
- [ ] Build Android APK: `eas build --platform android --profile preview`
- [ ] Wait for build to complete (check email or EAS dashboard)
- [ ] Download APK from provided link
- [ ] Share the APK download link with friends

---

## Testing Before Sharing

1. **Test locally first:**

   ```bash
   cd mobile
   npm start
   ```

   - Test in Expo Go on your device
   - Verify all features work (workout generation, exercise management, workout execution)
   - Test the ping sound (if you added `ping.mp3`)

2. **Test the built app:**
   - Install the APK on a test device
   - Verify the app works without internet connection
   - Test all features including:
     - Creating workouts
     - Managing exercises
     - Executing workouts with timer
     - Audio ping during last 5 seconds

---

## Important Notes

### App Architecture:

- **Self-contained:** The app works completely offline
- **Local Database:** All data (exercises, workouts) is stored locally on the device using SQLite
- **No Backend Required:** The mobile app doesn't need any server or API
- **Data Persistence:** All data persists between app sessions on the device

### Assets:

- **Audio Files:** Make sure `ping.mp3` (if used) is in `mobile/assets/` before building
- **Images:** Icon, splash screen, and adaptive icon are already configured in `app.json`
- **Asset Bundle:** All assets in `mobile/assets/` are automatically included in the build

### Build Considerations:

- **Build Time:** First build takes longer (~20-30 minutes), subsequent builds are faster
- **Build Limits:** Free EAS tier has limited builds per month
- **File Size:** APK size is typically 20-50 MB depending on assets
- **Updates:** To update the app, rebuild and share the new APK

### Platform-Specific Notes:

**Android:**

- APK can be installed directly (may need to enable "Install from unknown sources")
- No Google Play account needed for direct APK distribution
- Google Play Store submission requires $25 one-time fee

**iOS:**

- Requires Apple Developer account ($99/year)
- Can use TestFlight for beta distribution (free with developer account)
- App Store submission requires developer account and review process

---

## Cost Estimate

**Free Options:**

- EAS Build: Free tier (limited builds/month, usually sufficient for personal projects)
- Expo Go: Free (but limited functionality)

**Paid Options (if needed):**

- EAS Build: ~$29/month for unlimited builds
- Apple Developer: $99/year (required for iOS App Store)
- Google Play: $25 one-time (for Android Play Store)

**Total Cost for Android Distribution:** $0 (using free EAS tier and direct APK sharing)

**Total Cost for iOS Distribution:** $99/year (Apple Developer account required)

---

## Troubleshooting

### Build Fails:

- Check that all dependencies are installed: `cd mobile && npm install`
- Verify `app.json` is valid: `npx expo-doctor`
- Check EAS build logs in the Expo dashboard

### App Doesn't Work After Installation:

- Make sure you're installing the correct APK for your device architecture
- Check device storage space
- Try uninstalling and reinstalling

### Audio Ping Doesn't Work:

- Verify `ping.mp3` is in `mobile/assets/` folder
- Check file format (should be `.mp3`, `.wav`, `.m4a`, or `.aac`)
- App will fall back to vibration if audio fails to load

### Database Issues:

- The database is created automatically on first launch
- If issues occur, uninstall and reinstall the app (this will reset the database)

---

## Need Help?

- **Expo Docs:** https://docs.expo.dev/
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **EAS Build Troubleshooting:** https://docs.expo.dev/build/troubleshooting/
- **Expo Forums:** https://forums.expo.dev/

---

## Summary

The Workout Roulette mobile app is designed to be simple to deploy:

1. **No backend required** - app works completely offline
2. **One command to build** - `eas build --platform android --profile preview`
3. **Share the APK** - friends can install directly
4. **That's it!** - no servers, no databases, no configuration needed

The app includes everything it needs to run, making distribution straightforward.
