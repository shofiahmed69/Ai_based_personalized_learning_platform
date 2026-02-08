import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryDark = Color(0xFF4F46E5);
  static const Color surface = Color(0xFF0F0F14);
  static const Color surfaceVariant = Color(0xFF1A1A24);
  static const Color surfaceElevated = Color(0xFF252532);
  static const Color onSurface = Color(0xFFF4F4F5);
  static const Color onSurfaceMuted = Color(0xFFA1A1AA);
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF22C55E);

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: primary,
          primaryContainer: primaryDark,
          surface: surface,
          onSurface: onSurface,
          onSurfaceVariant: onSurfaceMuted,
          error: error,
          outline: Color(0xFF3F3F46),
        ),
        scaffoldBackgroundColor: surface,
        fontFamily: GoogleFonts.inter().fontFamily,
        textTheme: GoogleFonts.interTextTheme(
          ThemeData.dark().textTheme.copyWith(
                titleLarge: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 22,
                  color: onSurface,
                ),
                titleMedium: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 18,
                  color: onSurface,
                ),
                bodyLarge: const TextStyle(fontSize: 16, color: onSurface),
                bodyMedium: const TextStyle(fontSize: 14, color: onSurfaceMuted),
              ),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: surface,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: onSurface,
          ),
          iconTheme: const IconThemeData(color: onSurface),
        ),
        cardTheme: CardThemeData(
          color: surfaceVariant,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 16),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: surfaceElevated,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF3F3F46)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: error),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          hintStyle: const TextStyle(color: onSurfaceMuted),
        ),
      );
}
