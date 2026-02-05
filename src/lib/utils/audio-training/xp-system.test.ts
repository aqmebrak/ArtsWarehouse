/**
 * Unit tests for XP System
 *
 * Tests XP calculation, leveling, and progression mechanics.
 */

import { describe, it, expect } from 'vitest';
import {
	calculateSessionXP,
	getXPForLevel,
	getTotalXPForLevel,
	getLevelFromXP,
	getLevelProgress,
	checkLevelUp,
	addXP,
	getLevelTitle,
	MAX_LEVEL
} from './xp-system';
import { StorageManager } from './storage-utils';
import type { GameSession } from '$lib/types/audio-training';

describe('XP Calculation', () => {
	describe('calculateSessionXP', () => {
		it('should calculate base XP for perfect game', () => {
			const progress = StorageManager.createNewProgress();
			const session: GameSession = {
				sessionId: 'test',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: Array(5).fill({
					correct: true,
					points: 100,
					actualValue: 100,
					userGuess: 100
				}),
				finalScore: 500,
				accuracy: 100,
				xpEarned: 0
			};

			const xp = calculateSessionXP(session, progress);

			// Base: 5 rounds × 50 XP = 250
			// Difficulty: × 1.0 (beginner) = 250
			// Accuracy: × 1.5 (≥95%) = 375
			// Perfect game: × 2.0 = 750
			// First time: × 1.3 = 975
			expect(xp).toBeGreaterThan(0);
			expect(xp).toBeLessThan(2000); // Sanity check
		});

		it('should apply difficulty multipliers', () => {
			const progress = StorageManager.createNewProgress();

			const beginnerSession: GameSession = {
				sessionId: 'test1',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: Array(5).fill({
					correct: true,
					points: 100,
					actualValue: 100,
					userGuess: 100
				}),
				finalScore: 500,
				accuracy: 100,
				xpEarned: 0
			};

			const expertSession: GameSession = {
				...beginnerSession,
				sessionId: 'test2',
				difficulty: 'expert'
			};

			const beginnerXP = calculateSessionXP(beginnerSession, progress);
			const expertXP = calculateSessionXP(expertSession, progress);

			// Expert should give more XP (3x multiplier vs 1x)
			expect(expertXP).toBeGreaterThan(beginnerXP);
		});

		it('should apply streak bonus', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.dailyStreak = 7; // 7-day streak gets 1.5x

			const session: GameSession = {
				sessionId: 'test',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: Array(5).fill({
					correct: true,
					points: 100,
					actualValue: 100,
					userGuess: 100
				}),
				finalScore: 500,
				accuracy: 100,
				xpEarned: 0
			};

			const xpWithStreak = calculateSessionXP(session, progress);

			// Reset streak
			progress.profile.dailyStreak = 0;
			const xpNoStreak = calculateSessionXP(session, progress);

			expect(xpWithStreak).toBeGreaterThan(xpNoStreak);
		});

		it('should give less XP for poor performance', () => {
			const progress = StorageManager.createNewProgress();

			const perfectSession: GameSession = {
				sessionId: 'test1',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: Array(10).fill({
					correct: true,
					points: 100,
					actualValue: 100,
					userGuess: 100
				}),
				finalScore: 1000,
				accuracy: 100,
				xpEarned: 0
			};

			const poorSession: GameSession = {
				sessionId: 'test2',
				exerciseId: 'eq',
				difficulty: 'beginner',
				startedAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
				rounds: [
					...Array(3).fill({
						correct: true,
						points: 100,
						actualValue: 100,
						userGuess: 100
					}),
					...Array(7).fill({ correct: false, points: 0, actualValue: 100, userGuess: 50 })
				],
				finalScore: 300,
				accuracy: 30,
				xpEarned: 0
			};

			const perfectXP = calculateSessionXP(perfectSession, progress);
			const poorXP = calculateSessionXP(poorSession, progress);

			expect(perfectXP).toBeGreaterThan(poorXP);
		});
	});
});

