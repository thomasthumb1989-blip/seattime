# DESIGN PRINCIPLES — ANTI-GENERIC-AI

## Design Thinking
Before building ANY screen, commit to a BOLD direction:
- Purpose: what problem does this screen solve?
- Tone: "Drive Calm" — calm confidence, warm, trustworthy
- Differentiation: what makes this screen better than RoadReady's 2.1-star disaster?

## NEVER
- Generic defaults — no plain grey backgrounds, no flat boring layouts
- System default styling without customization
- Screens that look like every other app
- Evenly-distributed weak palettes — teal dominates, amber highlights
- Skip micro-interactions — every tap must feel alive
- Generic AI aesthetic: Inter font, purple-on-white gradients, cookie-cutter cards
- Anxious or urgent visual language — parents are already stressed

## ALWAYS
- Typography contrast: Outfit bold headlines vs DM Sans light body. LARGE impactful numbers on progress screens
- Color discipline: teal dominates, amber highlights milestones. White space is a feature
- Motion: fade-ins on screen load, scale on press, smooth transitions (react-native-reanimated, NEVER LayoutAnimation)
- Spatial composition: generous padding. Cards must breathe
- Visual hierarchy: one focal point per screen. The eye knows where to go
- Polish: shadows, rounded corners, consistent spacing. This is where amateur becomes pro
- Calm confidence: every screen should make a parent think "this app has my back"

## Mobile-specific
- 48x48px minimum touch target
- Bottom-heavy — primary actions within thumb reach
- Skeleton loading states, NEVER blank white
- Haptic on every interactive element

## React Native Premium Visual Techniques
- Glassmorphism: expo-blur BlurView (intensity 40-80) + semi-transparent rgba background + 1px border
- Depth with Skia: @shopify/react-native-skia DropShadow for shadows with spread
- Smooth transitions: react-native-reanimated withTiming/withSpring for every enter, appear, press. NEVER LayoutAnimation
- Gradient backgrounds: expo-linear-gradient for hero sections, cards, CTAs
- Micro-interactions: Scale to 0.96 on press, opacity pulse on loading
- Custom drawing: Skia Canvas + Path for progress rings — avoid heavy chart libraries
- Blur layers: expo-blur behind modals, behind bottom sheets for depth
- Lottie for delight: Confetti on milestone achievement, checkmark on drive logged

## Signature Interaction
Milestone Burst: When the teen hits a milestone (10h, 25h, 50h, state requirement complete), the progress ring pulses, Lottie confetti cascades from the top, a haptic celebration fires (notificationAsync success), and a congratulatory card slides up with the milestone name. Built with: Lottie + Reanimated + expo-haptics.
