import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen';

// Keep native splash visible
SplashScreen.preventAutoHideAsync();

interface SplashScreenManagerProps {
  children: React.ReactNode;
  splashDuration?: number;
}

export default function SplashScreenManager({
  children,
  splashDuration = 3000
}: SplashScreenManagerProps) {
  const [isReady, setIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Load your resources here (fonts, data, etc.)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Hide native splash
        await SplashScreen.hideAsync();

        // Show animated splash
        setIsReady(true);

        // Hide animated splash after duration
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setShowAnimatedSplash(false);
          });
        }, splashDuration);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (!isReady || showAnimatedSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        {/* MP4 Video Splash */}
        <Video
          source={require('../../assets/splash.mp4')}
          style={styles.splashVideo}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping={false}
          isMuted
        />
      </Animated.View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000', // Your brand color
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashVideo: {
    width: '100%',
    height: '100%',
  },
});

