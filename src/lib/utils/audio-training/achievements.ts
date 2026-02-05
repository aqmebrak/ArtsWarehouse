/**
 * Achievements System for Audio Training
 *
 * Defines all achievements and logic for checking/unlocking them.
 * Achievements are organized into 4 categories:
 * - Getting Started: First-time achievements
 * - Skill Mastery: Performance-based achievements
 * - Challenge: Difficult accomplishments
 * - Consistency: Long-term dedication achievements
 */

import type {
	Achievement,
	AchievementRequirement,
	UserProgress,
	GameSession,
	ExerciseId,
	ExerciseCategory
} from '$lib/types/audio-training';

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

/**
 * All 20 achievements in the audio training system
 */
export const ACHIEVEMENTS: Achievement[] = [
	// ========================================================================
	// GETTING STARTED (5 achievements)
	// ========================================================================
	{
		id: 'first-steps',
		name: 'First Steps',
		description: 'Complete your first training exercise',
		icon: '👶',
		category: 'getting-started',
		requirement: {
			type: 'games-played',
			value: 1
		}
	},
	{
		id: 'ear-explorer',
		name: 'Ear Explorer',
		description: 'Try 3 different exercises',
		icon: '🎧',
		category: 'getting-started',
		requirement: {
			type: 'exercises-tried',
			value: 3
		}
	},
	{
		id: 'frequency-hunter',
		name: 'Frequency Hunter',
		description: 'Complete an EQ-based exercise',
		icon: '🎚️',
		category: 'getting-started',
		requirement: {
			type: 'exercises-tried',
			value: 1,
			exerciseCategory: 'equalization'
		}
	},
	{
		id: 'space-cadet',
		name: 'Space Cadet',
		description: 'Complete a spatial/time exercise',
		icon: '🌌',
		category: 'getting-started',
		requirement: {
			type: 'exercises-tried',
			value: 1,
			exerciseCategory: 'space-time'
		}
	},
	{
		id: 'dynamic-duo',
		name: 'Dynamic Duo',
		description: 'Complete a dynamics exercise',
		icon: '💪',
		category: 'getting-started',
		requirement: {
			type: 'exercises-tried',
			value: 1,
			exerciseCategory: 'dynamics'
		}
	},

	// ========================================================================
	// SKILL MASTERY (8 achievements)
	// ========================================================================
	{
		id: 'perfect-pitch',
		name: 'Perfect Pitch',
		description: 'Get all rounds correct in a single game',
		icon: '🎯',
		category: 'skill-mastery',
		requirement: {
			type: 'perfect-game',
			value: 1
		}
	},
	{
		id: 'sharp-ears',
		name: 'Sharp Ears',
		description: 'Achieve 95%+ accuracy in any exercise',
		icon: '👂',
		category: 'skill-mastery',
		requirement: {
			type: 'accuracy-threshold',
			value: 95
		}
	},
	{
		id: 'frequency-master',
		name: 'Frequency Master',
		description: 'Reach Gold skill level in any EQ exercise',
		icon: '🥇',
		category: 'skill-mastery',
		requirement: {
			type: 'skill-level',
			value: 3, // bronze=1, silver=2, gold=3, platinum=4, diamond=5
			exerciseCategory: 'equalization'
		}
	},
	{
		id: 'intermediate-graduate',
		name: 'Intermediate Graduate',
		description: 'Unlock Intermediate difficulty in any exercise',
		icon: '📈',
		category: 'skill-mastery',
		requirement: {
			type: 'accuracy-threshold',
			value: 70,
			difficulty: 'beginner'
		}
	},
	{
		id: 'advanced-achiever',
		name: 'Advanced Achiever',
		description: 'Unlock Advanced difficulty in any exercise',
		icon: '🚀',
		category: 'skill-mastery',
		requirement: {
			type: 'accuracy-threshold',
			value: 80,
			difficulty: 'intermediate'
		}
	},
	{
		id: 'expert-unlocked',
		name: 'Expert Unlocked',
		description: 'Unlock Expert difficulty in any exercise',
		icon: '⭐',
		category: 'skill-mastery',
		requirement: {
			type: 'accuracy-threshold',
			value: 90,
			difficulty: 'advanced'
		}
	},
	{
		id: 'all-rounder',
		name: 'All-Rounder',
		description: 'Reach Silver skill level in 5 different exercises',
		icon: '🎭',
		category: 'skill-mastery',
		requirement: {
			type: 'skill-level',
			value: 2, // silver
			count: 5
		}
	},
	{
		id: 'diamond-ears',
		name: 'Diamond Ears',
		description: 'Reach Diamond skill level in any exercise',
		icon: '💎',
		category: 'skill-mastery',
		requirement: {
			type: 'skill-level',
			value: 5 // diamond
		}
	},

	// ========================================================================
	// CHALLENGE (4 achievements)
	// ========================================================================
	{
		id: 'perfect-streak',
		name: 'Perfect Streak',
		description: 'Get 10 consecutive rounds correct across any games',
		icon: '🔥',
		category: 'challenge',
		requirement: {
			type: 'streak',
			value: 10
		}
	},
	{
		id: 'speed-demon',
		name: 'Speed Demon',
		description: 'Complete an Advanced exercise in under 30 seconds',
		icon: '⚡',
		category: 'challenge',
		requirement: {
			type: 'perfect-game',
			value: 1,
			difficulty: 'advanced'
			// Additional check: duration < 30s (checked separately)
		}
	},
	{
		id: 'expert-perfectionist',
		name: 'Expert Perfectionist',
		description: 'Get a perfect game on Expert difficulty',
		icon: '👑',
		category: 'challenge',
		requirement: {
			type: 'perfect-game',
			value: 1,
			difficulty: 'expert'
		}
	},
	{
		id: 'century-club',
		name: 'Century Club',
		description: 'Play 100 total games',
		icon: '💯',
		category: 'challenge',
		requirement: {
			type: 'games-played',
			value: 100
		}
	},

	// ========================================================================
	// CONSISTENCY (3 achievements)
	// ========================================================================
	{
		id: 'daily-dedication',
		name: 'Daily Dedication',
		description: 'Maintain a 7-day practice streak',
		icon: '📅',
		category: 'consistency',
		requirement: {
			type: 'daily-challenges',
			value: 7
		}
	},
	{
		id: 'monthly-maestro',
		name: 'Monthly Maestro',
		description: 'Maintain a 30-day practice streak',
		icon: '🗓️',
		category: 'consistency',
		requirement: {
			type: 'daily-challenges',
			value: 30
		}
	},
	{
		id: 'challenge-champion',
		name: 'Challenge Champion',
		description: 'Complete 10 daily challenges',
		icon: '🏆',
		category: 'consistency',
		requirement: {
			type: 'daily-challenges',
			value: 10,
			count: 10 // Total challenges completed (not streak)
		}
	}
];

