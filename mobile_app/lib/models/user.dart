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

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        email: json['email'] as String,
        displayName: json['display_name'] as String?,
        avatarUrl: json['avatar_url'] as String?,
        preferredLanguage: json['preferred_language'] as String? ?? 'en',
        createdAt: json['created_at'] as String,
        updatedAt: json['updated_at'] as String,
      );

  String get displayLabel => displayName ?? email.split('@').first;
}
