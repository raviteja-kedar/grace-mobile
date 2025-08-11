import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {THEME} from '../../styles/theme';

interface CaringHandsAnimationProps {
  onAnimationComplete?: () => void;
  size?: number;
  color?: string;
}

const CaringHandsAnimation: React.FC<CaringHandsAnimationProps> = ({
  onAnimationComplete,
  size,
  color = THEME.colors.primary,
}) => {
  // Animation values
  const heartScale = useRef(new Animated.Value(0.8)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartGlow = useRef(new Animated.Value(0)).current;
  const strokeWidth = useRef(new Animated.Value(0)).current;
  const animationCompleted = useRef(false);

  const {width: windowWidth} = Dimensions.get('window');
  const heartSize = size || windowWidth * 0.55; // Use provided size or calculate based on window

  useEffect(() => {
    // Sequence the animations
    const animation = Animated.sequence([
      // Heart appears
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Border grows
      Animated.timing(strokeWidth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),

      // Heart glows
      Animated.timing(heartGlow, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(heartScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        {iterations: 2},
      ),
    ]);

    // Start animation and handle completion
    animation.start(({finished}) => {
      if (finished && !animationCompleted.current && onAnimationComplete) {
        animationCompleted.current = true;
        // Use a timeout to avoid scheduling updates during render or effect
        setTimeout(() => {
          onAnimationComplete();
        }, 0);
      }
    });

    // Cleanup function to stop animations if component unmounts
    return () => {
      animation.stop();
    };
  }, [heartScale, heartOpacity, heartGlow, strokeWidth, onAnimationComplete]);

  // Animate stroke width
  const animatedStrokeWidth = strokeWidth.interpolate({
    inputRange: [0, 1.5],
    outputRange: [0, 1],
  });

  // Create animated components
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {/* Heart */}
        <Animated.View
          style={[
            styles.heartContainer,
            {
              opacity: heartOpacity,
              transform: [{scale: heartScale}],
              width: heartSize,
              height: heartSize,
            },
          ]}>
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: heartGlow,
                width: heartSize,
                height: heartSize,
                borderRadius: heartSize / 2,
                backgroundColor: 'rgba(134, 194, 50, 0.08)',
                shadowColor: color,
              },
            ]}
          />

          {/* SVG Heart */}
          <Svg
            width={heartSize}
            height={heartSize}
            viewBox="-2 -2 28 28"
            style={styles.svgContainer}>
            <AnimatedPath
              d="M12 5.5C11.055 4.195 9.825 3.5 8.5 3.5C6.015 3.5 4 5.515 4 8C4 13 12 19 12 19C12 19 20 13 20 8C20 5.515 17.985 3.5 15.5 3.5C14.175 3.5 12.945 4.195 12 5.5Z"
              fill="transparent"
              stroke={color}
              strokeWidth={animatedStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Transparent background to fit any parent
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgContainer: {
    overflow: 'visible', // Allow SVG to overflow its container
  },
  glowEffect: {
    position: 'absolute',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.7,
    shadowRadius: 25,
    zIndex: -1, // Place behind the heart shape
  },
  heartContainer: {
    position: 'absolute',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CaringHandsAnimation;
