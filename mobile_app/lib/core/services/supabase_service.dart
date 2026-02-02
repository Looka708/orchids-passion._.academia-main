import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final _client = Supabase.instance.client;

  /// Uploads profile picture to Supabase Storage
  static Future<String?> uploadProfilePicture(
      Uint8List bytes, String userId) async {
    try {
      final fileName = '$userId-${DateTime.now().millisecondsSinceEpoch}.jpg';
      final path = 'profile_pics/$fileName';

      // 1. Upload the file
      await _client.storage.from('profile_pics').uploadBinary(
            path,
            bytes,
            fileOptions:
                const FileOptions(contentType: 'image/jpeg', upsert: true),
          );

      // 2. Get the public URL
      final publicUrl = _client.storage.from('profile_pics').getPublicUrl(path);
      return publicUrl;
    } catch (e) {
      print('Supabase Storage Error: $e');
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
      print('Supabase DB Error: $e');
      return false;
    }
  }
}
