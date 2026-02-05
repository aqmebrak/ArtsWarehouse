/**
 * Enhanced GameManager with Storage Integration
 *
 * Manages game state, progress tracking, XP calculation, and achievement unlocking.
 * Integrates with LocalStorage to persist user progress.
 */

import type { GameState, RoundResult } from './types';
import type {
	ExerciseId,
	DifficultyLevel,
	GameSession,
	UserProgress
} from '$lib/types/audio-training';
import {
	StorageManager,
	getExerciseStats,
	updateExerciseStats,
	calculateSkillLevel,
	updateDailyStreak
} from '$lib/utils/audio-training/storage-utils';
import { calculateSessionXP, addXP, checkLevelUp } from '$lib/utils/audio-training/xp-system';
import { checkAllAchievements, getAchievement } from '$lib/utils/audio-training/achievements';
import { getDifficultyConfig } from '$lib/utils/audio-training/difficulty-config';

export interface GameManagerConfig {
	exerciseId: ExerciseId;
	difficulty?: DifficultyLevel;
	onStateChange?: (state: GameState) => void;
	onRoundComplete?: (result: RoundResult) => void;
	onGameComplete?: (session: GameSession) => void;
	onXPEarned?: (xp: number, levelUp: boolean) => void;
	onAchievementUnlocked?: (achievementIds: string[]) => void;
}

export class EnhancedGameManager {
	// Game state
	private gameState = $state<GameState>();
	private roundHistory = $state<RoundResult[]>([]);
	private sessionStartTime?: Date;

	// Config
	private exerciseId: ExerciseId;
	private difficulty: DifficultyLevel;

	// Callbacks
	private onStateChange?: (state: GameState) => void;
	private onRoundComplete?: (result: RoundResult) => void;
	private onGameComplete?: (session: GameSession) => void;
	private onXPEarned?: (xp: number, levelUp: boolean) => void;
	private onAchievementUnlocked?: (achievementIds: string[]) => void;

	// User progress (reactive)
	public userProgress = $state<UserProgress>();

	constructor(config: GameManagerConfig) {
		this.exerciseId = config.exerciseId;
		this.difficulty = config.difficulty || 'beginner';
		this.onStateChange = config.onStateChange;
		this.onRoundComplete = config.onRoundComplete;
		this.onGameComplete = config.onGameComplete;
		this.onXPEarned = config.onXPEarned;
		this.onAchievementUnlocked = config.onAchievementUnlocked;

		// Load user progress
		this.userProgress = StorageManager.getProgress();

		// Update daily streak
		this.userProgress = updateDailyStreak(this.userProgress);
		StorageManager.saveProgress(this.userProgress);

		// Get difficulty config
		const difficultyConfig = getDifficultyConfig(this.exerciseId, this.difficulty);

		// Initialize game state
		this.gameState = {
			currentRound: 0,
			totalRounds: difficultyConfig.rounds,
			score: 0,
			gameCompleted: false,
			gameStarted: false,
			showResult: false,
			resultMessage: ''
		} as GameState;
	}

	// ========================================================================
	// PUBLIC GETTERS
	// ========================================================================

	getState = (): GameState => {
		if (!this.gameState) {
			return {
				currentRound: 0,
				totalRounds: 10,
				score: 0,
				gameCompleted: false,
				gameStarted: false,
				showResult: false,
				resultMessage: ''
			};
		}
		return { ...this.gameState } as GameState;
	};

	getRoundHistory = (): RoundResult[] => {
		return [...this.roundHistory];
	};

	getDifficulty = (): DifficultyLevel => {
		return this.difficulty;
	};

	setDifficulty = (difficulty: DifficultyLevel): void => {
		this.difficulty = difficulty;
		const config = getDifficultyConfig(this.exerciseId, difficulty);
		if (this.gameState) {
			this.gameState.totalRounds = config.rounds;
		}
	};

	getUserProgress = (): UserProgress => {
		return this.userProgress!;
	};

	getExerciseStats = () => {
		return getExerciseStats(this.userProgress!, this.exerciseId);
	};

	// ========================================================================
	// GAME FLOW
	// ========================================================================

	startNewGame = (): void => {
		const config = getDifficultyConfig(this.exerciseId, this.difficulty);

		this.gameState = {
			...this.gameState,
			currentRound: 0,
			score: 0,
			gameCompleted: false,
			gameStarted: true,
			showResult: false,
			resultMessage: '',
			totalRounds: config.rounds
		};
		this.roundHistory = [];
		this.sessionStartTime = new Date();
		this.notifyStateChange();
		this.startNextRound();
	};

	startNextRound = (): void => {
		if (!this.gameState) return;

		if (this.gameState.currentRound >= this.gameState.totalRounds) {
			this.completeGame();
			return;
		}

		this.gameState.currentRound++;
		this.gameState.showResult = false;
		this.notifyStateChange();
	};

	submitRound = (result: RoundResult): void => {
		if (!this.gameState) return;

		this.roundHistory.push(result);
		this.gameState.score += result.points;
		this.gameState.showResult = true;
		this.gameState.resultMessage = this.generateResultMessage(result);

		this.notifyStateChange();
		this.onRoundComplete?.(result);

		// Auto-advance after delay
		setTimeout(() => {
			if (!this.gameState) return;
			if (this.gameState.currentRound < this.gameState.totalRounds) {
				this.startNextRound();
			} else {
				this.completeGame();
			}
		}, 2000);
	};

