import HealthKit, {
  HKQuantityTypeIdentifier,
  HKCategoryTypeIdentifier,
  HealthkitReadAuthorization,
} from '@kingstinct/react-native-healthkit';
import {HEALTH_CONFIG} from '../../config/HealthConfig';

// Helper to check if we're in a simulator or if HealthKit is truly available
const isSimulatorOrMissingHealthKit = (): boolean => {
  // Always allow HealthKit access regardless of device type
  return false;

  // Original implementation commented out below
  /*
  // Check if we're not on iOS at all
  if (Platform.OS !== 'ios') return true;

  // Check for simulator environment
  // Note: This is a basic check, you might need to adjust based on your environment
  const isSimulator =
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    ['simulator', 'Simulator'].some(str =>
      (Platform as any).constants?.utsname?.machine
        ?.toLowerCase()
        .includes(str.toLowerCase()),
    );

  if (isSimulator) {
    console.log(
      '[HealthKitKingstinct] Running on iOS simulator, HealthKit may not be fully available',
    );
  }

  return isSimulator;
  */
};

/**
 * HealthKitKingstinct - Implementation using @kingstinct/react-native-healthkit library
 *
 * This service provides a consistent interface for accessing health data on iOS
 * using the Kingstinct library for HealthKit integration
 */
class HealthKitKingstinct {
  // Add flag to track if authorization has been requested
  private _authorizationRequested: boolean = false;

  /**
   * Check if health tracking is available on this device
   */
  async isAvailable(): Promise<boolean> {
    // Exit early if we're on a simulator
    if (isSimulatorOrMissingHealthKit()) {
      console.log(
        '[HealthKitKingstinct] Not available (simulator or non-iOS platform)',
      );
      return false;
    }

    try {
      const isAvailable = await HealthKit.isHealthDataAvailable();

      if (HEALTH_CONFIG.common.debugMode) {
        console.log('[HealthKitKingstinct] isAvailable:', isAvailable);
      }

      return isAvailable;
    } catch (error) {
      console.error(
        '[HealthKitKingstinct] Error checking availability:',
        error,
      );
      return false;
    }
  }

