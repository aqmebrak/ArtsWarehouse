/**
 * Difficulty Configuration for Audio Training Exercises
 *
 * Defines difficulty settings for all exercises including:
 * - Number of rounds
 * - Tolerance/margin of error
 * - Time limits
 * - Visual hints
 * - Score and XP multipliers
 */

import type { DifficultyLevel, DifficultyConfig, ExerciseId } from '$lib/types/audio-training';

// ============================================================================
// BASE DIFFICULTY TEMPLATES
// ============================================================================

/**
 * Base difficulty configurations that most exercises will use
 * Exercises can override specific values as needed
 */
const BASE_DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		rounds: 5,
		tolerance: 0.2, // 20% tolerance (varies by exercise type)
		timeLimit: undefined, // No time limit
		visualHints: true,
		scoreMultiplier: 1.0,
		xpMultiplier: 1.0
	},
	intermediate: {
		rounds: 8,
		tolerance: 0.1, // 10% tolerance
		timeLimit: undefined,
		visualHints: true,
		scoreMultiplier: 1.5,
		xpMultiplier: 1.5
	},
	advanced: {
		rounds: 10,
		tolerance: 0.05, // 5% tolerance
		timeLimit: 60000, // 60 seconds (optional challenge)
		visualHints: false,
		scoreMultiplier: 2.0,
		xpMultiplier: 2.0
	},
	expert: {
		rounds: 12,
		tolerance: 0.03, // 3% tolerance
		timeLimit: 45000, // 45 seconds
		visualHints: false,
		scoreMultiplier: 3.0,
		xpMultiplier: 3.0
	}
};

// ============================================================================
// EXERCISE-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Panning Exercise - Identify stereo panning position
 * Tolerance is % of total pan range (0-1)
 */
const PANNING_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 0.25, // 25% pan range (~45 degrees)
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 0.15, // 15% pan range (~27 degrees)
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 0.1, // 10% pan range (~18 degrees)
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 0.05, // 5% pan range (~9 degrees)
		rounds: 12
	}
};

/**
 * EQ Exercise - Identify boosted frequency
 * Tolerance is in semitones (12 semitones = 1 octave)
 */
const EQ_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 6, // 6 semitones (half octave)
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 4, // 4 semitones
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 2, // 2 semitones
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 1, // 1 semitone
		rounds: 12
	}
};

/**
 * EQ Mirror Exercise - Match EQ curve with 4-band equalizer
 * Tolerance is in dB per band (averaged across all bands)
 */
const EQ_MIRROR_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 3, // ±3dB per band
		rounds: 4
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 2, // ±2dB per band
		rounds: 6
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 1.5, // ±1.5dB per band
		rounds: 8
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 1, // ±1dB per band
		rounds: 10
	}
};

/**
 * DB King Exercise - Identify gain/level changes
 * Tolerance is in dB
 */
const DB_KING_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 2, // ±2dB
		rounds: 6
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 1, // ±1dB
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 0.5, // ±0.5dB
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 0.3, // ±0.3dB (very precise!)
		rounds: 12
	}
};

/**
 * Peak Master Exercise - Identify peak EQ boost frequency
 * Tolerance is in semitones (more forgiving than full EQ)
 */
const PEAK_MASTER_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 8, // 8 semitones
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 5, // 5 semitones
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 3, // 3 semitones
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 1.5, // 1.5 semitones
		rounds: 12
	}
};

/**
 * Kit Cut Exercise - Identify EQ cut frequency
 * Tolerance is in semitones
 */
const KIT_CUT_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 8, // 8 semitones
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 5, // 5 semitones
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 3, // 3 semitones
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 1.5, // 1.5 semitones
		rounds: 12
	}
};

/**
 * Stereohead Exercise - Identify stereo width
 * Tolerance is % of width range (0-100)
 */
const STEREOHEAD_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 20, // ±20% width
		rounds: 6
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 12, // ±12% width
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 8, // ±8% width
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 5, // ±5% width
		rounds: 12
	}
};

/**
 * Filter Expert Exercise - Identify filter type and frequency
 * Tolerance is for frequency matching (semitones) + type must match exactly
 */
