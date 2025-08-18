import type { GameState, RoundResult } from './types';

export class GameManager {
	private gameState = $state<GameState>();
	private roundHistory = $state<RoundResult[]>([]);
	private onStateChange?: (state: GameState) => void;
	private onRoundComplete?: (result: RoundResult) => void;

	constructor(
		totalRounds: number = 10,
		onStateChange?: (state: GameState) => void,
		onRoundComplete?: (result: RoundResult) => void
	) {
		this.gameState = {
			currentRound: 0,
			totalRounds,
			score: 0,
			gameCompleted: false,
			gameStarted: false,
			showResult: false,
			resultMessage: ''
		};
		this.onStateChange = onStateChange;
		this.onRoundComplete = onRoundComplete;
	}

	getState = (): GameState => {
		return { ...this.gameState };
	};

	getRoundHistory = (): RoundResult[] => {
		return [...this.roundHistory];
	};

	startNewGame = (): void => {
		this.gameState = {
			...this.gameState,
			currentRound: 0,
			score: 0,
			gameCompleted: false,
			gameStarted: true,
			showResult: false,
			resultMessage: '',
			totalRounds: this.gameState?.totalRounds || 10
		};
		this.roundHistory = [];
		this.notifyStateChange();
		this.startNextRound();
	};

	startNextRound = (): void => {
		if (!this.gameState) return;

		if (this.gameState.currentRound >= this.gameState.totalRounds) {
			this.gameState.gameCompleted = true;
			this.notifyStateChange();
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
				this.gameState.gameCompleted = true;
				this.notifyStateChange();
			}
		}, 3000);
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
				this.gameState.gameCompleted = true;
				this.notifyStateChange();
			}
		}, 2000);
	};

	private generateResultMessage = (result: RoundResult): string => {
		const baseMessage = result.correct ? 'Correct!' : 'Incorrect';
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
}
