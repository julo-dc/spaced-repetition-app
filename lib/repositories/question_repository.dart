import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/question.dart';

class QuestionRepository {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<List<Question>> getQuestionsForSession(String topicId) async {
    try {
      final response = await _supabase
          .from('questions')
          .select()
          .eq('topic_id', topicId)
          .limit(5);

      final questions = (response as List)
          .map((json) => Question.fromJson(json as Map<String, dynamic>))
          .toList();

      if (questions.isEmpty) {
        throw Exception('No questions found for this topic');
      }

      return questions;
    } catch (e) {
      print('Failed to fetch questions: $e');
      
      // Fallback: Return hardcoded questions for testing
      print('Using fallback hardcoded questions');
      return [
        Question(
          id: '1',
          topicId: topicId,
          content: {
            'statement': r'Find the derivative of f(x) = \sin(x^2)',
            'options': [
              {'id': 'a', 'latex': r'2x\cos(x^2)', 'is_correct': true},
              {'id': 'b', 'latex': r'\cos(x^2)', 'is_correct': false},
              {'id': 'c', 'latex': r'2x\sin(x^2)', 'is_correct': false},
              {'id': 'd', 'latex': r'-2x\cos(x^2)', 'is_correct': false}
            ],
            'solution_steps': [
              'Step 1: Identify inner function u = x^2 and outer function sin(u)',
              'Step 2: Apply Chain Rule: (f ∘ g)\'(x) = f\'(g(x)) · g\'(x)',
              'Step 3: f\'(u) = cos(u) and g\'(x) = 2x',
              'Step 4: Result: 2x·cos(x^2)'
            ]
          },
          hints: null,
          fullSolution: null,
          difficultyLevel: 1,
          timesShown: 0,
          timesCorrect: 0,
          createdAt: DateTime.now(),
        ),
        Question(
          id: '2',
          topicId: topicId,
          content: {
            'statement': r'Find the derivative of f(x) = \cos(3x)',
            'options': [
              {'id': 'a', 'latex': r'-3\sin(3x)', 'is_correct': true},
              {'id': 'b', 'latex': r'\sin(3x)', 'is_correct': false},
              {'id': 'c', 'latex': r'3\cos(3x)', 'is_correct': false},
              {'id': 'd', 'latex': r'-\sin(3x)', 'is_correct': false}
            ],
            'solution_steps': [
              'Step 1: Identify inner function u = 3x and outer function cos(u)',
              'Step 2: Apply Chain Rule: (f ∘ g)\'(x) = f\'(g(x)) · g\'(x)',
              'Step 3: f\'(u) = -sin(u) and g\'(x) = 3',
              'Step 4: Result: -3·sin(3x)'
            ]
          },
          hints: null,
          fullSolution: null,
          difficultyLevel: 1,
          timesShown: 0,
          timesCorrect: 0,
          createdAt: DateTime.now(),
        ),
        Question(
          id: '3',
          topicId: topicId,
          content: {
            'statement': r'Find the derivative of f(x) = e^{2x}',
            'options': [
              {'id': 'a', 'latex': r'2e^{2x}', 'is_correct': true},
              {'id': 'b', 'latex': r'e^{2x}', 'is_correct': false},
              {'id': 'c', 'latex': r'2xe^{2x}', 'is_correct': false},
              {'id': 'd', 'latex': r'-2e^{2x}', 'is_correct': false}
            ],
            'solution_steps': [
              'Step 1: Identify inner function u = 2x and outer function e^u',
              'Step 2: Apply Chain Rule: (f ∘ g)\'(x) = f\'(g(x)) · g\'(x)',
              'Step 3: f\'(u) = e^u and g\'(x) = 2',
              'Step 4: Result: 2·e^(2x)'
            ]
          },
          hints: null,
          fullSolution: null,
          difficultyLevel: 1,
          timesShown: 0,
          timesCorrect: 0,
          createdAt: DateTime.now(),
        ),
        Question(
          id: '4',
          topicId: topicId,
          content: {
            'statement': r'Find the derivative of f(x) = \ln(x^2)',
            'options': [
              {'id': 'a', 'latex': r'\frac{2}{x}', 'is_correct': true},
              {'id': 'b', 'latex': r'\frac{1}{x}', 'is_correct': false},
              {'id': 'c', 'latex': r'2x', 'is_correct': false},
              {'id': 'd', 'latex': r'\ln(x)', 'is_correct': false}
            ],
            'solution_steps': [
              'Step 1: Rewrite as ln(x^2) = 2*ln(x)',
              'Step 2: Derivative of ln(x) is 1/x',
              'Step 3: Apply constant multiple rule',
              'Step 4: Result: 2*(1/x) = 2/x'
            ]
          },
          hints: null,
          fullSolution: null,
          difficultyLevel: 1,
          timesShown: 0,
          timesCorrect: 0,
          createdAt: DateTime.now(),
        ),
        Question(
          id: '5',
          topicId: topicId,
          content: {
            'statement': r'Find the derivative of f(x) = (x^3 + 2x)^2',
            'options': [
              {'id': 'a', 'latex': r'2(x^3 + 2x)(3x^2 + 2)', 'is_correct': true},
              {'id': 'b', 'latex': r'(x^3 + 2x)(3x^2 + 2)', 'is_correct': false},
              {'id': 'c', 'latex': r'2(3x^2 + 2)', 'is_correct': false},
              {'id': 'd', 'latex': r'3x^2 + 2', 'is_correct': false}
            ],
            'solution_steps': [
              'Step 1: Identify inner function u = x^3 + 2x and outer function u^2',
              'Step 2: Apply Chain Rule: (f ∘ g)\'(x) = f\'(g(x)) · g\'(x)',
              'Step 3: f\'(u) = 2u and g\'(x) = 3x^2 + 2',
              'Step 4: Result: 2*(x^3 + 2x)*(3x^2 + 2)'
            ]
          },
          hints: null,
          fullSolution: null,
          difficultyLevel: 1,
          timesShown: 0,
          timesCorrect: 0,
          createdAt: DateTime.now(),
        ),
      ];
    }
  }

  Future<Question?> getQuestionById(String id) async {
    try {
      final response = await _supabase
          .from('questions')
          .select()
          .eq('id', id)
          .single();

      return Question.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to fetch question: $e');
    }
  }

  Future<void> incrementQuestionStats(String questionId, bool isCorrect) async {
    try {
      final question = await getQuestionById(questionId);
      if (question == null) return;

      await _supabase.from('questions').update({
        'times_shown': question.timesShown + 1,
        'times_correct': isCorrect ? question.timesCorrect + 1 : question.timesCorrect,
      }).eq('id', questionId);
    } catch (e) {
      throw Exception('Failed to update question stats: $e');
    }
  }
}