  /**
   * Check if we already have permissions without requesting them
   */
  async checkPermissions(): Promise<boolean> {
    // Exit early if we're on a simulator
    if (isSimulatorOrMissingHealthKit()) {
      console.log(
        '[HealthKitKingstinct] Cannot check permissions (simulator or non-iOS platform)',
      );
      return false;
    }

    try {
      // Get the status of our required permissions
      const types: HealthkitReadAuthorization[] = [
        HKQuantityTypeIdentifier.stepCount,
        HKQuantityTypeIdentifier.activeEnergyBurned,
        HKQuantityTypeIdentifier.heartRate,
        HKCategoryTypeIdentifier.sleepAnalysis,
      ];

      // Check authorization status for each permission
      const statusPromises = types.map(type =>
        HealthKit.authorizationStatusFor(type),
      );

      const statuses = await Promise.all(statusPromises);

      console.log(
        '[HealthKitKingstinct] Permission statuses for all types:',
        statuses,
      );

      // If all statuses are authorized (2), we have full permissions
      const allAuthorized = statuses.every(status => status === 2);

      console.log(
        '[HealthKitKingstinct] All permissions authorized:',
        allAuthorized,
      );

      return allAuthorized;
    } catch (error) {
      console.error('[HealthKitKingstinct] Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Request authorization to access health data
   */
  async requestAuthorization(): Promise<boolean> {
    // Skip if already requested to prevent redundant prompts
    if (this._authorizationRequested) {
      console.log('[HealthKitKingstinct] Auth already requested, skipping');
      return true;
    }

    // Exit early if we're on a simulator
    if (isSimulatorOrMissingHealthKit()) {
      console.log(
        '[HealthKitKingstinct] Cannot request authorization (simulator or non-iOS platform)',
      );
      return false;
    }

    try {
      console.log('[HealthKitKingstinct] Starting authorization request...');

      // Define permissions to request
      const readTypes: HealthkitReadAuthorization[] = [
        HKQuantityTypeIdentifier.stepCount,
        HKQuantityTypeIdentifier.activeEnergyBurned,
        HKQuantityTypeIdentifier.heartRate,
        HKCategoryTypeIdentifier.sleepAnalysis,
      ];

      // Empty write types array - we're only reading data in this app
      const writeTypes: any[] = [];

      // Check if HealthKit is available first
      const isAvailable = await HealthKit.isHealthDataAvailable();
      if (!isAvailable) {
        console.log(
          '[HealthKitKingstinct] Health data is not available on this device',
        );
        return false;
      }

      console.log(
        '[HealthKitKingstinct] Requesting authorization for types:',
        readTypes,
      );

      // Mark that we've requested authorization
      this._authorizationRequested = true;

      // This is the critical call that shows the permission dialog
      // Make sure we're not wrapping this in any conditional logic that might prevent it
      const result = await HealthKit.requestAuthorization(
        readTypes,
        writeTypes,
      );

      console.log(
        '[HealthKitKingstinct] Authorization request result:',
        result,
      );

      // If the result is true, then we already have permissions
      if (result) {
        return true;
      }

      // If we got to this point, check the permissions status again
      // Sometimes the result might be false but permissions were granted
      const statuses = await Promise.all(
        readTypes.map(type => HealthKit.authorizationStatusFor(type)),
      );

      console.log(
        '[HealthKitKingstinct] Authorization statuses after request:',
        statuses,
      );

      // HKAuthorizationStatus.sharingAuthorized is 2
      const allAuthorized = statuses.every(status => status === 2);

      return allAuthorized;
    } catch (error) {
      console.error(
        '[HealthKitKingstinct] Error requesting authorization:',
        error,
      );
      return false;
    }
  }

  /**
   * Get step count for a specific date range
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Just request auth once using the flag
      if (!this._authorizationRequested) {
        await this.requestAuthorization();
      }

      // Get step count
      const stepData = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.stepCount,
        {
          from: startDate,
          to: endDate,
        },
      );

      if (HEALTH_CONFIG.common.debugMode) {
        console.log('[HealthKitKingstinct] Step count result:', stepData);
      }

      // Calculate the sum of steps from all samples
      const totalSteps = stepData.reduce(
        (sum, sample) => sum + sample.quantity,
        0,
      );

      return totalSteps;
    } catch (error) {
      console.error('[HealthKitKingstinct] Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Get daily step counts for a date range
   */
  async getDailyStepCounts(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; steps: number}[]> {
    try {
      // Just request auth once using the flag
      if (!this._authorizationRequested) {
        await this.requestAuthorization();
      }

      // Get all step samples for the date range
      const samples = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.stepCount,
        {
          from: startDate,
          to: endDate,
        },
      );

      // Group samples by day
      const dailyStepsMap = new Map<string, number>();

      for (const sample of samples) {
        // Format date string as YYYY-MM-DD
        let dateStr = '';

        if (sample.startDate) {
          const date =
            sample.startDate instanceof Date
              ? sample.startDate
              : new Date(sample.startDate);

          dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        if (dateStr) {
          const currentSteps = dailyStepsMap.get(dateStr) || 0;
          dailyStepsMap.set(dateStr, currentSteps + sample.quantity);
        }
      }

      // Convert map to array
      const dailySteps = Array.from(dailyStepsMap.entries()).map(
        ([date, steps]) => ({
          date,
          steps,
        }),
      );

      if (HEALTH_CONFIG.common.debugMode) {
        console.log('[HealthKitKingstinct] Daily step counts:', dailySteps);
      }

      return dailySteps;
    } catch (error) {
      console.error('[HealthKitKingstinct] Error getting daily steps:', error);
      return [];
    }
  }

  /**
   * Set up observer for step count changes
   */
  observeStepCountChanges(callback: () => void): void {
    // Exit early if we're on a simulator
    if (isSimulatorOrMissingHealthKit()) {
      console.log(
        '[HealthKitKingstinct] Cannot observe step count changes (simulator or non-iOS platform)',
      );
      return;
    }

    try {
      // Set up observer for steps - using a compatible frequency value
      HealthKit.enableBackgroundDelivery(
        HKQuantityTypeIdentifier.stepCount,
        1, // Using a numeric value instead of 'immediate'
      ).then(() => {
        if (HEALTH_CONFIG.common.debugMode) {
          console.log('[HealthKitKingstinct] Step count observer enabled');
        }
      });

      // Since the library doesn't currently support direct observers for changes,
      // we'll just set up a polling mechanism
      const interval = setInterval(() => {
        if (HEALTH_CONFIG.common.debugMode) {
          console.log('[HealthKitKingstinct] Checking for step count changes');
        }
        callback();
      }, 60000); // Check every minute

      // In a real app, we would need to store this interval ID and clear it on unmount
      // For now we're just demonstrating the concept
      // Saving the interval reference to avoid linter error
      this._observerInterval = interval;
    } catch (error) {
      console.error(
        '[HealthKitKingstinct] Error setting up step count observer:',
        error,
      );
    }
  }

  // Store the observer interval
  private _observerInterval: NodeJS.Timeout | null = null;

  /**
   * Get active energy for a date range
   */
  async getActiveEnergy(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Just request auth once using the flag
      if (!this._authorizationRequested) {
        await this.requestAuthorization();
      }

      // Get active energy
      const energyData = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.activeEnergyBurned,
        {
          from: startDate,
          to: endDate,
        },
      );

      // Calculate the sum of calories from all samples
      const totalCalories = energyData.reduce(
        (sum, sample) => sum + sample.quantity,
        0,
      );

      return Math.round(totalCalories);
    } catch (error) {
      console.error(
        '[HealthKitKingstinct] Error getting active energy:',
        error,
      );
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
      // Just request auth once using the flag
      if (!this._authorizationRequested) {
        await this.requestAuthorization();
      }

      // Get heart rate samples
      const heartRateData = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.heartRate,
        {
          from: startDate,
          to: endDate,
        },
      );

      // Map to the expected format
      return heartRateData.map(sample => {
        return {
          date:
            typeof sample.startDate === 'string'
              ? sample.startDate
              : new Date(sample.startDate).toISOString(),
          heartRate: sample.quantity,
        };
      });
    } catch (error) {
      console.error(
        '[HealthKitKingstinct] Error getting heart rate samples:',
        error,
      );
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
      // Just request auth once using the flag
      if (!this._authorizationRequested) {
        await this.requestAuthorization();
      }

      // Get sleep analysis
      const sleepData = await HealthKit.queryCategorySamples(
        HKCategoryTypeIdentifier.sleepAnalysis,
        {
          from: startDate,
          to: endDate,
        },
      );

      // Process sleep data
      return sleepData.map(sample => {
        const startDateObj = new Date(sample.startDate);
        const endDateObj = new Date(sample.endDate);
        const durationInSeconds =
          (endDateObj.getTime() - startDateObj.getTime()) / 1000;

        // Map Apple's sleep stage values to readable strings
        let sleepStage = 'unknown';
        // Use sleep values from the Kingstinct library
        // 0: inBed, 1: asleep, 2: awake, 3: unspecified

        switch (sample.value) {
          case 0:
            sleepStage = 'inBed';
            break;
          case 1:
            sleepStage = 'asleep';
            break;
          case 2:
            sleepStage = 'awake';
            break;
          default:
            sleepStage = 'unspecified';
        }

        return {
          startDate:
            typeof sample.startDate === 'string'
              ? sample.startDate
              : startDateObj.toISOString(),
          endDate:
            typeof sample.endDate === 'string'
              ? sample.endDate
              : endDateObj.toISOString(),
          sleepStage,
          durationInSeconds,
        };
      });
    } catch (error) {
      console.error(
        '[HealthKitKingstinct] Error getting sleep analysis:',
        error,
      );
      return [];
    }
  }
}

export default new HealthKitKingstinct();
