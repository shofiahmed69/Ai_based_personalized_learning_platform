import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  static const _keyAccessToken = 'access_token';
  static const _keyRefreshToken = 'refresh_token';
  static const _keyUser = 'user';

  final ApiClient _api = apiClient;

  Future<ApiResponse> login(String email, String password) async {
    final res = await _api.post('/api/auth/login', body: {
      'email': email,
      'password': password,
    });
    if (res.success && res.data != null) {
      await _saveAuth(res.data as Map<String, dynamic>);
    }
    return res;
  }

  Future<ApiResponse> register(String email, String password, {String? displayName}) async {
    final res = await _api.post('/api/auth/register', body: {
      'email': email,
      'password': password,
      if (displayName != null && displayName.isNotEmpty) 'display_name': displayName,
    });
    if (res.success && res.data != null) {
      await _saveAuth(res.data as Map<String, dynamic>);
    }
    return res;
  }

  Future<void> _saveAuth(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final user = data['user'] as Map<String, dynamic>?;
    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;
    if (accessToken != null) {
      await prefs.setString(_keyAccessToken, accessToken);
      _api.setToken(accessToken);
    }
    if (refreshToken != null) await prefs.setString(_keyRefreshToken, refreshToken);
    if (user != null) await prefs.setString(_keyUser, jsonEncode(user));
  }

  Future<bool> loadStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_keyAccessToken);
    if (token != null) {
      _api.setToken(token);
      return true;
    }
    return false;
  }

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAccessToken);
  }

  Future<User?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(_keyUser);
    if (userStr == null) return null;
    try {
      final map = jsonDecode(userStr) as Map<String, dynamic>;
      return User.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyAccessToken);
    await prefs.remove(_keyRefreshToken);
    await prefs.remove(_keyUser);
    _api.setToken(null);
  }
}
