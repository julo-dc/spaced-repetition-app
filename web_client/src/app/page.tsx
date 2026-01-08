'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton } from '@/components/SignInButton';
import { fetchTopics } from '@/lib/api';
import { Topic } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { QuestionText } from '@/components/MathDisplay';
import { BarChart3, Play, Trophy, Target, Zap, BookOpen } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTopics();
        setTopics(data);
      } catch (error) {
        // Still set empty array to prevent infinite loading
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadTopics();
  }, []);

  const handleStartQuiz = (topicId: string) => {
    router.push(`/quiz/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MathMaster</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={() => router.push('/stats')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  Stats
                </button>
              )}
              <SignInButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Calculus with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Spaced Repetition
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Build deep mathematical understanding through intelligent practice.
              Our spaced repetition system adapts to your performance, scheduling reviews
              at the perfect time for maximum retention.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adaptive Learning</h3>
              <p className="text-gray-600 text-sm">Questions adapt to your skill level</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600 text-sm">Reviews timed for optimal retention</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor your mastery with detailed analytics</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => document.getElementById('topics')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" />
              Start Learning
            </button>
            {user && (
              <button
                onClick={() => router.push('/stats')}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200"
              >
                View Progress
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Topic</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a topic to begin your personalized learning journey.
              Each topic adapts to your current skill level.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading topics...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Topics Available</h3>
              <p className="text-gray-600">Check back soon for new learning materials.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleStartQuiz(topic.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {topic.name.split(':')[0]}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <QuestionText text={topic.name.split(':')[1]?.trim() || 'Master this fundamental concept'} />
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                      <Play className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Ready to practice</span>
                    </div>
                    <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                      Start →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MathMaster</span>
          </div>
          <p className="text-gray-600 mb-4">
            Build mathematical mastery through intelligent spaced repetition
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>© 2024 MathMaster</span>
            <span>•</span>
            <span>Powered by advanced learning science</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
