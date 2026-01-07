import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/topic_repository.dart';
import '../repositories/question_repository.dart';
import '../repositories/review_repository.dart';

final topicRepositoryProvider = Provider<TopicRepository>((ref) {
  return TopicRepository();
});

final questionRepositoryProvider = Provider<QuestionRepository>((ref) {
  return QuestionRepository();
});

final reviewRepositoryProvider = Provider<ReviewRepository>((ref) {
  return ReviewRepository();
});