// ============================================================================
// ACHIEVEMENT CHECKING
// ============================================================================

/**
 * Check if an achievement is unlocked based on current progress
 */
export function checkAchievement(
	achievement: Achievement,
	progress: UserProgress,
	session?: GameSession
): boolean {
	const { requirement } = achievement;

	switch (requirement.type) {
		case 'games-played':
			return progress.profile.totalGamesPlayed >= requirement.value;

		case 'perfect-game':
			return checkPerfectGame(requirement, progress, session);

		case 'perfect-round':
			return checkPerfectRound(requirement, progress, session);

		case 'accuracy-threshold':
			return checkAccuracyThreshold(requirement, progress, session);

		case 'streak':
			return checkStreak(requirement, progress);

		case 'skill-level':
			return checkSkillLevel(requirement, progress);

		case 'exercises-tried':
			return checkExercisesTried(requirement, progress);

		case 'daily-challenges':
			return checkDailyChallenges(requirement, progress);

		default:
			return false;
	}
}

/**
 * Check all achievements and return newly unlocked ones
 */
export function checkAllAchievements(progress: UserProgress, session?: GameSession): string[] {
	const newlyUnlocked: string[] = [];

	for (const achievement of ACHIEVEMENTS) {
		// Skip if already unlocked
		const existing = progress.achievements.find((a) => a.id === achievement.id);
		if (existing?.unlockedAt) continue;

		// Check if should be unlocked
		if (checkAchievement(achievement, progress, session)) {
			newlyUnlocked.push(achievement.id);
		}
	}

	return newlyUnlocked;
}

// ============================================================================
// REQUIREMENT CHECKERS
// ============================================================================

/**
 * Check perfect game requirement
 */
function checkPerfectGame(
	requirement: AchievementRequirement,
	progress: UserProgress,
	session?: GameSession
): boolean {
	if (!session) return false;

	// All rounds must be correct
	const isPerfect = session.rounds.every((r) => r.correct);
	if (!isPerfect) return false;

	// Check difficulty if specified
	if (requirement.difficulty && session.difficulty !== requirement.difficulty) {
		return false;
	}

	// Check exercise if specified
	if (requirement.exerciseId && session.exerciseId !== requirement.exerciseId) {
		return false;
	}

	return true;
}

/**
 * Check perfect round requirement
 */
