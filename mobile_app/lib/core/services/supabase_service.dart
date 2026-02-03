import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final _client = Supabase.instance.client;

  /// Uploads profile picture to Supabase Storage
  static Future<String?> uploadProfilePicture(
      Uint8List bytes, String userId) async {
    try {
      // Use just the userId as filename to avoid clutter, or add timestamp for cache busting
      final fileName = '${userId.replaceAll('@', '_')}_profile.jpg';
      final path = fileName; // Upload to root of the bucket

      // 1. Upload the file
      await _client.storage.from('profile_pics').uploadBinary(
            path,
            bytes,
            fileOptions:
                const FileOptions(contentType: 'image/jpeg', upsert: true),
          );

      // 2. Get the public URL
      final publicUrl = _client.storage.from('profile_pics').getPublicUrl(path);

      // Add timestamp for cache busting if needed, or just return publicUrl
      return '$publicUrl?t=${DateTime.now().millisecondsSinceEpoch}';
    } catch (e) {
      debugPrint('Supabase Storage Error: $e');
      return null;
    }
  }

  /// Updates the user's profile in the profile table
  static Future<bool> updateProfileUrl(String email, String photoUrl) async {
    try {
      // Assuming you have a 'users' or 'user_profiles' table with 'email' and 'photoUrl'
      await _client
          .from('user_profiles')
          .update({'photo_url': photoUrl}).ilike('email', email);
      return true;
    } catch (e) {
      debugPrint('Supabase DB Error: $e');
      return false;
    }
  }
}
