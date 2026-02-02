import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:passion_academia/core/services/firebase_service.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String course;
  final String role;
  final bool active;
  final int xp;
  final int streak;
  final String? photoUrl;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.course,
    required this.role,
    this.active = true,
    this.xp = 0,
    this.streak = 0,
    this.photoUrl,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? json['email'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      course: json['course'] ?? 'All',
      role: json['role'] ?? 'user',
      active: json['active'] ?? true,
      xp: json['xp'] ?? 0,
      streak: json['streak'] ?? 0,
      photoUrl: json['photoUrl'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'course': course,
        'role': role,
        'active': active,
        'xp': xp,
        'streak': streak,
        'photoUrl': photoUrl,
      };
}

class AuthProvider extends ChangeNotifier {
  UserProfile? _user;
  bool _isLoading = false;
  String? _error;

  UserProfile? get user => _user;
  UserProfile? get userProfile => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  String? get userName => _user?.name ?? _user?.email;
  int get userXP => _user?.xp ?? 0;
  int get userStreak => _user?.streak ?? 0;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_profile');
    if (userJson != null) {
      _user = UserProfile.fromJson(jsonDecode(userJson));
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Try Firebase Auth REST API
      final authData = await FirebaseService.signInWithEmail(email, password);

      Map<String, dynamic>? firestoreData;

      if (authData != null) {
        // Firebase Auth Success -> Get profile from Firestore
        firestoreData = await FirebaseService.getUserFromFirestore(email);
      } else {
        // 2. Firebase Auth Failed -> Check manual Firestore password (for Admin/Special accounts)
        firestoreData = await FirebaseService.getUserFromFirestore(email);
        if (firestoreData == null || firestoreData['password'] != password) {
          _error = 'Invalid email or password.';
          return false;
        }
      }

      if (firestoreData != null) {
        if (firestoreData['role'] != 'owner' &&
            firestoreData['role'] != 'admin' &&
            firestoreData['active'] == false) {
          _error = 'Your account is inactive. Please contact an administrator.';
          return false;
        }

        _user = UserProfile.fromJson(firestoreData);

        // Save to Local Storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_profile', jsonEncode(_user!.toJson()));

        return true;
      } else {
        _error = 'User profile not found.';
        return false;
      }
    } catch (e) {
      _error = 'An unexpected error occurred: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signup(String name, String email, String password) async {
    _error = 'Signup is currently only available through the web platform.';
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_profile');
    notifyListeners();
  }

  Future<bool> updateProfilePicture(Uint8List imageBytes) async {
    if (_user == null) return false;

    _isLoading = true;
    notifyListeners();

    try {
      // 1. Upload to Storage
      final photoUrl = await FirebaseService.uploadImage(imageBytes, _user!.id);
      if (photoUrl == null) return false;

      // 2. Update Firestore
      final success = await FirebaseService.updateFirestoreField(
        _user!.email,
        {'photoUrl': photoUrl},
      );

      if (success) {
        // 3. Update local state
        _user = UserProfile(
          id: _user!.id,
          name: _user!.name,
          email: _user!.email,
          course: _user!.course,
          role: _user!.role,
          active: _user!.active,
          xp: _user!.xp,
          streak: _user!.streak,
          photoUrl: photoUrl,
        );

        // 4. Save to Local Storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_profile', jsonEncode(_user!.toJson()));

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error updating profile picture: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