function checkPerfectRound(
	requirement: AchievementRequirement,
	progress: UserProgress,
	session?: GameSession
): boolean {
	if (!session) return false;

	// At least one round must be correct
	return session.rounds.some((r) => r.correct);
}

/**
 * Check accuracy threshold requirement
 */
function checkAccuracyThreshold(
	requirement: AchievementRequirement,
	progress: UserProgress,
	session?: GameSession
): boolean {
	if (!session) return false;

	// Check if accuracy meets threshold
	if (session.accuracy < requirement.value) return false;

	// Check difficulty if specified
	if (requirement.difficulty && session.difficulty !== requirement.difficulty) {
		return false;
	}

	// Check exercise if specified
	if (requirement.exerciseId && session.exerciseId !== requirement.exerciseId) {
		return false;
	}

	return true;
}

/**
 * Check streak requirement
 */
function checkStreak(requirement: AchievementRequirement, progress: UserProgress): boolean {
	// Check best streak across all exercises
	let maxStreak = 0;

	for (const exerciseId in progress.exercises) {
		const stats = progress.exercises[exerciseId];
		maxStreak = Math.max(maxStreak, stats.bestStreak);
	}

	return maxStreak >= requirement.value;
}

/**
 * Check skill level requirement
 */
function checkSkillLevel(requirement: AchievementRequirement, progress: UserProgress): boolean {
	const skillLevelValues: Record<string, number> = {
		bronze: 1,
		silver: 2,
		gold: 3,
		platinum: 4,
		diamond: 5
	};

	// If count is specified, need that many exercises at this level
	if (requirement.count) {
		let qualifyingExercises = 0;

		for (const exerciseId in progress.exercises) {
			const stats = progress.exercises[exerciseId];
			const levelValue = skillLevelValues[stats.skillLevel];

			if (levelValue >= requirement.value) {
				qualifyingExercises++;
			}
		}

		return qualifyingExercises >= requirement.count;
	}

	// Otherwise, just need one exercise at this level
	for (const exerciseId in progress.exercises) {
		const stats = progress.exercises[exerciseId];
		const levelValue = skillLevelValues[stats.skillLevel];

		// Check category if specified
		if (requirement.exerciseCategory) {
			const category = getExerciseCategory(exerciseId as ExerciseId);
			if (category !== requirement.exerciseCategory) continue;
		}

		if (levelValue >= requirement.value) {
			return true;
		}
	}

	return false;
}

/**
 * Check exercises tried requirement
 */
function checkExercisesTried(requirement: AchievementRequirement, progress: UserProgress): boolean {
	let count = 0;

	for (const exerciseId in progress.exercises) {
		const stats = progress.exercises[exerciseId];

		// Must have played at least one game
		if (stats.gamesPlayed === 0) continue;

		// Check category if specified
		if (requirement.exerciseCategory) {
			const category = getExerciseCategory(exerciseId as ExerciseId);
			if (category !== requirement.exerciseCategory) continue;
		}

		count++;
	}

	return count >= requirement.value;
}

/**
 * Check daily challenges requirement
 */
