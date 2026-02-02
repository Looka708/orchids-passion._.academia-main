import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

class AuthProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;

  bool _isLoading = false;
  String? _error;

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _supabase.auth.currentSession != null;

  User? get user => _supabase.auth.currentUser;
  String? get userName => user?.userMetadata?['full_name'] ?? user?.email;
  int get userXP => user?.userMetadata?['xp'] ?? 0;
  int get userStreak => user?.userMetadata?['streak'] ?? 0;

  AuthProvider() {
    _supabase.auth.onAuthStateChange.listen((data) {
      notifyListeners();
    });
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return true;
    } on AuthException catch (e) {
      if (e.code == 'invalid_credentials') {
        _error =
            'Invalid email or password. Do you have an account? Try Signing Up!';
      } else {
        _error = e.message;
      }
      debugPrint('Login error: $e');
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      debugPrint('Login error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signup(String name, String email, String password) async {
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': name},
      );
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      debugPrint('Signup error: $e');
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      debugPrint('Signup error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _supabase.auth.signOut();
  }
}
