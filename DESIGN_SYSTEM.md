# DESIGN SYSTEM — SeatTime

## Design Identity
"Drive Calm" — calm confidence, parents feel in control, warm and trustworthy. Think: a well-designed Volvo dashboard, not a Tesla. Soft colours, clear typography, generous spacing. Every screen says "your teen is on track, you've got this."

## Philosophy
Simple, calm, confident. Every screen has ONE clear action. Parents are stressed about their teen driving — this app makes them feel in control, not anxious.

## Principles
1. One action per screen — never overwhelm
2. Big tap targets (48px minimum)
3. Bottom navigation — one-handed use
4. Progressive disclosure — basics first
5. Celebrate progress — positive feedback after every milestone
6. Premium but approachable — trustworthy, not flashy

## Colors (set in src/constants/colors.ts)

LIGHT
- bg: #FAF8F3 (warm off-white)
- bgSecondary: #FFFFFF
- text: #1A1A1A
- textSecondary: #666666
- primary: #3A7D7E (calm teal — trust, safety, progress)
- primaryLight: #4A9D9E
- accent: #D4944C (warm amber — celebration, milestones, warmth)
- success: #4A9D5B (green — goal complete)
- warning: #C9A227
- error: #C44545
- cardBg: rgba(255, 255, 255, 0.9)
- glassBg: rgba(255, 255, 255, 0.08)
- glassBorder: rgba(255, 255, 255, 0.15)

DARK
- bg: #121212
- bgSecondary: #1E1E1E
- text: #FFFFFF
- textSecondary: #B3B3B3
- primary: #5ABFBF (lighter teal for dark mode)
- primaryLight: #6DCFCF
- accent: #E8A838 (brighter amber for dark mode)
- success: #5ABD6B
- warning: #D4B237
- error: #D45555
- cardBg: rgba(30, 30, 30, 0.9)
- glassBg: rgba(255, 255, 255, 0.05)
- glassBorder: rgba(255, 255, 255, 0.1)

## Typography
- H1: Outfit Bold 28px
- H2: Outfit SemiBold 22px
- H3: Outfit SemiBold 18px
- Body: DM Sans Regular 16px
- Caption: DM Sans Regular 13px
- Metrics: Outfit Bold 48-64px (big progress numbers)
- Tab labels: System font 11px semibold
- Fallback: system fonts if custom fonts fail to load

## Spacing (multiples of 4)
xs: 4 / sm: 8 / md: 16 / lg: 24 / xl: 32 / xxl: 48

## Components
- Button: 52px min height, 16px radius, haptic on press, scale to 0.96 (withSpring damping:15 stiffness:200)
- Card: 20px radius, triple shadow, 20px internal padding
- GlassCard: expo-blur intensity 40-80 + 20px radius + triple shadow + fadeInUp entry (300ms)
- Tab bar: 4 tabs max, system font 11px semibold, blur background, safe area padding
- Progress Ring: Skia Canvas, animated fill (withTiming 1000ms easeOutCubic), teal fill, amber milestones

## Triple Shadow System
shadowLayer1: { shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, shadowOpacity: 0.04 }
shadowLayer2: { shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, shadowOpacity: 0.06 }
shadowLayer3: { shadowOffset: { width: 0, height: 16 }, shadowRadius: 32, shadowOpacity: 0.08 }

## Animation Parameters
- Button press: withSpring({ damping: 15, stiffness: 200 }) scale 0.96
- Card press: withSpring({ damping: 15, stiffness: 200 }) scale 0.98
- Screen entry: withTiming({ duration: 300 }) translateY 20→0, opacity 0→1
- Staggered entry: same, delay each item by 150ms
- Progress fill: withTiming({ duration: 1000, easing: Easing.out(Easing.cubic) })
- Milestone burst: withSpring({ damping: 12, stiffness: 180 }) + Lottie confetti
- Pulse loop: withRepeat(withTiming, -1, true) opacity 0.6→1.0

## Screen Character
- Home / Dashboard: CALM + CLEAR. Progress rings are the hero. Parents see status at a glance.
- Active Drive: FOCUSED. Timer is the only thing that matters. Minimal distractions.
- Drive History: ORGANISED. Clean list, filterable, route previews.
- Progress: MOTIVATIONAL. Big numbers, colour-coded, celebrate milestones.
- Settings: CLEAN. Trustworthy. Zero clutter.
- Onboarding: SIMPLE + FAST. State selection → first drive in under 60 seconds.

## Anti-patterns (NEVER)
- Generic grey backgrounds
- Gradients on full screens
- Text over images
- Purple-on-white AI aesthetic
- Inter font + cookie-cutter layouts
- Modal popups except for confirmations
- Red or anxious colours on progress screens — this app calms parents, never stresses them
