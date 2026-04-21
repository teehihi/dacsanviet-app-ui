# 🍎 Xcode & iOS Native Setup Guide

## 📋 Tổng quan

DacSanVietUI hỗ trợ **2 workflow** để phát triển:

1. **Expo Workflow** (Quick Testing) - `npm start` + QR code
2. **Native Workflow** (Xcode) - Build iOS native với liquid glass effects

## 🎯 Mục đích

- **Expo**: Phát triển nhanh, test trên thiết bị thật qua QR code
- **Xcode**: Implement native features (liquid glass, advanced animations)

---

## 🚀 Setup Instructions

### 1️⃣ Generate iOS Native Project

```bash
cd DacSanVietUI

# Generate iOS and Android native folders
npx expo prebuild

# Or clean rebuild
npx expo prebuild --clean
```

**Kết quả**: Tạo folder `ios/` với Xcode project

### 2️⃣ Open in Xcode

```bash
# Open Xcode project
open ios/DacSanVietUI.xcworkspace

# Or use Xcode directly
# File > Open > DacSanVietUI/ios/DacSanVietUI.xcworkspace
```

⚠️ **QUAN TRỌNG**: Luôn mở `.xcworkspace` (không phải `.xcodeproj`)

### 3️⃣ Configure Xcode Project

#### A. Select Development Team
1. Click project name trong navigator
2. Select target "DacSanVietUI"
3. Tab "Signing & Capabilities"
4. Chọn Team của bạn (hoặc Add Account)

#### B. Update Bundle Identifier (Optional)
```
Default: com.anonymous.BaiTapTuan1_TypeScript
Suggested: com.dacsanviet.ui
```

#### C. Select Simulator/Device
- Simulator: iPhone 15 Pro (recommended)
- Real Device: Connect via USB

### 4️⃣ Build & Run

**Option A: From Xcode**
```
1. Select target device/simulator
2. Click ▶️ Play button (or Cmd+R)
3. Wait for build to complete
```

**Option B: From Terminal**
```bash
# Run on iOS simulator
npm run ios:dev

# Or use expo
npx expo run:ios
```

---

## 🔄 Switching Between Workflows

### Expo Workflow (Development)

```bash
# Start Expo dev server
npm start

# Scan QR code with Expo Go app
# Or press 'i' for iOS simulator
```

**Ưu điểm**:
- ⚡ Fast refresh
- 📱 Test trên nhiều thiết bị
- 🔄 Hot reload
- 🚀 Quick iteration

**Nhược điểm**:
- ❌ Không access native code
- ❌ Không dùng được custom native modules

### Native Workflow (Xcode)

```bash
# Build from terminal
npm run ios:dev

# Or open Xcode
open ios/DacSanVietUI.xcworkspace
```

**Ưu điểm**:
- ✅ Full access native code
- ✅ Custom native modules
- ✅ Advanced debugging
- ✅ Liquid glass effects

**Nhược điểm**:
- 🐌 Slower build time
- 💻 Chỉ test trên Mac

---

## 🎨 Implementing Liquid Glass Effect

### Step 1: Check Existing Dependencies

```bash
# Already installed in package.json
expo-blur: ^55.0.14
expo-glass-effect: ~55.0.10
```

### Step 2: Create Glass Component

```typescript
// components/GlassView.tsx
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassView = ({ 
  children, 
  intensity = 80, 
  tint = 'light' 
}: GlassViewProps) => {
  return (
    <BlurView intensity={intensity} tint={tint} style={styles.container}>
      <View style={styles.overlay}>
        {children}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
});
```

### Step 3: Use in Screens

```typescript
import { GlassView } from '../components/GlassView';

// In your screen
<GlassView intensity={100} tint="light">
  <Text>Content with glass effect</Text>
</GlassView>
```

### Step 4: Advanced Native Implementation (Optional)

Nếu cần custom native code:

```bash
# Create native module
cd ios
pod install
```

Edit `ios/DacSanVietUI/AppDelegate.mm` để add custom effects.

---

## 🛠 Common Tasks

### Update Native Dependencies

```bash
# After adding new native packages
cd ios
pod install
cd ..

# Rebuild
npm run ios:dev
```

### Clean Build

```bash
# Clean Xcode build
cd ios
xcodebuild clean
cd ..

# Or from Xcode: Product > Clean Build Folder (Shift+Cmd+K)
```

### Fix Build Errors

```bash
# Reset everything
npx expo prebuild --clean
cd ios
pod install
cd ..
npm run ios:dev
```

---

## 📱 Testing Strategies

### Development Phase
```bash
# Use Expo for quick testing
npm start
```

### Native Features Testing
```bash
# Use Xcode for glass effects
npm run ios:dev
```

### Production Build
```bash
# Build for TestFlight/App Store
npx expo build:ios
```

---

## 🔧 Troubleshooting

### Error: "No development team selected"
**Solution**: 
1. Open Xcode
2. Select project > Signing & Capabilities
3. Add your Apple ID account
4. Select team

### Error: "Pod install failed"
**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Error: "Module not found"
**Solution**:
```bash
# Clear cache
npm start -- --clear

# Rebuild native
npx expo prebuild --clean
```

### Error: "Build failed in Xcode"
**Solution**:
1. Clean build folder (Shift+Cmd+K)
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Rebuild

---

## 📚 Useful Commands

```bash
# Expo commands
npm start                    # Start Expo dev server
npm run ios                  # Run in Expo (simulator)
npm run ios:dev              # Run native build

# Xcode commands
open ios/DacSanVietUI.xcworkspace  # Open Xcode
xcodebuild clean             # Clean build

# Pod commands
cd ios && pod install        # Install CocoaPods
cd ios && pod update         # Update pods
```

---

## 🎯 Recommended Workflow

### Daily Development
1. Use `npm start` for UI/logic changes
2. Test on real device via QR code
3. Fast iteration with hot reload

### Native Features
1. Switch to Xcode when needed
2. Implement glass effects
3. Test on simulator
4. Commit changes

### Before Commit
1. Test both workflows
2. Ensure Expo still works
3. Verify Xcode builds
4. Update documentation

---

## 📝 Notes

- ✅ iOS folder được commit vào git (không ignore)
- ✅ Có thể switch giữa 2 workflows bất cứ lúc nào
- ✅ Expo Go app vẫn hoạt động bình thường
- ✅ Native code changes cần rebuild (không hot reload)
- ⚠️ Sau khi thay đổi native code, phải rebuild từ Xcode
- ⚠️ Pod install cần chạy sau khi thêm native dependencies

---

## 🔗 Resources

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Expo Blur Documentation](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- [React Native iOS Guide](https://reactnative.dev/docs/running-on-device)
- [Xcode Documentation](https://developer.apple.com/xcode/)

---

**Last Updated**: 2026-04-20
**Status**: Ready for iOS development 🚀
