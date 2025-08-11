/**
 * Health Configuration
 *
 * This file contains configuration options for health data connections.
 */

import {Platform} from 'react-native';

// Define the available health implementation types
export enum HealthKitImplementation {
  KINGSTINCT = 'kingstinct',
  ANDROID_HEALTH_CONNECT = 'android_health_connect',
}

// Set the active implementation based on platform
export const ACTIVE_HEALTH_IMPLEMENTATION =
  Platform.OS === 'ios'
    ? HealthKitImplementation.KINGSTINCT
    : HealthKitImplementation.ANDROID_HEALTH_CONNECT;

// Configuration for specific implementations
export const HEALTH_CONFIG = {
  // Settings that apply to all implementations
  common: {
    debugMode: __DEV__,
  },

  // Kingstinct implementation specific settings
  kingstinct: {
    // Add any kingstinct specific config here
  },

  // Android Health Connect implementation specific settings
  android_health_connect: {
    // Add any android specific config here
  },
};
