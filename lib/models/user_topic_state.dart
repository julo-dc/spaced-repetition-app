class UserTopicState {
  final String userId;
  final String topicId;
  final double masteryScore;
  final DateTime nextReviewAt;

  UserTopicState({
    required this.userId,
    required this.topicId,
    required this.masteryScore,
    required this.nextReviewAt,
  });

  factory UserTopicState.fromJson(Map<String, dynamic> json) {
    return UserTopicState(
      userId: json['user_id'] as String,
      topicId: json['topic_id'] as String,
      masteryScore: (json['mastery_score'] as num).toDouble(),
      nextReviewAt: DateTime.parse(json['next_review_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'topic_id': topicId,
      'mastery_score': masteryScore,
      'next_review_at': nextReviewAt.toIso8601String(),
    };
  }

  UserTopicState copyWith({
    String? userId,
    String? topicId,
    double? masteryScore,
    DateTime? nextReviewAt,
  }) {
    return UserTopicState(
      userId: userId ?? this.userId,
      topicId: topicId ?? this.topicId,
      masteryScore: masteryScore ?? this.masteryScore,
      nextReviewAt: nextReviewAt ?? this.nextReviewAt,
    );
  }
}
