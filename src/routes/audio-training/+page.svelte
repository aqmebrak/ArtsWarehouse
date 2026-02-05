<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { resolve } from '$app/paths';
	import ProfileCard from '$lib/components/audio-training/ProfileCard.svelte';
	import { StorageManager } from '$lib/utils/audio-training/storage-utils';
	import type { UserProgress } from '$lib/types/audio-training';

	let userProgress = $state<UserProgress | null>(null);

	onMount(() => {
		// Load user progress
		userProgress = StorageManager.getProgress();
	});
</script>

<svelte:head>
	<title>{$t('audioTraining.title')} - No1yz.art</title>
	<meta name="description" content={$t('audioTraining.subtitle')} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black px-4 py-12">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<header class="mb-12">
			<div class="mb-8 text-center">
				<h1 class="mb-4 text-5xl font-bold">{$t('audioTraining.title')}</h1>
				<p class="text-xl">{$t('audioTraining.subtitle')}</p>
			</div>

			<!-- Profile Card -->
			{#if userProgress}
				<div class="flex justify-center">
					<div class="w-full max-w-2xl">
						<ProfileCard progress={userProgress} compact={false} />
					</div>
				</div>
			{/if}
		</header>

		<!-- Exercise Selection -->
		<section class="mb-12">
			<h2 class="mb-8 text-center text-3xl font-semibold">
				{$t('audioTraining.exerciseSelection')}
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Panning Exercise Card -->
				<a
					href={resolve('/audio-training/panning')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎧</div>
						<h3 class="mb-3 text-2xl font-bold">
							{$t('audioTraining.panning.title')}
						</h3>
						<p class="text-slate-300">{$t('audioTraining.panning.description')}</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- EQ Exercise Card -->
				<a
					href={resolve('/audio-training/eq')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎚️</div>
						<h3 class="mb-3 text-2xl font-bold">
							{$t('audioTraining.eq.title')}
						</h3>
						<p class="text-slate-300">{$t('audioTraining.eq.description')}</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- EQ Mirror Exercise Card -->
				<a
					href={resolve('/audio-training/eq-mirror')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎛️</div>
						<h3 class="mb-3 text-2xl font-bold">EQ Mirror</h3>
						<p class="text-slate-300">
							Match target EQ settings using a 4-band equalizer interface
						</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- DB King Exercise Card -->
				<a
					href={resolve('/audio-training/db-king')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">📊</div>
						<h3 class="mb-3 text-2xl font-bold">DB King</h3>
						<p class="text-slate-300">Identify gain/level changes in dB</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/20"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/10"
					></div>
				</a>

				<!-- Kit Cut Exercise Card -->
				<a
					href={resolve('/audio-training/kit-cut')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎛️</div>
						<h3 class="mb-3 text-2xl font-bold">Kit Cut</h3>
						<p class="text-slate-300">
							Identify which frequency range has been removed
						</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- Stereohead Exercise Card -->
				<a
					href={resolve('/audio-training/stereohead')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎧</div>
						<h3 class="mb-3 text-2xl font-bold">Stereohead</h3>
						<p class="text-slate-300">Identify stereo width percentage</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- Filter Expert Exercise Card -->
				<a
					href={resolve('/audio-training/filter-expert')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎚️</div>
						<h3 class="mb-3 text-2xl font-bold">Filter Expert</h3>
						<p class="text-slate-300">Identify different types of audio filters</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- Dr. Compressor Exercise Card -->
				<a
					href={resolve('/audio-training/dr-compressor')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎚️</div>
						<h3 class="mb-3 text-2xl font-bold">Dr. Compressor</h3>
						<p class="text-slate-300">Identify which sound has more compression</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>

				<!-- Bass Detective Exercise Card -->
				<a
					href={resolve('/audio-training/bass-detective')}
					class="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🔊</div>
						<h3 class="mb-3 text-2xl font-bold">Bass Detective</h3>
						<p class="text-slate-300">Identify the boosted bass frequency</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-purple-400"
						>
							Start Exercise
							<svg
								class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Background decoration -->
					<div
						class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/10"
					></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5"
					></div>
				</a>
			</div>
		</section>

		<!-- Progress Summary -->
		{#if userProgress}
			<section class="mb-12">
				<h2 class="mb-6 text-center text-3xl font-semibold">Your Progress</h2>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<!-- Total Stats -->
					<div
						class="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm"
					>
						<div class="text-center">
							<div class="mb-2 text-4xl">📈</div>
							<h3 class="mb-2 text-xl font-bold">Total Games</h3>
							<p class="text-3xl font-bold text-purple-400">
								{userProgress.profile.totalGamesPlayed}
							</p>
						</div>
					</div>

					<!-- Daily Streak -->
					<div
						class="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-slate-900/50 p-6 backdrop-blur-sm"
					>
						<div class="text-center">
							<div class="mb-2 text-4xl">🔥</div>
							<h3 class="mb-2 text-xl font-bold">Current Streak</h3>
							<p class="text-3xl font-bold text-purple-300">
								{userProgress.profile.dailyStreak} days
							</p>
							<p class="mt-1 text-sm text-slate-400">
								Longest: {userProgress.profile.longestStreak} days
							</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Exercise Progress -->
			<section class="mb-12">
				<h2 class="mb-6 text-center text-3xl font-semibold">Exercise Stats</h2>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Object.entries(userProgress.exercises) as [exerciseId, stats]}
						{@const exerciseNames: Record<string, string> = {
	'panning': '🎧 Panning',
	'eq': '🎚️ EQ',
	'eq-mirror': '🎛️ EQ Mirror',
	'db-king': '📊 DB King',
	'kit-cut': '🎛️ Kit Cut',
	'stereohead': '🎧 Stereohead',
	'filter-expert': '🎚️ Filter Expert'
}}
						{@const exerciseName = exerciseNames[exerciseId] || exerciseId}

						<div
							class="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm"
						>
							<div class="mb-3 flex items-center justify-between">
								<h3 class="text-lg font-semibold">{exerciseName}</h3>
								<span
									class="rounded-full border border-purple-500/50 bg-purple-600/30 px-3 py-1 text-xs font-semibold"
								>
									{stats.skillLevel}
								</span>
							</div>

							<div class="grid grid-cols-3 gap-4 text-sm">
								<div>
									<p class="text-purple-300">Games</p>
									<p class="text-xl font-bold">{stats.gamesPlayed}</p>
								</div>
								<div>
									<p class="text-purple-300">High Score</p>
									<p class="text-xl font-bold">{stats.highScore}</p>
								</div>
								<div>
									<p class="text-purple-300">Avg Accuracy</p>
									<p class="text-xl font-bold">
										{stats.averageAccuracy.toFixed(0)}%
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Achievements Preview -->
			<section class="mb-12">
				<h2 class="mb-6 text-center text-3xl font-semibold">Achievements</h2>

				{#if true}
					{@const unlockedAchievements = userProgress.achievements.filter(
						(a) => a.unlockedAt
					)}
					{@const totalAchievements = 20}

					<div
						class="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-slate-900/50 p-8 text-center backdrop-blur-sm"
					>
						<div class="mb-4 text-6xl">🏆</div>
						<h3 class="mb-2 text-2xl font-bold">
							{unlockedAchievements.length} / {totalAchievements} Unlocked
						</h3>
						<p class="text-slate-300">
							{unlockedAchievements.length === 0
								? 'Play games to unlock achievements!'
								: unlockedAchievements.length < 5
									? 'Great start! Keep training to unlock more.'
									: unlockedAchievements.length < 10
										? "You're doing amazing! More achievements await."
										: unlockedAchievements.length < 15
											? "Impressive progress! You're a true audio master."
											: 'Outstanding! Nearly all achievements unlocked!'}
						</p>

						{#if unlockedAchievements.length > 0}
							<div class="mt-4 flex flex-wrap justify-center gap-2">
								{#each unlockedAchievements.slice(0, 10) as achievement}
									<div
										class="rounded-full border border-purple-500/50 bg-purple-600/30 px-3 py-1 text-xs font-semibold"
									>
										{achievement.id}
									</div>
								{/each}
								{#if unlockedAchievements.length > 10}
									<div
										class="rounded-full border border-purple-500/50 bg-purple-600/30 px-3 py-1 text-xs font-semibold"
									>
										+{unlockedAchievements.length - 10} more
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>
