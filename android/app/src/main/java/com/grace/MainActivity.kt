package com.grace

import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

private const val TAG = "MainActivity"

/**
 * Main entry point for our React Native app
 *
 * This activity creates a ReactRootView and hosts it, making it available
 * to our React application.
 */
class MainActivity : ReactActivity() {
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Grace"

  /**
   * Configure the activity 
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d(TAG, "MainActivity onCreate called")
    // Health Connect initialization is now handled through the JS layer
  }

  /**
   * Returns the instance of the ReactActivityDelegate. We use DefaultReactActivityDelegate
   * which allows you to enable New Architecture with a single boolean flag.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
