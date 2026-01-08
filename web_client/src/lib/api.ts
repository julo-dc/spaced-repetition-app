import { supabase } from './supabaseClient';
import { Topic, Question, Review, UserTopicState } from '@/types/database';

export async function fetchTopics(): Promise<Topic[]> {
  console.log('Fetching topics from Supabase...');
  try {
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Topics fetch timeout after 5 seconds')), 5000)
    );

    const fetchPromise = supabase
      .from('topics')
      .select('*')
      .order('name');

    const { data, error, status, statusText } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      const errorMsg = `Supabase error fetching topics: ${JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status,
        statusText
      }, null, 2)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Topics fetched successfully:', data);

    if (!data || data.length === 0) {
      console.log('No topics in database, using fallback');
      return getFallbackTopics();
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Topics fetch timeout after 5 seconds') {
      console.warn('⏰ Topics fetch timed out, using fallback topics');
    } else if (error.message?.includes('Load failed') || error.message?.includes('AuthRetryableFetchError')) {
      console.warn('🌐 Supabase network error, using fallback topics:', error.message);
    } else {
      const catchMsg = `Catch block in fetchTopics: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
      console.error(catchMsg);
    }
    console.log('📦 Returning fallback topics due to network issues');
    return getFallbackTopics();
  }
}

export async function fetchTopicById(id: string): Promise<Topic | null> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching topic:', error);
    // Return a fallback topic if it matches the hardcoded ID, otherwise null
    if (id === '7e5718c9-00ad-4064-94fa-b42913cfda09') {
      return getFallbackTopics()[0];
    }
    return null;
  }
}

function getFallbackTopics(): Topic[] {
  return [
    {
      id: '7e5718c9-00ad-4064-94fa-b42913cfda09',
      name: 'Chain Rule: $$\\frac{d}{dx}f(g(x))$$',
      slug: 'chain-rule',
      parent_id: null,
      created_at: new Date().toISOString(),
    },
  ];
}

export async function fetchQuestionsForTopic(topicId: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId);


    if (error) {
      // Ignore AbortError - it's expected when React re-renders in dev mode
      if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
        return getFallbackQuestions(topicId);
      }
      throw error;
    }


    if (!data || data.length === 0) {
      return getFallbackQuestions(topicId);
    }

    return data;
  } catch (error: any) {
    // Ignore AbortError - expected in React dev mode
    if (error?.message?.includes('AbortError') || error?.message?.includes('aborted')) {
      return getFallbackQuestions(topicId);
    }
    return getFallbackQuestions(topicId);
  }
}

