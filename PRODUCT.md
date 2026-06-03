# PRODUCT BRIEF — SeatTime

## What this app does
SeatTime is a supervised driving hours tracker for teen learner permit holders in the US. Parents and teens log every practice drive — duration, route (GPS), day/night, weather, road type — and watch a progress gauge fill toward their state's required hours. When the hours are done, the app generates a DMV-ready PDF affidavit the family can print and bring to the driving test. Both parents can log drives from separate devices to a shared teen profile, solving the #1 complaint about every competitor.

## Who it's for
Parents of 15-17-year-old teens with a learner's permit in any of the 47 US states (+ DC) that require logged supervised driving hours before a license can be issued. The parent is the buyer and primary user. The teen is the beneficiary and secondary user.

## How it makes money
- Soft paywall. First 5 drives free (enough to prove value and build trust).
- One-time unlock: $9.99 (unlimited drives + PDF export + all 50 states).
- RevenueCat handles the non-consumable IAP / lifetime entitlement.
- No subscription — compliance tool with 6-12 month lifecycle.
- No ads. Ever.

## Core feature loop
1. Parent/teen opens app
2. Taps "Start Drive" — timer begins, GPS tracks route
3. Drive ends — app auto-logs duration, day/night, route, weather
4. Parent reviews and confirms the drive entry
5. Progress ring updates toward state goal
6. At milestone hours (10h, 25h, 50h) — Milestone Burst celebration
7. When target reached — generate DMV-ready PDF, print, go pass the test

## v1 Feature Set

### Core
- Drive Timer — one-tap start/stop, runs in background
- Manual Log — add a past drive with date, time, duration, conditions
- State Picker — select state once, loads exact requirements
- Day/Night Auto-Detection — based on local sunrise/sunset
- GPS Route Tracking — maps each drive route
- Weather Conditions — clear, rain, snow, fog
- Road Type — residential, highway, rural, parking lot

### Progress & Motivation
- Progress Rings — day hours, night hours, total vs state requirement
- Milestone Burst — celebration at 10h, 25h, 50h and state completion
- Drive History — scrollable, filterable, route preview

### Multi-Parent Sharing
- User accounts (Sign in with Apple + email)
- Shared teen profile — both parents log to one record
- Real-time sync via Firebase Firestore
- Multiple teens per family
- Offline-first: logs locally, syncs when online

### Export & Compliance
- PDF Export — DMV-ready driving log
- Parent Co-Sign — digital signature on PDF
- Drive Summary Stats

### Settings & Trust
- Account management, delete account
- Data export (CSV)
- Privacy-first messaging
- Offline support

## Differentiation vs competitors
- RoadReady (2.1 stars): crashes, deletes data, ads cover save button — we are reliable with no ads
- Dryves (new, polished): single-device only — we have multi-parent sharing
- Quick Log (~3.5 stars): stale since 2023 — we are actively maintained
- Student Driving Logger (4.66 stars): no state-specific compliance — we have state templates
- All competitors: no celebration of progress — we have Milestone Burst

## Success metrics
- Free to paid conversion: target 40%+
- Day-30 retention: target 60%+
- Revenue at 6 months: target $3K+
- App Store rating: target 4.5+ within first 100 reviews
- Installs at 6 months: target 2,000+

## Design Identity
"Drive Calm" — calm confidence, parents feel in control, warm and trustworthy. Think: a well-designed Volvo dashboard, not a Tesla. Soft colours, clear typography, generous spacing. Every screen says "your teen is on track, you've got this."

## Signature Interaction
Milestone Burst: When the teen hits a milestone (10h, 25h, 50h, state requirement complete), the progress ring pulses, Lottie confetti cascades, haptic celebration fires, and a congratulatory card slides up. Built with: Lottie + Reanimated + expo-haptics.

## Colour Direction
- Primary: calm teal #3A7D7E (trust, safety, progress)
- Accent: warm amber #D4944C (celebration, milestones)
- Success green for completed goals
- No red unless genuine error — never make parents anxious

## Technical Architecture
- Backend: Firebase Auth + Firestore (JS SDK, not @react-native-firebase)
- Offline-first: drives log locally, sync when online
- GPS: expo-location for route tracking
- PDF: expo-print + expo-sharing
- State data: JSON config in src/data/stateRequirements.ts
- Sign in with Apple: required (we offer email login)
- Account deletion: required (accounts exist)
