class Question {
  final String id;
  final String topicId;
  final Map<String, dynamic> content;
  final List<String>? hints;
  final Map<String, dynamic>? fullSolution;
  final int difficultyLevel;
  final int timesShown;
  final int timesCorrect;
  final DateTime createdAt;

  Question({
    required this.id,
    required this.topicId,
    required this.content,
    this.hints,
    this.fullSolution,
    required this.difficultyLevel,
    required this.timesShown,
    required this.timesCorrect,
    required this.createdAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] as String,
      topicId: json['topic_id'] as String,
      content: json['content'] as Map<String, dynamic>,
      hints: json['hints'] != null
          ? List<String>.from(json['hints'] as List)
          : null,
      fullSolution: json['full_solution'] as Map<String, dynamic>?,
      difficultyLevel: json['difficulty_level'] as int? ?? 1,
      timesShown: json['times_shown'] as int? ?? 0,
      timesCorrect: json['times_correct'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'topic_id': topicId,
      'content': content,
      'hints': hints,
      'full_solution': fullSolution,
      'difficulty_level': difficultyLevel,
      'times_shown': timesShown,
      'times_correct': timesCorrect,
      'created_at': createdAt.toIso8601String(),
    };
  }

  Question copyWith({
    String? id,
    String? topicId,
    Map<String, dynamic>? content,
    List<String>? hints,
    Map<String, dynamic>? fullSolution,
    int? difficultyLevel,
    int? timesShown,
    int? timesCorrect,
    DateTime? createdAt,
  }) {
    return Question(
      id: id ?? this.id,
      topicId: topicId ?? this.topicId,
      content: content ?? this.content,
      hints: hints ?? this.hints,
      fullSolution: fullSolution ?? this.fullSolution,
      difficultyLevel: difficultyLevel ?? this.difficultyLevel,
      timesShown: timesShown ?? this.timesShown,
      timesCorrect: timesCorrect ?? this.timesCorrect,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
