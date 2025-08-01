<script>
	const importantLinks = [
		{
			title: 'Private Album Stream',
			url: 'https://youtu.be/U5UWTVfgEps'
		},
		{ title: 'First Single Visualizer', url: 'https://youtu.be/1xo13MWmqxU' },
		// {
		// 	title: 'Second Visualizer',
		// 	url: '[Link to the YouTube video for the second visualizer]'
		// },
		{ title: 'Bandcamp Pre-order', url: '[Your Bandcamp Album Link]' },
		{ title: 'Music on Spotify', url: '[Link to your Spotify Artist Profile]' }
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

	function handleKeyPress(event) {
		if (event.key === 'Enter' && !isLoading) {
			checkPassword();
		}
	}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Tektur:wght@400..900&display=swap"
	rel="stylesheet"
/>

<div id="main" class="min-h-screen px-4 py-12 text-white sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl space-y-12 px-4 py-8 backdrop-blur-md">
		<!-- Header Section -->
		<header class="space-y-4 text-center text-white">
			<h1
				class="text-4xl font-light uppercase tracking-[-8px] text-white sm:text-5xl md:text-6xl"
			>
				Telluric Hymn
			</h1>
		</header>

		<hr class="border-gray-700" />

		<!-- Main Info Section -->
		<section class="space-y-4 text-center text-2xl">
			<div
				class="text-center text-3xl font-light font-semibold uppercase tracking-[1rem] text-white"
			>
				Gneiss
			</div>
			<div class="pt-4 font-semibold tracking-[12px] text-white">19/09/2025</div>
		</section>

		<hr class="border-gray-700" />

		<!-- Project Description & Bio Section -->
		<section class="max-w-none space-y-4 text-center text-white">
			<h3 class="text-3xl">Project Description & Bio</h3>
			<p class="text-white">
				Telluric Hymn is a one man band instrumental post-metal project of No1yz. Following
				years of sonic exploration, the project culminates in the debut full-length album,
				Gneiss.
			</p>
			<p class="text-white">
				This album is a monumental sonic journey, weaving together crushing riffs and
				expansive soundscapes. The music is a direct reflection of a deep fascination with
				the raw power and strength of nature, from its unyielding, crushing force to its
				moments of profound, unmovable calm.
			</p>
			<p class="text-white">
				This project is a testament to the power of texture and atmosphere, creating an
				immersive experience for listeners that is both heavy and hauntingly beautiful.
			</p>
			<p class="mt-6 text-white">
				For Fans Of: 'Russian Circles', 'The Ocean', 'Cult of Luna', 'Bell Witch'
			</p>
		</section>

		<hr class="border-gray-700" />

		<!-- Key Points Section -->
		<section class="max-w-none space-y-4">
			<h3 class="text-center text-3xl text-white">Key Points</h3>
			<ul class="ml-8 list-[georgian] space-y-2 text-white">
				<li>Genre: Instrumental Post-Metal, Post-Rock, Atmospheric Metal</li>
				<li>
					Unique Theme: A conceptual album inspired by geology, rocks, forces of nature
					and its beauty.
				</li>
				<li>
					Visuals: Accompanied by self-made visualizer videos, created using TouchDesigner
					software.
				</li>
				<li>
					First Single: The lead single, 'Plagioclase', provides a first glimpse into the
					album's sound.
				</li>
			</ul>
		</section>

		<hr class="border-gray-700" />

		<!-- Important Links Section -->
		<section class="max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">Links</h3>

			{#if !isLinksUnlocked}
				<div class="space-y-4">
					<p class="text-white">
						This section contains private links for press and curators only.
					</p>
					<div class="flex flex-col items-center space-y-2">
						<input
							type="password"
							bind:value={passwordInput}
							on:keypress={handleKeyPress}
							placeholder="Enter password"
							disabled={isLoading}
							class="rounded border bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-300 focus:outline-none disabled:opacity-50"
						/>
						<button
							on:click={checkPassword}
							disabled={isLoading}
							class="rounded bg-gray-400 px-4 py-2 text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isLoading}
								Verifying...
							{:else}
								Unlock
							{/if}
						</button>
						{#if passwordError}
							<p class="text-red-400">Incorrect password. Please try again.</p>
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
								{link.title}
							</a>
						{:else}
							<p class="text-white">{link.title}: (Link Not Provided)</p>
						{/if}
					{/each}
				</div>
			{/if}
		</section>

		<hr class="border-gray-700" />

		<!-- Contact Information Section -->
		<section class="max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">Contact Information</h3>
			<ul class="list-none space-y-1 text-white">
				<li class="text-white">Email: tellurichymn.band@gmail.com</li>
				<li class="text-white">
					Instagram: <a
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
			<h3 class="text-3xl text-white">About the Artist</h3>
			<p class="text-white">
				No1yz is a French guy from Lyon, and has played guitar since he was 15. He was
				always drawn to the atmospheric and melancholic sounds, all genres boundaries aside.
				Very curious and passionate about creating art, he channels his creativity into
				various mediums, from music to painting and digital art. With his first self-made
				project, "Telluric Hymn", No1yz aims to share emotions through music.
			</p>
		</section>
	</div>
</div>

<style>
	#main {
		font-family: 'Source Code Pro', monospace;
		color: white !important;
		background-image: url('epk-background.png');
		background-color: gray;
		background-size: cover;
		background-blend-mode: darken;
	}
</style>
