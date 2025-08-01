<script>
	// --- EPK DATA: Fill in all the details below ---
	const bandName = 'Telluric Hymn';
	const albumName = "'Gneiss'";
	const releaseDate = '19/09/2025';
	const artistPhotoLink = '[Link to a high-res artist photo]';
	const albumArtworkLink = '[Link to a high-res image of the album artwork]';
	const descriptionBio =
		'This album is a monumental sonic journey, weaving together crushing riffs and expansive soundscapes. The music is a direct reflection of a deep fascination with the raw power and strength of nature, from its unyielding, crushing force to its moments of profound, unmovable calm.';
	const forFansOf = ['Russian Circles', 'The Ocean', 'Cult of Luna', 'Bell Witch'];
	const keySellingPoints = [
		'Genre: Instrumental Post-Metal, Post-Rock, Atmospheric Metal',
		'Unique Theme: A conceptual album inspired by geology, rocks, and minerals.',
		'Visuals: Accompanied by self-made visualizer videos, created using TouchDesigner software.',
		"First Single: The lead single, 'Plagioclase', provides a first glimpse into the album's sound."
	];
	const importantLinks = [
		{
			title: 'Private Album Stream',
			url: '[Private SoundCloud or YouTube Link for Curators/Press]'
		},
		{ title: 'First Single Visualizer', url: "[Link to the YouTube video for '[Song Title]']" },
		{
			title: 'Second Visualizer',
			url: '[Link to the YouTube video for the second visualizer]'
		},
		{ title: 'Bandcamp Pre-order', url: '[Your Bandcamp Album Link]' },
		{ title: 'Social Media', url: '[Your Instagram Profile Link] / [Your Facebook Page Link]' },
		{ title: 'Music on Spotify', url: '[Link to your Spotify Artist Profile]' },
		{ title: 'Live Performance/Demo', url: '[Optional: Link to a live video or demo]' }
	];
	const contactInfo = {
		name: '[Your Name]',
		email: '[Your Email Address]',
		phone: '[Your Phone Number - Optional]',
		website: '[Your Website Link - Optional]'
	};
	const aboutArtist =
		"[A short, 1-2 sentence blurb about yourself or the project that gives a bit of personal context. E.g., 'As a multi-instrumentalist based in [City], my music is a solo endeavor from writing and recording to production.']";
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
				class="text-4xl font-light uppercase tracking-[-8px] tracking-wide text-white sm:text-5xl md:text-6xl"
			>
				{bandName}
			</h1>
			<h2 class="text-2xl">For Immediate Release</h2>
		</header>

		<hr class="border-gray-700" />

		<!-- Main Info Section -->
		<section class="space-y-4 text-center">
			<div class="text-xl">
				<p class="text-white">Artist:</p>
				<p class="text-white">{bandName}</p>
			</div>
			<div class="text-xl">
				<p class="text-white">Album:</p>
				<p class="text-white">{albumName}</p>
			</div>
			<div class="text-xl">
				<p class="text-white">Release Date:</p>
				<p class="text-white">{releaseDate}</p>
			</div>
		</section>

		<hr class="border-gray-700" />

		<!-- High-Res Assets Section -->
		<section class="space-y-4">
			<h3 class="text-center text-3xl text-white">High-Resolution Assets</h3>
			<div
				class="flex flex-col items-center justify-center space-y-4 text-white sm:flex-row sm:space-x-8 sm:space-y-0"
			>
				<a
					href={artistPhotoLink}
					target="_blank"
					class="text-blue-400 underline transition-colors hover:text-blue-300"
				>
					Artist Photo
				</a>
				<a
					href={albumArtworkLink}
					target="_blank"
					class="text-blue-400 underline transition-colors hover:text-blue-300"
				>
					Album Artwork
				</a>
			</div>
		</section>

		<hr class="border-gray-700" />

		<!-- Project Description & Bio Section -->
		<section class="prose prose-invert max-w-none space-y-4 text-center text-white">
			<h3 class="text-3xl">Project Description & Bio</h3>
			<p class="text-white">
				{bandName} is the instrumental post-metal project of [Your Name/Location]. Following
				years of sonic exploration, the project culminates in the debut full-length album, {albumName}.
			</p>
			<p class="text-white">
				{descriptionBio}
			</p>
			<p class="text-white">
				This project is a testament to the power of texture and atmosphere, creating an
				immersive experience for listeners that is both heavy and hauntingly beautiful.
			</p>
			<p class="mt-6 text-white">
				For Fans Of: {forFansOf.join(', ')}
			</p>
		</section>

		<hr class="border-gray-700" />

		<!-- Key Selling Points Section -->
		<section class="prose prose-invert max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">Key Selling Points</h3>
			<ul class="list-none space-y-2 text-white">
				{#each keySellingPoints as point}
					<li>{point}</li>
				{/each}
			</ul>
		</section>

		<hr class="border-gray-700" />

		<!-- Important Links & Assets Section -->
		<section class="prose prose-invert max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">Important Links & Assets</h3>
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
		</section>

		<hr class="border-gray-700" />

		<!-- Contact Information Section -->
		<section class="prose prose-invert max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">Contact Information</h3>
			<ul class="list-none space-y-1 text-white">
				<li class="text-white">**Name:** {contactInfo.name}</li>
				<li class="text-white">**Email:** {contactInfo.email}</li>
				{#if contactInfo.phone && contactInfo.phone.includes('Optional') === false}
					<li class="text-white">**Phone:** {contactInfo.phone}</li>
				{/if}
				{#if contactInfo.website && contactInfo.website.includes('Optional') === false}
					<li class="text-white">**Website:** {contactInfo.website}</li>
				{/if}
			</ul>
		</section>

		<hr class="border-gray-700" />

		<!-- About the Artist Section -->
		<section class="prose prose-invert max-w-none space-y-4 text-center">
			<h3 class="text-3xl text-white">About the Artist</h3>
			<p class="text-white">
				{aboutArtist}
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
