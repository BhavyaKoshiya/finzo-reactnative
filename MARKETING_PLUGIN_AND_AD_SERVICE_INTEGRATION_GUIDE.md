# Marketing Plugin & Ad Service Integration Guide
*A comprehensive guide for implementing the Finzo Ad Architecture & `react-native-marketing-plugin` in other React Native apps.*

---

## 1. Overview & Architectural Philosophy

The Finzo Ad Architecture decouples user interface components and business logic from underlying advertising SDKs using the **Facade & Adapter Pattern**.

### Core Architecture Pipeline
```
┌─────────────────────────────────────────────────────────────┐
│ UI Components & Screens (AdPlacement, useInterstitialAd)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ AdService (Single Public Facade)                             │
│  - Queries adDecisionEngine for authorization               │
│  - Delegates to active provider adapter                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ adDecisionEngine             │    │ AdProviderFactory            │
│ - Protected Workflow Screens │    │ - Returns active provider    │
│ - Ad-Free Entitlements       │    │ - Enforces Prod safety       │
│ - Connectivity / Offline     │    └──────────────┬───────────────┘
│ - Interstitial Frequency     │                   │
│ - Rewarded Session Limits    │                   ▼
└──────────────────────────────┘    ┌──────────────────────────────┐
                                    │ MarketingAdProvider (Adapter)│
                                    │ - Wraps marketing plugin     │
                                    │ - Dispatches Banner / Native │
                                    │ - Preloads inventory         │
                                    └──────────────┬───────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │ react-native-marketing-plugin│
                                    │ (react-native-google-mobile) │
                                    └──────────────────────────────┘
```

### Key Architectural Invariants
1. **Single Entry Point**: UI screens ONLY interact with `adService` (or custom hooks like `useInterstitialAd`). No screen directly imports ad SDKs.
2. **Deterministic Opportunity Gating**: Interstitials are triggered every $N$ non-sensitive actions based on the remote `adTime` parameter (e.g. every 3rd calculator exit).
3. **Protected Workflows**: Sensitive input/form/payment screens are strictly 100% ad-free to maintain user trust.
4. **App-Open Protection**: `enableAppOpenOnResume: false` is strictly enforced so users are never interrupted when switching apps.
5. **Non-Blocking Startup**: Ad preloading runs during splash screen with a strict 5-second timeout race condition so offline or slow networks never stall app startup.
6. **Fail-Safe Continuation**: If an ad fails, times out, or has no fill, navigation and user actions continue immediately without blocking.

---

## 2. Dependencies & Native Setup

### 2.1 NPM Packages
Install the required packages in your React Native CLI project:

```bash
# Core advertising & marketing plugin
npm install react-native-marketing-plugin react-native-google-mobile-ads react-native-device-info

# Supporting utilities
npm install @react-native-community/netinfo react-native-bootsplash
```

> **Note**: If your project is TypeScript-based, you can type the parameters using `interface` / `type` definitions matching the interfaces outlined below.

---

### 2.2 Android Configuration

#### 1. `android/app/src/main/AndroidManifest.xml`
Add your AdMob App ID inside the `<application>` tag:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application ...>
        <!-- AdMob App ID (Use Google Sample ID for testing: ca-app-pub-3940256099942544~3347511713) -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>
    </application>
</manifest>
```

#### 2. `app.json` (Google Mobile Ads Config)
Add AdMob app ID configuration to your root `app.json`:

```json
{
  "name": "YourApp",
  "displayName": "YourApp",
  "react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-3940256099942544~3347511713",
    "ios_app_id": "ca-app-pub-3940256099942544~1458002511"
  }
}
```

---

### 2.3 iOS Configuration

#### 1. `ios/YourApp/Info.plist`
Add the GADApplicationIdentifier and SKAdNetwork items:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

#### 2. Install CocoaPods
```bash
cd ios && pod install && cd ..
```

---

## 3. Marketing Plugin Remote Config JSON Schema

The `react-native-marketing-plugin` fetches remote ad configuration via HTTP GET:
`{baseUrl}/{bundleId}.json` (e.g. `https://your-domain.com/adconfigs/com.yourapp.bundle.json`).

