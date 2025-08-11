/**
 * Grace Mobile App
 *
 * @format
 */

import React, {useState, useEffect, useCallback} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/components/SplashScreen';

function App(): React.JSX.Element {
  const [isAppReady, setIsAppReady] = useState(false);

  /**
   * Pre-initialize the app
   * - Just show splash screen, no permission checks
   */
  const preInitializeApp = useCallback(async () => {
    try {
      // Wait a moment before showing the main app
      // to let users see the splash screen
      setTimeout(() => {
        setIsAppReady(true);
      }, 1500); // Reduced from 2000ms to 1500ms for faster startup
    } catch (error) {
      console.error('Error during app initialization:', error);
      // Still mark as ready even if there's an error
      setIsAppReady(true);
    }
  }, []);

  // Initialize app on mount
  useEffect(() => {
    preInitializeApp();
  }, [preInitializeApp]);

  // Handle splash screen animation completion
  const handleSplashComplete = useCallback(() => {
    setIsAppReady(true);
  }, []);

  // Main app content
  return (
    <SafeAreaProvider>
      {!isAppReady ? (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      ) : (
        <HomeScreen />
      )}
    </SafeAreaProvider>
  );
}

export default App;
