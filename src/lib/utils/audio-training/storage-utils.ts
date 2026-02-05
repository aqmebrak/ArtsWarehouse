/**
 * LocalStorage Management for Audio Training System
 *
 * Handles all persistent storage operations including:
 * - User progress data (XP, levels, stats)
 * - Game session history
 * - Leaderboards per exercise/difficulty
 * - Data export/import functionality
 * - Version migration support
 */

import type {
	UserProgress,
	GameSession,
	ExerciseStats,
	AchievementProgress,
	Leaderboard,
	LeaderboardEntry,
	ExerciseId,
	DifficultyLevel,
	SkillLevel
} from '$lib/types/audio-training';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
	PROGRESS: 'audio-training-progress',
	HISTORY: 'audio-training-history',
	LEADERBOARD_PREFIX: 'audio-training-leaderboard'
} as const;

// ============================================================================
// CONSTANTS
// ============================================================================

const CURRENT_VERSION = '1.0.0';
const MAX_HISTORY_ENTRIES = 100;
const MAX_LEADERBOARD_ENTRIES = 100;

// ============================================================================
// STORAGE MANAGER CLASS
// ============================================================================

/**
 * Main storage manager for all audio training data
 * Handles serialization, validation, and browser storage interactions
 */
export class StorageManager {
	/**
	 * Load user progress from LocalStorage
	 * Returns null if no data exists or data is invalid
	 */
	static loadProgress(): UserProgress | null {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
			if (!data) return null;

			const progress: UserProgress = JSON.parse(data);

			// Validate data structure
			if (!this.validateProgress(progress)) {
				console.warn('[StorageManager] Invalid progress data, creating new');
				return null;
			}

			// Check for version migration (future-proofing)
			if (progress.version !== CURRENT_VERSION) {
				return this.migrateProgress(progress);
			}

			return progress;
		} catch (error) {
			console.error('[StorageManager] Failed to load progress:', error);
			return null;
		}
	}

	/**
	 * Save user progress to LocalStorage
	 */
	static saveProgress(progress: UserProgress): void {
		try {
			progress.version = CURRENT_VERSION;
			progress.lastPlayed = new Date().toISOString();

			const json = JSON.stringify(progress);
			localStorage.setItem(STORAGE_KEYS.PROGRESS, json);
		} catch (error) {
			console.error('[StorageManager] Failed to save progress:', error);
			throw new Error('Storage quota exceeded or localStorage unavailable');
		}
	}

	/**
	 * Create a new user progress object with default values
	 */
	static createNewProgress(): UserProgress {
		const now = new Date().toISOString();
		const userId = crypto.randomUUID();

		return {
			version: CURRENT_VERSION,
			userId,
			createdAt: now,
			lastPlayed: now,
			profile: {
				totalXP: 0,
				level: 1,
				totalGamesPlayed: 0,
				totalScore: 0,
				dailyStreak: 0,
				longestStreak: 0
			},
			exercises: {},
			achievements: [],
			dailyChallenges: {
				completedCount: 0,
				streak: 0
			}
		};
	}

	/**
	 * Get or create user progress (convenience method)
	 */
	static getProgress(): UserProgress {
		return this.loadProgress() || this.createNewProgress();
	}

	/**
	 * Save a completed game session to history
	 */
	static saveGameSession(session: GameSession): void {
		try {
			const history = this.getGameHistory();
			history.unshift(session); // Add to beginning

			// Trim to max entries
			if (history.length > MAX_HISTORY_ENTRIES) {
				history.length = MAX_HISTORY_ENTRIES;
			}

			const json = JSON.stringify(history);
			localStorage.setItem(STORAGE_KEYS.HISTORY, json);
		} catch (error) {
			console.error('[StorageManager] Failed to save game session:', error);
		}
	}

	/**
	 * Get game session history
	 * @param limit - Maximum number of entries to return
	 */
	static getGameHistory(limit?: number): GameSession[] {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
			if (!data) return [];

			const history: GameSession[] = JSON.parse(data);

			return limit ? history.slice(0, limit) : history;
		} catch (error) {
			console.error('[StorageManager] Failed to load game history:', error);
			return [];
		}
	}

	/**
	 * Update leaderboard for a specific exercise/difficulty
	 */
	static updateLeaderboard(
		exerciseId: ExerciseId,
		difficulty: DifficultyLevel,
		entry: Omit<LeaderboardEntry, 'rank'>
	): void {
		try {
			const leaderboard = this.getLeaderboard(exerciseId, difficulty);

			// Add new entry
			const newEntry: LeaderboardEntry = {
				...entry,
				rank: 0 // Will be recalculated
			};

			leaderboard.entries.push(newEntry);

			// Sort by score (descending)
			leaderboard.entries.sort((a, b) => b.score - a.score);

			// Trim to max entries
			if (leaderboard.entries.length > MAX_LEADERBOARD_ENTRIES) {
				leaderboard.entries.length = MAX_LEADERBOARD_ENTRIES;
			}

			// Update ranks
			leaderboard.entries.forEach((entry, index) => {
				entry.rank = index + 1;
			});

			leaderboard.lastUpdated = new Date().toISOString();

			// Save
			const key = this.getLeaderboardKey(exerciseId, difficulty);
			localStorage.setItem(key, JSON.stringify(leaderboard));
		} catch (error) {
			console.error('[StorageManager] Failed to update leaderboard:', error);
		}
	}

	/**
	 * Get leaderboard for a specific exercise/difficulty
	 */
	static getLeaderboard(exerciseId: ExerciseId, difficulty: DifficultyLevel): Leaderboard {
		try {
			const key = this.getLeaderboardKey(exerciseId, difficulty);
			const data = localStorage.getItem(key);

			if (!data) {
				// Return empty leaderboard
				return {
					exerciseId,
					difficulty,
					entries: [],
					lastUpdated: new Date().toISOString()
				};
			}

			return JSON.parse(data);
		} catch (error) {
			console.error('[StorageManager] Failed to load leaderboard:', error);
			return {
				exerciseId,
				difficulty,
				entries: [],
				lastUpdated: new Date().toISOString()
			};
		}
	}

	/**
	 * Get user's rank on a specific leaderboard
	 */
	static getUserRank(
		exerciseId: ExerciseId,
		difficulty: DifficultyLevel,
		sessionId: string
	): number | null {
		const leaderboard = this.getLeaderboard(exerciseId, difficulty);
		const entry = leaderboard.entries.find((e) => e.sessionId === sessionId);
		return entry ? entry.rank : null;
	}

	/**
	 * Export all data as JSON string
	 */
	static exportData(): string {
		const progress = this.loadProgress();
		const history = this.getGameHistory();

		// Get all leaderboards (we'll scan localStorage)
		const leaderboards: Leaderboard[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_KEYS.LEADERBOARD_PREFIX)) {
				const data = localStorage.getItem(key);
				if (data) {
					try {
						leaderboards.push(JSON.parse(data));
					} catch (e) {
						console.warn(`Failed to parse leaderboard: ${key}`);
					}
				}
			}
		}

		const exportData = {
			version: CURRENT_VERSION,
			exportedAt: new Date().toISOString(),
			progress,
			history,
			leaderboards
		};

		return JSON.stringify(exportData, null, 2);
	}

	/**
	 * Import data from JSON string
	 * @returns Success status and any error messages
	 */
	static importData(json: string): { success: boolean; message: string } {
		try {
			const data = JSON.parse(json);

			// Validate structure
			if (!data.version || !data.progress) {
				return { success: false, message: 'Invalid data format' };
			}

			// Import progress
			if (data.progress) {
				this.saveProgress(data.progress);
			}

			// Import history
			if (data.history && Array.isArray(data.history)) {
				localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
			}

			// Import leaderboards
			if (data.leaderboards && Array.isArray(data.leaderboards)) {
				for (const leaderboard of data.leaderboards) {
					const key = this.getLeaderboardKey(
						leaderboard.exerciseId,
						leaderboard.difficulty
					);
					localStorage.setItem(key, JSON.stringify(leaderboard));
				}
			}

			return { success: true, message: 'Data imported successfully' };
		} catch (error) {
			console.error('[StorageManager] Import failed:', error);
			return { success: false, message: `Import failed: ${error}` };
		}
	}

	/**
	 * Clear all audio training data from localStorage
	 * WARNING: This is irreversible!
	 */
	static clearAllData(): void {
		try {
			// Remove progress and history
			localStorage.removeItem(STORAGE_KEYS.PROGRESS);
			localStorage.removeItem(STORAGE_KEYS.HISTORY);

			// Remove all leaderboards
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(STORAGE_KEYS.LEADERBOARD_PREFIX)) {
					keysToRemove.push(key);
				}
			}

			keysToRemove.forEach((key) => localStorage.removeItem(key));

			console.log('[StorageManager] All data cleared');
		} catch (error) {
			console.error('[StorageManager] Failed to clear data:', error);
		}
	}

	/**
	 * Get storage usage statistics
	 */
	static getStorageStats(): {
		progressSize: number;
		historySize: number;
		leaderboardsSize: number;
		totalSize: number;
	} {
		const getSize = (key: string): number => {
			const data = localStorage.getItem(key);
			return data ? new Blob([data]).size : 0;
		};

		const progressSize = getSize(STORAGE_KEYS.PROGRESS);
		const historySize = getSize(STORAGE_KEYS.HISTORY);

		let leaderboardsSize = 0;
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_KEYS.LEADERBOARD_PREFIX)) {
				leaderboardsSize += getSize(key);
			}
		}

		return {
			progressSize,
			historySize,
			leaderboardsSize,
			totalSize: progressSize + historySize + leaderboardsSize
		};
	}

	// ========================================================================
	// HELPER METHODS
	// ========================================================================

	/**
	 * Generate leaderboard storage key
	 */
	private static getLeaderboardKey(exerciseId: ExerciseId, difficulty: DifficultyLevel): string {
		return `${STORAGE_KEYS.LEADERBOARD_PREFIX}-${exerciseId}-${difficulty}`;
	}

	/**
	 * Validate progress data structure
	 */
	private static validateProgress(progress: UserProgress): boolean {
		return (
			typeof progress === 'object' &&
			typeof progress.userId === 'string' &&
			typeof progress.profile === 'object' &&
			typeof progress.profile.totalXP === 'number' &&
			typeof progress.profile.level === 'number' &&
			typeof progress.exercises === 'object' &&
			Array.isArray(progress.achievements)
		);
	}

	/**
	 * Migrate progress data from older versions (future-proofing)
	 */
	private static migrateProgress(oldProgress: UserProgress): UserProgress {
		console.log(`[StorageManager] Migrating from ${oldProgress.version} to ${CURRENT_VERSION}`);

		// For now, just update version - in future, handle breaking changes
		const migrated = { ...oldProgress };
		migrated.version = CURRENT_VERSION;

		// Save migrated data
		this.saveProgress(migrated);

		return migrated;
	}
}

