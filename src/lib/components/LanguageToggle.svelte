<script lang="ts">
	import { language } from '$lib/store/i18n';
	import { t } from '$lib/i18n';
</script>

<button
	class="flex cursor-pointer items-center space-x-2 rounded-md bg-white p-1 px-2 text-xs !text-black backdrop-blur-sm transition-colors hover:bg-white/20"
	onclick={() => language.toggle()}
	aria-label="Toggle language"
>
	<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
		/>
	</svg>
	<span class="!text-black"
		>{$language === 'en' ? $t('language.french') : $t('language.english')}</span
	>
</button>
