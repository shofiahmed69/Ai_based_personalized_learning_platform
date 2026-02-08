class Document {
  final String id;
  final String title;
  final String originalFilename;
  final String fileType;
  final int? fileSizeBytes;
  final String status;
  final String? summary;
  final List<dynamic>? learningCourses;
  final String? errorMessage;
  final String createdAt;
  final String? updatedAt;
  final String? indexedAt;

  Document({
    required this.id,
    required this.title,
    required this.originalFilename,
    required this.fileType,
    this.fileSizeBytes,
    required this.status,
    this.summary,
    this.learningCourses,
    this.errorMessage,
    required this.createdAt,
    this.updatedAt,
    this.indexedAt,
  });

  factory Document.fromJson(Map<String, dynamic> json) => Document(
        id: json['id'] as String,
        title: json['title'] as String,
        originalFilename: json['original_filename'] as String,
        fileType: json['file_type'] as String,
        fileSizeBytes: json['file_size_bytes'] as int?,
        status: json['status'] as String,
        summary: json['summary'] as String?,
        learningCourses: json['learning_courses'] as List<dynamic>?,
        errorMessage: json['error_message'] as String?,
        createdAt: json['created_at'] as String,
        updatedAt: json['updated_at'] as String?,
        indexedAt: json['indexed_at'] as String?,
      );

  String get statusDisplay {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'EXTRACTING':
        return 'Extracting';
      case 'CHUNKING':
        return 'Processing';
      case 'INDEXED':
        return 'Ready';
      case 'FAILED':
        return 'Failed';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return status;
    }
  }

  bool get isProcessing =>
      status == 'PENDING' || status == 'EXTRACTING' || status == 'CHUNKING';
}
