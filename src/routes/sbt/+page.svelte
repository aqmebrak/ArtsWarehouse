<script lang="ts">
	import { fade } from 'svelte/transition';
	import { t } from '$lib/i18n';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';

	const importantLinks = [
		{
			title: 'sbt.importantLinks.latestMusicVideo',
			url: 'https://www.youtube.com/watch?v=KNtUaieVW6Y&t=2358s'
		},
		{
			title: 'sbt.importantLinks.streamingSpotify',
			url: 'https://open.spotify.com/album/67vg4bP7EeIoDFhL18jLZ9?si=nt9QFotwTkWF1JnPPL8xRg'
		},
		{
			title: 'sbt.importantLinks.bandcamp',
			url: 'https://storiesbonestell.bandcamp.com/album/of-worlds-long-gone'
		},
		{
			title: 'sbt.importantLinks.originalDemo',
			url: 'https://storiesbonestell.bandcamp.com/album/stories-bones-tell-demo-mmxxii'
		}
	];

	const bandPhotos = [
		{
			src: 'sbt/band-cave1.png',
			alt: 'Stories Bones Tell - Cave Session 1',
			title: 'sbt.bandPhotoTitles.caveSession1'
		},
		{
			src: 'sbt/band-cave4.png',
			alt: 'Stories Bones Tell - Cave Session 2',
			title: 'sbt.bandPhotoTitles.caveSession2'
		},
		{
			src: 'sbt/band-forest1.png',
			alt: 'Stories Bones Tell - Forest Session 1',
			title: 'sbt.bandPhotoTitles.forestSession1'
		},
		{
			src: 'sbt/band-forest2.png',
			alt: 'Stories Bones Tell - Forest Session 2',
			title: 'sbt.bandPhotoTitles.forestSession2'
		},
		{
			src: 'sbt/band-forest3.png',
			alt: 'Stories Bones Tell - Forest Session 3',
			title: 'sbt.bandPhotoTitles.forestSession3'
		}
	];

	type Photo = {
		src: string;
		alt: string;
		title: string;
	};

	let selectedPhoto: Photo | null = $state(null);
	let currentPhotoIndex = $state(0);

	function openPhotoModal(photo: Photo, index: number) {
		selectedPhoto = photo;
		currentPhotoIndex = index;
	}

	function closePhotoModal() {
		selectedPhoto = null;
	}

	function nextPhoto() {
		if (currentPhotoIndex < bandPhotos.length - 1) {
			currentPhotoIndex += 1;
			selectedPhoto = bandPhotos[currentPhotoIndex];
		}
	}

	function prevPhoto() {
		if (currentPhotoIndex > 0) {
			currentPhotoIndex -= 1;
			selectedPhoto = bandPhotos[currentPhotoIndex];
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!selectedPhoto) return;

		if (event.key === 'Escape') {
			closePhotoModal();
		} else if (event.key === 'ArrowLeft') {
			prevPhoto();
		} else if (event.key === 'ArrowRight') {
			nextPhoto();
		}
	}
</script>

