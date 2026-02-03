import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:passion_academia/core/services/firebase_service.dart';
import 'package:passion_academia/core/services/supabase_service.dart';

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
      photoUrl: json['photoURL'] ?? json['photoUrl'],
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
  String? _token;
  bool _isLoading = false;
  String? _error;
  List<String> _completedChapters = [];

  UserProfile? get user => _user;
  UserProfile? get userProfile => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<String> get completedChapters => _completedChapters;
  bool get isAuthenticated => _user != null;

  String? get userName => _user?.name ?? _user?.email;
  int get userXP => _user?.xp ?? 0;
  int get userStreak => _user?.streak ?? 0;

  // Gamification Logic
  int get userLevel => (userXP / 500).floor() + 1;
  int get xpForNextLevel => userLevel * 500;
  int get xpInCurrentLevel => userXP % 500;
  double get levelProgress => xpInCurrentLevel / 500;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_profile');
    _token = prefs.getString('auth_token');
    if (userJson != null) {
      _user = UserProfile.fromJson(jsonDecode(userJson));
      notifyListeners();

      try {
        final freshData = await FirebaseService.getUserFromFirestore(
          _user!.email,
          _token,
        );
        if (freshData != null) {
          _user = UserProfile.fromJson(freshData);
          await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
        }

        // Fetch progress (completed chapters)
        final progressData = await FirebaseService.getProgressFromFirestore(
          _user!.email,
          _token,
        );
        if (progressData != null) {
          final List<dynamic> completed =
              progressData['completedChapters'] ?? [];
          _completedChapters = completed.map((e) => e.toString()).toList();
        }
        notifyListeners();
      } catch (e) {
        debugPrint('Auto-refresh failed: $e');
      }
    }
  }

  Future<void> updateStats(
    int xpEarned,
    bool updateStreak, {
    int? questionsCount,
    int? correctCount,
  }) async {
    if (_user == null) return;

    // 1. Update User Document (Main stats)
    final newXp = _user!.xp + xpEarned;
    final Map<String, dynamic> updates = {'xp': newXp};

    if (updateStreak) {
      updates['streak'] = _user!.streak + 1;
    }

    final success = await FirebaseService.updateFirestoreField(
      _user!.email,
      updates,
      _token,
    );

    // 2. Update Progress Subcollection (Web Compatibility)
    try {
      final currentProgress = await FirebaseService.getProgressFromFirestore(
        _user!.email,
        _token,
      );
      if (currentProgress != null) {
        final Map<String, dynamic> progressUpdates = {
          'totalXP': (_user!.xp) + xpEarned,
          'streak': updates.containsKey('streak')
              ? updates['streak']
              : (_user!.streak),
          'lastActive': DateTime.now().toUtc().toIso8601String(),
        };

        if (questionsCount != null || correctCount != null) {
          final stats = currentProgress['stats'] as Map<String, dynamic>? ?? {};
          progressUpdates['stats'] = {
            'questionsAnswered':
                (stats['questionsAnswered'] ?? 0) + (questionsCount ?? 0),
            'correctAnswers':
                (stats['correctAnswers'] ?? 0) + (correctCount ?? 0),
            'quizzesCompleted': (stats['quizzesCompleted'] ?? 0) + 1,
          };
        }

        await FirebaseService.updateProgressInFirestore(
          _user!.email,
          progressUpdates,
          _token,
        );
      }
    } catch (e) {
      debugPrint('Error updating progress subcollection: $e');
    }

    if (success) {
      // Update local state
      _user = UserProfile(
        id: _user!.id,
        name: _user!.name,
        email: _user!.email,
        course: _user!.course,
        role: _user!.role,
        photoUrl: _user!.photoUrl,
        xp: newXp,
        streak:
            updates.containsKey('streak') ? updates['streak'] : _user!.streak,
        active: _user!.active,
      );

      // Save to Local Storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
      notifyListeners();
    }
  }

  Future<void> markChapterCompleted(String courseSlug, String chapterId) async {
    if (_user == null) return;

    try {
      final String entry = '${courseSlug}_$chapterId';
      if (!_completedChapters.contains(entry)) {
        _completedChapters.add(entry);
        notifyListeners(); // Immediate UI update

        final currentProgress = await FirebaseService.getProgressFromFirestore(
          _user!.email,
          _token,
        );

        if (currentProgress != null) {
          final List<dynamic> completed =
              currentProgress['completedChapters'] ?? [];
          if (!completed.contains(entry)) {
            completed.add(entry);
            final stats =
                currentProgress['stats'] as Map<String, dynamic>? ?? {};

            await FirebaseService.updateProgressInFirestore(
                _user!.email,
                {
                  'completedChapters': completed,
                  'stats': {
                    ...stats,
                    'chaptersCompleted': (stats['chaptersCompleted'] ?? 0) + 1,
                  },
                },
                _token);
          }
        }

        // Award some XP
        await updateStats(20, false);
      }
    } catch (e) {
      debugPrint('Error marking chapter completed: $e');
    }
  }

  Future<bool> loginWithGoogle() async {
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      // Note: You must provide a Web Client ID for Google Sign-In to work on Chrome.
      // 1. Go to https://console.cloud.google.com/
      // 2. Select your project: 'cyber-security-460017'
      // 3. Go to APIs & Services > Credentials
      // 4. Find 'OAuth 2.0 Client IDs' > 'Web client (auto-created by Google Service)'
      final googleSignIn = GoogleSignIn(
        clientId:
            '705319384418-7bt62gcrvim6di372lbs9kav195j1tev.apps.googleusercontent.com', // Replace with your actual Web Client ID
        scopes: ['email', 'profile'],
      );

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        _isLoading = false;
        notifyListeners();
        return false; // User cancelled
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        _error = 'Failed to get ID Token from Google.';
        return false;
      }

      // 1. Authenticate with Firebase using the Google ID Token
      final authData = await FirebaseService.signInWithGoogle(idToken);

      if (authData != null) {
        final String email = authData['email'];
        _token = authData['idToken'];

        // 2. Check if user exists in Firestore
        var firestoreData = await FirebaseService.getUserFromFirestore(
          email,
          _token,
        );

        if (firestoreData == null) {
          // New user -> Create profile
          final success = await FirebaseService.createUserInFirestore(
            googleUser.displayName ?? 'Google User',
            email,
            'google_auth_placeholder', // Not used for actual auth
            _token,
          );

          if (success) {
            firestoreData = await FirebaseService.getUserFromFirestore(
              email,
              _token,
            );
          }
        }

        if (firestoreData != null) {
          if (firestoreData['active'] == false) {
            _error =
                'Your account is inactive. Please contact an administrator.';
            return false;
          }

          _user = UserProfile.fromJson(firestoreData);

          // Save to Local Storage
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
          if (_token != null) {
            await prefs.setString('auth_token', _token!);
          }

          return true;
        } else {
          _error = 'Failed to create or retrieve user profile.';
          return false;
        }
      } else {
        _error = 'Firebase Google authentication failed.';
        return false;
      }
    } catch (e) {
      _error = 'Google Sign-In Error: $e';
      debugPrint('Google Sign-In Error: $e');
      return false;
    } finally {
      _isLoading = false;
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
        _token = authData['idToken'];
        firestoreData = await FirebaseService.getUserFromFirestore(
          email,
          _token,
        );
      } else {
        // 2. Firebase Auth Failed -> Check manual Firestore password (for Admin/Special accounts)
        firestoreData = await FirebaseService.getUserFromFirestore(email, null);
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
        _token = authData?['idToken'];

        // Save to Local Storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
        if (_token != null) {
          await prefs.setString('auth_token', _token!);
        }

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
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Sign up with Firebase Auth
      final authData = await FirebaseService.signUpWithEmail(email, password);

      if (authData != null) {
        _token = authData['idToken'];
        // 2. Create user document in Firestore
        final success = await FirebaseService.createUserInFirestore(
          name,
          email,
          password,
          _token,
        );

        if (success) {
          // 3. Fetch the newly created profile
          final firestoreData = await FirebaseService.getUserFromFirestore(
            email,
            _token,
          );

          if (firestoreData != null) {
            _user = UserProfile.fromJson(firestoreData);

            // Save to Local Storage
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
            if (_token != null) {
              await prefs.setString('auth_token', _token!);
            }

            return true;
          } else {
            _error = 'Failed to retrieve user profile after signup.';
            return false;
          }
        } else {
          _error = 'Failed to create user profile in database.';
          return false;
        }
      } else {
        _error = 'Signup failed. Please try again.';
        return false;
      }
    } catch (e) {
      _error = 'An unexpected error occurred during signup: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_profile');
    await prefs.remove('auth_token');
    notifyListeners();
  }

  Future<bool> updateProfilePicture(Uint8List imageBytes) async {
    if (_user == null) return false;

    _isLoading = true;
    notifyListeners();

    try {
      // 1. Upload to Supabase Storage
      final photoUrl = await SupabaseService.uploadProfilePicture(
        imageBytes,
        _user!.id,
      );
      if (photoUrl == null) return false;

      // 2. Update Supabase Database (Optional Sync)
      // This is less critical than Firestore
      final supabaseSuccess = await SupabaseService.updateProfileUrl(
        _user!.email,
        photoUrl,
      );
      if (!supabaseSuccess) {
        debugPrint('Warning: Supabase profile table update failed.');
      }

      // 3. Update Firestore (Primary Source of Truth)
      // Matching web's key 'photoURL'
      final firestoreSuccess = await FirebaseService.updateFirestoreField(
        _user!.email,
        {'photoURL': photoUrl},
        _token,
      );

      if (firestoreSuccess) {
        // 4. Update local state
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
