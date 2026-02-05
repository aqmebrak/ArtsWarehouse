/**
 * Centralized TypeScript types for Audio Training system
 *
 * This file contains all shared types across the audio training exercises,
 * gamification system, and storage layer.
 */

// ============================================================================
// EXERCISE TYPES
// ============================================================================

/**
 * All available exercise identifiers
 */
export type ExerciseId =
	| 'panning'
	| 'eq'
	| 'eq-mirror'
	| 'db-king'
	| 'peak-master'
	| 'kit-cut'
	| 'stereohead'
	| 'filter-expert'
	| 'sonar-beast'
	| 'bass-detective'
	| 'delay-control'
	| 'reverb-wizard'
	| 'dr-compressor';

/**
 * Exercise category for grouping related exercises
 */
export type ExerciseCategory = 'equalization' | 'dynamics' | 'space-time' | 'quality';

/**
 * Metadata about an exercise
 */
export interface ExerciseMetadata {
	id: ExerciseId;
	name: string;
	description: string;
	category: ExerciseCategory;
	icon: string;
	gradient: string; // Tailwind gradient classes
	isAvailable: boolean; // Whether exercise is implemented
}

// ============================================================================
// DIFFICULTY TYPES
// ============================================================================

/**
 * Four difficulty levels for all exercises
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Configuration for a specific difficulty level
 */
export interface DifficultyConfig {
	rounds: number;
	tolerance: number; // Margin of error (varies by exercise)
	timeLimit?: number; // Optional time limit in milliseconds
	visualHints: boolean; // Whether to show visual hints
	scoreMultiplier: number; // Multiplier for final score
	xpMultiplier: number; // Multiplier for XP earned
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

/**
 * Current state of an active game session
 */
export interface GameState {
	currentRound: number;
	totalRounds: number;
	score: number;
	gameCompleted: boolean;
	gameStarted: boolean;
	showResult: boolean;
	resultMessage: string;
}

/**
 * Result of a single round
 */
export interface RoundResult {
	correct: boolean;
	points: number;
	actualValue: number;
	userGuess: number;
	responseTime?: number; // Time taken to answer in milliseconds
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	additionalData?: Record<string, any>; // Exercise-specific data
}

/**
 * Complete game session record
 */
export interface GameSession {
	sessionId: string;
	exerciseId: ExerciseId;
	difficulty: DifficultyLevel;
	startedAt: string; // ISO timestamp
	completedAt?: string; // ISO timestamp
	rounds: RoundResult[];
	finalScore: number;
	accuracy: number; // Percentage 0-100
	xpEarned: number;
}

// ============================================================================
// EQ TYPES (for EQ-based exercises)
// ============================================================================

/**
 * EQ band parameters for parametric equalizers
 */
export interface EQBand {
	frequency: number; // Hz
	gain: number; // dB
	q: number; // Q factor
}

// ============================================================================
// PROGRESSION TYPES
// ============================================================================

/**
 * Skill level badges for each exercise
 */
export type SkillLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/**
 * Statistics for a single exercise
 */
export interface ExerciseStats {
	gamesPlayed: number;
	highScore: number;
	totalScore: number;
	averageAccuracy: number; // Percentage 0-100
	currentDifficulty: DifficultyLevel;
	skillLevel: SkillLevel;
	lastPlayed: string; // ISO timestamp
	bestStreak: number; // Best consecutive perfect rounds
}

/**
 * Achievement definition
 */
export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string; // Emoji or icon identifier
	category: 'getting-started' | 'skill-mastery' | 'challenge' | 'consistency';
	requirement: AchievementRequirement;
}

/**
 * Achievement requirement specification
 */
export interface AchievementRequirement {
	type:
		| 'games-played'
		| 'perfect-game'
		| 'perfect-round'
		| 'accuracy-threshold'
		| 'streak'
		| 'skill-level'
		| 'exercises-tried'
		| 'daily-challenges';
	value: number;
	exerciseId?: ExerciseId;
	exerciseCategory?: ExerciseCategory;
	difficulty?: DifficultyLevel;
	gamesRequired?: number;
	count?: number; // For "reach X level in Y exercises"
}

/**
 * User's progress on an achievement
 */
export interface AchievementProgress {
	id: string;
	unlockedAt?: string; // ISO timestamp, undefined if not unlocked
	progress: number; // 0-100 percentage for progressive achievements
}

/**
 * Daily challenge definition
 */
export interface DailyChallenge {
	date: string; // YYYY-MM-DD
	exerciseId: ExerciseId;
	difficulty: DifficultyLevel;
	targetScore: number;
	bonusXP: number;
	description: string;
}

/**
 * User's daily challenge progress
 */
export interface DailyChallengeProgress {
	lastCompleted?: string; // YYYY-MM-DD
	completedCount: number;
	streak: number; // Consecutive days
}

// ============================================================================
// USER PROGRESS TYPES
// ============================================================================

/**
 * Complete user progress data stored in LocalStorage
 */
export interface UserProgress {
	version: string; // Data format version for migrations
	userId: string; // Generated UUID
	createdAt: string; // ISO timestamp
	lastPlayed: string; // ISO timestamp

	profile: {
		totalXP: number;
		level: number;
		totalGamesPlayed: number;
		totalScore: number;
		dailyStreak: number;
		longestStreak: number;
	};

	exercises: {
		[exerciseId: string]: ExerciseStats;
	};

	achievements: AchievementProgress[];
	dailyChallenges: DailyChallengeProgress;
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

/**
 * Single leaderboard entry
 */
export interface LeaderboardEntry {
	rank: number;
	score: number;
	date: string; // ISO timestamp
	exerciseId: ExerciseId;
	difficulty: DifficultyLevel;
	sessionId: string; // Reference to game session
}

/**
 * Leaderboard for a specific exercise/difficulty combo
 */
export interface Leaderboard {
	exerciseId: ExerciseId;
	difficulty: DifficultyLevel;
	entries: LeaderboardEntry[];
	lastUpdated: string; // ISO timestamp
}

// ============================================================================
// SAMPLE TYPES
// ============================================================================

/**
 * Audio sample category
 */
export type SampleCategory = 'drums' | 'bass' | 'guitar' | 'keys' | 'vocals' | 'mix';

/**
 * Metadata for an audio sample
 */
export interface SampleMetadata {
	id: string;
	path: string;
	category: SampleCategory;
	genre: string;
	duration: number; // seconds
	bpm?: number;
	description: string;
	attribution?: string; // Creative Commons attribution
}
