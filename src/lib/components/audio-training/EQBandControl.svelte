<script lang="ts">
	import { EQUtils } from '$lib/utils/audio-training/eq-utils';
	import type { EQBand } from './types';

	interface Props {
		band: EQBand;
		bandIndex: number;
		onUpdate: (bandIndex: number, property: keyof EQBand, value: number) => void;
		gainRange?: { min: number; max: number; step: number };
	}

	let { band, bandIndex, onUpdate, gainRange = { min: -12, max: 12, step: 1 } }: Props = $props();

	function updateFrequency(freq: number) {
		onUpdate(bandIndex, 'frequency', freq);
	}

	function updateGain(gain: number) {
		onUpdate(bandIndex, 'gain', gain);
	}

	function updateQ(q: number) {
		onUpdate(bandIndex, 'q', q);
	}
</script>

<div class="rounded-xl bg-gray-800/70 p-4">
	<h4 class="mb-4 text-center text-lg font-bold text-white">Band {bandIndex + 1}</h4>

	<!-- Frequency -->
	<div class="mb-4">
		<label class="mb-2 block text-sm font-semibold text-gray-300"> Frequency </label>
		<select
			value={band.frequency}
			onchange={(e) => updateFrequency(Number(e.currentTarget.value))}
			class="w-full rounded-lg bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
		>
			{#each EQUtils.FREQUENCIES as freq}
				<option value={freq}>
					{freq < 1000 ? `${freq} Hz` : `${freq / 1000} kHz`}
				</option>
			{/each}
		</select>
	</div>

	<!-- Gain -->
	<div class="mb-4">
		<label class="mb-2 block text-sm font-semibold text-gray-300">
			Gain: {band.gain > 0 ? '+' : ''}{band.gain} dB
		</label>
		<input
			type="range"
			min={gainRange.min}
			max={gainRange.max}
			step={gainRange.step}
			value={band.gain}
			oninput={(e) => updateGain(Number(e.currentTarget.value))}
			class="w-full accent-purple-500"
		/>
	</div>

	<!-- Q -->
	<div>
		<label class="mb-2 block text-sm font-semibold text-gray-300"> Q Factor </label>
		<select
			value={band.q}
			onchange={(e) => updateQ(Number(e.currentTarget.value))}
			class="w-full rounded-lg bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
		>
			{#each EQUtils.Q_VALUES as q}
				<option value={q}>{q}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		height: 6px;
		border-radius: 3px;
		background: #374151;
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #8b5cf6;
		cursor: pointer;
		border: 2px solid #ffffff;
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #8b5cf6;
		cursor: pointer;
		border: 2px solid #ffffff;
	}
</style>
