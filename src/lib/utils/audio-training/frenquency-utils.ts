export class FrequencyUtils {
	static readonly MIN_FREQUENCY = 20;
	static readonly MAX_FREQUENCY = 20000;

	static freqToX(
		frequency: number,
		canvasWidth: number,
		minFreq?: number,
		maxFreq?: number
	): number {
		const logMin = Math.log(minFreq || this.MIN_FREQUENCY);
		const logMax = Math.log(maxFreq || this.MAX_FREQUENCY);
		const logFreq = Math.log(frequency);
		return ((logFreq - logMin) / (logMax - logMin)) * canvasWidth;
	}

	static xToFreq(x: number, canvasWidth: number, minFreq?: number, maxFreq?: number): number {
		const logMin = Math.log(minFreq || this.MIN_FREQUENCY);
		const logMax = Math.log(maxFreq || this.MAX_FREQUENCY);
		const logFreq = logMin + (x / canvasWidth) * (logMax - logMin);
		return Math.exp(logFreq);
	}

	static getLogarithmicMargin(frequency: number, marginPercent: number = 0.15): number {
		return frequency * marginPercent;
	}

	static formatFrequency(frequency: number): string {
		const roundedFreq = Math.round(frequency);
		if (roundedFreq < 1000) {
			return `${roundedFreq}Hz`;
		} else {
			const kHz = roundedFreq / 1000;
			// If it's a whole number of kHz, don't show decimal
			return kHz % 1 === 0 ? `${Math.round(kHz)}kHz` : `${kHz.toFixed(1)}kHz`;
		}
	}
}
