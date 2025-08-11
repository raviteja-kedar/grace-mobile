import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {THEME} from '../../styles/theme';

interface DateRangePickerProps {
  onRangeSelected: (
    startDate: Date,
    endDate: Date,
    rangeType: 'day' | 'week' | 'month',
  ) => void;
  initialDays?: number;
  selectedRange?: 'day' | 'week' | 'month';
  style?: StyleProp<ViewStyle>;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

interface RangeButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const RangeButton: React.FC<RangeButtonProps> = ({
  title,
  active,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.rangeButton,
        active && styles.selectedButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={active || disabled}>
      <Text
        style={[
          styles.buttonText,
          active && styles.selectedButtonText,
          disabled && styles.disabledButtonText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onRangeSelected,
  initialDays = 1,
  selectedRange: propSelectedRange,
  style,
  buttonContainerStyle,
  disabled = false,
}) => {
  // Track if the component has mounted
  const isFirstRender = useRef(true);

  // Use local state only when prop isn't provided
  const [selectedRange, setSelectedRange] = useState<'day' | 'week' | 'month'>(
    propSelectedRange || 'day',
  );
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Track the previous prop value to prevent unnecessary updates
  const prevPropRef = useRef<'day' | 'week' | 'month' | undefined>(
    propSelectedRange,
  );

  // Update local state when prop changes, but only if not from our own callback
  useEffect(() => {
    // Skip during first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only update local state if prop changed from parent and is different from current state
    if (
      propSelectedRange &&
      propSelectedRange !== selectedRange &&
      propSelectedRange !== prevPropRef.current
    ) {
      setSelectedRange(propSelectedRange);
    }

    // Update the ref to track current prop
    prevPropRef.current = propSelectedRange;
  }, [propSelectedRange, selectedRange]);

  // Animate component on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Calculate date range based on the current selection
  const calculateDateRange = useCallback(
    (rangeType: 'day' | 'week' | 'month' = 'day') => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      // Calculate start date based on selected range
      switch (rangeType) {
        case 'day':
          // startDate is already today at 00:00:00
          break;
        case 'week':
          // Set to 7 days ago
          startDate.setDate(startDate.getDate() - 6);
          break;
        case 'month':
          // Set to 30 days ago
          startDate.setDate(startDate.getDate() - 29);
          break;
      }

      // Notify parent component
      onRangeSelected(startDate, today, rangeType);
    },
    [onRangeSelected],
  );

  // Handler for range button press
  const handleRangePress = (range: 'day' | 'week' | 'month') => {
    // Determine if selection is already active
    const currentRange = propSelectedRange || selectedRange;
    if (currentRange === range) return; // Don't trigger if already selected

    // Update local state
    setSelectedRange(range);

    // Update ref to track our own change
    prevPropRef.current = range;

    // Calculate and send the date range immediately
    calculateDateRange(range);
  };

  // Calculate and set date range on first render
  useEffect(() => {
    if (isFirstRender.current) {
      // Initial date range calculation will happen after first render
      const initialRange =
        propSelectedRange ||
        (initialDays === 1 ? 'day' : initialDays <= 7 ? 'week' : 'month');

      calculateDateRange(initialRange);
      isFirstRender.current = false;
    }
  }, [propSelectedRange, initialDays, calculateDateRange]);

  // Determine which range is currently active (prop takes precedence)
  const activeRange = propSelectedRange || selectedRange;

  return (
    <Animated.View style={[styles.container, style, {opacity: fadeAnim}]}>
      <View style={[styles.buttonContainer, buttonContainerStyle]}>
        <RangeButton
          title="DAY"
          active={activeRange === 'day'}
          onPress={() => handleRangePress('day')}
          disabled={disabled}
        />

        <RangeButton
          title="WEEK"
          active={activeRange === 'week'}
          onPress={() => handleRangePress('week')}
          disabled={disabled}
        />

        <RangeButton
          title="MONTH"
          active={activeRange === 'month'}
          onPress={() => handleRangePress('month')}
          disabled={disabled}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: THEME.colors.primary,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.background, // Slightly lighter than background
    borderRadius: 8,
    padding: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  selectedButton: {
    backgroundColor: THEME.colors.primary, // Bright green
  },
  buttonText: {
    color: THEME.colors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  selectedButtonText: {
    color: THEME.colors.text, // Dark background color
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: THEME.colors.background,
  },
  disabledButtonText: {
    color: THEME.colors.textTertiary,
  },
});

export default DateRangePicker;
