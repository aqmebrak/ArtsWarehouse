<script lang="ts">
	import ProfileCard from './ProfileCard.svelte';
	import XPBar from './XPBar.svelte';
	import type { UserProgress } from '$lib/types/audio-training';

	interface PlayerBarProps {
		userProgress: UserProgress | null | undefined;
		showXPNotification?: boolean;
		xpEarned?: number;
		leveledUp?: boolean;
		newLevel?: number;
	}

	let {
		userProgress,
		showXPNotification = false,
		xpEarned = 0,
		leveledUp = false,
		newLevel = 1
	}: PlayerBarProps = $props();
</script>

<div class="mb-6 space-y-3">
	{#if userProgress}
		<ProfileCard progress={userProgress} compact={true} />
		<XPBar totalXP={userProgress.profile.totalXP} />
	{/if}

	<!-- XP Notification Toast -->
	{#if showXPNotification}
		<div
			class="animate-slide-in fixed top-4 right-4 z-50 rounded-lg border border-purple-500/50 bg-gradient-to-br from-purple-900/90 to-purple-800/90 p-4 shadow-xl backdrop-blur-sm"
		>
			<div class="flex items-center gap-3">
				<div class="text-2xl">✨</div>
				<div>
					<p class="font-semibold text-purple-100">+{xpEarned} XP Earned!</p>
					{#if leveledUp}
						<p class="text-sm text-purple-200">🎉 Level Up! Now Level {newLevel}</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}
</style>
