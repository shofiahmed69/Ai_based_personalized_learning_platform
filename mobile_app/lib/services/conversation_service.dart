import '../models/conversation.dart';
import 'api_client.dart';

final _api = apiClient;

Future<ApiResponse> fetchConversations({int limit = 20}) async {
  final res = await _api.get('/api/conversations?limit=$limit');
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final raw = d['conversations'] as List<dynamic>?;
    final items = raw?.map((e) => Conversation.fromJson(e as Map<String, dynamic>)).toList() ?? <Conversation>[];
    return ApiResponse.success(items);
  }
  return res;
}

Future<ApiResponse> createConversation({String? title}) async {
  return _api.post('/api/conversations', body: {if (title != null) 'title': title});
}

Future<ApiResponse> fetchConversation(String id, {int limit = 50}) async {
  final res = await _api.get('/api/conversations/$id?limit=$limit');
  if (res.success && res.data != null) {
    final d = res.data as Map<String, dynamic>;
    final convData = d['conversation'];
    final msgData = d['messages'];
    final conv = convData != null ? Conversation.fromJson(convData as Map<String, dynamic>) : null;
    final messages = (msgData as List<dynamic>?)?.map((e) => Message.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    return ApiResponse.success({'conversation': conv, 'messages': messages});
  }
  return res;
}

Future<ApiResponse> sendMessage(String conversationId, String content) async {
  return _api.post('/api/conversations/$conversationId/messages', body: {
    'role': 'user',
    'content': content,
  });
}
