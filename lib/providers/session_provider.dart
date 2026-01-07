import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/question.dart';
import '../models/topic.dart';
import '../providers/repository_providers.dart';
import '../repositories/question_repository.dart';

class SessionState {
  final Topic? currentTopic;
  final List<Question> questions;
  final int currentQuestionIndex;
  final Map<String, bool> userAnswers;
  final bool isLoading;
  final String? error;

  SessionState({
    this.currentTopic,
    this.questions = const [],
    this.currentQuestionIndex = 0,
    this.userAnswers = const {},
    this.isLoading = false,
    this.error,
  });

  SessionState copyWith({
    Topic? currentTopic,
    List<Question>? questions,
    int? currentQuestionIndex,
    Map<String, bool>? userAnswers,
    bool? isLoading,
    String? error,
  }) {
    return SessionState(
      currentTopic: currentTopic ?? this.currentTopic,
      questions: questions ?? this.questions,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      userAnswers: userAnswers ?? this.userAnswers,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  Question? get currentQuestion {
    if (questions.isEmpty || currentQuestionIndex >= questions.length) {
      return null;
    }
    return questions[currentQuestionIndex];
  }

  bool get isSessionComplete => currentQuestionIndex >= questions.length;

  int get questionsAnswered => userAnswers.length;

  int get correctAnswers => userAnswers.values.where((isCorrect) => isCorrect).length;
}

class SessionNotifier extends StateNotifier<SessionState> {
  final QuestionRepository _questionRepository;

  SessionNotifier(this._questionRepository) : super(SessionState());

  Future<void> startSession(Topic topic) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final questions = await _questionRepository.getQuestionsForSession(topic.id);
      state = SessionState(
        currentTopic: topic,
        questions: questions,
        currentQuestionIndex: 0,
        userAnswers: {},
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void answerQuestion(String questionId, bool isCorrect) {
    final updatedAnswers = Map<String, bool>.from(state.userAnswers);
    updatedAnswers[questionId] = isCorrect;

    state = state.copyWith(userAnswers: updatedAnswers);
  }

  void nextQuestion() {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      state = state.copyWith(
        currentQuestionIndex: state.currentQuestionIndex + 1,
      );
    } else {
      // Move to completion state
      state = state.copyWith(
        currentQuestionIndex: state.questions.length,
      );
    }
  }

  void previousQuestion() {
    if (state.currentQuestionIndex > 0) {
      state = state.copyWith(
        currentQuestionIndex: state.currentQuestionIndex - 1,
      );
    }
  }

  void resetSession() {
    state = SessionState();
  }
}

final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
  final questionRepository = ref.watch(questionRepositoryProvider);
  return SessionNotifier(questionRepository);
});
