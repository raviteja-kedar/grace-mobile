package com.grace

import android.app.Application
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.PackageList
import com.facebook.soloader.SoLoader
import com.facebook.react.soloader.OpenSourceMergedSoMapping

private const val TAG = "MainApplication"

class MainApplication : Application(), ReactApplication {

  init {
    // Removed manual feature flag disabling
  }

  override val reactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {
      override fun getPackages(): List<ReactPackage> {
        val packages = PackageList(this).packages.toMutableList()
        // Add our custom HealthConnectPackage
        try {
          packages.add(HealthConnectPackage())
          Log.d(TAG, "Added HealthConnectPackage successfully")
        } catch (e: Exception) {
          Log.e(TAG, "Failed to add HealthConnectPackage", e)
        }
        return packages
      }

      override fun getJSMainModuleName(): String = "index"

      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
      
      // Remove the problematic method overrides that don't exist
      // The BuildConfig values set in build.gradle will be used by default
    }

  override fun onCreate() {
    super.onCreate()
    // Initialize SoLoader for native libraries
    try {
      SoLoader.init(this, OpenSourceMergedSoMapping)
      Log.d(TAG, "SoLoader initialized successfully with OpenSourceMergedSoMapping")
    } catch (e: Exception) {
      Log.e(TAG, "Failed to initialize SoLoader", e)
    }
  }
}
