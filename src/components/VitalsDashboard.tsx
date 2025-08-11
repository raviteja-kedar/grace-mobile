import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import useHealthData from '../hooks/useHealthData';
import {THEME} from '../styles/theme';
import {Button} from './common';

interface VitalsDashboardProps {
  startDate: Date;
  endDate: Date;
  onBackPress?: () => void;
}

const VitalsDashboard: React.FC<VitalsDashboardProps> = ({
  startDate,
  endDate,
}) => {
  const {
    loading,
    stepCount,
    activeEnergy,
    heartRateSamples,
    sleepAnalysis,
    fetchStepCount,
    fetchActiveEnergy,
    fetchHeartRateSamples,
    fetchSleepAnalysis,
    requestPermissions,
  } = useHealthData();

  // State for tracking refresh button loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track last sync time for each data type
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Format the last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return '';

    // Always return the actual time in hours and minutes
    return lastSyncTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handler for refresh button
  const handleRefresh = async () => {
    // Don't allow multiple refresh operations at once
    if (isRefreshing) return;

    setIsRefreshing(true);
    console.log(
      `Refreshing data for: ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    try {
      // Fetch all health data types
      await Promise.all([
        fetchStepCount(startDate, endDate),
        fetchActiveEnergy(startDate, endDate),
        fetchHeartRateSamples(startDate, endDate),
        fetchSleepAnalysis(startDate, endDate),
      ]);

      // Update last sync time
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error refreshing health data:', error);
    } finally {
      // Reset refreshing state after a short delay to show the animation
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Request permissions and fetch data on mount only ONCE
  useEffect(() => {
    const initializeHealthPermissions = async () => {
      console.log('Initializing health permissions');
      await requestPermissions();

      // Initial data fetch - only happens once
      console.log('Performing initial data fetch');

      try {
        setIsRefreshing(true);
        await Promise.all([
          fetchStepCount(startDate, endDate),
          fetchActiveEnergy(startDate, endDate),
          fetchHeartRateSamples(startDate, endDate),
          fetchSleepAnalysis(startDate, endDate),
        ]);

        // Set initial sync time
        setLastSyncTime(new Date());
      } catch (error) {
        console.error('Error during initial data fetch:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    initializeHealthPermissions();
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch when date range changes (day/week/month navigation)
  useEffect(() => {
    // Skip the initial render
    if (!lastSyncTime) return;

    console.log('Date range changed, auto-fetching new data');
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Format duration in seconds to hours and minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get average heart rate if samples are available
  const getAverageHeartRate = (): number => {
    if (heartRateSamples.length === 0) return 0;

    const sum = heartRateSamples.reduce((acc, curr) => acc + curr.heartRate, 0);
    return Math.round(sum / heartRateSamples.length);
  };

  // Calculate total sleep duration from samples
  const getTotalSleepDuration = (): number => {
    return sleepAnalysis.reduce((acc, curr) => acc + curr.durationInSeconds, 0);
  };

  return (
    <View style={styles.mainContainer}>
      {loading && !lastSyncTime && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.embeddedScrollContent}>
          <Text style={styles.sectionTitle}>Your Health Data</Text>
          {lastSyncTime && (
            <Text style={styles.syncText}>Last synced: {formatLastSync()}</Text>
          )}

          <Button
            title="↻"
            onPress={handleRefresh}
            disabled={isRefreshing}
            loading={isRefreshing}
            variant="outline"
            style={styles.refreshButton}
            textStyle={styles.buttonIcon}
          />
          <View style={styles.cardGrid}>
            {/* Steps Card */}
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Steps</Text>
                  {/* <Text style={styles.cardIcon}>👣</Text> */}
                </View>
                <Text style={styles.value}>{stepCount.toLocaleString()}</Text>
                <Text style={styles.label}>steps total</Text>
                {lastSyncTime && (
                  <Text style={styles.syncTimeText}>
                    Updated {formatLastSync()}
                  </Text>
                )}
              </View>
            </View>

            {/* Active Energy Card */}
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Active Energy</Text>
                </View>
                <Text style={styles.value}>
                  {activeEnergy.toLocaleString()}
                </Text>
                <Text style={styles.label}>calories burned</Text>
                {lastSyncTime && (
                  <Text style={styles.syncTimeText}>
                    Updated {formatLastSync()}
                  </Text>
                )}
              </View>
            </View>

            {/* Heart Rate Card */}
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Heart Rate</Text>
                  {/* <Text style={styles.cardIcon}>♥</Text> */}
                </View>
                <Text style={styles.value}>{getAverageHeartRate()}</Text>
                <Text style={styles.label}>avg BPM</Text>
                <Text style={styles.subText}>
                  {heartRateSamples.length} measurements
                </Text>
                {lastSyncTime && (
                  <Text style={styles.syncTimeText}>
                    Updated {formatLastSync()}
                  </Text>
                )}
              </View>
            </View>

            {/* Sleep Card */}
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Sleep</Text>
                  {/* <Text style={styles.cardIcon}>☾</Text> */}
                </View>
                <Text style={styles.value}>
                  {formatDuration(getTotalSleepDuration())}
                </Text>
                <Text style={styles.label}>total sleep time</Text>
                <Text style={styles.subText}>
                  {sleepAnalysis.length} sleep records
                </Text>
                {lastSyncTime && (
                  <Text style={styles.syncTimeText}>
                    Updated {formatLastSync()}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  embeddedScrollContent: {
    paddingTop: 0,
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: THEME.typography.subtitle.fontSize,
    fontWeight: THEME.typography.subtitle.fontWeight as '500',
    marginBottom: THEME.spacing.xs,
    marginTop: THEME.spacing.xs,
    color: THEME.colors.textTertiary,
  },
  syncText: {
    fontSize: THEME.typography.caption.fontSize,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.spacing.m,
    fontSize: THEME.typography.body.fontSize,
    color: THEME.colors.textSecondary,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: THEME.spacing.m,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.l,
    padding: THEME.spacing.m,
    height: 180,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.m,
  },
  cardTitle: {
    fontSize: THEME.typography.button.fontSize,
    fontWeight: THEME.typography.button.fontWeight as '600',
    color: THEME.colors.textTertiary,
  },
  cardIcon: {
    fontSize: 20,
    color: THEME.colors.textTertiary,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  label: {
    fontSize: THEME.typography.caption.fontSize,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  subText: {
    fontSize: THEME.typography.caption.fontSize - 2,
    color: THEME.colors.textTertiary,
    marginTop: THEME.spacing.xs,
  },
  syncTimeText: {
    fontSize: 10,
    color: THEME.colors.textTertiary,
    marginTop: THEME.spacing.xs,
    position: 'absolute',
    bottom: THEME.spacing.s,
    right: THEME.spacing.s,
  },
  refreshButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: THEME.spacing.m,
    paddingVertical: THEME.spacing.s,
    borderRadius: THEME.radius.l,
  },
  buttonIcon: {
    color: THEME.colors.primary,
    fontSize: THEME.typography.body.fontSize,
  },
});

export default VitalsDashboard;