const FILTER_EXPERT_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 12, // 12 semitones (1 octave) for frequency
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 8, // 8 semitones
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 4, // 4 semitones
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 2, // 2 semitones
		rounds: 12
	}
};

/**
 * Sonar Beast Exercise - Identify resonant frequency in filter
 * Tolerance is in semitones
 */
const SONAR_BEAST_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 10, // 10 semitones
		rounds: 6
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 6, // 6 semitones
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 3, // 3 semitones
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 1.5, // 1.5 semitones
		rounds: 12
	}
};

/**
 * Bass Detective Exercise - Identify bass frequency content
 * Tolerance is in Hz (lower frequencies need tighter tolerance)
 */
const BASS_DETECTIVE_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 20, // ±20Hz
		rounds: 6
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 12, // ±12Hz
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 8, // ±8Hz
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 5, // ±5Hz
		rounds: 12
	}
};

/**
 * Delay Control Exercise - Identify delay time
 * Tolerance is in milliseconds
 */
const DELAY_CONTROL_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 50, // ±50ms
		rounds: 6
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 30, // ±30ms
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 15, // ±15ms
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 10, // ±10ms
		rounds: 12
	}
};

/**
 * Reverb Wizard Exercise - Identify reverb decay time
 * Tolerance is in milliseconds
 */
const REVERB_WIZARD_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 500, // ±500ms
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 300, // ±300ms
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 150, // ±150ms
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 100, // ±100ms
		rounds: 12
	}
};

/**
 * Dr Compressor Exercise - Identify compression ratio
 * Tolerance is in ratio units (e.g., 2:1, 4:1)
 */
const DR_COMPRESSOR_DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		...BASE_DIFFICULTY_CONFIGS.beginner,
		tolerance: 2, // ±2:1 ratio
		rounds: 5
	},
	intermediate: {
		...BASE_DIFFICULTY_CONFIGS.intermediate,
		tolerance: 1, // ±1:1 ratio
		rounds: 8
	},
	advanced: {
		...BASE_DIFFICULTY_CONFIGS.advanced,
		tolerance: 0.5, // ±0.5:1 ratio
		rounds: 10
	},
	expert: {
		...BASE_DIFFICULTY_CONFIGS.expert,
		tolerance: 0.25, // ±0.25:1 ratio
		rounds: 12
	}
};

// ============================================================================
// MAIN CONFIGURATION MAP
// ============================================================================

/**
 * Complete difficulty configuration for all exercises
 * Access with: DIFFICULTY_CONFIGS[exerciseId][difficulty]
 */
