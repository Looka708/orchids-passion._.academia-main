import 'dart:async';
import 'package:flutter/material.dart';
import 'package:passion_academia/models/notification.dart';
import 'package:passion_academia/core/services/firebase_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:passion_academia/core/services/local_notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  bool _isLoading = false;
  Timer? _pollingTimer;
  String? _currentEmail;
  String? _currentToken;

  List<AppNotification> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  NotificationProvider() {
    // Optionally start a minimal poll or wait for login
  }

  void startRealTimePolling(String email, String token) {
    _currentEmail = email;
    _currentToken = token;
    _pollingTimer?.cancel();

    // Initial fetch
    fetchNotifications(email, token);

    // Check for new broadcasts/activities every 30 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_currentEmail != null && _currentToken != null) {
        fetchNotifications(_currentEmail!, _currentToken!, isBackground: true);
      }
    });
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _currentEmail = null;
    _currentToken = null;
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> fetchNotifications(String email, String token,
      {bool isBackground = false}) async {
    if (!isBackground) {
      _isLoading = true;
      notifyListeners();
    }
    try {
      // 1. Fetch user specific activities
      final activities = await FirebaseService.getUserActivities(email, token);

      // 2. NEW: Fetch central broadcasts (scheduled)
      final broadcasts = await FirebaseService.fetchBroadcasts();

      final List<AppNotification> userNotifications = activities.map((a) {
        final details = a['details'] as Map<String, dynamic>?;
        final isGlobal = details?['isGlobal'] == true;

        return AppNotification(
          id: a['id'],
          title: isGlobal
              ? (details?['title'] ?? 'Announcement')
              : _getNotificationTitleForType(a['type']),
          message: isGlobal
              ? (details?['message'] ?? '')
              : _getNotificationMessage(a),
          type: _getNotificationType(a['type']),
          timestamp: DateTime.parse(a['timestamp']),
          isRead: false,
        );
      }).toList();

      // Convert broadcasts to notifications (Filter by scheduled time)
      final now = DateTime.now();
      final List<AppNotification> broadcastNotifications =
          broadcasts.where((b) {
        final scheduledAt = DateTime.parse(b['scheduledAt']);
        return scheduledAt.isBefore(now);
      }).map((b) {
        return AppNotification(
          id: 'bc_${b['id']}',
          title: b['title'] ?? 'Announcement',
          message: b['message'] ?? '',
          type: _getNotificationType(b['type']),
          timestamp: DateTime.parse(b['scheduledAt']),
          isRead: false,
        );
      }).toList();

      final allNotifications = [
        ...userNotifications,
        ...broadcastNotifications
      ];
      // Sort by timestamp descending
      allNotifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));

      // 3. Load read status from local storage
      final prefs = await SharedPreferences.getInstance();
      final readIds = prefs.getStringList('read_notification_ids') ?? [];

      _notifications = allNotifications.map((n) {
        if (readIds.contains(n.id)) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();

      // NEW: Trigger local notifications for new items
      final lastNotificationId = prefs.getString('last_notification_id');
      if (allNotifications.isNotEmpty &&
          allNotifications.first.id != lastNotificationId) {
        // Find how many are newer than the last one we saw
        final newItems = lastNotificationId == null
            ? [allNotifications.first]
            : allNotifications
                .takeWhile((n) => n.id != lastNotificationId)
                .toList();

        for (var item in newItems) {
          LocalNotificationService.showNotification(
            id: item.id.hashCode,
            title: item.title,
            body: item.message,
          );
        }

        await prefs.setString(
            'last_notification_id', allNotifications.first.id);
      }
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
