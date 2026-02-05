/**
 * XP (Experience Points) System for Audio Training
 *
 * Handles all XP calculation, leveling, and progression mechanics:
 * - XP calculation based on performance
 * - Exponential level curve
 * - Bonus XP for achievements
 * - Level-up rewards
 */

import type { GameSession, DifficultyLevel, UserProgress } from '$lib/types/audio-training';

// ============================================================================
// XP CONSTANTS
// ============================================================================

/**
 * Base XP values for different performance levels
 */
const BASE_XP = {
	PERFECT_ROUND: 50, // All rounds correct
	GOOD_ROUND: 30, // 80%+ accuracy
	PASSING_ROUND: 15, // 60%+ accuracy
	FAILED_ROUND: 5 // Below 60%
} as const;

/**
 * Bonus XP multipliers
 */
const BONUS_MULTIPLIERS = {
	PERFECT_GAME: 2.0, // All rounds perfect
	FAST_COMPLETION: 1.5, // Under time pressure
	FIRST_TIME: 1.3, // First time playing exercise
	DAILY_STREAK_3: 1.2, // 3+ day streak
	DAILY_STREAK_7: 1.5, // 7+ day streak
	DAILY_STREAK_30: 2.0 // 30+ day streak
} as const;

/**
 * Level curve parameters
 * Formula: XP needed = BASE * (level ^ EXPONENT)
 */
const LEVEL_CURVE = {
	BASE: 100,
	EXPONENT: 1.5 // Exponential growth
} as const;

/**
 * Maximum level (for display purposes)
 */
export const MAX_LEVEL = 100;

// ============================================================================
// XP CALCULATION
// ============================================================================

/**
 * Calculate XP earned from a completed game session
 */
export function calculateSessionXP(session: GameSession, progress: UserProgress): number {
	const { rounds, accuracy, difficulty, exerciseId } = session;

	// 1. Base XP from rounds
	let baseXP = 0;
	let perfectRounds = 0;

	for (const round of rounds) {
		if (round.correct) {
			baseXP += BASE_XP.PERFECT_ROUND;
			perfectRounds++;
		} else {
			// Partial credit based on how close they were
			const errorMargin = Math.abs(round.actualValue - round.userGuess);
			const normalizedError = errorMargin / Math.max(round.actualValue, round.userGuess, 1);

			if (normalizedError < 0.2) {
				baseXP += BASE_XP.GOOD_ROUND;
			} else if (normalizedError < 0.4) {
				baseXP += BASE_XP.PASSING_ROUND;
			} else {
				baseXP += BASE_XP.FAILED_ROUND;
			}
		}
	}

	// 2. Difficulty multiplier (from config)
	const difficultyMultipliers: Record<DifficultyLevel, number> = {
		beginner: 1.0,
		intermediate: 1.5,
		advanced: 2.0,
		expert: 3.0
	};

	baseXP *= difficultyMultipliers[difficulty];

	// 3. Accuracy bonus
	let accuracyBonus = 1.0;
	if (accuracy >= 95) accuracyBonus = 1.5;
	else if (accuracy >= 85) accuracyBonus = 1.3;
	else if (accuracy >= 75) accuracyBonus = 1.1;

	baseXP *= accuracyBonus;

	// 4. Perfect game bonus
	if (perfectRounds === rounds.length) {
		baseXP *= BONUS_MULTIPLIERS.PERFECT_GAME;
	}

	// 5. First time bonus
	const exerciseStats = progress.exercises[exerciseId];
	if (!exerciseStats || exerciseStats.gamesPlayed === 0) {
		baseXP *= BONUS_MULTIPLIERS.FIRST_TIME;
	}

	// 6. Daily streak bonus
	const streak = progress.profile.dailyStreak;
	if (streak >= 30) {
		baseXP *= BONUS_MULTIPLIERS.DAILY_STREAK_30;
	} else if (streak >= 7) {
		baseXP *= BONUS_MULTIPLIERS.DAILY_STREAK_7;
	} else if (streak >= 3) {
		baseXP *= BONUS_MULTIPLIERS.DAILY_STREAK_3;
	}

	// 7. Time bonus (if completed under time limit with good accuracy)
	if (session.completedAt && session.startedAt) {
		const duration =
			new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
		const avgTimePerRound = duration / rounds.length;

		// If completed quickly AND maintained good accuracy
		if (avgTimePerRound < 5000 && accuracy >= 80) {
			baseXP *= BONUS_MULTIPLIERS.FAST_COMPLETION;
		}
	}

	return Math.round(baseXP);
}

