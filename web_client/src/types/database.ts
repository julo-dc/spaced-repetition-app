export interface Topic {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  content: {
    statement: string;
    options: Array<{
      id: string;
      latex: string;
      is_correct: boolean;
    }>;
    solution_steps?: string[];
  };
  hints: string[] | null;
  full_solution: string | null;
  difficulty_level: number;
  times_shown: number;
  times_correct: number;
  created_at: string;
}

export interface UserTopicState {
  id: string;
  user_id: string;
  topic_id: string;
  mastery_score: number;
  last_practiced_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  question_id: string;
  is_correct: boolean;
  time_taken_seconds: number | null;
  created_at: string;
}
