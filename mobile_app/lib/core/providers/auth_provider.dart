import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  bool get isAuthenticated => _isAuthenticated;

  String? _userName;
  String? get userName => _userName;

  Future<bool> login(String email, String password) async {
    // Mock login delay
    await Future.delayed(const Duration(seconds: 1));
    _isAuthenticated = true;
    _userName = 'Student';
    notifyListeners();
    return true;
  }

  Future<bool> signup(String name, String email, String password) async {
    await Future.delayed(const Duration(seconds: 1));
    _isAuthenticated = true;
    _userName = name;
    notifyListeners();
    return true;
  }

  void logout() {
    _isAuthenticated = false;
    _userName = null;
    notifyListeners();
  }
}
