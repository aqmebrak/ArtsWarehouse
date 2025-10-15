import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/routes/sbt/**/*.{svelte,ts}', './src/lib/**/*.{svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				serif: ['Crimson Pro', 'Georgia', 'ui-serif']
			}
		}
	},
	plugins: []
};

export default config;
