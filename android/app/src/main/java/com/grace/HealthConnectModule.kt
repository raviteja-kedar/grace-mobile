package com.grace

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import com.facebook.react.bridge.*

private const val TAG = "HealthConnectModule"
private const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"

/**
 * Native module that provides Android Health Connect integration
 */
class HealthConnectModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private var permissionRequestPromise: Promise? = null
    
    override fun getName(): String {
        return "AndroidHealthManager"
    }
    
    /**
     * Check if Health Connect is available on the device
     */
    @ReactMethod
    fun isHealthDataAvailable(promise: Promise) {
        try {
            Log.d(TAG, "isHealthDataAvailable called")
            
            // Check if Health Connect package is installed
            val available = isHealthConnectInstalled()
            Log.d(TAG, "Health Connect available: $available")
            promise.resolve(available)
        } catch (e: Exception) {
            Log.e(TAG, "Error in isHealthDataAvailable", e)
            promise.reject("ERROR", "Failed to check health data availability", e)
        }
    }
    
    /**
     * Check if Health Connect app is installed
     */
    private fun isHealthConnectInstalled(): Boolean {
        return try {
            reactContext.packageManager.getPackageInfo(HEALTH_CONNECT_PACKAGE, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }
    
    /**
     * Request authorization for health data
     */
    @ReactMethod
    fun requestAuthorization(promise: Promise) {
        try {
            Log.d(TAG, "requestAuthorization called")
            
            if (!isHealthConnectInstalled()) {
                Log.d(TAG, "Health Connect is not installed, opening Play Store")
                openHealthConnectPlayStore()
                promise.resolve(false)
                return
            }
            
            // Launch Health Connect permission screen
            val intent = Intent("android.intent.action.VIEW")
                .setData(Uri.parse("healthconnect://permissions"))
            
            // Store promise to resolve later
            permissionRequestPromise = promise
            
            // Launch activity
            val currentActivity = reactContext.currentActivity
            if (currentActivity != null) {
                currentActivity.startActivity(intent)
                // Note: We can't get result automatically through startActivityForResult
                // The user needs to manually check permissions after
                promise.resolve(true) // Just indicate we opened the screen
            } else {
                Log.e(TAG, "No activity available to launch permission screen")
                promise.resolve(false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in requestAuthorization", e)
            permissionRequestPromise = null
            promise.reject("ERROR", "Failed to request authorization", e)
        }
    }
    
    /**
     * Open Health Connect in Play Store
     */
    private fun openHealthConnectPlayStore() {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("market://details?id=$HEALTH_CONNECT_PACKAGE")
            // Fallback in case Play Store app is not installed
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        
        try {
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            // If Play Store app is not available, open in browser
            val webIntent = Intent(Intent.ACTION_VIEW, 
                Uri.parse("https://play.google.com/store/apps/details?id=$HEALTH_CONNECT_PACKAGE"))
            webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(webIntent)
        }
    }
    
    /**
     * Check authorization status for health data
     */
    @ReactMethod
    fun checkAuthorization(promise: Promise) {
        try {
            Log.d(TAG, "checkAuthorization called")
            
            // For now, we just check if Health Connect is installed
            // The actual permission check will happen in the JS side using the Health Connect API
            val available = isHealthConnectInstalled()
            promise.resolve(available)
        } catch (e: Exception) {
            Log.e(TAG, "Error in checkAuthorization", e)
            promise.reject("ERROR", "Failed to check authorization", e)
        }
    }
} 
