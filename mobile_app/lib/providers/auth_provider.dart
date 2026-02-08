import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _auth = AuthService();

  User? _user;
  bool _isLoading = true;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();
    final hasToken = await _auth.loadStoredAuth();
    if (hasToken) {
      _user = await _auth.getStoredUser();
      _isAuthenticated = _user != null;
    } else {
      _isAuthenticated = false;
      _user = null;
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    final res = await _auth.login(email, password);
    if (res.success) {
      _user = await _auth.getStoredUser();
      _isAuthenticated = true;
      notifyListeners();
      return null;
    }
    return res.error ?? 'Login failed';
  }

  Future<String?> register(String email, String password, {String? displayName}) async {
    final res = await _auth.register(email, password, displayName: displayName);
    if (res.success) {
      _user = await _auth.getStoredUser();
      _isAuthenticated = true;
      notifyListeners();
      return null;
    }
    return res.error ?? 'Registration failed';
  }

  Future<void> logout() async {
    await _auth.logout();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
