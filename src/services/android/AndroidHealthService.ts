// Import the health connect module dynamically to handle potential import failures
let healthConnectModule: any = null;

try {
  healthConnectModule = require('react-native-health-connect');
  console.log('Successfully imported react-native-health-connect module');
} catch (err) {
  console.error('Failed to import react-native-health-connect module:', err);
}

/**
 * Android Health Service
 *
 * A TypeScript service for interacting with Android health data
 * This service is only available on Android devices
 */
class AndroidHealthService {
  private static instance: AndroidHealthService;
  private initialized: boolean = false;

  constructor() {
    // Singleton implementation
    if (AndroidHealthService.instance) {
      return AndroidHealthService.instance;
    }
    AndroidHealthService.instance = this;
  }

  /**
   * Initialize the Health Connect client
   * @returns Promise that resolves when initialization is complete
   */
  private async ensureInitialized(): Promise<boolean> {
    if (!this.initialized) {
      try {
        if (
          !healthConnectModule ||
          typeof healthConnectModule.initialize !== 'function'
        ) {
          console.error('Health Connect module is not available');
          return false;
        }

        console.log('Initializing Health Connect...');
        const result = await healthConnectModule.initialize();
        this.initialized = true;
        console.log('Health Connect initialized successfully', result);
        return true;
      } catch (error) {
        console.error('Failed to initialize Health Connect:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        // Suggest solutions
        console.error(
          'Try running `npm install` and restarting the development server with `npm start -- --reset-cache`',
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Check if health tracking is available on this device
   * @returns Promise that resolves to true if health tracking is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (
        !healthConnectModule ||
        typeof healthConnectModule.isAvailable !== 'function'
      ) {
        console.error('Health Connect isAvailable function is not available');
        return false;
      }

      // Use the isAvailable function from the library directly
      const available = await healthConnectModule.isAvailable();
      return !!available;
    } catch (error) {
      console.error('Error checking health data availability:', error);
      return false;
    }
  }

  /**
   * Request authorization for accessing health data
   * @returns Promise that resolves to true if authorization was granted
   */
  async requestAuthorization(): Promise<boolean> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        console.log('Health Connect is not available on this device');
        return false;
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.requestPermission !== 'function'
      ) {
        console.error(
          'Health Connect requestPermission function is not available',
        );
        return false;
      }

      console.log('Requesting Health Connect permissions');

      // Define the permissions we need with the proper format
      // According to the docs, permissions should be objects with recordType and accessType
      const permissionsToRequest = [
        {accessType: 'read' as const, recordType: 'Steps'},
        {accessType: 'read' as const, recordType: 'SleepSession'},
        {accessType: 'read' as const, recordType: 'HeartRate'},
        {accessType: 'read' as const, recordType: 'ActiveCaloriesBurned'},
      ];

      // Request permissions
      const result = await healthConnectModule.requestPermission(
        permissionsToRequest,
      );
      console.log('Permission request result:', result);

      // Return true if all permissions were granted
      return (
        result.granted && result.granted.length === permissionsToRequest.length
      );
    } catch (error) {
      console.error('Error requesting Health Connect permissions:', error);
      return false;
    }
  }

  /**
   * Check if we have the necessary permissions
   * @returns Promise that resolves to true if we have permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return false;
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.getGrantedPermissions !== 'function'
      ) {
        console.error(
          'Health Connect getGrantedPermissions function is not available',
        );
        return false;
      }

      // Get granted permissions
      const permissions = await healthConnectModule.getGrantedPermissions();
      console.log('Granted permissions:', permissions);

      // Check if we have all the necessary permissions
      const requiredTypes = [
        'Steps',
        'SleepSession',
        'HeartRate',
        'ActiveCaloriesBurned',
      ];

      // If permissions is not an array, return false
      if (!Array.isArray(permissions)) {
        return false;
      }

      // Check if we have all the required permissions
      for (const type of requiredTypes) {
        // Check both formats (string or object)
        const hasPermission = permissions.some(p =>
          typeof p === 'string'
            ? p === `${type}:read`
            : p.recordType === type && p.accessType === 'read',
        );

        if (!hasPermission) {
          console.log(`Missing permission for ${type}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking Health Connect permissions:', error);
      return false;
    }
  }

  /**
   * Get step count for a date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns Promise that resolves to the total step count
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        return 0;
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.readRecords !== 'function'
      ) {
        console.error('Health Connect readRecords function is not available');
        return 0;
      }

      console.log('Getting step count from', startDate, 'to', endDate);

      const timeRangeFilter = {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      // Use string format for record type
      const steps = await healthConnectModule.readRecords('Steps', {
        timeRangeFilter,
      });
      console.log(
        'Raw steps data:',
        JSON.stringify(steps).substring(0, 200) + '...',
      );

      // Calculate total steps
      let totalSteps = 0;
      for (const record of steps) {
        if (record && typeof record.count === 'number') {
          totalSteps += record.count;
        }
      }

      console.log('Total steps found:', totalSteps);
      return totalSteps;
    } catch (error) {
      console.error('Error getting step count from Health Connect:', error);
      return 0;
    }
  }

  /**
   * Get heart rate samples for a date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns Promise that resolves to the heart rate samples
   */
  async getHeartRateSamples(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; heartRate: number}[]> {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        return [];
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.readRecords !== 'function'
      ) {
        console.error('Health Connect readRecords function is not available');
        return [];
      }

