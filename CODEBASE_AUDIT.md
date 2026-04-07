# Teaboi Vendor App Codebase Audit

## Executive Summary

- Overall health score: 5/10
- Audit scope: application source in `src/`, app entry points, navigation, shared components, stores, native config, and Expo config
- TypeScript status: `npx tsc --noEmit` passes, so the main risks are runtime flow issues, permissive configuration, and places where the code intentionally bypasses types

### Top 3 issues to fix first

1. `PENDING_PROFILE` login flow navigates before persisting auth, which can leave profile completion unauthenticated.
2. Cleartext networking is enabled on both iOS and Android.
3. Camera capture is hardcoded to return to `CompleteProfile`, which breaks the `EditProfile` flow.

### Architecture Assessment

The repo has a workable high-level shape: `services` for API boundaries, `react-query` for server state, Zustand for local app state, and feature-based modules under `src/modules`. The main problems are inconsistency and safety rather than lack of structure: some screens still embed too much flow logic, several request/response boundaries are typed loosely with `any`, and a few navigation and security decisions are fragile enough to create runtime failures.

---

## Fix Sequence

1. Critical flow breakages
2. Security and production hardening
3. Redundant fetching and data-flow cleanup
4. Type-safety and API-boundary cleanup
5. Dead code and maintainability cleanup

---

## 1. Critical Flow Breakages

### 1.1 Pending-profile login path drops the auth token