function checkDailyChallenges(
	requirement: AchievementRequirement,
	progress: UserProgress
): boolean {
	// If count is specified, check total completed
	if (requirement.count) {
		return progress.dailyChallenges.completedCount >= requirement.count;
	}

	// Otherwise, check streak
	return progress.dailyChallenges.streak >= requirement.value;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get exercise category for an exercise ID
 */
function getExerciseCategory(exerciseId: ExerciseId): ExerciseCategory {
	const categoryMap: Record<ExerciseId, ExerciseCategory> = {
		panning: 'space-time',
		eq: 'equalization',
		'eq-mirror': 'equalization',
		'db-king': 'dynamics',
		'peak-master': 'equalization',
		'kit-cut': 'equalization',
		stereohead: 'space-time',
		'filter-expert': 'equalization',
		'sonar-beast': 'quality',
		'bass-detective': 'equalization',
		'delay-control': 'space-time',
		'reverb-wizard': 'space-time',
		'dr-compressor': 'dynamics'
	};

	return categoryMap[exerciseId];
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | undefined {
	return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
	return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Get achievement progress percentage (for progressive achievements)
 */
export function getAchievementProgressPercentage(
	achievement: Achievement,
	progress: UserProgress
): number {
	const { requirement } = achievement;

	switch (requirement.type) {
		case 'games-played':
			return Math.min(100, (progress.profile.totalGamesPlayed / requirement.value) * 100);

		case 'streak': {
			let maxStreak = 0;
			for (const exerciseId in progress.exercises) {
				maxStreak = Math.max(maxStreak, progress.exercises[exerciseId].bestStreak);
			}
			return Math.min(100, (maxStreak / requirement.value) * 100);
		}

		case 'exercises-tried': {
			let count = 0;
			for (const exerciseId in progress.exercises) {
				const stats = progress.exercises[exerciseId];
				if (stats.gamesPlayed > 0) {
					if (!requirement.exerciseCategory) {
						count++;
					} else {
						const category = getExerciseCategory(exerciseId as ExerciseId);
						if (category === requirement.exerciseCategory) count++;
					}
				}
			}
			return Math.min(100, (count / requirement.value) * 100);
		}

		case 'daily-challenges': {
			const value = requirement.count
				? progress.dailyChallenges.completedCount
				: progress.dailyChallenges.streak;
			return Math.min(100, (value / requirement.value) * 100);
		}

		case 'skill-level': {
			if (requirement.count) {
				const skillLevelValues: Record<string, number> = {
					bronze: 1,
					silver: 2,
					gold: 3,
					platinum: 4,
					diamond: 5
				};

				let qualifyingExercises = 0;
				for (const exerciseId in progress.exercises) {
					const stats = progress.exercises[exerciseId];
					const levelValue = skillLevelValues[stats.skillLevel];
					if (levelValue >= requirement.value) qualifyingExercises++;
				}

				return Math.min(100, (qualifyingExercises / requirement.count) * 100);
			}
			return 0; // Binary achievement
		}

		default:
			return 0; // Binary achievements (perfect game, etc.)
	}
}

/**
 * Get total achievement count and unlocked count
 */
export function getAchievementStats(progress: UserProgress): {
	total: number;
	unlocked: number;
	percentage: number;
	byCategory: Record<Achievement['category'], { total: number; unlocked: number }>;
} {
	const total = ACHIEVEMENTS.length;
	const unlocked = progress.achievements.filter((a) => a.unlockedAt).length;
	const percentage = (unlocked / total) * 100;

	const byCategory: Record<Achievement['category'], { total: number; unlocked: number }> = {
		'getting-started': { total: 0, unlocked: 0 },
		'skill-mastery': { total: 0, unlocked: 0 },
		challenge: { total: 0, unlocked: 0 },
		consistency: { total: 0, unlocked: 0 }
	};

	for (const achievement of ACHIEVEMENTS) {
		byCategory[achievement.category].total++;

		const userProgress = progress.achievements.find((a) => a.id === achievement.id);
		if (userProgress?.unlockedAt) {
			byCategory[achievement.category].unlocked++;
		}
	}

	return { total, unlocked, percentage, byCategory };
}

/**
 * Get recently unlocked achievements (last N)
 */
export function getRecentAchievements(progress: UserProgress, limit: number = 5): Achievement[] {
	const unlocked = progress.achievements
		.filter((a) => a.unlockedAt)
		.sort((a, b) => {
			if (!a.unlockedAt || !b.unlockedAt) return 0;
			return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
		})
		.slice(0, limit);

	return unlocked
		.map((a) => getAchievement(a.id))
		.filter((a): a is Achievement => a !== undefined);
}

/**
 * Get next achievements to unlock (closest to completion)
 */
export function getNextAchievements(
	progress: UserProgress,
	limit: number = 3
): Array<{
	achievement: Achievement;
	progress: number;
}> {
	const notUnlocked = ACHIEVEMENTS.filter((achievement) => {
		const existing = progress.achievements.find((a) => a.id === achievement.id);
		return !existing?.unlockedAt;
	});

	const withProgress = notUnlocked.map((achievement) => ({
		achievement,
		progress: getAchievementProgressPercentage(achievement, progress)
	}));

	// Sort by progress (highest first)
	withProgress.sort((a, b) => b.progress - a.progress);

	return withProgress.slice(0, limit);
}

// ============================================================================
// DEBUG HELPERS
// ============================================================================

/**
 * Debug: Show all achievements
 */
export function debugAchievements(): void {
	console.group('🏆 Audio Training Achievements');
	console.log(`Total achievements: ${ACHIEVEMENTS.length}`);

	for (const category of [
		'getting-started',
		'skill-mastery',
		'challenge',
		'consistency'
	] as const) {
		const categoryAchievements = getAchievementsByCategory(category);
		console.group(`${category} (${categoryAchievements.length})`);
		console.table(
			categoryAchievements.map((a) => ({
				ID: a.id,
				Name: a.name,
				Description: a.description,
				Icon: a.icon
			}))
		);
		console.groupEnd();
	}

	console.groupEnd();
}
