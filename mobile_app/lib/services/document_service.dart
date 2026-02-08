import '../models/document.dart';
import 'api_client.dart';

final _api = apiClient;

Future<ApiResponse> fetchDocuments({String? status, int page = 1, int limit = 20}) async {
  final queries = <String>[];
  if (status != null) queries.add('status=$status');
  queries.add('page=$page');
  queries.add('limit=$limit');
  final path = '/api/documents?${queries.join('&')}';
  final res = await _api.get(path);
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final items = (d['items'] as List<dynamic>?)?.map((e) => Document.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    final pagination = d['pagination'] as Map<String, dynamic>?;
    return ApiResponse.success({
      'items': items,
      'pagination': pagination,
    });
  }
  return res;
}

Future<ApiResponse> fetchDocument(String id) async {
  final res = await _api.get('/api/documents/$id');
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final docMap = d['document'] as Map<String, dynamic>?;
    if (docMap != null) {
      return ApiResponse.success(Document.fromJson(docMap));
    }
  }
  return res;
}

Future<ApiResponse> uploadDocument(String filePath, String fileName) async {
  return _api.uploadFile('/api/documents/upload', filePath, fileName);
}
