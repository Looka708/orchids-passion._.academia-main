import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:passion_academia/core/config/app_config.dart';

class FirebaseService {
  static const String _apiKey = AppConfig.firebaseApiKey;
  static const String _projectId = AppConfig.firebaseProjectId;
  static const String _storageBucket = AppConfig.firebaseStorageBucket;

  /// Authenticates using Firebase Auth REST API
  static Future<Map<String, dynamic>?> signInWithEmail(
      String email, String password) async {
    final url = Uri.parse(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$_apiKey');
    try {
      final response = await http.post(url,
          body: jsonEncode({
            'email': email,
            'password': password,
            'returnSecureToken': true
          }));
      final data = jsonDecode(response.body);
      return response.statusCode == 200 ? data : null;
    } catch (e) {
      debugPrint('Firebase Auth Exception: $e');
      return null;
    }
  }

  /// Authenticates with Google using an ID Token
  static Future<Map<String, dynamic>?> signInWithGoogle(String idToken) async {
    final url = Uri.parse(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=$_apiKey');
    try {
      final response = await http.post(url,
          body: jsonEncode({
            'postBody': 'id_token=$idToken&providerId=google.com',
            'requestUri': 'http://localhost',
            'returnIdpCredential': true,
            'returnSecureToken': true,
          }));
      final data = jsonDecode(response.body);
      return response.statusCode == 200 ? data : null;
    } catch (e) {
      debugPrint('Firebase Google Auth Exception: $e');
      return null;
    }
  }

  /// Registers a new user using Firebase Auth REST API
  static Future<Map<String, dynamic>?> signUpWithEmail(
      String email, String password) async {
    final url = Uri.parse(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$_apiKey');
    try {
      final response = await http.post(url,
          body: jsonEncode({
            'email': email,
            'password': password,
            'returnSecureToken': true
          }));
      final data = jsonDecode(response.body);
      return response.statusCode == 200 ? data : null;
    } catch (e) {
      debugPrint('Firebase Auth Signup Exception: $e');
      return null;
    }
  }

  /// Creates a new user document in Firestore
  static Future<bool> createUserInFirestore(
      String name, String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users?documentId=$encodedEmail&key=$_apiKey');
    final Map<String, dynamic> payload = {
      'fields': {
        'name': {'stringValue': name},
        'email': {'stringValue': email.toLowerCase()},
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
      final headers = {'Content-Type': 'application/json'};
      if (idToken != null) headers['Authorization'] = 'Bearer $idToken';
      final response =
          await http.post(url, headers: headers, body: jsonEncode(payload));
      if (response.statusCode == 200) {
        await initializeProgressInFirestore(email, idToken);
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Firestore Create User Exception: $e');
      return false;
    }
  }

  /// Initializes user progress
  static Future<bool> initializeProgressInFirestore(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/progress?documentId=current&key=$_apiKey');
    final Map<String, dynamic> payload = {
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
      final headers = {'Content-Type': 'application/json'};
      if (idToken != null) headers['Authorization'] = 'Bearer $idToken';
      final response =
          await http.post(url, headers: headers, body: jsonEncode(payload));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore Initialize Progress Error: $e');
      return false;
    }
  }

  /// Fetches user document
  static Future<Map<String, dynamic>?> getUserFromFirestore(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail?key=$_apiKey');
    try {
      final headers = idToken != null
          ? {'Authorization': 'Bearer $idToken'}
          : <String, String>{};
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final fields = _parseFirestoreFields(data['fields'] as Map? ?? {});
        fields['id'] = (data['name'] as String).split('/').last;
        return fields;
      }
      return null;
    } catch (e) {
      debugPrint('Firestore getUser Exception: $e');
      return null;
    }
  }

  /// Fetches progress document
  static Future<Map<String, dynamic>?> getProgressFromFirestore(
      String email, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/progress/current?key=$_apiKey');
    try {
      final headers = idToken != null
          ? {'Authorization': 'Bearer $idToken'}
          : <String, String>{};
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return _parseFirestoreFields(data['fields'] as Map? ?? {});
      }
      return null;
    } catch (e) {
      debugPrint('Firestore getProgress Exception: $e');
      return null;
    }
  }

  /// Updates progress
  static Future<bool> updateProgressInFirestore(
      String email, Map<String, dynamic> updates, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail/progress/current?key=$_apiKey');
    Map<String, dynamic> payload = {'fields': {}};
    void processMap(Map<String, dynamic> src, Map<String, dynamic> target) {
      src.forEach((k, v) {
        if (v is String)
          target[k] = {'stringValue': v};
        else if (v is bool)
          target[k] = {'booleanValue': v};
        else if (v is int)
          target[k] = {'integerValue': v.toString()};
        else if (v is double)
          target[k] = {'doubleValue': v};
        else if (v is Map<String, dynamic>) {
          final nested = <String, dynamic>{};
          processMap(v, nested);
          target[k] = {
            'mapValue': {'fields': nested}
          };
        } else if (v is List) {
          target[k] = {
            'arrayValue': {
              'values': v.map((e) => {'stringValue': e.toString()}).toList()
            }
          };
        }
      });
    }

    processMap(updates, payload['fields']);
    final updateMask =
        updates.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final patchUrl = Uri.parse('$url&$updateMask');
    try {
      final headers = {'Content-Type': 'application/json'};
      if (idToken != null) headers['Authorization'] = 'Bearer $idToken';
      final response = await http.patch(patchUrl,
          headers: headers, body: jsonEncode(payload));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore updateProgress Exception: $e');
      return false;
    }
  }

  /// Updates a field
  static Future<bool> updateFirestoreField(
      String email, Map<String, dynamic> fields, String? idToken) async {
    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final query = fields.keys.map((k) => 'updateMask.fieldPaths=$k').join('&');
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encodedEmail?$query&key=$_apiKey');
    Map<String, dynamic> payload = {'fields': {}};
    fields.forEach((k, v) {
      if (v is String)
        payload['fields'][k] = {'stringValue': v};
      else if (v is bool)
        payload['fields'][k] = {'booleanValue': v};
      else if (v is int) payload['fields'][k] = {'integerValue': v.toString()};
    });
    try {
      final headers = {'Content-Type': 'application/json'};
      if (idToken != null) headers['Authorization'] = 'Bearer $idToken';
      final response =
          await http.patch(url, headers: headers, body: jsonEncode(payload));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore updateField Exception: $e');
      return false;
    }
  }

  /// Logs activity - The potential culprit of the type error
  static Future<bool> logActivity(String email, String type, int xpEarned,
      Map<String, dynamic> details, String? idToken) async {
    final cleanEmail = email.trim().toLowerCase();
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/${Uri.encodeComponent(cleanEmail)}/activities?key=$_apiKey');

    final Map<String, dynamic> fields = {
      'userId': {'stringValue': cleanEmail},
      'type': {'stringValue': type},
      'xpGained': {'integerValue': xpEarned.toString()},
      'timestamp': {'timestampValue': DateTime.now().toUtc().toIso8601String()},
    };

    final Map<String, dynamic> detailsMapped = {};
    details.forEach((k, v) {
      if (v is String)
        detailsMapped[k] = {'stringValue': v};
      else if (v is int)
        detailsMapped[k] = {'integerValue': v.toString()};
      else if (v is double)
        detailsMapped[k] = {'doubleValue': v};
      else if (v is bool) detailsMapped[k] = {'booleanValue': v};
    });

    fields['details'] = {
      'mapValue': {'fields': detailsMapped}
    };

    try {
      final Map<String, String> headers = {
        'Content-Type': 'application/json',
        if (idToken != null && idToken.isNotEmpty)
          'Authorization': 'Bearer $idToken',
      };

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({'fields': fields}),
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore logActivity Exception: $e');
      return false;
    }
  }

  /// Saves broadcast
  static Future<bool> saveBroadcast(Map<String, dynamic> broadcast) async {
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/broadcasts?key=$_apiKey');
    final Map<String, dynamic> payload = {
      'fields': {
        'title': {'stringValue': broadcast['title']},
        'message': {'stringValue': broadcast['message']},
        'type': {'stringValue': broadcast['type']},
        'scheduledAt': {
          'timestampValue':
              (broadcast['scheduledAt'] as DateTime).toUtc().toIso8601String()
        },
        'createdAt': {
          'timestampValue': DateTime.now().toUtc().toIso8601String()
        },
      }
    };
    try {
      final response = await http.post(url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Firestore saveBroadcast Exception: $e');
      return false;
    }
  }

  /// Fetches broadcasts
  static Future<List<Map<String, dynamic>>> fetchBroadcasts() async {
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/broadcasts?orderBy=scheduledAt desc&key=$_apiKey');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final docs = data['documents'] as List? ?? [];
        return docs.map((doc) {
          final fields = _parseFirestoreFields(doc['fields'] as Map? ?? {});
          fields['id'] = (doc['name'] as String).split('/').last;
          return fields;
        }).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching broadcasts: $e');
      return [];
    }
  }

  /// Uploads image
  static Future<String?> uploadImage(
      Uint8List bytes, String userId, String? idToken) async {
    final fileName = Uri.encodeComponent('profile_pics/$userId.jpg');
    final url = Uri.parse(
        'https://firebasestorage.googleapis.com/v0/b/$_storageBucket/o?uploadType=media&name=$fileName&key=$_apiKey');
    try {
      final headers = {'Content-Type': 'image/jpeg'};
      if (idToken != null) headers['Authorization'] = 'Bearer $idToken';
      final response = await http.post(url, headers: headers, body: bytes);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return 'https://firebasestorage.googleapis.com/v0/b/$_storageBucket/o/$fileName?alt=media&token=${data['downloadTokens'] ?? ''}';
      }
      return null;
    } catch (e) {
      debugPrint('Storage Upload Exception: $e');
      return null;
    }
  }

  /// Fetches all users
  static Future<List<Map<String, dynamic>>> fetchAllUsers() async {
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users?pageSize=100&key=$_apiKey');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> docs = data['documents'] ?? [];
        return docs.map((doc) {
          final fields = _parseFirestoreFields(
              (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {});
          fields['id'] = (doc['name'] as String).split('/').last;
          fields['xp'] = (fields['xp'] ?? 0) as int;
          fields['streak'] = (fields['streak'] ?? 0) as int;
          return fields;
        }).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Firestore fetchAllUsers Exception: $e');
      return [];
    }
  }

  /// Parses Firestore fields
  static Map<String, dynamic> _parseFirestoreFields(Map fields) {
    Map<String, dynamic> result = {};
    fields.cast<String, dynamic>().forEach((k, v) {
      if (v.containsKey('stringValue'))
        result[k] = v['stringValue'];
      else if (v.containsKey('booleanValue'))
        result[k] = v['booleanValue'];
      else if (v.containsKey('integerValue'))
        result[k] = int.parse(v['integerValue']);
      else if (v.containsKey('doubleValue'))
        result[k] = v['doubleValue'];
      else if (v.containsKey('timestampValue'))
        result[k] = v['timestampValue'];
      else if (v is Map && v.containsKey('mapValue')) {
        result[k] =
            _parseFirestoreFields(v['mapValue']['fields'] as Map? ?? {});
      }
    });
    return result;
  }

  /// Fetches user activities
  static Future<List<Map<String, dynamic>>> getUserActivities(
      String email, String? idToken) async {
    final encoded = Uri.encodeComponent(email.toLowerCase());
    final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/(default)/documents/users/$encoded/activities?orderBy=timestamp desc&pageSize=20&key=$_apiKey');
    try {
      final headers = idToken != null
          ? {'Authorization': 'Bearer $idToken'}
          : <String, String>{};
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final docs = data['documents'] as List? ?? [];
        return docs.map((doc) {
          final fields = _parseFirestoreFields(
              (doc['fields'] as Map?)?.cast<String, dynamic>() ?? {});
          fields['id'] = (doc['name'] as String).split('/').last;
          return fields;
        }).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching activities: $e');
      return [];
    }
  }

  /// Aggregates user activities for reports
  static Future<List<Map<String, dynamic>>> aggregateUserActivities({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final users = await fetchAllUsers();
    List<Map<String, dynamic>> reportData = [];

    for (var user in users) {
      final email = user['email'] as String? ?? '';
      if (email.isEmpty) continue;

      final activities = await getUserActivities(email, null);

      final filteredActivities = activities.where((a) {
        if (a['timestamp'] == null) return false;
        final ts = DateTime.parse(a['timestamp']);
        if (startDate != null && ts.isBefore(startDate)) return false;
        if (endDate != null && ts.isAfter(endDate)) return false;
        return true;
      }).toList();

      reportData.add({
        'userId': email,
        'userName': user['name'] ?? 'User',
        'email': email,
        'totalXp': user['xp'] ?? 0,
        'currentStreak': user['streak'] ?? 0,
        'longestStreak': user['longestStreak'] ?? user['streak'] ?? 0,
        'totalLogins':
            filteredActivities.where((a) => a['type'] == 'login').length,
        'lastActive': user['lastActive'] ?? user['created_at'],
        'dailyActivity': _groupActivitiesByDate(filteredActivities),
      });
    }
    return reportData;
  }

  static List<Map<String, dynamic>> _groupActivitiesByDate(
      List<Map<String, dynamic>> activities) {
    Map<String, Map<String, dynamic>> grouped = {};
    for (var a in activities) {
      if (a['timestamp'] == null) continue;
      final date = a['timestamp'].split('T')[0];
      if (!grouped.containsKey(date)) {
        grouped[date] = {'date': date, 'xpEarned': 0, 'questionsSolved': 0};
      }
      grouped[date]!['xpEarned'] += (a['xpGained'] ?? 0) as int;
      if (a['type'] == 'quiz') {
        grouped[date]!['questionsSolved'] +=
            (a['details']?['questionsAnswered'] ?? 0) as int;
      }
    }
    return grouped.values.toList();
  }

  /// Aggregates quiz results
  static Future<Map<String, dynamic>> aggregateQuizResults({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    return {
      'totalAttempts': 0,
      'averageScore': 0.0,
      'passRate': 0.0,
      'subjectStats': {},
    };
  }

  /// Aggregates course enrollments
  static Future<List<Map<String, dynamic>>> aggregateCourseEnrollments({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    return [];
  }
}
