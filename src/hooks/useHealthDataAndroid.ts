import {useState, useEffect, useCallback} from 'react';
import HealthAdapter from '../services/HealthAdapter';

export interface UseHealthDataAndroidReturn {
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

export const useHealthDataAndroid = (): UseHealthDataAndroidReturn => {
  const [steps, setSteps] = useState<number>(0);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [noStepsFound, setNoStepsFound] = useState<boolean>(false);
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] =
    useState<boolean>(false);

  // Check initial permissions
  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        // First check if Health Connect is available
        const available = await HealthAdapter.isAvailable();
        setIsHealthConnectAvailable(available);

        if (!available) {
          setLoading(false);
          setError(
            'Health Connect is required but not available on this device',
          );
          return;
        }

        // Check if we already have permissions without requesting them
        const hasPerms = await HealthAdapter.checkPermissions();
        setHasPermissions(hasPerms);
        setPermissionsChecked(true);
        setLoading(false);
      } catch (err) {
        console.error('Error checking Health Connect permissions:', err);
        setError('Error checking Health Connect permissions');
        setLoading(false);
      }
    };

    checkInitialPermissions();
  }, []);

  // Function to request permissions
  const requestPerms = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!isHealthConnectAvailable) {
        setError('Health Connect is required but not available on this device');
        setLoading(false);
        return false;
      }

      // First check if we already have permissions
      const existingPerms = await HealthAdapter.checkPermissions();
      if (existingPerms) {
        console.log(
          'Already have Health Connect permissions, skipping request',
        );
        setHasPermissions(true);
        setLoading(false);
        return true;
      }

      console.log('Requesting Health Connect permissions...');
      const permGranted = await HealthAdapter.requestAuthorization();
      console.log('Permission request result:', permGranted);

      setHasPermissions(permGranted);
      setLoading(false);

      return permGranted;
    } catch (err) {
      console.error('Error requesting Health Connect permissions:', err);
      setError('Error requesting Health Connect permissions');
      setLoading(false);
      return false;
    }
  }, [isHealthConnectAvailable]);

  // Function to check permissions (can be called anytime)
  const checkPerms = useCallback(async (): Promise<boolean> => {
    try {
      if (!isHealthConnectAvailable) {
        return false;
      }

      // Use checkPermissions instead of requestAuthorization
      const hasPerms = await HealthAdapter.checkPermissions();
      setHasPermissions(hasPerms);
      return hasPerms;
    } catch (err) {
      setError('Error checking Health Connect permissions');
      return false;
    }
  }, [isHealthConnectAvailable]);

  // Function to fetch step count for a date range
  const fetchStepCount = useCallback(
    async (startDate: Date, endDate: Date): Promise<void> => {
      if (!hasPermissions && permissionsChecked) {
        setError('No permissions to access health data');
        return;
      }

      if (!isHealthConnectAvailable) {
        setError('Health Connect is required but not available on this device');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // For Android, we get steps from Health Connect
        const totalSteps = await HealthAdapter.getStepCount(startDate, endDate);

        setSteps(totalSteps);
        setLastSyncTime(new Date());
        setNoStepsFound(totalSteps === 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching step data from Health Connect:', err);
        setError('Error fetching health data');
        setLoading(false);
      }
    },
    [hasPermissions, permissionsChecked, isHealthConnectAvailable],
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
