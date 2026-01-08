/**
 * Mastery Algorithm - Bayesian-ELO Hybrid System
 * 
 * This module implements a sophisticated skill rating system that combines:
 * 1. ELO-style rating updates (chess rating system)
 * 2. Bayesian probability expectations
 * 3. Time-based performance bonuses
 * 
 * The system maintains a hidden Skill Rating (SR) between 0-2000 and converts
 * it to a user-friendly percentile (0-100%) using a normal distribution.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const RATING_MIN = 0;
const RATING_MAX = 2000;
const RATING_START = 1000;
const RATING_MEAN = 1000;
const RATING_STDDEV = 200;

const BASE_K_FACTOR = 32;
const PLACEMENT_K_FACTOR = 20;
const PLACEMENT_THRESHOLD = 5;

const EXPECTED_TIME_SECONDS = 45;
const TIME_BONUS_MAX_RATIO = 0.25; // Max 25% of base update

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Error Function (erf) approximation using Abramowitz and Stegun formula.
 * Used to calculate cumulative distribution function (CDF) of normal distribution.
 * 
 * @param x - Input value
 * @returns Approximation of erf(x) with error < 1.5 × 10^−7
 */
function erf(x: number): number {
  // Constants for the approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Cumulative Distribution Function (CDF) for normal distribution.
 * Maps a value to its percentile in a bell curve.
 * 
 * @param x - The value to evaluate
 * @param mean - Mean of the distribution
 * @param stdDev - Standard deviation of the distribution
 * @returns Probability (0-1) that a random variable is <= x
 */
function normalCDF(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

/**
 * Clamps a value between min and max bounds.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// CORE ALGORITHM FUNCTIONS
// ============================================================================

/**
 * Converts a Skill Rating (0-2000) to a Percentile (0-100).
 * 
 * Uses a Normal Distribution with Mean=1000, StdDev=200 to create a bell curve.
 * This gives intuitive percentiles:
 * - 1000 SR → 50th percentile (average)
 * - 1200 SR → ~84th percentile (1 std dev above)
 * - 1400 SR → ~97.7th percentile (2 std devs above)
 * - 800 SR → ~16th percentile (1 std dev below)
 * 
 * @param skillRating - The user's current skill rating (0-2000)
 * @returns Percentile rank (0-100)
 */
export function calculatePercentile(skillRating: number): number {
  const cdf = normalCDF(skillRating, RATING_MEAN, RATING_STDDEV);
  const percentile = cdf * 100;
  return clamp(percentile, 0, 100);
}

/**
 * Calculates the expected probability of a user answering correctly.
 * 
 * Uses the ELO logistic function (sigmoid curve):
 * P = 1 / (1 + 10^((QuestionDifficulty - UserRating) / 400))
 * 
 * Examples:
 * - User 1000 vs Question 1000 → 50% expected
 * - User 1200 vs Question 1000 → 76% expected
 * - User 1000 vs Question 1200 → 24% expected
 * 
 * @param userRating - The user's current skill rating
 * @param questionDifficulty - The question's difficulty rating
 * @returns Expected probability of success (0-1)
 */
function calculateExpectedProbability(
  userRating: number,
  questionDifficulty: number
): number {
  const exponent = (questionDifficulty - userRating) / 400;
  return 1 / (1 + Math.pow(10, exponent));
}

/**
 * Determines the K-factor (volatility) for rating updates.
 * 
 * The K-factor controls how much a single result affects the rating:
 * - Higher K = More volatile (faster learning, less stable)
 * - Lower K = More stable (slower learning, more resistant to noise)
 * 
 * Strategy:
 * - First 5 questions (placement): Use conservative K=20 to avoid wild swings
 * - After placement: Use standard K=32 for normal updates
 * 
 * @param questionCount - Total questions answered by the user
 * @returns K-factor for this update
 */
function calculateKFactor(questionCount: number): number {
  // During placement phase, use conservative K to prevent overreaction
  if (questionCount < PLACEMENT_THRESHOLD) {
    return PLACEMENT_K_FACTOR;
  }
  return BASE_K_FACTOR;
}

/**
 * Calculates a time-based performance bonus for fast correct answers.
 * 
 * Rewards users who answer correctly AND quickly:
 * - Only applies to correct answers
 * - Bonus scales linearly with time saved
 * - Capped at 25% of the base rating change
 * 
 * Formula:
 * TimeBonus = (TimeSaved / ExpectedTime) * (K / 4)
 * Capped at: 0.25 * |BaseUpdate|
 * 
 * Example:
 * - Expected: 45s, Actual: 30s, K=32
 * - TimeSaved: 15s (33% faster)
 * - RawBonus: (15/45) * (32/4) = 2.67 points
 * - If BaseUpdate = 16, MaxBonus = 4, so bonus = 2.67 ✓
 * 
 * @param isCorrect - Whether the answer was correct
 * @param timeTaken - Time taken in seconds
 * @param kFactor - The K-factor for this update
 * @param baseUpdate - The base rating change (for capping)
 * @returns Time bonus points (0 if incorrect or slow)
 */
function calculateTimeBonus(
  isCorrect: boolean,
  timeTaken: number,
  kFactor: number,
  baseUpdate: number
): number {
  // No bonus for incorrect answers
  if (!isCorrect) {
    return 0;
  }

  // No bonus if user took longer than expected
  if (timeTaken >= EXPECTED_TIME_SECONDS) {
    return 0;
  }

  const timeSaved = EXPECTED_TIME_SECONDS - timeTaken;
  const timeRatio = timeSaved / EXPECTED_TIME_SECONDS;
  
  // Calculate raw bonus: faster answers get bigger bonuses
  const rawBonus = timeRatio * (kFactor / 4);
  
  // Cap bonus at 25% of the base update magnitude
  const maxBonus = Math.abs(baseUpdate) * TIME_BONUS_MAX_RATIO;
  
  return Math.min(rawBonus, maxBonus);
}

/**
 * Updates a user's skill rating based on a single question result.
 * 
 * This is the core of the Bayesian-ELO Hybrid algorithm. It combines:
 * 1. Expected probability (Bayesian prior)
 * 2. Actual result (observed data)
 * 3. K-factor (learning rate)
 * 4. Time bonus (performance reward)
 * 
 * Algorithm:
 * 1. Calculate expected probability of success (sigmoid)
 * 2. Determine K-factor based on experience level
 * 3. Calculate base update: K * (Actual - Expected)
 * 4. Add time bonus if answered quickly and correctly
 * 5. Clamp result to valid range [0, 2000]
 * 
 * @param currentRating - User's current skill rating (default 1000)
 * @param questionDifficulty - Question's difficulty rating (Easy=800, Med=1000, Hard=1200)
 * @param isCorrect - Whether the user answered correctly
 * @param timeTaken - Time taken to answer in seconds
 * @param questionCount - Total questions answered (for K-factor adjustment)
 * @returns New skill rating (0-2000)
 */
export function updateMastery(
  currentRating: number,
  questionDifficulty: number,
  isCorrect: boolean,
  timeTaken: number,
  questionCount: number
): number {
  // Step 1: Calculate expected probability using ELO formula
  const expectedProbability = calculateExpectedProbability(
    currentRating,
    questionDifficulty
  );

  // Step 2: Determine K-factor (volatility) based on experience
  const kFactor = calculateKFactor(questionCount);

  // Step 3: Calculate base rating change
  // actualScore is 1.0 for correct, 0.0 for incorrect
  const actualScore = isCorrect ? 1.0 : 0.0;
  const baseUpdate = kFactor * (actualScore - expectedProbability);

  // Step 4: Calculate time bonus (only for correct, fast answers)
  const timeBonus = calculateTimeBonus(isCorrect, timeTaken, kFactor, baseUpdate);

  // Step 5: Apply update and clamp to valid range
  const newRating = currentRating + baseUpdate + timeBonus;
  return clamp(newRating, RATING_MIN, RATING_MAX);
}

// ============================================================================
// SESSION PROCESSING
// ============================================================================

/**
 * Represents a single question result in a session.
 */
export interface QuestionResult {
  questionDifficulty: number;
  isCorrect: boolean;
  timeTaken: number;
}

/**
 * Result of processing a session, including detailed breakdown.
 */
export interface SessionResult {
  initialRating: number;
  finalRating: number;
  ratingChange: number;
  initialPercentile: number;
  finalPercentile: number;
  percentileChange: number;
  questionsAnswered: number;
  correctAnswers: number;
  averageTime: number;
}

/**
 * Processes an entire quiz session and calculates the final rating change.
 * 
 * Iterates through all question results in order, updating the rating
 * after each question. This creates a "learning trajectory" where early
 * questions affect the rating for later questions.
 * 
 * @param initialRating - User's rating at session start
 * @param results - Array of question results in order
 * @returns Detailed session result with rating changes and statistics
 */
export function processSessionResults(
  initialRating: number,
  results: QuestionResult[]
): SessionResult {
  let currentRating = initialRating;
  let correctCount = 0;
  let totalTime = 0;

  // Process each question sequentially
  results.forEach((result, index) => {
    if (result.isCorrect) {
      correctCount++;
    }
    totalTime += result.timeTaken;

    // Update rating based on this question
    // questionCount is the total number answered so far (for K-factor)
    currentRating = updateMastery(
      currentRating,
      result.questionDifficulty,
      result.isCorrect,
      result.timeTaken,
      index + 1 // +1 because index is 0-based
    );
  });

  const finalRating = currentRating;
  const ratingChange = finalRating - initialRating;

  const initialPercentile = calculatePercentile(initialRating);
  const finalPercentile = calculatePercentile(finalRating);
  const percentileChange = finalPercentile - initialPercentile;

  const averageTime = results.length > 0 ? totalTime / results.length : 0;

  return {
    initialRating,
    finalRating,
    ratingChange,
    initialPercentile,
    finalPercentile,
    percentileChange,
    questionsAnswered: results.length,
    correctAnswers: correctCount,
    averageTime,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Gets the default starting rating for new users.
 */
export function getDefaultRating(): number {
  return RATING_START;
}

/**
 * Maps difficulty levels to rating values.
 */
export const DifficultyRating = {
  EASY: 800,
  MEDIUM: 1000,
  HARD: 1200,
} as const;

/**
 * Gets the difficulty rating for a numeric difficulty level.
 * 
 * @param level - Difficulty level (1=Easy, 2=Medium, 3=Hard)
 * @returns Corresponding rating value
 */
export function getDifficultyRating(level: number): number {
  switch (level) {
    case 1:
      return DifficultyRating.EASY;
    case 2:
      return DifficultyRating.MEDIUM;
    case 3:
      return DifficultyRating.HARD;
    default:
      return DifficultyRating.MEDIUM;
  }
}
