# Services

This directory contains services for accessing platform-specific features in a consistent way.

## Directory Structure

- `/common`: Platform-agnostic adapters and handlers
- `/ios`: iOS-specific service implementations
- `/android`: Android-specific service implementations

## Health Services

The Health Services provide access to health data on iOS (via HealthKit) and Android (via Health Connect).

### Usage

```typescript
import {HealthAdapter} from 'src/services';

// Check if health data is available
const available = await HealthAdapter.isAvailable();

// Request permissions
const granted = await HealthAdapter.requestAuthorization();

// Get step count
const steps = await HealthAdapter.getStepCount(startDate, endDate);
```

## Platform-Specific Services

If you need to access platform-specific functionality directly:

```typescript
import {Platform} from 'react-native';
import {iOSHealthKit, AndroidHealthService} from 'src/services';

if (Platform.OS === 'ios') {
  // Use iOS-specific functionality
  const available = await iOSHealthKit.isAvailable();
} else if (Platform.OS === 'android') {
  // Use Android-specific functionality
  const available = await AndroidHealthService.isAvailable();
}
```

## Implementation Details

- All services follow a similar interface for consistency
- Platform detection is handled automatically
- Error handling and logging is consistent across platforms

## Adding New Services

When adding new services, follow this structure:

1. Create platform-specific implementations in the respective folders
2. Create a platform-agnostic adapter in the `/common` directory
3. Export the adapter from the main `index.ts` file
