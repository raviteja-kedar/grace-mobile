/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Log app name for debugging
console.log('Registering application with name:', appName);

// Ignore specific warnings and errors
LogBox.ignoreLogs([
  // Ignore warnings about the health connect module
  'react-native-health-connect',
  // Feature flags errors
  'react.internal.featureflags',
  'ReactNativeFeatureFlags',
  'libreact_featureflagsjni.so',
  // Other common warnings
  'Require cycle:',
  'Remote debugger',
  'Module RCTImageLoader',
  'RCTBridge',
  'The Vision Camera',
  'Non-serializable',
  'Overriding previous layout',
  'UIManager is not',
  'EventEmitter',
]);

// Register the application
AppRegistry.registerComponent(appName, () => App);
