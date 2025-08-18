export class ScoringUtils {
	static calculatePoints(
		difference: number,
		maxDifference: number,
		maxPoints: number = 100
	): number {
		if (difference > maxDifference) return 0;
		const accuracy = 1 - difference / maxDifference;
		return Math.round(accuracy * maxPoints);
	}

	static calculateLogarithmicPoints(
		actualValue: number,
		guessValue: number,
		marginPercent: number = 0.15,
		maxPoints: number = 100
	): number {
		const difference = Math.abs(actualValue - guessValue);
		const maxDifference = actualValue * marginPercent;
		return this.calculatePoints(difference, maxDifference, maxPoints);
	}
}
