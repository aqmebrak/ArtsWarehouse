<script lang="ts">
	import { t } from '$lib/i18n';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';

	const importantLinks = [
		{
			title: 'telluricHymn.importantLinks.privateAlbumStream',
			url: 'https://youtu.be/U5UWTVfgEps'
		},
		{
			title: 'telluricHymn.importantLinks.firstSingleVisualizer',
			url: 'https://youtu.be/1xo13MWmqxU'
		},
		// {
		// 	title: 'Second Visualizer',
		// 	url: '[Link to the YouTube video for the second visualizer]'
		// },
		{
			title: 'telluricHymn.importantLinks.bandcampPreorder',
			url: '[Your Bandcamp Album Link]'
		},
		{
			title: 'telluricHymn.importantLinks.spotifyMusic',
			url: '[Link to your Spotify Artist Profile]'
		}
	];

	// Password protection for important links
	let isLinksUnlocked = false;
	let passwordInput = '';
	let passwordError = false;
	let isLoading = false;

	async function checkPassword() {
		if (!passwordInput.trim()) {
			passwordError = true;
			return;
		}

		isLoading = true;
		passwordError = false;

		try {
			const response = await fetch('/tellurichymn/api/verify-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password: passwordInput })
			});

			const result = await response.json();

			if (result.success) {
				isLinksUnlocked = true;
				passwordError = false;
			} else {
				passwordError = true;
				passwordInput = '';
			}
		} catch (error) {
			passwordError = true;
			console.error('Error verifying password:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !isLoading) {
			checkPassword();
		}
	}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
<link
	href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Tektur:wght@400..900&display=swap"
	rel="stylesheet"
/>

<div id="main" class="min-h-screen px-4 py-12 text-white sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl space-y-12 px-4 py-8 backdrop-blur-md">
		<!-- Header Section -->
		<header class="space-y-4 text-center text-white">
			<h1
				class="text-4xl font-light tracking-[-8px] text-white uppercase sm:text-5xl md:text-6xl"
			>
				{$t('telluricHymn.title')}
			</h1>
		</header>

		<hr class="border-gray-700" />

		<!-- Main Info Section -->
		<section class="space-y-4 text-center text-2xl">
			<div class="text-center text-3xl font-semibold tracking-[1rem] text-white uppercase">
				{$t('telluricHymn.albumTitle')}
			</div>
			<div class="pt-4 font-semibold tracking-[12px] text-white">
				{$t('telluricHymn.releaseDate')}
			</div>
		</section>

		<hr class="border-gray-700" />

		<!-- Project Description & Bio Section -->
		<section class="max-w-none space-y-4 text-center text-white">
			<h3 class="text-3xl">{$t('telluricHymn.projectDescription')}</h3>
			<p class="text-white">
				{$t('telluricHymn.projectDescriptionText1')}
			</p>
			<p class="text-white">
				{$t('telluricHymn.projectDescriptionText2')}
			</p>
			<p class="text-white">
				{$t('telluricHymn.projectDescriptionText3')}
			</p>
			<p class="mt-6 text-white">
				{$t('telluricHymn.forFansOf')}
			</p>
		</section>

		<hr class="border-gray-700" />

		<!-- Key Points Section -->
		<section class="max-w-none space-y-4">
			<h3 class="text-center text-3xl text-white">{$t('telluricHymn.keyPoints')}</h3>
			<ul class="ml-8 list-[georgian] space-y-2 text-white">
				<li>{$t('telluricHymn.keyPoint1')}</li>
				<li>
					{$t('telluricHymn.keyPoint2')}
				</li>
				<li>
					{$t('telluricHymn.keyPoint3')}
				</li>
				<li>
					{$t('telluricHymn.keyPoint4')}
				</li>
			</ul>
		</section>

		<hr class="border-gray-700" />

		<!-- Important Links Section -->
		<section class="max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">{$t('telluricHymn.links')}</h3>

			{#if !isLinksUnlocked}
				<div class="space-y-4">
					<p class="text-white">
						{$t('telluricHymn.linksPrivateMessage')}
					</p>
					<div class="flex flex-col items-center space-y-2">
						<input
							type="password"
							bind:value={passwordInput}
							onkeypress={handleKeyPress}
							placeholder={$t('telluricHymn.passwordPlaceholder')}
							disabled={isLoading}
							class="rounded-sm border bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-300 focus:outline-hidden disabled:opacity-50"
						/>
						<button
							onclick={checkPassword}
							disabled={isLoading}
							class="cursor-pointer rounded-sm bg-gray-400 px-4 py-2 text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isLoading}
								{$t('telluricHymn.verifying')}
							{:else}
								{$t('telluricHymn.unlock')}
							{/if}
						</button>
						{#if passwordError}
							<p class="text-red-400">{$t('telluricHymn.incorrectPassword')}</p>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex flex-col items-center space-y-2 text-white">
					{#each importantLinks as link}
						{#if link.url && link.url.includes('[') === false}
							<a
								href={link.url}
								target="_blank"
								class="text-white underline transition-colors hover:text-blue-300"
							>
								{$t(link.title)}
							</a>
						{:else}
							<p class="text-white">
								{$t(link.title)}: {$t('telluricHymn.linkNotProvided')}
							</p>
						{/if}
					{/each}
				</div>
			{/if}
		</section>

		<hr class="border-gray-700" />

		<!-- Contact Information Section -->
		<section class="max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">{$t('telluricHymn.contactInformation')}</h3>
			<ul class="list-none space-y-1 text-white">
				<li class="text-white">{$t('telluricHymn.email')}</li>
				<li class="text-white">
					{$t('telluricHymn.instagram')}
					<a
						href="https://www.instagram.com/tellurichymn.band"
						target="_blank"
						class="text-white underline transition-colors hover:text-purple-300"
						>@tellurichymn.band</a
					>
				</li>
			</ul>
		</section>

		<hr class="border-gray-700" />

		<!-- About the Artist Section -->
		<section class="max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">{$t('telluricHymn.aboutArtist')}</h3>
			<p class="text-white">
				{$t('telluricHymn.aboutArtistText')}
			</p>
		</section>
	</div>
	<div class="fixed top-4 right-4 z-50">
		<LanguageToggle />
	</div>
</div>

<style>
	#main {
		font-family: 'Source Code Pro', monospace;
		color: white !important;
		background-image: url('$lib/images/telluric-hymn/epk-background.png');
		background-color: gray;
		background-size: cover;
		background-blend-mode: darken;
	}

	div,
	p {
		color: white;
	}
</style>
