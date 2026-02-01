import 'package:flutter/material.dart';
import 'package:passion_academia/core/theme.dart';
import 'package:passion_academia/screens/home/home_screen.dart';

void main() {
  runApp(const PassionAcademiaApp());
}

class PassionAcademiaApp extends StatelessWidget {
  const PassionAcademiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Passion Academia',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
