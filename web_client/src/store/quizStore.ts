import { create } from 'zustand';
import { Question, Topic } from '@/types/database';
import { 
  saveReviews, 
  getUserTopicState, 
  upsertUserTopicState,
  updateQuestionStats
} from '@/lib/api';
import { 
  processSessionResults, 
  getDifficultyRating, 
  getDefaultRating,
  type QuestionResult,
  type SessionResult
} from '@/lib/masteryAlgorithm';

interface QuizState {
  // Current session
  currentTopic: Topic | null;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Map<string, boolean>;
  questionStartTimes: Map<string, number>; // Track when each question was started
  questionTimes: Map<string, number>; // Track time taken for each question
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  sessionResult: SessionResult | null; // Store mastery calculation results
  
  // Actions
  startSession: (topic: Topic, questions: Question[]) => void;
  answerQuestion: (questionId: string, isCorrect: boolean) => void;
  nextQuestion: () => void;
  stopSession: () => void; // New: Stop quiz anytime
  resetSession: () => void;
  submitSessionResults: (userId: string) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  currentTopic: null,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: new Map(),
  questionStartTimes: new Map(),
  questionTimes: new Map(),
  isLoading: false,
  isSaving: false,
  error: null,
  sessionResult: null,

  // Actions
  startSession: (topic, questions) => {
    const startTimes = new Map<string, number>();
    if (questions.length > 0) {
      // Start timer for first question
      startTimes.set(questions[0].id, Date.now());
    }
    
    set({
      currentTopic: topic,
      questions,
      currentQuestionIndex: 0,
      userAnswers: new Map(),
      questionStartTimes: startTimes,
      questionTimes: new Map(),
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },

  answerQuestion: (questionId, isCorrect) => {
    const { userAnswers, questionStartTimes } = get();
    const startTime = questionStartTimes.get(questionId);
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, isCorrect);
    
    const newQuestionTimes = new Map(get().questionTimes);
    newQuestionTimes.set(questionId, timeTaken);
    
    set({ 
      userAnswers: newAnswers,
      questionTimes: newQuestionTimes
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      
      // Record start time for the next question
      const newStartTimes = new Map(get().questionStartTimes);
      newStartTimes.set(nextQuestion.id, Date.now());
      
      set({ 
        currentQuestionIndex: nextIndex,
        questionStartTimes: newStartTimes
      });
    }
    // Note: No automatic completion, user must explicitly stop
  },

  stopSession: () => {
    // Mark session as complete by setting index beyond questions
    const { questions } = get();
    set({ currentQuestionIndex: questions.length });
  },

  resetSession: () => {
    set({
      currentTopic: null,
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: new Map(),
      questionStartTimes: new Map(),
      questionTimes: new Map(),
      isLoading: false,
      isSaving: false,
      error: null,
      sessionResult: null,
    });
  },

  submitSessionResults: async (userId: string) => {
    const { userAnswers, currentTopic, questions } = get();
    if (!currentTopic) {
      set({ error: 'No topic selected' });
      return;
    }

    set({ isSaving: true, error: null });

    // Safety timeout to prevent infinite spinning
    const timeoutId = setTimeout(() => {
      set({ isSaving: false, error: 'Save timeout - please try again' });
    }, 10000);

    try {
      // Step A: Log Reviews
      const { questionTimes } = get();
      const reviewsToSave = Array.from(userAnswers.entries()).map(([questionId, isCorrect]) => ({
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        time_taken_seconds: questionTimes.get(questionId) || 0,
      }));

      
      await saveReviews(reviewsToSave);
      
      // Update question statistics
      for (const review of reviewsToSave) {
        await updateQuestionStats(review.question_id, review.is_correct);
      }

      // Add a small artificial delay to ensure UI shows saving state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step B: Calculate Mastery Change using new algorithm
      const currentState = await getUserTopicState(userId, currentTopic.id);
      const currentRating = currentState?.mastery_score ?? getDefaultRating();
      
      // Build question results for algorithm
      const questionResults: QuestionResult[] = reviewsToSave.map(review => {
        const question = questions.find(q => q.id === review.question_id);
        return {
          questionDifficulty: getDifficultyRating(question?.difficulty_level ?? 1),
          isCorrect: review.is_correct,
          timeTaken: review.time_taken_seconds,
        };
      });
      
      // Process session with new algorithm
      const sessionResult = processSessionResults(currentRating, questionResults);

      // Step C: Update Topic State
      const nextReviewDays = Math.max(1, Math.floor(sessionResult.finalPercentile / 10));
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + nextReviewDays);

      const upsertData = {
        user_id: userId,
        topic_id: currentTopic.id,
        mastery_score: sessionResult.finalRating,
        last_practiced_at: new Date().toISOString(),
        next_review_at: nextReview.toISOString(),
      };
      
      await upsertUserTopicState(upsertData);
      
      // Store session result for display
      set({ sessionResult });

      clearTimeout(timeoutId);
      set({ isSaving: false, error: null });
    } catch (error: any) {
      
      let errorMessage = 'Failed to save progress.';
      if (error && typeof error === 'object') {
        errorMessage = error.message || error.details || JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      clearTimeout(timeoutId);
      set({ 
        isSaving: false, 
        error: `Persistence Error: ${errorMessage}` 
      });
    }
  },
}));

// Computed selectors
export const useCurrentQuestion = () => {
  const { questions, currentQuestionIndex } = useQuizStore();
  if (currentQuestionIndex >= questions.length) return null;
  return questions[currentQuestionIndex];
};

export const useIsSessionComplete = () => {
  const { questions, currentQuestionIndex } = useQuizStore();
  return questions.length > 0 && currentQuestionIndex >= questions.length;
};

export const useCorrectAnswersCount = () => {
  const { userAnswers } = useQuizStore();
  return Array.from(userAnswers.values()).filter(Boolean).length;
};
