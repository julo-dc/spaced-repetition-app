import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/topic.dart';

class TopicRepository {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<List<Topic>> fetchRootTopics() async {
    try {
      print('Fetching root topics...');
      // For now, just fetch all topics since we only have a few
      final data = await _supabase
          .from('topics')
          .select()
          .order('name');

      print('Supabase raw data: $data');
      print('Data type: ${data.runtimeType}');

      // Supabase v2 returns the data directly, not wrapped
      if (data == null) {
        print('Data is null, returning empty list');
        return [];
      }

      // Check if it's already a list
      if (data is! List) {
        print('Data is not a List, it is: ${data.runtimeType}');
        print('Data content: $data');
        return [];
      }

      final dataList = data as List;
      
      if (dataList.isEmpty) {
        print('Data list is empty');
        return [];
      }

      print('Processing ${dataList.length} topics');
      final topics = dataList
          .map((json) {
            print('Topic JSON: $json');
            return Topic.fromJson(json as Map<String, dynamic>);
          })
          .toList();

      print('Successfully loaded ${topics.length} topics');
      return topics;
    } catch (e, stackTrace) {
      print('Error in fetchRootTopics: $e');
      print('Stack trace: $stackTrace');
      
      // Fallback: Return hardcoded topic for testing
      print('Using fallback hardcoded data');
      return [
        Topic(
          id: '7e5718c9-00ad-4064-94fa-b42913cfda09',
          name: 'Chain Rule',
          slug: 'chain-rule',
          parentId: null,
        ),
      ];
    }
  }

  Future<List<Topic>> fetchAllTopics() async {
    try {
      print('Fetching all topics...');
      final response = await _supabase
          .from('topics')
          .select()
          .order('name');
      
      print('Supabase response in fetchAllTopics: $response');
      print('Response type in fetchAllTopics: ${response.runtimeType}');
      
      // Handle null response
      if (response == null) {
        print('Response is null in fetchAllTopics, returning empty list');
        return [];
      }

      // Handle empty response
      if (response is List && response.isEmpty) {
        print('Response is empty list in fetchAllTopics, returning empty list');
        return [];
      }

      // Convert to list if it's not already
      List<dynamic> dataList;
      if (response is List) {
        dataList = response;
      } else {
        print('Response is not a list in fetchAllTopics, converting: ${response.runtimeType}');
        return [];
      }

      final topics = dataList
          .map((json) {
            print('Processing topic: $json in fetchAllTopics');
            return Topic.fromJson(json as Map<String, dynamic>);
          })
          .toList();

      print('Found ${topics.length} topics in fetchAllTopics');
      return topics;
    } catch (e) {
      print('Error in fetchAllTopics: $e');
      return [];
    }
  }

  Future<Topic?> fetchTopicById(String id) async {
    try {
      final response = await _supabase
          .from('topics')
          .select()
          .eq('id', id)
          .single();

      return Topic.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to fetch topic: $e');
    }
  }
}
