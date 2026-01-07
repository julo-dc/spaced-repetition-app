import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/review.dart';

class ReviewRepository {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<void> submitReview(Review review) async {
    try {
      await _supabase.from('reviews').insert(review.toJson());
    } catch (e) {
      throw Exception('Failed to submit review: $e');
    }
  }

  Future<List<Review>> getReviewsByUser(String userId) async {
    try {
      final response = await _supabase
          .from('reviews')
          .select()
          .eq('user_id', userId)
          .order('reviewed_at', ascending: false);

      final reviews = (response as List)
          .map((json) => Review.fromJson(json as Map<String, dynamic>))
          .toList();

      return reviews;
    } catch (e) {
      throw Exception('Failed to fetch reviews: $e');
    }
  }

  Future<List<Review>> getReviewsByQuestion(String questionId) async {
    try {
      final response = await _supabase
          .from('reviews')
          .select()
          .eq('question_id', questionId)
          .order('reviewed_at', ascending: false);

      final reviews = (response as List)
          .map((json) => Review.fromJson(json as Map<String, dynamic>))
          .toList();

      return reviews;
    } catch (e) {
      throw Exception('Failed to fetch reviews: $e');
    }
  }
}
