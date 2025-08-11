import {NativeModules, Platform} from 'react-native';

/**
 * Interface for the iOS Health Kit native module
 */
interface IOSHealthKitManagerInterface {
  // Module availability
  isHealthDataAvailable(): Promise<boolean>;

  // Authorization
  requestAuthorization(): Promise<boolean>;

  // Permission checking - might not be implemented in native module
  checkAuthorization?(): Promise<boolean>;

  // Step data
  getStepCount(startDate: string, endDate: string): Promise<number>;
  getDailyStepCounts(
    startDate: string,
    endDate: string,
  ): Promise<{date: string; steps: number}[]>;
  observeStepCount(callback: (data: {stepCountChanged: boolean}) => void): void;

  // Active energy (calories)
  getActiveEnergy(startDate: string, endDate: string): Promise<number>;

  // Heart rate data
  getHeartRateSamples(
    startDate: string,
    endDate: string,
  ): Promise<{date: string; heartRate: number}[]>;

  // Sleep analysis
  getSleepAnalysis(
    startDate: string,
    endDate: string,
  ): Promise<
    {
      startDate: string;
      endDate: string;
      sleepStage: string;
      durationInSeconds: number;
    }[]
  >;
}

// Access native module only on iOS
const IOSHealthKitManager: IOSHealthKitManagerInterface | undefined =
  Platform.OS === 'ios' ? NativeModules.IOSHealthKitManager : undefined;

/**
 * iOS HealthKit Service
 *
 * A TypeScript service for interacting with native HealthKit on iOS
 * This service is only available on iOS devices
 */
class IOSHealthKitService {
  /**
   * Verify if HealthKit is available on the device
   */
  async isAvailable(): Promise<boolean> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return false;
    }

    try {
      return await IOSHealthKitManager.isHealthDataAvailable();
    } catch (error) {
      console.error('[iOS HealthKit] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Request authorization to access HealthKit data
   */
  async requestAuthorization(): Promise<boolean> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return false;
    }

    try {
      return await IOSHealthKitManager.requestAuthorization();
    } catch (error) {
      console.error('[iOS HealthKit] Error requesting authorization:', error);
      return false;
    }
  }

  /**
   * Get step count for a date range
   *
   * @param startDate Start date
   * @param endDate End date
   * @returns Total step count for the period
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return 0;
    }

    try {
      return await IOSHealthKitManager.getStepCount(
        startDate.toISOString(),
        endDate.toISOString(),
      );
    } catch (error) {
      console.error('[iOS HealthKit] Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Get daily step counts for a date range
   *
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of daily step counts
   */
  async getDailyStepCounts(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; steps: number}[]> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return [];
    }

    try {
      return await IOSHealthKitManager.getDailyStepCounts(
        startDate.toISOString(),
        endDate.toISOString(),
      );
    } catch (error) {
      console.error('[iOS HealthKit] Error getting daily step counts:', error);
      return [];
    }
  }

  /**
   * Set up observer for step count changes
   *
   * @param callback Function to call when step count changes
   */
  observeStepCountChanges(callback: () => void): void {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return;
    }

    IOSHealthKitManager.observeStepCount(() => {
      callback();
    });
  }

  /**
   * Get active energy (calories) for a date range
   *
   * @param startDate Start date
   * @param endDate End date
   * @returns Total active energy in kilocalories
   */
  async getActiveEnergy(startDate: Date, endDate: Date): Promise<number> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return 0;
    }

    try {
      return await IOSHealthKitManager.getActiveEnergy(
        startDate.toISOString(),
        endDate.toISOString(),
      );
    } catch (error) {
      console.error('[iOS HealthKit] Error getting active energy:', error);
      return 0;
    }
  }

  /**
   * Get heart rate samples for a date range
   *
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of heart rate samples
   */
  async getHeartRateSamples(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; heartRate: number}[]> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return [];
    }

    try {
      return await IOSHealthKitManager.getHeartRateSamples(
        startDate.toISOString(),
        endDate.toISOString(),
      );
    } catch (error) {
      console.error('[iOS HealthKit] Error getting heart rate samples:', error);
      return [];
    }
  }

  /**
   * Get sleep analysis data for a date range
   *
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of sleep analysis samples
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
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return [];
    }

    try {
      return await IOSHealthKitManager.getSleepAnalysis(
        startDate.toISOString(),
        endDate.toISOString(),
      );
    } catch (error) {
      console.error('[iOS HealthKit] Error getting sleep analysis:', error);
      return [];
    }
  }

  /**
   * Check if we have authorization without requesting it
   * This is a safer way to check permissions without prompting the user
   */
  async checkPermissions(): Promise<boolean> {
    if (!IOSHealthKitManager) {
      console.warn('IOSHealthKitManager is not available (not iOS platform)');
      return false;
    }

    try {
      // If native module supports checking permissions, use that
      if (IOSHealthKitManager.checkAuthorization) {
        return await IOSHealthKitManager.checkAuthorization();
      }

      // Otherwise, attempt to read step data as a permissions test
      // This will fail if we don't have permissions
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      await this.getStepCount(yesterday, now);
      return true; // If we get here, we have permissions
    } catch (error) {
      console.log('[iOS HealthKit] Permission check failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export default new IOSHealthKitService();
