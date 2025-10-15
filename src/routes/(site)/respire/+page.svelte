<script lang="ts">
	import { onMount } from 'svelte';
	import type p5 from 'p5';

	let project: p5 | undefined = undefined;
	let target: HTMLElement | undefined = undefined;
	let isPlaying = $state(false);
	let isComplete = $state(false);
	let audioContextStarted = false;
	let osc1: p5.Oscillator;
	let osc2: p5.Oscillator;
	let osc3: p5.Oscillator;
	let osc4: p5.Oscillator;
	let envelope: p5.Envelope;
	let currentPhase = -1;
	let startTime: number;
	let elapsedTime = 0;
	let ballY = -1;
	let lastUpdateTime = 0;

	function ref(node: HTMLElement) {
		target = node;
		return {
			destroy() {
				target = undefined;
			}
		};
	}

	function togglePlayPause() {
		if (isComplete) return;
		isPlaying = !isPlaying;
		if (!project) return;

		if (!isPlaying) {
			osc1.stop(0);
			osc2.stop(0);
			osc3.stop(0);
			osc4.stop(0);
			envelope.triggerRelease();
			return;
		}

		if (project.getAudioContext().state !== 'suspended') {
			void project
				.getAudioContext()
				.resume()
				.then(() => {
					audioContextStarted = true;
				});
		}

		if (currentPhase < 0) {
			return;
		}

		osc1.start();
		osc2.start();
		osc3.start();
		osc4.start();
		envelope.triggerAttack();
	}

	function stopAndReset() {
		isPlaying = false;
		isComplete = false;
		if (!project) return;

		osc1.stop(0);
		osc2.stop(0);
		osc3.stop(0);
		osc4.stop(0);
		envelope.triggerRelease();
		startTime = project.millis();
		elapsedTime = 0;
		currentPhase = -1;
		ballY = project.height / 2;
	}

	onMount(async () => {
		const library = await import('p5');
		const { default: p5 } = library;
		(window as typeof window & { p5: typeof p5 }).p5 = p5;
		await import('p5/lib/addons/p5.sound');

		project = new p5((p: p5) => {
			const width = 500;
			const height = 500;
			ballY = height / 2;

			const totalDuration = 5 * 60;
			const cycleDuration = 15;

			const bgColor = p.color(240, 240, 255);
			const ballColor = p.color(60, 120, 255);
			const textColor = p.color(40, 40, 40);

			p.setup = () => {
				p.createCanvas(width, height);
				startTime = p.millis();
				lastUpdateTime = startTime;

				envelope = new p5.Envelope();
				envelope.setADSR(1, 0.2, 0.5, 0.2);
				envelope.setRange(1, 0);

				osc1 = new p5.Oscillator(-1, 'sine');
				osc2 = new p5.Oscillator(-1, 'sine');
				osc3 = new p5.Oscillator(-1, 'sine');
				osc4 = new p5.Oscillator(-1, 'sine');

				envelope.setInput(osc1);
				envelope.setInput(osc2);
				envelope.setInput(osc3);
				envelope.setInput(osc4);

				osc1.amp(0.2);
				osc2.amp(0.15);
				osc3.amp(0.15);
				osc4.amp(0.1);
			};

			function setupNewPhase(phase: number) {
				osc1.stop(0);
				osc2.stop(0);
				osc3.stop(0);
				osc4.stop(0);

				if (phase === 0) {
					envelope.triggerAttack();
					osc1.freq(261.63);
					osc2.freq(329.63);
					osc3.freq(392);
					osc4.freq(493.88);
				} else if (phase === 1) {
					envelope.triggerAttack();
					osc1.freq(293.66);
					osc2.freq(369.99);
					osc3.freq(440);
					osc4.freq(523.25);
				} else {
					envelope.triggerAttack();
					osc1.freq(220);
					osc2.freq(261.63);
					osc3.freq(329.63);
					osc4.freq(392);
				}

				if (!isPlaying) {
					return;
				}

				osc1.start();
				osc2.start();
				osc3.start();
				osc4.start();
				envelope.triggerAttack();
			}

			function updateSound(phase: number) {
				if (phase === currentPhase) {
					return;
				}

				if (currentPhase !== -1) {
					envelope.triggerRelease();
					setTimeout(() => {
						setupNewPhase(phase);
					}, 100);
				} else {
					setupNewPhase(phase);
				}

				currentPhase = phase;
			}

			p.draw = () => {
				const currentTime = p.millis();

				if (isPlaying) {
					const deltaTime = (currentTime - lastUpdateTime) / 1000;
					elapsedTime += deltaTime;
				}
				lastUpdateTime = currentTime;

				if (elapsedTime >= totalDuration) {
					isComplete = true;
					isPlaying = false;

					p.background(bgColor);
					p.fill(textColor);
					p.textSize(24);
					p.textAlign(p.CENTER, p.CENTER);
					p.text('Breathing exercise complete', width / 2, height / 2);

					if (currentPhase !== -2) {
						osc1.stop(0);
						osc2.stop(0);
						osc3.stop(0);
						osc4.stop(0);
						envelope.triggerRelease();
						currentPhase = -2;
					}
					return;
				}

				const cycleTime = elapsedTime % cycleDuration;

				if (cycleTime < 5) {
					const progress = cycleTime / 5;
					ballY = p.lerp(height * 0.7, height * 0.3, progress);
					if (isPlaying) updateSound(0);
				} else if (cycleTime < 10) {
					ballY = height * 0.3;
					if (isPlaying) updateSound(1);
				} else {
					const progress = (cycleTime - 10) / 5;
					ballY = p.lerp(height * 0.3, height * 0.7, progress);
					if (isPlaying) updateSound(2);
				}

				p.background(bgColor);
				p.fill(textColor);
				p.textSize(18);
				p.textAlign(p.CENTER, p.TOP);

				if (!isPlaying) {
					p.text(audioContextStarted ? 'Paused' : 'Press Play to begin', width / 2, 30);
				} else if (cycleTime < 5) {
					p.text('Breathe in...', width / 2, 30);
				} else if (cycleTime < 10) {
					p.text('Hold...', width / 2, 30);
				} else {
					p.text('Breathe out...', width / 2, 30);
				}

				const remainingTime = Math.max(0, totalDuration - elapsedTime);
				const minutes = Math.floor(remainingTime / 60);
				const seconds = Math.floor(remainingTime % 60);
				p.textSize(16);
				p.text(
					`${minutes}:${seconds.toString().padStart(2, '0')} remaining`,
					width / 2,
					height - 40
				);

				p.noStroke();
				p.fill(ballColor);
				p.circle(width / 2, ballY, 60);

				p.stroke(200);
				p.strokeWeight(1);
				p.line(width / 2, height * 0.2, width / 2, height * 0.8);
			};
		}, target);
	});
</script>

<div class="flex flex-col items-center justify-center">
	<div class="m-0" use:ref></div>

	<div class="mt-4 flex gap-4">
		<button
			class="rounded-sm bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
			disabled={isComplete}
			onclick={togglePlayPause}
		>
			{isPlaying ? 'Pause' : 'Play'}
		</button>

		<button
			class="rounded-sm bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
			onclick={stopAndReset}
		>
			Reset
		</button>
	</div>
</div>
