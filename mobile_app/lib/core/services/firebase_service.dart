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
      final response = await http
          .post(
            url,
            body: jsonEncode({
              'email': email,
              'password': password,
              'returnSecureToken': true,
            }),
          )
          .timeout(const Duration(seconds: 10));

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

  /// Registers a new user using Firebase Auth REST API
  static Future<Map<String, dynamic>?> signUpWithEmail(
      String email, String password) async {
    final url = Uri.parse(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$_apiKey',
    );

    try {
      final response = await http
          .post(
            url,
            body: jsonEncode({
              'email': email,
              'password': password,
              'returnSecureToken': true,
            }),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return data;
      } else {
        debugPrint('Firebase Auth Signup Error: ${data['error']?['message']}');
        return null;
      }
    } catch (e) {
      debugPrint('Firebase Auth Signup Exception: $e');
      return null;
    }
  }

  /// Creates a new user document in Firestore and initializes progress
  static Future<bool> createUserInFirestore(
      String name, String email, String password, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users?documentId=$encodedEmail&key=$_apiKey',
    );

    final Map<String, dynamic> firestorePayload = {
      'fields': {
        'name': {'stringValue': name},
        'email': {'stringValue': email.toLowerCase()},
        'password': {'stringValue': password},
        'role': {'stringValue': 'user'},
        'active': {'booleanValue': true},
        'xp': {'integerValue': '0'},
        'streak': {'integerValue': '0'},
        'course': {'stringValue': 'All'},
        'created_at': {
          'timestampValue': DateTime.now().toUtc().toIso8601String()
        },
      }
    };

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(firestorePayload),
      );

      if (response.statusCode == 200) {
        // Also initialize progress subcollection
        await initializeProgressInFirestore(email, idToken);
        return true;
      } else {
        debugPrint(
            'Firestore Create User Error: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e, stack) {
      debugPrint('Firestore Create User Exception: $e');
      debugPrint(stack.toString());
      return false;
    }
  }

  /// Initializes the progress/current document for a user
  static Future<bool> initializeProgressInFirestore(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/progress?documentId=current&key=$_apiKey',
    );

    final Map<String, dynamic> progressPayload = {
      'fields': {
        'totalXP': {'integerValue': '0'},
        'level': {'integerValue': '1'},
        'streak': {'integerValue': '0'},
        'lastActive': {
          'timestampValue': DateTime.now().toUtc().toIso8601String()
        },
        'stats': {
          'mapValue': {
            'fields': {
              'questionsAnswered': {'integerValue': '0'},
              'correctAnswers': {'integerValue': '0'},
              'studyTimeMinutes': {'integerValue': '0'},
              'chaptersCompleted': {'integerValue': '0'},
              'perfectScores': {'integerValue': '0'},
              'quizzesCompleted': {'integerValue': '0'},
            }
          }
        },
        'achievements': {
          'arrayValue': {'values': []}
        },
      }
    };

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(progressPayload),
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore Initialize Progress Error: $e');
      return false;
    }
  }

  /// Fetches user document from Firestore using REST API
  static Future<Map<String, dynamic>?> getUserFromFirestore(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail?key=$_apiKey',
    );

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http
          .get(url, headers: headers)
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final fields = _parseFirestoreFields(data['fields']);
        final path = data['name'] as String;
        fields['id'] = path.split('/').last;
        return fields;
      } else {
        debugPrint('Firestore Error: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Firestore Exception: $e');
      return null;
    }
  }

  /// Fetches progress document from Firestore
  static Future<Map<String, dynamic>?> getProgressFromFirestore(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/progress/current?key=$_apiKey',
    );

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http
          .get(url, headers: headers)
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return _parseFirestoreFields(data['fields']);
      } else {
        debugPrint(
            'Firestore Progress Error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Firestore Progress Exception: $e');
      return null;
    }
  }

  /// Updates progress document in Firestore
  static Future<bool> updateProgressInFirestore(String email,
      Map<String, dynamic> progressFields, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/progress/current?key=$_apiKey',
    );

    Map<String, dynamic> firestorePayload = {'fields': {}};

    void processMap(Map<String, dynamic> source, Map<String, dynamic> target) {
      source.forEach((key, value) {
        if (value is String) {
          target[key] = {'stringValue': value};
        } else if (value is bool) {
          target[key] = {'booleanValue': value};
        } else if (value is int) {
          target[key] = {'integerValue': value.toString()};
        } else if (value is double) {
          target[key] = {'doubleValue': value};
        } else if (value is Map<String, dynamic>) {
          final nestedMap = <String, dynamic>{};
          processMap(value, nestedMap);
          target[key] = {
            'mapValue': {'fields': nestedMap}
          };
        } else if (value is List) {
          target[key] = {
            'arrayValue': {
              'values': value.map((e) => {'stringValue': e.toString()}).toList()
            }
          };
        }
      });
    }

    processMap(progressFields, firestorePayload['fields']);

    final updateMask =
        progressFields.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final patchUrl = Uri.parse('$url&$updateMask');

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http.patch(
        patchUrl,
        headers: headers,
        body: jsonEncode(firestorePayload),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore Update Progress Exception: $e');
      return false;
    }
  }

  /// Updates a specific field in a Firestore document
  static Future<bool> updateFirestoreField(
      String email, Map<String, dynamic> fields, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail?updateMask.fieldPaths=${fields.keys.join('&updateMask.fieldPaths=')}&key=$_apiKey',
    );

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
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http.patch(
        url,
        headers: headers,
        body: jsonEncode(firestorePayload),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore Update Exception: $e');
      return false;
    }
  }

  /// Logs a user activity (quiz, study, achievement) to Firestore
  static Future<bool> logActivity(String email, String type, int xpGained,
      Map<String, dynamic> details, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    // Path: users/{email}/activities
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/activities?key=$_apiKey',
    );

    final Map<String, dynamic> firestorePayload = {
      'fields': {
        'userId': {'stringValue': email.toLowerCase()},
        'type': {'stringValue': type},
        'xpGained': {'integerValue': xpGained.toString()},
        'timestamp': {
          'timestampValue': DateTime.now().toUtc().toIso8601String()
        },
        'details': {
          'mapValue': {'fields': {}}
        }
      }
    };

    final detailsFields = firestorePayload['fields']['details']['mapValue']
        ['fields'] as Map<String, dynamic>;
    details.forEach((key, value) {
      if (value is String) {
        detailsFields[key] = {'stringValue': value};
      } else if (value is int) {
        detailsFields[key] = {'integerValue': value.toString()};
      } else if (value is double) {
        detailsFields[key] = {'doubleValue': value};
      }
    });

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http
          .post(
            url,
            headers: headers,
            body: jsonEncode(firestorePayload),
          )
          .timeout(const Duration(seconds: 10));

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore logActivity Exception: $e');
      return false;
    }
  }

  /// Uploads a file to Firebase Storage via REST
  static Future<String?> uploadImage(
      Uint8List imageBytes, String userId, String? idToken) async {
    final fileName = 'profile_pics/$userId.jpg';
    final encodedName = Uri.encodeComponent(fileName);
    final url = Uri.parse(
      'https://firebasestorage.googleapis.com/v0/b/$_storageBucket/o?uploadType=media&name=$encodedName&key=$_apiKey',
    );

    try {
      final Map<String, String> headers = {
        'Content-Type': 'image/jpeg',
      };

      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http.post(
        url,
        headers: headers,
        body: imageBytes,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final downloadToken = data['downloadTokens'] ?? '';
        final downloadUrl =
            'https://firebasestorage.googleapis.com/v0/b/$_storageBucket/o/$encodedName?alt=media&token=$downloadToken';
        return downloadUrl;
      } else {
        debugPrint(
            'Storage Upload Error (${response.statusCode}): ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Storage Upload Exception: $e');
      return null;
    }
  }

  /// Fetches all users from Firestore
  static Future<List<Map<String, dynamic>>> fetchAllUsers() async {
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users?pageSize=100&key=$_apiKey',
    );

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> documents = data['documents'] ?? [];

        return documents.map((doc) {
          final fields = doc['fields'] as Map<String, dynamic>;
          final parsed = _parseFirestoreFields(fields);
          final path = doc['name'] as String;
          final id = path.split('/').last;
          parsed['id'] = id;
          return parsed;
        }).toList();
      } else {
        debugPrint('Firestore Fetch All Error: ${response.body}');
        return [];
      }
    } catch (e) {
      debugPrint('Firestore Fetch All Exception: $e');
      return [];
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
    });
    return result;
  }

  /// Fetches user activities from Firestore
  static Future<List<Map<String, dynamic>>> getUserActivities(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
      'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/activities?orderBy=timestamp desc&pageSize=20&key=$_apiKey',
    );

    try {
      final Map<String, String> headers = {};
      if (idToken != null) {
        headers['Authorization'] = 'Bearer $idToken';
      }

      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final documents = data['documents'] as List? ?? [];
        return documents.map((doc) {
          final fields = doc['fields'] as Map<String, dynamic>;
          final parsed = _parseFirestoreFields(fields);
          // Extract document ID from name
          final name = doc['name'] as String;
          parsed['id'] = name.split('/').last;
          return parsed;
        }).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching activities: $e');
      return [];
    }
  }
}