- Severity: Critical
- Category: State Management Problems
- Location:
  - [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L17)
  - [src/store/useAuthStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useAuthStore.ts#L13)
  - [src/api/client.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/api/client.ts#L19)

#### What is wrong

`useLogin` only calls `setAuth(user, accessToken)` after all status gating. For users in `PENDING_PROFILE` or with `vendorProfile.isProfileComplete === false`, the code navigates to `CompleteProfile` and returns before persisting the token.

Because the API client reads the bearer token from Zustand storage, the user can land in the profile-completion flow without authenticated API access.

#### Why it matters

- Profile completion can fail for valid users
- The bug is path-dependent and will be hard to diagnose from UI behavior alone
- It breaks the intended auth lifecycle

#### Possible fix

Persist auth first, then branch on status.

```ts
onSuccess: (response: ApiResponse<LoginResponseData>) => {
  if (!response.data) return;

  const { user, accessToken, vendorProfile } = response.data;
  setAuth(user, accessToken);

  if (user.status === AccountStatus.PENDING_VERIFICATION) {
    navigate('OtpVerification', { email: user.email });
    return;
  }

  if (
    user.status === AccountStatus.PENDING_PROFILE ||
    !vendorProfile.isProfileComplete
  ) {
    navigate('CompleteProfile');
    return;
  }

  if (user.status === AccountStatus.PENDING_APPROVAL) {
    Alert.alert(
      'Pending Approval',
      'Your registration is complete. Please wait for admin review.'
    );
  }
}
```

#### Recommended follow-up

- Add a test for the `PENDING_PROFILE` login branch
- Confirm whether `PENDING_VERIFICATION` should also persist auth or stay unauthenticated by product decision

---

### 1.2 Camera screen always returns to `CompleteProfile`

- Severity: Medium
- Category: Navigation & Lifecycle Issues
- Location:
  - [src/modules/profile/screens/EditProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/EditProfileScreen.tsx#L31)
  - [src/modules/profile/screens/CameraScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CameraScreen.tsx#L12)
  - [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L49)

#### What is wrong

`EditProfileScreen` navigates to `Camera` with an `onPhotoTaken` callback, but `CameraScreen` ignores incoming params and always does:

```ts
navigate('CompleteProfile', {
  capturedPhotoUri: photo.uri,
});
```

That means the camera works only for one caller and is incompatible with another existing caller in the codebase.

#### Why it matters

- `EditProfile` camera capture is effectively broken
- The screen contract is inconsistent across callers
- Future callers will inherit the same bug unless the contract is made explicit

#### Possible fix

Handle callback-based return when present, and fall back only when needed.

```ts
const onPhotoTaken = route.params?.onPhotoTaken;

if (onPhotoTaken) {
  onPhotoTaken(photo.uri);
  goBack();
  return;
}

navigate('CompleteProfile', {
  capturedPhotoUri: photo.uri,
});
```

#### Better long-term pattern

Use typed route params for `Camera`:

```ts
type CameraParams = {
  Camera: {
    onPhotoTaken?: (uri: string) => void;
    returnTo?: 'CompleteProfile' | 'EditProfile';
  };
};
```

---

### 1.3 `CompleteProfile` camera flow depends on transient local state

- Severity: Medium
- Category: Navigation & Lifecycle Issues
- Location:
  - [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L49)
  - [src/modules/profile/screens/CompleteProfileScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CompleteProfileScreen.tsx#L62)
  - [src/modules/profile/screens/CameraScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/screens/CameraScreen.tsx#L20)

#### What is wrong

`CompleteProfileScreen` stores the active document target in local state (`activeDocType`) and then navigates to `Camera`. The return flow depends on that local state still being present when `capturedPhotoUri` arrives back through route params.

This is functional in the current happy path, but the target document type is not passed through navigation, so the return contract is implicit and fragile.

#### Why it matters

- The flow is easy to break during refactors
- State restoration or alternate return paths would be fragile
- The screen is coupling navigation and upload target state too tightly

#### Possible fix

Pass the target doc type into the camera route explicitly:

```ts
navigate('Camera', {
  docType: activeDocType,
});
```

Then return that same `docType` alongside the image URI:

```ts
navigate('CompleteProfile', {
  capturedPhotoUri: photo.uri,
  docType: route.params?.docType,
});
```

And consume it from params instead of relying on stale local state.

---

## 2. Security and Production Hardening

### 2.1 Cleartext traffic is enabled globally

- Severity: Critical
- Category: Security Concerns
- Location:
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L21)
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L39)
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L60)
  - [android/app/src/main/AndroidManifest.xml](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/android/app/src/main/AndroidManifest.xml#L18)
  - [ios/teaboivendorapp/Info.plist](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/ios/teaboivendorapp/Info.plist#L56)

#### What is wrong

The app explicitly permits non-HTTPS traffic:

- iOS: `NSAllowsArbitraryLoads = true`
- Android: `usesCleartextTraffic = true`

This is enabled in Expo config and reflected in the generated native files.

#### Why it matters

- Weakens transport guarantees for all API traffic
- Makes it easier for insecure endpoints to survive into production
- Unnecessarily broad for a vendor app that handles authenticated requests

#### Possible fix

Remove these flags entirely unless there is a documented host-level exception requirement.

#### Safer pattern

- Use HTTPS-only APIs
- If a local dev host needs exceptions, scope them to development builds only
- On iOS, use domain exceptions instead of arbitrary loads
- On Android, use a network security config instead of global cleartext enablement

---

### 2.2 Auth token is persisted without encryption

- Severity: Medium
- Category: Security Concerns
- Location:
  - [src/store/storage.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/storage.ts#L1)
  - [src/store/useAuthStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useAuthStore.ts#L33)

#### What is wrong

The auth store persists `token` using MMKV, but MMKV is initialized with:

```ts
const storage = createMMKV();
```

No encryption key is configured.

#### Why it matters

- Bearer tokens are long-lived sensitive credentials
- Persisting them unencrypted increases exposure on a compromised device or during forensic extraction

#### Possible fix

Use encrypted storage for the token. Options:

1. Configure MMKV encryption
2. Store only the token in platform-secure storage and keep the rest in MMKV

Example direction:

```ts
const storage = createMMKV({
  id: 'secure-auth-storage',
  encryptionKey: secureKeyFromKeychain,
});
```

#### Recommended follow-up

- Separate sensitive auth material from non-sensitive user profile state
- Define token rotation and logout cleanup behavior explicitly

---

### 2.3 Sensitive logging is left in production paths

- Severity: Medium
- Category: Security Concerns
- Location:
  - [src/services/socketService.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/services/socketService.ts#L14)
  - [src/api/client.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/api/client.ts#L85)
  - [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L43)
  - [src/modules/profile/services/profileService.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/services/profileService.ts#L42)

#### What is wrong

There are unconditional logs that expose sensitive or noisy runtime information:

- Socket token log in `socketService`
- Raw error dump in `apiClient`
- Auth and profile response logging in feature hooks/services

Some logs are gated by `isDev`, but several are not.

#### Why it matters

- Tokens and request payloads can leak into device logs
- Crash diagnostics become noisy and harder to reason about
- Production observability should be structured, not ad hoc console dumps

#### Possible fix

- Remove token and raw response logs entirely
- Wrap non-sensitive diagnostics in `if (__DEV__)`
- Replace debugging logs with a structured logger if needed

Example:

```ts
if (__DEV__) {
  console.log('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    statusCode,
  });
}
```

---

### 2.4 API keys are committed into JS and native config

- Severity: Medium
- Category: Security Concerns
- Location:
  - [src/config/constants.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/config/constants.ts#L6)
  - [app.json](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/app.json#L107)
  - [android/app/src/main/AndroidManifest.xml](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/android/app/src/main/AndroidManifest.xml#L19)
  - [ios/teaboivendorapp/Info.plist](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/ios/teaboivendorapp/Info.plist#L50)

#### What is wrong

The Google Maps API key is hardcoded in multiple places.

#### Why it matters

- Mobile keys are not secrets in the strict sense, but committing them broadly increases exposure
- Multiple sources of truth make rotation error-prone
- Restriction mistakes become harder to detect

#### Possible fix

- Source the key from env/config once
- Inject it through Expo config plugins/native config generation
- Restrict the key in Google Cloud by package name, SHA cert, and iOS bundle id

---

## 3. Redundant Fetching and Data-Flow Cleanup

### 3.1 Orders screen fetches both active and history orders on mount

- Severity: Medium
- Category: Redundant / Excessive API Calls
- Location:
  - [src/modules/orders/hooks/useOrdersLogic.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/hooks/useOrdersLogic.ts#L11)
  - [src/modules/orders/hooks/useActiveOrders.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/hooks/useActiveOrders.ts#L11)
  - [src/modules/orders/hooks/useOrderHistory.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/hooks/useOrderHistory.ts#L11)

#### What is wrong

`useOrdersLogic` mounts both hooks immediately, so both endpoints are fetched even when the UI is showing only one tab.

#### Why it matters

- Extra network traffic
- Slower first paint for the orders screen
- Unnecessary server load

#### Possible fix

Option A: Gate each query with `enabled`.

```ts
useQuery({
  queryKey: ['activeOrders'],
  queryFn: orderService.getActiveOrders,
  enabled: activeTab === 'active',
});
```

Option B: Replace both hooks with one tab-driven hook:

```ts
useQuery({
  queryKey: ['orders', activeTab],
  queryFn: activeTab === 'active'
    ? orderService.getActiveOrders
    : orderService.getOrderHistory,
});
```

---

### 3.2 Category fetching logic is duplicated across menu hooks

- Severity: Medium
- Category: DRY Violations
- Location:
  - [src/modules/menu/hooks/useAddMenuLogic.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useAddMenuLogic.ts#L19)
  - [src/modules/menu/hooks/useEditMenuLogic.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useEditMenuLogic.ts#L19)
  - [src/modules/menu/hooks/useAddMenuItem.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useAddMenuItem.ts#L16)

#### What is wrong

The same fetch/parse/store logic exists in three places:

- get categories
- normalize inconsistent response shape
- set loading state
- update local category selection state

`useAddMenuItem` is also unused.

#### Why it matters

- Fixes will need to be copied to multiple places
- Behavior can drift
- Categories are server state, but are treated as local one-off state

#### Possible fix

Create a shared `useCategories` hook backed by `react-query`:

```ts
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await menuService.getCategories(1, 50);
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

Then both add/edit screens consume the same hook.

#### Consolidation sequence

1. Introduce `useCategories`
2. Replace category state/loading logic in add/edit hooks
3. Delete `useAddMenuItem`

---

### 3.3 Menu item toggle hook creates a query dependency per card

- Severity: Low
- Category: Performance Issues
- Location:
  - [src/modules/menu/screens/MenuScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/screens/MenuScreen.tsx#L19)
  - [src/modules/menu/hooks/useMenuItemCard.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useMenuItemCard.ts#L5)

#### What is wrong

Each `MenuItemCard` calls `useVendorMenu()` only to access `toggleItem`. That means every card instance subscribes to the same query layer even though the list parent already owns the menu query.

#### Why it matters

- Extra subscriptions and indirection in a list
- Harder to reason about data ownership
- The list parent already has the mutation context

#### Possible fix

Move `toggleItem` ownership to the parent and pass it down:

```ts
const { toggleItem } = useVendorMenu();
<MenuItemCard item={item} onToggle={toggleItem} />
```

Then convert `useMenuItemCard` to a small local optimistic-state helper or remove it entirely.

---

## 4. Type Safety and API Boundary Cleanup

### 4.1 Route creation bypasses the declared API contract with `as any`

- Severity: Medium
- Category: TypeScript / Type Safety
- Location:
  - [src/modules/orders/services/routeService.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/services/routeService.ts#L38)
  - [src/modules/orders/screens/NewRoute.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/screens/NewRoute.tsx#L138)

#### What is wrong

`CreateRouteRequest` requires:

```ts
zones: { coordinates: RoutePoint[] }[];
```

But `NewRouteScreen` sends only:

```ts
{
  name,
  startTime,
  endTime,
  routePath: [startPoint, endPoint],
}
```

and suppresses the mismatch with `payload as any`.

#### Why it matters

- The compiler cannot protect a core request path
- If the backend requires `zones`, the error appears only at runtime
- This weakens confidence in the service type layer

#### Possible fix

Choose one of these:

1. If `zones` is required, send it from the screen
2. If `zones` is optional in the real API, change the type

Example:

```ts
export interface CreateRouteRequest {
  name: string;
  startTime: string;
  endTime: string;
  routePath: RoutePoint[];
  zones?: { coordinates: RoutePoint[] }[];
}
```

Only make it optional if the backend contract actually allows that.

---

### 4.2 `any` is used heavily at navigation and service boundaries

- Severity: Medium
- Category: TypeScript / Type Safety
- Location:
  - [src/modules/auth/services/authService.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/services/authService.ts#L7)
  - [src/modules/auth/hooks/useLogin.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useLogin.ts#L13)
  - [src/modules/home/navigations/MainNavigator.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/home/navigations/MainNavigator.tsx#L18)
  - [src/navigation/navigationRef.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/navigation/navigationRef.ts#L6)
  - [src/store/useMapStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useMapStore.ts#L4)

#### What is wrong

Core boundaries use `any`:

- auth request payloads
- route params
- navigation helpers
- transient map callback storage

#### Why it matters

- TypeScript cannot validate screen contracts
- Refactors become risky because route payload mismatches are silent
- Service layer loses value if request/response shapes are not enforced

#### Possible fix

Tighten one boundary at a time:

1. Define request types for auth service methods
2. Type `navigationRef` with the root param list
3. Replace `useMapStore.tempData: any` with a concrete interface
4. Remove `as any` and `route: any` from screens

Example:

```ts
interface LoginCredentials {
  email: string;
  password: string;
}

login: async (
  credentials: LoginCredentials
): Promise<ApiResponse<LoginResponseData>> => {
  return apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
}
```

---

### 4.3 API response parsing is inconsistent across hooks

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/modules/menu/hooks/useVendorMenu.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useVendorMenu.ts#L35)
  - [src/modules/orders/hooks/useActiveOrders.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/hooks/useActiveOrders.ts#L16)
  - [src/modules/orders/hooks/useOrderHistory.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/hooks/useOrderHistory.ts#L16)
  - [src/modules/orders/hooks/useVendorRoutes.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/orders/hooks/useVendorRoutes.ts#L16)

#### What is wrong

Multiple hooks manually probe different nested shapes:

- `rawResponse?.data?.data`
- `rawResponse?.data`
- `rawResponse`

That is a sign the service layer is not normalizing responses consistently.

#### Why it matters

- Parsing logic spreads into UI hooks
- Small backend response changes create broad breakage
- Service functions stop being reliable boundaries

#### Possible fix

Normalize server responses inside `service` functions, not in hooks.

Example:

```ts
getActiveOrders: async (): Promise<Order[]> => {
  const response = await apiClient.get<ApiResponse<Order[]>>(ENDPOINTS.VENDOR_ORDERS.ACTIVE);
  return Array.isArray(response.data) ? response.data : [];
}
```

Then the hook becomes:

```ts
useQuery({
  queryKey: ['activeOrders'],
  queryFn: orderService.getActiveOrders,
});
```

---

## 5. Dead Code and Maintainability Cleanup

### 5.1 Notification context duplicates store-based notification setup and is unused

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/config/NotificationsContext.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/config/NotificationsContext.tsx#L1)
  - [src/store/useNotificationStore.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/store/useNotificationStore.ts#L1)
  - [App.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/App.tsx#L24)

#### What is wrong

There are two implementations of notification registration/listener setup:

- `NotificationProvider`
- `useNotificationStore().initialize()`

Only the store version is used by `App.tsx`.

#### Why it matters

- Duplicated side-effect logic is easy to desynchronize
- Future maintainers may modify the wrong implementation

#### Possible fix

Delete `NotificationsContext.tsx` if the Zustand version is the intended source of truth. If context is preferred, remove the store initializer instead.

---

### 5.2 `RootNavigation.ts` is an empty file

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/navigation/RootNavigation.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/navigation/RootNavigation.ts)

#### What is wrong

The file exists but contains no code.

#### Why it matters

- Creates confusion during navigation refactors
- Suggests a stale architectural direction

#### Possible fix

- Delete the file if unused
- Or move `navigationRef` helpers into it if that was the intended location

---

### 5.3 Unused menu hook should be removed

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/modules/menu/hooks/useAddMenuItem.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/menu/hooks/useAddMenuItem.ts#L1)

#### What is wrong

`useAddMenuItem` is present but not referenced anywhere in the codebase.

#### Why it matters

- Increases maintenance cost
- Duplicates behavior already covered by `useAddMenuLogic`

#### Possible fix

Delete it after consolidating category logic.

---

### 5.4 `ScreenWrapper` has an unused `onPress` prop and unused style entries

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/shared/components/ScreenWrapper.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/shared/components/ScreenWrapper.tsx#L7)
  - [src/modules/auth/screens/OtpVerificationScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/screens/OtpVerificationScreen.tsx#L25)
  - [src/modules/auth/screens/ResetPasswordScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/screens/ResetPasswordScreen.tsx#L15)

#### What is wrong

- `ScreenWrapperProps` defines `onPress`, but the component never uses it
- `OtpVerificationScreen` and `ResetPasswordScreen` pass `onPress={Keyboard.dismiss}` expecting wrapper-level behavior
- `star` and `star7` style blocks are unused

#### Why it matters

- Component API is misleading
- Keyboard-dismiss intent in screens is not actually implemented

#### Possible fix

Either:

1. Implement a pressable outer wrapper, or
2. Remove `onPress` from the shared API and dismiss keyboards explicitly in callers

Also remove unused styles.

---

### 5.5 `handleInputChange` is returned from `useEditProfile` but not used

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/modules/profile/hooks/userEditProfile.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/hooks/userEditProfile.ts#L48)
  - [src/modules/profile/hooks/userEditProfile.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/profile/hooks/userEditProfile.ts#L92)

#### What is wrong

The hook defines and returns `handleInputChange`, but `EditProfileScreen` uses Formik state setters instead.

#### Why it matters

- Small but misleading dead API surface

#### Possible fix

Remove `handleInputChange` from the hook unless you intend to stop using Formik there.

---

## 6. Additional Proven Issues

### 6.1 Login screen renders `Constants.BASE_URL` in the UI

- Severity: Low
- Category: Styling & UI Consistency
- Location:
  - [src/modules/auth/screens/LoginScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/screens/LoginScreen.tsx#L23)

#### What is wrong

The login title renders:

```ts
Welcome Back! {Constants.BASE_URL}
```

#### Why it matters

- Exposes environment configuration directly in user-facing UI
- Looks like debug leakage rather than intentional product copy

#### Possible fix

Replace with a static heading:

```ts
<Text style={styles.title}>Welcome Back!</Text>
```

---

### 6.2 `Signup` hook accepts `navigation` but does not use it

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/modules/auth/hooks/useSignup.ts](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/auth/hooks/useSignup.ts#L8)

#### What is wrong

`useSignup` takes a `navigation` argument but navigates through the shared helper instead.

#### Why it matters

- Unused parameters are a maintenance smell
- Suggests partially migrated navigation style

#### Possible fix

Remove the argument and update the caller:

```ts
const { handleSignup, validate, initialValues, isLoading } = useSignup();
```

---

### 6.3 `HomeScreen` is currently static and does not reflect real app state

- Severity: Low
- Category: Code Structure & Architecture
- Location:
  - [src/modules/home/screens/HomeScreen.tsx](/Users/hamda/Documents/projects/rn/teaboi/teaboi-vendor-app/src/modules/home/screens/HomeScreen.tsx#L24)

#### What is wrong

The screen is built on mock data:

- hardcoded online/offline state
- hardcoded upcoming orders
- hardcoded route progress and earnings

#### Why it matters

- The screen architecture is not yet connected to the rest of the app data layer
- This is not necessarily wrong if intentional, but it should be treated as placeholder UI

#### Tradeoff

This looks intentional rather than accidental. It is acceptable as staging UI if the team knows it is a stub.

#### Possible next step

Document it as placeholder, or connect it to:

- `activeOrders`
- active route query
- vendor status endpoint/store

---

## Categories With No Proven Issues

### No issues found

- Circular dependencies
- FlatList missing keys
- Missing basic cleanup for OTP timer and interval logic
- Missing camera/gallery permission checks before invoking those features

---

## Recommended Implementation Plan

### Phase 1: Same-day fixes

1. Fix auth persistence in `useLogin`
2. Fix `CameraScreen` return behavior
3. Remove `Constants.BASE_URL` from login UI
4. Remove unconditional sensitive logs
5. Delete empty and unused files/hooks

### Phase 2: 1 to 3 day cleanup

1. Remove global cleartext networking flags
2. Encrypt persisted auth token storage
3. Add `useCategories` and remove duplicated category fetch code
4. Make orders tab queries conditional
5. Normalize response parsing inside services

### Phase 3: Structural hardening

1. Type navigation params end to end
2. Replace `any` in auth, map store, and route creation paths
3. Split large screens like `NewRoute` and `LiveTracking` into smaller focused units
4. Add flow tests around login, profile completion, route creation, and camera return behavior

---

## Final Notes

- This report includes only issues that are directly provable from the current code.
- The strongest immediate ROI is in auth flow correctness and transport security.
- The next most valuable cleanup is consolidating duplicated server-state logic so the current architecture becomes easier to extend without regressions.