### Standard Remote JSON Schema:
```json
{
  "isad": true,
  "isbannerenable": true,
  "isnativeenable": true,
  "isinterstitialenable": true,
  "isrewarded": true,
  "adTime": 3,
  "banner_ad_unit_id": "ca-app-pub-3940256099942544/6300978111",
  "interstitial_ad_unit_id": "ca-app-pub-3940256099942544/1033173712",
  "rewarded_ad_unit_id": "ca-app-pub-3940256099942544/5224354917",
  "native_ad_unit_id": "ca-app-pub-3940256099942544/2247696110"
}
```

### Key Parameters:
| Property | Type | Description |
| :--- | :--- | :--- |
| `isad` | `boolean` | Global master toggle for all advertising in the app. |
| `isbannerenable` | `boolean` | Master toggle for Banner ad placements. |
| `isnativeenable` | `boolean` | Master toggle for Native ad placements. |
| `isinterstitialenable` | `boolean` | Master toggle for Interstitial ad transitions. |
| `isrewarded` | `boolean` | Master toggle for Rewarded video ad units. |
| `adTime` | `number` | **Opportunity frequency divisor**. e.g., `3` means show an interstitial on every 3rd eligible action. |

---

## 4. File Structure & Component Blueprint

Place all ad logic under `src/services/ads/` and `src/components/ads/`:

```
src/
├── components/
│   └── ads/
│       ├── AdBanner.jsx (or .tsx)           # Inline banner wrapper
│       ├── AdPlacement.jsx (or .tsx)        # Unified placement container
│       ├── RewardedAdButton.jsx (or .tsx)   # Rewarded video unlock button
│       └── DevAdControlsModal.jsx (or .tsx) # Developer debug overlay
├── hooks/
│   └── useInterstitialAd.js (or .ts)        # Navigation & exit transition hook
└── services/
    ├── adService.js                         # Public Facade singleton
    ├── adProviderFactory.js                 # Safe Provider Factory
    └── ads/
        ├── adDecisionEngine.js              # Central gating rules
        ├── adFrequencyService.js            # Time-based frequency tracker
        ├── interstitialFrequencyService.js  # Opportunity counter (adTime)
        ├── rewardedAdSessionManager.js      # Rewarded sessions & daily limits
        ├── adMetricsService.js              # Anonymous metric dispatch
        ├── adPlacementConstants.js          # Placement ID constants
        ├── adProviderTypes.js               # Enums & Status types
        ├── baseAdProvider.js                # Abstract Base Provider
        ├── marketingAdProvider.js           # Marketing Plugin Adapter
        ├── simulatedAdProvider.js           # Local UI QA simulator (DEV only)
        └── noAdProvider.js                  # No-op fallback
```

---

## 5. Core Implementation Code

### 5.1 Ad Placement Constants (`src/services/ads/adPlacementConstants.js`)
```javascript
export const AD_PLACEMENTS = {
  HOME_BANNER: 'home_banner',
  CALCULATOR_BANNER: 'calculator_banner',
  HISTORY_BANNER: 'history_banner',
  CALCULATOR_INTERSTITIAL: 'calculator_interstitial',
  REWARDED_AD_FREE: 'rewarded_ad_free',
};
```

---

### 5.2 Ad Decision Engine (`src/services/ads/adDecisionEngine.js`)
Enforces safety rules before any ad loads or displays:

```javascript
export const AD_DECISION_REASONS = {
  ALLOWED: 'ONLINE',
  OFFLINE: 'OFFLINE',
  ADS_DISABLED: 'ADS_DISABLED',
  AD_FREE_ACTIVE: 'AD_FREE_ACTIVE',
  THRESHOLD_NOT_MET: 'THRESHOLD_NOT_MET',
  SESSION_LIMIT_REACHED: 'SESSION_LIMIT_REACHED',
  FINANCIAL_WORKFLOW: 'FINANCIAL_WORKFLOW',
};

// Sensitive screens that must NEVER show ads
export const PROTECTED_SCREENS = [
  'payment_entry',
  'account_edit',
  'pdf_export',
  'checkout',
];

export const isProtectedScreen = (screen) => {
  if (!screen || typeof screen !== 'string') return false;
  return PROTECTED_SCREENS.includes(screen.toLowerCase().trim());
};

export const canShowAd = ({
  adType = 'banner',
  screen,
  isOnline = true,
  isAdFree = false,
  frequencyStatus = {},
}) => {
  if (screen && isProtectedScreen(screen)) {
    return { allowed: false, reason: AD_DECISION_REASONS.FINANCIAL_WORKFLOW };
  }
  if (isAdFree && adType !== 'rewarded') {
    return { allowed: false, reason: AD_DECISION_REASONS.AD_FREE_ACTIVE };
  }
  if (!isOnline) {
    return { allowed: false, reason: AD_DECISION_REASONS.OFFLINE };
  }
  if (frequencyStatus && frequencyStatus.canShow === false) {
    return { allowed: false, reason: frequencyStatus.reason || AD_DECISION_REASONS.THRESHOLD_NOT_MET };
  }
  return { allowed: true, reason: AD_DECISION_REASONS.ALLOWED };
};
```

