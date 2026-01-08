'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  TrendingUp, 
  Award, 
  Clock, 
  Target, 
  BarChart3, 
  BookOpen,
  Calendar,
  CheckCircle2,
  Brain,
  Zap
} from 'lucide-react';
import { calculatePercentile } from '@/lib/masteryAlgorithm';
import { supabase } from '@/lib/supabaseClient';

interface TopicStats {
  topic_id: string;
  topic_name: string;
  mastery_score: number;
  percentile: number;
  last_practiced_at: string | null;
  next_review_at: string | null;
  total_reviews: number;
  correct_reviews: number;
  accuracy: number;
}

interface OverallStats {
  totalTopics: number;
  averagePercentile: number;
  totalReviews: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTimeSpent: number;
}

export default function StatsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadStats();
    }
  }, [user, isAuthLoading, router]);

  const loadStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch user topic states with topic names
      const { data: topicStates, error: topicError } = await supabase
        .from('user_topic_state')
        .select(`
          topic_id,
          mastery_score,
          last_practiced_at,
          next_review_at,
          topics (
            name
          )
        `)
        .eq('user_id', user.id);

      if (topicError) throw topicError;

      // Fetch review statistics for each topic
      const topicStatsPromises = (topicStates || []).map(async (state: any) => {
        const { data: reviews, error: reviewError } = await supabase
          .from('reviews')
          .select('is_correct, time_taken_seconds')
          .eq('user_id', user.id)
          .eq('question_id', state.topic_id);

        const totalReviews = reviews?.length || 0;
        const correctReviews = reviews?.filter((r: any) => r.is_correct).length || 0;
        const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

        return {
          topic_id: state.topic_id,
          topic_name: state.topics?.name || 'Unknown Topic',
          mastery_score: state.mastery_score,
          percentile: calculatePercentile(state.mastery_score),
          last_practiced_at: state.last_practiced_at,
          next_review_at: state.next_review_at,
          total_reviews: totalReviews,
          correct_reviews: correctReviews,
          accuracy,
        };
      });

      const stats = await Promise.all(topicStatsPromises);
      setTopicStats(stats);

      // Calculate overall stats
      const totalReviews = stats.reduce((sum, s) => sum + s.total_reviews, 0);
      const totalCorrect = stats.reduce((sum, s) => sum + s.correct_reviews, 0);
      const averagePercentile = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.percentile, 0) / stats.length
        : 0;

      // Fetch total time spent
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('time_taken_seconds')
        .eq('user_id', user.id);

      const totalTimeSpent = (allReviews || []).reduce(
        (sum: number, r: any) => sum + (r.time_taken_seconds || 0),
        0
      );

      setOverallStats({
        totalTopics: stats.length,
        averagePercentile,
        totalReviews,
        totalCorrect,
        overallAccuracy: totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
        totalTimeSpent,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMasteryLevel = (percentile: number) => {
    if (percentile >= 90) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (percentile >= 75) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentile >= 50) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentile >= 25) return { level: 'Beginner', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Novice', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const masteryLevel = overallStats ? getMasteryLevel(overallStats.averagePercentile) : null;

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning stats...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Learning Stats</h1>
          <div className="w-32"></div>
        </div>

        {/* Overall Stats Cards */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Avg Percentile</h3>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {overallStats.averagePercentile.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Across {overallStats.totalTopics} topics</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Accuracy</h3>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {overallStats.overallAccuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overallStats.totalCorrect} / {overallStats.totalReviews} correct
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Reviews</h3>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {overallStats.totalReviews}
              </div>
              <p className="text-xs text-gray-500 mt-1">Questions answered</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Time Spent</h3>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {formatTime(overallStats.totalTimeSpent)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total practice time</p>
            </div>
          </div>
        )}

        {/* Topic Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Topic Breakdown
          </h2>

          {topicStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No practice data yet</p>
              <p className="text-sm">Complete some quizzes to see your stats here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topicStats.map((stat) => (
                <div
                  key={stat.topic_id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{stat.topic_name}</h3>
                      <p className="text-sm text-gray-500">
                        Last practiced: {formatDate(stat.last_practiced_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {stat.percentile.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Percentile</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-500 text-xs mb-1">Rating</div>
                      <div className="text-lg font-bold text-gray-800">
                        {stat.mastery_score.toFixed(0)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-500 text-xs mb-1">Accuracy</div>
                      <div className="text-lg font-bold text-gray-800">
                        {stat.accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-500 text-xs mb-1">Reviews</div>
                      <div className="text-lg font-bold text-gray-800">
                        {stat.total_reviews}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress to Mastery</span>
                      <span>{((stat.mastery_score / 2000) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(stat.mastery_score / 2000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visual Stats Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Overview</h2>
          
          {topicStats.length > 0 ? (
            <div className="space-y-6">
              {/* Percentile Distribution */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Percentile Distribution</h3>
                <div className="flex items-end gap-2 h-48">
                  {topicStats.map((stat, index) => {
                    const height = (stat.percentile / 100) * 100;
                    return (
                      <div key={stat.topic_id} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-center truncate w-full px-1">
                          {stat.topic_name.split(':')[0]}
                        </div>
                        <div className="text-xs font-bold text-indigo-600">
                          {stat.percentile.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accuracy Chart */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Accuracy by Topic</h3>
                <div className="space-y-3">
                  {topicStats.map((stat) => (
                    <div key={stat.topic_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{stat.topic_name.split(':')[0]}</span>
                        <span className="font-semibold text-gray-800">{stat.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stat.accuracy >= 80 ? 'bg-green-500' :
                            stat.accuracy >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${stat.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No data to visualize yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
