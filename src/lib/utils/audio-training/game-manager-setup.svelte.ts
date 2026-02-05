import { EnhancedGameManager } from '$lib/components/audio-training/EnhancedGameManager.svelte';
import type { GameSession, ExerciseId, DifficultyLevel } from '$lib/types/audio-training';
import type { GameState, RoundResult } from '$lib/components/audio-training/types';

export interface GameManagerSetup {
	exerciseId: ExerciseId;
	difficulty?: DifficultyLevel;
	onGameComplete?: (session: GameSession) => void;
}

export function createGameManager(setup: GameManagerSetup) {
	// State for XP notifications
	let showXPNotification = $state(false);
	let xpEarned = $state(0);
	let leveledUp = $state(false);
	let newLevel = $state(1);

	// Toast container reference (can be set externally)
	let toastContainer = $state<any>(null);

	// Game state
	let gameState: GameState = $state({
		currentRound: 0,
		totalRounds: 10,
		score: 0,
		gameCompleted: false,
		gameStarted: false,
		showResult: false,
		resultMessage: ''
	});
	let roundHistory: RoundResult[] = $state([]);

	// Create EnhancedGameManager
	const manager = new EnhancedGameManager({
		exerciseId: setup.exerciseId,
		difficulty: setup.difficulty ?? 'beginner',
		onStateChange: (state) => {
			gameState = state;
		},
		onRoundComplete: (result) => {
			roundHistory = [...roundHistory, result];
		},
		onGameComplete: (session: GameSession) => {
			if (setup.onGameComplete) {
				setup.onGameComplete(session);
			}
		},
		onXPEarned: (xp: number, levelUp: boolean) => {
			xpEarned = xp;
			leveledUp = levelUp;
			if (levelUp) {
				newLevel = manager.getUserProgress().profile.level;
			}
			showXPNotification = true;
			setTimeout(() => {
				showXPNotification = false;
			}, 5000);
		},
		onAchievementUnlocked: (achievementIds: string[]) => {
			// Show toast notification for each achievement
			achievementIds.forEach((id) => {
				toastContainer?.showAchievementToast?.(id, 100);
			});
		}
	});

	return {
		// Manager instance
		manager,
		// State
		get gameState() {
			return gameState;
		},
		get roundHistory() {
			return roundHistory;
		},
		get userProgress() {
			return manager.userProgress;
		},
		// XP Notification state
		get showXPNotification() {
			return showXPNotification;
		},
		get xpEarned() {
			return xpEarned;
		},
		get leveledUp() {
			return leveledUp;
		},
		get newLevel() {
			return newLevel;
		},
		// Toast container binding
		setToastContainer(container: any) {
			toastContainer = container;
		},
		// Reset round history (for new game)
		resetRoundHistory() {
			roundHistory = [];
		}
	};
}
