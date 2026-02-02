import 'package:flutter/material.dart';
import 'package:passion_academia/models/notification.dart';
import 'package:passion_academia/core/services/firebase_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  bool _isLoading = false;

  List<AppNotification> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> fetchNotifications(String email, String token) async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Fetch activities from Firestore (as a source of notifications)
      // Note: We need a fetchActivities method in FirebaseService
      final activities = await FirebaseService.getUserActivities(email, token);

      final List<AppNotification> remoteNotifications = activities.map((a) {
        return AppNotification(
          id: a['id'],
          title: _getNotificationTitleForType(a['type']),
          message: _getNotificationMessage(a),
          type: _getNotificationType(a['type']),
          timestamp: DateTime.parse(a['timestamp']),
          isRead:
              false, // We'll manage read status locally for now or via Firestore
        );
      }).toList();

      // 2. Load read status from local storage
      final prefs = await SharedPreferences.getInstance();
      final readIds = prefs.getStringList('read_notification_ids') ?? [];

      _notifications = remoteNotifications.map((n) {
        if (readIds.contains(n.id)) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String _getNotificationTitleForType(String? type) {
    switch (type) {
      case 'quiz':
        return 'Quiz Completed';
      case 'chapter':
        return 'Chapter Finished';
      case 'achievement':
        return 'New Achievement!';
      case 'login':
        return 'Welcome Back';
      default:
        return 'Announcement';
    }
  }

  String _getNotificationMessage(Map<String, dynamic> activity) {
    final type = activity['type'];
    final xp = activity['xpGained'] ?? 0;

    if (type == 'quiz') {
      final score = activity['details']?['score'] ?? 0;
      return 'You scored $score% and earned $xp XP!';
    }
    if (type == 'chapter') {
      final title = activity['details']?['chapterTitle'] ?? 'a chapter';
      return 'Completed $title! +$xp XP';
    }
    return 'Activity logged. +$xp XP';
  }

  NotificationType _getNotificationType(String? type) {
    if (type == 'achievement') return NotificationType.achievement;
    if (type == 'quiz' || type == 'chapter') return NotificationType.activity;
    return NotificationType.general;
  }

  Future<void> markAsRead(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1 && !_notifications[index].isRead) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);

      final prefs = await SharedPreferences.getInstance();
      final readIds = prefs.getStringList('read_notification_ids') ?? [];
      readIds.add(id);
      await prefs.setStringList('read_notification_ids', readIds);

      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    final prefs = await SharedPreferences.getInstance();
    final readIds = prefs.getStringList('read_notification_ids') ?? [];

    for (int i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].isRead) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
        readIds.add(_notifications[i].id);
      }
    }

    await prefs.setStringList('read_notification_ids', readIds);
    notifyListeners();
  }
}
