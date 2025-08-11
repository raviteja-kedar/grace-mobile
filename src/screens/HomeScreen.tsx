import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DateRangePicker, Button} from '../components/common';
import useHealthData from '../hooks/useHealthData';
import VitalsDashboard from '../components/VitalsDashboard';
import PermissionScreen from '../components/PermissionScreen';
import VoiceScreen from '../components/VoiceScreen';
import {THEME} from '../styles/theme';

const HomeScreen: React.FC = () => {
  const {
    loading,
    fetchStepCount,
    fetchActiveEnergy,
    fetchHeartRateSamples,
    fetchSleepAnalysis,
  } = useHealthData();

  const [fetchInProgress, setFetchInProgress] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<
    'day' | 'week' | 'month'
  >('day');
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [showVoiceScreen, setShowVoiceScreen] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Set initial date range to today (single day)
  useEffect(() => {
    const today = new Date();

    // End date is end of today
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Start date is beginning of today
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    setSelectedStartDate(startOfDay);
    setSelectedEndDate(endOfDay);
    setSelectedDateRange('day');
  }, []);

  // Function to handle date range selection
  const handleDateRangeSelected = (
    startDate: Date,
    endDate: Date,
    rangeType: 'day' | 'week' | 'month',
  ) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setSelectedDateRange(rangeType);

    // Log the date range change
    console.log(
      `Date range changed to ${rangeType}: ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // The VitalsDashboard will automatically fetch data when its startDate/endDate props change
  };

  // Request health data for current date range - now only called when refresh button is pressed
  const fetchHealthData = async () => {
    if (selectedStartDate && selectedEndDate && !loading && !fetchInProgress) {
      setFetchInProgress(true);
      try {
        console.log(
          `Manually refreshing health data for: ${selectedStartDate.toISOString()} to ${selectedEndDate.toISOString()}`,
        );

        // Fetch all health data types
        await fetchStepCount(selectedStartDate, selectedEndDate);
        await fetchActiveEnergy(selectedStartDate, selectedEndDate);
        await fetchHeartRateSamples(selectedStartDate, selectedEndDate);
        await fetchSleepAnalysis(selectedStartDate, selectedEndDate);
      } catch (error) {
        console.error('Error fetching health data:', error);
      } finally {
        setFetchInProgress(false);
      }
    }
  };

  // Show permission screen
  const showPermissions = () => {
    setShowPermissionScreen(true);
  };

  // Handle when permissions are granted
  const handlePermissionGranted = () => {
    setShowPermissionScreen(false);
    fetchHealthData();
  };

  // Show voice screen
  const showVoice = () => {
    setShowVoiceScreen(true);
  };

  // Handle when voice screen is closed
  const handleVoiceClose = () => {
    setShowVoiceScreen(false);
  };

  // Show permission screen if requested
  if (showPermissionScreen) {
    return <PermissionScreen onPermissionGranted={handlePermissionGranted} />;
  }

  // Show voice screen if requested
  if (showVoiceScreen) {
    return <VoiceScreen onClose={handleVoiceClose} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View
        style={[
          styles.mainContent,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <View style={styles.header}>
          <Text style={styles.title}>Grace</Text>
          <View style={styles.headerButtons}>
            <Button
              title="Voice"
              onPress={showVoice}
              variant="primary"
              size="small"
              style={styles.voiceButton}
              textStyle={styles.voiceButtonText}
            />
            <Button
              title="Health Permissions"
              onPress={showPermissions}
              variant="outline"
              size="small"
              style={styles.permissionButton}
              textStyle={styles.permissionButtonText}
            />
          </View>
        </View>

        <View style={styles.datePickerContainer}>
          <DateRangePicker
            onRangeSelected={handleDateRangeSelected}
            initialDays={1}
            selectedRange={selectedDateRange}
          />
        </View>

        <View style={styles.statsContainer}>
          {loading || fetchInProgress ? (
            <ActivityIndicator size="large" color={THEME.colors.primary} />
          ) : (
            <>
              <View style={styles.dashboardContainer}>
                <VitalsDashboard
                  startDate={selectedStartDate || new Date()}
                  endDate={selectedEndDate || new Date()}
                />
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  mainContent: {
    flex: 1,
    padding: THEME.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.l,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  title: {
    fontSize: THEME.typography.title.fontSize,
    fontWeight: THEME.typography.title.fontWeight as 'bold',
    color: THEME.colors.primary,
  },
  voiceButton: {
    backgroundColor: THEME.colors.primary,
    marginRight: THEME.spacing.xs,
  },
  voiceButtonText: {
    color: THEME.colors.surface,
  },
  permissionButton: {
    borderWidth: 1,
    borderColor: THEME.colors.secondary,
    marginLeft: THEME.spacing.xs,
  },
  permissionButtonText: {
    color: THEME.colors.textTertiary,
  },
  datePickerContainer: {
    marginBottom: THEME.spacing.l,
    width: '100%',
  },
  statsContainer: {
    flex: 1,
    padding: THEME.spacing.m,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.l,
    overflow: 'hidden',
  },
  dashboardContainer: {
    flex: 1,
  },
});

export default HomeScreen;
