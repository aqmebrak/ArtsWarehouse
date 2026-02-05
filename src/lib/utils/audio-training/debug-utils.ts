/**
 * Debug Utilities for Audio Training Development
 *
 * Provides helpful debugging tools for development including:
 * - Console logging helpers
 * - Storage inspection
 * - XP/Level testing
 * - Achievement unlocking
 * - Data manipulation for testing
 */

import { StorageManager, debugStorage } from './storage-utils';
import { getLevelFromXP, getLevelProgress, calculateSessionXP, generateXPTable } from './xp-system';
import { ACHIEVEMENTS, debugAchievements, getAchievementStats } from './achievements';
import type {
	UserProgress,
	GameSession,
	ExerciseId,
	DifficultyLevel
} from '$lib/types/audio-training';

// ============================================================================
// LOGGING HELPERS
// ============================================================================

/**
 * Debug logger with toggle
 */
class DebugLogger {
	private enabled = false;

	enable(): void {
		this.enabled = true;
		console.log('🎮 Audio Training Debug Mode: ENABLED');
	}

	disable(): void {
		this.enabled = false;
		console.log('🎮 Audio Training Debug Mode: DISABLED');
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	log(message: string, ...args: any[]): void {
		if (this.enabled) {
			console.log(`[AudioTraining] ${message}`, ...args);
		}
	}

	warn(message: string, ...args: any[]): void {
		if (this.enabled) {
			console.warn(`[AudioTraining] ${message}`, ...args);
		}
	}

	error(message: string, ...args: any[]): void {
		if (this.enabled) {
			console.error(`[AudioTraining] ${message}`, ...args);
		}
	}

	group(label: string): void {
		if (this.enabled) {
			console.group(`[AudioTraining] ${label}`);
		}
	}

	groupEnd(): void {
		if (this.enabled) {
			console.groupEnd();
		}
	}

	table(data: any): void {
		if (this.enabled) {
			console.table(data);
		}
	}
}

export const logger = new DebugLogger();

// ============================================================================
// PROGRESS INSPECTION
// ============================================================================

/**
 * Show detailed progress information
 */
export function inspectProgress(): void {
	const progress = StorageManager.loadProgress();

	if (!progress) {
		console.warn('No progress data found');
		return;
	}

	console.group('📊 User Progress');

	// Profile
	console.group('Profile');
	console.table({
		'User ID': progress.userId,
		'Total XP': progress.profile.totalXP,
		Level: progress.profile.level,
		'Total Games': progress.profile.totalGamesPlayed,
		'Total Score': progress.profile.totalScore,
		'Daily Streak': progress.profile.dailyStreak,
		'Longest Streak': progress.profile.longestStreak
	});
	console.groupEnd();

	// Level progress
	const levelInfo = getLevelProgress(progress.profile.totalXP);
	console.group('Level Progress');
	console.table({
		'Current Level': levelInfo.currentLevel,
		'XP in Current Level': levelInfo.xpIntoCurrentLevel,
		'XP for Next Level': levelInfo.xpForNextLevel,
		'Progress %': levelInfo.progressPercentage.toFixed(2)
	});
	console.groupEnd();

	// Exercises
	console.group('Exercises');
	const exerciseData = Object.entries(progress.exercises).map(([id, stats]) => ({
		Exercise: id,
		'Games Played': stats.gamesPlayed,
		'High Score': stats.highScore,
		'Avg Accuracy': stats.averageAccuracy.toFixed(1) + '%',
		Difficulty: stats.currentDifficulty,
		'Skill Level': stats.skillLevel,
		'Best Streak': stats.bestStreak
	}));
	console.table(exerciseData);
	console.groupEnd();

	// Achievements
	const achievementStats = getAchievementStats(progress);
	console.group('Achievements');
	console.table({
		Total: achievementStats.total,
		Unlocked: achievementStats.unlocked,
		'Progress %': achievementStats.percentage.toFixed(1)
	});
	console.table(achievementStats.byCategory);
	console.groupEnd();

	console.groupEnd();
}

/**
 * Show game history
 */
export function inspectHistory(limit: number = 10): void {
	const history = StorageManager.getGameHistory(limit);

	console.group(`📜 Game History (last ${limit})`);
	console.table(
		history.map((session) => ({
			Exercise: session.exerciseId,
			Difficulty: session.difficulty,
			Score: session.finalScore,
			'Accuracy %': session.accuracy.toFixed(1),
			'XP Earned': session.xpEarned,
			'Completed At': new Date(session.completedAt || '').toLocaleString()
		}))
	);
	console.groupEnd();
}

// ============================================================================
// XP/LEVEL TESTING
// ============================================================================

/**
 * Add XP to current progress (testing)
 */
export function addTestXP(amount: number): void {
	const progress = StorageManager.getProgress();
	const oldXP = progress.profile.totalXP;
	const oldLevel = progress.profile.level;

	progress.profile.totalXP += amount;
	progress.profile.level = getLevelFromXP(progress.profile.totalXP);

	StorageManager.saveProgress(progress);

	console.log('✅ XP Added');
	console.table({
		'Old XP': oldXP,
		'Added XP': amount,
		'New XP': progress.profile.totalXP,
		'Old Level': oldLevel,
		'New Level': progress.profile.level
	});
}

/**
 * Set level directly (testing)
 */
export function setTestLevel(level: number): void {
	const progress = StorageManager.getProgress();
	const oldLevel = progress.profile.level;

	// Calculate XP needed for this level
	let totalXP = 0;
	for (let i = 2; i <= level; i++) {
		totalXP += Math.round(100 * Math.pow(i, 1.5));
	}

	progress.profile.totalXP = totalXP;
	progress.profile.level = level;

	StorageManager.saveProgress(progress);

	console.log('✅ Level Set');
	console.table({
		'Old Level': oldLevel,
		'New Level': level,
		'Total XP': totalXP
	});
}

/**
 * Show XP table for level planning
 */
export function showXPTable(maxLevel: number = 25): void {
	console.log(`📊 XP Requirements Table (Levels 1-${maxLevel})`);
	generateXPTable(maxLevel);
}

// ============================================================================
// ACHIEVEMENT TESTING
// ============================================================================

/**
 * Unlock achievement (testing)
 */
export function unlockTestAchievement(achievementId: string): void {
	const progress = StorageManager.getProgress();
	const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

	if (!achievement) {
		console.error(`❌ Achievement not found: ${achievementId}`);
		return;
	}

	// Check if already unlocked
	const existing = progress.achievements.find((a) => a.id === achievementId);
	if (existing?.unlockedAt) {
		console.warn(`⚠️ Achievement already unlocked: ${achievement.name}`);
		return;
	}

	// Unlock it
	if (existing) {
		existing.unlockedAt = new Date().toISOString();
		existing.progress = 100;
	} else {
		progress.achievements.push({
			id: achievementId,
			unlockedAt: new Date().toISOString(),
			progress: 100
		});
	}

	StorageManager.saveProgress(progress);

	console.log(`✅ Achievement Unlocked: ${achievement.icon} ${achievement.name}`);
	console.log(`   ${achievement.description}`);
}

/**
 * Unlock all achievements (testing)
 */
export function unlockAllAchievements(): void {
	const progress = StorageManager.getProgress();

	for (const achievement of ACHIEVEMENTS) {
		const existing = progress.achievements.find((a) => a.id === achievement.id);

		if (existing) {
			existing.unlockedAt = new Date().toISOString();
			existing.progress = 100;
		} else {
			progress.achievements.push({
				id: achievement.id,
				unlockedAt: new Date().toISOString(),
				progress: 100
			});
		}
	}

	StorageManager.saveProgress(progress);
	console.log(`✅ All ${ACHIEVEMENTS.length} achievements unlocked!`);
}

/**
 * Reset achievements (testing)
 */
export function resetAchievements(): void {
	const progress = StorageManager.getProgress();
	progress.achievements = [];
	StorageManager.saveProgress(progress);
	console.log('✅ All achievements reset');
}

// ============================================================================
// EXERCISE TESTING
// ============================================================================

/**
 * Create a test game session
 */
export function createTestSession(
	exerciseId: ExerciseId,
	difficulty: DifficultyLevel,
	accuracy: number
): GameSession {
	const rounds = 10;
	const correctRounds = Math.round((accuracy / 100) * rounds);

	const session: GameSession = {
		sessionId: crypto.randomUUID(),
		exerciseId,
		difficulty,
		startedAt: new Date(Date.now() - 60000).toISOString(), // 1 min ago
		completedAt: new Date().toISOString(),
		rounds: Array.from({ length: rounds }, (_, i) => ({
			correct: i < correctRounds,
			points: i < correctRounds ? 100 : 0,
			actualValue: Math.random(),
			userGuess: Math.random(),
			responseTime: Math.random() * 5000
		})),
		finalScore: Math.round((accuracy / 100) * 100 * rounds),
		accuracy,
		xpEarned: 0 // Will be calculated
	};

	// Calculate XP
	const progress = StorageManager.getProgress();
	session.xpEarned = calculateSessionXP(session, progress);

	return session;
}

/**
 * Simulate playing a game (testing)
 */
export function playTestGame(
	exerciseId: ExerciseId,
	difficulty: DifficultyLevel,
	accuracy: number
): void {
	const progress = StorageManager.getProgress();
	const session = createTestSession(exerciseId, difficulty, accuracy);

	// Save session
	StorageManager.saveGameSession(session);

	// Update progress
	progress.profile.totalGamesPlayed++;
	progress.profile.totalScore += session.finalScore;
	progress.profile.totalXP += session.xpEarned;
	progress.profile.level = getLevelFromXP(progress.profile.totalXP);

	// Update exercise stats
	if (!progress.exercises[exerciseId]) {
		progress.exercises[exerciseId] = {
			gamesPlayed: 0,
			highScore: 0,
			totalScore: 0,
			averageAccuracy: 0,
			currentDifficulty: difficulty,
			skillLevel: 'bronze',
			lastPlayed: new Date().toISOString(),
			bestStreak: 0
		};
	}

	const stats = progress.exercises[exerciseId];
	stats.gamesPlayed++;
	stats.totalScore += session.finalScore;
	stats.highScore = Math.max(stats.highScore, session.finalScore);
	stats.averageAccuracy = stats.totalScore / stats.gamesPlayed;
	stats.lastPlayed = session.completedAt || new Date().toISOString();

	StorageManager.saveProgress(progress);

	console.log('✅ Test game completed');
	console.table({
		Exercise: exerciseId,
		Difficulty: difficulty,
		Score: session.finalScore,
		'Accuracy %': accuracy,
		'XP Earned': session.xpEarned
	});
}

/**
 * Simulate multiple games (bulk testing)
 */
export function playTestGames(
	exerciseId: ExerciseId,
	difficulty: DifficultyLevel,
	count: number,
	minAccuracy: number = 70,
	maxAccuracy: number = 95
): void {
	console.log(`🎮 Playing ${count} test games...`);

	for (let i = 0; i < count; i++) {
		const accuracy = minAccuracy + Math.random() * (maxAccuracy - minAccuracy);
		playTestGame(exerciseId, difficulty, accuracy);
	}

	console.log(`✅ Completed ${count} test games`);
	inspectProgress();
}

// ============================================================================
// STREAK TESTING
// ============================================================================

/**
 * Set daily streak (testing)
 */
export function setTestStreak(days: number): void {
	const progress = StorageManager.getProgress();
	progress.profile.dailyStreak = days;
	progress.profile.longestStreak = Math.max(progress.profile.longestStreak, days);
	StorageManager.saveProgress(progress);

	console.log(`✅ Daily streak set to ${days} days`);
}

// ============================================================================
// DATA RESET
// ============================================================================

/**
 * Reset all progress (with confirmation)
 */
export function resetProgress(): void {
	console.warn('⚠️ This will delete ALL progress data!');
	console.log('To confirm, call: confirmResetProgress()');
}

/**
 * Confirm reset (requires explicit call)
 */
export function confirmResetProgress(): void {
	StorageManager.clearAllData();
	console.log('✅ All progress data has been reset');
}

// ============================================================================
// WINDOW ATTACHMENT
// ============================================================================

/**
 * Attach all debug utilities to window object
 */
export function attachDebugTools(): void {
	if (typeof window === 'undefined') return;

	(window as any).audioTrainingDebug = {
		// Logging
		enableLogging: () => logger.enable(),
		disableLogging: () => logger.disable(),

		// Inspection
		inspect: () => inspectProgress(),
		history: (limit = 10) => inspectHistory(limit),
		storage: () => debugStorage(),
		achievements: () => debugAchievements(),

		// XP/Level
		addXP: (amount: number) => addTestXP(amount),
		setLevel: (level: number) => setTestLevel(level),
		xpTable: (max = 25) => showXPTable(max),

		// Achievements
		unlock: (id: string) => unlockTestAchievement(id),
		unlockAll: () => unlockAllAchievements(),
		resetAchievements: () => resetAchievements(),

		// Games
		playGame: (exerciseId: ExerciseId, difficulty: DifficultyLevel, accuracy: number) =>
			playTestGame(exerciseId, difficulty, accuracy),
		playGames: (
			exerciseId: ExerciseId,
			difficulty: DifficultyLevel,
			count: number,
			minAcc = 70,
			maxAcc = 95
		) => playTestGames(exerciseId, difficulty, count, minAcc, maxAcc),

		// Streak
		setStreak: (days: number) => setTestStreak(days),

		// Data
		export: () => {
			const json = StorageManager.exportData();
			console.log('📦 Export data:');
			console.log(json);
			return json;
		},
		import: (json: string) => {
			const result = StorageManager.importData(json);
			console.log(result.success ? '✅' : '❌', result.message);
		},
		reset: () => resetProgress(),
		confirmReset: () => confirmResetProgress(),

		// Stats
		stats: () => {
			const stats = StorageManager.getStorageStats();
			console.table({
				'Progress Size': `${(stats.progressSize / 1024).toFixed(2)} KB`,
				'History Size': `${(stats.historySize / 1024).toFixed(2)} KB`,
				'Leaderboards Size': `${(stats.leaderboardsSize / 1024).toFixed(2)} KB`,
				'Total Size': `${(stats.totalSize / 1024).toFixed(2)} KB`
			});
		},

		// Help
		help: () => {
			console.log(`
🎮 Audio Training Debug Commands

📊 INSPECTION
  .inspect()                - View full progress data
  .history(limit)           - View game history (default: 10)
  .storage()                - View storage details
  .achievements()           - View all achievements
  .stats()                  - View storage usage stats

⭐ XP / LEVELS
  .addXP(amount)            - Add XP to current progress
  .setLevel(level)          - Set level directly
  .xpTable(max)             - Show XP table (default: 25 levels)

🏆 ACHIEVEMENTS
  .unlock('achievement-id') - Unlock specific achievement
  .unlockAll()              - Unlock all achievements
  .resetAchievements()      - Reset all achievements

🎯 GAME TESTING
  .playGame(exercise, diff, accuracy)
    - Simulate single game
    - Example: .playGame('eq', 'intermediate', 85)
  
  .playGames(exercise, diff, count, minAcc, maxAcc)
    - Simulate multiple games
    - Example: .playGames('panning', 'beginner', 10, 70, 95)

🔥 STREAK
  .setStreak(days)          - Set daily streak

💾 DATA
  .export()                 - Export all data as JSON
  .import(json)             - Import data from JSON
  .reset()                  - Reset all data (shows warning)
  .confirmReset()           - Confirm reset (deletes everything)

🔊 LOGGING
  .enableLogging()          - Enable debug logging
  .disableLogging()         - Disable debug logging

📖 HELP
  .help()                   - Show this help message

Access this object via: audioTrainingDebug
Example: audioTrainingDebug.inspect()
			`);
		}
	};

	console.log('🎮 Audio Training Debug Tools Loaded');
	console.log('Type: audioTrainingDebug.help()');
}

// ============================================================================
// AUTO-ATTACH (if in browser and dev mode)
// ============================================================================

if (typeof window !== 'undefined' && import.meta.env.DEV) {
	attachDebugTools();
}
