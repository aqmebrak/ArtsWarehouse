import { derived, type Readable } from 'svelte/store';
import { language, type Language } from '$lib/store/i18n';
import { translations } from './translations';

// Helper function to get nested object properties
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
	return path.split('.').reduce((current, key) => {
		if (current && typeof current === 'object' && key in current) {
			return (current as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj as unknown) as string | undefined;
}

// Create derived store that provides current translations
export const t: Readable<(key: string) => string> = derived(language, ($language: Language) => {
	return (key: string) => {
		const translation = getNestedValue(translations[$language], key);
		if (translation === undefined) {
			console.warn(`Translation missing for key: ${key} in language: ${$language}`);
			return key; // Return the key as fallback
		}
		return translation;
	};
});

// Helper function for direct access to translations
export function translate(key: string, lang: Language): string {
	const translation = getNestedValue(translations[lang], key);
	if (translation === undefined) {
		console.warn(`Translation missing for key: ${key} in language: ${lang}`);
		return key; // Return the key as fallback
	}
	return translation;
}
