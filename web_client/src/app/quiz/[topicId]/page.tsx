'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore, useCurrentQuestion, useIsSessionComplete, useCorrectAnswersCount } from '@/store/quizStore';
import { fetchQuestionsForTopic, fetchTopicById } from '@/lib/api';
import { QuestionText, MathDisplay } from '@/components/MathDisplay';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, RefreshCcw, LogIn, Trophy, BarChart3, TrendingUp, TrendingDown, Minus, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function QuizPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentTopic, questions, currentQuestionIndex, isSaving, error, sessionResult, startSession, answerQuestion, nextQuestion, stopSession, resetSession, submitSessionResults } = useQuizStore();
  const currentQuestion = useCurrentQuestion();
  const isSessionComplete = useIsSessionComplete();
  const correctCount = useCorrectAnswersCount();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [qs, topic] = await Promise.all([
        fetchQuestionsForTopic(resolvedParams.topicId),
        fetchTopicById(resolvedParams.topicId)
      ]);

      if (topic) {
        startSession(topic, qs);
      } else {
        // Fallback or error handling could go here
        console.error('Topic not found');
      }
    };
    loadData();
  }, [resolvedParams.topicId, startSession]);

  // Auto-submit results when session completes
  useEffect(() => {
    if (isSessionComplete && user && !isSaving && !error) {
      submitSessionResults(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionComplete, user?.id]);

  const handleManualSignInAndSave = async () => {
    setIsSigningIn(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;
      if (data.user) {
        await submitSessionResults(data.user.id);
      }
    } catch (err: any) {
      console.error('Manual sign-in and save failed:', err);
      alert(`Failed to sign in and save: ${err.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRetrySave = () => {
    if (user) {
      submitSessionResults(user.id);
    }
  };

  const handleOptionSelect = (optionId: string, correct: boolean) => {
    if (hasAnswered) return;

    setSelectedOptionId(optionId);
    setHasAnswered(true);
    setIsCorrect(correct);
    answerQuestion(currentQuestion!.id, correct);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    nextQuestion();
    setSelectedOptionId(null);
    setHasAnswered(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleGoHome = () => {
    resetSession();
    router.push('/');
  };

  if (!currentQuestion && !isSessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    const answeredCount = Array.from(useQuizStore.getState().userAnswers.keys()).length;
    const percentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const scoreColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-orange-600' : 'text-red-600';
    const message = percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          {/* Achievement Header */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-center text-white">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Session Complete!</h1>
              <p className="text-indigo-100 text-lg">Great work on mastering {currentTopic?.name.split(':')[0]}</p>
            </div>

            {/* Score Display */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                  <div className={`text-5xl font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                    {percentage}%
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {correctCount} / {answeredCount} Correct
                </div>
                <div className={`text-xl font-semibold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                  {message}
                </div>
              </div>

              {/* Rank Progress */}
              {sessionResult && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Rank Progress
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Before</div>
                      <div className="text-3xl font-bold text-gray-700">
                        {sessionResult.initialPercentile.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold mb-1 flex items-center justify-center gap-1 ${sessionResult.percentileChange > 0 ? 'text-green-600' :
                        sessionResult.percentileChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {sessionResult.percentileChange > 0 && <TrendingUp className="w-4 h-4" />}
                        {sessionResult.percentileChange < 0 && <TrendingDown className="w-4 h-4" />}
                        {sessionResult.percentileChange === 0 && <Minus className="w-4 h-4" />}
                        Change
                      </div>
                      <div className={`text-2xl font-bold ${sessionResult.percentileChange > 0 ? 'text-green-600' :
                        sessionResult.percentileChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {sessionResult.percentileChange > 0 ? '+' : ''}{sessionResult.percentileChange.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">After</div>
                      <div className="text-3xl font-bold text-indigo-600">
                        {sessionResult.finalPercentile.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${sessionResult.finalPercentile}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Status */}
              {!isSaving && !error && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Progress saved successfully!</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={isSaving || isSigningIn}
                >
                  Back to Home
                </button>
                {user && (
                  <button
                    onClick={() => router.push('/stats')}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    View Stats
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options = currentQuestion!.content.options;
  const correctOption = options.find(opt => opt.is_correct);
  const answeredCount = Array.from(useQuizStore.getState().userAnswers.keys()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Minimal Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Exit</span>
            </button>

            <div className="text-center flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentTopic ? currentTopic.name.split(':')[0] : 'Loading...'}
              </h2>
            </div>

            <button
              onClick={stopSession}
              disabled={answeredCount === 0}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </div>
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Question Section */}
          <div className="p-8 md:p-12 border-b border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                Question {answeredCount + 1}
              </div>
              <QuestionText
                text={currentQuestion!.content.statement}
                className="text-2xl md:text-3xl font-semibold text-gray-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Answer Options */}
          <div className="p-8 md:p-12">
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;
                const showResult = hasAnswered && isSelected;
                const isCorrect = option.is_correct;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id, option.is_correct)}
                    disabled={hasAnswered}
                    className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left group ${showResult && isCorrect
                      ? 'border-green-500 bg-green-50'
                      : showResult && !isCorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg transform scale-[1.02]'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 hover:shadow-md'
                      } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${selectedOptionId === option.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        {['A', 'B', 'C', 'D'][index]}
                      </div>
                      <div className="flex-1">
                        <MathDisplay latex={option.latex} />
                      </div>
                      {hasAnswered && option.is_correct && (
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      )}
                      {hasAnswered && selectedOptionId === option.id && !option.is_correct && (
                        <XCircle className="w-7 h-7 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className={`p-8 text-center border-b ${isCorrect ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
                }`}>
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  ) : (
                    <XCircle className="w-12 h-12 text-white" />
                  )}
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                  {isCorrect ? 'Excellent!' : 'Let\'s Learn'}
                </h2>
                <p className={`text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {isCorrect ? 'You got it right!' : 'That\'s not quite right'}
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                {!isCorrect && correctOption && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      Correct Answer
                    </h3>
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                      <MathDisplay latex={correctOption.latex} />
                    </div>
                  </div>
                )}

                {currentQuestion!.content.solution_steps && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                      </div>
                      Solution Steps
                    </h3>
                    <div className="space-y-4">
                      {currentQuestion!.content.solution_steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            {index + 1}
                          </div>
                          <QuestionText text={step} className="text-gray-700 pt-1 !justify-start !text-left" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={stopSession}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Stop Quiz
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  {isCorrect ? 'Next Question' : 'Continue Learning'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
