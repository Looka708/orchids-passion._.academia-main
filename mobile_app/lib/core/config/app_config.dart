class AppConfig {
  // Firebase Configuration
  static const String firebaseApiKey = String.fromEnvironment(
    'FIREBASE_API_KEY',
  );

  static const String firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
  );

  static const String firebaseStorageBucket = String.fromEnvironment(
    'FIREBASE_STORAGE_BUCKET',
  );

  // Supabase Configuration
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
  );

  // Google Auth Configuration
  static const String googleClientId = String.fromEnvironment(
    'GOOGLE_CLIENT_ID',
  );

  // Quiz Configuration
  static const int quizTimerDuration = 20; // seconds

  // Validation method to check if keys are secure (optional but helpful)
  static bool get isConfiguredCorrectly {
    return firebaseApiKey.isNotEmpty &&
        supabaseUrl.isNotEmpty &&
        googleClientId.isNotEmpty;
  }
}
