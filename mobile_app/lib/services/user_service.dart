import '../models/user.dart';
import 'api_client.dart';

Future<ApiResponse> fetchProfile() async {
  final res = await apiClient.get('/api/users/me');
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final userMap = d['user'] as Map<String, dynamic>?;
    if (userMap != null) {
      return ApiResponse.success(User.fromJson(userMap));
    }
  }
  return res;
}

Future<ApiResponse> updateProfile({String? displayName}) async {
  final body = <String, dynamic>{};
  if (displayName != null) body['display_name'] = displayName;
  final res = await apiClient.patch('/api/users/me', body: body.isNotEmpty ? body : null);
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final userMap = d['user'] as Map<String, dynamic>?;
    if (userMap != null) {
      return ApiResponse.success(User.fromJson(userMap));
    }
  }
  return res;
}
