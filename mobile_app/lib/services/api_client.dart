import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

final apiClient = ApiClient();

class ApiClient {
  final String baseUrl;
  String? _accessToken;
  Future<bool> Function()? _on401;

  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? kApiBaseUrl;

  void setToken(String? token) {
    _accessToken = token;
  }

  void setOn401Callback(Future<bool> Function()? callback) {
    _on401 = callback;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
      };

  Future<ApiResponse> get(String path) async {
    try {
      var res = await http
          .get(Uri.parse('$baseUrl$path'), headers: _headers)
          .timeout(const Duration(seconds: 30));
      var result = _handleResponse(res);
      if (result.statusCode == 401 &&
          path != '/api/auth/refresh' &&
          _on401 != null &&
          await _on401!()) {
        res = await http
            .get(Uri.parse('$baseUrl$path'), headers: _headers)
            .timeout(const Duration(seconds: 30));
        result = _handleResponse(res);
      }
      return result;
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> post(String path, {Map<String, dynamic>? body}) async {
    try {
      var res = await http
          .post(
            Uri.parse('$baseUrl$path'),
            headers: _headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 30));
      var result = _handleResponse(res);
      if (result.statusCode == 401 &&
          path != '/api/auth/refresh' &&
          _on401 != null &&
          await _on401!()) {
        res = await http
            .post(
              Uri.parse('$baseUrl$path'),
              headers: _headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(const Duration(seconds: 30));
        result = _handleResponse(res);
      }
      return result;
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> patch(String path, {Map<String, dynamic>? body}) async {
    try {
      var res = await http
          .patch(
            Uri.parse('$baseUrl$path'),
            headers: _headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 30));
      var result = _handleResponse(res);
      if (result.statusCode == 401 &&
          path != '/api/auth/refresh' &&
          _on401 != null &&
          await _on401!()) {
        res = await http
            .patch(
              Uri.parse('$baseUrl$path'),
              headers: _headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(const Duration(seconds: 30));
        result = _handleResponse(res);
      }
      return result;
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> delete(String path) async {
    try {
      var res = await http
          .delete(Uri.parse('$baseUrl$path'), headers: _headers)
          .timeout(const Duration(seconds: 30));
      var result = _handleResponse(res);
      if (result.statusCode == 401 &&
          path != '/api/auth/refresh' &&
          _on401 != null &&
          await _on401!()) {
        res = await http
            .delete(Uri.parse('$baseUrl$path'), headers: _headers)
            .timeout(const Duration(seconds: 30));
        result = _handleResponse(res);
      }
      return result;
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> uploadFile(String path, String filePath, String fileName) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl$path'),
      );
      request.headers['Authorization'] = 'Bearer $_accessToken';
      request.files.add(await http.MultipartFile.fromPath('file', filePath, filename: fileName));
      final streamed = await request.send().timeout(const Duration(minutes: 2));
      final res = await http.Response.fromStream(streamed);
      return _handleResponse(res);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  ApiResponse _handleResponse(http.Response res) {
    final body = res.body.isNotEmpty ? jsonDecode(res.body) : null;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return ApiResponse.success(body is Map ? body['data'] ?? body : body);
    }
    final msg = body is Map ? (body['message'] ?? body['error'] ?? res.body) : res.body;
    return ApiResponse.error(msg.toString(), statusCode: res.statusCode);
  }
}

class ApiResponse {
  final bool success;
  final dynamic data;
  final String? error;
  final int? statusCode;

  ApiResponse.success(this.data)
      : success = true,
        error = null,
        statusCode = null;

  ApiResponse.error(this.error, {this.statusCode})
      : success = false,
        data = null;
}
