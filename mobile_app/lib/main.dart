import 'package:flutter/material.dart';
import 'package:passion_academia/core/config/app_config.dart';
import 'package:provider/provider.dart';
import 'package:passion_academia/core/theme.dart';
import 'package:passion_academia/core/providers/auth_provider.dart';
import 'package:passion_academia/core/providers/course_provider.dart';
import 'package:passion_academia/screens/auth/welcome_screen.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:passion_academia/core/providers/quiz_provider.dart';
import 'package:passion_academia/core/providers/admin_provider.dart';

import 'package:passion_academia/core/providers/leaderboard_provider.dart';
import 'package:passion_academia/core/providers/notification_provider.dart';
import 'package:passion_academia/screens/home/home_screen.dart';
import 'package:passion_academia/core/services/local_notification_service.dart';

import 'package:passion_academia/screens/error/global_error_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set up Global Error Boundary
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return GlobalErrorScreen(details: details);
  };

  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    // Log to external service (e.g. Sentry/Firebase Crashlytics) here in production
    debugPrint('GLOBAL ERROR: ${details.exception}');
  };

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
  );

  await LocalNotificationService.initialize();
  await LocalNotificationService.requestPermission();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CourseProvider()),
        ChangeNotifierProvider(create: (_) => QuizProvider()),
        ChangeNotifierProvider(create: (_) => AdminProvider()),
        ChangeNotifierProvider(create: (_) => LeaderboardProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: const PassionAcademiaApp(),
    ),
  );
}

class PassionAcademiaApp extends StatelessWidget {
  const PassionAcademiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return MaterialApp(
      title: 'Passion Academia',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: auth.isAuthenticated ? const HomeScreen() : const WelcomeScreen(),
    );
  }
}
