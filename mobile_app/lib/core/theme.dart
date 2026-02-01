import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Light Mode Colors (from web HSL)
  static const primaryColor = Color(0xFF16A34A);
  static const lightBackgroundColor = Color(0xFFFFFFFF);
  static const lightForegroundColor = Color(0xFF020817);
  static const lightSecondaryColor = Color(0xFFF1F5F9);
  static const lightMutedColor = Color(0xFF64748B);
  static const lightBorderColor = Color(0xFFE2E8F0);

  // Dark Mode Colors (from web HSL)
  static const darkBackgroundColor = Color(0xFF020817);
  static const darkForegroundColor = Color(0xFFF8FAFC);
  static const darkSecondaryColor = Color(0xFF1E293B);
  static const darkMutedColor = Color(0xFF94A3B8);
  static const darkBorderColor = Color(0xFF1E293B);

  static ThemeData get lightTheme {
    return _buildTheme(
      brightness: Brightness.light,
      background: lightBackgroundColor,
      foreground: lightForegroundColor,
      secondary: lightSecondaryColor,
      muted: lightMutedColor,
      border: lightBorderColor,
    );
  }

  static ThemeData get darkTheme {
    return _buildTheme(
      brightness: Brightness.dark,
      background: darkBackgroundColor,
      foreground: darkForegroundColor,
      secondary: darkSecondaryColor,
      muted: darkMutedColor,
      border: darkBorderColor,
    );
  }

  static ThemeData _buildTheme({
    required Brightness brightness,
    required Color background,
    required Color foreground,
    required Color secondary,
    required Color muted,
    required Color border,
  }) {
    final isDark = brightness == Brightness.dark;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: brightness,
        primary: primaryColor,
        secondary: secondary,
        surface: background,
        onSurface: foreground,
        onPrimary: Colors.white,
        error: const Color(0xFFEF4444),
        outline: border,
      ),
      scaffoldBackgroundColor: background,
      textTheme: GoogleFonts.interTextTheme(
        isDark ? ThemeData.dark().textTheme : ThemeData.light().textTheme,
      ).copyWith(
        displayLarge: GoogleFonts.inter(
          color: foreground,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: GoogleFonts.inter(
          color: foreground,
          fontWeight: FontWeight.bold,
        ),
        bodyLarge: GoogleFonts.inter(
          color: foreground,
        ),
        bodyMedium: GoogleFonts.inter(
          color: isDark ? foreground.withOpacity(0.8) : muted,
        ),
        labelLarge: GoogleFonts.inter(
          color: foreground,
          fontWeight: FontWeight.w600,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: foreground,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: isDark ? Color.lerp(background, Colors.white, 0.03) : background,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: border, width: 1),
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          elevation: 0, // Matte finish
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: foreground,
          side: BorderSide(color: border),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          elevation: 0,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? secondary.withOpacity(0.5) : secondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }

  // Urdu support
  static TextStyle urduStyle({double fontSize = 18, Color? color}) {
    return GoogleFonts.notoNastaliqUrdu(
      fontSize: fontSize,
      height: 2.2,
      color: color,
    );
  }
}
