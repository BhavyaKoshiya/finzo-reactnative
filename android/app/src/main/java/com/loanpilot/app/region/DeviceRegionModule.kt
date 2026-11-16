package com.loanpilot.app.region

import android.content.Context
import android.telephony.TelephonyManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/**
 * Exposes the SIM and mobile network country (ISO codes such as "in" or "ae") so the
 * app can pick a sensible currency on first launch. Needs no permission; the values
 * never leave the device.
 */
class DeviceRegionModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = NAME

  override fun getConstants(): Map<String, Any> {
    val telephony =
      reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
    return mapOf(
      "simCountry" to safeCountry { telephony?.simCountryIso },
      "networkCountry" to safeCountry { telephony?.networkCountryIso },
    )
  }

  private fun safeCountry(read: () -> String?): String =
    try {
      read()?.trim()?.lowercase().orEmpty()
    } catch (e: Exception) {
      ""
    }

  companion object {
    const val NAME = "DeviceRegion"
  }
}