function getFallbackQuestions(topicId: string): Question[] {
  return [
    {
      id: '1',
      topic_id: topicId,
      content: {
        statement: 'Find the derivative of $$f(x) = \\sin(x^2)$$',
        options: [
          { id: 'a', latex: '$$2x\\cos(x^2)$$', is_correct: true },
          { id: 'b', latex: '$$\\cos(x^2)$$', is_correct: false },
          { id: 'c', latex: '$$2x\\sin(x^2)$$', is_correct: false },
          { id: 'd', latex: '$$-2x\\cos(x^2)$$', is_correct: false },
        ],
        solution_steps: [
          'Step 1: Identify inner function $$u = x^2$$ and outer function $$\\sin(u)$$',
          "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
          "Step 3: $$f'(u) = \\cos(u)$$ and $$g'(x) = 2x$$",
          'Step 4: Result: $$2x\\cos(x^2)$$',
        ],
      },
      hints: null,
      full_solution: null,
      difficulty_level: 1,
      times_shown: 0,
      times_correct: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      topic_id: topicId,
      content: {
        statement: 'Find the derivative of $$f(x) = \\cos(3x)$$',
        options: [
          { id: 'a', latex: `$$-3\\sin(3x)$$`, is_correct: true },
          { id: 'b', latex: `$$\\sin(3x)$$`, is_correct: false },
          { id: 'c', latex: `$$3\\cos(3x)$$`, is_correct: false },
          { id: 'd', latex: `$$-\\sin(3x)$$`, is_correct: false },
        ],
        solution_steps: [
          'Step 1: Identify inner function $$u = 3x$$ and outer function $$\\cos(u)$$',
          "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
          "Step 3: $$f'(u) = -\\sin(u)$$ and $$g'(x) = 3$$",
          'Step 4: Result: $$-3\\sin(3x)$$',
        ],
      },
      hints: null,
      full_solution: null,
      difficulty_level: 1,
      times_shown: 0,
      times_correct: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      topic_id: topicId,
      content: {
        statement: 'Find the derivative of $$f(x) = e^{2x}$$',
        options: [
          { id: 'a', latex: `$$2e^{2x}$$`, is_correct: true },
          { id: 'b', latex: `$$e^{2x}$$`, is_correct: false },
          { id: 'c', latex: `$$2xe^{2x}$$`, is_correct: false },
          { id: 'd', latex: `$$-2e^{2x}$$`, is_correct: false },
        ],
        solution_steps: [
          'Step 1: Identify inner function $$u = 2x$$ and outer function $$e^u$$',
          "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
          "Step 3: $$f'(u) = e^u$$ and $$g'(x) = 2$$",
          'Step 4: Result: $$2e^{2x}$$',
        ],
      },
      hints: null,
      full_solution: null,
      difficulty_level: 1,
      times_shown: 0,
      times_correct: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      topic_id: topicId,
      content: {
        statement: 'Find the derivative of $$f(x) = \\ln(x^2)$$',
        options: [
          { id: 'a', latex: `$$\\frac{2}{x}$$`, is_correct: true },
          { id: 'b', latex: `$$\\frac{1}{x}$$`, is_correct: false },
          { id: 'c', latex: `$$2x$$`, is_correct: false },
          { id: 'd', latex: `$$\\ln(x)$$`, is_correct: false },
        ],
        solution_steps: [
          'Step 1: Rewrite as $$\\ln(x^2) = 2\\ln(x)$$',
          'Step 2: Derivative of $$\\ln(x)$$ is $$\\frac{1}{x}$$',
          'Step 3: Apply constant multiple rule',
          'Step 4: Result: $$2 \\cdot \\frac{1}{x} = \\frac{2}{x}$$',
        ],
      },
      hints: null,
      full_solution: null,
      difficulty_level: 1,
      times_shown: 0,
      times_correct: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      topic_id: topicId,
      content: {
        statement: 'Find the derivative of $$f(x) = (x^3 + 2x)^2$$',
        options: [
          { id: 'a', latex: `$$2(x^3 + 2x)(3x^2 + 2)$$`, is_correct: true },
          { id: 'b', latex: `$$ (x^3 + 2x)(3x^2 + 2)$$`, is_correct: false },
          { id: 'c', latex: `$$2(3x^2 + 2)$$`, is_correct: false },
          { id: 'd', latex: `$$3x^2 + 2$$`, is_correct: false },
        ],
        solution_steps: [
          'Step 1: Identify inner function $$u = x^3 + 2x$$ and outer function $$u^2$$',
          "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
          "Step 3: $$f'(u) = 2u$$ and $$g'(x) = 3x^2 + 2$$",
          'Step 4: Result: $$2(x^3 + 2x)(3x^2 + 2)$$',
        ],
      },
      hints: null,
      full_solution: null,
      difficulty_level: 1,
      times_shown: 0,
      times_correct: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      topic_id: topicId,
      content: {
        statement: 'Find the derivative of $$f(x) = \\sin(3x^2)$$',
        options: [
          { id: 'a', latex: `$$6x\\cos(3x^2)$$`, is_correct: true },
          { id: 'b', latex: `$$\\cos(3x^2)$$`, is_correct: false },
          { id: 'c', latex: `$$6x\\sin(3x^2)$$`, is_correct: false },
          { id: 'd', latex: `$$-6x\\cos(3x^2)$$`, is_correct: false },
        ],
        solution_steps: [
          'Step 1: Identify inner function $$u = 3x^2$$ and outer function $$\\sin(u)$$',
          "Step 2: Apply Chain Rule: $$(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$$",
          "Step 3: $$f'(u) = \\cos(u)$$ and $$g'(x) = 6x$$",
          'Step 4: Result: $$6x\\cos(3x^2)$$',
        ],
      },
      hints: null,
      full_solution: null,
      difficulty_level: 1,
      times_shown: 0,
      times_correct: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

// Persistence & Spaced Repetition Logic

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('topics').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Connection test failed:', JSON.stringify(error, null, 2));
      return { success: false, message: error.message };
    }

    console.log('Connection test successful');
    return { success: true, message: 'Connected successfully' };
  } catch (error: any) {
    console.error('Connection test exception:', error instanceof Error ? error.message : JSON.stringify(error));
    return { success: false, message: error.message || 'Unknown error' };
  }
}

