# Custom HealthKit Integration for React Native

This document outlines the custom native HealthKit integration for the Grace mobile application, explaining the approach, implementation details, and usage guidelines.

## Integration Approaches

We evaluated several approaches for integrating HealthKit with our React Native application:

### 🧩 1. Custom Native Module

**Our chosen approach**: We write our own Swift code to interact with HealthKit using iOS's native APIs, then expose it to React Native via a custom bridge.

**Advantages:**

- Full control over HealthKit integration
- No dependency on third-party libraries
- Support for all HealthKit features
- Better performance with native code
- Future-proof approach as Apple updates HealthKit

**Disadvantages:**

- Requires native iOS development expertise
- More development time initially

### 🌐 2. Backend + Apple HealthKit Sync

This alternative approach would:

- Let the iPhone sync data to Apple Health → backend via Apple's HealthKit + CloudKit
- Access the data via REST APIs from React Native

**Advantages:**

- Data available across multiple platforms
- Cloud storage for health data
- Analytics capabilities

**Disadvantages:**

- More complex architecture
- Requires backend development
- Not a direct way for React Native to access HealthKit

### 🔄 3. Combine React Native with SwiftUI Module

**Alternative approach**: Use React Native for UI, but offload HealthKit logic to a SwiftUI module.

**Advantages:**

- Modern Swift + Combine for reactive HealthKit querying
- Clean separation of concerns

**Disadvantages:**

- Requires deep knowledge of both React Native and SwiftUI
- More complex project setup

## Implementation Details

### Core Components

1. **Swift Native Module**

   - `IOSHealthKitManager.swift`: Core implementation of HealthKit functionality
   - Handles all HealthKit queries, permissions, and subscriptions

2. **Objective-C Bridge**

   - `IOSHealthKitManager.m`: Creates the bridge between Swift and React Native
   - Exposes methods to JavaScript

3. **TypeScript Service**
   - `iOSHealthKit.ts`: TypeScript wrapper for the native module
   - Provides type-safe interface for React Native components

### Data Types Supported

Our implementation supports the following HealthKit data types:

1. **Step Count**

   - Total steps over a period
   - Daily step counts

2. **Active Energy**

   - Calories burned during physical activity

3. **Heart Rate**

   - Heart rate samples over time

4. **Sleep Analysis**
   - Sleep stages (in bed, asleep)
   - Sleep duration

## Usage Guidelines

### Prerequisites

1. Make sure HealthKit entitlements are enabled in Xcode
2. Add proper usage descriptions in `Info.plist`

### Initialization

Always check for availability and request permissions before using HealthKit:

```typescript
import iOSHealthKit from '../services/iOSHealthKit';

// In component or context initialization
useEffect(() => {
  const setupHealthKit = async () => {
    const available = await iOSHealthKit.isAvailable();
    if (available) {
      const authorized = await iOSHealthKit.requestAuthorization();
      if (authorized) {
        // HealthKit is ready to use
      }
    }
  };

  setupHealthKit();
}, []);
```

### Querying Data

Always provide date ranges for queries to limit data volume:

```typescript
// Get data for a specific time range
const getHealthData = async () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7); // Last 7 days

  const steps = await iOSHealthKit.getStepCount(startDate, endDate);
  const calories = await iOSHealthKit.getActiveEnergy(startDate, endDate);

  return {steps, calories};
};
```

### Observer Pattern

For real-time updates, use the observer pattern:

```typescript
const setupObservers = () => {
  // Set up observer for step count changes
  iOSHealthKit.observeStepCountChanges(() => {
    // Refresh data when step count changes
    refreshStepData();
  });
};
```

## Maintenance and Extension

To add support for additional HealthKit data types:

1. Add the new data type to the authorization request in `IOSHealthKitManager.swift`
2. Implement new query methods in the Swift file
3. Expose the methods in the Objective-C bridge
4. Add corresponding TypeScript methods in `iOSHealthKit.ts`

## Troubleshooting

Common issues and solutions:

1. **Permissions denied**: Ensure proper usage descriptions in Info.plist
2. **No data returned**: Verify that the device has data for the requested period
3. **Module not found**: Check native module linking in Xcode
4. **Type errors**: Update TypeScript interface if Swift implementation changes
