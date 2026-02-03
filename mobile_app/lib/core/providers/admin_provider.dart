import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:passion_academia/core/services/firebase_service.dart';

class AdminProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  bool _isLoading = false;
  List<Map<String, dynamic>> _users = [];
  String? _error;

  bool get isLoading => _isLoading;
  List<Map<String, dynamic>> get users => _users;
  String? get error => _error;

  DateTime? _lastFetch;

  Future<void> fetchUsers({bool force = false}) async {
    if (!force &&
        _lastFetch != null &&
        DateTime.now().difference(_lastFetch!).inMinutes < 5) {
      return;
    }
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Use Firebase for Users (hybrid architecture)
      final firebaseUsers = await FirebaseService.fetchAllUsers();

      // Map Firestore fields to our UI expected fields if needed
      _users = firebaseUsers.map((u) {
        return {
          'id': u['id'], // email
          'email': u['email'],
          'full_name': u['name'] ?? u['full_name'], // handle both cases
          'role': u['role'],
          'active': u['active'] ?? true,
          'photo_url': u['photoURL'] ?? u['photoUrl'], // handle both cases
          'xp': u['xp'],
        };
      }).toList();
      _lastFetch = DateTime.now();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> toggleUserStatus(String userId, bool currentStatus) async {
    try {
      // UserId is the email in Firestore structure used here
      // But we need to check if updateFirestoreField takes email or ID.
      // getUserFromFirestore takes 'email'. updateFirestoreField takes 'email'.
      // Our 'id' is extracted from document path, which IS the encoded email.
      // We should pass the ID (which is the email) as the email argument.

      // Note: 'userId' here comes from our _users list where we set 'id' = document name key (email)

      final success = await FirebaseService.updateFirestoreField(
          userId, // userId is email
          {'active': !currentStatus},
          null // idToken might be needed? Admin usually needs auth.
          // If REST API is open or we don't have admin token, this might fail.
          // But reading worked without token? apiKey might allow it if rules match.
          // Let's try without token first, as we are 'admin' in the app context.
          );

      if (success) {
        // Update local state
        final index = _users.indexWhere((u) => u['id'] == userId);
        if (index != -1) {
          _users[index]['active'] = !currentStatus;
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error toggling user status: $e');
      return false;
    }
  }

  List<Map<String, dynamic>> _mcqs = [];
  List<Map<String, dynamic>> get mcqs => _mcqs;

  List<String> get uniqueSubjects {
    final subjects = _mcqs
        .map((m) => m['subject']?.toString() ?? 'General')
        .toSet()
        .toList();
    subjects.sort();
    return subjects;
  }

  List<String> get uniqueCourses {
    final courses = _mcqs
        .map((m) => m['course_slug']?.toString() ?? 'All')
        .toSet()
        .toList();
    courses.sort();
    return courses;
  }

  Future<void> fetchMcqs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response =
          await _supabase.from('mcqs').select().order('id', ascending: false);
      _mcqs = List<Map<String, dynamic>>.from(response);
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching MCQs: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addMcq(Map<String, dynamic> mcqData) async {
    try {
      final response = await _supabase.from('mcqs').insert(mcqData).select();
      if (response.isNotEmpty) {
        _mcqs.insert(0, response[0]);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error adding MCQ: $e');
      return false;
    }
  }

  Future<bool> updateMcq(String mcqId, Map<String, dynamic> mcqData) async {
    try {
      final response =
          await _supabase.from('mcqs').update(mcqData).eq('id', mcqId).select();
      if (response.isNotEmpty) {
        final index = _mcqs.indexWhere((m) => m['id'].toString() == mcqId);
        if (index != -1) {
          _mcqs[index] = response[0];
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error updating MCQ: $e');
      return false;
    }
  }

  Future<bool> deleteMcq(String mcqId) async {
    try {
      await _supabase.from('mcqs').delete().eq('id', mcqId);
      _mcqs.removeWhere((m) => m['id'].toString() == mcqId);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error deleting MCQ: $e');
      return false;
    }
  }

  Future<bool> addCourse(Map<String, dynamic> courseData) async {
// ...
    try {
      await _supabase.from('classes').insert(courseData);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error adding course: $e');
      return false;
    }
  }

  Future<bool> deleteCourse(String courseId) async {
    try {
      await _supabase.from('classes').delete().eq('id', courseId);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error deleting course: $e');
      return false;
    }
  }

  Map<String, int> _dashboardStats = {
    'users': 0,
    'mcqs': 0,
    'classes': 0,
  };
  Map<String, int> get dashboardStats => _dashboardStats;

  Future<void> fetchDashboardStats() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Use Firebase for User Count
      final firebaseUsers = await FirebaseService.fetchAllUsers();
      final userCount = firebaseUsers.length;

      // Use Supabase for others
      final mcqCount = await _supabase.from('mcqs').count();
      final classCount = await _supabase.from('classes').count();

      _dashboardStats = {
        'users': userCount,
        'mcqs': mcqCount,
        'classes': classCount,
      };
    } catch (e) {
      debugPrint('Error fetching stats: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
