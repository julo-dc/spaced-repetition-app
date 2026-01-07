class Review {
  final String id;
  final String userId;
  final String questionId;
  final bool isCorrect;
  final int timeTakenSeconds;
  final int hintsUsed;
  final DateTime reviewedAt;

  Review({
    required this.id,
    required this.userId,
    required this.questionId,
    required this.isCorrect,
    required this.timeTakenSeconds,
    required this.hintsUsed,
    required this.reviewedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      questionId: json['question_id'] as String,
      isCorrect: json['is_correct'] as bool,
      timeTakenSeconds: json['time_taken_seconds'] as int,
      hintsUsed: json['hints_used'] as int? ?? 0,
      reviewedAt: DateTime.parse(json['reviewed_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'question_id': questionId,
      'is_correct': isCorrect,
      'time_taken_seconds': timeTakenSeconds,
      'hints_used': hintsUsed,
      'reviewed_at': reviewedAt.toIso8601String(),
    };
  }

  Review copyWith({
    String? id,
    String? userId,
    String? questionId,
    bool? isCorrect,
    int? timeTakenSeconds,
    int? hintsUsed,
    DateTime? reviewedAt,
  }) {
    return Review(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      questionId: questionId ?? this.questionId,
      isCorrect: isCorrect ?? this.isCorrect,
      timeTakenSeconds: timeTakenSeconds ?? this.timeTakenSeconds,
      hintsUsed: hintsUsed ?? this.hintsUsed,
      reviewedAt: reviewedAt ?? this.reviewedAt,
    );
  }
}
