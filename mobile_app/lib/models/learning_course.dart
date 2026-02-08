class LearningCourse {
  final String videoId;
  final String title;
  final String channelTitle;
  final String thumbnailUrl;
  final String url;

  LearningCourse({
    required this.videoId,
    required this.title,
    required this.channelTitle,
    required this.thumbnailUrl,
    required this.url,
  });

  factory LearningCourse.fromJson(Map<String, dynamic> json) {
    final thumb = (json['thumbnailUrl'] as String?) ?? (json['thumbnail_url'] as String?) ?? '';
    return LearningCourse(
      videoId: (json['videoId'] as String?) ?? (json['video_id'] as String?) ?? '',
      title: (json['title'] as String?) ?? 'Video',
      channelTitle: (json['channelTitle'] as String?) ?? (json['channel_title'] as String?) ?? '',
      thumbnailUrl: thumb.startsWith('//') ? 'https:$thumb' : (thumb.isEmpty ? '' : thumb),
      url: (json['url'] as String?) ?? '',
    );
  }
}
