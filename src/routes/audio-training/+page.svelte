<script>
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$t('audioTraining.title')} - No1yz.art</title>
	<meta name="description" content={$t('audioTraining.subtitle')} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<header class="mb-12 text-center">
			<h1 class="mb-4 text-5xl font-bold">{$t('audioTraining.title')}</h1>
			<p class="text-xl">{$t('audioTraining.subtitle')}</p>
		</header>

		<!-- Exercise Selection -->
		<section class="mb-12">
			<h2 class="mb-8 text-center text-3xl font-semibold">
				{$t('audioTraining.exerciseSelection')}
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Panning Exercise Card -->
				<a
					href="/audio-training/panning"
					class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎧</div>
						<h3 class="mb-3 text-2xl font-bold">
							{$t('audioTraining.panning.title')}
						</h3>
						<p class="text-blue-100">{$t('audioTraining.panning.description')}</p>

						<div class="mt-4 inline-flex items-center text-sm font-semibold">
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
					<div class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-black/10"
					></div>
				</a>

				<!-- EQ Exercise Card -->
				<a
					href="/audio-training/eq"
					class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-600 to-teal-700 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎚️</div>
						<h3 class="mb-3 text-2xl font-bold">
							{$t('audioTraining.eq.title')}
						</h3>
						<p class="text-green-100">{$t('audioTraining.eq.description')}</p>

						<div class="mt-4 inline-flex items-center text-sm font-semibold">
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
					<div class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-black/10"
					></div>
				</a>

				<!-- EQ Mirror Exercise Card -->
				<a
					href="/audio-training/eq-mirror"
					class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 to-red-700 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎛️</div>
						<h3 class="mb-3 text-2xl font-bold">EQ Mirror</h3>
						<p class="text-orange-100">
							Match target EQ settings using a 4-band equalizer interface
						</p>

						<div class="mt-4 inline-flex items-center text-sm font-semibold">
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
					<div class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
					<div
						class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-black/10"
					></div>
				</a>

				<div
					class="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 p-6 opacity-50 shadow-lg"
				>
					<div class="relative z-10">
						<div class="mb-4 text-4xl">🎵</div>
						<h3 class="mb-3 text-2xl font-bold">Compression</h3>
						<p class="text-gray-200">Coming Soon - Detect compression settings</p>

						<div
							class="mt-4 inline-flex items-center text-sm font-semibold text-gray-300"
						>
							Coming Soon
						</div>
					</div>

					<div class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5"></div>
					<div class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-black/5"></div>
				</div>
			</div>
		</section>
	</div>
</div>