/**
 * Calculate XP for achievement unlock
 */
export function calculateAchievementXP(achievementCategory: string): number {
	const categoryXP: Record<string, number> = {
		'getting-started': 100,
		'skill-mastery': 500,
		challenge: 300,
		consistency: 250
	};

	return categoryXP[achievementCategory] || 100;
}

/**
 * Calculate bonus XP for daily challenge completion
 */
export function calculateDailyChallengeXP(baseXP: number, scoreVsTarget: number): number {
	// Base daily challenge XP
	let challengeXP = 200;

	// Bonus for exceeding target
	if (scoreVsTarget >= 1.5)
		challengeXP *= 2; // 150%+ of target
	else if (scoreVsTarget >= 1.2)
		challengeXP *= 1.5; // 120%+ of target
	else if (scoreVsTarget >= 1.0) challengeXP *= 1.2; // Met target

	return Math.round(challengeXP);
}

// ============================================================================
// LEVEL CALCULATIONS
// ============================================================================

/**
 * Calculate XP required for a specific level
 * Uses exponential curve: XP = BASE * (level ^ EXPONENT)
 */
export function getXPForLevel(level: number): number {
	if (level <= 1) return 0;

	return Math.round(LEVEL_CURVE.BASE * Math.pow(level, LEVEL_CURVE.EXPONENT));
}

/**
 * Calculate total XP required to reach a level (cumulative)
 */
export function getTotalXPForLevel(level: number): number {
	let totalXP = 0;

	for (let i = 2; i <= level; i++) {
		totalXP += getXPForLevel(i);
	}

	return totalXP;
}

/**
 * Calculate current level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
	let level = 1;

	while (level < MAX_LEVEL) {
		const xpNeeded = getTotalXPForLevel(level + 1);
		if (totalXP < xpNeeded) break;
		level++;
	}

	return level;
}

/**
 * Get XP progress towards next level
 * Returns current XP in level, XP needed for next level, and percentage
 */
export function getLevelProgress(totalXP: number): {
	currentLevel: number;
	currentXP: number;
	xpForNextLevel: number;
	xpIntoCurrentLevel: number;
	progressPercentage: number;
	isMaxLevel: boolean;
} {
	const currentLevel = getLevelFromXP(totalXP);

	if (currentLevel >= MAX_LEVEL) {
		return {
			currentLevel: MAX_LEVEL,
			currentXP: totalXP,
			xpForNextLevel: 0,
			xpIntoCurrentLevel: 0,
			progressPercentage: 100,
			isMaxLevel: true
		};
	}

	const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
	const xpForNextLevel = getXPForLevel(currentLevel + 1);
	const xpIntoCurrentLevel = totalXP - xpForCurrentLevel;
	const progressPercentage = (xpIntoCurrentLevel / xpForNextLevel) * 100;

	return {
		currentLevel,
		currentXP: totalXP,
		xpForNextLevel,
		xpIntoCurrentLevel,
		progressPercentage: Math.min(100, progressPercentage),
		isMaxLevel: false
	};
}

/**
 * Check if player leveled up and return new level(s)
 */
export function checkLevelUp(
	oldXP: number,
	newXP: number
): { leveledUp: boolean; oldLevel: number; newLevel: number; levelsGained: number } {
	const oldLevel = getLevelFromXP(oldXP);
	const newLevel = getLevelFromXP(newXP);
	const levelsGained = newLevel - oldLevel;

	return {
		leveledUp: levelsGained > 0,
		oldLevel,
		newLevel,
		levelsGained
	};
}

// ============================================================================
// XP SYSTEM INTEGRATION
// ============================================================================

/**
 * Add XP to user progress and handle level-ups
 * Returns updated progress and level-up info
 */
