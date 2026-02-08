class Conversation {
  final String id;
  final String? title;
  final String createdAt;
  final String updatedAt;

  Conversation({
    required this.id,
    this.title,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) => Conversation(
        id: json['id'] as String,
        title: json['title'] as String?,
        createdAt: json['created_at'] as String,
        updatedAt: json['updated_at'] as String,
      );

  String get displayTitle => title ?? 'New chat';
}

class Message {
  final String id;
  final String conversationId;
  final String role;
  final String content;
  final List<dynamic>? sources;
  final List<dynamic>? memoriesUsed;
  final Map<String, dynamic>? groqUsage;
  final String createdAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.role,
    required this.content,
    this.sources,
    this.memoriesUsed,
    this.groqUsage,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['id'] as String,
        conversationId: json['conversation_id'] as String,
        role: json['role'] as String,
        content: json['content'] as String,
        sources: json['sources'] as List<dynamic>?,
        memoriesUsed: json['memories_used'] as List<dynamic>?,
        groqUsage: json['groq_usage'] as Map<String, dynamic>?,
        createdAt: json['created_at'] as String,
      );

  bool get isUser => role == 'user';
}