// ============================================================================
// EXERCISE STATS HELPERS
// ============================================================================

/**
 * Get stats for a specific exercise (or create default)
 */
export function getExerciseStats(progress: UserProgress, exerciseId: ExerciseId): ExerciseStats {
	if (!progress.exercises[exerciseId]) {
		// Create default stats
		return {
			gamesPlayed: 0,
			highScore: 0,
			totalScore: 0,
			averageAccuracy: 0,
			currentDifficulty: 'beginner',
			skillLevel: 'bronze',
			lastPlayed: new Date().toISOString(),
			bestStreak: 0
		};
	}

	return progress.exercises[exerciseId];
}

/**
 * Update exercise stats after a game session
 */
export function updateExerciseStats(stats: ExerciseStats, session: GameSession): ExerciseStats {
	const updated: ExerciseStats = { ...stats };

	updated.gamesPlayed += 1;
	updated.totalScore += session.finalScore;
	updated.lastPlayed = session.completedAt || new Date().toISOString();

	// Update high score
	if (session.finalScore > updated.highScore) {
		updated.highScore = session.finalScore;
	}

	// Update average accuracy
	const totalAccuracy = stats.averageAccuracy * stats.gamesPlayed + session.accuracy;
	updated.averageAccuracy = totalAccuracy / updated.gamesPlayed;

	// Calculate best streak (consecutive correct rounds)
	const streak = calculateStreak(session.rounds);
	if (streak > updated.bestStreak) {
		updated.bestStreak = streak;
	}

	return updated;
}