export function addXP(
	progress: UserProgress,
	xpAmount: number
): {
	progress: UserProgress;
	levelUp: ReturnType<typeof checkLevelUp>;
	xpAdded: number;
} {
	const updated = {
		...progress,
		profile: { ...progress.profile },
		exercises: { ...progress.exercises },
		achievements: [...progress.achievements],
		dailyChallenges: { ...progress.dailyChallenges }
	};
	const oldXP = updated.profile.totalXP;
	const newXP = oldXP + xpAmount;

	// Update XP
	updated.profile.totalXP = newXP;

	// Check for level-up
	const levelUp = checkLevelUp(oldXP, newXP);

	// Update level
	if (levelUp.leveledUp) {
		updated.profile.level = levelUp.newLevel;
	}

	return {
		progress: updated,
		levelUp,
		xpAdded: xpAmount
	};
}

/**
 * Calculate XP breakdown for display (detailed info)
 */
export function getXPBreakdown(
	session: GameSession,
	progress: UserProgress
): {
	baseXP: number;
	difficultyMultiplier: number;
	accuracyBonus: number;
	perfectGameBonus: number;
	firstTimeBonus: number;
	streakBonus: number;
	timeBonus: number;
	totalXP: number;
	breakdown: string[];
} {
	const breakdown: string[] = [];

	// Base XP
	let baseXP = 0;
	let perfectRounds = 0;

	for (const round of session.rounds) {
		if (round.correct) {
			baseXP += BASE_XP.PERFECT_ROUND;
			perfectRounds++;
		}
	}

	breakdown.push(`Base XP: ${baseXP} (${perfectRounds}/${session.rounds.length} perfect rounds)`);

	// Difficulty
	const difficultyMultipliers: Record<DifficultyLevel, number> = {
		beginner: 1.0,
		intermediate: 1.5,
		advanced: 2.0,
		expert: 3.0
	};
	const diffMult = difficultyMultipliers[session.difficulty];
	breakdown.push(`Difficulty (${session.difficulty}): ×${diffMult}`);

	// Accuracy
	let accuracyBonus = 1.0;
	if (session.accuracy >= 95) accuracyBonus = 1.5;
	else if (session.accuracy >= 85) accuracyBonus = 1.3;
	else if (session.accuracy >= 75) accuracyBonus = 1.1;

	if (accuracyBonus > 1.0) {
		breakdown.push(`Accuracy bonus (${session.accuracy}%): ×${accuracyBonus}`);
	}

	// Perfect game
	const perfectGameBonus =
		perfectRounds === session.rounds.length ? BONUS_MULTIPLIERS.PERFECT_GAME : 1.0;
	if (perfectGameBonus > 1.0) {
		breakdown.push(`Perfect game: ×${perfectGameBonus}`);
	}

	// First time
	const exerciseStats = progress.exercises[session.exerciseId];
	const firstTimeBonus =
		!exerciseStats || exerciseStats.gamesPlayed === 0 ? BONUS_MULTIPLIERS.FIRST_TIME : 1.0;
	if (firstTimeBonus > 1.0) {
		breakdown.push(`First time: ×${firstTimeBonus}`);
	}

	// Streak
	let streakBonus = 1.0;
	const streak = progress.profile.dailyStreak;
	if (streak >= 30) streakBonus = BONUS_MULTIPLIERS.DAILY_STREAK_30;
	else if (streak >= 7) streakBonus = BONUS_MULTIPLIERS.DAILY_STREAK_7;
	else if (streak >= 3) streakBonus = BONUS_MULTIPLIERS.DAILY_STREAK_3;

	if (streakBonus > 1.0) {
		breakdown.push(`Daily streak (${streak} days): ×${streakBonus}`);
	}

	// Time bonus
	let timeBonus = 1.0;
	if (session.completedAt && session.startedAt) {
		const duration =
			new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
		const avgTimePerRound = duration / session.rounds.length;

		if (avgTimePerRound < 5000 && session.accuracy >= 80) {
			timeBonus = BONUS_MULTIPLIERS.FAST_COMPLETION;
			breakdown.push(`Fast completion: ×${timeBonus}`);
		}
	}

	// Calculate total
	const totalXP = Math.round(
		baseXP *
			diffMult *
			accuracyBonus *
			perfectGameBonus *
			firstTimeBonus *
			streakBonus *
			timeBonus
	);

	return {
		baseXP,
		difficultyMultiplier: diffMult,
		accuracyBonus,
		perfectGameBonus,
		firstTimeBonus,
		streakBonus,
		timeBonus,
		totalXP,
		breakdown
	};
}

