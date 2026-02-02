import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class FirebaseService {
  static const String _apiKey = 'AIzaSyAkRb4Bv_oaGfAlEsjFJcqG7XuW6R8kQzk';
  static const String _projectId = 'cyber-security-460017';
  static const String _storageBucket =
      'cyber-security-460017.firebasestorage.app';

  /// Authenticates using Firebase Auth REST API
  static Future<Map<String, dynamic>?> signInWithEmail(
      String email, String password) async {
    final url = Uri.parse(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$_apiKey',
    );

    try {
      final response = await http.post(
        url,
        body: jsonEncode({
          'email': email,
          'password': password,
          'returnSecureToken': true,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return data;
      } else {
        debugPrint('Firebase Auth Error: ${data['error']?['message']}');
        return null;
      }
    } catch (e) {
      debugPrint('Firebase Auth Exception: $e');
      return null;
    }
  }

  /// Fetches user document from Firestore using REST API
  static Future<Map<String, dynamic>?> getUserFromFirestore(
      String email) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail?key=$_apiKey',
    );

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return _parseFirestoreFields(data['fields']);
      } else {
        debugPrint('Firestore Error: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Firestore Exception: $e');
      return null;
    }
  }

  /// Uploads a file to Firebase Storage via REST
  static Future<String?> uploadImage(
      Uint8List imageBytes, String userId) async {
    final fileName = 'profile_pics/$userId.jpg';
    final encodedName = Uri.encodeComponent(fileName);
    final url = Uri.parse(
      'https://firebasestorage.googleapis.com/v0/b/$_storageBucket/o?uploadType=media&name=$encodedName&key=$_apiKey',
    );

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'image/jpeg'},
        body: imageBytes,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final downloadToken = data['downloadTokens'] ?? '';
        // Construct the public URL
        return 'https://firebasestorage.googleapis.com/v0/b/$_storageBucket/o/$encodedName?alt=media&token=$downloadToken';
      } else {
        debugPrint('Storage Upload Error: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Storage Upload Exception: $e');
      return null;
    }
  }

  /// Updates a specific field in a Firestore document
  static Future<bool> updateFirestoreField(
      String email, Map<String, dynamic> fields) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail?updateMask.fieldPaths=${fields.keys.join('&updateMask.fieldPaths=')}&key=$_apiKey',
    );

    // Prepare Firestore REST structure
    Map<String, dynamic> firestorePayload = {'fields': {}};

    fields.forEach((key, value) {
      if (value is String) {
        firestorePayload['fields'][key] = {'stringValue': value};
      } else if (value is bool) {
        firestorePayload['fields'][key] = {'booleanValue': value};
      } else if (value is int) {
        firestorePayload['fields'][key] = {'integerValue': value.toString()};
      }
    });

    try {
      final response = await http.patch(
        url,
        body: jsonEncode(firestorePayload),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore Update Exception: $e');
      return false;
    }
  }

  /// Helper to parse Firestore's weird JSON format
  static Map<String, dynamic> _parseFirestoreFields(
      Map<String, dynamic> fields) {
    Map<String, dynamic> result = {};
    fields.forEach((key, value) {
      if (value.containsKey('stringValue')) {
        result[key] = value['stringValue'];
      } else if (value.containsKey('booleanValue')) {
        result[key] = value['booleanValue'];
      } else if (value.containsKey('integerValue')) {
        result[key] = int.parse(value['integerValue']);
      } else if (value.containsKey('doubleValue')) {
        result[key] = value['doubleValue'];
      } else if (value.containsKey('mapValue')) {
        result[key] = _parseFirestoreFields(value['mapValue']['fields'] ?? {});
      }
      // Add more types if needed
    });
    return result;
  }
}
