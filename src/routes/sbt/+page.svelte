<script>
	import { fade } from 'svelte/transition';

	const importantLinks = [
		{
			title: 'Latest Music Video',
			url: 'https://www.youtube.com/watch?v=KNtUaieVW6Y&t=2358s'
		},
		{
			title: 'Streaming on Spotify',
			url: 'https://open.spotify.com/album/67vg4bP7EeIoDFhL18jLZ9?si=nt9QFotwTkWF1JnPPL8xRg'
		},
		{
			title: 'Bandcamp',
			url: 'https://storiesbonestell.bandcamp.com/album/of-worlds-long-gone'
		},
		{
			title: 'Original Demo',
			url: 'https://storiesbonestell.bandcamp.com/album/stories-bones-tell-demo-mmxxii'
		}
	];

	const bandPhotos = [
		{
			src: 'sbt/band-cave1.png',
			alt: 'Stories Bones Tell - Cave Session 1',
			title: 'Cave Session 1'
		},
		{
			src: 'sbt/band-cave4.png',
			alt: 'Stories Bones Tell - Cave Session 2',
			title: 'Cave Session 2'
		},
		{
			src: 'sbt/band-forest1.png',
			alt: 'Stories Bones Tell - Forest Session 1',
			title: 'Forest Session 1'
		},
		{
			src: 'sbt/band-forest2.png',
			alt: 'Stories Bones Tell - Forest Session 2',
			title: 'Forest Session 2'
		},
		{
			src: 'sbt/band-forest3.png',
			alt: 'Stories Bones Tell - Forest Session 3',
			title: 'Forest Session 3'
		}
	];

	let selectedPhoto = $state(null);
	let currentPhotoIndex = $state(0);

	function openPhotoModal(photo, index) {
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

	function handleKeydown(event) {
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
				Stories Bones Tell
			</h1>
			<p class="text-xl font-light tracking-wide text-gray-200">Electronic Press Kit</p>
		</header>

		<hr class="border-gray-600" />

		<!-- Band Photos Section -->
		<section class="space-y-6">
			<h2 class="text-center text-3xl font-medium text-white">Band Photos</h2>
			<p class="text-center text-sm text-gray-300">Click on any photo to view it larger</p>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each bandPhotos as photo, index}
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
							{photo.title}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Bio Section -->
		<section class="space-y-6">
			<h2 class="text-center text-3xl font-medium text-white">About the Band</h2>
			<div
				class="prose prose-lg prose-invert mx-auto flex max-w-4xl flex-col gap-4 text-center"
			>
				<p class="text-lg leading-relaxed text-gray-200">
					Formé en 2019 à Lyon, STORIES BONES TELL est un quintet de black metal
					atmosphérique.
				</p>
				<p class="text-lg leading-relaxed text-gray-200">
					Ses membres livrent leur propre vision du metal noir: furieux, mélancolique et
					contemporain. Ils en dévoilent les contours dans une première démo en 2022.
				</p>
				<p class="text-lg leading-relaxed text-gray-200">
					En 2023, STORIES BONES TELL délivre son premier album "Of Worlds Long Gone", et
					persévère dans sa veine d'une musique dense et hypnotique, entre assauts rageurs
					saturés de blastbeats et abîmes de tristesse qui ne craignent pas la mélodie.
					Les six titres du disque s'abordent comme autant de chapitres d'une légende
					hallucinée, faite de batailles cauchemardesques, de deuils indicibles et du
					lourd poids des âges passés, dont seuls les os peuvent témoigner.
				</p>
				<p class="text-lg leading-relaxed text-gray-200">
					En concert, STORIES BONES TELL a partagé la scène avec Nature Morte, Altair,
					Tenace, etc.
				</p>
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Musical Style & Influences Section -->
		<section class="space-y-6">
			<h2 class="text-center text-3xl font-medium text-white">Musical Style & Influences</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="space-y-4">
					<h3 class="text-xl font-semibold text-white">Genre</h3>
					<ul class="space-y-2 text-gray-200">
						<li>• Atmospheric Black Metal</li>
						<li>• Post-Black Metal</li>
					</ul>
				</div>
				<div class="space-y-4">
					<h3 class="text-xl font-semibold text-white">For Fans Of</h3>
					<ul class="space-y-2 text-gray-200">
						<li>• Altar of Plagues</li>
						<li>• Wolves in the Throne Room</li>
						<li>• Der Weg Einer Freiheit</li>
						<li>• Fluisteraars</li>
						<li>• Mgła</li>
					</ul>
				</div>
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Important Links Section -->
		<section class="space-y-6 text-center">
			<h2 class="text-3xl font-medium text-white">Press Links</h2>

			<div class="space-y-3">
				{#each importantLinks as link}
					{#if link.url && !link.url.includes('[Link')}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="block rounded-lg bg-gray-800/50 px-6 py-3 text-white transition-colors hover:bg-gray-700/70 hover:text-blue-300"
						>
							{link.title}
						</a>
					{:else}
						<div class="rounded-lg bg-gray-800/30 px-6 py-3 text-gray-400">
							{link.title}: (Coming Soon)
						</div>
					{/if}
				{/each}
			</div>
		</section>

		<hr class="border-gray-600" />

		<!-- Contact Information Section -->
		<section class="space-y-6 text-center">
			<h2 class="text-3xl font-medium text-white">Contact Information</h2>
			<div class="mx-auto max-w-md space-y-4">
				<div class="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
					<h3 class="mb-2 text-lg font-semibold text-white">Booking & Press</h3>
					<p class="text-gray-200">storiesbonestell.band@gmail.com</p>
				</div>
				<div class="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
					<h3 class="mb-2 text-lg font-semibold text-white">Social Media</h3>
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
				aria-label="Close photo"
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
					aria-label="Previous photo"
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
					aria-label="Next photo"
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
				<h3 class="text-lg font-medium">{selectedPhoto.title}</h3>
				<p class="mt-1 text-sm text-gray-300">
					{currentPhotoIndex + 1} of {bandPhotos.length}
				</p>
				<p class="mt-2 text-xs text-gray-400">
					Use arrow keys to navigate • Press Escape to close
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

	body,
	div,
	p,
	span {
		color: white;
	}
</style>
