import {Platform} from 'react-native';
import healthKitImplementation from './ios/HealthKitKingstinct';
import androidHealthImplementation from './android/AndroidHealthService';

// Select the implementation based on platform
const healthImplementation =
  Platform.OS === 'ios' ? healthKitImplementation : androidHealthImplementation;

// Debug log for developers
if (__DEV__) {
  console.log(
    `[HealthAdapter] Using implementation: ${
      Platform.OS === 'ios' ? 'kingstinct' : 'android'
    }`,
  );
}

/**
 * HealthAdapter
 *
 * Provides a consistent interface for accessing health data
 * across different platforms and implementations.
 */
class HealthAdapter {
  /**
   * Check if health tracking is available on this device
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await healthImplementation.isAvailable();
    } catch (error) {
      console.error('[HealthAdapter] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Check if we have necessary permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      return await healthImplementation.checkPermissions();
    } catch (error) {
      console.error('[HealthAdapter] Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Request authorization for accessing health data
   */
  async requestAuthorization(): Promise<boolean> {
    try {
      return await healthImplementation.requestAuthorization();
    } catch (error) {
      console.error('[HealthAdapter] Error requesting authorization:', error);
      return false;
    }
  }

  /**
   * Get step count between two dates
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Let the implementation handle authorization
      return await healthImplementation.getStepCount(startDate, endDate);
    } catch (error) {
      console.error('[HealthAdapter] Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Get step counts per day between two dates
   */
  async getDailyStepCounts(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; steps: number}[]> {
    try {
      // Let the implementation handle authorization
      return await healthImplementation.getDailyStepCounts(startDate, endDate);
    } catch (error) {
      console.error('[HealthAdapter] Error getting daily step counts:', error);
      return [];
    }
  }

  /**
   * Get active energy (calories) for a date range
   */
  async getActiveEnergy(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Let the implementation handle authorization
      return await healthImplementation.getActiveEnergy(startDate, endDate);
    } catch (error) {
      console.error('[HealthAdapter] Error getting active energy:', error);
      return 0;
    }
  }

  /**
   * Get heart rate samples for a date range
   */
  async getHeartRateSamples(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; heartRate: number}[]> {
    try {
      // Let the implementation handle authorization
      return await healthImplementation.getHeartRateSamples(startDate, endDate);
    } catch (error) {
      console.error('[HealthAdapter] Error getting heart rate samples:', error);
      return [];
    }
  }

  /**
   * Get sleep analysis data for a date range
   */
  async getSleepAnalysis(
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      startDate: string;
      endDate: string;
      sleepStage: string;
      durationInSeconds: number;
    }[]
  > {
    try {
      // Let the implementation handle authorization
      return await healthImplementation.getSleepAnalysis(startDate, endDate);
    } catch (error) {
      console.error('[HealthAdapter] Error getting sleep analysis:', error);
      return [];
    }
  }

  /**
   * Set up observers for health data changes
   */
  observeStepCountChanges(callback: () => void): void {
    try {
      healthImplementation.observeStepCountChanges(callback);
    } catch (error) {
      console.error(
        '[HealthAdapter] Error observing step count changes:',
        error,
      );
    }
  }
}

// Export a singleton instance of HealthAdapter
export default new HealthAdapter();
