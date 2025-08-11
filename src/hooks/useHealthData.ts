import {useEffect, useState, useCallback} from 'react';
import {Platform} from 'react-native';
import HealthAdapter from '../services/HealthAdapter';
import {
  ACTIVE_HEALTH_IMPLEMENTATION,
  HealthKitImplementation,
} from '../config/HealthConfig';

/**
 * useHealthData
 *
 * A hook that provides health data regardless of platform
 * This acts as a facade over platform-specific implementations
 */
const useHealthData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [dailyStepCounts, setDailyStepCounts] = useState<
    {date: string; steps: number}[]
  >([]);
  const [activeEnergy, setActiveEnergy] = useState(0);
  const [heartRateSamples, setHeartRateSamples] = useState<
    {date: string; heartRate: number}[]
  >([]);
  const [sleepAnalysis, setSleepAnalysis] = useState<
    {
      startDate: string;
      endDate: string;
      sleepStage: string;
      durationInSeconds: number;
    }[]
  >([]);

  // Track which health implementation is being used
  const [activeImplementation] = useState<HealthKitImplementation>(
    ACTIVE_HEALTH_IMPLEMENTATION,
  );

  /**
   * Initialize health tracking and request permissions if needed
   */
  const initializeHealthTracking = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('useHealthData: Running health initialization...');

      if (Platform.OS === 'ios') {
        console.log('useHealthData: Using ios implementation');
      } else {
        console.log('useHealthData: Using android implementation');
      }

      // First check if health services are available
      const available = await HealthAdapter.isAvailable();
      console.log('Health services available:', available);

      if (!available) {
        setError('Health services are not available on this device');
        setLoading(false);
        return false;
      }

      // Check if we already have permissions
      const permissions = await HealthAdapter.checkPermissions();
      console.log('hasPermissions', permissions);
      setHasPermissions(permissions);

      setLoading(false);
      return permissions;
    } catch (err) {
      console.error('Error initializing health tracking:', err);
      setError('Failed to initialize health tracking');
      setLoading(false);
      return false;
    }
  };

  // Initialize health tracking when the hook is first used
  useEffect(() => {
    initializeHealthTracking();
  }, []);

  /**
   * Request permissions to access health data
   */
  const requestPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request health permissions
      const platform = Platform.OS;
      console.log('Starting permission request flow', {
        platform,
      });

      if (platform === 'ios') {
        console.log('Requesting iOS HealthKit permissions');

        // First check if available
        const available = await HealthAdapter.isAvailable();
        console.log('Health services available before request:', available);

        if (!available) {
          console.log(
            'Health services are not available, aborting permission request',
          );
          setLoading(false);
          return false;
        }

        // Request authorization
        const granted = await HealthAdapter.requestAuthorization();
        console.log('iOS HealthKit permission request result:', granted);

        // Double-check permissions after request
        const permissionsAfterRequest = await HealthAdapter.checkPermissions();
        console.log(
          'Permissions status after request:',
          permissionsAfterRequest,
        );

        setHasPermissions(granted || permissionsAfterRequest);
        setLoading(false);
        return granted || permissionsAfterRequest;
      }

      if (platform === 'android') {
        console.log('Requesting Android Health Connect permissions');

        // First check if Health Connect is available
        const available = await HealthAdapter.isAvailable();
        console.log('Health Connect available before request:', available);

        if (!available) {
          console.log(
            'Health Connect not available, aborting permission request',
          );
          setLoading(false);
          return false;
        }

        // Check if we already have permissions
        const hasExistingPermissions = await HealthAdapter.checkPermissions();
        if (hasExistingPermissions) {
          console.log('Already have Health Connect permissions');
          setHasPermissions(true);
          setLoading(false);
          return true;
        }

        // Request permissions
        const granted = await HealthAdapter.requestAuthorization();
        console.log(
          'Android Health Connect permission request result:',
          granted,
        );

        // After the user interacts with the Health Connect UI, they will return to the app
        // Wait a moment and then check permissions status
        setTimeout(async () => {
          const permissionsAfterRequest =
            await HealthAdapter.checkPermissions();
          console.log(
            'Permissions status after request:',
            permissionsAfterRequest,
          );
          setHasPermissions(permissionsAfterRequest);
        }, 1000);

        setHasPermissions(granted);
        setLoading(false);
        return granted;
      }

      setLoading(false);
      return false;
    } catch (err) {
      console.error('Error requesting health permissions:', err);
      setError('Failed to request health permissions');
      setLoading(false);
      return false;
    }
  };

  /**
   * Fetch step count data for the given date range
   */
  const fetchStepCount = useCallback(async (startDate: Date, endDate: Date) => {
    // Don't set global loading state for individual fetches to prevent UI flicker
    setError(null);
    try {
      const steps = await HealthAdapter.getStepCount(startDate, endDate);
      setStepCount(steps);
      return steps;
    } catch (err) {
      console.error('Error fetching step count:', err);
      setError('Failed to fetch step count');
      return 0;
    }
  }, []);

  /**
   * Fetch daily step counts for a date range
   */
  const fetchDailyStepCounts = async (startDate: Date, endDate: Date) => {
    // Don't set global loading state for individual fetches
    try {
      const dailySteps = await HealthAdapter.getDailyStepCounts(
        startDate,
        endDate,
      );
      setDailyStepCounts(dailySteps);
      return dailySteps;
    } catch (err) {
      console.error('Error fetching daily step counts:', err);
      setError('Failed to fetch daily step counts');
      return [];
    }
  };

  /**
   * Fetch active energy (calories) for a date range
   */
  const fetchActiveEnergy = async (startDate: Date, endDate: Date) => {
    // Don't set global loading state for individual fetches
    try {
      const calories = await HealthAdapter.getActiveEnergy(startDate, endDate);
      setActiveEnergy(calories);
      return calories;
    } catch (err) {
      console.error('Error fetching active energy:', err);
      setError('Failed to fetch active energy');
      return 0;
    }
  };

  /**
   * Fetch heart rate samples for a date range
   */
  const fetchHeartRateSamples = async (startDate: Date, endDate: Date) => {
    // Don't set global loading state for individual fetches
    try {
      const samples = await HealthAdapter.getHeartRateSamples(
        startDate,
        endDate,
      );
      setHeartRateSamples(samples);
      return samples;
    } catch (err) {
      console.error('Error fetching heart rate samples:', err);
      setError('Failed to fetch heart rate data');
      return [];
    }
  };

  /**
   * Fetch sleep analysis data for a date range
   */
  const fetchSleepAnalysis = async (startDate: Date, endDate: Date) => {
    // Don't set global loading state for individual fetches
    try {
      const sleepData = await HealthAdapter.getSleepAnalysis(
        startDate,
        endDate,
      );
      setSleepAnalysis(sleepData);
      return sleepData;
    } catch (err) {
      console.error('Error fetching sleep analysis:', err);
      setError('Failed to fetch sleep data');
      return [];
    }
  };

  /**
   * Set up observers for health data changes
   */
  useEffect(() => {
    if (!hasPermissions) {
      return;
    }

    // Set up observer to update when step count changes
    try {
      HealthAdapter.observeStepCountChanges(() => {
        // When step count changes, fetch the latest data
        // We'll just use the current day
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        fetchStepCount(startOfDay, now);
      });
    } catch (err) {
      console.error('Error setting up health data observers:', err);
    }
  }, [hasPermissions, fetchStepCount]);

  // Return our health data hook API
  return {
    // State
    loading,
    error,
    hasPermissions,
    stepCount,
    dailyStepCounts,
    activeEnergy,
    heartRateSamples,
    sleepAnalysis,
    activeImplementation,

    // Actions
    initializeHealthTracking,
    requestPermissions,
    fetchStepCount,
    fetchDailyStepCounts,
    fetchActiveEnergy,
    fetchHeartRateSamples,
    fetchSleepAnalysis,
  };
};

export default useHealthData;
