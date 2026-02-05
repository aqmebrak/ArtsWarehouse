/**
 * Unit tests for Storage Utilities
 *
 * Tests LocalStorage management, data persistence, and validation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	StorageManager,
	getExerciseStats,
	updateExerciseStats,
	calculateSkillLevel,
	getAchievementProgress,
	unlockAchievement,
	updateDailyStreak
} from './storage-utils';
import type { UserProgress, GameSession } from '$lib/types/audio-training';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
		get length() {
			return Object.keys(store).length;
		},
		key: (index: number) => Object.keys(store)[index] || null
	};
})();

// @ts-ignore
global.localStorage = localStorageMock;

describe('StorageManager', () => {
	beforeEach(() => {
		localStorageMock.clear();
	});

	describe('createNewProgress', () => {
		it('should create new progress with default values', () => {
			const progress = StorageManager.createNewProgress();

			expect(progress.version).toBe('1.0.0');
			expect(progress.userId).toBeDefined();
			expect(progress.profile.totalXP).toBe(0);
			expect(progress.profile.level).toBe(1);
			expect(progress.profile.totalGamesPlayed).toBe(0);
			expect(progress.exercises).toEqual({});
			expect(progress.achievements).toEqual([]);
		});

		it('should create unique user IDs', () => {
			const progress1 = StorageManager.createNewProgress();
			const progress2 = StorageManager.createNewProgress();

			expect(progress1.userId).not.toBe(progress2.userId);
		});
	});

	describe('saveProgress and loadProgress', () => {
		it('should save and load progress', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.totalXP = 500;
			progress.profile.level = 5;

			StorageManager.saveProgress(progress);
			const loaded = StorageManager.loadProgress();

			expect(loaded).not.toBeNull();
			expect(loaded?.profile.totalXP).toBe(500);
			expect(loaded?.profile.level).toBe(5);
		});

		it('should return null when no data exists', () => {
			const loaded = StorageManager.loadProgress();
			expect(loaded).toBeNull();
		});

		it('should update lastPlayed on save', () => {
			const progress = StorageManager.createNewProgress();
			const before = new Date(progress.lastPlayed);

			// Wait a bit
			vi.useFakeTimers();
			vi.advanceTimersByTime(100);

			StorageManager.saveProgress(progress);
			const loaded = StorageManager.loadProgress();

			expect(loaded).not.toBeNull();
			const after = new Date(loaded!.lastPlayed);
			expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());

			vi.useRealTimers();
		});
	});

	describe('getProgress', () => {
		it('should load existing progress', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.totalXP = 1000;
			StorageManager.saveProgress(progress);

			const loaded = StorageManager.getProgress();
			expect(loaded.profile.totalXP).toBe(1000);
		});

		it('should create new progress if none exists', () => {
			const progress = StorageManager.getProgress();
			expect(progress.profile.totalXP).toBe(0);
			expect(progress.profile.level).toBe(1);
		});
	});

	describe('saveGameSession and getGameHistory', () => {
		it('should save and retrieve game sessions', () => {
			const session: GameSession = {
				sessionId: 'test-session-1',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: [{ correct: true, points: 100, actualValue: 100, userGuess: 100 }],
				finalScore: 100,
				accuracy: 100,
				xpEarned: 50
			};

			StorageManager.saveGameSession(session);
			const history = StorageManager.getGameHistory();

			expect(history).toHaveLength(1);
			expect(history[0].sessionId).toBe('test-session-1');
		});

		it('should limit history to max entries', () => {
			// Save 150 sessions (max is 100)
			for (let i = 0; i < 150; i++) {
				const session: GameSession = {
					sessionId: `session-${i}`,
					exerciseId: 'eq',
					difficulty: 'beginner',
					startedAt: new Date().toISOString(),
					completedAt: new Date().toISOString(),
					rounds: [],
					finalScore: 0,
					accuracy: 0,
					xpEarned: 0
				};
				StorageManager.saveGameSession(session);
			}

			const history = StorageManager.getGameHistory();
			expect(history).toHaveLength(100);
			// Should keep most recent (last one saved)
			expect(history[0].sessionId).toBe('session-149');
		});

		it('should respect limit parameter', () => {
			for (let i = 0; i < 20; i++) {
				StorageManager.saveGameSession({
					sessionId: `session-${i}`,
					exerciseId: 'eq',
					difficulty: 'beginner',
					startedAt: new Date().toISOString(),
					rounds: [],
					finalScore: 0,
					accuracy: 0,
					xpEarned: 0
				});
			}

			const history = StorageManager.getGameHistory(5);
			expect(history).toHaveLength(5);
		});
	});

	describe('clearAllData', () => {
		it('should clear all storage', () => {
			const progress = StorageManager.createNewProgress();
			StorageManager.saveProgress(progress);
			StorageManager.saveGameSession({
				sessionId: 'test',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				rounds: [],
				finalScore: 0,
				accuracy: 0,
				xpEarned: 0
			});

			StorageManager.clearAllData();

			expect(StorageManager.loadProgress()).toBeNull();
			expect(StorageManager.getGameHistory()).toHaveLength(0);
		});
	});
});

describe('Exercise Stats Helpers', () => {
	describe('getExerciseStats', () => {
		it('should return existing stats', () => {
			const progress = StorageManager.createNewProgress();
			progress.exercises['eq'] = {
				gamesPlayed: 10,
				highScore: 500,
				totalScore: 3000,
				averageAccuracy: 80,
				currentDifficulty: 'intermediate',
				skillLevel: 'silver',
				lastPlayed: new Date().toISOString(),
				bestStreak: 5
			};

			const stats = getExerciseStats(progress, 'eq');
			expect(stats.gamesPlayed).toBe(10);
			expect(stats.skillLevel).toBe('silver');
		});

		it('should create default stats for new exercise', () => {
			const progress = StorageManager.createNewProgress();
			const stats = getExerciseStats(progress, 'eq');

			expect(stats.gamesPlayed).toBe(0);
			expect(stats.highScore).toBe(0);
			expect(stats.skillLevel).toBe('bronze');
		});
	});

	describe('updateExerciseStats', () => {
		it('should update stats after game', () => {
			const stats = getExerciseStats(StorageManager.createNewProgress(), 'eq');
			const session: GameSession = {
				sessionId: 'test',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: [
					{ correct: true, points: 100, actualValue: 100, userGuess: 100 },
					{ correct: true, points: 100, actualValue: 100, userGuess: 100 }
				],
				finalScore: 200,
				accuracy: 100,
				xpEarned: 50
			};

			const updated = updateExerciseStats(stats, session);

			expect(updated.gamesPlayed).toBe(1);
			expect(updated.highScore).toBe(200);
			expect(updated.totalScore).toBe(200);
			expect(updated.averageAccuracy).toBe(100);
		});

		it('should update high score', () => {
			const stats = {
				gamesPlayed: 5,
				highScore: 300,
				totalScore: 1000,
				averageAccuracy: 70,
				currentDifficulty: 'beginner' as const,
				skillLevel: 'bronze' as const,
				lastPlayed: new Date().toISOString(),
				bestStreak: 3
			};

			const session: GameSession = {
				sessionId: 'test',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: [],
				finalScore: 500, // Higher than current high score
				accuracy: 90,
				xpEarned: 100
			};

			const updated = updateExerciseStats(stats, session);
			expect(updated.highScore).toBe(500);
		});
	});

	describe('calculateSkillLevel', () => {
		it('should return bronze for new players', () => {
			const stats = {
				gamesPlayed: 0,
				highScore: 0,
				totalScore: 0,
				averageAccuracy: 0,
				currentDifficulty: 'beginner' as const,
				skillLevel: 'bronze' as const,
				lastPlayed: new Date().toISOString(),
				bestStreak: 0
			};

			expect(calculateSkillLevel(stats)).toBe('bronze');
		});

		it('should return silver for 10+ games with 75%+ accuracy', () => {
			const stats = {
				gamesPlayed: 10,
				highScore: 500,
				totalScore: 5000,
				averageAccuracy: 80,
				currentDifficulty: 'beginner' as const,
				skillLevel: 'bronze' as const,
				lastPlayed: new Date().toISOString(),
				bestStreak: 5
			};

			expect(calculateSkillLevel(stats)).toBe('silver');
		});

		it('should return diamond for elite performance', () => {
			const stats = {
				gamesPlayed: 50,
				highScore: 950,
				totalScore: 45000,
				averageAccuracy: 96,
				currentDifficulty: 'expert' as const,
				skillLevel: 'bronze' as const,
				lastPlayed: new Date().toISOString(),
				bestStreak: 20
			};

			expect(calculateSkillLevel(stats)).toBe('diamond');
		});
	});
});

describe('Achievement Helpers', () => {
	describe('getAchievementProgress', () => {
		it('should return existing achievement progress', () => {
			const progress = StorageManager.createNewProgress();
			progress.achievements.push({
				id: 'test-achievement',
				progress: 50,
				unlockedAt: undefined
			});

			const achProgress = getAchievementProgress(progress, 'test-achievement');
			expect(achProgress.progress).toBe(50);
		});

		it('should create default for new achievement', () => {
			const progress = StorageManager.createNewProgress();
			const achProgress = getAchievementProgress(progress, 'new-achievement');

			expect(achProgress.id).toBe('new-achievement');
			expect(achProgress.progress).toBe(0);
			expect(achProgress.unlockedAt).toBeUndefined();
		});
	});

	describe('unlockAchievement', () => {
		it('should unlock achievement', () => {
			const progress = StorageManager.createNewProgress();
			const updated = unlockAchievement(progress, 'first-steps');

			const achievement = updated.achievements.find((a) => a.id === 'first-steps');
			expect(achievement).toBeDefined();
			expect(achievement?.unlockedAt).toBeDefined();
			expect(achievement?.progress).toBe(100);
		});

		it('should not duplicate if already exists', () => {
			let progress = StorageManager.createNewProgress();
			progress.achievements.push({
				id: 'first-steps',
				progress: 50,
				unlockedAt: undefined
			});

			progress = unlockAchievement(progress, 'first-steps');

			const achievements = progress.achievements.filter((a) => a.id === 'first-steps');
			expect(achievements).toHaveLength(1);
			expect(achievements[0].progress).toBe(100);
		});
	});
});

describe('Daily Streak Helpers', () => {
	describe('updateDailyStreak', () => {
		it('should increment streak for consecutive day', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.dailyStreak = 5;

			// Set last played to yesterday
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			progress.lastPlayed = yesterday.toISOString();

			const updated = updateDailyStreak(progress);
			expect(updated.profile.dailyStreak).toBe(6);
		});

		it('should reset streak if broken', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.dailyStreak = 10;

			// Set last played to 3 days ago
			const threeDaysAgo = new Date();
			threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
			progress.lastPlayed = threeDaysAgo.toISOString();

			const updated = updateDailyStreak(progress);
			expect(updated.profile.dailyStreak).toBe(1);
		});

		it('should not change streak for same day', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.dailyStreak = 7;
			progress.lastPlayed = new Date().toISOString();

			const updated = updateDailyStreak(progress);
			expect(updated.profile.dailyStreak).toBe(7);
		});

		it('should update longest streak', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.dailyStreak = 15;
			progress.profile.longestStreak = 10;

			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			progress.lastPlayed = yesterday.toISOString();

			const updated = updateDailyStreak(progress);
			expect(updated.profile.longestStreak).toBe(16);
		});
	});
});
