<script lang="ts">
	import { onMount } from 'svelte';
	import type p5 from 'p5';

	let project: p5 | undefined = undefined;
	export let target: HTMLElement | undefined = undefined;
	let isPlaying = false; // Changed to false - animation starts paused
	let isComplete = false; // Track if exercise is complete
	let audioContextStarted = false; // Track if audio context has been started
	// Sound variables
	let osc1: p5.Oscillator;
	let osc2: p5.Oscillator;
	let osc3: p5.Oscillator;
	let osc4: p5.Oscillator;
	let envelope: p5.Envelope; // Fixed typo in variable name
	let currentPhase = -1; // Track the current breathing phase
	let startTime: number;
	let elapsedTime = 0;
	// Animation variables
	let ballY = -1; // Track ball position
	let lastUpdateTime = 0; // Track last time the draw function updated

	/**
	 * Creates a reference for the p5 instance to render within
	 * @param {HTMLElement} node
	 */
	function ref(node: HTMLElement) {
		target = node;
		return {
			destroy() {
				target = undefined;
			}
		};
	}

	// Function to toggle play/pause state
	function togglePlayPause() {
		if (isComplete) return; // Don't allow playing when complete
		isPlaying = !isPlaying;
		if (project) {
			// Handle sound based on playback state
			if (!isPlaying) {
				osc1.stop(0);
				osc2.stop(0);
				osc3.stop(0);
				osc4.stop(0);
				envelope.triggerRelease(); // Release the envelope
			} else {
				// Start or resume audio context on first play
				if (project.getAudioContext().state !== 'suspended') {
					project
						.getAudioContext()
						.resume()
						.then(() => {
							audioContextStarted = true;
						});
				}

				if (currentPhase >= 0) {
					osc1.start();
					osc2.start();
					osc3.start();
					osc4.start();
					envelope.triggerAttack(); // Trigger the envelope
				}
			}
		}
	}

	// Function to stop and reset animation
	function stopAndReset() {
		isPlaying = false;
		isComplete = false;
		if (project) {
			// Stop all sounds
			osc1.stop(0);
			osc2.stop(0);
			osc3.stop(0);
			osc4.stop(0);
			envelope.triggerRelease(); // Release the envelope
			// Reset time tracking
			startTime = project.millis();
			elapsedTime = 0;
			currentPhase = -1;
			ballY = project.height / 2;
		}
	}

	onMount(async () => {
		const library = await import('p5');
		const { default: p5 } = library;
		// eslint-ignore-next-line
		window.p5 = p5;
		await import('p5/lib/addons/p5.sound');

		project = new p5((p: p5) => {
			// Canvas dimensions
			const width = 500;
			const height = 500;
			ballY = height / 2;

			const totalDuration = 5 * 60; // 5 minutes in seconds
			const cycleDuration = 15; // 5s up + 5s hold + 5s down

			// Colors
			const bgColor = p.color(240, 240, 255);
			const ballColor = p.color(60, 120, 255);
			const textColor = p.color(40, 40, 40);

			p.setup = () => {
				p.createCanvas(width, height);
				startTime = p.millis();
				lastUpdateTime = startTime;

				// Initialize envelope with parameters suitable for breathing
				envelope = new p5.Envelope();
				envelope.setADSR(1, 0.2, 0.5, 0.2); // Attack, Decay, Sustain, Release
				envelope.setRange(1, 0); // Max amplitude, min amplitude

				// Initialize oscillators for our 7th chord
				osc1 = new p5.Oscillator(-1, 'sine');
				osc2 = new p5.Oscillator(-1, 'sine');
				osc3 = new p5.Oscillator(-1, 'sine');
				osc4 = new p5.Oscillator(-1, 'sine');

				// Connect envelope to oscillator amplitudes
				envelope.setInput(osc1);
				envelope.setInput(osc2);
				envelope.setInput(osc3);
				envelope.setInput(osc4);

				// Set individual oscillator volumes for balance
				osc1.amp(0.2);
				osc2.amp(0.15);
				osc3.amp(0.15);
				osc4.amp(0.1);
			};

			// Function to change the chord based on breathing phase
			function updateSound(phase: number) {
				if (phase === currentPhase) return; // No change needed

				// If we're changing phases, release envelope first
				if (currentPhase !== -1) {
					envelope.triggerRelease();

					// Brief delay before starting new phase
					setTimeout(() => {
						setupNewPhase(phase);
					}, 100);
				} else {
					// First time starting, no delay needed
					setupNewPhase(phase);
				}

				currentPhase = phase;
			}

			function setupNewPhase(phase: number) {
				// Stop previous sounds
				osc1.stop(0);
				osc2.stop(0);
				osc3.stop(0);
				osc4.stop(0);

				// Set frequencies based on phase
				if (phase === 0) {
					// Inhale - major 7th
					envelope.triggerAttack(); // Trigger the envelope for smooth fade-in
					osc1.freq(261.63); // C4
					osc2.freq(329.63); // E4
					osc3.freq(392.0); // G4
					osc4.freq(493.88); // B4
				} else if (phase === 1) {
					// Hold - dominant 7th
					envelope.triggerAttack(); // Trigger the envelope for smooth fade-in
					osc1.freq(293.66); // D4
					osc2.freq(369.99); // F#4
					osc3.freq(440.0); // A4
					osc4.freq(523.25); // C5
				} else {
					// Exhale - minor 7th
					envelope.triggerAttack(); // Trigger the envelope for smooth fade-in
					osc1.freq(220.0); // A3
					osc2.freq(261.63); // C4
					osc3.freq(329.63); // E4
					osc4.freq(392.0); // G4
				}

				// Start sounds with envelope
				if (isPlaying) {
					osc1.start();
					osc2.start();
					osc3.start();
					osc4.start();
					envelope.triggerAttack(); // Trigger the envelope for smooth fade-in
				}
			}

			p.draw = () => {
				const currentTime = p.millis();

				// Only update time when playing
				if (isPlaying) {
					const deltaTime = (currentTime - lastUpdateTime) / 1000;
					elapsedTime += deltaTime;
				}
				lastUpdateTime = currentTime;

				if (elapsedTime >= totalDuration) {
					// Animation complete after 5 minutes
					isComplete = true;
					isPlaying = false;

					p.background(bgColor);
					p.fill(textColor);
					p.textSize(24);
					p.textAlign(p.CENTER, p.CENTER);
					p.text('Breathing exercise complete', width / 2, height / 2);

					// Stop all sounds at the end
					if (currentPhase !== -2) {
						osc1.stop(0);
						osc2.stop(0);
						osc3.stop(0);
						osc4.stop(0);
						envelope.triggerRelease();
						currentPhase = -2; // Mark as ended
					}
					return;
				}

				// Calculate current cycle progress
				const cycleTime = elapsedTime % cycleDuration;

				// Update ball position based on breathing phase
				if (cycleTime < 5) {
					// Inhale: move up for 5 seconds
					const progress = cycleTime / 5;
					ballY = p.lerp(height * 0.7, height * 0.3, progress);
					if (isPlaying) updateSound(0); // Inhale sound
				} else if (cycleTime < 10) {
					// Hold: stay at the top for 5 seconds
					ballY = height * 0.3;
					if (isPlaying) updateSound(1); // Hold sound
				} else {
					// Exhale: move down for 5 seconds
					const progress = (cycleTime - 10) / 5;
					ballY = p.lerp(height * 0.3, height * 0.7, progress);
					if (isPlaying) updateSound(2); // Exhale sound
				}

				// Draw scene
				p.background(bgColor);

				// Draw breathing guide text
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

				// Draw time remaining
				const remainingTime = Math.max(0, totalDuration - elapsedTime);
				const minutes = Math.floor(remainingTime / 60);
				const seconds = Math.floor(remainingTime % 60);
				p.textSize(16);
				p.text(
					`${minutes}:${seconds.toString().padStart(2, '0')} remaining`,
					width / 2,
					height - 40
				);

				// Draw the ball
				p.noStroke();
				p.fill(ballColor);
				p.circle(width / 2, ballY, 60);

				// Draw vertical guide line
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
