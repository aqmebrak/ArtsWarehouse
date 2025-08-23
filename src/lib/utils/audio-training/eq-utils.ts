import type { EQBand } from '$lib/components/audio-training/types';

export class EQUtils {
	static readonly FREQUENCIES = [
		100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
		5000, 6300, 8000
	];

	static readonly Q_VALUES = [0.5, 0.7, 1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0];

	static calculatePeakingResponse(
		freq: number,
		centerFreq: number,
		gain: number,
		q: number,
		sampleRate: number = 44100
	): number {
		if (gain === 0) return 0;

		const w = (2 * Math.PI * freq) / sampleRate;
		const w0 = (2 * Math.PI * centerFreq) / sampleRate;
		const A = Math.pow(10, gain / 20);
		const alpha = Math.sin(w0) / (2 * q);

		const b0 = 1 + alpha * A;
		const b1 = -2 * Math.cos(w0);
		const b2 = 1 - alpha * A;
		const a0 = 1 + alpha / A;
		const a1 = -2 * Math.cos(w0);
		const a2 = 1 - alpha / A;

		const cos_w = Math.cos(w);
		const sin_w = Math.sin(w);

		const num_real = b0 + b1 * cos_w + b2 * Math.cos(2 * w);
		const num_imag = b1 * sin_w + b2 * Math.sin(2 * w);
		const den_real = a0 + a1 * cos_w + a2 * Math.cos(2 * w);
		const den_imag = a1 * sin_w + a2 * Math.sin(2 * w);

		const num_mag = Math.sqrt(num_real * num_real + num_imag * num_imag);
		const den_mag = Math.sqrt(den_real * den_real + den_imag * den_imag);

		const magnitude = num_mag / den_mag;
		return 20 * Math.log10(magnitude);
	}

	static gainToY(
		gain: number,
		canvasHeight: number,
		minGain: number = -15,
		maxGain: number = 15
	): number {
		return canvasHeight - ((gain - minGain) / (maxGain - minGain)) * canvasHeight;
	}

	static yToGain(
		y: number,
		canvasHeight: number,
		minGain: number = -15,
		maxGain: number = 15
	): number {
		return ((canvasHeight - y) / canvasHeight) * (maxGain - minGain) + minGain;
	}

	static calculateTotalGain(frequency: number, eqBands: EQBand[]): number {
		let totalGain = 0;
		for (const band of eqBands) {
			const bandGain = this.calculatePeakingResponse(
				frequency,
				band.frequency,
				band.gain,
				band.q
			);
			totalGain += bandGain;
		}
		return totalGain;
	}
}