export const DIFFICULTY_CONFIGS: Record<ExerciseId, Record<DifficultyLevel, DifficultyConfig>> = {
	panning: PANNING_DIFFICULTY,
	eq: EQ_DIFFICULTY,
	'eq-mirror': EQ_MIRROR_DIFFICULTY,
	'db-king': DB_KING_DIFFICULTY,
	'peak-master': PEAK_MASTER_DIFFICULTY,
	'kit-cut': KIT_CUT_DIFFICULTY,
	stereohead: STEREOHEAD_DIFFICULTY,
	'filter-expert': FILTER_EXPERT_DIFFICULTY,
	'sonar-beast': SONAR_BEAST_DIFFICULTY,
	'bass-detective': BASS_DETECTIVE_DIFFICULTY,
	'delay-control': DELAY_CONTROL_DIFFICULTY,
	'reverb-wizard': REVERB_WIZARD_DIFFICULTY,
	'dr-compressor': DR_COMPRESSOR_DIFFICULTY
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get difficulty config for a specific exercise
 */
export function getDifficultyConfig(
	exerciseId: ExerciseId,
	difficulty: DifficultyLevel
): DifficultyConfig {
	return DIFFICULTY_CONFIGS[exerciseId][difficulty];
}

/**
 * Get all difficulty levels for an exercise
 */
export function getAllDifficulties(
	exerciseId: ExerciseId
): Record<DifficultyLevel, DifficultyConfig> {
	return DIFFICULTY_CONFIGS[exerciseId];
}

/**
 * Check if a difficulty level is unlocked based on performance
 *
 * Unlock rules:
 * - Beginner: Always unlocked
 * - Intermediate: Score 70%+ on Beginner
 * - Advanced: Score 80%+ on Intermediate
 * - Expert: Score 90%+ on Advanced
 */
export function isDifficultyUnlocked(
	difficulty: DifficultyLevel,
	highScores: Partial<Record<DifficultyLevel, number>>
): boolean {
	switch (difficulty) {
		case 'beginner':
			return true;

		case 'intermediate':
			return (highScores.beginner || 0) >= 70;

		case 'advanced':
			return (highScores.intermediate || 0) >= 80;

		case 'expert':
			return (highScores.advanced || 0) >= 90;

		default:
			return false;
	}
}

/**
 * Get next difficulty level (or null if at max)
 */
export function getNextDifficulty(current: DifficultyLevel): DifficultyLevel | null {
	const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
	const currentIndex = levels.indexOf(current);

	if (currentIndex === -1 || currentIndex === levels.length - 1) {
		return null;
	}

	return levels[currentIndex + 1];
}

/**
 * Get previous difficulty level (or null if at min)
 */
export function getPreviousDifficulty(current: DifficultyLevel): DifficultyLevel | null {
	const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
	const currentIndex = levels.indexOf(current);

	if (currentIndex <= 0) {
		return null;
	}

	return levels[currentIndex - 1];
}

/**
 * Get difficulty color scheme (for UI)
 */
export function getDifficultyColor(difficulty: DifficultyLevel): {
	bg: string;
	text: string;
	border: string;
} {
	switch (difficulty) {
		case 'beginner':
			return {
				bg: 'bg-green-100 dark:bg-green-900',
				text: 'text-green-800 dark:text-green-200',
				border: 'border-green-300 dark:border-green-700'
			};

		case 'intermediate':
			return {
				bg: 'bg-blue-100 dark:bg-blue-900',
				text: 'text-blue-800 dark:text-blue-200',
				border: 'border-blue-300 dark:border-blue-700'
			};

		case 'advanced':
			return {
				bg: 'bg-purple-100 dark:bg-purple-900',
				text: 'text-purple-800 dark:text-purple-200',
				border: 'border-purple-300 dark:border-purple-700'
			};

		case 'expert':
			return {
				bg: 'bg-red-100 dark:bg-red-900',
				text: 'text-red-800 dark:text-red-200',
				border: 'border-red-300 dark:border-red-700'
			};
	}
}

/**
 * Get difficulty label (human-readable)
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
	return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

/**
 * Get recommended difficulty based on player stats
 */
export function getRecommendedDifficulty(
	exerciseId: ExerciseId,
	gamesPlayed: number,
	averageAccuracy: number,
	highScores: Partial<Record<DifficultyLevel, number>>
): DifficultyLevel {
	// New player - start at beginner
	if (gamesPlayed === 0) {
		return 'beginner';
	}

	// Check what's unlocked and recommend highest unlocked level
	if (isDifficultyUnlocked('expert', highScores) && averageAccuracy >= 85) {
		return 'expert';
	}

	if (isDifficultyUnlocked('advanced', highScores) && averageAccuracy >= 80) {
		return 'advanced';
	}

	if (isDifficultyUnlocked('intermediate', highScores) && averageAccuracy >= 75) {
		return 'intermediate';
	}

	return 'beginner';
}

// ============================================================================
// DIFFICULTY PROGRESSION TRACKING
// ============================================================================

/**
 * Get progress towards unlocking next difficulty level
 * Returns percentage (0-100) and target score
 */
export function getUnlockProgress(
	currentDifficulty: DifficultyLevel,
	currentHighScore: number
): { progress: number; targetScore: number; nextDifficulty: DifficultyLevel | null } {
	const next = getNextDifficulty(currentDifficulty);

	if (!next) {
		return { progress: 100, targetScore: 100, nextDifficulty: null };
	}

	// Get required score for next level
	let targetScore = 0;
	switch (next) {
		case 'intermediate':
			targetScore = 70;
			break;
		case 'advanced':
			targetScore = 80;
			break;
		case 'expert':
			targetScore = 90;
			break;
	}

	const progress = Math.min(100, (currentHighScore / targetScore) * 100);

	return { progress, targetScore, nextDifficulty: next };
}