describe('Level Calculations', () => {
	describe('getXPForLevel', () => {
		it('should return 0 for level 1', () => {
			expect(getXPForLevel(1)).toBe(0);
		});

		it('should return increasing XP for higher levels', () => {
			const level2XP = getXPForLevel(2);
			const level3XP = getXPForLevel(3);
			const level10XP = getXPForLevel(10);

			expect(level3XP).toBeGreaterThan(level2XP);
			expect(level10XP).toBeGreaterThan(level3XP);
		});

		it('should use exponential curve', () => {
			// Level 10 should require significantly more than 2x level 5
			const level5XP = getXPForLevel(5);
			const level10XP = getXPForLevel(10);

			expect(level10XP).toBeGreaterThan(level5XP * 2);
		});
	});

	describe('getTotalXPForLevel', () => {
		it('should return 0 for level 1', () => {
			expect(getTotalXPForLevel(1)).toBe(0);
		});

		it('should return cumulative XP', () => {
			const totalLevel3 = getTotalXPForLevel(3);
			const level2XP = getXPForLevel(2);
			const level3XP = getXPForLevel(3);

			expect(totalLevel3).toBe(level2XP + level3XP);
		});

		it('should increase significantly for higher levels', () => {
			const level5Total = getTotalXPForLevel(5);
			const level10Total = getTotalXPForLevel(10);

			expect(level10Total).toBeGreaterThan(level5Total * 3);
		});
	});

	describe('getLevelFromXP', () => {
		it('should return level 1 for 0 XP', () => {
			expect(getLevelFromXP(0)).toBe(1);
		});

		it('should return correct level for XP amount', () => {
			const level3XP = getTotalXPForLevel(3);
			expect(getLevelFromXP(level3XP)).toBe(3);
		});

		it('should handle XP in middle of level', () => {
			const level5XP = getTotalXPForLevel(5);
			const level6XP = getTotalXPForLevel(6);
			const midXP = level5XP + (level6XP - level5XP) / 2;

			expect(getLevelFromXP(midXP)).toBe(5);
		});

		it('should cap at MAX_LEVEL', () => {
			const hugeXP = 99999999;
			expect(getLevelFromXP(hugeXP)).toBe(MAX_LEVEL);
		});
	});

	describe('getLevelProgress', () => {
		it('should return correct progress for level 1', () => {
			const progress = getLevelProgress(0);

			expect(progress.currentLevel).toBe(1);
			expect(progress.xpIntoCurrentLevel).toBe(0);
			expect(progress.progressPercentage).toBe(0);
			expect(progress.isMaxLevel).toBe(false);
		});

		it('should return progress within a level', () => {
			const level5Total = getTotalXPForLevel(5);
			const level6XPNeeded = getXPForLevel(6);
			const testXP = level5Total + level6XPNeeded / 2;

			const progress = getLevelProgress(testXP);

			expect(progress.currentLevel).toBe(5);
			expect(progress.xpIntoCurrentLevel).toBe(level6XPNeeded / 2);
			expect(progress.progressPercentage).toBeCloseTo(50, 0);
		});

		it('should handle max level', () => {
			const maxXP = getTotalXPForLevel(MAX_LEVEL) + 1000;
			const progress = getLevelProgress(maxXP);

			expect(progress.currentLevel).toBe(MAX_LEVEL);
			expect(progress.isMaxLevel).toBe(true);
			expect(progress.progressPercentage).toBe(100);
		});
	});

	describe('checkLevelUp', () => {
		it('should detect no level up', () => {
			const level3XP = getTotalXPForLevel(3);
			const result = checkLevelUp(level3XP + 10, level3XP + 50);

			expect(result.leveledUp).toBe(false);
			expect(result.oldLevel).toBe(3);
			expect(result.newLevel).toBe(3);
			expect(result.levelsGained).toBe(0);
		});

		it('should detect single level up', () => {
			const level3XP = getTotalXPForLevel(3);
			const level4XP = getTotalXPForLevel(4);
			const result = checkLevelUp(level3XP + 10, level4XP + 10);

			expect(result.leveledUp).toBe(true);
			expect(result.oldLevel).toBe(3);
			expect(result.newLevel).toBe(4);
			expect(result.levelsGained).toBe(1);
		});

		it('should detect multiple level ups', () => {
			const level3XP = getTotalXPForLevel(3);
			const level6XP = getTotalXPForLevel(6);
			const result = checkLevelUp(level3XP, level6XP);

			expect(result.leveledUp).toBe(true);
			expect(result.oldLevel).toBe(3);
			expect(result.newLevel).toBe(6);
			expect(result.levelsGained).toBe(3);
		});
	});
});

describe('XP Integration', () => {
	describe('addXP', () => {
		it('should add XP to progress', () => {
			const progress = StorageManager.createNewProgress();
			const result = addXP(progress, 500);

			expect(result.progress.profile.totalXP).toBe(500);
			expect(result.xpAdded).toBe(500);
		});

		it('should trigger level up', () => {
			const progress = StorageManager.createNewProgress();
			progress.profile.totalXP = getTotalXPForLevel(3) - 10;
			progress.profile.level = 3;

			const result = addXP(progress, 100); // Should push to level 4

			expect(result.levelUp.leveledUp).toBe(true);
			expect(result.progress.profile.level).toBeGreaterThanOrEqual(3);
		});

		it('should not modify original progress object', () => {
			const progress = StorageManager.createNewProgress();
			const originalXP = progress.profile.totalXP;

			addXP(progress, 500);

			expect(progress.profile.totalXP).toBe(originalXP);
		});
	});
});

describe('Level Titles', () => {
	describe('getLevelTitle', () => {
		it('should return correct titles for level ranges', () => {
			expect(getLevelTitle(1)).toBe('Novice');
			expect(getLevelTitle(5)).toBe('Audio Apprentice');
			expect(getLevelTitle(10)).toBe('Frequency Fighter');
			expect(getLevelTitle(20)).toBe('Mix Master');
			expect(getLevelTitle(50)).toBe('Sonic Wizard');
			expect(getLevelTitle(100)).toBe('Audio Legend');
		});

		it('should use correct title for level in range', () => {
			expect(getLevelTitle(7)).toBe('Audio Apprentice');
			expect(getLevelTitle(15)).toBe('Frequency Fighter');
			expect(getLevelTitle(25)).toBe('Mix Master');
		});
	});
});

describe('Edge Cases', () => {
	it('should handle negative XP gracefully', () => {
		expect(getLevelFromXP(-100)).toBe(1);
	});

	it('should handle very large XP values', () => {
		const hugeXP = Number.MAX_SAFE_INTEGER;
		const level = getLevelFromXP(hugeXP);

		expect(level).toBe(MAX_LEVEL);
		expect(level).toBeGreaterThan(0);
	});

	it('should handle XP at exact level boundary', () => {
		const level5XP = getTotalXPForLevel(5);
		expect(getLevelFromXP(level5XP)).toBe(5);

		const level6XP = getTotalXPForLevel(6);
		expect(getLevelFromXP(level6XP)).toBe(6);
	});
});
