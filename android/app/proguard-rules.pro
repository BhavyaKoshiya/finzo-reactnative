# ============================================================================
# Finzo – ProGuard / R8 rules for React Native + Hermes + Firebase
# ============================================================================

# ---------- React Native Core ----------
# Keep classes accessed via JNI / reflection in the React Native bridge
-keep,allowobfuscation class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.proguard.annotations.DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep class com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.KeepGettersAndSetters class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# React Native bridge / TurboModules (keep public API, allow renaming internals)
-keep,allowobfuscation class com.facebook.react.bridge.** { *; }
-keep,allowobfuscation class com.facebook.react.turbomodule.** { *; }
-keep,allowobfuscation class com.facebook.react.uimanager.** { *; }

# ---------- Hermes ----------
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# ---------- Flipper (debug only, but keep rules to prevent warnings) ----------
-dontwarn com.facebook.flipper.**

# ---------- FBJNI ----------
-keep class com.facebook.jni.** { *; }

# ---------- Firebase ----------
# Firebase Analytics
-keep,allowobfuscation class com.google.firebase.analytics.** { *; }
-keep,allowobfuscation class com.google.android.gms.measurement.** { *; }
-dontwarn com.google.android.gms.**

# Firebase Crashlytics – preserve stack traces for crash reports
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep,allowobfuscation class com.google.firebase.crashlytics.** { *; }

# Firebase common
-keep,allowobfuscation class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ---------- OkHttp / Okio (common transitive dependency) ----------
-dontwarn okhttp3.**
-dontwarn okio.**
-keep,allowobfuscation class okhttp3.** { *; }
-keep,allowobfuscation class okio.** { *; }

# ---------- AndroidX ----------
-keep,allowobfuscation class androidx.** { *; }
-dontwarn androidx.**

# ---------- SVG (react-native-svg) ----------
-keep,allowobfuscation class com.caverock.androidsvg.** { *; }
-dontwarn com.caverock.androidsvg.**

# ---------- Reanimated ----------
-keep,allowobfuscation class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# ---------- Safe Area Context ----------
-keep,allowobfuscation class com.th3rdwave.safeareacontext.** { *; }

# ---------- General safety rules ----------
# Keep native methods
-keepclasseswithmembernames,allowobfuscation class * {
    native <methods>;
}

# Keep enums (used by JSON serialization etc.)
-keepclassmembers,allowobfuscation enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelables
-keep,allowobfuscation class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers,allowobfuscation class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Suppress warnings for missing classes that are optional
-dontwarn javax.annotation.**
-dontwarn sun.misc.Unsafe

# ---------- PDFBox optional JP2 codec ----------
-dontwarn com.gemalto.jp2.JP2Decoder
