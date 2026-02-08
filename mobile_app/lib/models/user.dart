class User {
  final String id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final String preferredLanguage;
  final String createdAt;
  final String updatedAt;

  User({
    required this.id,
    required this.email,
    this.displayName,
    this.avatarUrl,
    this.preferredLanguage = 'en',
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final createdAt = json['created_at'];
    final updatedAt = json['updated_at'];
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['display_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      preferredLanguage: json['preferred_language'] as String? ?? 'en',
      createdAt: createdAt != null ? createdAt.toString() : DateTime.now().toIso8601String(),
      updatedAt: updatedAt != null ? updatedAt.toString() : (createdAt?.toString() ?? DateTime.now().toIso8601String()),
    );
  }

  String get displayLabel => displayName ?? email.split('@').first;
}