/**
 * Calculate skill level based on stats
 */
export function calculateSkillLevel(stats: ExerciseStats): SkillLevel {
	const { gamesPlayed, averageAccuracy, highScore } = stats;

	// Diamond: 50+ games, 95%+ accuracy, high score
	if (gamesPlayed >= 50 && averageAccuracy >= 95 && highScore >= 900) {
		return 'diamond';
	}

	// Platinum: 30+ games, 90%+ accuracy
	if (gamesPlayed >= 30 && averageAccuracy >= 90 && highScore >= 800) {
		return 'platinum';
	}

	// Gold: 20+ games, 85%+ accuracy
	if (gamesPlayed >= 20 && averageAccuracy >= 85 && highScore >= 700) {
		return 'gold';
	}

	// Silver: 10+ games, 75%+ accuracy
	if (gamesPlayed >= 10 && averageAccuracy >= 75) {
		return 'silver';
	}

	// Bronze: default
	return 'bronze';
}

/**
 * Calculate longest streak of consecutive correct rounds
 */
function calculateStreak(rounds: { correct: boolean }[]): number {
	let maxStreak = 0;
	let currentStreak = 0;

	for (const round of rounds) {
		if (round.correct) {
			currentStreak++;
			maxStreak = Math.max(maxStreak, currentStreak);
		} else {
			currentStreak = 0;
		}
	}

	return maxStreak;
}

