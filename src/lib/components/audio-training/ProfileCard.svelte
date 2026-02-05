<script lang="ts">
	import { getLevelTitle } from '$lib/utils/audio-training/xp-system';
	import type { UserProgress } from '$lib/types/audio-training';
	import XPBar from './XPBar.svelte';

	let {
		progress,
		compact = false,
		class: className = ''
	}: {
		progress: UserProgress;
		compact?: boolean;
		class?: string;
	} = $props();

	let title = $derived(getLevelTitle(progress.profile.level));
</script>

<div class={`profile-card ${compact ? 'compact' : ''} ${className}`}>
	<div class="profile-header">
		<div class="avatar">
			{progress.profile.level}
		</div>
		<div class="profile-info">
			<h3 class="profile-title">{title}</h3>
			<div class="profile-stats">
				<span class="stat">
					🎮 {progress.profile.totalGamesPlayed} games
				</span>
				<span class="stat">
					🔥 {progress.profile.dailyStreak} day streak
				</span>
			</div>
		</div>
	</div>

	{#if !compact}
		<div class="xp-section">
			<XPBar totalXP={progress.profile.totalXP} showDetails={true} />
		</div>

		<div class="stats-grid">
			<div class="stat-box">
				<div class="stat-label">Total Score</div>
				<div class="stat-value">{progress.profile.totalScore.toLocaleString()}</div>
			</div>
			<div class="stat-box">
				<div class="stat-label">Longest Streak</div>
				<div class="stat-value">{progress.profile.longestStreak} days</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-card {
		background: linear-gradient(135deg, rgb(30 27 75 / 0.5) 0%, rgb(15 23 42 / 0.5) 100%);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.profile-card.compact {
		padding: 1rem;
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.profile-card.compact .profile-header {
		margin-bottom: 0;
	}

	.avatar {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
	}

	.profile-card.compact .avatar {
		width: 3rem;
		height: 3rem;
		font-size: 1.125rem;
	}

	.profile-info {
		flex: 1;
	}

	.profile-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		margin: 0 0 0.5rem 0;
	}

	.profile-card.compact .profile-title {
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.profile-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: rgb(203 213 225);
	}

	.profile-card.compact .profile-stats {
		font-size: 0.75rem;
		gap: 0.75rem;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.xp-section {
		margin-bottom: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.stat-box {
		background: rgb(30 41 59 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		text-align: center;
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgb(203 213 225);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgb(216 180 254);
	}

	@media (prefers-color-scheme: dark) {
		/* Already using dark theme, no changes needed */
	}
</style>
