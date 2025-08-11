import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface GeometricNetworkProps {
  size?: number;
  color?: string;
  nodeColor?: string;
  nodeSize?: number;
  style?: StyleProp<ViewStyle>;
  nodeCount?: number;
  animationDuration?: number;
}

// Helper function to generate random points within a circle
const generatePoints = (
  count: number,
  radius: number,
  centerX: number = 0,
  centerY: number = 0,
) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    // Random angle and distance (squared distribution to make points more uniform)
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;

    // Convert polar to cartesian coordinates
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);

    points.push({x, y});
  }
  return points;
};

const GeometricNetwork: React.FC<GeometricNetworkProps> = ({
  size = 300,
  color = '#61892F',
  nodeColor = '#86C232',
  nodeSize = 3,
  style,
  nodeCount = 12,
  animationDuration = 3000,
}) => {
  // Animation references for pulse effect
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  // Generate a set of random points for nodes
  const points = useRef(generatePoints(nodeCount, size / 2 - 10)).current;

  // Start pulse animation on mount
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // Clean up animations on unmount
    return () => {
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, [scaleAnim, opacityAnim, animationDuration]);

  // Determine connection visibility threshold based on size
  const connectionThreshold = size / 3;

  // Create connections between nodes
  const connections = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i];
      const p2 = points[j];

      // Calculate distance between points
      const distance = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2),
      );

      // Only connect nodes that are close enough
      if (distance < connectionThreshold) {
        // Calculate line properties
        const centerX = (p1.x + p2.x) / 2;
        const centerY = (p1.y + p2.y) / 2;
        const length = distance;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        connections.push({
          key: `${i}-${j}`,
          centerX,
          centerY,
          length,
          angle,
          opacity: 1 - distance / connectionThreshold, // Fade out distant connections
        });
      }
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          width: size,
          height: size,
          transform: [{scale: scaleAnim}],
          opacity: opacityAnim,
        },
      ]}>
      {/* Draw connections first */}
      {connections.map(conn => (
        <View
          key={conn.key}
          style={[
            styles.line,
            {
              width: conn.length,
              height: 1,
              backgroundColor: color,
              opacity: conn.opacity * 0.6,
              left: size / 2 + conn.centerX - conn.length / 2,
              top: size / 2 + conn.centerY,
              transform: [{rotate: `${conn.angle}rad`}],
            },
          ]}
        />
      ))}

      {/* Draw nodes on top */}
      {points.map((point, index) => (
        <View
          key={`node-${index}`}
          style={[
            styles.node,
            {
              width: nodeSize * 2,
              height: nodeSize * 2,
              borderRadius: nodeSize,
              backgroundColor: nodeColor,
              left: size / 2 + point.x - nodeSize,
              top: size / 2 + point.y - nodeSize,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  line: {
    position: 'absolute',
  },
  node: {
    position: 'absolute',
  },
});

export default GeometricNetwork;
