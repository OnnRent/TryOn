import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';

interface GifSplashProps {
  onFinish: () => void;
  duration?: number;
}

export default function GifSplash({ onFinish, duration = 3000 }: GifSplashProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade out after duration
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('../../assets/splash.gif')}
        style={styles.gif}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Match your brand color
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: 300,
    height: 300,
  },
});

