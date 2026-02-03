import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:passion_academia/core/services/firebase_service.dart';
import 'package:passion_academia/models/report_models.dart';

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
    try {
      final response =
          await _supabase.from('classes').insert(courseData).select();
      if (response.isNotEmpty) {
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error adding course: $e');
      return false;
    }
  }

  Future<bool> updateCourse(
      String courseId, Map<String, dynamic> courseData) async {
    try {
      final response = await _supabase
          .from('classes')
          .update(courseData)
          .eq('id', courseId)
          .select();
      if (response.isNotEmpty) {
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error updating course: $e');
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

  Future<bool> sendGlobalNotification(
      String title, String message, String type) async {
    try {
      final users = await FirebaseService.fetchAllUsers();
      bool allSuccessful = true;

      for (var user in users) {
        final email = user['email'] as String?;
        if (email != null) {
          // Log as activity in each user's collection
          final success = await FirebaseService.logActivity(
              email,
              type,
              0,
              {
                'title': title,
                'message': message,
                'isGlobal': true,
                'adminSent': true,
              },
              null);
          if (!success) allSuccessful = false;
        }
      }
      return allSuccessful;
    } catch (e) {
      debugPrint('Error sending global notification: $e');
      return false;
    }
  }

  Future<bool> scheduleBroadcast(Map<String, dynamic> broadcast) async {
    try {
      return await FirebaseService.saveBroadcast(broadcast);
    } catch (e) {
      debugPrint('Error scheduling broadcast: $e');
      return false;
    }
  }

  Future<List<UserActivityReport>> fetchUserActivityReport({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await FirebaseService.aggregateUserActivities(
        startDate: startDate,
        endDate: endDate,
      );
      return data.map((json) => UserActivityReport.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error fetching user activity report: $e');
      return [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<QuizPerformanceReport>> fetchQuizPerformanceReport({
    DateTime? startDate,
    DateTime? endDate,
    String? subject,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      // Fetch from Supabase directly for better aggregation
      var query = _supabase.from('results').select();
      if (startDate != null)
        query = query.gte('created_at', startDate.toIso8601String());
      if (endDate != null)
        query = query.lte('created_at', endDate.toIso8601String());
      if (subject != null && subject != 'All')
        query = query.eq('subject', subject);

      final results = await query;

      // Process results into subject-wise reports
      Map<String, List<Map<String, dynamic>>> groupedBySubject = {};
      for (var r in results) {
        final sub = r['subject'] ?? 'General';
        groupedBySubject
            .putIfAbsent(sub, () => [])
            .add(r as Map<String, dynamic>);
      }

      return groupedBySubject.entries.map((entry) {
        final subResults = entry.value;
        final scores =
            subResults.map((r) => (r['score'] as num).toDouble()).toList();
        final avgScore = scores.isEmpty
            ? 0.0
            : scores.reduce((a, b) => a + b) / scores.length;
        final passRate = subResults.isEmpty
            ? 0.0
            : subResults.where((r) => (r['score'] as num) >= 70).length /
                subResults.length;

        // Simple distribution
        Map<String, double> distribution = {
          '0-40': subResults
              .where((r) => (r['score'] as num) < 40)
              .length
              .toDouble(),
          '40-70': subResults
              .where(
                  (r) => (r['score'] as num) >= 40 && (r['score'] as num) < 70)
              .length
              .toDouble(),
          '70-100': subResults
              .where((r) => (r['score'] as num) >= 70)
              .length
              .toDouble(),
        };

        return QuizPerformanceReport(
          subject: entry.key,
          totalAttempts: subResults.length,
          uniqueAttempts: subResults.map((r) => r['user_id']).toSet().length,
          averageScore: avgScore,
          passRate: passRate,
          scoreDistribution: distribution,
          questionAnalysis: [], // Advanced analysis would require joining with individual answers
        );
      }).toList();
    } catch (e) {
      debugPrint('Error fetching quiz performance report: $e');
      return [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<CourseEngagementReport>> fetchCourseEngagementReport({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final courses = await _supabase.from('classes').select();
      final results = await _supabase.from('results').select();

      return courses.map((course) {
        final slug = course['slug'];
        final courseResults =
            results.where((r) => r['course_slug'] == slug).toList();
        final uniqueStudents =
            courseResults.map((r) => r['user_id']).toSet().length;

        return CourseEngagementReport(
          courseId: course['id'].toString(),
          courseTitle: course['title'],
          totalEnrollments: uniqueStudents, // Simplified enrollment metric
          activeStudents: uniqueStudents,
          completionRate: 0.0, // Needs progress tracking data
          averageProgress: 0.0,
          enrollmentTrends: [],
        );
      }).toList();
    } catch (e) {
      debugPrint('Error fetching course engagement report: $e');
      return [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
