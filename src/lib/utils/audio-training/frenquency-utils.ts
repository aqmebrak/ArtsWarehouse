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
		return frequency < 1000 ? `${frequency}Hz` : `${(frequency / 1000).toFixed(1)}kHz`;
	}
}
