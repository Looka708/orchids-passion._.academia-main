import 'package:flutter/material.dart';
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

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://miujeynpqelgdlduttxe.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdWpleW5wcWVsZ2RsZHV0dHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjYzODUsImV4cCI6MjA4MTY0MjM4NX0.W29bhQjX-065P56ccOsONF3JElvFObXXB_uHsCG4bUc',
  );

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
