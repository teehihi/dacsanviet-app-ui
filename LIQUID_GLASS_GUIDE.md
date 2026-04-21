# 🌊 Liquid Glass Effect Guide

## 📋 Tổng quan

DacSanVietUI hỗ trợ **2 thư viện** cho glass effects với **automatic fallback**:

1. **@callstack/liquid-glass** - Advanced native iOS glass effect
2. **expo-blur** - Cross-platform blur effect (fallback)

## ✅ Đã cài đặt

```bash
✅ @callstack/liquid-glass@latest
✅ expo-blur@^55.0.14
✅ expo-glass-effect@~55.0.10
```

## 🎯 Cách sử dụng

### 1. Basic Usage (Auto Fallback)

```tsx
import { GlassView } from '../components/GlassView';

// Tự động dùng expo-blur (hoạt động mọi nơi)
<GlassView intensity={80} tint="light">
  <Text>Content with glass effect</Text>
</GlassView>
```

### 2. Advanced Usage (Force Liquid Glass)

```tsx
// Dùng liquid-glass nếu có, fallback về expo-blur
<GlassView useLiquidGlass={true} intensity={100}>
  <Text>Advanced glass effect</Text>
</GlassView>
```

### 3. Presets

```tsx
import { GlassView, GlassPresets } from '../components/GlassView';

// Card preset
<GlassView {...GlassPresets.card}>
  <Text>Glass Card</Text>
</GlassView>

// Modal preset
<GlassView {...GlassPresets.modal}>
  <Text>Glass Modal</Text>
</GlassView>

// Button preset
<GlassView {...GlassPresets.button}>
  <Text>Glass Button</Text>
</GlassView>
```

## 🔄 Fallback Logic

Component tự động detect và fallback:

```
1. Check if liquid-glass is available
2. Check if platform is iOS
3. Check if useLiquidGlass prop is true

IF all true → Use @callstack/liquid-glass
ELSE → Use expo-blur (fallback)
```

## 📱 Platform Support

| Feature | iOS | Android | Web | Expo Go |
|---------|-----|---------|-----|---------|
| expo-blur | ✅ | ✅ | ✅ | ✅ |
| liquid-glass | ✅ | ❌ | ❌ | ❌ |

## 🚀 Testing

### Test với Expo (expo-blur only)

```bash
npm start
# Quét QR code với Expo Go
```

### Test với Xcode (liquid-glass + expo-blur)

```bash
# Terminal 1
npm start

# Terminal 2 hoặc Xcode
npm run ios:dev
```

## 🎨 Demo Screen

Đã tạo sẵn demo screen: `screens/main/GlassEffectDemo.tsx`

Để xem demo:
1. Import vào navigation
2. Add route cho GlassEffectDemo
3. Navigate đến screen

## 🛠 Customization

### Custom Intensity

```tsx
<GlassView intensity={100} tint="dark">
  <Text>High intensity dark glass</Text>
</GlassView>
```

### Custom Border Radius

```tsx
<GlassView borderRadius={30}>
  <Text>Rounded glass</Text>
</GlassView>
```

### Custom Style

```tsx
<GlassView 
  style={{ 
    padding: 20, 
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
  }}
>
  <Text>Custom styled glass</Text>
</GlassView>
```

## 🔧 Troubleshooting

### Liquid Glass không hoạt động

**Nguyên nhân**: Chưa rebuild native project

**Giải pháp**:
```bash
npx expo prebuild --clean
cd ios
pod install
cd ..
npm run ios:dev
```

### Expo Blur bị mờ quá

**Giải pháp**: Giảm intensity
```tsx
<GlassView intensity={60} tint="light">
```

### Không thấy hiệu ứng

**Nguyên nhân**: Background không có nội dung để blur

**Giải pháp**: Đặt GlassView trên background có hình ảnh hoặc màu sắc
```tsx
<ImageBackground source={...}>
  <GlassView>
    <Text>Now you can see the blur</Text>
  </GlassView>
</ImageBackground>
```

## 📚 API Reference

### GlassView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Content inside glass view |
| intensity | number | 80 | Blur intensity (0-100) |
| tint | 'light' \| 'dark' \| 'default' | 'light' | Tint color |
| style | ViewStyle | undefined | Custom styles |
| borderRadius | number | 20 | Border radius |
| useLiquidGlass | boolean | false | Force use liquid-glass if available |

### GlassPresets

```tsx
GlassPresets.card      // intensity: 80, tint: 'light', borderRadius: 16
GlassPresets.modal     // intensity: 100, tint: 'dark', borderRadius: 24
GlassPresets.button    // intensity: 60, tint: 'light', borderRadius: 12
GlassPresets.header    // intensity: 90, tint: 'light', borderRadius: 0
```

## 🎯 Best Practices

### 1. Use Presets

```tsx
// ✅ Good
<GlassView {...GlassPresets.card}>

// ❌ Avoid
<GlassView intensity={80} tint="light" borderRadius={16}>
```

### 2. Don't Force Liquid Glass Everywhere

```tsx
// ✅ Good - Let it fallback automatically
<GlassView>

// ❌ Avoid - Only use when needed
<GlassView useLiquidGlass={true}>
```

### 3. Test on Multiple Platforms

- Test với Expo Go (expo-blur)
- Test với Xcode (liquid-glass)
- Verify fallback hoạt động

## 📝 Examples

### Card with Glass Effect

```tsx
<GlassView {...GlassPresets.card} style={{ padding: 20 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
    Glass Card
  </Text>
  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
    Beautiful glass effect
  </Text>
</GlassView>
```

### Modal Overlay

```tsx
<View style={StyleSheet.absoluteFill}>
  <GlassView {...GlassPresets.modal} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Modal Content</Text>
  </GlassView>
</View>
```

### Button with Glass

```tsx
<TouchableOpacity>
  <GlassView {...GlassPresets.button} style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
    <Text style={{ color: 'white', fontWeight: '600' }}>
      Glass Button
    </Text>
  </GlassView>
</TouchableOpacity>
```

---

## 🔗 Resources

- [@callstack/liquid-glass](https://github.com/callstack/liquid-glass)
- [Expo Blur Documentation](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- [Demo Screen](./screens/main/GlassEffectDemo.tsx)
- [GlassView Component](./components/GlassView.tsx)

---

**Last Updated**: 2026-04-20
**Status**: Ready to use 🚀
