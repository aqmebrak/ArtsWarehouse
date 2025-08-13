import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Language = 'en' | 'fr';

// Create writable store for current language
function createLanguageStore() {
	const defaultLang: Language = 'en';

	// Initialize from localStorage if available, otherwise use default
	const initialLang = browser
		? (localStorage.getItem('language') as Language) || defaultLang
		: defaultLang;

	const { subscribe, set } = writable<Language>(initialLang);

	return {
		subscribe,
		set: (lang: Language) => {
			if (browser) {
				localStorage.setItem('language', lang);
			}
			set(lang);
		},
		toggle: () => {
			if (browser) {
				const currentLang = localStorage.getItem('language') as Language;
				const newLang: Language = currentLang === 'en' ? 'fr' : 'en';
				localStorage.setItem('language', newLang);
				set(newLang);
			}
		}
	};
}

export const language = createLanguageStore();
