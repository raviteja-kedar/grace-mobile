import {useState, useEffect, useCallback} from 'react';
import {Alert} from 'react-native';
import HealthAdapter from '../services/HealthAdapter';

export interface UseHealthDataIOSReturn {
  steps: number;
  hasPermissions: boolean;
  loading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  noStepsFound: boolean;
  requestPermissions: () => Promise<boolean>;
  fetchStepCount: (startDate: Date, endDate: Date) => Promise<void>;
  checkPermissions: () => Promise<boolean>;
}

export const useHealthDataIOS = (): UseHealthDataIOSReturn => {
  const [steps, setSteps] = useState<number>(0);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [noStepsFound, setNoStepsFound] = useState<boolean>(false);
  const [isHealthKitAvailable, setIsHealthKitAvailable] =
    useState<boolean>(false);

  // Check if HealthKit is available on this device
  const checkAvailability = useCallback(async () => {
    try {
      const available = await HealthAdapter.isAvailable();
      setIsHealthKitAvailable(available);
      return available;
    } catch (err) {
      console.error('Error checking HealthKit availability:', err);
      setError('Error checking HealthKit availability');
      return false;
    }
  }, []);

  // Check initial permissions on component mount
  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        // First check if HealthKit is available
        const available = await checkAvailability();
        if (!available) {
          setLoading(false);
          setError('HealthKit is not available on this device');
          return;
        }

        // Check if we already have permissions
        const hasPerms = await HealthAdapter.checkPermissions();
        setHasPermissions(hasPerms);
        setLoading(false);
      } catch (err) {
        console.error('Error checking HealthKit permissions:', err);
        setLoading(false);
        setError('Error checking HealthKit permissions');
      }
    };

    checkInitialPermissions();
  }, [checkAvailability]);

  // Request permissions from the user
  const requestPerms = useCallback(async (): Promise<boolean> => {
    if (!isHealthKitAvailable) {
      setError('HealthKit is not available on this device');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // First check if we already have permissions
      const existingPerms = await HealthAdapter.checkPermissions();
      if (existingPerms) {
        console.log('Already have HealthKit permissions, skipping request');
        setHasPermissions(true);
        setLoading(false);
        return true;
      }

      console.log('Requesting HealthKit permissions from iOS hook...');
      const granted = await HealthAdapter.requestAuthorization();
      console.log('HealthKit permission request result:', granted);

      setHasPermissions(granted);
      setLoading(false);

      // If permissions weren't granted, show a helpful message
      if (!granted) {
        Alert.alert(
          'Health Access Required',
          'To track your health data, Grace needs access to Apple Health. Please grant access to continue.',
          [
            {
              text: 'Try Again',
              onPress: () => requestPerms(),
            },
            {
              text: 'Not Now',
              style: 'cancel',
            },
          ],
        );
      }

      return granted;
    } catch (err) {
      console.error('Error requesting HealthKit permissions:', err);
      setError('Error requesting HealthKit permissions');
      setLoading(false);
      return false;
    }
  }, [isHealthKitAvailable]);

  // Check permissions (can be called any time)
  const checkPerms = useCallback(async (): Promise<boolean> => {
    if (!isHealthKitAvailable) {
      return false;
    }

    try {
      const hasPerms = await HealthAdapter.checkPermissions();
      setHasPermissions(hasPerms);
      return hasPerms;
    } catch (err) {
      console.error('Error checking HealthKit permissions:', err);
      setError('Error checking HealthKit permissions');
      return false;
    }
  }, [isHealthKitAvailable]);

  // Fetch step count for a given date range
  const fetchStepCount = useCallback(
    async (startDate: Date, endDate: Date): Promise<void> => {
      if (!hasPermissions) {
        setError('No permissions to access health data');
        return;
      }

      if (!isHealthKitAvailable) {
        setError('HealthKit is not available on this device');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get step count
        const totalSteps = await HealthAdapter.getStepCount(startDate, endDate);

        setSteps(totalSteps);
        setLastSyncTime(new Date());
        setNoStepsFound(totalSteps === 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching step data from HealthKit:', err);
        setError('Error fetching health data');
        setLoading(false);
      }
    },
    [hasPermissions, isHealthKitAvailable],
  );

  return {
    steps,
    hasPermissions,
    loading,
    error,
    lastSyncTime,
    noStepsFound,
    requestPermissions: requestPerms,
    fetchStepCount,
    checkPermissions: checkPerms,
  };
};
