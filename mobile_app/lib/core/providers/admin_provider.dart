import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  bool _isLoading = false;
  List<Map<String, dynamic>> _users = [];
  String? _error;

  bool get isLoading => _isLoading;
  List<Map<String, dynamic>> get users => _users;
  String? get error => _error;

  Future<void> fetchUsers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _supabase
          .from('user_profiles')
          .select()
          .order('updated_at', ascending: false);

      _users = List<Map<String, dynamic>>.from(response);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> toggleUserStatus(String userId, bool currentStatus) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({'active': !currentStatus}).eq('id', userId);

      // Update local state
      final index = _users.indexWhere((u) => u['id'] == userId);
      if (index != -1) {
        _users[index]['active'] = !currentStatus;
        notifyListeners();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  List<Map<String, dynamic>> _mcqs = [];
  List<Map<String, dynamic>> get mcqs => _mcqs;

  Future<void> fetchMcqs() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _supabase
          .from('mcqs')
          .select()
          .order('id', ascending: false)
          .limit(50);
      _mcqs = List<Map<String, dynamic>>.from(response);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addMcq(Map<String, dynamic> mcqData) async {
    try {
      await _supabase.from('mcqs').insert(mcqData);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteMcq(String mcqId) async {
    try {
      await _supabase.from('mcqs').delete().eq('id', mcqId);
      notifyListeners();
      return true;
    } catch (e) {
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
      return false;
    }
  }

  Future<bool> deleteCourse(String courseId) async {
    try {
      await _supabase.from('classes').delete().eq('id', courseId);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }
}
