import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/review.dart';
import '../providers/repository_providers.dart';
import '../providers/auth_provider.dart';

final userReviewsProvider = FutureProvider.family<List<Review>, String>((ref, userId) async {
  final reviewRepository = ref.watch(reviewRepositoryProvider);
  return await reviewRepository.getReviewsByUser(userId);
});

final questionReviewsProvider = FutureProvider.family<List<Review>, String>((ref, questionId) async {
  final reviewRepository = ref.watch(reviewRepositoryProvider);
  return await reviewRepository.getReviewsByQuestion(questionId);
});

final currentUserReviewsProvider = FutureProvider<List<Review>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  
  final reviewRepository = ref.watch(reviewRepositoryProvider);
  return await reviewRepository.getReviewsByUser(user.id);
});
