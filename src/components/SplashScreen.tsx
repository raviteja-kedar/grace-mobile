import React, {useEffect, useRef, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import {CaringHandsAnimation} from './common';
import {THEME} from '../styles/theme';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onAnimationComplete}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textPosition = useRef(new Animated.Value(20)).current;
  const animationCompleted = useRef(false);

  // Setup animations but don't start them in the layoutEffect
  useLayoutEffect(() => {
    const animation = Animated.sequence([
      // Wait for heart animation to progress a bit
      Animated.delay(1000),

      // Fade in text and move it up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textPosition, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),

      // Hold for a moment
      Animated.delay(300),

      // Fade out the entire screen
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    // Return cleanup function that will stop animations if component unmounts
    return () => {
      animation.stop();
    };
  }, [opacity, textOpacity, textPosition]);

  // Start animations in a separate useEffect
  useEffect(() => {
    const animation = Animated.sequence([
      // Wait for heart animation to progress a bit
      Animated.delay(1000),

      // Fade in text and move it up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textPosition, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),

      // Hold for a moment
      Animated.delay(300),

      // Fade out the entire screen
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({finished}) => {
      if (finished && !animationCompleted.current) {
        animationCompleted.current = true;
        // Use a timeout to avoid state updates during animation finish
        setTimeout(() => {
          onAnimationComplete();
        }, 0);
      }
    });

    return () => {
      animation.stop();
    };
  }, [opacity, textOpacity, textPosition, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, {opacity}]}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <CaringHandsAnimation color={THEME.colors.primary} />
        </View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{translateY: textPosition}],
            },
          ]}>
          <Text style={styles.appTitle}>GRACE</Text>
          <Text style={styles.tagline}>
            Gentle Remote Assistance & Care Environment
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    letterSpacing: 10,
    marginBottom: 15,
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 16,
    color: THEME.colors.text,
    opacity: 0.9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default SplashScreen;