---

### 5.3 Interstitial Frequency Service (`src/services/ads/interstitialFrequencyService.js`)
Calculates when to trigger an interstitial using the remote `adTime` integer:

```javascript
export const DEFAULT_AD_TIME = 3;
export const DEFAULT_MAX_PER_SESSION = 3;

export const normalizeAdTime = (rawAdTime) => {
  const parsed = Number(rawAdTime);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : DEFAULT_AD_TIME;
};

export class InterstitialFrequencyService {
  constructor() {
    this.opportunityCounter = 0;
    this.sessionCount = 0;
    this.isInterstitialShowing = false;
  }

  recordEligibleOpportunity(options = {}) {
    if (this.isInterstitialShowing) {
      return { triggered: false, reason: 'REQUEST_ACTIVE' };
    }

    const maxPerSession = options.maxPerSession ?? DEFAULT_MAX_PER_SESSION;
    if (this.sessionCount >= maxPerSession) {
      return { triggered: false, reason: 'SESSION_LIMIT_REACHED' };
    }

    const target = normalizeAdTime(options.adTime);
    this.opportunityCounter += 1;

    if (this.opportunityCounter >= target) {
      // Target reached: reset opportunity counter and show ad
      this.opportunityCounter = 0;
      this.sessionCount += 1;
      this.isInterstitialShowing = true;
      return { triggered: true, counter: 0, target, sessionCount: this.sessionCount };
    }

    return { triggered: false, reason: 'THRESHOLD_NOT_MET', counter: this.opportunityCounter, target };
  }

  releaseInterstitial() {
    this.isInterstitialShowing = false;
  }
}

export const interstitialFrequencyService = new InterstitialFrequencyService();
```

---

### 5.4 Marketing Ad Provider Adapter (`src/services/ads/marketingAdProvider.js`)
Integrates `react-native-marketing-plugin`:

```javascript
import React from 'react';
import {
  marketingPlugin,
  BannerAdView,
  NativeAdComponent,
  bannerAdManager,
  nativeAdManager,
  interstitialAdManager,
  rewardedAdManager,
  MyAds,
} from 'react-native-marketing-plugin';

export class MarketingAdProvider {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://your-domain.com/adconfigs',
      bundleId: config.bundleId || 'com.yourapp.bundle',
      enableAppOpenOnResume: false, // ALWAYS false
      ...config,
    };
    this.isInitialized = false;
  }

  getAdTime() {
    return marketingPlugin.adModel?.adTime ?? 3;
  }

  async initialize() {
    if (this.isInitialized) return true;
    try {
      await marketingPlugin.initialize({
        baseUrl: this.config.baseUrl,
        bundleId: this.config.bundleId,
        enableAppOpenOnResume: false,
      });
      this.isInitialized = true;
      return true;
    } catch (err) {
      this.isInitialized = false;
      return false;
    }
  }

  async preloadAds() {
    if (!this.isInitialized) await this.initialize();
    try {
      bannerAdManager?.preloadAll?.();
      nativeAdManager?.preloadAll?.(MyAds?.nativeNormal || 'nativeNormal');
      await interstitialAdManager?.preloadAds?.();
      if (marketingPlugin.adModel?.isrewarded) {
        await rewardedAdManager?.preloadAds?.();
      }
      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }

  renderBanner({ placementId, onAdLoaded, onAdFailed }) {
    if (!marketingPlugin.adModel?.isad || !marketingPlugin.adModel?.isbannerenable) {
      return null;
    }
    return <BannerAdView key={placementId} onAdLoaded={onAdLoaded} onAdFailed={onAdFailed} />;
  }

  async showInterstitial() {
    try {
      if (!this.isInitialized) await this.initialize();
      const targetCounter = marketingPlugin.adModel?.adTime ?? 3;
      await marketingPlugin.showInterstitial(targetCounter);
      return { status: 'COMPLETED' };
    } catch (error) {
      return { status: 'FAILED', reason: error.message };
    }
  }

  async showRewarded(options = {}) {
    try {
      if (!this.isInitialized) await this.initialize();
      let completed = false;
      await marketingPlugin.showRewardAd(() => {
        completed = true;
        options.onRewarded?.();
      });
      return { status: completed ? 'COMPLETED' : 'DISMISSED' };
    } catch (error) {
      return { status: 'FAILED', reason: error.message };
    }
  }
}
```

