package com.grace

import android.util.Log
import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import java.util.Collections

private const val TAG = "HealthConnectPackage"

/**
 * Package for registering the minimal HealthConnectModule with React Native
 * This implementation provides a safe fallback when the real health libraries aren't available
 */
class HealthConnectPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        try {
            Log.d(TAG, "Creating HealthConnectModule")
            return listOf(HealthConnectModule(reactContext))
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create HealthConnectModule", e)
            return emptyList()
        }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return Collections.emptyList()
    }
} 
