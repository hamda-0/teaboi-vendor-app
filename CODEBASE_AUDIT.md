# Teaboi Vendor App Issue Audit

Last updated: April 8, 2026

## Scope

- Repo audited from current working tree state
- Validation run: `npx tsc --noEmit` on April 8, 2026
- No dedicated `lint` or `test` script exists in [package.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/package.json)

## Executive Summary

- Overall health: 5.5/10
- TypeScript currently passes, so the biggest remaining risks are runtime flow bugs, insecure production config, and unfinished app wiring.
- The first fix should be the login/auth branch because it can strand a valid user inside profile completion without a persisted token.

## Fix Sequence

1. Fix auth persistence during login branching.
2. Make camera return data explicit instead of relying on shared transient state.
3. Remove global cleartext transport allowances.
4. Remove committed Google Maps API keys from config and native files.
5. Strip debug logging from auth, API, socket, notification, and profile flows.
6. Replace placeholder dashboard data with live app state.
7. Clean up dead/duplicated infrastructure and tighten weakly typed boundaries.

## Current Issues

### 1. Pending-profile login path still drops the auth token

- Severity: Critical
- Status: Confirmed
- Location:
  - [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L17)
  - [src/store/useAuthStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useAuthStore.ts#L11)
  - [src/api/client.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/api/client.ts#L17)

#### Problem

`useLogin` only calls `setAuth(user, accessToken)` at the end of the success handler. Users in `PENDING_PROFILE` are redirected to `CompleteProfile` first and return before auth is persisted.

Because API requests read the token from Zustand state, that profile-completion flow can run without the bearer token that the backend expects.

#### Evidence

- `PENDING_PROFILE` returns early at [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L26)
- `setAuth` is only reached later at [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L40)
- The API client attaches auth from store state at [src/api/client.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/api/client.ts#L17)

#### Possible Fix

Persist auth immediately after a successful login response, then branch on account status.

```ts
onSuccess: (response) => {
  if (!response.data) return;

  const { user, accessToken, vendorProfile } = response.data;
  setAuth(user, accessToken);

  if (user.status === AccountStatus.PENDING_VERIFICATION) {
    navigate('OtpVerification', { email: user.email });
    return;
  }

  if (user.status === AccountStatus.PENDING_PROFILE || !vendorProfile.isProfileComplete) {
    navigate('CompleteProfile');
    return;
  }

  if (user.status === AccountStatus.PENDING_APPROVAL) {
    Alert.alert('Pending Approval', 'Your registration is complete. Please wait for admin review.');
  }
}
```

#### Validation After Fix

- Login with a `PENDING_PROFILE` user
- Confirm `useAuthStore.getState().token` is populated before `CompleteProfile` loads
- Confirm a profile submission request sends `Authorization: Bearer ...`

### 2. Camera return flow still depends on shared transient state

- Severity: High
- Status: Confirmed
- Location:
  - [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L27)
  - [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L51)
  - [src/modules/profile/hooks/useImageSelection.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/hooks/useImageSelection.ts#L14)
  - [src/store/useCameraStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useCameraStore.ts#L9)

#### Problem

The camera flow now returns via a shared Zustand field, not via route params. `CompleteProfileScreen` still relies on its local `activeDocType` to decide where the returned image should go.

That means the captured image and its destination are stored in different places. If the screen remounts, if another flow uses the same camera store, or if state gets cleared out of sequence, the photo can be lost or assigned incorrectly.

#### Evidence

- Destination state is local: `activeDocType` at [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L27)
- Returned image is global: `capturedImage` store use at [src/modules/profile/hooks/useImageSelection.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/hooks/useImageSelection.ts#L14)
- The assignment only works if both happen to still align at [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L51)

#### Possible Fix

Pass a typed payload through navigation instead of splitting responsibility between local screen state and a shared global store.

Recommended sequence:

1. Add camera route params like `{ target: 'profile' | 'cnicFront' | 'cnicBack' | 'passport' | 'avatar' }`.
2. Navigate with the explicit target from `CompleteProfile` or `EditProfile`.
3. Return `{ uri, target }` from the camera screen.
4. Remove `useCameraStore` from this flow once all callers use route params.

#### Validation After Fix

- Capture a profile photo from `CompleteProfile`
- Capture an avatar from `EditProfile`
- Repeat both after navigating away and back
- Confirm no stale image is reused and every photo lands in the intended field

### 3. Cleartext traffic is still enabled globally

- Severity: Critical
- Status: Confirmed
- Location:
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L21)
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L39)
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L58)

#### Problem

The Expo config still enables:

- `NSAllowsArbitraryLoads` on iOS
- `usesCleartextTraffic` on Android
- the same Android cleartext allowance again through `expo-build-properties`

This keeps non-HTTPS traffic allowed across the app.

#### Possible Fix

Recommended sequence:

1. Remove `NSAllowsArbitraryLoads`.
2. Remove both Android cleartext flags.
3. If development needs plain HTTP for a local host, gate that by build profile or use scoped exceptions only for development.
4. Regenerate native projects if Expo config is the source of truth.

#### Validation After Fix

- Confirm production/staging API base URLs are `https://`
- Rebuild native projects
- Verify app startup, login, and API calls still work in dev and staging

### 4. Google Maps API keys are committed in source-controlled config

- Severity: High
- Status: Confirmed
- Location:
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L107)
  - [src/config/constants.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/config/constants.ts#L6)
  - [ios/teaboivendorapp/Info.plist](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/ios/teaboivendorapp/Info.plist#L51)
  - [ios/teaboivendorapp/AppDelegate.swift](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/ios/teaboivendorapp/AppDelegate.swift#L39)
  - [android/app/src/main/AndroidManifest.xml](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/android/app/src/main/AndroidManifest.xml#L19)

#### Problem

The same Google Maps API key is committed in Expo config, JS config, and generated native files. Even if platform restrictions exist, committing active keys expands exposure and makes rotation harder.

#### Possible Fix

Recommended sequence:

1. Move the key to environment-based config used at build time.
2. Remove hardcoded keys from `app.json` and `src/config/constants.ts`.
3. Regenerate native files so the committed iOS and Android files stop carrying the key.
4. Rotate the existing key after the replacement is deployed.
5. Restrict the rotated key by bundle/package identity and allowed APIs.

#### Validation After Fix

- Build iOS and Android with env-provided keys
- Confirm maps still load
- Confirm old committed key no longer works after rotation

### 5. Debug logging is still present in sensitive runtime paths

- Severity: Medium
- Status: Confirmed
- Location:
  - [src/api/client.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/api/client.ts#L24)
  - [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L42)
  - [src/services/socketService.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/services/socketService.ts#L22)
  - [src/services/socketService.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/services/socketService.ts#L119)
  - [src/config/NotificationsContext.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/config/NotificationsContext.tsx#L53)
  - [src/store/useNotificationStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useNotificationStore.ts#L45)

#### Problem

The app still logs request bodies, auth failures, socket lifecycle details, push notification payloads, and a stray callback dump. Some of it is dev-gated, some of it is not.

This creates noise during debugging and increases the chance of leaking sensitive runtime data into device logs or remote log collection.

#### Possible Fix

Recommended sequence:

1. Delete logs that are only temporary debugging.
2. Keep only structured error reporting that is safe for production.
3. Wrap any remaining development diagnostics behind a single logger utility and an `isDev` guard.
4. Remove the duplicate notification logs in whichever notification implementation is not retained.

#### Validation After Fix

- Exercise login, push registration, and socket connect/disconnect
- Confirm production builds do not emit verbose payload logs

### 6. Home screen is still a static placeholder instead of a live dashboard

- Severity: Medium
- Status: Confirmed
- Location:
  - [src/modules/home/screens/HomeScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/home/screens/HomeScreen.tsx#L24)
  - [src/modules/home/screens/HomeScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/home/screens/HomeScreen.tsx#L27)
  - [src/modules/home/screens/HomeScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/home/screens/HomeScreen.tsx#L81)

#### Problem

The dashboard still hardcodes online status, route progress, earnings, delivery counts, and upcoming orders. The UI looks finished, but it does not reflect real vendor state.

That is risky because it can mislead QA and product review into believing core dashboard behaviors already exist.

#### Possible Fix

Recommended sequence:

1. Define the required dashboard data contract.
2. Replace hardcoded values with queries/selectors.
3. Add loading, empty, and error states.
4. Keep any mock cards behind an explicit development flag if design placeholders are still needed.

#### Validation After Fix

- Compare the dashboard against live API data for at least one vendor account
- Confirm the online/offline toggle persists to backend or local store as intended

### 7. Duplicated and unused infrastructure is still in the tree

- Severity: Low
- Status: Confirmed
- Location:
  - [src/config/NotificationsContext.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/config/NotificationsContext.tsx#L36)
  - [src/store/useNotificationStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useNotificationStore.ts#L17)
  - [src/navigation/RootNavigation.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/navigation/RootNavigation.ts)
  - [src/modules/auth/hooks/useSignup.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useSignup.ts#L8)

#### Problem

- There are two notification state implementations doing the same registration/listener work.
- `NotificationProvider` appears orphaned in the current tree.
- `RootNavigation.ts` is still an empty file.
- `useSignup` still accepts `navigation` but does not use it.

These are not release blockers, but they slow maintenance and make it harder to tell which path is authoritative.

#### Possible Fix

Recommended sequence:

1. Choose one notification state pattern: context or Zustand.
2. Remove the unused implementation and its duplicate logging.
3. Delete `RootNavigation.ts` if it has no planned use.
4. Drop the unused `navigation` parameter from `useSignup`.

#### Validation After Fix

- Search again for `NotificationProvider`, `useNotificationStore`, and `RootNavigation`
- Confirm only one notification bootstrap path remains

### 8. Weakly typed boundaries are still widespread in navigation and services

- Severity: Low
- Status: Confirmed
- Location:
  - [src/navigation/navigationRef.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/navigation/navigationRef.ts#L5)
  - [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L13)
  - [src/modules/auth/hooks/useSignup.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useSignup.ts#L8)
  - [src/modules/home/screens/HomeScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/home/screens/HomeScreen.tsx#L21)

#### Problem

The project still relies on many `any`-typed route params, store selectors, form payloads, and navigation helpers. TypeScript passes because those boundaries are permissive, not because the contracts are tight.

#### Possible Fix

Recommended sequence:

1. Type `navigationRef` with the app root param list.
2. Replace `any` in auth hooks with concrete request/response types.
3. Type route props for screens that already have stable params.
4. Prioritize files on active feature paths first instead of trying to remove every `any` at once.

#### Validation After Fix

- Re-run `npx tsc --noEmit`
- Confirm navigation calls fail at compile time when route names or params are wrong

## Resolved Or Not Present

These items were checked and are not current issues in the present code state:

- Secure token persistence: the auth token is now separated from MMKV and stored through [src/store/secureStorage.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/secureStorage.ts)
- Camera hardcoded redirect to `CompleteProfile`: the camera screen now confirms by going back instead of always navigating to one screen
- Menu-card per-item query dependency issue: current [src/modules/menu/hooks/useMenuItemCard.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useMenuItemCard.ts) is local optimistic state and no longer creates a fetch dependency per card

## Recommended Next Action

Start with issue 1 and issue 2 together. They are the two remaining flow bugs most likely to break normal vendor onboarding and profile maintenance even when the backend is healthy.
