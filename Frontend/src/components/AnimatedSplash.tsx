import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedSplashProps {
  onFinish: () => void;
  duration?: number;
}

export default function AnimatedSplash({ onFinish, duration = 3000 }: AnimatedSplashProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Auto-play animation
    lottieRef.current?.play();

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
      <LottieView
        ref={lottieRef}
        source={require('../../assets/splash-animation.json')}
        autoPlay
        loop={false}
        style={styles.animation}
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
  animation: {
    width: 300,
    height: 300,
  },
});

