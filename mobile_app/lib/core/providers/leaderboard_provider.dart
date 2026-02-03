import 'package:flutter/material.dart';
import 'package:passion_academia/core/services/firebase_service.dart';

class LeaderboardProvider extends ChangeNotifier {
  bool _isLoading = false;
  List<Map<String, dynamic>> _topUsers = [];
  String? _error;

  bool get isLoading => _isLoading;
  List<Map<String, dynamic>> get topUsers => _topUsers;
  String? get error => _error;

  Future<void> fetchTopUsers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final users = await FirebaseService.fetchAllUsers();
      // Sort by XP descending
      users.sort(
          (a, b) => ((b['xp'] ?? 0) as int).compareTo((a['xp'] ?? 0) as int));

      // Take top 10
      _topUsers = users.take(10).toList();
    } catch (e) {
      _error = 'Failed to load leaderboard';
      debugPrint('Leaderboard Error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchStreakLegends() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final users = await FirebaseService.fetchAllUsers();
      // Sort by Streak descending
      users.sort((a, b) =>
          ((b['streak'] ?? 0) as int).compareTo((a['streak'] ?? 0) as int));

      // Take top 5
      _topUsers = users.take(5).toList();
    } catch (e) {
      _error = 'Failed to load streaks';
      debugPrint('Streak Error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
