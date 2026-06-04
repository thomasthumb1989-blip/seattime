# PROJECT RULES — READ EVERY SESSION

## App
- App name: SeatTime: Permit Hours Log
- Subtitle: Teen Driving Practice Tracker
- Design Identity: "Drive Calm" — calm confidence, parents feel in control, warm and trustworthy

## Developer
- Developer: Dan (App Store: Dan Johnson). Wales, UK. dan@listinglab.pro.
- Machine: Windows laptop (primary dev, Claude Code) + Mac (iOS Simulator, Xcode, testing).
- Phones for testing: Google Pixel Pro 10 XL (Android) + iPhone (iOS).
- IDE: Claude Code via Claude Desktop on Windows.
- GitHub: thomasthumb1989-blip.

## Stack
- React Native + Expo SDK 56 + TypeScript
- expo-router for navigation
- EAS Build for both iOS and Android cloud builds
- Paid upfront app ($9.99). No IAP, no RevenueCat, no paywall. Apple handles payment.
- Firebase JS SDK for auth + Firestore (multi-parent sharing)
- expo-location for GPS route tracking
- expo-print + expo-sharing for PDF export
- expo-apple-authentication for Sign in with Apple
- react-native-maps for route display
- AsyncStorage for local cache; expo-secure-store for sensitive data
- Premium visual: @shopify/react-native-skia, react-native-reanimated, expo-blur, expo-linear-gradient, lottie-react-native
- Custom fonts: Outfit (heading), DM Sans (body) via @expo-google-fonts

## Hard Rules — NEVER
- Never create .js or .jsx files. TypeScript only.
- Never use class components. Functional + hooks only.
- Never eject from Expo managed workflow.
- Never install native modules that require manual native linking.
- Never commit node_modules, .env, or build artifacts.
- Never hardcode API keys in source. Use EAS Secrets + EXPO_PUBLIC_ prefix.
- Never assume the app runs on iPhone. Test on BOTH Android Pixel and iPhone.
- Never skip error handling on async functions.
- Never set developmentClient: true in preview or production EAS profiles.
- Never combine multiple tasks in one prompt. One prompt = one feature or one fix.
- Never use @react-native-firebase packages — use Firebase JS SDK (firebase v9+ modular) only.

## Hard Rules — ALWAYS
- Run tsc --noEmit before every commit. Must pass clean.
- Add loading state, error state, and empty state to every async screen.
- Use colors from src/constants/colors.ts. Light + dark mode supported.
- Add expo-haptics feedback on every interactive element.
- Put ALL user-facing text in src/constants/strings.ts for future localization.
- Follow DESIGN_SYSTEM.md and DESIGN_SKILL.md for every UI decision.
- Design Identity is "Drive Calm" — reference it in every visual decision.
- Use GlassCard for stat displays and hero content. Use Card for list items and forms.
- Specify exact animation parameters (spring damping, stiffness, timing duration).
- Guard every native module init against missing API keys.
- Commit after every completed feature with "feat: " or "fix: " prefix.
- Push after every session.
- All Firebase operations must work offline-first (cache locally, sync when online).

## Build Workflow
- Local dev: npx expo start (Expo Go for fast iteration)
- Web preview: npx expo start --web (instant visual iteration)
- Android preview APK: eas build --profile preview --platform android
- iOS Simulator: eas build --profile development --platform ios (run on Mac)
- Production: eas build --profile production --platform all --clear-cache
- Submit iOS: eas submit --platform ios
- Submit Android: eas submit --platform android

## File Naming
- Components: PascalCase.tsx
- Hooks: useCamelCase.ts
- Utils: camelCase.ts
- Constants: camelCase.ts (exports in UPPER_SNAKE_CASE)
- Types: PascalCase exports from camelCase file

## Gotchas Found (append as we hit them)
- [Date] [bug] → [fix]
