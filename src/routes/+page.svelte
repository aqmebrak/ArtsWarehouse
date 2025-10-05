<script lang="ts">
	import ButtonSocial from '$lib/components/ButtonSocial.svelte';
</script>

<div class="text-primary mt-12 flex flex-col items-center">
	<div class="px-12 text-center">Here you can find all my creations, from music to paintings</div>

	<div
		class="button-spacer mt-4 flex min-w-[375px] flex-wrap items-center justify-center gap-6 md:flex-row md:px-12"
	>
		<div>
			<h2 class="mb-3 text-xl font-semibold">My Solo Project:</h2>
			<iframe
				title="Gneiss by Telluric Hymn"
				style="border: 0; width: 400px; height: 340px;"
				src="https://bandcamp.com/EmbeddedPlayer/album=4151960143/size=large/bgcol=ffffff/linkcol=7137dc/artwork=small/transparent=true/"
				seamless
				><a href="https://tellurichymn.bandcamp.com/album/gneiss">Gneiss by Telluric Hymn</a
				></iframe
			>
		</div>

		<div>
			<h2 class="mb-3 text-xl font-semibold">My Black Metal band:</h2>
			<iframe
				title="Of Worlds Long Gone by Stories Bones Tell"
				style="border: 0; width: 400px; height: 340px;"
				src="https://bandcamp.com/EmbeddedPlayer/album=534038465/size=large/bgcol=333333/linkcol=e99708/artwork=small/transparent=true/"
				seamless
				><a href="https://storiesbonestell.bandcamp.com/album/of-worlds-long-gone"
					>Of Worlds Long Gone by Stories Bones Tell</a
				></iframe
			>
		</div>
	</div>
</div>
