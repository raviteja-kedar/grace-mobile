# Grace - iOS HealthKit Integration

This project uses a custom native implementation to integrate with Apple HealthKit, providing robust access to health data in a React Native application.

## Why Custom Native Integration?

### 🧩 Custom Native Module Approach

We've chosen to implement a custom Swift module to interact with HealthKit for several reasons:

1. **Full Control**: Direct access to all HealthKit features without limitations of third-party libraries
2. **Performance**: Native code execution for optimal performance
3. **Future-Proof**: Easy to update for new iOS/HealthKit features
4. **Specificity**: Tailored to our exact needs without unnecessary code
5. **Reliability**: No dependency on external library maintenance

## Project Structure

### Native iOS Files

- `ios/Grace/HealthKit/IOSHealthKitManager.swift` - Swift implementation of HealthKit functionality
- `ios/Grace/HealthKit/IOSHealthKitManager.m` - Objective-C bridge to React Native
- `ios/Grace/HealthKit/GraceHealthKit-Bridging-Header.h` - Swift/Objective-C bridging header

### React Native Files

- `src/services/iOSHealthKit.ts` - TypeScript service for interacting with the native module

## Features

Our custom HealthKit integration provides:

- **Step Counting**: Both total and daily step counts
- **Active Energy**: Calories burned during exercise
- **Heart Rate**: Heart rate samples over time
- **Sleep Analysis**: Sleep tracking data
- **Background Updates**: Observing changes to health data

## Integration Setup

To set up this integration in your project:

1. **Add files to Xcode project**

   - Create HealthKit group in Xcode
   - Add Swift and Objective-C files
   - Set up bridging header

2. **Update Info.plist with HealthKit permissions**

   ```xml
   <key>NSHealthShareUsageDescription</key>
   <string>This app requires access to your health data to track fitness and wellness metrics.</string>
   <key>NSHealthUpdateUsageDescription</key>
   <string>This app requires permission to save health data to monitor your progress.</string>
   ```

3. **Enable HealthKit in Capabilities**

   - In Xcode, select your target
   - Go to "Signing & Capabilities"
   - Add HealthKit capability

4. **Link HealthKit Framework**
   - Ensure HealthKit.framework is linked in "Build Phases" > "Link Binary With Libraries"

## Usage Examples

### Request Authorization

```typescript
import iOSHealthKit from '../services/iOSHealthKit';

// Request authorization
const requestPermissions = async () => {
  const isAvailable = await iOSHealthKit.isAvailable();
  if (isAvailable) {
    const authGranted = await iOSHealthKit.requestAuthorization();
    console.log('HealthKit auth granted:', authGranted);
  }
};
```

### Getting Step Count Data

```typescript
import iOSHealthKit from '../services/iOSHealthKit';

// Get step count for today
const getStepsToday = async () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const steps = await iOSHealthKit.getStepCount(startOfDay, now);
  console.log('Steps today:', steps);
};

// Get daily step counts for the last week
const getWeeklySteps = async () => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);

  const dailySteps = await iOSHealthKit.getDailyStepCounts(weekAgo, now);
  console.log('Weekly steps:', dailySteps);
};
```

### Heart Rate Monitoring

```typescript
import iOSHealthKit from '../services/iOSHealthKit';

// Get heart rate data for the past hour
const getRecentHeartRate = async () => {
  const now = new Date();
  const hourAgo = new Date();
  hourAgo.setHours(now.getHours() - 1);

  const heartRates = await iOSHealthKit.getHeartRateSamples(hourAgo, now);
  console.log('Recent heart rates:', heartRates);
};
```

### Sleep Analysis

```typescript
import iOSHealthKit from '../services/iOSHealthKit';

// Get sleep data for last night
const getLastNightSleep = async () => {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const sleepData = await iOSHealthKit.getSleepAnalysis(yesterday, now);
  console.log('Sleep data:', sleepData);
};
```

## License

[Your License Information]
