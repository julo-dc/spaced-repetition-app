import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/topic.dart';
import '../providers/repository_providers.dart';

final rootTopicsProvider = FutureProvider<List<Topic>>((ref) async {
  final topicRepository = ref.watch(topicRepositoryProvider);
  return await topicRepository.fetchRootTopics();
});

final allTopicsProvider = FutureProvider<List<Topic>>((ref) async {
  final topicRepository = ref.watch(topicRepositoryProvider);
  return await topicRepository.fetchAllTopics();
});

final topicByIdProvider = FutureProvider.family<Topic?, String>((ref, topicId) async {
  final topicRepository = ref.watch(topicRepositoryProvider);
  return await topicRepository.fetchTopicById(topicId);
});
