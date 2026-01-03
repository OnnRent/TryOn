# 🎬 MP4 Splash Screen Setup Guide

## ✅ What's Already Done

I've updated your app to support **MP4 video splash screens**!

Files modified:
- ✅ `app/_layout.tsx` - Main layout with video splash
- ✅ `src/components/SplashScreenManager.tsx` - Reusable splash component
- ✅ `src/components/AnimatedSplash.tsx` - Lottie animation option
- ✅ `src/components/GifSplash.tsx` - GIF fallback option

---

## 🔧 Installation Steps

### Step 1: Install expo-av (Required for MP4)

```bash
cd Frontend
npx expo install expo-av
```

---

### Step 2: Add Your MP4 File

Place your MP4 splash video here:
```
Frontend/assets/splash.mp4
```

**Recommended specs:**
- Duration: 2-3 seconds
- Resolution: 1080x1920 (portrait) or 1920x1080 (landscape)
- File size: < 5MB
- Format: MP4 (H.264 codec)

---

### Step 3: Customize Duration (Optional)

In `app/_layout.tsx`, change the duration:

```typescript
// Current: 3 seconds
setTimeout(() => {
  // ...
}, 3000); // Change this number (milliseconds)
```

---

### Step 4: Customize Background Color

In `app/_layout.tsx`, update the background:

```typescript
const styles = StyleSheet.create({
  splashContainer: {
    backgroundColor: '#000', // Change to your brand color
    // ...
  },
});
```

---

## 🎨 Customization Options

### Option 1: Full Screen Video (Current)
```typescript
splashVideo: {
  width: '100%',
  height: '100%',
}
```

### Option 2: Centered with Padding
```typescript
splashVideo: {
  width: '80%',
  height: '80%',
}
```

### Option 3: Fixed Size
```typescript
splashVideo: {
  width: 300,
  height: 300,
}
```

---

## 🔄 How It Works

1. **App launches** → Native splash screen shows
2. **App loads** → Native splash hides
3. **MP4 plays** → Video splash shows for 3 seconds
4. **Fade out** → Smooth transition to app
5. **App ready** → User sees main screen

---

## 🎯 Video Resize Modes

Change `resizeMode` in the Video component:

```typescript
<Video
  resizeMode={ResizeMode.CONTAIN} // Options:
  // CONTAIN - Fit inside, maintain aspect ratio
  // COVER - Fill screen, may crop
  // STRETCH - Fill screen, may distort
/>
```

---

## 🚀 Testing

After installing expo-av:

```bash
cd Frontend
npx expo start
```

Press `i` for iOS or `a` for Android

---

## 📱 Production Build

For production builds with EAS:

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

The MP4 will be bundled automatically!

---

## 🎨 Alternative: Use Lottie Instead

If you want to use Lottie animations instead:

1. Convert your video to Lottie: https://lottiefiles.com/tools/video-to-lottie
2. Use `AnimatedSplash.tsx` component
3. Install: `npm install lottie-react-native`

---

## 🐛 Troubleshooting

### Video not playing?
- Check file path: `assets/splash.mp4`
- Check file format: Must be MP4 (H.264)
- Check file size: Keep under 10MB

### Video too long?
- Reduce duration in code (change 3000 to 2000)
- Or compress video: https://www.freeconvert.com/video-compressor

### Black screen?
- Make sure `expo-av` is installed
- Check video file exists in `assets/` folder
- Check console for errors

---

## ✅ Next Steps

1. Install expo-av: `npx expo install expo-av`
2. Add your MP4 to `Frontend/assets/splash.mp4`
3. Test: `npx expo start`
4. Customize colors/duration as needed
5. Build for production: `eas build`

---

## 🎯 File Structure

```
Frontend/
├── assets/
│   └── splash.mp4          ← Your video here
├── app/
│   └── _layout.tsx         ← Main implementation
└── src/
    └── components/
        ├── SplashScreenManager.tsx  ← Reusable component
        ├── AnimatedSplash.tsx       ← Lottie option
        └── GifSplash.tsx            ← GIF option
```

---

**Your splash screen is ready! Just install expo-av and add your MP4 file.** 🚀

