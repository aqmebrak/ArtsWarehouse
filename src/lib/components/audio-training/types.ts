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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	additionalData?: Record<string, any>;
}

export interface EQBand {
	frequency: number;
	gain: number;
	q: number;
}