---

### 5.5 Public Ad Service Facade (`src/services/adService.js`)
```javascript
import { AdProviderFactory } from './adProviderFactory';
import { canShowAd } from './ads/adDecisionEngine';
import { interstitialFrequencyService } from './ads/interstitialFrequencyService';

class AdService {
  constructor() {
    this.provider = AdProviderFactory.getProvider();
  }

  async initialize() {
    return await this.provider.initialize();
  }

  async preloadAds() {
    return await this.provider.preloadAds();
  }

  renderBanner(props) {
    const decision = canShowAd({ adType: 'banner', screen: props.screen });
    if (!decision.allowed) return null;
    return this.provider.renderBanner(props);
  }

  async showInterstitial(placementId, options = {}) {
    const adTime = this.provider.getAdTime();
    const freq = interstitialFrequencyService.recordEligibleOpportunity({ adTime });
    
    if (!freq.triggered) {
      return { status: 'SKIPPED', reason: freq.reason };
    }

    try {
      return await this.provider.showInterstitial(placementId, options);
    } finally {
      interstitialFrequencyService.releaseInterstitial();
    }
  }

  async showRewarded(placementId, options = {}) {
    return await this.provider.showRewarded(options);
  }
}

export default new AdService();
```

---

### 5.6 Navigation Back Hook (`src/hooks/useInterstitialAd.js`)
Handles transitions on back presses with double-tap prevention:

```javascript
import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import adService from '../services/adService';

export const useInterstitialAd = ({ placementId = 'calculator_interstitial', screen = 'calculator' } = {}) => {
  const navigation = useNavigation();
  const isProcessingRef = useRef(false);

  const handleBackWithAd = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      await adService.showInterstitial(placementId, { screen });
    } catch (_err) {
      // Fail-safe: Always ensure navigation succeeds
    } finally {
      navigation?.goBack?.();
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  };

  return { handleBackWithAd };
};
```

---

## 6. App Startup & Preload Lifecycle

To guarantee fast ad delivery with zero perceived latency while avoiding app launch freezing:

```javascript
// src/components/containers/AppStartupGate.jsx
import React, { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';
import adService from '../../services/adService';
import NetInfo from '@react-native-community/netinfo';

const STARTUP_TIMEOUT_MS = 5000;

export const AppStartupGate = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const startup = async () => {
      const net = await NetInfo.fetch();
      
      if (net.isConnected) {
        const adInitPromise = adService.initialize().then(() => adService.preloadAds());
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, STARTUP_TIMEOUT_MS));

        // Race ad preloading against a 5-second timeout
        await Promise.race([adInitPromise, timeoutPromise]);
      }

      if (isMounted) {
        setReady(true);
        BootSplash.hide({ fade: true });
      }
    };

    startup();
    return () => { isMounted = false; };
  }, []);

  if (!ready) return null;
  return children;
};
```

---

## 7. Step-by-Step Implementation Recipe for a New App

1. **Install Dependencies**: `npm install react-native-marketing-plugin react-native-google-mobile-ads react-native-device-info`
2. **Add Native Identifiers**:
   - Add AdMob App ID to `android/app/src/main/AndroidManifest.xml` and `app.json`.
   - Add `GADApplicationIdentifier` and `SKAdNetworkItems` to `ios/YourApp/Info.plist`.
   - Run `cd ios && pod install`.
3. **Deploy Remote JSON**: Host your remote configuration JSON file at `{baseUrl}/{bundleId}.json` with your ad unit IDs and `adTime`.
4. **Copy Service Blueprint**: Copy `src/services/adService.js` and `src/services/ads/` folder into your new app.
5. **Configure AppStartupGate**: Wrap your root navigation stack in `<AppStartupGate>` to initialize and preload ads during splash.
6. **Place Banner Components**: Use `<AdPlacement placementId="..." />` or `<AdBanner />` at the bottom of standard screens.
7. **Attach Interstitial Transitions**: Use `useInterstitialAd()` on screen exit / back buttons.
