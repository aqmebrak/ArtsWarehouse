/**
 * Audio Training Utilities
 * Shared functionality for all audio training exercises
 */
export interface GameState {
	currentRound: number;
	totalRounds: number;
	score: number;
	gameCompleted: boolean;
	gameStarted: boolean;
	showResult: boolean;
	resultMessage: string;
}

export interface RoundResult {
	correct: boolean;
	points: number;
	actualValue: number;
	userGuess: number;
	additionalData?: Record<string, any>;
}

export interface EQBand {
	frequency: number;
	gain: number;
	q: number;
}