export async function updateQuestionStats(questionId: string, isCorrect: boolean): Promise<void> {
  try {
    console.log('📊 Updating question stats:', { questionId, isCorrect });

    // First, get current stats
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('times_shown, times_correct')
      .eq('id', questionId)
      .single();

    if (fetchError) {
      console.error('Error fetching question stats:', fetchError);
      throw fetchError;
    }

    // Update the stats
    const { error: updateError } = await supabase
      .from('questions')
      .update({
        times_shown: (question?.times_shown || 0) + 1,
        times_correct: (question?.times_correct || 0) + (isCorrect ? 1 : 0)
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error updating question stats:', updateError);
      throw updateError;
    }

    console.log('✅ Question stats updated successfully');
  } catch (error: any) {
    if (error.message?.includes('Load failed') || error.message?.includes('AuthRetryableFetchError')) {
      console.warn('🌐 Supabase network error during stats update, question stats not updated:', error.message);
      // Don't throw error for network issues, just log it
      return;
    }
    console.error('💥 Exception in updateQuestionStats:', error);
    throw error;
  }
}

export async function saveReviews(reviews: Array<{
  user_id: string;
  question_id: string;
  is_correct: boolean;
  time_taken_seconds?: number;
}>): Promise<void> {
  try {
    console.log('🔍 Attempting to save reviews:', reviews);

    const { data, error } = await supabase
      .from('reviews')
      .insert(reviews)
      .select();

    if (error) {
      console.error('❌ Error saving reviews:', JSON.stringify(error, null, 2));
      console.error('📊 Review data being sent:', JSON.stringify(reviews, null, 2));
      throw error;
    }

    console.log('✅ Reviews saved successfully:', data);
  } catch (error: any) {
    if (
      error?.message?.includes('Load failed') ||
      error?.message?.includes('AuthRetryableFetchError') ||
      error?.message?.includes('AbortError') ||
      error?.message?.includes('aborted')
    ) {
      console.warn('🌐 Supabase network error during save, reviews not saved:', error.message);
      // Don't throw error for transient network/abort issues; allow UI to continue
      return;
    }
    console.error('💥 Exception in saveReviews:', error instanceof Error ? error.message : JSON.stringify(error));
    console.error('🌐 Network error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

export async function getUserTopicState(userId: string, topicId: string): Promise<UserTopicState | null> {
  try {
    const { data, error } = await supabase
      .from('user_topic_state')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user topic state:', JSON.stringify(error, null, 2));
      throw error;
    }
    return data;
  } catch (error: any) {
    console.error('Exception in getUserTopicState:', error instanceof Error ? error.message : JSON.stringify(error));
    return null;
  }
}

export async function upsertUserTopicState(state: {
  user_id: string;
  topic_id: string;
  mastery_score: number;
  last_practiced_at: string;
  next_review_at: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_topic_state')
      .upsert(state, {
        onConflict: 'user_id,topic_id'
      });

    if (error) {
      console.error('Error upserting user topic state:', JSON.stringify(error, null, 2));
      throw error;
    }
  } catch (error: any) {
    console.error('Exception in upsertUserTopicState:', error instanceof Error ? error.message : JSON.stringify(error));
    throw error;
  }
}

export function calculateMasteryDelta(percentage: number): number {
  if (percentage >= 80) return 0.05; // +5%
  if (percentage >= 60) return 0.02; // +2%
  return -0.05; // -5%
}

export function calculateNextReviewDate(masteryScore: number): Date {
  const now = new Date();
  const daysToAdd = masteryScore > 0.8 ? 3 : 1;
  now.setDate(now.getDate() + daysToAdd);
  return now;
}

export function clampMasteryScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}
