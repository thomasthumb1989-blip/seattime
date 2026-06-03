# HOW THIS PROJECT GETS BUILT

## Sequence (always)
1. Every feature starts as a plain English description from Dan
2. Claude Code writes all code — Dan never writes code manually
3. Test on Android Pixel (Expo Go or preview build) FIRST
4. iOS builds run via EAS cloud after Android passes
5. No feature gets built without knowing WHY it helps the user or makes money

## Adding a feature
1. Describe what it does + WHY in plain English
2. Add types to src/types/index.ts
3. Build logic as a hook in src/hooks/use[Feature].ts (or context if shared)
4. Build UI in app/[route].tsx using src/components/ui/
5. Put all strings in src/constants/strings.ts under [FEATURE_KEY]
6. Add loading/error/empty states + haptics + light+dark mode
7. Run tsc --noEmit
8. Commit "feat: [description]" and push

## Fixing a bug
1. Describe the bug
2. Apply the fix
3. Add an entry to CLAUDE.md "Gotchas Found"
4. Commit "fix: [description]" and push

## Git
- Commit after every feature or fix (NEVER batch commits — can't roll back batches)
- Lowercase descriptive commit messages
- Push after every session
- Never commit broken code — tsc --noEmit must pass
