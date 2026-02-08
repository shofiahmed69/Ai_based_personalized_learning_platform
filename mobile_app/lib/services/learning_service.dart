import 'api_client.dart';

Future<ApiResponse> fetchLearningCourses() async {
  final res = await apiClient.get('/api/learning/courses');
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final raw = d['courses'] as List<dynamic>?;
    final courses = raw?.map((e) => e as Map<String, dynamic>).toList() ?? [];
    return ApiResponse.success(courses);
  }
  return res;
}

Future<ApiResponse> searchLearningCourses(String query) async {
  final q = Uri.encodeComponent(query.trim());
  if (q.isEmpty) return ApiResponse.success(<Map<String, dynamic>>[]);
  final res = await apiClient.get('/api/learning/search?q=$q');
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final raw = d['courses'] as List<dynamic>?;
    final courses = raw?.map((e) => e as Map<String, dynamic>).toList() ?? [];
    return ApiResponse.success(courses);
  }
  return res;
}
