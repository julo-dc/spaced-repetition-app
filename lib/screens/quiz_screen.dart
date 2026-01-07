import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/session_provider.dart';
import '../widgets/math_display.dart';
import '../widgets/question_text_widget.dart';

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key});

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  String? selectedOptionId;
  bool hasAnswered = false;

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(sessionProvider);

    if (sessionState.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (sessionState.error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Quiz'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Error: ${sessionState.error}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    if (sessionState.currentQuestion == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Quiz'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, size: 64, color: Colors.green),
              const SizedBox(height: 16),
              const Text(
                'No questions available',
                style: TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    if (sessionState.isSessionComplete) {
      return _buildSessionCompleteScreen(context, sessionState);
    }

    final question = sessionState.currentQuestion!;
    final content = question.content;
    final statement = content['statement'] as String? ?? '';
    final options = (content['options'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(sessionState.currentTopic?.name ?? 'Quiz'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            ref.read(sessionProvider.notifier).resetSession();
            context.go('/');
          },
        ),
      ),
      body: Column(
        children: [
          _buildAnimatedProgressBar(sessionState),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          Text(
                            'Question ${sessionState.currentQuestionIndex + 1}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          QuestionText(
                            text: statement,
                            fontSize: 22,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Select an answer:',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...options.asMap().entries.map((entry) {
                    final index = entry.key;
                    final option = entry.value;
                    return _buildOptionCard(option, index);
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedProgressBar(SessionState sessionState) {
    final progress = (sessionState.currentQuestionIndex + 1) / sessionState.questions.length;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${sessionState.currentQuestionIndex + 1} of ${sessionState.questions.length}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TweenAnimationBuilder<double>(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            tween: Tween<double>(
              begin: 0,
              end: progress,
            ),
            builder: (context, value, _) => LinearProgressIndicator(
              value: value,
              backgroundColor: Colors.grey[300],
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionCard(Map<String, dynamic> option, int index) {
    final optionId = option['id'] as String;
    final latexContent = option['latex'] as String;
    final isSelected = selectedOptionId == optionId;
    final isCorrect = option['is_correct'] == true;

    final letters = ['A', 'B', 'C', 'D'];
    final letter = letters[index];

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        elevation: isSelected ? 4 : 1,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: hasAnswered ? null : () => _handleOptionSelected(optionId, isCorrect),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(
                color: isSelected 
                    ? Theme.of(context).colorScheme.primary
                    : Colors.grey[300]!,
                width: isSelected ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[200],
                  ),
                  child: Center(
                    child: Text(
                      letter,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : Colors.black87,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OptionText(
                    latex: latexContent,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleOptionSelected(String optionId, bool isCorrect) {
    setState(() {
      selectedOptionId = optionId;
      hasAnswered = true;
    });

    final currentQuestion = ref.read(sessionProvider).currentQuestion;
    if (currentQuestion != null) {
      ref.read(sessionProvider.notifier).answerQuestion(currentQuestion.id, isCorrect);
    }

    // Show feedback modal bottom sheet
    _showFeedbackBottomSheet(isCorrect);
  }

  void _showFeedbackBottomSheet(bool isCorrect) {
    final sessionState = ref.read(sessionProvider);
    final question = sessionState.currentQuestion;
    if (question == null) return;

    final content = question.content;
    final options = (content['options'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final correctOption = options.firstWhere((opt) => opt['is_correct'] == true);
    final solutionSteps = (content['solution_steps'] as List?)?.cast<String>() ?? [];

    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: isCorrect ? Colors.green[50] : Colors.red[50],
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isCorrect ? Icons.check_circle : Icons.cancel,
                  color: isCorrect ? Colors.green : Colors.red,
                  size: 64,
                ),
                const SizedBox(height: 16),
                Text(
                  isCorrect ? 'Correct!' : 'Incorrect',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: isCorrect ? Colors.green[700] : Colors.red[700],
                  ),
                ),
                const SizedBox(height: 24),
                if (!isCorrect) ...[
                  const Text(
                    'The correct answer is:',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green, width: 2),
                    ),
                    child: OptionText(
                      latex: correctOption['latex'] as String,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (solutionSteps.isNotEmpty) ...[
                    const Text(
                      'Solution Steps:',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...solutionSteps.asMap().entries.map((entry) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              child: Center(
                                child: Text(
                                  '${entry.key + 1}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                entry.value,
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ],
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _handleContinue,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text(
                      'Continue',
                      style: TextStyle(fontSize: 18),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleContinue() {
    Navigator.of(context).pop(); // Close modal
    ref.read(sessionProvider.notifier).nextQuestion();
    setState(() {
      selectedOptionId = null;
      hasAnswered = false;
    });
  }

  Widget _buildSessionCompleteScreen(BuildContext context, SessionState sessionState) {
    final correctCount = sessionState.correctAnswers;
    final totalCount = sessionState.questions.length;
    final percentage = (correctCount / totalCount * 100).toInt();

    Color scoreColor;
    String message;
    if (percentage >= 80) {
      scoreColor = Colors.green;
      message = 'Excellent work!';
    } else if (percentage >= 60) {
      scoreColor = Colors.orange;
      message = 'Good job!';
    } else {
      scoreColor = Colors.red;
      message = 'Keep practicing!';
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Session Complete'),
        automaticallyImplyLeading: false,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.celebration_rounded,
                size: 100,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 24),
              const Text(
                'Session Complete!',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 32),
              Card(
                elevation: 8,
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Text(
                        '$correctCount / $totalCount',
                        style: TextStyle(
                          fontSize: 56,
                          fontWeight: FontWeight.bold,
                          color: scoreColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$percentage% Correct',
                        style: TextStyle(
                          fontSize: 24,
                          color: Colors.grey[700],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        message,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: scoreColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    ref.read(sessionProvider.notifier).resetSession();
                    context.go('/');
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text(
                    'Back to Topics',
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