// ============================================================================
// LEVEL REWARDS
// ============================================================================

/**
 * Get rewards for reaching a specific level
 */
export function getLevelRewards(level: number): {
	title?: string;
	description?: string;
	unlocks?: string[];
} {
	// Milestone levels with special rewards
	const milestones: Record<number, { title: string; description: string; unlocks?: string[] }> = {
		5: {
			title: 'Audio Apprentice',
			description: 'You are learning the basics!',
			unlocks: ['Daily Challenges']
		},
		10: {
			title: 'Frequency Fighter',
			description: 'Your ears are getting sharp!',
			unlocks: ['Leaderboards']
		},
		20: {
			title: 'Mix Master',
			description: 'You have mastered the fundamentals!',
			unlocks: ['Expert difficulty on all exercises']
		},
		30: {
			title: 'Audio Engineer',
			description: 'You are reaching professional level!'
		},
		50: {
			title: 'Sonic Wizard',
			description: 'Your skills are exceptional!'
		},
		75: {
			title: 'Mix Guru',
			description: 'You are among the elite!'
		},
		100: {
			title: 'Audio Legend',
			description: 'You have achieved maximum level!'
		}
	};

	return milestones[level] || {};
}

/**
 * Get display title based on level
 */
export function getLevelTitle(level: number): string {
	if (level >= 100) return 'Audio Legend';
	if (level >= 75) return 'Mix Guru';
	if (level >= 50) return 'Sonic Wizard';
	if (level >= 30) return 'Audio Engineer';
	if (level >= 20) return 'Mix Master';
	if (level >= 10) return 'Frequency Fighter';
	if (level >= 5) return 'Audio Apprentice';
	return 'Novice';
}

// ============================================================================
// XP VISUALIZATION HELPERS
// ============================================================================

/**
 * Get color scheme for XP level (for UI)
 */
export function getLevelColor(level: number): {
	bg: string;
	text: string;
	border: string;
	gradient: string;
} {
	if (level >= 75) {
		return {
			bg: 'bg-purple-100 dark:bg-purple-900',
			text: 'text-purple-800 dark:text-purple-200',
			border: 'border-purple-300 dark:border-purple-700',
			gradient: '#a855f7 0%, #c084fc 100%' // purple-500 to purple-400
		};
	}

	if (level >= 50) {
		return {
			bg: 'bg-purple-100 dark:bg-purple-900',
			text: 'text-purple-800 dark:text-purple-200',
			border: 'border-purple-300 dark:border-purple-700',
			gradient: '#9333ea 0%, #a855f7 100%' // purple-600 to purple-500
		};
	}

	if (level >= 25) {
		return {
			bg: 'bg-purple-100 dark:bg-purple-900',
			text: 'text-purple-800 dark:text-purple-200',
			border: 'border-purple-300 dark:border-purple-700',
			gradient: '#7c3aed 0%, #9333ea 100%' // purple-700 to purple-600
		};
	}

	return {
		bg: 'bg-slate-100 dark:bg-slate-900',
		text: 'text-slate-800 dark:text-slate-200',
		border: 'border-slate-300 dark:border-slate-700',
		gradient: '#64748b 0%, #7c3aed 100%' // slate-500 to purple-700
	};
}

/**
 * Format XP number for display (e.g., 1234 => "1.2K")
 */
export function formatXP(xp: number): string {
	if (xp >= 1000000) {
		return `${(xp / 1000000).toFixed(1)}M`;
	}

	if (xp >= 1000) {
		return `${(xp / 1000).toFixed(1)}K`;
	}

	return xp.toString();
}

// ============================================================================
// DEBUG HELPERS
// ============================================================================

/**
 * Generate XP table for testing (shows XP needed per level)
 */
export function generateXPTable(maxLevel: number = 20): void {
	console.table(
		Array.from({ length: maxLevel }, (_, i) => {
			const level = i + 1;
			return {
				Level: level,
				'XP This Level': getXPForLevel(level),
				'Total XP': getTotalXPForLevel(level),
				Title: getLevelTitle(level)
			};
		})
	);
}