// ============================================================================
// ACHIEVEMENT HELPERS
// ============================================================================

/**
 * Get achievement progress (or create default)
 */
export function getAchievementProgress(
	progress: UserProgress,
	achievementId: string
): AchievementProgress {
	const existing = progress.achievements.find((a) => a.id === achievementId);

	if (existing) {
		return existing;
	}

	// Create default
	return {
		id: achievementId,
		progress: 0
	};
}

/**
 * Unlock an achievement
 */
export function unlockAchievement(progress: UserProgress, achievementId: string): UserProgress {
	const updated = { ...progress };
	const existing = updated.achievements.find((a) => a.id === achievementId);

	if (existing) {
		// Already tracked, mark as unlocked
		existing.unlockedAt = new Date().toISOString();
		existing.progress = 100;
	} else {
		// Add new achievement
		updated.achievements.push({
			id: achievementId,
			unlockedAt: new Date().toISOString(),
			progress: 100
		});
	}

	return updated;
}

/**
 * Update achievement progress (for progressive achievements)
 */
export function updateAchievementProgress(
	progress: UserProgress,
	achievementId: string,
	progressValue: number
): UserProgress {
	const updated = { ...progress };
	const existing = updated.achievements.find((a) => a.id === achievementId);

	if (existing) {
		existing.progress = Math.min(100, progressValue);
	} else {
		updated.achievements.push({
			id: achievementId,
			progress: Math.min(100, progressValue)
		});
	}

	return updated;
}

// ============================================================================
// DAILY STREAK HELPERS
// ============================================================================

/**
 * Update daily streak based on last played date
 */
export function updateDailyStreak(progress: UserProgress): UserProgress {
	const updated = { ...progress };
	const now = new Date();
	const lastPlayed = new Date(progress.lastPlayed);

	// Get dates without time
	const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const lastDate = new Date(
		lastPlayed.getFullYear(),
		lastPlayed.getMonth(),
		lastPlayed.getDate()
	);

	const daysDiff = Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

	if (daysDiff === 1) {
		// Consecutive day - increment streak
		updated.profile.dailyStreak += 1;
		updated.profile.longestStreak = Math.max(
			updated.profile.longestStreak,
			updated.profile.dailyStreak
		);
	} else if (daysDiff > 1) {
		// Streak broken - reset
		updated.profile.dailyStreak = 1;
	}
	// If daysDiff === 0, same day - don't change streak

	return updated;
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Debug helper to inspect storage in console
 */
export function debugStorage(): void {
	console.group('🎮 Audio Training Storage Debug');
	console.log('Progress:', StorageManager.loadProgress());
	console.log('History:', StorageManager.getGameHistory(10));
	console.log('Storage Stats:', StorageManager.getStorageStats());
	console.groupEnd();
}

/**
 * Attach debug utilities to window object (development only)
 */
export function attachDebugToWindow(): void {
	if (typeof window !== 'undefined') {
		(window as any).audioTrainingDebug = {
			showProgress: () => console.table(StorageManager.loadProgress()),
			showHistory: (limit = 10) => console.table(StorageManager.getGameHistory(limit)),
			clearData: () => {
				if (confirm('Are you sure you want to clear all data?')) {
					StorageManager.clearAllData();
					console.log('✅ All data cleared');
				}
			},
			exportData: () => {
				const json = StorageManager.exportData();
				console.log('📦 Export data (copy this):');
				console.log(json);
				return json;
			},
			importData: (json: string) => {
				const result = StorageManager.importData(json);
				console.log(result.success ? '✅' : '❌', result.message);
				return result;
			},
			stats: () => console.table(StorageManager.getStorageStats()),
			help: () => {
				console.log(`
🎮 Audio Training Debug Commands:
  
  audioTrainingDebug.showProgress()     - View current progress
  audioTrainingDebug.showHistory(10)    - View last 10 game sessions
  audioTrainingDebug.clearData()        - Clear all data (with confirmation)
  audioTrainingDebug.exportData()       - Export all data as JSON
  audioTrainingDebug.importData(json)   - Import data from JSON string
  audioTrainingDebug.stats()            - View storage usage stats
  audioTrainingDebug.help()             - Show this help message
        `);
			}
		};

		console.log('🎮 Debug utilities attached to window.audioTrainingDebug');
		console.log('Type audioTrainingDebug.help() for commands');
	}
}
