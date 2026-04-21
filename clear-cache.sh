#!/bin/bash

echo "�� Clearing all caches..."

# Stop Metro if running
pkill -f "react-native" || true
pkill -f "metro" || true

# Clear Metro cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Clear Expo cache
rm -rf .expo 2>/dev/null || true

# Clear node_modules cache
rm -rf node_modules/.cache 2>/dev/null || true

# Clear iOS build
rm -rf ios/build 2>/dev/null || true
rm -rf ios/Pods 2>/dev/null || true

# Clear watchman
watchman watch-del-all 2>/dev/null || true

echo "✅ Cache cleared!"
echo ""
echo "Next steps:"
echo "1. cd ios && pod install && cd .."
echo "2. npm start -- --reset-cache"
echo "3. In another terminal: npx expo run:ios"