<svelte:head>
	<title>Stories Bones Tell - Electronic Press Kit</title>
	<meta name="description" content="Electronic Press Kit for Stories Bones Tell" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div id="main" class="min-h-screen px-4 py-12 text-white sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-12 px-4 py-8">
		<!-- Header Section with Logo -->
		<header class="space-y-8 text-center">
			<div class="flex justify-center">
				<img
					src="sbt/logo.png"
					alt="Stories Bones Tell Logo"
					class="h-128 w-auto object-contain brightness-110 filter"
				/>
			</div>
			<h1
				class="text-4xl font-light tracking-wider text-white sm:text-5xl md:text-6xl"
				style="font-family: 'Crimson Pro', serif;"
			>
				{$t('sbt.title')}
			</h1>
			<p class="text-xl font-light tracking-wide text-gray-200">{$t('sbt.subtitle')}</p>
		</header>

		<hr class="border-gray-600" />

		<!-- Band Photos Section -->
		<section class="space-y-6">
			<h2 class="text-center text-3xl font-medium text-white">{$t('sbt.bandPhotos')}</h2>
			<p class="text-center text-sm text-gray-300">{$t('sbt.bandPhotosSubtitle')}</p>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each bandPhotos as photo, index (photo.src)}
					<div
						class="group cursor-pointer overflow-hidden"
						onclick={() => openPhotoModal(photo, index)}
						onkeydown={(e) => e.key === 'Enter' && openPhotoModal(photo, index)}
						tabindex="0"
						role="button"
					>
						<img
							src={photo.src}
							alt={photo.alt}
							class="h-64 w-full object-contain transition-all duration-300 group-hover:brightness-110 hover:scale-105"
						/>
						<div
							class="mt-2 text-center text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						>
							{$t(photo.title)}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Bio Section -->
		<section class="space-y-6">
			<h2 class="text-center text-3xl font-medium text-white">{$t('sbt.aboutBand')}</h2>
			<div
				class="prose prose-lg prose-invert mx-auto flex max-w-4xl flex-col gap-4 text-center"
			>
				<p class="text-lg leading-relaxed text-gray-200">
					{$t('sbt.aboutBandText1')}
				</p>
				<p class="text-lg leading-relaxed text-gray-200">
					{$t('sbt.aboutBandText2')}
				</p>
				<p class="text-lg leading-relaxed text-gray-200">
					{$t('sbt.aboutBandText3')}
				</p>
				<p class="text-lg leading-relaxed text-gray-200">
					{$t('sbt.aboutBandText4')}
				</p>
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Musical Style & Influences Section -->
		<section class="space-y-6">
			<h2 class="text-center text-3xl font-medium text-white">{$t('sbt.musicalStyle')}</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="space-y-4">
					<h3 class="text-xl font-semibold text-white">{$t('sbt.genre')}</h3>
					<ul class="space-y-2 text-gray-200">
						<li>{$t('sbt.genreItems.atmospheric')}</li>
						<li>{$t('sbt.genreItems.postBlack')}</li>
					</ul>
				</div>
				<div class="space-y-4">
					<h3 class="text-xl font-semibold text-white">{$t('sbt.forFansOf')}</h3>
					<ul class="space-y-2 text-gray-200">
						<li>{$t('sbt.forFansOfItems.altarOfPlagues')}</li>
						<li>{$t('sbt.forFansOfItems.wolvesInThrone')}</li>
						<li>{$t('sbt.forFansOfItems.derWeg')}</li>
						<li>{$t('sbt.forFansOfItems.fluisteraars')}</li>
						<li>{$t('sbt.forFansOfItems.mgla')}</li>
					</ul>
				</div>
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Important Links Section -->
		<section class="space-y-6 text-center">
			<h2 class="text-3xl font-medium text-white">{$t('sbt.pressLinks')}</h2>

			<div class="space-y-3">
				{#each importantLinks as link (link.url)}
					{#if link.url && !link.url.includes('[Link')}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="block rounded-lg bg-gray-800/50 px-6 py-3 text-white transition-colors hover:bg-gray-700/70 hover:text-blue-300"
						>
							{$t(link.title)}
						</a>
					{:else}
						<div class="rounded-lg bg-gray-800/30 px-6 py-3 text-gray-400">
							{$t(link.title)}: {$t('sbt.comingSoon')}
						</div>
					{/if}
				{/each}
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Contact Information Section -->
		<section class="space-y-6 text-center">
			<h2 class="text-3xl font-medium text-white">{$t('sbt.contactInformation')}</h2>
			<div class="mx-auto max-w-md space-y-4">
				<div class="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
					<h3 class="mb-2 text-lg font-semibold text-white">{$t('sbt.bookingPress')}</h3>
					<p class="text-gray-200">storiesbonestell.band@gmail.com</p>
				</div>
				<div class="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
					<h3 class="mb-2 text-lg font-semibold text-white">{$t('sbt.socialMedia')}</h3>
					<div class="space-y-1 text-gray-200">
						<p>
							Instagram: <a href="https://instagram.com/stories_bones_tell"
								>@stories_bones_tell</a
							>
						</p>
						<p>
							Facebook: <a href="https://facebook.com/StoriesBonesTell"
								>Stories Bones Tell</a
							>
						</p>
					</div>
				</div>
			</div>
		</section>

		<hr class="border-gray-600" />

		<div class="fixed top-4 right-4 z-50">
			<LanguageToggle />
		</div>
	</div>
</div>

<!-- Photo Modal -->
{#if selectedPhoto}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
		onclick={closePhotoModal}
		onkeydown={(e) => e.key === 'Enter' && closePhotoModal()}
		role="button"
		tabindex="0"
		transition:fade={{ duration: 300 }}
	>
		<div class="relative max-h-[90vh] max-w-[90vw] p-4">
			<!-- Close button -->
			<button
				class="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
				onclick={closePhotoModal}
				aria-label={$t('sbt.photoModal.closePhoto')}
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<!-- Previous button -->
			{#if currentPhotoIndex > 0}
				<button
					class="absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
					onclick={(e) => {
						e.stopPropagation();
						prevPhoto();
					}}
					aria-label={$t('sbt.photoModal.previousPhoto')}
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
			{/if}

			<!-- Next button -->
			{#if currentPhotoIndex < bandPhotos.length - 1}
				<button
					class="absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
					onclick={(e) => {
						e.stopPropagation();
						nextPhoto();
					}}
					aria-label={$t('sbt.photoModal.nextPhoto')}
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			{/if}

			<!-- Photo -->
			<div
				class="flex items-center justify-center"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.key === 'Enter' && e.stopPropagation()}
				role="button"
				tabindex="0"
			>
				<img
					src={selectedPhoto.src}
					alt={selectedPhoto.alt}
					class="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
				/>
			</div>

			<!-- Photo title and navigation info -->
			<div class="mt-4 text-center text-white">
				<h3 class="text-lg font-medium">{$t(selectedPhoto.title)}</h3>
				<p class="mt-1 text-sm text-gray-300">
					{currentPhotoIndex + 1}
					{$t('sbt.photoModal.of')}
					{bandPhotos.length}
				</p>
				<p class="mt-2 text-xs text-gray-400">
					{$t('sbt.photoModal.navigationHelp')}
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	#main {
		font-family: 'Inter', monospace;
		color: white !important;
		background-image: url('$lib/images/sbt/sbt-background.png');
	}
	div,
	p {
		color: white;
	}
</style>
