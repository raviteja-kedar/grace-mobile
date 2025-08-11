/**
 * Services Index
 * Main export file for all services
 */

// Export the health adapter (platform-agnostic service)
export {default as HealthAdapter} from './HealthAdapter';

// Export platform-specific implementations (for direct access if needed)
export {default as iOSHealthKit} from './ios/iOSHealthKit';
export {default as AndroidHealthService} from './android/AndroidHealthService';

// Export deprecated service
export {default as HealthService} from './HealthService';