      console.log('Getting heart rate data from', startDate, 'to', endDate);

      const timeRangeFilter = {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      // Use string format for record type
      const heartRateData = await healthConnectModule.readRecords('HeartRate', {
        timeRangeFilter,
      });

      // Transform the data to match the expected format
      return heartRateData.map((record: any) => ({
        date: record.time || record.startTime,
        heartRate: record.beatsPerMinute,
      }));
    } catch (error) {
      console.error('Error getting heart rate from Health Connect:', error);
      return [];
    }
  }

  /**
   * Get active energy (calories) for a date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns Promise that resolves to the total calories burned
   */
  async getActiveEnergy(startDate: Date, endDate: Date): Promise<number> {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        return 0;
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.readRecords !== 'function'
      ) {
        console.error('Health Connect readRecords function is not available');
        return 0;
      }

      console.log('Getting active energy from', startDate, 'to', endDate);

      const timeRangeFilter = {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      // Use string format for record type
      const energyData = await healthConnectModule.readRecords(
        'ActiveCaloriesBurned',
        {
          timeRangeFilter,
        },
      );

      let totalCalories = 0;
      for (const record of energyData as any[]) {
        if (
          record &&
          record.energy &&
          typeof record.energy.inKilocalories === 'number'
        ) {
          totalCalories += record.energy.inKilocalories;
        }
      }

      return totalCalories;
    } catch (error) {
      console.error('Error getting active energy from Health Connect:', error);
      return 0;
    }
  }

  /**
   * Set up observers for health data changes - not yet implemented with Health Connect
   * @param callback Function to call when step count changes
   */
  observeStepCountChanges(_callback: () => void): void {
    // Health Connect doesn't have a direct equivalent for observers
    // This would need to be implemented differently, perhaps with polling
    console.log('Step count observation not implemented for Health Connect');
  }

  /**
   * Get sleep analysis data for a date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns Promise that resolves to sleep analysis data
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
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        return [];
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.readRecords !== 'function'
      ) {
        console.error('Health Connect readRecords function is not available');
        return [];
      }

      console.log('Getting sleep analysis from', startDate, 'to', endDate);

      const timeRangeFilter = {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      // Use string format for record type
      const sleepData = await healthConnectModule.readRecords('SleepSession', {
        timeRangeFilter,
      });
      console.log('Sleep data retrieved:', sleepData.length, 'records');

      // Transform the data to match the expected format
      return sleepData.map((record: any) => {
        const startTime = record.startTime || record.startDateTime;
        const endTime = record.endTime || record.endDateTime;
        const duration =
          record.duration?.inSeconds ||
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;

        return {
          startDate: startTime,
          endDate: endTime,
          sleepStage: record.stage || 'UNKNOWN',
          durationInSeconds: duration,
        };
      });
    } catch (error) {
      console.error('Error getting sleep analysis from Health Connect:', error);
      return [];
    }
  }

  /**
   * Get step counts per day between two dates
   * @param startDate The start date
   * @param endDate The end date
   * @returns Promise that resolves to daily step counts
   */
  async getDailyStepCounts(
    startDate: Date,
    endDate: Date,
  ): Promise<{date: string; steps: number}[]> {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        return [];
      }

      if (
        !healthConnectModule ||
        typeof healthConnectModule.readRecords !== 'function'
      ) {
        console.error('Health Connect readRecords function is not available');
        return [];
      }

      console.log('Getting daily step counts from', startDate, 'to', endDate);

      const timeRangeFilter = {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      // Use string format for record type
      const stepsData = await healthConnectModule.readRecords('Steps', {
        timeRangeFilter,
      });

      // Group steps by day
      const dailySteps: {[key: string]: number} = {};

      for (const record of stepsData) {
        if (record && typeof record.count === 'number') {
          // Get date string without time (YYYY-MM-DD)
          const date = new Date(record.startTime || record.time)
            .toISOString()
            .split('T')[0];

          if (!dailySteps[date]) {
            dailySteps[date] = 0;
          }

          dailySteps[date] += record.count;
        }
      }

      // Convert to array format
      return Object.keys(dailySteps).map(date => ({
        date,
        steps: dailySteps[date],
      }));
    } catch (error) {
      console.error(
        'Error getting daily step counts from Health Connect:',
        error,
      );
      return [];
    }
  }
}

export default new AndroidHealthService();
