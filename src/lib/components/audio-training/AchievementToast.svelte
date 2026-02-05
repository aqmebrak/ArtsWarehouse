<script lang="ts">
	import { onMount } from 'svelte';
	import { ACHIEVEMENTS } from '$lib/utils/audio-training/achievements';

	type Props = {
		achievementId: string;
		xpReward?: number;
		onClose?: () => void;
	};

	let { achievementId, xpReward = 100, onClose }: Props = $props();

	const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
	if (!achievement) {
		console.error(`Achievement not found: ${achievementId}`);
	}
	let visible = $state(false);
	let timeout: NodeJS.Timeout;

	onMount(() => {
		// Animate in after a brief delay
		setTimeout(() => {
			visible = true;
		}, 100);

		// Auto-close after 5 seconds
		timeout = setTimeout(() => {
			closeToast();
		}, 5000);

		return () => {
			clearTimeout(timeout);
		};
	});

	function closeToast() {
		visible = false;
		setTimeout(() => {
			onClose?.();
		}, 300); // Wait for animation to complete
	}
</script>

<div
	class="pointer-events-auto fixed top-4 right-4 z-50 w-full max-w-sm transform transition-all duration-300 ease-out"
	class:translate-x-0={visible}
	class:translate-x-full={!visible}
	class:opacity-100={visible}
	class:opacity-0={!visible}
>
	<div
		class="overflow-hidden rounded-xl border border-yellow-500/50 bg-gradient-to-br from-yellow-600/90 to-amber-700/90 shadow-2xl backdrop-blur-md"
	>
		<div class="p-4">
			<!-- Header -->
			<div class="mb-3 flex items-start justify-between">
				<div class="flex items-center gap-2">
					<div class="text-3xl">🏆</div>
					<div>
						<h3 class="text-lg font-bold text-yellow-50">Achievement Unlocked!</h3>
					</div>
				</div>
				<button
					onclick={closeToast}
					class="text-yellow-200 transition-colors hover:text-yellow-50"
					aria-label="Close"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<!-- Achievement Details -->
			{#if achievement}
				<div class="rounded-lg bg-black/20 p-3">
					<div class="mb-1 flex items-center gap-2">
						<span class="text-2xl">{achievement.icon}</span>
						<h4 class="font-bold text-yellow-50">{achievement.name}</h4>
					</div>
					<p class="text-sm text-yellow-100">{achievement.description}</p>

					<!-- XP Reward -->
					<div class="mt-2 flex items-center gap-1 text-xs font-semibold text-yellow-200">
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							></path>
						</svg>
						+{xpReward} XP
					</div>
				</div>
			{/if}
		</div>

		<!-- Progress Bar -->
		<div class="relative h-1 overflow-hidden bg-yellow-900/50">
			<div
				class="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-[5000ms] ease-linear"
				style:width={visible ? '0%' : '100%'}
			></div>
		</div>
	</div>
</div>
