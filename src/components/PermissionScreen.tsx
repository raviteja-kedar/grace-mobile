import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  NativeModules,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useHealthData from '../hooks/useHealthData';
import {THEME} from '../styles/theme';
import HealthKit, {
  HKQuantityTypeIdentifier,
  HKCategoryTypeIdentifier,
  HKAuthorizationStatus,
} from '@kingstinct/react-native-healthkit';
import {CaringHandsAnimation, Button} from './common';

interface PermissionScreenProps {
  onPermissionGranted: () => void;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onPermissionGranted,
}) => {
  const {loading, requestPermissions} = useHealthData();
  const [localLoading, setLocalLoading] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [healthKitAvailable, setHealthKitAvailable] = useState<boolean | null>(
    null,
  );
  const [permissionStatus, setPermissionStatus] = useState<number[]>([]);

  // Check if iOS direct native module is available
  const {IOSHealthKitManager} = NativeModules;

  // Check if HealthKit is available on mount
  useEffect(() => {
    const checkHealthKitAvailability = async () => {
      try {
        // Try using the native module first if available
        if (Platform.OS === 'ios' && IOSHealthKitManager) {
          const available = await IOSHealthKitManager.isHealthDataAvailable();
          console.log('HealthKit availability check (native):', available);
          setHealthKitAvailable(available);
        } else {
          // Fall back to the Kingstinct implementation
          const available = await HealthKit.isHealthDataAvailable();
          console.log('HealthKit availability check (Kingstinct):', available);
          setHealthKitAvailable(available);
        }

        // Check current permission status if available
        if (Platform.OS === 'ios') {
          const readTypes = [
            HKQuantityTypeIdentifier.stepCount,
            HKQuantityTypeIdentifier.activeEnergyBurned,
            HKQuantityTypeIdentifier.heartRate,
            HKCategoryTypeIdentifier.sleepAnalysis,
          ];

          const statuses = await Promise.all(
            readTypes.map(type => HealthKit.authorizationStatusFor(type)),
          );
          console.log('Current authorization statuses:', statuses);
          setPermissionStatus(statuses);
        }
      } catch (error) {
        console.error('Error checking HealthKit availability:', error);
        setHealthKitAvailable(false);
      }
    };

    if (Platform.OS === 'ios') {
      checkHealthKitAvailability();
    } else {
      setHealthKitAvailable(false);
    }
  }, [IOSHealthKitManager]);

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
  };

  const handleRequestPermissions = async () => {
    try {
      setLocalLoading(true);
      console.log(
        'PermissionScreen: Starting HealthKit permission request flow',
      );

      if (Platform.OS === 'ios' && healthKitAvailable) {
        // Check if permissions have been denied previously
        const denied = permissionStatus.some(
          status => status === HKAuthorizationStatus.sharingDenied,
        );

        if (denied) {
          console.log('HealthKit permissions were previously denied');

          // Show alert to direct user to settings
          Alert.alert(
            'Health Access Required',
            'Health access was previously declined. Please enable it in your device Settings to continue.',
            [
              {
                text: 'Skip for Now',
                onPress: () => {
                  setLocalLoading(false);
                  onPermissionGranted();
                },
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  setLocalLoading(false);
                  openAppSettings();
                },
              },
            ],
          );
          return;
        }

        // Try to use native module first if available
        if (IOSHealthKitManager) {
          console.log('Requesting HealthKit permissions through native module');
          try {
            const granted = await IOSHealthKitManager.requestAuthorization();
            console.log('Native HealthKit permissions result:', granted);

            if (granted) {
              console.log(
                'Native HealthKit permissions granted, proceeding to dashboard',
              );
              onPermissionGranted();
              return;
            }
          } catch (error) {
            console.error('Error with native HealthKit permissions:', error);
            // Continue with Kingstinct as fallback
          }
        }

        // Fallback to Kingstinct implementation
        // Define the health data types we want to access
        const readTypes = [
          HKQuantityTypeIdentifier.stepCount,
          HKQuantityTypeIdentifier.activeEnergyBurned,
          HKQuantityTypeIdentifier.heartRate,
          HKCategoryTypeIdentifier.sleepAnalysis,
        ];

        console.log(
          'Requesting HealthKit permissions through Kingstinct:',
          readTypes,
        );

        // First check the current authorization status
        const statuses = await Promise.all(
          readTypes.map(type => HealthKit.authorizationStatusFor(type)),
        );
        console.log('Current authorization statuses:', statuses);
        setPermissionStatus(statuses);

        // Force authorization UI by calling requestAuthorization
        const granted = await HealthKit.requestAuthorization(readTypes, []);
        console.log('HealthKit permissions result (Kingstinct):', granted);

        setPermissionRequested(true);

        if (granted) {
          console.log('HealthKit permissions granted, proceeding to dashboard');
          onPermissionGranted();
        } else {
          console.log('HealthKit permissions not granted');
          Alert.alert(
            'Health Access Required',
            'To view your health data, please allow access to your health information.',
            [
              {
                text: 'Skip for Now',
                onPress: () => onPermissionGranted(),
                style: 'cancel',
              },
              {text: 'Try Again', onPress: () => setPermissionRequested(false)},
            ],
          );
        }
      } else {
        // Use the hook method for non-iOS platforms
        const granted = await requestPermissions();
        if (granted) {
          onPermissionGranted();
        }
      }
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      Alert.alert(
        'Error',
        'There was a problem requesting health permissions. Please try again.',
        [{text: 'OK'}],
      );
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.iconContainer}>
        <CaringHandsAnimation />
      </View>
      <Text style={styles.title}>Health Access Required</Text>

      <Text style={styles.description}>
        To view your health data, Grace needs access to your steps, activity,
        and sleep information. Your data remains private and is only used within
        this app.
      </Text>

      {healthKitAvailable === false && Platform.OS === 'ios' && (
        <Text style={styles.errorText}>
          HealthKit is not available on this device. You may be using a
          simulator or HealthKit may not be supported.
        </Text>
      )}

      {permissionStatus.some(
        status => status === HKAuthorizationStatus.sharingDenied,
      ) && (
        <Text style={styles.warningText}>
          Health access was previously declined. You'll need to enable it in
          your device Settings.
        </Text>
      )}

      {permissionRequested && (
        <Text style={styles.infoText}>
          If you don't see a permission prompt, you may need to manually enable
          Health permissions in your device's Settings app.
        </Text>
      )}

      <Button
        title={localLoading || loading ? '' : 'Grant Health Access'}
        onPress={handleRequestPermissions}
        disabled={
          localLoading ||
          loading ||
          healthKitAvailable === null ||
          healthKitAvailable === false
        }
        loading={localLoading || loading}
        variant="primary"
        size="large"
        style={styles.grantButton}
      />

      <Button
        title="Back to Home"
        onPress={onPermissionGranted}
        variant="outline"
        size="medium"
        style={styles.skipButton}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.l,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 130,
    height: 200,
    borderRadius: THEME.radius.l,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.l,
  },
  title: {
    fontSize: THEME.typography.title.fontSize,
    fontWeight: THEME.typography.title.fontWeight as 'bold',
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.s,
    textAlign: 'center',
  },
  description: {
    fontSize: THEME.typography.body.fontSize,
    fontWeight: THEME.typography.body.fontWeight as 'normal',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    lineHeight: 24,
  },
  infoText: {
    fontSize: THEME.typography.body.fontSize,
    fontWeight: THEME.typography.body.fontWeight as 'normal',
    color: THEME.colors.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.s,
    lineHeight: 24,
    padding: THEME.spacing.m,
    borderRadius: THEME.radius.m,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  errorText: {
    fontSize: THEME.typography.body.fontSize,
    fontWeight: THEME.typography.body.fontWeight as 'normal',
    color: THEME.colors.error,
    textAlign: 'center',
    marginBottom: THEME.spacing.s,
    lineHeight: 24,
    padding: THEME.spacing.m,
    borderRadius: THEME.radius.m,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  warningText: {
    fontSize: THEME.typography.body.fontSize,
    fontWeight: THEME.typography.body.fontWeight as 'normal',
    color: THEME.colors.warning,
    textAlign: 'center',
    marginBottom: THEME.spacing.s,
    lineHeight: 24,
    padding: THEME.spacing.m,
    borderRadius: THEME.radius.m,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  grantButton: {
    width: '100%',
    marginBottom: THEME.spacing.s,
  },
  skipButton: {
    marginTop: THEME.spacing.m,
  },
});

export default PermissionScreen;