	skipRound = (actualValue: number, message?: string): void => {
		if (!this.gameState) return;

		const result: RoundResult = {
			correct: false,
			points: 0,
			actualValue,
			userGuess: 0 // 0 indicates skipped
		};

		this.roundHistory.push(result);
		this.gameState.showResult = true;
		this.gameState.resultMessage = message || `Skipped round ${this.gameState.currentRound}`;

		this.notifyStateChange();

		setTimeout(() => {
			if (!this.gameState) return;
			if (this.gameState.currentRound < this.gameState.totalRounds) {
				this.startNextRound();
			} else {
				this.completeGame();
			}
		}, 1500);
	};

	// ========================================================================
	// GAME COMPLETION & PROGRESS TRACKING
	// ========================================================================

	private completeGame = (): void => {
		if (!this.gameState) return;

		this.gameState.gameCompleted = true;
		this.notifyStateChange();

		// Create game session
		const session = this.createGameSession();

		// Calculate XP
		const xpEarned = calculateSessionXP(session, this.userProgress!);
		session.xpEarned = xpEarned;

		// Update user progress
		this.updateUserProgress(session);

		// Save game session to history
		StorageManager.saveGameSession(session);

		// Check for achievements
		const unlockedAchievements = checkAllAchievements(this.userProgress!, session);

		// Unlock achievements
		if (unlockedAchievements.length > 0) {
			for (const achievementId of unlockedAchievements) {
				const achievement = getAchievement(achievementId);
				if (achievement) {
					// Add achievement XP bonus (from achievements.ts, not exported yet)
					const bonusXP = this.getAchievementBonusXP(achievement.category);
					const xpResult = addXP(this.userProgress!, bonusXP);
					this.userProgress = xpResult.progress;
				}

				// Mark as unlocked in progress
				const existingAch = this.userProgress!.achievements.find(
					(a) => a.id === achievementId
				);
				if (existingAch) {
					existingAch.unlockedAt = new Date().toISOString();
					existingAch.progress = 100;
				} else {
					this.userProgress!.achievements.push({
						id: achievementId,
						unlockedAt: new Date().toISOString(),
						progress: 100
					});
				}
			}

			// Save updated progress with achievements
			StorageManager.saveProgress(this.userProgress!);

			// Notify achievements unlocked
			this.onAchievementUnlocked?.(unlockedAchievements);
		}

		// Update leaderboard
		StorageManager.updateLeaderboard(this.exerciseId, this.difficulty, {
			score: session.finalScore,
			date: session.completedAt!,
			exerciseId: this.exerciseId,
			difficulty: this.difficulty,
			sessionId: session.sessionId
		});

		// Callback
		this.onGameComplete?.(session);
	};

	private createGameSession = (): GameSession => {
		const accuracy = this.calculateAccuracy();

		return {
			sessionId: crypto.randomUUID(),
			exerciseId: this.exerciseId,
			difficulty: this.difficulty,
			startedAt: this.sessionStartTime?.toISOString() || new Date().toISOString(),
			completedAt: new Date().toISOString(),
			rounds: this.roundHistory,
			finalScore: this.gameState?.score || 0,
			accuracy,
			xpEarned: 0 // Will be calculated
		};
	};

	private updateUserProgress = (session: GameSession): void => {
		if (!this.userProgress) return;

		// Add XP and check level-up
		const xpResult = addXP(this.userProgress, session.xpEarned);
		this.userProgress = xpResult.progress;

		// Update profile stats
		this.userProgress.profile.totalGamesPlayed++;
		this.userProgress.profile.totalScore += session.finalScore;

		// Update exercise stats
		const currentStats = getExerciseStats(this.userProgress, this.exerciseId);
		const updatedStats = updateExerciseStats(currentStats, session);

		// Update skill level
		updatedStats.skillLevel = calculateSkillLevel(updatedStats);

		// Save back to progress
		this.userProgress.exercises[this.exerciseId] = updatedStats;

		// Save to storage
		StorageManager.saveProgress(this.userProgress);

		// Notify XP earned
		this.onXPEarned?.(session.xpEarned, xpResult.levelUp.leveledUp);
	};

	private getAchievementBonusXP = (category: string): number => {
		const categoryXP: Record<string, number> = {
			'getting-started': 100,
			'skill-mastery': 500,
			challenge: 300,
			consistency: 250
		};
		return categoryXP[category] || 100;
	};

	// ========================================================================
	// HELPERS
	// ========================================================================

	private generateResultMessage = (result: RoundResult): string => {
		const baseMessage = result.correct ? '✓ Correct!' : '✗ Incorrect';
		return `${baseMessage} (+${result.points} points)`;
	};

	private notifyStateChange = (): void => {
		this.onStateChange?.(this.getState());
	};

	calculateAccuracy = (): number => {
		if (this.roundHistory.length === 0) return 0;
		const correctAnswers = this.roundHistory.filter((r) => r.correct).length;
		return Math.round((correctAnswers / this.roundHistory.length) * 100);
	};

	// ========================================================================
	// UTILITY METHODS
	// ========================================================================

	/**
	 * Get difficulty config for current settings
	 */
	getDifficultyConfig = () => {
		return getDifficultyConfig(this.exerciseId, this.difficulty);
	};

	/**
	 * Reset game without starting new one
	 */
	reset = (): void => {
		const config = getDifficultyConfig(this.exerciseId, this.difficulty);
		this.gameState = {
			currentRound: 0,
			totalRounds: config.rounds,
			score: 0,
			gameCompleted: false,
			gameStarted: false,
			showResult: false,
			resultMessage: ''
		} as GameState;
		this.roundHistory = [];
		this.sessionStartTime = undefined;
		this.notifyStateChange();
	};
}
